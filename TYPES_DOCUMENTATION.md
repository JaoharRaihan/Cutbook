# 📘 CutBook - TypeScript Types Documentation

## Overview

Complete type system for the CutBook salon management application. All types are defined in `src/types/index.ts` and can be imported using path aliases.

## Usage

```typescript
import type {User, WorkEntry, DailySummary} from '@/types';
import {UserRole, PaymentMethod, ServiceCategory} from '@/types';
```

---

## 🔢 Enums

### UserRole
User roles in the system.

```typescript
enum UserRole {
  OWNER = 'owner',      // Salon owner (full access)
  EMPLOYEE = 'employee', // Employee (limited access)
}
```

### UserStatus
User account status.

```typescript
enum UserStatus {
  ACTIVE = 'active',     // Active user
  BLOCKED = 'blocked',   // Blocked user
  PENDING = 'pending',   // Pending verification
}
```

### PaymentMethod
Payment methods accepted in the salon.

```typescript
enum PaymentMethod {
  CASH = 'cash',     // Cash payment
  BKASH = 'bkash',   // bKash mobile payment
  CARD = 'card',     // Card payment
  NAGAD = 'nagad',   // Nagad mobile payment
  OTHER = 'other',   // Other payment methods
}
```

### CommissionMode
Commission calculation modes.

```typescript
enum CommissionMode {
  PERCENTAGE = 'percentage', // % of service price
  MANUAL = 'manual',         // Manually entered
  FIXED = 'fixed',          // Fixed amount
}
```

### ServiceCategory
Service categories in the salon.

```typescript
enum ServiceCategory {
  HAIRCUT = 'haircut',   // Haircut services
  SHAVE = 'shave',       // Shaving services
  BEARD = 'beard',       // Beard styling
  COLOR = 'color',       // Hair coloring
  FACIAL = 'facial',     // Facial treatments
  MASSAGE = 'massage',   // Massage services
  SPA = 'spa',          // Spa services
  OTHER = 'other',      // Other services
}
```

---

## 👤 User & Authentication Types

### User
Main user entity.

```typescript
interface User extends BaseEntity {
  orgId: string;                    // Organization ID
  role: UserRole;                   // User role
  name: string;                     // Full name
  phone: string;                    // Phone number (unique)
  email?: string;                   // Email (optional)
  commissionPercentage?: number;    // Commission % (for employees)
  status: UserStatus;               // Account status
  avatar?: string;                  // Avatar URL
  address?: string;                 // Address
}
```

### AuthCredentials
Login credentials.

```typescript
interface AuthCredentials {
  phone: string;
  password: string;
}
```

### RegistrationData
User registration data.

```typescript
interface RegistrationData {
  name: string;
  phone: string;
  email?: string;
  password: string;
  role: UserRole;
}
```

---

## 🏢 Organization Types

### Organization
Salon/Organization entity.

```typescript
interface Organization extends BaseEntity {
  name: string;                           // Organization name
  ownerId: string;                        // Owner user ID
  timezone: string;                       // Timezone (e.g., 'Asia/Dhaka')
  currency: string;                       // Currency code ('BDT')
  defaultCommissionMode: CommissionMode;  // Default commission mode
  defaultCommissionValue?: number;        // Default commission value
  phone?: string;                         // Contact phone
  address?: string;                       // Address
  logo?: string;                          // Logo URL
  inviteCode?: string;                    // Invite code for employees
}
```

---

## 💇 Service Types

### Service
Service entity (haircut, shave, etc.).

```typescript
interface Service extends BaseEntity {
  orgId: string;              // Organization ID
  name: string;               // Service name
  category: ServiceCategory;  // Service category
  defaultPrice?: number;      // Default price (optional)
  description?: string;       // Description
  duration?: number;          // Duration in minutes
  isActive: boolean;          // Active status
}
```

---

## 📝 Work Entry Types

### WorkEntry
Main work entry entity (core business logic).

```typescript
interface WorkEntry extends BaseEntity {
  orgId: string;              // Organization ID
  employeeId: string;         // Employee who performed service
  employeeName: string;       // Employee name (denormalized)
  serviceId?: string;         // Service ID (optional)
  serviceName: string;        // Service name (preserved)
  price: number;              // Service price
  tip?: number;               // Tip amount
  paymentMethod: PaymentMethod; // Payment method
  createdBy: string;          // User who created entry
  createdByName: string;      // Creator name (denormalized)
  note?: string;              // Additional notes
  customerInitials?: string;  // Customer initials
  receiptNumber?: string;     // Receipt number
  edited: boolean;            // Has been edited
  editLogs?: EditLog[];       // Edit history
}
```

### EditLog
Audit trail for work entry edits.

```typescript
interface EditLog {
  editedBy: string;                    // User who edited
  editedByName: string;                // Editor name
  previous: Partial<WorkEntry>;        // Previous values
  newValue: Partial<WorkEntry>;        // New values
  timestamp: Timestamp;                // Edit timestamp
  reason?: string;                     // Reason for edit
}
```

---

## 📊 Summary & Stats Types

### DailySummary
Daily aggregated summary.

```typescript
interface DailySummary extends BaseEntity {
  date: string;                        // Date (YYYY-MM-DD)
  orgId: string;                       // Organization ID
  totalIncome: number;                 // Total income
  totalTips: number;                   // Total tips
  totalEntries: number;                // Number of entries
  totalCash: number;                   // Cash total
  totalBkash: number;                  // bKash total
  totalNagad: number;                  // Nagad total
  totalCard: number;                   // Card total
  totalOther: number;                  // Other payment total
  employeeBreakdown: EmployeeBreakdown[]; // Per-employee breakdown
  generatedAt: Timestamp;              // Generation timestamp
}
```

### EmployeeBreakdown
Employee stats in daily summary.

```typescript
interface EmployeeBreakdown {
  employeeId: string;       // Employee ID
  employeeName: string;     // Employee name
  totalCount: number;       // Number of services
  totalIncome: number;      // Total income
  totalTips: number;        // Total tips
  commission?: number;      // Calculated commission
}
```

### EmployeeStats
Long-term employee statistics.

```typescript
interface EmployeeStats extends BaseEntity {
  employeeId: string;         // Employee ID
  orgId: string;              // Organization ID
  totalServices: number;      // Total services performed
  totalIncome: number;        // Total income generated
  totalTips: number;          // Total tips received
  totalCommission: number;    // Total commission earned
  monthly: MonthlyStats[];    // Monthly breakdown
  lastUpdated: Timestamp;     // Last update timestamp
}
```

---

## 🧭 Navigation Types

### Route Param Lists

```typescript
// Root navigation
type RootStackParamList = {
  Splash: undefined;
  Auth: undefined;
  Main: undefined;
};

// Auth navigation
type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  OTPVerification: {phone: string};
  ForgotPassword: undefined;
};

// Owner navigation
type OwnerStackParamList = {
  Dashboard: undefined;
  Employees: undefined;
  AddEmployee: undefined;
  EmployeeDetail: {employeeId: string};
  // ... more screens
};

// Employee navigation
type EmployeeStackParamList = {
  Home: undefined;
  History: undefined;
  Profile: undefined;
};
```

**Usage in screens:**

```typescript
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {OwnerStackParamList} from '@/types';

type Props = NativeStackScreenProps<OwnerStackParamList, 'EmployeeDetail'>;

export const EmployeeDetailScreen: React.FC<Props> = ({route, navigation}) => {
  const {employeeId} = route.params;
  // ...
};
```

---

## 🎨 Context Types

### AuthContextValue

```typescript
interface AuthContextValue {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (data: RegistrationData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}
```

### OrgContextValue

```typescript
interface OrgContextValue {
  currentOrg: Organization | null;
  orgUsers: User[];
  orgServices: Service[];
  loading: boolean;
  createOrg: (payload: CreateOrganizationPayload) => Promise<void>;
  joinOrg: (inviteCode: string) => Promise<void>;
  // ... more methods
}
```

### DataContextValue

```typescript
interface DataContextValue {
  workEntries: WorkEntry[];
  dailySummaries: Record<string, DailySummary>;
  loading: boolean;
  addWorkEntry: (payload: CreateWorkEntryPayload) => Promise<void>;
  updateWorkEntry: (id: string, payload: UpdateWorkEntryPayload) => Promise<void>;
  // ... more methods
}
```

---

## 📋 Form Types

### Form value interfaces for form libraries (react-hook-form, formik, etc.)

```typescript
interface LoginFormValues {
  phone: string;
  password: string;
}

interface WorkEntryFormValues {
  employeeId: string;
  serviceId?: string;
  serviceName: string;
  price: string;        // String for input, convert to number on submit
  tip?: string;
  paymentMethod: PaymentMethod;
  note?: string;
  customerInitials?: string;
}
```

---

## 🛠️ Utility Types

### ApiResponse
Generic API response wrapper.

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Usage:
const response: ApiResponse<User> = await api.getUser(id);
```

### PaginatedResponse
Paginated data response.

```typescript
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Usage:
const response: PaginatedResponse<WorkEntry> = await api.getWorkEntries({page: 1, limit: 20});
```

---

## 💡 Best Practices

### 1. Always Import Types with `type` Keyword

```typescript
// Good ✅
import type {User, WorkEntry} from '@/types';
import {UserRole, PaymentMethod} from '@/types';

// Bad ❌
import {User, WorkEntry, UserRole} from '@/types';
```

### 2. Use Partial for Updates

```typescript
// Update function accepts partial data
const updateUser = (id: string, data: Partial<User>) => {
  // Only need to pass changed fields
};

updateUser('123', {name: 'New Name'}); // ✅
```

### 3. Extend Base Types When Needed

```typescript
interface UserWithStats extends User {
  todayIncome: number;
  todayServices: number;
}
```

### 4. Use Type Guards

```typescript
function isOwner(user: User): user is User & {role: UserRole.OWNER} {
  return user.role === UserRole.OWNER;
}

if (isOwner(user)) {
  // TypeScript knows user is owner here
  console.log('Owner detected');
}
```

---

## 📊 Type Summary

| Category | Count | Key Types |
|----------|-------|-----------|
| **Enums** | 6 | UserRole, PaymentMethod, ServiceCategory |
| **Entities** | 6 | User, Organization, Service, WorkEntry, DailySummary, EmployeeStats |
| **Navigation** | 6 | RootStackParamList, AuthStackParamList, OwnerStackParamList, etc. |
| **Context** | 3 | AuthContextValue, OrgContextValue, DataContextValue |
| **Forms** | 4 | LoginFormValues, WorkEntryFormValues, etc. |
| **Utilities** | 8 | ApiResponse, PaginatedResponse, LoadingState, etc. |

**Total**: 30+ type definitions

---

## ✅ Verification

```bash
# Check types compile
npm run type-check

# Should output: No errors ✅
```

---

**Status**: Step 2.1 Complete ✅  
**Next**: Step 2.2 - Theme & Constants Setup  
**File**: `src/types/index.ts` (480+ lines)  
**Updated**: December 12, 2025
