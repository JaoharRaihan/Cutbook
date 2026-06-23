/**
 * usePushNotifications hook
 * - Requests OS-level notification permission (Android 13+ / iOS)
 * - Gets and persists the FCM device token to Firestore
 * - Handles foreground FCM messages (shows in-app alert)
 * - Handles notification tap (navigate to correct screen)
 */

import {useEffect, useRef} from 'react';
import {Alert} from 'react-native';
import messaging, {FirebaseMessagingTypes} from '@react-native-firebase/messaging';
import {useAuth} from '@/context';
import {saveFCMToken} from '@/services/fcmService';
import {createLogger} from '@/utils/logger';

const logger = createLogger('usePushNotifications');

export function usePushNotifications(navigation?: any) {
  const {user} = useAuth();
  const tokenSaved = useRef(false);

  // ------------------------------------------------------------------
  // 1. Request permission + save token when user logs in
  // ------------------------------------------------------------------
  useEffect(() => {
    if (!user?.id) {
      tokenSaved.current = false;
      return;
    }

    const initPushNotifications = async () => {
      try {
        // Request permission
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (!enabled) {
          logger.warn('Push notification permission denied by user');
          return;
        }

        // Get token
        const token = await messaging().getToken();
        if (token && !tokenSaved.current) {
          await saveFCMToken(user.id, token);
          tokenSaved.current = true;
          logger.debug('FCM token obtained and saved');
        }
      } catch (err) {
        logger.error('Error initializing push notifications:', err);
      }
    };

    initPushNotifications();

    // Listen for token refresh
    const unsubscribeTokenRefresh = messaging().onTokenRefresh(async newToken => {
      if (user?.id) {
        await saveFCMToken(user.id, newToken);
        logger.debug('FCM token refreshed and saved');
      }
    });

    return () => {
      unsubscribeTokenRefresh();
    };
  }, [user?.id]);

  // ------------------------------------------------------------------
  // 2. Foreground message handler — show in-app banner
  // ------------------------------------------------------------------
  useEffect(() => {
    const unsubscribeForeground = messaging().onMessage(
      async (remoteMessage: FirebaseMessagingTypes.RemoteMessage) => {
        logger.debug('Foreground FCM message received:', remoteMessage);

        const title = remoteMessage.notification?.title ?? 'New Notification';
        const body = remoteMessage.notification?.body ?? '';
        const data = remoteMessage.data;

        // Show in-app alert for payout requests (foreground)
        if (data?.type === 'PAYMENT_REQUEST') {
          Alert.alert(
            `💰 ${title}`,
            body,
            [
              {
                text: 'View',
                onPress: () => {
                  // Navigate to notification screen
                  navigation?.navigate?.('Notifications');
                },
              },
              {text: 'Dismiss', style: 'cancel'},
            ],
            {cancelable: true},
          );
        } else if (data?.type === 'PAYMENT_ACCEPTED' || data?.type === 'PAYMENT_REJECTED') {
          Alert.alert(title, body, [{text: 'OK'}]);
        }
      },
    );

    return () => {
      unsubscribeForeground();
    };
  }, [navigation]);

  // ------------------------------------------------------------------
  // 3. Background / quit notification tap handler
  // ------------------------------------------------------------------
  useEffect(() => {
    // When app was in background and user taps a notification
    const unsubscribeOpenedApp = messaging().onNotificationOpenedApp(remoteMessage => {
      logger.debug('Notification opened from background:', remoteMessage);
      if (remoteMessage.data?.type === 'PAYMENT_REQUEST') {
        navigation?.navigate?.('Notifications');
      }
    });

    // When app was completely quit and opened via notification
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          logger.debug('App opened from quit state via notification:', remoteMessage);
          if (remoteMessage.data?.type === 'PAYMENT_REQUEST') {
            // Delay to allow navigation to mount
            setTimeout(() => {
              navigation?.navigate?.('Notifications');
            }, 1000);
          }
        }
      });

    return () => {
      unsubscribeOpenedApp();
    };
  }, [navigation]);
}
