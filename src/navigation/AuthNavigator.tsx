/**
 * Auth Navigator - Authentication Flow
 * Handles login, register, and OTP verification screens
 */

import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import type {RegistrationData} from '@/types';

// Import screens
import LoginScreen from '@/screens/auth/LoginScreen';
import RegisterScreen from '@/screens/auth/RegisterScreen';
import ForgotPasswordScreen from '@/screens/auth/ForgotPasswordScreen';
import OTPVerificationScreen from '@/screens/auth/OTPVerificationScreen';
import ResetPasswordScreen from '@/screens/auth/ResetPasswordScreen';

import {useTheme} from '@/context';

// ============================================================================
// AUTH STACK TYPES
// ============================================================================

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  OTPVerification: {
    phone: string;
    flow: 'register' | 'reset_password';
    registrationData?: RegistrationData;
  };
  ForgotPassword: undefined;
  ResetPassword: {phone: string};
};

const Stack = createStackNavigator<AuthStackParamList>();

// ============================================================================
// AUTH NAVIGATOR COMPONENT
// ============================================================================

const AuthNavigator: React.FC = () => {
  const {colors} = useTheme();

  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: colors.background.default},
        animation: 'slide_from_right',
      }}>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{
          animationTypeForReplace: 'push',
        }}
      />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="ForgotPassword"
        component={ForgotPasswordScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="OTPVerification"
        component={OTPVerificationScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="ResetPassword"
        component={ResetPasswordScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
