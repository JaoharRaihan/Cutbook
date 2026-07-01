/**
 * FCM Service
 * Handles FCM token registration and persistence.
 * Note: Actual push notification dispatching is handled securely on the backend
 * via Cloud Functions when new documents are added to the 'notifications' collection.
 */

import firestore from '@react-native-firebase/firestore';
import {createLogger} from '@/utils/logger';

const logger = createLogger('fcmService');

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

/**
 * Save (or update) the FCM device token for a user in Firestore.
 * Called after login / token refresh.
 */
export async function saveFCMToken(userId: string, token: string): Promise<void> {
  try {
    await firestore().collection('users').doc(userId).update({
      fcmToken: token,
      fcmTokenUpdatedAt: firestore.FieldValue.serverTimestamp(),
    });
    logger.debug('FCM token saved for user:', userId);
  } catch (err) {
    logger.error('Failed to save FCM token:', err);
    // Non-fatal — don't throw
  }
}

/**
 * Clear the FCM token for a user (on logout).
 */
export async function clearFCMToken(userId: string): Promise<void> {
  try {
    await firestore().collection('users').doc(userId).update({
      fcmToken: firestore.FieldValue.delete(),
    });
    logger.debug('FCM token cleared for user:', userId);
  } catch (err) {
    logger.error('Failed to clear FCM token:', err);
  }
}

/**
 * Fetch a user's FCM token from Firestore.
 */
export async function getUserFCMToken(userId: string): Promise<string | null> {
  try {
    const doc = await firestore().collection('users').doc(userId).get();
    const data = doc.data();
    return (data?.fcmToken as string) || null;
  } catch (err) {
    logger.error(`Failed to fetch FCM token for user ${userId}:`, err);
    return null;
  }
}
