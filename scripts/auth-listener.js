/**
 * auth-listener.js
 * A lightweight background listener script that handles password resets for synthetic accounts.
 * Connects to Firebase Firestore and updates credentials in Firebase Authentication.
 *
 * SETUP:
 * 1. Download your service account key JSON from Firebase Console (Project Settings -> Service Accounts).
 * 2. Save it in the project root as 'service-account.json' (do not commit to Git).
 * 3. Run: npm install firebase-admin
 * 4. Run: node scripts/auth-listener.js
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const SERVICE_ACCOUNT_FILE = 'service-account.json';
const serviceAccountPath = path.join(__dirname, '..', SERVICE_ACCOUNT_FILE);

// ============================================================================
// INITIALIZE FIREBASE ADMIN
// ============================================================================
try {
  if (fs.existsSync(serviceAccountPath)) {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    console.log('Firebase Admin initialized successfully using service-account.json.');
  } else {
    // Attempt default initialization (e.g. if running in Google Cloud or environment variable set)
    admin.initializeApp();
    console.log('Firebase Admin initialized using application default credentials.');
  }
} catch (error) {
  console.error('\n[ERROR] Failed to initialize Firebase Admin SDK!');
  console.error(
    'Please make sure you have downloaded the Service Account Key from the Firebase console',
  );
  console.error(`and saved it at: ${path.resolve(serviceAccountPath)}\n`);
  process.exit(1);
}

const db = admin.firestore();
const auth = admin.auth();

console.log('----------------------------------------------------');
console.log('Cutbook Background Auth Reset Listener is active...');
console.log('Listening to collection: passwordResetRequests');
console.log('----------------------------------------------------');

// ============================================================================
// FIRESTORE LISTENER
// ============================================================================
db.collection('passwordResetRequests')
  .where('status', '==', 'pending')
  .onSnapshot(
    snapshot => {
      if (snapshot.empty) return;

      snapshot.docChanges().forEach(async change => {
        if (change.type === 'added') {
          const docRef = change.doc.ref;
          const data = change.doc.data();
          const phone = data.phone;
          const newPassword = data.newPassword;

          if (!phone || !newPassword) {
            console.log(`[Request ${change.doc.id}] Skipped: Missing phone or newPassword.`);
            await docRef.update({
              status: 'failed',
              error: 'Missing phone number or password value in request.',
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
            return;
          }

          console.log(
            `[Request ${change.doc.id}] Processing password reset for phone: +88${phone}`,
          );

          // Generate the synthetic email address
          const email = `auth_${phone.replace(/\D/g, '')}@cutbook.app`;

          try {
            // 1. Get Firebase Auth user by email
            const userRecord = await auth.getUserByEmail(email);

            // 2. Update their password
            await auth.updateUser(userRecord.uid, {
              password: newPassword,
            });

            console.log(
              `[Request ${change.doc.id}] Successfully updated password in Firebase Auth for UID: ${userRecord.uid}`,
            );

            // 3. Mark request as completed
            await docRef.update({
              status: 'completed',
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          } catch (err) {
            console.error(`[Request ${change.doc.id}] Failed to reset password:`, err.message);
            await docRef.update({
              status: 'failed',
              error: err.message,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          }
        }
      });
    },
    error => {
      console.error('Firestore listener error:', error);
    },
  );
