/**
 * Owner Navigator
 * Bottom tab navigation for salon owners
 */

import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

// Screens
import DashboardScreen from '@/screens/owner/DashboardScreen';
import EmployeesScreen from '@/screens/owner/EmployeesScreen';
import AddEmployeeScreen from '@/screens/owner/AddEmployeeScreen';
import EmployeeDetailScreen from '@/screens/owner/EmployeeDetailScreen';
import ServicesScreen from '@/screens/owner/ServicesScreen';
import AddServiceScreen from '@/screens/owner/AddServiceScreen';
import EditServiceScreen from '@/screens/owner/EditServiceScreen';
import WorkEntriesScreen from '@/screens/owner/WorkEntriesScreen';
import AddWorkEntryScreen from '@/screens/owner/AddWorkEntryScreen';
import WorkEntryDetailScreen from '@/screens/owner/WorkEntryDetailScreen';
import ReportsScreen from '@/screens/owner/ReportsScreen';
import ExpensesScreen from '@/screens/owner/ExpensesScreen';
import SettingsScreen from '@/screens/owner/SettingsScreen';
import OrganizationSettingsScreen from '@/screens/owner/OrganizationSettingsScreen';
import NotificationScreen from '@/screens/owner/NotificationScreen';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type DashboardStackParamList = {
  DashboardMain: undefined;
  WorkEntries: undefined;
  AddWorkEntry: undefined;
  WorkEntryDetail: {entryId: string};
  Reports: undefined;
  Notifications: undefined;
  Expenses: undefined;
};

export type EmployeesStackParamList = {
  EmployeeList: undefined;
  AddEmployee: undefined;
  EmployeeDetail: {employeeId: string};
};

export type ServicesStackParamList = {
  ServiceList: undefined;
  AddService: undefined;
  EditService: {serviceId: string};
};

export type SettingsStackParamList = {
  SettingsMain: undefined;
  OrganizationSettings: undefined;
};

export type OwnerTabParamList = {
  Dashboard: undefined;
  Employees: undefined;
  Services: undefined;
  Settings: undefined;
};

// ============================================================================
// STACK NAVIGATORS
// ============================================================================

import {useTheme, useLanguage} from '@/context';

const DashboardStack = createStackNavigator<DashboardStackParamList>();
const DashboardNavigator = () => {
  const {colors, isDarkMode} = useTheme();
  const {t} = useLanguage();

  return (
    <DashboardStack.Navigator
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
      <DashboardStack.Screen
        name="DashboardMain"
        component={DashboardScreen}
        options={{headerShown: false}}
      />
      <DashboardStack.Screen
        name="WorkEntries"
        component={WorkEntriesScreen}
        options={{headerShown: false}}
      />
      <DashboardStack.Screen
        name="AddWorkEntry"
        component={AddWorkEntryScreen}
        options={{
          title: t.dashboard.addWorkEntry,
        }}
      />
      <DashboardStack.Screen
        name="WorkEntryDetail"
        component={WorkEntryDetailScreen}
        options={{
          title: t.workEntries.entryDetails,
        }}
      />
      <DashboardStack.Screen
        name="Reports"
        component={ReportsScreen}
        options={{headerShown: false}}
      />
      <DashboardStack.Screen
        name="Notifications"
        component={NotificationScreen}
        options={{
          title: t.settings.notifications,
        }}
      />
      <DashboardStack.Screen
        name="Expenses"
        component={ExpensesScreen}
        options={{
          title: t.expenses.title,
        }}
      />
    </DashboardStack.Navigator>
  );
};

const EmployeesStack = createStackNavigator<EmployeesStackParamList>();
const EmployeesNavigator = () => {
  const {colors, isDarkMode} = useTheme();
  const {t} = useLanguage();

  return (
    <EmployeesStack.Navigator
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
      <EmployeesStack.Screen
        name="EmployeeList"
        component={EmployeesScreen}
        options={{headerShown: false}}
      />
      <EmployeesStack.Screen
        name="AddEmployee"
        component={AddEmployeeScreen}
        options={{
          title: t.employees.addEmployee,
        }}
      />
      <EmployeesStack.Screen
        name="EmployeeDetail"
        component={EmployeeDetailScreen}
        options={{
          title: t.employees.employeeDetails,
        }}
      />
    </EmployeesStack.Navigator>
  );
};

const ServicesStack = createStackNavigator<ServicesStackParamList>();
const ServicesNavigator = () => {
  const {colors, isDarkMode} = useTheme();
  const {t} = useLanguage();

  return (
    <ServicesStack.Navigator
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
      <ServicesStack.Screen
        name="ServiceList"
        component={ServicesScreen}
        options={{headerShown: false}}
      />
      <ServicesStack.Screen
        name="AddService"
        component={AddServiceScreen}
        options={{
          title: t.services.addService,
        }}
      />
      <ServicesStack.Screen
        name="EditService"
        component={EditServiceScreen}
        options={{
          title: t.services.editService,
        }}
      />
    </ServicesStack.Navigator>
  );
};

const SettingsStack = createStackNavigator<SettingsStackParamList>();
const SettingsNavigator = () => {
  const {colors, isDarkMode} = useTheme();

  return (
    <SettingsStack.Navigator
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
      <SettingsStack.Screen
        name="SettingsMain"
        component={SettingsScreen}
        options={{headerShown: false}}
      />
      <SettingsStack.Screen
        name="OrganizationSettings"
        component={OrganizationSettingsScreen}
        options={{headerShown: false}}
      />
    </SettingsStack.Navigator>
  );
};

// ============================================================================
// BOTTOM TAB NAVIGATOR
// ============================================================================

const Tab = createBottomTabNavigator<OwnerTabParamList>();

const OwnerNavigator: React.FC = () => {
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
        name="Dashboard"
        component={DashboardNavigator}
        options={{
          tabBarLabel: t.tabs.dashboard,
          tabBarIcon: ({color, size}) => (
            <MaterialIcons name="dashboard-customize" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Employees"
        component={EmployeesNavigator}
        options={{
          tabBarLabel: t.tabs.employees,
          tabBarIcon: ({color, size}) => (
            <MaterialIcons name="people-alt" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Services"
        component={ServicesNavigator}
        options={{
          tabBarLabel: t.tabs.services,
          tabBarIcon: ({color, size}) => (
            <MaterialIcons name="content-cut" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{
          tabBarLabel: t.tabs.profile,
          tabBarIcon: ({color, size}) => <MaterialIcons name="person" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
};

export default OwnerNavigator;
