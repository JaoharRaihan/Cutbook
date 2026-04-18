/**
 * CutBook - Main App Entry Point
 * Professional Salon Management System
 */

import React, {useEffect, useState} from 'react';
import {StatusBar, View, Text, ActivityIndicator} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import firestore from '@react-native-firebase/firestore';
import {AuthProvider, OrgProvider} from '@/context';
import {RootNavigator} from '@/navigation';
import {Colors} from '@/constants/theme';

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
          cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED,
        });

        console.log('✅ Firebase initialized successfully');
        console.log('✅ Offline persistence enabled');

        setInitializing(false);
      } catch (err) {
        console.error('❌ Firebase initialization error:', err);
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
      <AuthProvider>
        <OrgProvider>
          <RootNavigator />
        </OrgProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}

export default App;
