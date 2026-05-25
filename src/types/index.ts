/**
 * CutBook - TypeScript Type Definitions
 * Complete type system for the salon management app
 */

// ============================================
// ENUMS
// ============================================

/**
 * User roles in the system
 */
export enum UserRole {
  OWNER = 'owner',
  EMPLOYEE = 'employee',
}

/**
 * User account status
 */
export enum UserStatus {
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  PENDING = 'pending',
}

/**
 * Payment methods accepted
 */
export enum PaymentMethod {
  CASH = 'cash',
  BKASH = 'bkash',
  CARD = 'card',
  NAGAD = 'nagad',
  OTHER = 'other',
}

/**
 * Commission calculation mode
 */
export enum CommissionMode {
  PERCENTAGE = 'percentage',
  MANUAL = 'manual',
  FIXED = 'fixed',
}

/**
 * Service categories
 */
export enum ServiceCategory {
  HAIRCUT = 'haircut',
  SHAVE = 'shave',
  BEARD = 'beard',
  COLOR = 'color',
  FACIAL = 'facial',
  MASSAGE = 'massage',
  SPA = 'spa',
  OTHER = 'other',
}

/**
 * Employee permissions - allows owner to delegate specific tasks to employees
 */
export enum EmployeePermission {
  CAN_ADD_ENTRIES = 'can_add_entries', // Can add work entries (when owner is away)
  CAN_EDIT_ENTRIES = 'can_edit_entries', // Can edit work entries
  CAN_DELETE_ENTRIES = 'can_delete_entries', // Can delete work entries
}

// ============================================
// BASE TYPES
// ============================================

/**
 * Base entity with common fields
 */
export interface BaseEntity {
  id: string;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

/**
 * Timestamp type (can be Date or ISO string)
 */
export type Timestamp = Date | string | number;

// ============================================
// USER & AUTHENTICATION
// ============================================

/**
 * User entity
 */
export interface User extends BaseEntity {
  orgId: string;
  role?: UserRole | null;
  name: string;
  phone: string;
  email?: string;
  commissionPercentage?: number;
  status: UserStatus;
  avatar?: string;
  address?: string;
  permissions?: EmployeePermission[]; // Permissions for employees (delegated by owner)
  // Cash account tracking
  totalPayoutReceived: number; // Total cash employee has accepted/received from transactions
  totalPayoutPending: number; // Total cash employee has pending (PENDING transactions)
}

/**
 * Auth credentials for login
 */
export interface AuthCredentials {
  phone: string;
  email?: string; // Added for Firebase compatibility
  password: string;
}

/**
 * Registration data
 */
export interface RegistrationData {
  name: string;
  phone: string;
  email?: string;
  password: string;
  role: UserRole;
}

/**
 * Auth state
 */
export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// ============================================
// ORGANIZATION
// ============================================

/**
 * Organization (Salon) entity
 */
export interface Organization extends BaseEntity {
  name: string;
  ownerId: string;
  timezone: string;
  currency: string; // Default: 'BDT'
  defaultCommissionMode: CommissionMode;
  defaultCommissionValue?: number;
  phone?: string;
  address?: string;
  logo?: string;
  inviteCode: string; // Required for joining organizations
  // Cash account tracking
  mainCash: number; // Organization's main cash account balance
  totalPayoutsGiven: number; // Total cash paid out to employees (from ACCEPTED transactions)
}

/**
 * Organization creation payload
 */
export interface CreateOrganizationPayload {
  name: string;
  phone?: string;
  address?: string;
  defaultCommissionMode: CommissionMode;
  defaultCommissionValue?: number;
}

// ============================================
// SERVICE
// ============================================

/**
 * Service entity
 */
export interface Service extends BaseEntity {
  orgId: string;
  name: string;
  category: ServiceCategory;
  defaultPrice?: number;
  description?: string;
  duration?: number; // in minutes
  isActive: boolean;
}

/**
 * Service creation payload
 */
export interface CreateServicePayload {
  name: string;
  category: ServiceCategory;
  defaultPrice?: number;
  description?: string;
  duration?: number;
}

// ============================================
// WORK ENTRY
// ============================================

/**
 * Edit log entry for audit trail
 */
export interface EditLog {
  editedBy: string;
  editedByName: string;
  previous: Partial<WorkEntry>;
  newValue: Partial<WorkEntry>;
  timestamp: Timestamp;
  reason?: string;
}

/**
 * Work Entry entity (core business logic)
 */
export interface WorkEntry extends BaseEntity {
  orgId: string;
  employeeId: string;
  employeeName: string;
  serviceId?: string;
  serviceName: string;
  price: number;
  tip?: number;
  paymentMethod: PaymentMethod;
  createdBy: string;
  createdByName: string;
  note?: string;
  customerInitials?: string;
  receiptNumber?: string;
  edited: boolean;
  editLogs?: EditLog[];
  updatedAt: Date | string;
}

/**
 * Work entry creation payload
 */
export interface CreateWorkEntryPayload {
  employeeId: string;
  serviceId?: string;
  serviceName: string;
  price: number;
  tip?: number;
  paymentMethod: PaymentMethod;
  note?: string;
  customerInitials?: string;
}

/**
 * Work entry update payload
 */
export interface UpdateWorkEntryPayload {
  serviceId?: string;
  serviceName?: string;
  price?: number;
  tip?: number;
  paymentMethod?: PaymentMethod;
  note?: string;
  reason?: string;
}

// ============================================
// DAILY SUMMARY
// ============================================

/**
 * Employee breakdown in daily summary
 */
export interface EmployeeBreakdown {
  employeeId: string;
  employeeName: string;
  totalCount: number;
  totalIncome: number;
  totalTips: number;
  commission?: number;
}

/**
 * Payment method breakdown
 */
export interface PaymentBreakdown {
  cash: number;
  bkash: number;
  nagad: number;
  card: number;
  other: number;
}

/**
 * Daily Summary entity
 */
export interface DailySummary extends BaseEntity {
  date: string; // YYYY-MM-DD format
  orgId: string;
  totalIncome: number;
  totalTips: number;
  totalEntries: number;
  totalCash: number;
  totalBkash: number;
  totalNagad: number;
  totalCard: number;
  totalOther: number;
  totalCommission: number;
  employeeBreakdown: EmployeeBreakdown[];
  generatedAt: Timestamp;
}

// ============================================
// EMPLOYEE TRANSACTIONS
// ============================================

/**
 * Employee Transaction Status enum
 * pending: Awaiting employee response
 * accepted: Employee accepted the payment
 * rejected: Employee rejected the payment
 */
export enum TransactionStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}

/**
 * Employee Transaction entity
 * Tracks owner-to-employee cash/payment transfers
 * Used for salary advances, daily payouts, etc.
 *
 * CASH FLOW:
 * - ACCEPTED: Organization.mainCash -= amount, Employee.totalPayoutReceived += amount
 * - REJECTED: No balance changes
 * - PENDING: amount is "reserved" (Employee.totalPayoutPending tracks this)
 *
 * Firestore Schema:
 * - id: Auto-generated document ID
 * - orgId: Organization ID (for filtering/security)
 * - employeeId: ID of employee receiving payment
 * - employeeName: Name of employee (snapshot for history)
 * - ownerId: ID of owner sending payment
 * - ownerName: Name of owner (snapshot for history)
 * - amount: Numeric amount in BDT or org currency
 * - note: Optional note/description from owner
 * - status: PENDING | ACCEPTED | REJECTED
 * - respondedAt: Timestamp when employee responded (set when status changes from PENDING)
 * - respondedBy: Employee ID who responded
 * - includeInDailyCount: Whether to include in daily summary (only matters if ACCEPTED)
 * - createdAt: Timestamp when transaction created (set by owner)
 * - updatedAt: Timestamp when last modified
 */
export interface EmployeeTransaction extends BaseEntity {
  orgId: string;
  employeeId: string;
  employeeName: string;
  ownerId: string;
  ownerName: string;
  amount: number; // Amount in BDT or org currency
  note?: string; // Optional note from owner (e.g., "Daily advance")
  status: TransactionStatus; // pending, accepted, rejected
  respondedAt?: Date | string; // When employee responded (ISO string or Date)
  respondedBy?: string; // Employee ID who responded
  includeInDailyCount: boolean; // Whether to include in daily summary when accepted
}

/**
 * Transaction creation payload
 */
export interface CreateEmployeeTransactionPayload {
  employeeId: string;
  amount: number;
  note?: string;
  includeInDailyCount?: boolean;
}

/**
 * Transaction update payload (for employee response)
 */
export interface UpdateEmployeeTransactionPayload {
  status: TransactionStatus;
  note?: string;
}

// ============================================
// EMPLOYEE STATS
// ============================================

/**
 * Monthly stats for an employee
 */
export interface MonthlyStats {
  month: string; // YYYY-MM format
  income: number;
  count: number;
  tips: number;
  commission: number;
}

/**
 * Employee statistics
 */
export interface EmployeeStats extends BaseEntity {
  employeeId: string;
  orgId: string;
  totalServices: number;
  totalIncome: number;
  totalTips: number;
  totalCommission: number;
  monthly: MonthlyStats[];
  lastUpdated: Timestamp;
}

// ============================================
// FILTERS & QUERIES
// ============================================

/**
 * Date range filter
 */
export interface DateRange {
  startDate: Date | string;
  endDate: Date | string;
}

/**
 * Work entry filters
 */
export interface WorkEntryFilters {
  employeeId?: string;
  serviceId?: string;
  paymentMethod?: PaymentMethod;
  dateRange?: DateRange;
  minPrice?: number;
  maxPrice?: number;
}

/**
 * Sort direction
 */
export enum SortDirection {
  ASC = 'asc',
  DESC = 'desc',
}

/**
 * Sort options for work entries
 */
export interface SortOptions {
  field: 'createdAt' | 'price' | 'employeeName' | 'serviceName';
  direction: SortDirection;
}

// ============================================
// NAVIGATION TYPES
// ============================================

/**
 * Root stack param list
 */
export type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
};

/**
 * Auth stack param list
 */
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  OTPVerification: {phone: string};
  ForgotPassword: undefined;
};

/**
 * Owner stack param list
 */
export type OwnerStackParamList = {
  Dashboard: undefined;
  Employees: undefined;
  AddEmployee: undefined;
  EmployeeDetail: {employeeId: string};
  Services: undefined;
  AddService: undefined;
  EditService: {serviceId: string};
  WorkEntries: undefined;
  AddWorkEntry: undefined;
  WorkEntryDetail: {entryId: string};
  Reports: undefined;
  Settings: undefined;
  OrgSettings: undefined;
};

/**
 * Employee stack param list
 */
export type EmployeeStackParamList = {
  Home: undefined;
  History: undefined;
  Profile: undefined;
};

/**
 * Onboarding stack param list
 */
export type OnboardingStackParamList = {
  Welcome: undefined;
  CreateOrg: undefined;
  JoinOrg: undefined;
};

/**
 * Bottom tab param list
 */
export type OwnerTabParamList = {
  DashboardTab: undefined;
  EmployeesTab: undefined;
  ServicesTab: undefined;
  ProfileTab: undefined;
};

export type EmployeeTabParamList = {
  HomeTab: undefined;
  HistoryTab: undefined;
  ProfileTab: undefined;
};

// ============================================
// CONTEXT TYPES
// ============================================

/**
 * Auth context value
 */
export interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (data: RegistrationData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

/**
 * Organization context value
 */
export interface OrgContextValue {
  currentOrg: Organization | null;
  orgUsers: User[];
  orgServices: Service[];
  loading: boolean;
  createOrg: (payload: CreateOrganizationPayload) => Promise<void>;
  joinOrg: (inviteCode: string) => Promise<void>;
  fetchOrgUsers: () => Promise<void>;
  fetchOrgServices: () => Promise<void>;
  addService: (payload: CreateServicePayload) => Promise<void>;
  updateService: (id: string, payload: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
}

/**
 * Data context value (Work entries & summaries)
 */
export interface DataContextValue {
  workEntries: WorkEntry[];
  dailySummaries: Record<string, DailySummary>;
  loading: boolean;
  addWorkEntry: (payload: CreateWorkEntryPayload) => Promise<void>;
  updateWorkEntry: (id: string, payload: UpdateWorkEntryPayload) => Promise<void>;
  deleteWorkEntry: (id: string) => Promise<void>;
  fetchWorkEntries: (filters?: WorkEntryFilters) => Promise<void>;
  getDailySummary: (date: string) => DailySummary | null;
  refreshSummary: (date: string) => Promise<void>;
}

// ============================================
// FORM TYPES
// ============================================

/**
 * Login form values
 */
export interface LoginFormValues {
  phone: string;
  password: string;
}

/**
 * Registration form values
 */
export interface RegistrationFormValues {
  name: string;
  phone: string;
  email?: string;
  password: string;
  confirmPassword: string;
}

/**
 * Work entry form values
 */
export interface WorkEntryFormValues {
  employeeId: string;
  serviceId?: string;
  serviceName: string;
  price: string;
  tip?: string;
  paymentMethod: PaymentMethod;
  note?: string;
  customerInitials?: string;
}

/**
 * Service form values
 */
export interface ServiceFormValues {
  name: string;
  category: ServiceCategory;
  defaultPrice?: string;
  description?: string;
  duration?: string;
}

// ============================================
// UTILITY TYPES
// ============================================

/**
 * API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Pagination
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

/**
 * Loading state
 */
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

/**
 * Validation error
 */
export interface ValidationError {
  field: string;
  message: string;
}

// ============================================
// EXPORT ALL
// ============================================

// All types and enums are already exported above
// No need for re-export
