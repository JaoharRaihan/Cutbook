/**
 * translations.ts
 * English and Bengali translations for the app
 */

// ============================================================================
// TYPES
// ============================================================================

export type Language = 'en' | 'bn';

export interface Translations {
  // Common
  common: {
    save: string;
    cancel: string;
    delete: string;
    edit: string;
    confirm: string;
    back: string;
    next: string;
    done: string;
    loading: string;
    error: string;
    success: string;
    search: string;
    filter: string;
    all: string;
    today: string;
    yesterday: string;
    thisWeek: string;
    thisMonth: string;
    custom: string;
  };

  // Auth
  auth: {
    login: string;
    register: string;
    logout: string;
    phone: string;
    password: string;
    email: string;
    name: string;
    loginButton: string;
    registerButton: string;
    dontHaveAccount: string;
    alreadyHaveAccount: string;
    forgotPassword: string;
    enterPhone: string;
    enterPassword: string;
    enterName: string;
    enterEmail: string;
  };

  // Dashboard
  dashboard: {
    title: string;
    totalIncome: string;
    totalCash: string;
    totalBkash: string;
    totalEntries: string;
    topEmployees: string;
    addWorkEntry: string;
    viewAllEntries: string;
    exportReport: string;
    addEmployee: string;
    noEntriesYet: string;
    pullToRefresh: string;
  };

  // Employees
  employees: {
    title: string;
    addEmployee: string;
    employeeDetails: string;
    editEmployee: string;
    deleteEmployee: string;
    searchEmployees: string;
    noEmployees: string;
    totalServices: string;
    totalIncome: string;
    commission: string;
    status: string;
    active: string;
    inactive: string;
    owner: string;
    employee: string;
  };

  // Services
  services: {
    title: string;
    addService: string;
    editService: string;
    deleteService: string;
    serviceName: string;
    category: string;
    defaultPrice: string;
    noServices: string;
    searchServices: string;
    haircut: string;
    shave: string;
    facial: string;
    massage: string;
    coloring: string;
    other: string;
  };

  // Work Entries
  workEntries: {
    title: string;
    addEntry: string;
    editEntry: string;
    deleteEntry: string;
    selectEmployee: string;
    selectService: string;
    customService: string;
    price: string;
    tip: string;
    paymentMethod: string;
    notes: string;
    noEntries: string;
    entryDetails: string;
    createdBy: string;
    createdAt: string;
    editedAt: string;
  };

  // Payment Methods
  payment: {
    cash: string;
    bkash: string;
    card: string;
    nagad: string;
    other: string;
  };

  // Reports
  reports: {
    title: string;
    dateRange: string;
    summary: string;
    totalRevenue: string;
    totalEntries: string;
    breakdown: string;
    byPayment: string;
    byEmployee: string;
    export: string;
    exportSuccess: string;
    noData: string;
  };

  // Settings
  settings: {
    title: string;
    organizationSettings: string;
    language: string;
    english: string;
    bengali: string;
    theme: string;
    light: string;
    dark: string;
    about: string;
    version: string;
    syncStatus: string;
    lastSynced: string;
    syncNow: string;
  };

  // Organization
  organization: {
    createOrg: string;
    joinOrg: string;
    orgName: string;
    orgCode: string;
    timezone: string;
    currency: string;
    commissionMode: string;
    percentage: string;
    fixed: string;
  };

  // Profile
  profile: {
    title: string;
    editProfile: string;
    memberSince: string;
    totalEarnings: string;
    thisMonth: string;
    statistics: string;
  };

  // Sync
  sync: {
    synced: string;
    syncing: string;
    offline: string;
    error: string;
    online: string;
    dataLocal: string;
    failedSync: string;
    allBackedUp: string;
  };

  // Validation
  validation: {
    required: string;
    invalidPhone: string;
    invalidEmail: string;
    minLength: string;
    maxLength: string;
    mustBeNumber: string;
    mustBePositive: string;
  };

  // Empty States
  empty: {
    noEmployees: string;
    noServices: string;
    noEntries: string;
    noHistory: string;
    noResults: string;
    addFirst: string;
  };

  // Confirmation
  confirmation: {
    deleteEmployee: string;
    deleteService: string;
    deleteEntry: string;
    areYouSure: string;
    cannotUndo: string;
  };
}

// ============================================================================
// ENGLISH TRANSLATIONS
// ============================================================================

export const en: Translations = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    confirm: 'Confirm',
    back: 'Back',
    next: 'Next',
    done: 'Done',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    search: 'Search',
    filter: 'Filter',
    all: 'All',
    today: 'Today',
    yesterday: 'Yesterday',
    thisWeek: 'This Week',
    thisMonth: 'This Month',
    custom: 'Custom',
  },

  auth: {
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    phone: 'Phone Number',
    password: 'Password',
    email: 'Email',
    name: 'Name',
    loginButton: 'Login',
    registerButton: 'Create Account',
    dontHaveAccount: "Don't have an account?",
    alreadyHaveAccount: 'Already have an account?',
    forgotPassword: 'Forgot Password?',
    enterPhone: 'Enter phone number',
    enterPassword: 'Enter password',
    enterName: 'Enter your name',
    enterEmail: 'Enter email (optional)',
  },

  dashboard: {
    title: 'Dashboard',
    totalIncome: 'Total Income',
    totalCash: 'Cash',
    totalBkash: 'bKash',
    totalEntries: 'Total Entries',
    topEmployees: 'Top Performers',
    addWorkEntry: 'Add Work Entry',
    viewAllEntries: 'View All Entries',
    exportReport: 'Export Report',
    addEmployee: 'Add Employee',
    noEntriesYet: 'No entries today',
    pullToRefresh: 'Pull to refresh',
  },

  employees: {
    title: 'Employees',
    addEmployee: 'Add Employee',
    employeeDetails: 'Employee Details',
    editEmployee: 'Edit Employee',
    deleteEmployee: 'Delete Employee',
    searchEmployees: 'Search employees...',
    noEmployees: 'No employees yet',
    totalServices: 'Total Services',
    totalIncome: 'Total Income',
    commission: 'Commission',
    status: 'Status',
    active: 'Active',
    inactive: 'Inactive',
    owner: 'Owner',
    employee: 'Employee',
  },

  services: {
    title: 'Services',
    addService: 'Add Service',
    editService: 'Edit Service',
    deleteService: 'Delete Service',
    serviceName: 'Service Name',
    category: 'Category',
    defaultPrice: 'Default Price',
    noServices: 'No services added',
    searchServices: 'Search services...',
    haircut: 'Haircut',
    shave: 'Shave',
    facial: 'Facial',
    massage: 'Massage',
    coloring: 'Coloring',
    other: 'Other',
  },

  workEntries: {
    title: 'Work Entries',
    addEntry: 'Add Entry',
    editEntry: 'Edit Entry',
    deleteEntry: 'Delete Entry',
    selectEmployee: 'Select Employee',
    selectService: 'Select Service',
    customService: 'Custom Service',
    price: 'Price',
    tip: 'Tip',
    paymentMethod: 'Payment Method',
    notes: 'Notes',
    noEntries: 'No entries found',
    entryDetails: 'Entry Details',
    createdBy: 'Created By',
    createdAt: 'Created At',
    editedAt: 'Edited At',
  },

  payment: {
    cash: 'Cash',
    bkash: 'bKash',
    card: 'Card',
    nagad: 'Nagad',
    other: 'Other',
  },

  reports: {
    title: 'Reports',
    dateRange: 'Date Range',
    summary: 'Summary',
    totalRevenue: 'Total Revenue',
    totalEntries: 'Total Entries',
    breakdown: 'Breakdown',
    byPayment: 'By Payment Method',
    byEmployee: 'By Employee',
    export: 'Export CSV',
    exportSuccess: 'Report exported successfully',
    noData: 'No data available',
  },

  settings: {
    title: 'Settings',
    organizationSettings: 'Organization Settings',
    language: 'Language',
    english: 'English',
    bengali: 'বাংলা',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    about: 'About',
    version: 'Version',
    syncStatus: 'Sync Status',
    lastSynced: 'Last Synced',
    syncNow: 'Sync Now',
  },

  organization: {
    createOrg: 'Create Organization',
    joinOrg: 'Join Organization',
    orgName: 'Organization Name',
    orgCode: 'Organization Code',
    timezone: 'Timezone',
    currency: 'Currency',
    commissionMode: 'Commission Mode',
    percentage: 'Percentage',
    fixed: 'Fixed',
  },

  profile: {
    title: 'Profile',
    editProfile: 'Edit Profile',
    memberSince: 'Member Since',
    totalEarnings: 'Total Earnings',
    thisMonth: 'This Month',
    statistics: 'Statistics',
  },

  sync: {
    synced: 'Synced',
    syncing: 'Syncing...',
    offline: 'Offline',
    error: 'Sync Error',
    online: 'Online',
    dataLocal: 'Your data is saved locally and will sync when online.',
    failedSync: 'Failed to sync. Check your connection.',
    allBackedUp: 'All your data is backed up.',
  },

  validation: {
    required: 'This field is required',
    invalidPhone: 'Invalid phone number',
    invalidEmail: 'Invalid email address',
    minLength: 'Minimum {min} characters required',
    maxLength: 'Maximum {max} characters allowed',
    mustBeNumber: 'Must be a number',
    mustBePositive: 'Must be a positive number',
  },

  empty: {
    noEmployees: 'No employees yet',
    noServices: 'No services added',
    noEntries: 'No entries today',
    noHistory: 'No history yet',
    noResults: 'No results found',
    addFirst: 'Add your first {item}',
  },

  confirmation: {
    deleteEmployee: 'Delete Employee?',
    deleteService: 'Delete Service?',
    deleteEntry: 'Delete Entry?',
    areYouSure: 'Are you sure?',
    cannotUndo: 'This action cannot be undone.',
  },
};

// ============================================================================
// BENGALI TRANSLATIONS
// ============================================================================

export const bn: Translations = {
  common: {
    save: 'সংরক্ষণ',
    cancel: 'বাতিল',
    delete: 'মুছুন',
    edit: 'সম্পাদনা',
    confirm: 'নিশ্চিত',
    back: 'ফিরে যান',
    next: 'পরবর্তী',
    done: 'সম্পন্ন',
    loading: 'লোড হচ্ছে...',
    error: 'ত্রুটি',
    success: 'সফল',
    search: 'অনুসন্ধান',
    filter: 'ফিল্টার',
    all: 'সব',
    today: 'আজ',
    yesterday: 'গতকাল',
    thisWeek: 'এই সপ্তাহ',
    thisMonth: 'এই মাস',
    custom: 'কাস্টম',
  },

  auth: {
    login: 'লগইন',
    register: 'নিবন্ধন',
    logout: 'লগআউট',
    phone: 'ফোন নম্বর',
    password: 'পাসওয়ার্ড',
    email: 'ইমেইল',
    name: 'নাম',
    loginButton: 'লগইন করুন',
    registerButton: 'অ্যাকাউন্ট তৈরি করুন',
    dontHaveAccount: 'অ্যাকাউন্ট নেই?',
    alreadyHaveAccount: 'ইতিমধ্যে অ্যাকাউন্ট আছে?',
    forgotPassword: 'পাসওয়ার্ড ভুলে গেছেন?',
    enterPhone: 'ফোন নম্বর লিখুন',
    enterPassword: 'পাসওয়ার্ড লিখুন',
    enterName: 'আপনার নাম লিখুন',
    enterEmail: 'ইমেইল লিখুন (ঐচ্ছিক)',
  },

  dashboard: {
    title: 'ড্যাশবোর্ড',
    totalIncome: 'মোট আয়',
    totalCash: 'নগদ',
    totalBkash: 'বিকাশ',
    totalEntries: 'মোট এন্ট্রি',
    topEmployees: 'সেরা কর্মী',
    addWorkEntry: 'কাজের এন্ট্রি যোগ করুন',
    viewAllEntries: 'সব এন্ট্রি দেখুন',
    exportReport: 'রিপোর্ট এক্সপোর্ট',
    addEmployee: 'কর্মী যোগ করুন',
    noEntriesYet: 'আজ কোন এন্ট্রি নেই',
    pullToRefresh: 'রিফ্রেশ করতে টানুন',
  },

  employees: {
    title: 'কর্মীরা',
    addEmployee: 'কর্মী যোগ করুন',
    employeeDetails: 'কর্মীর বিবরণ',
    editEmployee: 'কর্মী সম্পাদনা',
    deleteEmployee: 'কর্মী মুছুন',
    searchEmployees: 'কর্মী খুঁজুন...',
    noEmployees: 'এখনো কোন কর্মী নেই',
    totalServices: 'মোট সেবা',
    totalIncome: 'মোট আয়',
    commission: 'কমিশন',
    status: 'অবস্থা',
    active: 'সক্রিয়',
    inactive: 'নিষ্ক্রিয়',
    owner: 'মালিক',
    employee: 'কর্মী',
  },

  services: {
    title: 'সেবাসমূহ',
    addService: 'সেবা যোগ করুন',
    editService: 'সেবা সম্পাদনা',
    deleteService: 'সেবা মুছুন',
    serviceName: 'সেবার নাম',
    category: 'বিভাগ',
    defaultPrice: 'ডিফল্ট মূল্য',
    noServices: 'কোন সেবা যোগ করা হয়নি',
    searchServices: 'সেবা খুঁজুন...',
    haircut: 'চুল কাটা',
    shave: 'শেভ',
    facial: 'ফেসিয়াল',
    massage: 'ম্যাসাজ',
    coloring: 'কালারিং',
    other: 'অন্যান্য',
  },

  workEntries: {
    title: 'কাজের এন্ট্রি',
    addEntry: 'এন্ট্রি যোগ করুন',
    editEntry: 'এন্ট্রি সম্পাদনা',
    deleteEntry: 'এন্ট্রি মুছুন',
    selectEmployee: 'কর্মী নির্বাচন করুন',
    selectService: 'সেবা নির্বাচন করুন',
    customService: 'কাস্টম সেবা',
    price: 'মূল্য',
    tip: 'টিপ',
    paymentMethod: 'পেমেন্ট পদ্ধতি',
    notes: 'নোট',
    noEntries: 'কোন এন্ট্রি পাওয়া যায়নি',
    entryDetails: 'এন্ট্রি বিবরণ',
    createdBy: 'তৈরি করেছেন',
    createdAt: 'তৈরির তারিখ',
    editedAt: 'সম্পাদনার তারিখ',
  },

  payment: {
    cash: 'নগদ',
    bkash: 'বিকাশ',
    card: 'কার্ড',
    nagad: 'নগদ',
    other: 'অন্যান্য',
  },

  reports: {
    title: 'রিপোর্ট',
    dateRange: 'তারিখ পরিসীমা',
    summary: 'সারাংশ',
    totalRevenue: 'মোট আয়',
    totalEntries: 'মোট এন্ট্রি',
    breakdown: 'বিশ্লেষণ',
    byPayment: 'পেমেন্ট পদ্ধতি অনুসারে',
    byEmployee: 'কর্মী অনুসারে',
    export: 'CSV এক্সপোর্ট',
    exportSuccess: 'রিপোর্ট সফলভাবে এক্সপোর্ট হয়েছে',
    noData: 'কোন ডেটা উপলব্ধ নেই',
  },

  settings: {
    title: 'সেটিংস',
    organizationSettings: 'প্রতিষ্ঠানের সেটিংস',
    language: 'ভাষা',
    english: 'English',
    bengali: 'বাংলা',
    theme: 'থিম',
    light: 'হালকা',
    dark: 'গাঢ়',
    about: 'সম্পর্কে',
    version: 'সংস্করণ',
    syncStatus: 'সিঙ্ক স্ট্যাটাস',
    lastSynced: 'শেষ সিঙ্ক',
    syncNow: 'এখনই সিঙ্ক করুন',
  },

  organization: {
    createOrg: 'প্রতিষ্ঠান তৈরি করুন',
    joinOrg: 'প্রতিষ্ঠানে যোগ দিন',
    orgName: 'প্রতিষ্ঠানের নাম',
    orgCode: 'প্রতিষ্ঠান কোড',
    timezone: 'টাইমজোন',
    currency: 'মুদ্রা',
    commissionMode: 'কমিশন মোড',
    percentage: 'শতাংশ',
    fixed: 'নির্দিষ্ট',
  },

  profile: {
    title: 'প্রোফাইল',
    editProfile: 'প্রোফাইল সম্পাদনা',
    memberSince: 'সদস্য হওয়ার তারিখ',
    totalEarnings: 'মোট আয়',
    thisMonth: 'এই মাস',
    statistics: 'পরিসংখ্যান',
  },

  sync: {
    synced: 'সিঙ্ক হয়েছে',
    syncing: 'সিঙ্ক হচ্ছে...',
    offline: 'অফলাইন',
    error: 'সিঙ্ক ত্রুটি',
    online: 'অনলাইন',
    dataLocal: 'আপনার ডেটা স্থানীয়ভাবে সংরক্ষিত এবং অনলাইন হলে সিঙ্ক হবে।',
    failedSync: 'সিঙ্ক ব্যর্থ হয়েছে। আপনার সংযোগ পরীক্ষা করুন।',
    allBackedUp: 'আপনার সমস্ত ডেটা ব্যাকআপ করা আছে।',
  },

  validation: {
    required: 'এই ফিল্ডটি প্রয়োজনীয়',
    invalidPhone: 'অবৈধ ফোন নম্বর',
    invalidEmail: 'অবৈধ ইমেইল ঠিকানা',
    minLength: 'ন্যূনতম {min} অক্ষর প্রয়োজন',
    maxLength: 'সর্বোচ্চ {max} অক্ষর অনুমোদিত',
    mustBeNumber: 'সংখ্যা হতে হবে',
    mustBePositive: 'ধনাত্মক সংখ্যা হতে হবে',
  },

  empty: {
    noEmployees: 'এখনো কোন কর্মী নেই',
    noServices: 'কোন সেবা যোগ করা হয়নি',
    noEntries: 'আজ কোন এন্ট্রি নেই',
    noHistory: 'এখনো কোন ইতিহাস নেই',
    noResults: 'কোন ফলাফল পাওয়া যায়নি',
    addFirst: 'আপনার প্রথম {item} যোগ করুন',
  },

  confirmation: {
    deleteEmployee: 'কর্মী মুছবেন?',
    deleteService: 'সেবা মুছবেন?',
    deleteEntry: 'এন্ট্রি মুছবেন?',
    areYouSure: 'আপনি কি নিশ্চিত?',
    cannotUndo: 'এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।',
  },
};

// ============================================================================
// TRANSLATIONS OBJECT
// ============================================================================

export const translations = {
  en,
  bn,
};

export default translations;
