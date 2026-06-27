const admin = require('firebase-admin');

// Clean a phone number to standard 11 digits format
const normalizePhone = phone => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 13 && cleaned.startsWith('8801')) {
    return cleaned.slice(2);
  }
  if (cleaned.length === 10 && cleaned.startsWith('1')) {
    return '0' + cleaned;
  }
  return cleaned;
};

module.exports = async (req, res) => {
  // Configure CORS headers so the React Native app can call it
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
  );

  // Handle CORS preflight options request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).json({error: 'Method Not Allowed'});
    return;
  }

  try {
    const {phone, newPassword} = req.body || {};

    // 1. Input validation
    if (!phone || typeof phone !== 'string') {
      res.status(400).json({error: 'Phone number is required.'});
      return;
    }
    if (!newPassword || typeof newPassword !== 'string') {
      res.status(400).json({error: 'New password is required.'});
      return;
    }
    if (newPassword.trim().length < 6) {
      res.status(400).json({error: 'Password must be at least 6 characters.'});
      return;
    }

    const cleanedPhone = normalizePhone(phone);

    // 2. Initialize Firebase Admin SDK if not already initialized
    if (admin.apps.length === 0) {
      const privateKey = process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
        : undefined;

      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
    }

    const db = admin.firestore();
    const authAdmin = admin.auth();

    // 3. Confirm a verified OTP exists for this phone (max 10 min old)
    const tenMinutesAgo = Date.now() - 10 * 60 * 1000;

    const otpSnap = await db
      .collection('otps')
      .where('phone', '==', cleanedPhone)
      .where('verified', '==', true)
      .orderBy('verifiedAt', 'desc')
      .limit(1)
      .get();

    if (otpSnap.empty) {
      res
        .status(400)
        .json({error: 'No verified OTP found. Please complete phone verification first.'});
      return;
    }

    const otpDoc = otpSnap.docs[0];
    const otpData = otpDoc.data();
    const verifiedAt =
      otpData.verifiedAt && otpData.verifiedAt.toMillis ? otpData.verifiedAt.toMillis() : 0;

    if (verifiedAt < tenMinutesAgo) {
      res.status(400).json({error: 'OTP verification has expired. Please start over.'});
      return;
    }

    // 4. Look up the Firebase Auth user by standard email
    const targetEmail = `auth_${cleanedPhone}@cutbook.app`;
    let uid;
    let matchedDocData = null;

    try {
      const userRecord = await authAdmin.getUserByEmail(targetEmail);
      uid = userRecord.uid;
    } catch (err) {
      // Fallback to Firestore user ID check
      const formats = [cleanedPhone, `88${cleanedPhone}`, `+88${cleanedPhone}`];
      const userSnap = await db.collection('users').where('phone', 'in', formats).get();

      if (userSnap.empty) {
        res.status(404).json({error: 'No account found for this phone number.'});
        return;
      }

      const standardDoc = userSnap.docs.find(d => d.data().phone === cleanedPhone);
      const matchedDoc = standardDoc || userSnap.docs[0];
      uid = matchedDoc.id;
      matchedDocData = matchedDoc.data();
    }

    // 5. Update user password in Firebase Auth and standardize email (self-healing if Auth is missing)
    const updateData = {password: newPassword.trim()};
    try {
      const authUser = await authAdmin.getUser(uid);
      if (authUser.email !== targetEmail) {
        updateData.email = targetEmail;
      }
      await authAdmin.updateUser(uid, updateData);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        // Recreate missing Auth account with existing UID and details
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

    // 6. Update user phone/email in Firestore
    await db.collection('users').doc(uid).update({
      phone: cleanedPhone,
      email: targetEmail,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // 7. Invalidate used OTP document
    try {
      await otpDoc.ref.delete();
    } catch (err) {
      console.warn('Non-fatal: could not delete OTP document', err);
    }

    // 8. Clean up leftover password reset requests
    try {
      const reqSnap = await db
        .collection('passwordResetRequests')
        .where('phone', '==', cleanedPhone)
        .get();
      const batch = db.batch();
      reqSnap.docs.forEach(d => batch.delete(d.ref));
      if (!reqSnap.empty) {
        await batch.commit();
      }
    } catch (err) {
      console.warn('Non-fatal: could not clear reset requests', err);
    }

    res.status(200).json({success: true});
  } catch (error) {
    console.error('Error resetting password via Vercel function:', error);
    res.status(500).json({error: error.message || 'Internal server error occurred.'});
  }
};
