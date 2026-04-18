/**
 * Root Navigator - Main Navigation Structure
 * Handles authentication flow and conditional rendering based on auth state
 */

import React from 'react';
import {ActivityIndicator, View, Text, StyleSheet} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {useAuth, useOrg} from '@/context';
import Theme from '@/constants/theme';

// Import navigators
import AuthNavigator from './AuthNavigator';
import OnboardingNavigator from './OnboardingNavigator';
import OwnerNavigator from './OwnerNavigator';
import EmployeeNavigator from './EmployeeNavigator';

// ============================================================================
// ROOT STACK TYPES
// ============================================================================

export type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  OwnerMain: undefined;
  EmployeeMain: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();

// ============================================================================
// ROOT NAVIGATOR COMPONENT
// ============================================================================

const RootNavigator: React.FC = () => {
  const {user, initializing, isAuthenticated} = useAuth();
  const {currentOrg, loading: orgLoading} = useOrg();

  // Show splash screen while initializing
  if (initializing || orgLoading) {
    return (
      <View style={styles.splashContainer}>
        <View style={styles.splashContent}>
          <Text style={styles.appName}>CutBook</Text>
          <Text style={styles.tagline}>Professional Salon Management</Text>
          <ActivityIndicator size="large" color="#FFFFFF" style={styles.loader} />
        </View>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          animation: 'fade',
        }}>
        {!isAuthenticated ? (
          // User is not authenticated - show auth flow
          <Stack.Screen
            name="Auth"
            component={AuthNavigator}
            options={{
              animationTypeForReplace: !isAuthenticated ? 'pop' : 'push',
            }}
          />
        ) : !currentOrg ? (
          // User is authenticated but has no organization - show onboarding
          <Stack.Screen
            name="Onboarding"
            component={OnboardingNavigator}
            options={{
              animationTypeForReplace: 'push',
            }}
          />
        ) : user?.role === 'owner' ? (
          // User is authenticated as owner with org - show owner dashboard
          <Stack.Screen
            name="OwnerMain"
            component={OwnerNavigator}
            options={{
              animationTypeForReplace: 'push',
            }}
          />
        ) : (
          // User is authenticated as employee with org - show employee dashboard
          <Stack.Screen
            name="EmployeeMain"
            component={EmployeeNavigator}
            options={{
              animationTypeForReplace: 'push',
            }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Splash Screen Styles
  splashContainer: {
    flex: 1,
    backgroundColor: Theme.colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashContent: {
    alignItems: 'center',
  },
  appName: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.9,
    marginBottom: 40,
  },
  loader: {
    marginTop: 20,
  },
});

export default RootNavigator;
