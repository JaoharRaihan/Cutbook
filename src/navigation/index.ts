/**
 * Navigation - Central Export
 */

export {default as RootNavigator} from './RootNavigator';
export {default as AuthNavigator} from './AuthNavigator';
export {default as OnboardingNavigator} from './OnboardingNavigator';
export {default as OwnerNavigator} from './OwnerNavigator';
export {default as EmployeeNavigator} from './EmployeeNavigator';

export type {RootStackParamList} from './RootNavigator';
export type {AuthStackParamList} from './AuthNavigator';
export type {OnboardingStackParamList} from './OnboardingNavigator';
export type {
  OwnerTabParamList,
  DashboardStackParamList,
  TeamServicesStackParamList,
  SettingsStackParamList,
} from './OwnerNavigator';
export type {
  EmployeeTabParamList,
  HomeStackParamList,
  HistoryStackParamList,
  ProfileStackParamList,
} from './EmployeeNavigator';
