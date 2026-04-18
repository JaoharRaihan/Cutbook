/**
 * Auth Navigator - Authentication Flow
 * Handles login, register, and OTP verification screens
 */

import React from 'react';
import {createStackNavigator} from '@react-navigation/stack';

// Import screens (will be created)
import LoginScreen from '@/screens/auth/LoginScreen';
import RegisterScreen from '@/screens/auth/RegisterScreen';
// import OTPScreen from '@/screens/auth/OTPScreen'; // Optional for MVP

// ============================================================================
// AUTH STACK TYPES
// ============================================================================

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  OTP: {phone: string; password: string};
};

const Stack = createStackNavigator<AuthStackParamList>();

// ============================================================================
// AUTH NAVIGATOR COMPONENT
// ============================================================================

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        cardStyle: {backgroundColor: '#FFFFFF'},
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
      {/* Optional OTP Screen
      <Stack.Screen
        name="OTP"
        component={OTPScreen}
        options={{
          animation: 'slide_from_right',
        }}
      />
      */}
    </Stack.Navigator>
  );
};

export default AuthNavigator;
