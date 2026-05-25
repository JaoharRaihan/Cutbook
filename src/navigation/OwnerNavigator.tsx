/**
 * Owner Navigator
 * Bottom tab navigation for salon owners
 */

import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createStackNavigator} from '@react-navigation/stack';
import {Text} from 'react-native';
import Theme from '@/constants/theme';

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
import SettingsScreen from '@/screens/owner/SettingsScreen';
import OrganizationSettingsScreen from '@/screens/owner/OrganizationSettingsScreen';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type DashboardStackParamList = {
  DashboardMain: undefined;
  WorkEntries: undefined;
  AddWorkEntry: undefined;
  WorkEntryDetail: {entryId: string};
  Reports: undefined;
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

const DashboardStack = createStackNavigator<DashboardStackParamList>();
const DashboardNavigator = () => {
  return (
    <DashboardStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Theme.colors.primary[600],
        },
        headerTintColor: '#FFFFFF',
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
          title: 'Add Work Entry',
          headerStyle: {backgroundColor: '#FFFFFF'},
          headerTintColor: '#212121',
        }}
      />
      <DashboardStack.Screen
        name="WorkEntryDetail"
        component={WorkEntryDetailScreen}
        options={{
          title: 'Entry Details',
          headerStyle: {backgroundColor: '#FFFFFF'},
          headerTintColor: '#212121',
        }}
      />
      <DashboardStack.Screen
        name="Reports"
        component={ReportsScreen}
        options={{headerShown: false}}
      />
    </DashboardStack.Navigator>
  );
};

const EmployeesStack = createStackNavigator<EmployeesStackParamList>();
const EmployeesNavigator = () => {
  return (
    <EmployeesStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Theme.colors.primary[600],
        },
        headerTintColor: '#FFFFFF',
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
          title: 'Add Employee',
          headerStyle: {backgroundColor: '#FFFFFF'},
          headerTintColor: '#212121',
        }}
      />
      <EmployeesStack.Screen
        name="EmployeeDetail"
        component={EmployeeDetailScreen}
        options={{
          title: 'Employee Details',
          headerStyle: {backgroundColor: '#FFFFFF'},
          headerTintColor: '#212121',
        }}
      />
    </EmployeesStack.Navigator>
  );
};

const ServicesStack = createStackNavigator<ServicesStackParamList>();
const ServicesNavigator = () => {
  return (
    <ServicesStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Theme.colors.primary[600],
        },
        headerTintColor: '#FFFFFF',
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
          title: 'Add Service',
          headerStyle: {backgroundColor: '#FFFFFF'},
          headerTintColor: '#212121',
        }}
      />
      <ServicesStack.Screen
        name="EditService"
        component={EditServiceScreen}
        options={{
          title: 'Edit Service',
          headerStyle: {backgroundColor: '#FFFFFF'},
          headerTintColor: '#212121',
        }}
      />
    </ServicesStack.Navigator>
  );
};

const SettingsStack = createStackNavigator<SettingsStackParamList>();
const SettingsNavigator = () => {
  return (
    <SettingsStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Theme.colors.primary[600],
        },
        headerTintColor: '#FFFFFF',
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
        name="Dashboard"
        component={DashboardNavigator}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({color, size}) => <Text style={{fontSize: size, color}}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="Employees"
        component={EmployeesNavigator}
        options={{
          tabBarLabel: 'Employees',
          tabBarIcon: ({color, size}) => <Text style={{fontSize: size, color}}>👥</Text>,
        }}
      />
      <Tab.Screen
        name="Services"
        component={ServicesNavigator}
        options={{
          tabBarLabel: 'Services',
          tabBarIcon: ({color, size}) => <Text style={{fontSize: size, color}}>✂️</Text>,
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsNavigator}
        options={{
          tabBarLabel: 'Settings',
          tabBarIcon: ({color, size}) => <Text style={{fontSize: size, color}}>⚙️</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

export default OwnerNavigator;
