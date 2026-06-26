/**
 * FCM Service
 * Handles FCM token persistence and sending push notifications via the
 * FCM Legacy HTTP API (no Cloud Functions required).
 */

import firestore from '@react-native-firebase/firestore';
import {FCM_SERVER_KEY, FCM_LEGACY_API_URL} from '@/config/fcm';
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

// ============================================================================
// PUSH NOTIFICATION SENDER
// ============================================================================

interface SendPushOptions {
  /** Target device FCM token */
  token: string;
  /** Notification title */
  title: string;
  /** Notification body */
  body: string;
  /** Custom data payload delivered to the app */
  data?: Record<string, string>;
}

/**
 * Send a push notification to a single device via the FCM Legacy HTTP API.
 * This runs on the sender's device — no Cloud Functions required.
 */
async function sendPush(options: SendPushOptions): Promise<void> {
  const {token, title, body, data = {}} = options;

  if (!FCM_SERVER_KEY || FCM_SERVER_KEY === 'YOUR_FCM_SERVER_KEY_HERE') {
    logger.warn('FCM_SERVER_KEY not configured — skipping push notification');
    return;
  }

  const payload = {
    to: token,
    priority: 'high',
    notification: {
      title,
      body,
      sound: 'default',
      android_channel_id: 'payout_channel',
    },
    data: {
      ...data,
      click_action: 'FLUTTER_NOTIFICATION_CLICK', // keeps it compatible
    },
  };

  try {
    const response = await fetch(FCM_LEGACY_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `key=${FCM_SERVER_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const result = (await response.json()) as any;
    if (result.failure > 0) {
      logger.warn('FCM delivery failure:', result);
    } else {
      logger.debug('Push notification sent successfully');
    }
  } catch (err) {
    logger.error('Failed to send push notification:', err);
    // Non-fatal — the in-app Firestore notification still works
  }
}

// ============================================================================
// PAYOUT-SPECIFIC SENDERS
// ============================================================================

/**
 * Send a payout request push notification to an employee.
 */
export async function sendPayoutRequestPush(params: {
  employeeId: string;
  amount: number;
  ownerName: string;
  transactionId: string;
}): Promise<void> {
  const {employeeId, amount, ownerName, transactionId} = params;

  const token = await getUserFCMToken(employeeId);
  if (!token) {
    logger.warn('No FCM token for employee:', employeeId);
    return;
  }

  await sendPush({
    token,
    title: '💰 Payment Request',
    body: `${ownerName} sent you ৳${amount.toFixed(0)}. Tap to Accept or Reject.`,
    data: {
      type: 'PAYMENT_REQUEST',
      transactionId,
      amount: String(amount),
    },
  });
}

/**
 * Send a payout acceptance/rejection push notification back to the owner.
 */
export async function sendPayoutResponsePush(params: {
  ownerId: string;
  employeeName: string;
  amount: number;
  accepted: boolean;
  transactionId: string;
}): Promise<void> {
  const {ownerId, employeeName, amount, accepted, transactionId} = params;

  const token = await getUserFCMToken(ownerId);
  if (!token) {
    logger.warn('No FCM token for owner:', ownerId);
    return;
  }

  const emoji = accepted ? '✅' : '❌';
  const action = accepted ? 'accepted' : 'rejected';

  await sendPush({
    token,
    title: `${emoji} Payment ${accepted ? 'Accepted' : 'Rejected'}`,
    body: `${employeeName} ${action} your payment of ৳${amount.toFixed(0)}.`,
    data: {
      type: accepted ? 'PAYMENT_ACCEPTED' : 'PAYMENT_REJECTED',
      transactionId,
      amount: String(amount),
    },
  });
}
