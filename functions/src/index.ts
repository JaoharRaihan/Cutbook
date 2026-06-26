/**
 * CutBook Firebase Cloud Functions
 *
 * resetPassword — Callable function that updates a Firebase Auth user's
 * password using the Admin SDK, after the app has verified the user's
 * phone ownership via the Firestore OTP system.
 *
 * Security:
 *  - Requires a verified OTP doc in the `otps` collection for the given phone
 *    (created within the last 10 minutes and marked verified=true by the app's
 *     OTP verification flow).
 *  - After a successful reset the OTP doc is deleted so it can't be reused.
 *  - The plaintext password is never stored anywhere.
 */

import * as admin from 'firebase-admin';
import { onCall, HttpsError } from 'firebase-functions/v2/https';

admin.initializeApp();

const db = admin.firestore();
const authAdmin = admin.auth();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Convert a BD phone number to the Firebase email alias used by this app. */
const phoneToEmail = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  return `auth_${digits}@cutbook.app`;
};

// ---------------------------------------------------------------------------
// resetPassword — Callable Cloud Function
// ---------------------------------------------------------------------------

/**
 * Called from the React Native app inside `updatePasswordAfterReset`.
 *
 * Expected payload: { phone: string, newPassword: string }
 * Returns: { success: true }
 */
export const resetPassword = onCall(
  {
    // Enforce App Check if configured; set enforceAppCheck: true in prod.
    enforceAppCheck: false,
    // Keep the function in the same region as your Firestore.
    region: 'us-central1',
  },
  async (request) => {
    const { phone, newPassword } = request.data as {
      phone?: string;
      newPassword?: string;
    };

    // ── 1. Input validation ────────────────────────────────────────────────
    if (!phone || typeof phone !== 'string') {
      throw new HttpsError('invalid-argument', 'Phone number is required.');
    }
    if (!newPassword || typeof newPassword !== 'string') {
      throw new HttpsError('invalid-argument', 'New password is required.');
    }
    if (newPassword.trim().length < 6) {
      throw new HttpsError(
        'invalid-argument',
        'Password must be at least 6 characters.'
      );
    }

    const cleanedPhone = phone.replace(/\D/g, '');

    // ── 2. Confirm a verified OTP exists for this phone (max 10 min old) ───
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;

    const otpSnap = await db
      .collection('otps')
      .where('phone', '==', cleanedPhone)
      .where('verified', '==', true)
      .orderBy('verifiedAt', 'desc')
      .limit(1)
      .get();

    if (otpSnap.empty) {
      throw new HttpsError(
        'failed-precondition',
        'No verified OTP found. Please complete phone verification first.'
      );
    }

    const otpDoc = otpSnap.docs[0];
    const otpData = otpDoc.data();

    // verifiedAt is a Firestore Timestamp or server-set value
    const verifiedAt: number =
      otpData.verifiedAt && otpData.verifiedAt.toMillis
        ? otpData.verifiedAt.toMillis()
        : 0;

    if (verifiedAt < tenMinutesAgo) {
      throw new HttpsError(
        'failed-precondition',
        'OTP verification has expired. Please start over.'
      );
    }

    // ── 3. Look up the Firebase Auth user by the phone-derived email ───────
    const email = phoneToEmail(cleanedPhone);
    let uid: string;

    try {
      const userRecord = await authAdmin.getUserByEmail(email);
      uid = userRecord.uid;
    } catch {
      // Fallback: query Firestore users collection by phone
      const userSnap = await db
        .collection('users')
        .where('phone', '==', cleanedPhone)
        .limit(1)
        .get();

      if (userSnap.empty) {
        throw new HttpsError(
          'not-found',
          'No account found for this phone number.'
        );
      }
      uid = userSnap.docs[0].id;
    }

    // ── 4. Update the password via Admin SDK ───────────────────────────────
    try {
      await authAdmin.updateUser(uid, { password: newPassword.trim() });
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to update password.';
      throw new HttpsError('internal', msg);
    }

    // ── 5. Invalidate the used OTP so it can't be replayed ─────────────────
    try {
      await otpDoc.ref.delete();
    } catch {
      // Non-fatal — log but don't fail the response
      console.warn('Could not delete used OTP doc:', otpDoc.id);
    }

    // ── 6. Clean up any leftover passwordResetRequests docs for this phone ─
    try {
      const reqSnap = await db
        .collection('passwordResetRequests')
        .where('phone', '==', cleanedPhone)
        .get();
      const batch = db.batch();
      reqSnap.docs.forEach((d) => batch.delete(d.ref));
      if (!reqSnap.empty) await batch.commit();
    } catch {
      // Non-fatal
    }

    console.log(`Password reset successful for uid=${uid}`);
    return { success: true };
  }
);
