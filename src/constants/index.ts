/**
 * CutBook Constants - Central Export
 */

export * from './theme';
export {Theme as default} from './theme';

// App Configuration
export const APP_CONFIG = {
  name: 'CutBook',
  version: '1.0.0',
  description: 'Professional Salon Management System',
  currency: 'BDT',
  currencySymbol: '৳',
  timezone: 'Asia/Dhaka',
  dateFormat: 'DD MMM YYYY',
  timeFormat: 'hh:mm A',
  dateTimeFormat: 'DD MMM YYYY, hh:mm A',
} as const;

// Async Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@cutbook/auth_token',
  USER_DATA: '@cutbook/user_data',
  CURRENT_ORG: '@cutbook/current_org',
  WORK_ENTRIES: '@cutbook/work_entries',
  DAILY_SUMMARIES: '@cutbook/daily_summaries',
  THEME_MODE: '@cutbook/theme_mode',
  LANGUAGE: '@cutbook/language',
  ONBOARDING_COMPLETE: '@cutbook/onboarding_complete',
} as const;

// API Configuration (for future backend integration)
export const API_CONFIG = {
  baseURL: 'https://api.cutbook.app', // Placeholder
  timeout: 30000,
  retryAttempts: 3,
} as const;

// Validation Rules
export const VALIDATION = {
  phone: {
    minLength: 11,
    maxLength: 11,
    pattern: /^01[3-9]\d{8}$/, // Bangladesh phone format
  },
  password: {
    minLength: 6,
    maxLength: 50,
    requireUppercase: false,
    requireLowercase: false,
    requireNumber: false,
    requireSpecialChar: false,
  },
  name: {
    minLength: 2,
    maxLength: 50,
  },
  price: {
    min: 0,
    max: 1000000,
  },
  commissionPercentage: {
    min: 0,
    max: 100,
  },
  inviteCode: {
    length: 6,
    pattern: /^[A-Z0-9]{6}$/,
  },
} as const;

// Pagination
export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100,
  minLimit: 5,
} as const;

// Date Ranges
export const DATE_RANGES = {
  today: 'today',
  yesterday: 'yesterday',
  last7Days: 'last7Days',
  last30Days: 'last30Days',
  thisMonth: 'thisMonth',
  lastMonth: 'lastMonth',
  custom: 'custom',
} as const;

// Service Categories (for UI display)
export const SERVICE_CATEGORY_LABELS = {
  haircut: 'Haircut',
  shave: 'Shave',
  beard: 'Beard',
  color: 'Color',
  facial: 'Facial',
  massage: 'Massage',
  spa: 'Spa',
  other: 'Other',
} as const;

// Payment Method Labels
export const PAYMENT_METHOD_LABELS = {
  cash: 'Cash',
  bkash: 'bKash',
  nagad: 'Nagad',
  card: 'Card',
  other: 'Other',
} as const;

// User Role Labels
export const USER_ROLE_LABELS = {
  owner: 'Owner',
  employee: 'Employee',
} as const;

// User Status Labels
export const USER_STATUS_LABELS = {
  active: 'Active',
  blocked: 'Blocked',
  pending: 'Pending',
} as const;

// Commission Mode Labels
export const COMMISSION_MODE_LABELS = {
  percentage: 'Percentage',
  manual: 'Manual',
  fixed: 'Fixed',
} as const;

// Icons (for react-native-vector-icons)
export const ICONS = {
  // Navigation
  home: 'home',
  history: 'history',
  profile: 'person',
  dashboard: 'dashboard',
  employees: 'people',
  services: 'content-cut',
  reports: 'assessment',
  settings: 'settings',

  // Actions
  add: 'add',
  edit: 'edit',
  delete: 'delete',
  save: 'save',
  cancel: 'cancel',
  search: 'search',
  filter: 'filter-list',
  sort: 'sort',
  refresh: 'refresh',
  more: 'more-vert',
  back: 'arrow-back',
  forward: 'arrow-forward',
  up: 'arrow-upward',
  down: 'arrow-downward',

  // Status
  check: 'check',
  close: 'close',
  info: 'info',
  warning: 'warning',
  error: 'error',
  success: 'check-circle',

  // Business
  money: 'attach-money',
  calendar: 'event',
  time: 'access-time',
  phone: 'phone',
  email: 'email',
  location: 'location-on',
  organization: 'business',
  invite: 'person-add',

  // Services
  haircut: 'content-cut',
  shave: 'face',
  beard: 'face',
  color: 'palette',
  facial: 'spa',
  massage: 'spa',

  // Payment
  cash: 'money',
  card: 'credit-card',
  mobile: 'phone-android',

  // Other
  logout: 'logout',
  visibility: 'visibility',
  visibilityOff: 'visibility-off',
  camera: 'camera-alt',
  image: 'image',
  attachment: 'attach-file',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  // Network
  networkError: 'Network error. Please check your connection.',
  serverError: 'Server error. Please try again later.',
  timeout: 'Request timeout. Please try again.',

  // Auth
  invalidCredentials: 'Invalid phone number or password.',
  userNotFound: 'User not found.',
  userBlocked: 'Your account has been blocked.',
  sessionExpired: 'Session expired. Please login again.',

  // Validation
  requiredField: 'This field is required.',
  invalidPhone: 'Please enter a valid phone number.',
  invalidEmail: 'Please enter a valid email address.',
  invalidPrice: 'Please enter a valid price.',
  passwordTooShort: 'Password must be at least 6 characters.',
  phoneExists: 'This phone number is already registered.',

  // Organization
  orgNotFound: 'Organization not found.',
  invalidInviteCode: 'Invalid invite code.',
  alreadyInOrg: 'You are already in an organization.',

  // Generic
  somethingWentWrong: 'Something went wrong. Please try again.',
  permissionDenied: 'You do not have permission to perform this action.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  loginSuccess: 'Login successful!',
  registrationSuccess: 'Registration successful!',
  orgCreated: 'Organization created successfully!',
  orgJoined: 'Joined organization successfully!',
  workEntryAdded: 'Work entry added successfully!',
  workEntryUpdated: 'Work entry updated successfully!',
  workEntryDeleted: 'Work entry deleted successfully!',
  serviceAdded: 'Service added successfully!',
  serviceUpdated: 'Service updated successfully!',
  employeeAdded: 'Employee added successfully!',
  employeeUpdated: 'Employee updated successfully!',
  profileUpdated: 'Profile updated successfully!',
} as const;

// Placeholder Texts
export const PLACEHOLDERS = {
  phone: '01712345678',
  password: 'Enter your password',
  name: 'Enter your name',
  email: 'example@email.com',
  orgName: 'My Salon',
  serviceName: 'Haircut',
  price: '500',
  tip: '50',
  note: 'Additional notes...',
  search: 'Search...',
  inviteCode: 'Enter 6-digit code',
} as const;

// Empty State Messages
export const EMPTY_STATES = {
  noWorkEntries: 'No work entries yet. Add your first entry!',
  noEmployees: 'No employees yet. Invite your team!',
  noServices: 'No services yet. Create your first service!',
  noReports: 'No reports available for this period.',
  noHistory: 'No history available.',
  noSearchResults: 'No results found.',
} as const;
