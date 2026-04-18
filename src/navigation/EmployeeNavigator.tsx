/**
 * Employee Navigator
 * Bottom tab navigation for salon employees
 */

import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {Text} from 'react-native';
import Theme from '@/constants/theme';

// Employee screens
import EmployeeHomeScreen from '@/screens/employee/EmployeeHomeScreen';
import HistoryScreen from '@/screens/employee/HistoryScreen';
import ProfileScreen from '@/screens/employee/ProfileScreen';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type HomeStackParamList = {
  HomeMain: undefined;
  EntryDetail: {entryId: string};
};

export type HistoryStackParamList = {
  HistoryList: undefined;
  EntryDetail: {entryId: string};
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
};

export type EmployeeTabParamList = {
  Home: undefined;
  History: undefined;
  Profile: undefined;
};

// ============================================================================
// STACK NAVIGATORS
// ============================================================================

const HomeStack = createStackNavigator<HomeStackParamList>();
const HomeNavigator = () => {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Theme.colors.primary[600],
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}>
      <HomeStack.Screen
        name="HomeMain"
        component={EmployeeHomeScreen}
        options={{headerShown: false}}
      />
    </HomeStack.Navigator>
  );
};

const HistoryStack = createStackNavigator<HistoryStackParamList>();
const HistoryNavigator = () => {
  return (
    <HistoryStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Theme.colors.primary[600],
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}>
      <HistoryStack.Screen
        name="HistoryList"
        component={HistoryScreen}
        options={{headerShown: false}}
      />
    </HistoryStack.Navigator>
  );
};

const ProfileStack = createStackNavigator<ProfileStackParamList>();
const ProfileNavigator = () => {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Theme.colors.primary[600],
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}>
      <ProfileStack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{headerShown: false}}
      />
    </ProfileStack.Navigator>
  );
};

// ============================================================================
// BOTTOM TAB NAVIGATOR
// ============================================================================

const Tab = createBottomTabNavigator<EmployeeTabParamList>();

const EmployeeNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Theme.colors.primary[600],
        tabBarInactiveTintColor: Theme.colors.text.secondary,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: Theme.colors.neutral[200],
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tab.Screen
        name="Home"
        component={HomeNavigator}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({color, size}) => <Text style={{fontSize: size, color}}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryNavigator}
        options={{
          tabBarLabel: 'History',
          tabBarIcon: ({color, size}) => <Text style={{fontSize: size, color}}>📋</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({color, size}) => <Text style={{fontSize: size, color}}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
};
export default EmployeeNavigator;
