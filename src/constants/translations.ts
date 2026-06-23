/**
 * translations.ts
 * English, Bengali, Spanish, and Hindi translations for the app
 */

// ============================================================================
// TYPES
// ============================================================================

export type Language = 'en' | 'bn' | 'es' | 'hi';

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
    otpTitle: string;
    enterOtp: string;
    otpSent: string;
    verify: string;
    resendOtp: string;
    resendIn: string;
    newPassword: string;
    confirmNewPassword: string;
    resetPasswordButton: string;
    passwordResetSuccess: string;
    phoneNotFound: string;
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
    spanish: string;
    hindi: string;
    theme: string;
    light: string;
    dark: string;
    about: string;
    version: string;
    syncStatus: string;
    lastSynced: string;
    syncNow: string;
    preferences: string;
    notifications: string;
    notificationsDesc: string;
    notificationsDisabled: string;
    helpSupport: string;
    helpCenter: string;
    helpCenterDesc: string;
    aboutDesc: string;
    legal: string;
    privacyPolicy: string;
    privacyPolicyDesc: string;
    termsOfService: string;
    termsOfServiceDesc: string;
    lightMode: string;
    darkMode: string;
    selectLanguage: string;
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

  // Tabs
  tabs: {
    dashboard: string;
    employees: string;
    services: string;
    profile: string;
    home: string;
    history: string;
    payments: string;
    expenses: string;
  };

  // Expenses
  expenses: {
    title: string;
    tabExpenses: string;
    tabPayouts: string;
    totalRecorded: string;
    numEntries: string;
    addNewExpense: string;
    expenseName: string;
    amountBDT: string;
    recordExpense: string;
    expenseLogs: string;
    noExpenses: string;
    loggedOn: string;
    deleteExpense: string;
    areYouSureDeleteExpense: string;
    sendPayment: string;
    sendPaymentDesc: string;
    chooseEmployee: string;
    noteOptional: string;
    sendPaymentRequest: string;
    recentPayoutRequests: string;
    noPayouts: string;
    initiated: string;
    payoutSuccessAlert: string;
    invalidName: string;
    invalidAmount: string;
    invalidEmployee: string;
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
    otpTitle: 'OTP Verification',
    enterOtp: 'Enter OTP Code',
    otpSent: 'We sent a 6-digit OTP code to {phone}',
    verify: 'Verify',
    resendOtp: 'Resend OTP',
    resendIn: 'Resend in {seconds}s',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    resetPasswordButton: 'Reset Password',
    passwordResetSuccess: 'Password reset successful!',
    phoneNotFound: 'This phone number is not registered.',
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
    title: 'Transaction History',
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
    spanish: 'Español',
    hindi: 'हिन्दी',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    about: 'About',
    version: 'Version',
    syncStatus: 'Sync Status',
    lastSynced: 'Last Synced',
    syncNow: 'Sync Now',
    preferences: 'Preferences',
    notifications: 'Notifications',
    notificationsDesc: 'Receive app notifications',
    notificationsDisabled: 'Notifications disabled',
    helpSupport: 'Help & Support',
    helpCenter: 'Help Center',
    helpCenterDesc: 'Get help and contact support',
    aboutDesc: 'Manage your preferences and organization',
    legal: 'Legal',
    privacyPolicy: 'Privacy Policy',
    privacyPolicyDesc: 'How we handle your data',
    termsOfService: 'Terms of Service',
    termsOfServiceDesc: 'User agreement',
    lightMode: 'Light mode enabled',
    darkMode: 'Dark mode enabled',
    selectLanguage: 'Select Language',
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

  tabs: {
    dashboard: 'Dashboard',
    employees: 'Employees',
    services: 'Services',
    profile: 'Profile',
    home: 'Home',
    history: 'History',
    payments: 'Payments',
    expenses: 'Expenses',
  },

  expenses: {
    title: 'Expenses & Payouts',
    tabExpenses: 'Expenses',
    tabPayouts: 'Payouts',
    totalRecorded: 'Total Expenses Recorded',
    numEntries: 'expense entries',
    addNewExpense: 'Add New Expense',
    expenseName: 'Expense Name *',
    amountBDT: 'Amount (BDT) *',
    recordExpense: 'Record Expense',
    expenseLogs: 'Expense Logs',
    noExpenses: 'No expenses logged yet',
    loggedOn: 'Logged on',
    deleteExpense: 'Delete Expense',
    areYouSureDeleteExpense: 'Are you sure you want to delete "{name}" ({amount})?',
    sendPayment: 'Send Payment to Employee',
    sendPaymentDesc:
      'Select any employee and create a payout request. They will receive an instant notification to Accept or Reject it.',
    chooseEmployee: 'Choose Employee',
    noteOptional: 'Note (Optional)',
    sendPaymentRequest: 'Send Payment Request',
    recentPayoutRequests: 'Recent Payout Requests',
    noPayouts: 'No payouts recorded yet',
    initiated: 'Initiated',
    payoutSuccessAlert: 'Payment request of {amount} sent to {name}. Awaiting acceptance.',
    invalidName: 'Please enter a valid expense name',
    invalidAmount: 'Please enter a valid positive amount',
    invalidEmployee: 'Please select an employee',
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
    otpTitle: 'ওটিপি ভেরিফিকেশন',
    enterOtp: 'ওটিপি কোড লিখুন',
    otpSent: 'আমরা {phone} নম্বরে একটি ৬-সংখ্যার ওটিপি কোড পাঠিয়েছি',
    verify: 'যাচাই করুন',
    resendOtp: 'আবার কোড পাঠান',
    resendIn: '{seconds} সেকেন্ড পর আবার পাঠান',
    newPassword: 'নতুন পাসওয়ার্ড',
    confirmNewPassword: 'পাসওয়ার্ড নিশ্চিত করুন',
    resetPasswordButton: 'পাসওয়ার্ড রিসেট করুন',
    passwordResetSuccess: 'পাসওয়ার্ড সফলভাবে রিসেট করা হয়েছে!',
    phoneNotFound: 'এই ফোন নম্বরটি নিবন্ধিত নয়।',
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
    title: 'লেনদেনের ইতিহাস',
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
    spanish: 'Español',
    hindi: 'हिन्दी',
    theme: 'থিম',
    light: 'হালকা',
    dark: 'গাঢ়',
    about: 'সম্পর্কে',
    version: 'সংস্করণ',
    syncStatus: 'সিঙ্ক স্ট্যাটাস',
    lastSynced: 'শেষ সিঙ্ক',
    syncNow: 'এখনই সিঙ্ক করুন',
    preferences: 'পছন্দসমূহ',
    notifications: 'বিজ্ঞপ্তি',
    notificationsDesc: 'অ্যাপের বিজ্ঞপ্তি পান',
    notificationsDisabled: 'বিজ্ঞপ্তি নিষ্ক্রিয় করা হয়েছে',
    helpSupport: 'সাহায্য ও সহায়তা',
    helpCenter: 'সাহায্য কেন্দ্র',
    helpCenterDesc: 'সাহায্য ও যোগাযোগ',
    aboutDesc: 'আপনার পছন্দ এবং প্রতিষ্ঠান পরিচালনা করুন',
    legal: 'আইনি',
    privacyPolicy: 'গোপনীয়তা নীতি',
    privacyPolicyDesc: 'আমরা আপনার ডেটা কিভাবে পরিচালনা করি',
    termsOfService: 'সেবার শর্তাবলী',
    termsOfServiceDesc: 'ব্যবহারকারী চুক্তি',
    lightMode: 'লাইট মোড সক্রিয় করা হয়েছে',
    darkMode: 'ডার্ক মোড সক্রিয় করা হয়েছে',
    selectLanguage: 'ভাষা নির্বাচন করুন',
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

  tabs: {
    dashboard: 'ড্যাশবোর্ড',
    employees: 'কর্মীরা',
    services: 'সেবাসমূহ',
    profile: 'প্রোফাইল',
    home: 'হোম',
    history: 'ইতিহাস',
    payments: 'পেমেন্ট',
    expenses: 'খরচ',
  },

  expenses: {
    title: 'খরচ ও পেআউট',
    tabExpenses: 'খরচসমূহ',
    tabPayouts: 'পেআউটসমূহ',
    totalRecorded: 'রেকর্ডকৃত মোট খরচ',
    numEntries: 'টি খরচ এন্ট্রি',
    addNewExpense: 'নতুন খরচ যোগ করুন',
    expenseName: 'খরচের নাম *',
    amountBDT: 'পরিমাণ (টাকা) *',
    recordExpense: 'খরচ রেকর্ড করুন',
    expenseLogs: 'খরচের লগ',
    noExpenses: 'এখনো কোন খরচ রেকর্ড করা হয়নি',
    loggedOn: 'লগ অন',
    deleteExpense: 'খরচ মুছুন',
    areYouSureDeleteExpense: 'আপনি কি নিশ্চিত যে আপনি "{name}" ({amount}) মুছতে চান?',
    sendPayment: 'কর্মীকে পেমেন্ট পাঠান',
    sendPaymentDesc:
      'যেকোনো কর্মী নির্বাচন করুন এবং একটি পেআউট অনুরোধ তৈরি করুন। তারা এটি গ্রহণ বা প্রত্যাখ্যান করার জন্য একটি তাত্ক্ষণিক বিজ্ঞপ্তি পাবে।',
    chooseEmployee: 'কর্মী নির্বাচন করুন',
    noteOptional: 'নোট (ঐচ্ছিক)',
    sendPaymentRequest: 'পেমেন্ট অনুরোধ পাঠান',
    recentPayoutRequests: 'সাম্প্রতিক পেআউট অনুরোধসমূহ',
    noPayouts: 'এখনো কোন পেআউট রেকর্ড করা হয়নি',
    initiated: 'শুরু হয়েছে',
    payoutSuccessAlert:
      '{name}-কে {amount} টাকার পেমেন্ট অনুরোধ পাঠানো হয়েছে। গ্রহণের জন্য অপেক্ষমান।',
    invalidName: 'অনুগ্রহ করে একটি সঠিক খরচের নাম লিখুন',
    invalidAmount: 'অনুগ্রহ করে একটি সঠিক ইতিবাচক পরিমাণ লিখুন',
    invalidEmployee: 'অনুগ্রহ করে একজন কর্মী নির্বাচন করুন',
  },
};

// ============================================================================
// SPANISH TRANSLATIONS (es)
// ============================================================================

export const es: Translations = {
  common: {
    save: 'Guardar',
    cancel: 'Cancelar',
    delete: 'Eliminar',
    edit: 'Editar',
    confirm: 'Confirmar',
    back: 'Atrás',
    next: 'Siguiente',
    done: 'Hecho',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
    search: 'Buscar',
    filter: 'Filtrar',
    all: 'Todo',
    today: 'Hoy',
    yesterday: 'Ayer',
    thisWeek: 'Esta Semana',
    thisMonth: 'Este Mes',
    custom: 'Personalizado',
  },

  auth: {
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    logout: 'Cerrar Sesión',
    phone: 'Número de Teléfono',
    password: 'Contraseña',
    email: 'Correo Electrónico',
    name: 'Nombre',
    loginButton: 'Iniciar Sesión',
    registerButton: 'Crear Cuenta',
    dontHaveAccount: '¿No tienes una cuenta?',
    alreadyHaveAccount: '¿Ya tienes una cuenta?',
    forgotPassword: '¿Olvidaste tu contraseña?',
    enterPhone: 'Introduce el número de teléfono',
    enterPassword: 'Introduce la contraseña',
    enterName: 'Introduce tu nombre',
    enterEmail: 'Introduce el correo (opcional)',
    otpTitle: 'Verificación OTP',
    enterOtp: 'Introduce el código OTP',
    otpSent: 'Enviamos un código OTP de 6 dígitos a {phone}',
    verify: 'Verificar',
    resendOtp: 'Reenviar OTP',
    resendIn: 'Reenviar en {seconds}s',
    newPassword: 'Nueva contraseña',
    confirmNewPassword: 'Confirmar nueva contraseña',
    resetPasswordButton: 'Restablecer contraseña',
    passwordResetSuccess: '¡Restablecimiento de contraseña exitoso!',
    phoneNotFound: 'Este número de teléfono no está registrado.',
  },

  dashboard: {
    title: 'Tablero',
    totalIncome: 'Ingresos Totales',
    totalCash: 'Efectivo',
    totalBkash: 'bKash',
    totalEntries: 'Entradas Totales',
    topEmployees: 'Mejores Empleados',
    addWorkEntry: 'Añadir Entrada',
    viewAllEntries: 'Ver Todas',
    exportReport: 'Exportar Reporte',
    addEmployee: 'Añadir Empleado',
    noEntriesYet: 'Sin entradas hoy',
    pullToRefresh: 'Arrastra para actualizar',
  },

  employees: {
    title: 'Empleados',
    addEmployee: 'Añadir Empleado',
    employeeDetails: 'Detalles del Empleado',
    editEmployee: 'Editar Empleado',
    deleteEmployee: 'Eliminar Empleado',
    searchEmployees: 'Buscar empleados...',
    noEmployees: 'Sin empleados aún',
    totalServices: 'Servicios Totales',
    totalIncome: 'Ingresos Totales',
    commission: 'Comisión',
    status: 'Estado',
    active: 'Activo',
    inactive: 'Inactivo',
    owner: 'Propietario',
    employee: 'Empleado',
  },

  services: {
    title: 'Servicios',
    addService: 'Añadir Servicio',
    editService: 'Editar Servicio',
    deleteService: 'Eliminar Servicio',
    serviceName: 'Nombre del Servicio',
    category: 'Categoría',
    defaultPrice: 'Precio Predeterminado',
    noServices: 'Sin servicios añadidos',
    searchServices: 'Buscar servicios...',
    haircut: 'Corte de pelo',
    shave: 'Afeitado',
    facial: 'Facial',
    massage: 'Masaje',
    coloring: 'Tinte',
    other: 'Otro',
  },

  workEntries: {
    title: 'Historial de Transacciones',
    addEntry: 'Añadir Entrada',
    editEntry: 'Editar Entrada',
    deleteEntry: 'Eliminar Entrada',
    selectEmployee: 'Seleccionar Empleado',
    selectService: 'Seleccionar Servicio',
    customService: 'Servicio Personalizado',
    price: 'Precio',
    tip: 'Propina',
    paymentMethod: 'Método de Pago',
    notes: 'Notas',
    noEntries: 'No se encontraron entradas',
    entryDetails: 'Detalles de la Entrada',
    createdBy: 'Creado por',
    createdAt: 'Creado el',
    editedAt: 'Editado el',
  },

  payment: {
    cash: 'Efectivo',
    bkash: 'bKash',
    card: 'Tarjeta',
    nagad: 'Nagad',
    other: 'Otro',
  },

  reports: {
    title: 'Reportes',
    dateRange: 'Rango de Fechas',
    summary: 'Resumen',
    totalRevenue: 'Ingresos Totales',
    totalEntries: 'Entradas Totales',
    breakdown: 'Desglose',
    byPayment: 'Por Método de Pago',
    byEmployee: 'Por Empleado',
    export: 'Exportar CSV',
    exportSuccess: 'Reporte exportado con éxito',
    noData: 'Sin datos disponibles',
  },

  settings: {
    title: 'Ajustes',
    organizationSettings: 'Ajustes de Organización',
    language: 'Idioma',
    english: 'English',
    bengali: 'বাংলা',
    spanish: 'Español',
    hindi: 'हिन्दी',
    theme: 'Tema',
    light: 'Claro',
    dark: 'Oscuro',
    about: 'Acerca de',
    version: 'Versión',
    syncStatus: 'Estado de Sincronización',
    lastSynced: 'Última Sincronización',
    syncNow: 'Sincronizar Ahora',
    preferences: 'Preferencias',
    notifications: 'Notificaciones',
    notificationsDesc: 'Recibir notificaciones de la aplicación',
    notificationsDisabled: 'Notificaciones desactivadas',
    helpSupport: 'Ayuda y Soporte',
    helpCenter: 'Centro de Ayuda',
    helpCenterDesc: 'Obtener ayuda y contactar soporte',
    aboutDesc: 'Administrar sus preferencias y organización',
    legal: 'Legal',
    privacyPolicy: 'Política de Privacidad',
    privacyPolicyDesc: 'Cómo manejamos sus datos',
    termsOfService: 'Condiciones del Servicio',
    termsOfServiceDesc: 'Acuerdo de usuario',
    lightMode: 'Modo claro activado',
    darkMode: 'Modo oscuro activado',
    selectLanguage: 'Seleccionar idioma',
  },

  organization: {
    createOrg: 'Crear Organización',
    joinOrg: 'Unirse a Organización',
    orgName: 'Nombre de la Organización',
    orgCode: 'Código de la Organización',
    timezone: 'Zona Horaria',
    currency: 'Moneda',
    commissionMode: 'Modo de Comisión',
    percentage: 'Porcentaje',
    fixed: 'Fijo',
  },

  profile: {
    title: 'Perfil',
    editProfile: 'Editar Perfil',
    memberSince: 'Miembro Desde',
    totalEarnings: 'Ganancias Totales',
    thisMonth: 'Este Mes',
    statistics: 'Estadísticas',
  },

  sync: {
    synced: 'Sincronizado',
    syncing: 'Sincronizando...',
    offline: 'Fuera de línea',
    error: 'Error de sincro',
    online: 'En línea',
    dataLocal: 'Sus datos se guardan localmente y se sincronizarán al conectarse.',
    failedSync: 'Error al sincronizar. Verifique su conexión.',
    allBackedUp: 'Todos sus datos están respaldados.',
  },

  validation: {
    required: 'Este campo es obligatorio',
    invalidPhone: 'Número de teléfono inválido',
    invalidEmail: 'Dirección de correo inválida',
    minLength: 'Se requieren al menos {min} caracteres',
    maxLength: 'Se permiten máximo {max} caracteres',
    mustBeNumber: 'Debe ser un número',
    mustBePositive: 'Debe ser un número positivo',
  },

  empty: {
    noEmployees: 'Sin empleados aún',
    noServices: 'Sin servicios añadidos',
    noEntries: 'Sin entradas hoy',
    noHistory: 'Sin historial aún',
    noResults: 'No se encontraron resultados',
    addFirst: 'Añada su primera/o {item}',
  },

  confirmation: {
    deleteEmployee: '¿Eliminar empleado?',
    deleteService: '¿Eliminar servicio?',
    deleteEntry: '¿Eliminar entrada?',
    areYouSure: '¿Está seguro?',
    cannotUndo: 'Esta acción no se puede deshacer.',
  },

  tabs: {
    dashboard: 'Tablero',
    employees: 'Empleados',
    services: 'Servicios',
    profile: 'Perfil',
    home: 'Inicio',
    history: 'Historial',
    payments: 'Pagos',
    expenses: 'Gastos',
  },

  expenses: {
    title: 'Gastos y Pagos',
    tabExpenses: 'Gastos',
    tabPayouts: 'Pagos',
    totalRecorded: 'Gastos Totales Registrados',
    numEntries: 'entradas de gastos',
    addNewExpense: 'Añadir Nuevo Gasto',
    expenseName: 'Nombre del Gasto *',
    amountBDT: 'Cantidad (BDT) *',
    recordExpense: 'Registrar Gasto',
    expenseLogs: 'Registros de Gastos',
    noExpenses: 'No se han registrado gastos aún',
    loggedOn: 'Registrado el',
    deleteExpense: 'Eliminar Gasto',
    areYouSureDeleteExpense: '¿Está seguro de que desea eliminar "{name}" ({amount})?',
    sendPayment: 'Enviar Pago al Empleado',
    sendPaymentDesc:
      'Seleccione cualquier empleado y cree una solicitud de pago. Recibirá una notificación instantánea para Aceptar o Rechazar.',
    chooseEmployee: 'Elegir Empleado',
    noteOptional: 'Nota (Opcional)',
    sendPaymentRequest: 'Enviar Solicitud de Pago',
    recentPayoutRequests: 'Solicitudes de Pago Recientes',
    noPayouts: 'No se han registrado pagos aún',
    initiated: 'Iniciado',
    payoutSuccessAlert: 'Solicitud de pago de {amount} enviada a {name}. Esperando aceptación.',
    invalidName: 'Por favor, introduzca un nombre de gasto válido',
    invalidAmount: 'Por favor, introduzca una cantidad positiva válida',
    invalidEmployee: 'Por favor, seleccione un empleado',
  },
};

// ============================================================================
// HINDI TRANSLATIONS (hi)
// ============================================================================

export const hi: Translations = {
  common: {
    save: 'सहेजें',
    cancel: 'रद्द करें',
    delete: 'हटाएं',
    edit: 'संपादित करें',
    confirm: 'पुष्टि करें',
    back: 'पीछे जाएं',
    next: 'आगे बढ़ें',
    done: 'हो गया',
    loading: 'लोड हो रहा है...',
    error: 'त्रुटि',
    success: 'सफलता',
    search: 'खोजें',
    filter: 'फ़िल्टर',
    all: 'सभी',
    today: 'आज',
    yesterday: 'कल',
    thisWeek: 'इस सप्ताह',
    thisMonth: 'इस महीने',
    custom: 'कस्टम',
  },

  auth: {
    login: 'लॉगिन',
    register: 'पंजीकरण',
    logout: 'लॉग आउट',
    phone: 'फ़ोन नंबर',
    password: 'पासवर्ड',
    email: 'ईमेल',
    name: 'नाम',
    loginButton: 'लॉगिन करें',
    registerButton: 'खाता बनाएं',
    dontHaveAccount: 'क्या खाता नहीं है?',
    alreadyHaveAccount: 'क्या पहले से खाता है?',
    forgotPassword: 'पासवर्ड भूल गए?',
    enterPhone: 'फ़ोन नंबर दर्ज करें',
    enterPassword: 'पासवर्ड दर्ज करें',
    enterName: 'अपना नाम दर्ज करें',
    enterEmail: 'ईमेल दर्ज करें (वैकल्पिक)',
    otpTitle: 'ओटीपी सत्यापन',
    enterOtp: 'ओटीपी कोड दर्ज करें',
    otpSent: 'हमने {phone} पर 6 अंकों का ओटीपी कोड भेजा है',
    verify: 'सत्यापित करें',
    resendOtp: 'ओटीपी पुनः भेजें',
    resendIn: '{seconds}s में पुनः भेजें',
    newPassword: 'नया पासवर्ड',
    confirmNewPassword: 'नए पासवर्ड की पुष्टि करें',
    resetPasswordButton: 'पासवर्ड रीसेट करें',
    passwordResetSuccess: 'पासवर्ड रीसेट सफल रहा!',
    phoneNotFound: 'यह फ़ोन नंबर पंजीकृत नहीं है।',
  },

  dashboard: {
    title: 'डैशबोर्ड',
    totalIncome: 'कुल आय',
    totalCash: 'नकद',
    totalBkash: 'बिकाश',
    totalEntries: 'कुल प्रविष्टियां',
    topEmployees: 'सर्वश्रेष्ठ प्रदर्शनकर्ता',
    addWorkEntry: 'काम की प्रविष्टि जोड़ें',
    viewAllEntries: 'सभी प्रविष्टियां देखें',
    exportReport: 'रिपोर्ट एक्सपोर्ट करें',
    addEmployee: 'कर्मचारी जोड़ें',
    noEntriesYet: 'आज कोई प्रविष्टि नहीं है',
    pullToRefresh: 'रिफ्रेश करने के लिए खींचें',
  },

  employees: {
    title: 'कर्मचारी',
    addEmployee: 'कर्मचारी जोड़ें',
    employeeDetails: 'कर्मचारी विवरण',
    editEmployee: 'कर्मचारी संपादित करें',
    deleteEmployee: 'कर्मचारी हटाएं',
    searchEmployees: 'कर्मचारी खोजें...',
    noEmployees: 'अभी कोई कर्मचारी नहीं है',
    totalServices: 'कुल सेवाएं',
    totalIncome: 'कुल आय',
    commission: 'कमीशन',
    status: 'स्थिति',
    active: 'सक्रिय',
    inactive: 'निष्क्रिय',
    owner: 'मालिक',
    employee: 'कर्मचारी',
  },

  services: {
    title: 'सेवाएं',
    addService: 'सेवा जोड़ें',
    editService: 'सेवा संपादित करें',
    deleteService: 'सेवा हटाएं',
    serviceName: 'सेवा का नाम',
    category: 'श्रेणी',
    defaultPrice: 'डिफ़ॉल्ट मूल्य',
    noServices: 'कोई सेवा नहीं जोड़ी गई',
    searchServices: 'सेवाएं खोजें...',
    haircut: 'बाल काटना',
    shave: 'शेव',
    facial: 'फेशियल',
    massage: 'मालिश',
    coloring: 'कलरिंग',
    other: 'अन्य',
  },

  workEntries: {
    title: 'लेनदेन का इतिहास',
    addEntry: 'प्रविष्टि जोड़ें',
    editEntry: 'प्रविष्टि संपादित करें',
    deleteEntry: 'प्रविष्टि हटाएं',
    selectEmployee: 'कर्मचारी चुनें',
    selectService: 'सेवा चुनें',
    customService: 'कस्टम सेवा',
    price: 'कीमत',
    tip: 'टिप',
    paymentMethod: 'भुगतान विधि',
    notes: 'नोट',
    noEntries: 'कोई प्रविष्टि नहीं मिली',
    entryDetails: 'प्रविष्टि का विवरण',
    createdBy: 'द्वारा निर्मित',
    createdAt: 'निर्माण तिथि',
    editedAt: 'संपादन तिथि',
  },

  payment: {
    cash: 'नकद',
    bkash: 'बिकाश',
    card: 'कार्ड',
    nagad: 'नकद (Nagad)',
    other: 'अन्य',
  },

  reports: {
    title: 'रिपोर्ट',
    dateRange: 'तारीख सीमा',
    summary: 'सारांश',
    totalRevenue: 'कुल राजस्व',
    totalEntries: 'कुल प्रविष्टियां',
    breakdown: 'विश्लेषण',
    byPayment: 'भुगतान विधि द्वारा',
    byEmployee: 'कर्मचारी द्वारा',
    export: 'CSV एक्सपोर्ट',
    exportSuccess: 'रिपोर्ट सफलतापूर्वक एक्सपोर्ट हो गई',
    noData: 'कोई डेटा उपलब्ध नहीं है',
  },

  settings: {
    title: 'सेटिंग्स',
    organizationSettings: 'संगठन सेटिंग्स',
    language: 'भाषा',
    english: 'English',
    bengali: 'বাংলা',
    spanish: 'Español',
    hindi: 'हिन्दी',
    theme: 'थीम',
    light: 'हल्का',
    dark: 'गहरा',
    about: 'के बारे में',
    version: 'संस्करण',
    syncStatus: 'सिंक स्थिति',
    lastSynced: 'पिछला सिंक',
    syncNow: 'अभी सिंक करें',
    preferences: 'पसंद',
    notifications: 'नोटिफिकेशन',
    notificationsDesc: 'ऐप नोटिफिकेशन प्राप्त करें',
    notificationsDisabled: 'नोटिफिकेशन अक्षम हैं',
    helpSupport: 'सहायता और समर्थन',
    helpCenter: 'सहायता केंद्र',
    helpCenterDesc: 'सहायता प्राप्त करें और समर्थन से संपर्क करें',
    aboutDesc: 'अपनी पसंद और संगठन प्रबंधित करें',
    legal: 'कानूनी',
    privacyPolicy: 'गोपनीयता नीति',
    privacyPolicyDesc: 'हम आपके डेटा को कैसे प्रबंधित करते हैं',
    termsOfService: 'सेवा की शर्तें',
    termsOfServiceDesc: 'उपयोगकर्ता समझौता',
    lightMode: 'लाइट मोड सक्षम',
    darkMode: 'डार्क मोड सक्षम',
    selectLanguage: 'भाषा चुनें',
  },

  organization: {
    createOrg: 'संगठन बनाएं',
    joinOrg: 'संगठन में शामिल हों',
    orgName: 'संगठन का नाम',
    orgCode: 'संगठन कोड',
    timezone: 'समय क्षेत्र',
    currency: 'मुद्रा',
    commissionMode: 'कमीशन मोड',
    percentage: 'प्रतिशत',
    fixed: 'तय',
  },

  profile: {
    title: 'प्रोफ़ाइल',
    editProfile: 'प्रोफ़ाइल संपादित करें',
    memberSince: 'सदस्यता तिथि',
    totalEarnings: 'कुल कमाई',
    thisMonth: 'इस महीने',
    statistics: 'सांख्यिकी',
  },

  sync: {
    synced: 'सिंक हो गया',
    syncing: 'सिंक हो रहा है...',
    offline: 'ऑफ़लाइन',
    error: 'सिंक त्रुटि',
    online: 'ऑनलाइन',
    dataLocal: 'आपका डेटा स्थानीय रूप से सहेजा गया है और ऑनलाइन होने पर सिंक हो जाएगा।',
    failedSync: 'सिंक करने में विफल। अपना कनेक्शन जांचें करें।',
    allBackedUp: 'आपका सारा डेटा बैकअप हो गया है।',
  },

  validation: {
    required: 'यह फ़ील्ड आवश्यक है',
    invalidPhone: 'अमान्य फ़ोन नंबर',
    invalidEmail: 'अमान्य ईमेल पता',
    minLength: 'न्यूनतम {min} वर्णों की आवश्यकता है',
    maxLength: 'अधिकतम {max} वर्णों की अनुमति है',
    mustBeNumber: 'संख्या होनी चाहिए',
    mustBePositive: 'सकारात्मक संख्या होनी चाहिए',
  },

  empty: {
    noEmployees: 'अभी कोई कर्मचारी नहीं है',
    noServices: 'कोई सेवा नहीं जोड़ी गई',
    noEntries: 'आज कोई प्रविष्टि नहीं है',
    noHistory: 'अभी कोई इतिहास नहीं है',
    noResults: 'कोई परिणाम नहीं मिला',
    addFirst: 'अपनी पहली/पहला {item} जोड़ें',
  },

  confirmation: {
    deleteEmployee: 'कर्मचारी हटाएं?',
    deleteService: 'सेवा हटाएं?',
    deleteEntry: 'प्रविष्टि हटाएं?',
    areYouSure: 'क्या आप निश्चित हैं?',
    cannotUndo: 'यह क्रिया पूर्ववत नहीं की जा सकती।',
  },

  tabs: {
    dashboard: 'डैशबोर्ड',
    employees: 'कर्मचारी',
    services: 'सेवाएं',
    profile: 'प्रोफ़ाइल',
    home: 'होम',
    history: 'इतिहास',
    payments: 'भुगतान',
    expenses: 'खर्च',
  },

  expenses: {
    title: 'खर्च और भुगतान',
    tabExpenses: 'खर्च',
    tabPayouts: 'भुगतान',
    totalRecorded: 'कुल दर्ज खर्च',
    numEntries: 'खर्च प्रविष्टियां',
    addNewExpense: 'नया खर्च जोड़ें',
    expenseName: 'खर्च का नाम *',
    amountBDT: 'राशि (BDT) *',
    recordExpense: 'खर्च दर्ज करें',
    expenseLogs: 'खर्च लॉग',
    noExpenses: 'अभी तक कोई खर्च दर्ज नहीं किया गया है',
    loggedOn: 'दर्ज किया गया',
    deleteExpense: 'खर्च हटाएं',
    areYouSureDeleteExpense: 'क्या आप वाकई "{name}" ({amount}) को हटाना चाहते हैं?',
    sendPayment: 'कर्मचारी को भुगतान भेजें',
    sendPaymentDesc:
      'किसी भी कर्मचारी को चुनें और भुगतान अनुरोध बनाएं। उन्हें स्वीकार या अस्वीकार करने के लिए एक त्वरित अधिसूचना प्राप्त होगी।',
    chooseEmployee: 'कर्मचारी चुनें',
    noteOptional: 'टिप्पणी (वैकल्पिक)',
    sendPaymentRequest: 'भुगतान अनुरोध भेजें',
    recentPayoutRequests: 'हाल के भुगतान अनुरोध',
    noPayouts: 'अभी तक कोई भुगतान दर्ज नहीं किया गया है',
    initiated: 'शुरू किया',
    payoutSuccessAlert: '{name} को {amount} का भुगतान अनुरोध भेजा गया। स्वीकृति की प्रतीक्षा है।',
    invalidName: 'कृपया एक मान्य खर्च नाम दर्ज करें',
    invalidAmount: 'कृपया एक मान्य सकारात्मक राशि दर्ज करें',
    invalidEmployee: 'कृपया एक कर्मचारी चुनें',
  },
};

// ============================================================================
// TRANSLATIONS OBJECT
// ============================================================================

export const translations = {
  en,
  bn,
  es,
  hi,
};

export default translations;
