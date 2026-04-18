# 📅 DAY 1-2: Authentication & Data Contexts

## Detailed Implementation Checklist

**Target**: Complete auth system and data management
**Estimated Time**: 8-12 hours
**Status**: Ready to start ⏳

---

## ☀️ DAY 1 MORNING (3-4 hours)

### 🔐 Phase 3.1: Authentication Context (1.5-2 hours)

#### Task 1: Review & Enhance AuthContext

**File**: `src/context/AuthContext.tsx`

**Current Status**: Basic structure exists with mock login

- [x] Basic login function
- [x] Mock user database
- [x] Token generation
- [ ] Complete registration
- [ ] Session persistence
- [ ] Auto-login
- [ ] Better error handling

**To Do**:

- [ ] Add `isLoading` state for initial app load
- [ ] Implement `checkSession()` on app startup
- [ ] Add proper error states
- [ ] Add success messages
- [ ] Improve phone number validation
- [ ] Add user profile update

**Expected Output**:

- Login works with persistence
- User stays logged in after app restart
- Clear error messages

---

#### Task 2: Mock User Management

**File**: `src/utils/mockPasswords.ts`

**To Create**:

```typescript
// Mock users for testing
export const MOCK_CREDENTIALS = {
  owner1: {phone: '+8801712345678', password: '123456'},
  owner2: {phone: '+8801912345678', password: '123456'},
  employee1: {phone: '+8801812345678', password: '123456'},
  employee2: {phone: '+8801712345679', password: '123456'},
};
```

- [ ] Create mock credentials file
- [ ] Add 2-3 owner test accounts
- [ ] Add 2-3 employee test accounts
- [ ] Document credentials in README

---

### 📝 Phase 3.2: Auth Screens (1.5-2 hours)

#### Task 3: Complete LoginScreen

**File**: `src/screens/auth/LoginScreen.tsx`

**Current Status**: Needs completion

- [ ] Phone input with validation
- [ ] Password input with show/hide toggle
- [ ] Login button with loading state
- [ ] Error message display
- [ ] "Remember me" option
- [ ] "Forgot password" link
- [ ] "Register" navigation link
- [ ] Keyboard handling (dismiss on tap)
- [ ] Input focus management

**Design Requirements**:

- Logo at top
- Clean form layout
- Primary button styling
- Error text in red
- Loading spinner on button

---

#### Task 4: Complete RegisterScreen

**File**: `src/screens/auth/RegisterScreen.tsx`

**Current Status**: Needs completion

- [ ] Name input
- [ ] Phone input with format validation
- [ ] Email input (optional)
- [ ] Password input with strength indicator
- [ ] Confirm password input
- [ ] Role selection (Owner/Employee)
- [ ] Terms & conditions checkbox
- [ ] Register button with loading
- [ ] Back to login link
- [ ] Form validation
- [ ] Error messages

**Validation Rules**:

- Name: 2-50 characters
- Phone: Valid Bangladesh format
- Password: 6+ characters
- Passwords must match

---

## ☀️ DAY 1 AFTERNOON (3-4 hours)

### 📊 Phase 4.1: OrgContext Enhancement (2 hours)

#### Task 5: Complete OrgContext CRUD

**File**: `src/context/OrgContext.tsx`

**Current Status**: Basic structure exists

- [x] createOrg function (basic)
- [x] joinOrg function (basic)
- [x] Mock data loaded
- [ ] Complete service management
- [ ] Complete user management
- [ ] Data persistence
- [ ] Error handling
- [ ] Loading states

**To Complete**:

**Services**:

- [ ] `addService()` - Create new service
- [ ] `updateService()` - Edit service
- [ ] `deleteService()` - Remove service
- [ ] `toggleServiceStatus()` - Enable/disable

**Users**:

- [ ] `addUser()` - Add employee
- [ ] `updateUserInOrg()` - Edit employee
- [ ] `deleteUser()` - Remove employee
- [ ] `updateUserStatus()` - Block/unblock

**Persistence**:

- [ ] Save to AsyncStorage on every change
- [ ] Load from AsyncStorage on mount
- [ ] Handle errors gracefully

---

#### Task 6: Service Management Functions

**File**: `src/context/OrgContext.tsx`

**To Implement**:

```typescript
// Add these functions to OrgContext

addService: async payload => {
  // 1. Validate input
  // 2. Create service object
  // 3. Add to state
  // 4. Save to AsyncStorage
  // 5. Return created service
};

updateService: async (id, updates) => {
  // 1. Find service
  // 2. Validate updates
  // 3. Update state
  // 4. Save to storage
};

deleteService: async id => {
  // 1. Confirm service exists
  // 2. Remove from state
  // 3. Update storage
};
```

---

### 📊 Phase 4.2: DataContext Enhancement (2 hours)

#### Task 7: Complete DataContext

**File**: `src/context/DataContext.tsx`

**Current Status**: Basic structure exists

- [x] addWorkEntry function (basic)
- [ ] Complete updateWorkEntry
- [ ] Complete deleteWorkEntry
- [ ] Implement filtering
- [ ] Daily summary generation
- [ ] Employee breakdown
- [ ] Persistence

**To Complete**:

**Work Entries**:

- [ ] Finish `addWorkEntry()` with commission calc
- [ ] Complete `updateWorkEntry()` with edit log
- [ ] Complete `deleteWorkEntry()` with soft delete
- [ ] Add `getWorkEntries()` with filters

**Summaries**:

- [ ] `generateDailySummary()` - Calculate totals
- [ ] `getDailySummary()` - Fetch or generate
- [ ] Employee breakdown calculation
- [ ] Payment method totals

**Filters**:

- [ ] Filter by date range
- [ ] Filter by employee
- [ ] Filter by payment method
- [ ] Filter by service

---

## 🌙 DAY 1 EVENING (2-3 hours)

### 🎨 Phase 3.3: Auth UI Components (2-3 hours)

#### Task 8: Create Input Components

**Files**: Create if not exist

**PhoneInput.tsx**:

- [ ] Auto-format: +880 1X-XXXXXXXX
- [ ] Validation indicator
- [ ] Error message display
- [ ] Numeric keyboard

**PasswordInput.tsx**:

- [ ] Show/hide password toggle
- [ ] Strength indicator (for registration)
- [ ] Clear button
- [ ] Error display

---

#### Task 9: Auth Navigator

**File**: `src/navigation/AuthNavigator.tsx`

**To Complete**:

- [ ] Login screen as initial route
- [ ] Register screen
- [ ] Screen transitions
- [ ] Header styling
- [ ] Back button handling

---

## ☀️ DAY 2 MORNING (3-4 hours)

### 🏢 Phase 4.3: Onboarding Screens (3-4 hours)

#### Task 10: CreateOrgScreen

**File**: `src/screens/onboarding/CreateOrgScreen.tsx`

**To Implement**:

- [ ] Organization name input
- [ ] Phone input
- [ ] Address input (optional)
- [ ] Commission mode selection
  - [ ] Percentage option
  - [ ] Fixed amount option
  - [ ] Manual option
- [ ] Commission value input
- [ ] Form validation
- [ ] Create button
- [ ] Loading state
- [ ] Success navigation to dashboard

**Validation**:

- Name: Required, 2-100 chars
- Commission: Required if not manual
- Phone: Valid format

---

#### Task 11: JoinOrgScreen

**File**: `src/screens/onboarding/JoinOrgScreen.tsx`

**To Implement**:

- [ ] Invite code input (6-8 chars)
- [ ] Code validation
- [ ] Join button
- [ ] Loading state
- [ ] Error handling
- [ ] Success navigation
- [ ] "Create instead" link

---

## ☀️ DAY 2 AFTERNOON (3-4 hours)

### 🧪 Testing & Integration (3-4 hours)

#### Task 12: End-to-End Auth Testing

**Manual Testing Checklist**:

**Registration Flow**:

- [ ] Open app → See login screen
- [ ] Tap "Register"
- [ ] Fill valid details → Success
- [ ] Fill invalid phone → Error shown
- [ ] Password mismatch → Error shown
- [ ] Successful registration → Navigate to onboarding

**Login Flow**:

- [ ] Enter valid credentials → Success
- [ ] Enter invalid credentials → Error shown
- [ ] Login successful → Navigate to appropriate dashboard
- [ ] Close app and reopen → Still logged in

**Onboarding Flow**:

- [ ] Create organization → Success
- [ ] Data saved → Navigate to owner dashboard
- [ ] Close app and reopen → Organization loaded

---

#### Task 13: Data Persistence Testing

**Context Testing**:

- [ ] Create work entry → Saved
- [ ] Close app and reopen → Data still there
- [ ] Add employee → Persisted
- [ ] Add service → Persisted
- [ ] Edit data → Changes saved
- [ ] Delete data → Removed permanently

**Storage Testing**:

- [ ] Check AsyncStorage keys are correct
- [ ] Verify data format is JSON
- [ ] Test with large datasets (100+ entries)
- [ ] Clear data works properly

---

#### Task 14: Bug Fixes & Polish

**Common Issues to Check**:

- [ ] Keyboard covers inputs → Add KeyboardAvoidingView
- [ ] Loading indicators work
- [ ] Error messages are clear
- [ ] Success messages appear
- [ ] Navigation doesn't break
- [ ] Back button works correctly
- [ ] Forms reset after submission
- [ ] No console errors or warnings

---

## 🎯 DAY 1-2 Completion Criteria

### ✅ Must Be Working:

1. [ ] User can register with phone & password
2. [ ] User can login and stay logged in
3. [ ] User auto-logs in on app restart
4. [ ] Owner can create organization
5. [ ] Employee can join organization
6. [ ] Organization data persists
7. [ ] Services can be added/edited/deleted
8. [ ] Employees can be added/edited/deleted
9. [ ] Work entries can be created
10. [ ] All data persists in AsyncStorage

### 📝 Deliverables:

- [ ] Working auth flow (login/register)
- [ ] Persistent sessions
- [ ] Complete OrgContext with CRUD
- [ ] Complete DataContext with CRUD
- [ ] Onboarding screens working
- [ ] All data saving to AsyncStorage
- [ ] 2-3 test accounts documented
- [ ] No critical bugs

---

## 📦 Files to Create/Complete

### New Files:

- [ ] `src/utils/mockPasswords.ts`
- [ ] `src/components/shared/PhoneInput.tsx` (if not exists)
- [ ] `src/components/shared/PasswordInput.tsx` (if not exists)

### Files to Complete:

- [ ] `src/context/AuthContext.tsx`
- [ ] `src/context/OrgContext.tsx`
- [ ] `src/context/DataContext.tsx`
- [ ] `src/screens/auth/LoginScreen.tsx`
- [ ] `src/screens/auth/RegisterScreen.tsx`
- [ ] `src/screens/onboarding/CreateOrgScreen.tsx`
- [ ] `src/screens/onboarding/JoinOrgScreen.tsx`
- [ ] `src/navigation/AuthNavigator.tsx`

---

## 🚀 Ready to Start!

**Next Message**: "Let's start with Task 1 - Auth Context Enhancement"

---

**Time Estimate**: 8-12 hours total (2 days)
**Priority**: HIGH - Foundation for all other features
**Dependencies**: None - Can start immediately
