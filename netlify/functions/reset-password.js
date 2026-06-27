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

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({error: 'Method Not Allowed'}),
    };
  }

  try {
    const {phone, newPassword} = JSON.parse(event.body || '{}');

    // 1. Input validation
    if (!phone || typeof phone !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify({error: 'Phone number is required.'}),
      };
    }
    if (!newPassword || typeof newPassword !== 'string') {
      return {
        statusCode: 400,
        body: JSON.stringify({error: 'New password is required.'}),
      };
    }
    if (newPassword.trim().length < 6) {
      return {
        statusCode: 400,
        body: JSON.stringify({error: 'Password must be at least 6 characters.'}),
      };
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
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: 'No verified OTP found. Please complete phone verification first.',
        }),
      };
    }

    const otpDoc = otpSnap.docs[0];
    const otpData = otpDoc.data();
    const verifiedAt =
      otpData.verifiedAt && otpData.verifiedAt.toMillis ? otpData.verifiedAt.toMillis() : 0;

    if (verifiedAt < tenMinutesAgo) {
      return {
        statusCode: 400,
        body: JSON.stringify({error: 'OTP verification has expired. Please start over.'}),
      };
    }

    // 4. Look up the Firebase Auth user by standard email
    const targetEmail = `auth_${cleanedPhone}@cutbook.app`;
    let uid;

    try {
      const userRecord = await authAdmin.getUserByEmail(targetEmail);
      uid = userRecord.uid;
    } catch (err) {
      // Fallback to Firestore user ID check
      const formats = [cleanedPhone, `88${cleanedPhone}`, `+88${cleanedPhone}`];
      const userSnap = await db.collection('users').where('phone', 'in', formats).get();

      if (userSnap.empty) {
        return {
          statusCode: 404,
          body: JSON.stringify({error: 'No account found for this phone number.'}),
        };
      }

      const standardDoc = userSnap.docs.find(d => d.data().phone === cleanedPhone);
      const matchedDoc = standardDoc || userSnap.docs[0];
      uid = matchedDoc.id;
    }

    // 5. Update user password in Firebase Auth and standardize email
    const updateData = {password: newPassword.trim()};
    const authUser = await authAdmin.getUser(uid);
    if (authUser.email !== targetEmail) {
      updateData.email = targetEmail;
    }

    await authAdmin.updateUser(uid, updateData);

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

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({success: true}),
    };
  } catch (error) {
    console.error('Error resetting password via Netlify function:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({error: error.message || 'Internal server error occurred.'}),
    };
  }
};
