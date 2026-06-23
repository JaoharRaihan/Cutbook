/**
 * Employee Navigator
 * Bottom tab navigation for salon employees
 */

import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import MaterialIcons from '@react-native-vector-icons/material-icons';

// Employee screens
import EmployeeHomeScreen from '@/screens/employee/EmployeeHomeScreen';
import HistoryScreen from '@/screens/employee/HistoryScreen';
import ProfileScreen from '@/screens/employee/ProfileScreen';
import AddWorkEntryScreen from '@/screens/employee/AddWorkEntryScreen';
import EmployeeTransactionsScreen from '@/screens/employee/EmployeeTransactionsScreen';
import NotificationScreen from '@/screens/employee/NotificationScreen';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type HomeStackParamList = {
  HomeMain: undefined;
  AddEntry: undefined;
  EntryDetail: {entryId: string};
  Notifications: undefined;
};

export type HistoryStackParamList = {
  HistoryList: undefined;
  EntryDetail: {entryId: string};
};

export type ProfileStackParamList = {
  ProfileMain: undefined;
};

export type TransactionsStackParamList = {
  TransactionsList: undefined;
};

export type EmployeeTabParamList = {
  Home: undefined;
  History: undefined;
  Transactions: undefined;
  Profile: undefined;
};

// ============================================================================
// STACK NAVIGATORS
// ============================================================================

import {useTheme, useLanguage} from '@/context';

const HomeStack = createStackNavigator<HomeStackParamList>();
const HomeNavigator = () => {
  const {colors, isDarkMode} = useTheme();
  const {t} = useLanguage();

  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: isDarkMode ? colors.background.paper : colors.primary[600],
          borderBottomWidth: isDarkMode ? 1 : 0,
          borderBottomColor: colors.border.light,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: isDarkMode ? colors.text.primary : '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}>
      <HomeStack.Screen
        name="HomeMain"
        component={EmployeeHomeScreen}
        options={{headerShown: false}}
      />
      <HomeStack.Screen
        name="AddEntry"
        component={AddWorkEntryScreen}
        options={{
          title: t.dashboard.addWorkEntry,
        }}
      />
      <HomeStack.Screen
        name="Notifications"
        component={NotificationScreen}
        options={{
          title: t.settings.notifications,
        }}
      />
    </HomeStack.Navigator>
  );
};

const HistoryStack = createStackNavigator<HistoryStackParamList>();
const HistoryNavigator = () => {
  const {colors, isDarkMode} = useTheme();
  return (
    <HistoryStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: isDarkMode ? colors.background.paper : colors.primary[600],
          borderBottomWidth: isDarkMode ? 1 : 0,
          borderBottomColor: colors.border.light,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: isDarkMode ? colors.text.primary : '#FFFFFF',
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
  const {colors, isDarkMode} = useTheme();
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: isDarkMode ? colors.background.paper : colors.primary[600],
          borderBottomWidth: isDarkMode ? 1 : 0,
          borderBottomColor: colors.border.light,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: isDarkMode ? colors.text.primary : '#FFFFFF',
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

const TransactionsStack = createStackNavigator<TransactionsStackParamList>();
const TransactionsNavigator = () => {
  const {colors, isDarkMode} = useTheme();
  return (
    <TransactionsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: isDarkMode ? colors.background.paper : colors.primary[600],
          borderBottomWidth: isDarkMode ? 1 : 0,
          borderBottomColor: colors.border.light,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: isDarkMode ? colors.text.primary : '#FFFFFF',
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}>
      <TransactionsStack.Screen
        name="TransactionsList"
        component={EmployeeTransactionsScreen}
        options={{headerShown: false}}
      />
    </TransactionsStack.Navigator>
  );
};

// ============================================================================
// BOTTOM TAB NAVIGATOR
// ============================================================================

const Tab = createBottomTabNavigator<EmployeeTabParamList>();

const EmployeeNavigator: React.FC = () => {
  const {colors, isDarkMode} = useTheme();
  const {t} = useLanguage();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: isDarkMode ? colors.primary[400] : colors.primary[600],
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          backgroundColor: colors.background.paper,
          borderTopWidth: 1,
          borderTopColor: colors.border.light,
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
          tabBarLabel: t.tabs.home,
          tabBarIcon: ({color, size}) => <MaterialIcons name="home" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryNavigator}
        options={{
          tabBarLabel: t.tabs.history,
          tabBarIcon: ({color, size}) => <MaterialIcons name="history" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={TransactionsNavigator}
        options={{
          tabBarLabel: t.tabs.payments,
          tabBarIcon: ({color, size}) => <MaterialIcons name="payment" size={size} color={color} />,
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          tabBarLabel: t.tabs.profile,
          tabBarIcon: ({color, size}) => <MaterialIcons name="person" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default EmployeeNavigator;
