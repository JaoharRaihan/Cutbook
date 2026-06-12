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
import MaterialIcons from '@react-native-vector-icons/material-icons';

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
          <MaterialIcons name="celebration" style={styles.emoji} />
          <Text style={styles.title}>Welcome to CutBook!</Text>
          <Text style={styles.subtitle}>Let's set up your salon</Text>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => navigation.navigate('CreateOrg')}>
              <MaterialIcons name="domain-add" style={styles.primaryButtonIcon} />
              <Text style={styles.primaryButtonText}>Create New Salon</Text>
              <Text style={styles.primaryButtonSubtext}>Start your own organization</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('JoinOrg')}>
              <MaterialIcons name="handshake" style={styles.secondaryButtonIcon} />
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
        <MaterialIcons name="celebration" style={styles.emoji} />
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
    color: '#9269fc',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#9269fc',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#3a80c1',
    marginBottom: 48,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#008000',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: Theme.borderRadius.lg,
    alignItems: 'center',
    ...Theme.shadows.md,
  },
  primaryButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
    color: '#ffffff',
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
    backgroundColor: '#c38fd2',
    paddingVertical: 20,
    paddingHorizontal: 24,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: '#fa070700',
    alignItems: 'center',
  },
  secondaryButtonIcon: {
    fontSize: 32,
    marginBottom: 8,
    color: '#ffffff',
  },
  secondaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 4,
  },
  secondaryButtonSubtext: {
    fontSize: 14,
    color: '#ffffff',
  },
});

export default OnboardingNavigator;
