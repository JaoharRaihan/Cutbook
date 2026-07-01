'use strict';
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
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ('get' in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, 'default', {enumerable: true, value: v});
      }
    : function (o, v) {
        o.default = v;
      });
var __importStar =
  (this && this.__importStar) ||
  (function () {
    var ownKeys = function (o) {
      ownKeys =
        Object.getOwnPropertyNames ||
        function (o) {
          var ar = [];
          for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
          return ar;
        };
      return ownKeys(o);
    };
    return function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null)
        for (var k = ownKeys(mod), i = 0; i < k.length; i++)
          if (k[i] !== 'default') __createBinding(result, mod, k[i]);
      __setModuleDefault(result, mod);
      return result;
    };
  })();
Object.defineProperty(exports, '__esModule', {value: true});
exports.sendNotificationPush = exports.resetPassword = void 0;
const admin = __importStar(require('firebase-admin'));
const https_1 = require('firebase-functions/v2/https');
const firestore_1 = require('firebase-functions/v2/firestore');
const logger = __importStar(require('firebase-functions/logger'));
admin.initializeApp();
const db = admin.firestore();
const authAdmin = admin.auth();
// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
/** Clean a phone number to standard 11 digits format. */
const normalizePhone = phone => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 13 && cleaned.startsWith('8801')) {
    return cleaned.slice(2);
  }
  if (cleaned.length === 10 && cleaned.startsWith('1')) {
    return '0' + cleaned;
  }
  return cleaned;
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
exports.resetPassword = (0, https_1.onCall)(
  {
    // Enforce App Check if configured; set enforceAppCheck: true in prod.
    enforceAppCheck: false,
    // Keep the function in the same region as your Firestore.
    region: 'us-central1',
  },
  async request => {
    const {phone, newPassword} = request.data;
    // ── 1. Input validation ────────────────────────────────────────────────
    if (!phone || typeof phone !== 'string') {
      throw new https_1.HttpsError('invalid-argument', 'Phone number is required.');
    }
    if (!newPassword || typeof newPassword !== 'string') {
      throw new https_1.HttpsError('invalid-argument', 'New password is required.');
    }
    if (newPassword.trim().length < 6) {
      throw new https_1.HttpsError('invalid-argument', 'Password must be at least 6 characters.');
    }
    const cleanedPhone = normalizePhone(phone);
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
      throw new https_1.HttpsError(
        'failed-precondition',
        'No verified OTP found. Please complete phone verification first.',
      );
    }
    const otpDoc = otpSnap.docs[0];
    const otpData = otpDoc.data();
    // verifiedAt is a Firestore Timestamp or server-set value
    const verifiedAt =
      otpData.verifiedAt && otpData.verifiedAt.toMillis ? otpData.verifiedAt.toMillis() : 0;
    if (verifiedAt < tenMinutesAgo) {
      throw new https_1.HttpsError(
        'failed-precondition',
        'OTP verification has expired. Please start over.',
      );
    }
    // ── 3. Look up the Firebase Auth user by the phone-derived email ───────
    const targetEmail = `auth_${cleanedPhone}@cutbook.app`;
    let uid;
    let matchedDocData = null;
    try {
      const userRecord = await authAdmin.getUserByEmail(targetEmail);
      uid = userRecord.uid;
    } catch (_a) {
      // Fallback: query Firestore users collection by phone formats
      const formats = [cleanedPhone, `88${cleanedPhone}`, `+88${cleanedPhone}`];
      const userSnap = await db.collection('users').where('phone', 'in', formats).get();
      if (userSnap.empty) {
        throw new https_1.HttpsError('not-found', 'No account found for this phone number.');
      }
      const standardDoc = userSnap.docs.find(d => d.data().phone === cleanedPhone);
      const matchedDoc = standardDoc || userSnap.docs[0];
      uid = matchedDoc.id;
      matchedDocData = matchedDoc.data();
    }
    // ── 4. Update the password via Admin SDK (and self-heal formatting if needed) ───
    try {
      const updateData = {password: newPassword.trim()};
      try {
        // Look up Firebase Auth user record to see if email needs updating
        const authUser = await authAdmin.getUser(uid);
        if (authUser.email !== targetEmail) {
          updateData.email = targetEmail;
          logger.log(`Updating Firebase Auth email for ${uid} to standard: ${targetEmail}`);
        }
        await authAdmin.updateUser(uid, updateData);
      } catch (err) {
        if (err.code === 'auth/user-not-found') {
          // Self-heal: Recreate the missing Auth account
          await authAdmin.createUser({
            uid: uid,
            email: targetEmail,
            password: newPassword.trim(),
            displayName: matchedDocData ? matchedDocData.name : 'Salon User',
          });
        } else {
          throw err;
        }
      }
      // Self-heal Firestore record
      await db.collection('users').doc(uid).update({
        phone: cleanedPhone, // standardized 11 digits
        email: targetEmail, // standardized email
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to update password.';
      throw new https_1.HttpsError('internal', msg);
    }
    // ── 5. Invalidate the used OTP so it can't be replayed ─────────────────
    try {
      await otpDoc.ref.delete();
    } catch (_b) {
      // Non-fatal — log but don't fail the response
      logger.warn('Could not delete used OTP doc:', otpDoc.id);
    }
    // ── 6. Clean up any leftover passwordResetRequests docs for this phone ─
    try {
      const reqSnap = await db
        .collection('passwordResetRequests')
        .where('phone', '==', cleanedPhone)
        .get();
      const batch = db.batch();
      reqSnap.docs.forEach(d => batch.delete(d.ref));
      if (!reqSnap.empty) await batch.commit();
    } catch (_c) {
      // Non-fatal
    }
    logger.log(`Password reset successful for uid=${uid}`);
    return {success: true};
  },
);
// ── sendNotificationPush ──────────────────────────────────────────────────
// Automatically triggers on any new notification document creation.
// Fetches the recipient's registered device FCM token and dispatches the
// push notification securely using the Firebase Admin Messaging SDK.
exports.sendNotificationPush = (0, firestore_1.onDocumentCreated)(
  {
    document: 'notifications/{notificationId}',
    region: 'us-central1',
  },
  async event => {
    const snapshot = event.data;
    if (!snapshot) {
      logger.info('No data associated with the event');
      return;
    }
    const data = snapshot.data();
    const recipientId = data.recipientId;
    if (!recipientId) return;
    // Get recipient's FCM token from users collection
    const userDoc = await db.collection('users').doc(recipientId).get();
    if (!userDoc.exists) {
      logger.warn(`Recipient user ${recipientId} not found`);
      return;
    }
    const userData = userDoc.data();
    const fcmToken = userData === null || userData === void 0 ? void 0 : userData.fcmToken;
    if (!fcmToken) {
      logger.info(`No FCM token registered for recipient ${recipientId}`);
      return;
    }
    const payload = {
      token: fcmToken,
      notification: {
        title: data.title || 'Notification',
        body: data.message || '',
      },
      data: {
        type: data.type || '',
        relatedRequestId: data.relatedRequestId || '',
      },
      android: {
        priority: 'high',
        notification: {
          sound: 'default',
          channelId: 'payout_channel',
        },
      },
      apns: {
        payload: {
          aps: {
            sound: 'default',
          },
        },
      },
    };
    try {
      const response = await admin.messaging().send(payload);
      logger.log('Push notification sent successfully:', response);
    } catch (error) {
      logger.error('Failed to send push notification via FCM:', error);
    }
  },
);
//# sourceMappingURL=index.js.map
