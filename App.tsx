/**
 * CutBook - Main App Entry Point
 * Professional Salon Management System
 */

import React, {useEffect, useState} from 'react';
import {StatusBar, View, Text, ActivityIndicator} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import {AuthProvider, OrgProvider, DataProvider, ThemeProvider, LanguageProvider} from '@/context';
import {RootNavigator} from '@/navigation';
import {Colors} from '@/constants/theme';
import {initializeErrorReporting} from '@/utils/error-reporting';
import {createLogger} from '@/utils/logger';

const logger = createLogger('App');

// Initialize error reporting on app startup
initializeErrorReporting();

// ============================================================================
// BACKGROUND MESSAGE HANDLER (must be registered outside of any component)
// FCM requires this to be called before the app mounts any React component.
// ============================================================================
messaging().setBackgroundMessageHandler(async remoteMessage => {
  logger.debug('FCM background message received:', remoteMessage?.notification?.title);
  // The OS displays the notification automatically from the FCM payload.
  // No extra work needed here unless you want to update badge counts etc.
});

function App(): React.JSX.Element {
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    /**
     * Initialize Firebase
     * - Enable offline persistence
     * - Configure Firestore settings
     */
    const initializeFirebase = async () => {
      try {
        // Enable offline persistence (data cached locally)
        await firestore().settings({
          persistence: true, // Enable offline support
          cacheSizeBytes: 104857600, // 100 MB cache
        });

        logger.debug('Firebase initialized successfully');
        logger.debug('Offline persistence enabled');

        setInitializing(false);
      } catch (err) {
        logger.error('Firebase initialization error', err);
        setError('Failed to initialize Firebase. Please check your connection.');
        setInitializing(false);
      }
    };

    initializeFirebase();
  }, []);

  // Show loading screen while initializing
  if (initializing) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors.background.default,
        }}>
        <ActivityIndicator size="large" color={Colors.primary[500]} />
        <Text style={{marginTop: 16, fontSize: 16, color: Colors.text.secondary}}>
          Initializing CutBook...
        </Text>
      </View>
    );
  }

  // Show error screen if initialization failed
  if (error) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors.background.default,
          padding: 24,
        }}>
        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: Colors.error.main,
            marginBottom: 12,
            textAlign: 'center',
          }}>
          Initialization Error
        </Text>
        <Text style={{fontSize: 14, color: Colors.text.secondary, textAlign: 'center'}}>
          {error}
        </Text>
        <Text
          style={{fontSize: 12, color: Colors.text.secondary, textAlign: 'center', marginTop: 16}}>
          Please restart the app or check your internet connection.
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <OrgProvider>
              <DataProvider>
                <RootNavigator />
              </DataProvider>
            </OrgProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default App;
