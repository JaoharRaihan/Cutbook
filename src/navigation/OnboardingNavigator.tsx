/**
 * Onboarding Navigator
 * Handles new user onboarding flow
 */

import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import {CreateOrgScreen, JoinOrgScreen} from '@/screens/onboarding';
import Theme from '@/constants/theme';
import {useAuth} from '@/context';
import {UserRole} from '@/types';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type OnboardingStackParamList = {
  OnboardingChoice: undefined;
  CreateOrg: undefined;
  JoinOrg: undefined;
};

// ============================================================================
// ONBOARDING CHOICE SCREEN
// ============================================================================

const OnboardingChoiceScreen: React.FC<{navigation: any}> = ({navigation}) => {
  const {user} = useAuth();

  // If employee, skip choice and go straight to join
  React.useEffect(() => {
    if (user?.role === UserRole.EMPLOYEE) {
      navigation.replace('JoinOrg');
    }
  }, [user, navigation]);

  // If owner, show choice or go straight to create
  if (user?.role === UserRole.OWNER) {
    return (
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.emoji}>🎉</Text>
          <Text style={styles.title}>Welcome to CutBook!</Text>
          <Text style={styles.subtitle}>Let's set up your salon</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('CreateOrg')}>
              <Text style={styles.primaryButtonIcon}>🏪</Text>
              <Text style={styles.primaryButtonText}>Create New Salon</Text>
              <Text style={styles.primaryButtonSubtext}>Start your own organization</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('JoinOrg')}>
              <Text style={styles.secondaryButtonIcon}>🤝</Text>
              <Text style={styles.secondaryButtonText}>Join Existing Salon</Text>
              <Text style={styles.secondaryButtonSubtext}>Use an invite code</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  // Default: show choice for owners
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>Welcome to CutBook!</Text>
        <Text style={styles.subtitle}>Let's get started</Text>
      </View>
    </View>
  );
};

// ============================================================================
// ONBOARDING STACK NAVIGATOR
// ============================================================================

const Stack = createStackNavigator<OnboardingStackParamList>();

const OnboardingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Theme.colors.primary[600],
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}>
      <Stack.Screen
        name="OnboardingChoice"
        component={OnboardingChoiceScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="CreateOrg"
        component={CreateOrgScreen}
        options={{
          title: 'Create Organization',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="JoinOrg"
        component={JoinOrgScreen}
        options={{
          title: 'Join Organization',
          headerBackTitle: 'Back',
        }}
      />
    </Stack.Navigator>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emoji: {
    fontSize: 80,
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Theme.colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Theme.colors.text.secondary,
    marginBottom: 48,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: Theme.colors.primary[600],
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
    ...Theme.shadows.md,
  },
  primaryButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  primaryButtonSubtext: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: Theme.colors.primary[600],
    alignItems: 'center',
  },
  secondaryButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.colors.primary[600],
    marginBottom: 4,
  },
  secondaryButtonSubtext: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
  },
});

export default OnboardingNavigator;
