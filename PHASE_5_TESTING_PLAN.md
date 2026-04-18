# Phase 5: End-to-End Testing Plan

**Status**: 🔄 IN PROGRESS
**Estimated Duration**: 4-6 hours
**Date**: February 2026

## Overview

Comprehensive end-to-end testing of the CutBook app before production deployment. This phase ensures all features work correctly with real Firebase data, handles edge cases, and provides a smooth user experience.

---

## Testing Environment Setup

### Prerequisites

- [ ] Device/Emulator ready (Android)
- [ ] Firebase project accessible (cutbook-47881)
- [ ] Test accounts ready:
  - Owner account: [Your test email]
  - Employee account 1: [Test employee 1]
  - Employee account 2: [Test employee 2]
- [ ] Internet connection (for online testing)
- [ ] Airplane mode available (for offline testing)

### Build & Install

```bash
# Clean build
cd android && ./gradlew clean && cd ..

# Development build
npx react-native run-android

# OR Release build for testing
cd android
./gradlew assembleRelease
# Install: android/app/build/outputs/apk/release/app-release.apk
```

---

## 1. OWNER FLOW TESTING (2-3 hours)

### 1.1 Authentication & Onboarding ✓

- [ ] **Sign Up**
  - [ ] Create new owner account with email/password
  - [ ] Verify email validation works
  - [ ] Check password requirements (min 6 chars)
  - [ ] Error handling for existing email

- [ ] **Login**
  - [ ] Login with correct credentials
  - [ ] Error handling for wrong password
  - [ ] Error handling for non-existent user
  - [ ] "Forgot Password" (if implemented)

- [ ] **Organization Setup**
  - [ ] Create new organization with name
  - [ ] Verify organization is created in Firebase
  - [ ] Navigate to owner dashboard after setup

### 1.2 Dashboard Screen ✓

- [ ] **Initial Load**
  - [ ] Loading spinner shows while fetching data
  - [ ] Empty state shows when no work entries
  - [ ] Correct date shows (today by default)

- [ ] **Daily Summary Card**
  - [ ] Total Revenue displays correctly (sum of all entries)
  - [ ] Total Tips displays correctly (sum of all tips)
  - [ ] Total Services count is accurate
  - [ ] Card updates when date changes

- [ ] **Employee Rankings**
  - [ ] Shows all employees who worked today
  - [ ] Revenue calculation per employee is correct
  - [ ] Sorting: highest revenue first
  - [ ] Shows "No data" when no entries for the date

- [ ] **Service Breakdown**
  - [ ] Lists all services performed today
  - [ ] Count per service is accurate
  - [ ] Revenue per service is correct

- [ ] **Date Picker**
  - [ ] Can select past dates
  - [ ] Dashboard updates with selected date's data
  - [ ] Can navigate to future dates (should be empty)
  - [ ] "Today" button resets to current date

- [ ] **Pull to Refresh**
  - [ ] Swipe down shows refresh indicator
  - [ ] Data reloads from Firebase
  - [ ] Loading state shows properly

### 1.3 Add Work Entry Screen ✓

- [ ] **Navigation**
  - [ ] "+" button opens Add Work Entry screen
  - [ ] Back button returns to dashboard

- [ ] **Employee Selection**
  - [ ] Dropdown shows all active employees
  - [ ] Can select an employee
  - [ ] Shows "No active employees" if none exist
  - [ ] Employee commission % displays

- [ ] **Service Selection**
  - [ ] Toggle between "Select Service" and "Custom Service"
  - [ ] **Select Service mode:**
    - [ ] Dropdown shows all active services
    - [ ] Auto-fills price when service selected
    - [ ] Shows default price from service
  - [ ] **Custom Service mode:**
    - [ ] Can type custom service name
    - [ ] Price field stays manual

- [ ] **Price & Tip**
  - [ ] Can enter price (numeric only)
  - [ ] Can enter tip (optional, numeric only)
  - [ ] Total amount calculates correctly
  - [ ] Currency symbol (৳) displays

- [ ] **Payment Method**
  - [ ] All 4 methods show: Cash, bKash, Card, Nagad
  - [ ] Can select one method (default: Cash)
  - [ ] Visual feedback on selection

- [ ] **Notes**
  - [ ] Can add optional notes
  - [ ] Multiline text works

- [ ] **Validation**
  - [ ] Error: No employee selected
  - [ ] Error: No service selected (when not using custom)
  - [ ] Error: No custom service name (when using custom)
  - [ ] Error: Invalid price (empty, 0, negative)
  - [ ] Error: Invalid tip (negative)

- [ ] **Submit**
  - [ ] Success alert shows with employee name and total
  - [ ] "Add Another" resets form
  - [ ] "Done" returns to dashboard
  - [ ] Entry appears in Firebase Firestore
  - [ ] Entry appears in dashboard immediately

- [ ] **Loading States**
  - [ ] Button shows "Adding Entry..." during save
  - [ ] Button disabled while saving
  - [ ] No double submission possible

### 1.4 Employees Management Screen ✓

- [ ] **Navigation**
  - [ ] Navigate from bottom tabs or settings

- [ ] **Employee List**
  - [ ] Shows all employees (active and inactive)
  - [ ] Displays: name, phone, commission %, status badge
  - [ ] Active badge (green) for active employees
  - [ ] Inactive badge (gray) for inactive employees
  - [ ] Avatar/initials display

- [ ] **Search Functionality**
  - [ ] Search by employee name works
  - [ ] Real-time filtering as you type
  - [ ] Case-insensitive search
  - [ ] Shows "No employees found" when no matches

- [ ] **Add Employee**
  - [ ] "+" button opens add employee form
  - [ ] Can enter: name, phone, email, commission %
  - [ ] Email validation works
  - [ ] Phone validation works
  - [ ] Commission % defaults to sensible value
  - [ ] Creates employee in Firebase
  - [ ] Employee appears in list immediately

- [ ] **Edit Employee**
  - [ ] Tap employee opens edit screen
  - [ ] All fields pre-filled with current data
  - [ ] Can modify all fields
  - [ ] Save updates Firebase
  - [ ] Changes reflect in list immediately

- [ ] **Toggle Active/Inactive**
  - [ ] Can toggle employee status
  - [ ] Status badge updates
  - [ ] Inactive employees don't show in Add Work Entry
  - [ ] Active employees show in Add Work Entry

- [ ] **Delete Employee** (if implemented)
  - [ ] Confirmation dialog shows
  - [ ] Employee removed from Firebase
  - [ ] Employee removed from list

- [ ] **Pull to Refresh**
  - [ ] Reloads employee list from Firebase

- [ ] **Empty State**
  - [ ] Shows when no employees exist
  - [ ] Helpful message to add first employee

### 1.5 Services Management Screen ✓

- [ ] **Navigation**
  - [ ] Navigate from bottom tabs or settings

- [ ] **Service List**
  - [ ] Grouped by category (Haircut, Styling, Coloring, etc.)
  - [ ] Shows: name, default price, active status
  - [ ] Active badge (green) for active services
  - [ ] Inactive badge (gray) for inactive services

- [ ] **Search Functionality**
  - [ ] Search by service name works
  - [ ] Real-time filtering as you type
  - [ ] Searches across all categories

- [ ] **Category Filtering**
  - [ ] Can filter by category
  - [ ] "All" shows all services
  - [ ] Category counts update

- [ ] **Add Service**
  - [ ] "+" button opens add service form
  - [ ] Can enter: name, category, default price, description
  - [ ] Category picker works
  - [ ] Price validation (must be positive)
  - [ ] Creates service in Firebase
  - [ ] Service appears in list immediately
  - [ ] Service appears in Add Work Entry dropdown

- [ ] **Edit Service**
  - [ ] Tap service opens edit screen
  - [ ] All fields pre-filled
  - [ ] Can modify all fields
  - [ ] Save updates Firebase
  - [ ] Changes reflect everywhere

- [ ] **Toggle Active/Inactive**
  - [ ] Can toggle service status
  - [ ] Status badge updates
  - [ ] Inactive services don't show in Add Work Entry
  - [ ] Active services show in Add Work Entry

- [ ] **Delete Service** (if implemented)
  - [ ] Confirmation dialog shows
  - [ ] Service removed from Firebase

- [ ] **Pull to Refresh**
  - [ ] Reloads service list from Firebase

### 1.6 Work Entry Details (if implemented)

- [ ] View full entry details
- [ ] Edit existing entry
- [ ] Delete entry with confirmation
- [ ] Changes sync to Firebase

---

## 2. EMPLOYEE FLOW TESTING (2-3 hours)

### 2.1 Employee Login ✓

- [ ] **Login**
  - [ ] Employee can login with their credentials
  - [ ] Redirects to Employee Home screen
  - [ ] Cannot access owner features

### 2.2 Employee Home Screen ✓

- [ ] **Initial Load**
  - [ ] Loading spinner shows while fetching
  - [ ] Shows today's date

- [ ] **Today's Summary Card**
  - [ ] Total Earned: sum of employee's entries (price only)
  - [ ] Tips Earned: sum of employee's tips
  - [ ] Services Done: count of employee's entries today
  - [ ] Calculates from real Firebase data
  - [ ] Only shows current employee's data

- [ ] **Recent Entries**
  - [ ] Shows today's work entries for employee
  - [ ] Displays: service name, price, tip, payment method, time
  - [ ] Sorted by newest first
  - [ ] Shows "No services yet" when empty
  - [ ] Only employee's own entries (not other employees)

- [ ] **Pull to Refresh**
  - [ ] Swipe down reloads data
  - [ ] Summary updates
  - [ ] Entry list updates

- [ ] **Real-time Updates**
  - [ ] When owner adds entry for this employee
  - [ ] Entry appears in list (after refresh)
  - [ ] Summary updates

### 2.3 Employee History Screen ✓

- [ ] **Navigation**
  - [ ] Navigate from bottom tabs

- [ ] **Initial Load**
  - [ ] Loading spinner shows
  - [ ] Shows current month by default

- [ ] **Monthly Summary**
  - [ ] Displays selected month and year
  - [ ] Total earned in month (price + tips)
  - [ ] Number of services in month
  - [ ] Calculates correctly from filtered data

- [ ] **Month Selector**
  - [ ] Tap month opens month picker modal
  - [ ] Shows last 12 months
  - [ ] Can select different month
  - [ ] Entry list updates for selected month
  - [ ] Summary recalculates for selected month

- [ ] **Entry List**
  - [ ] Shows all entries for selected month
  - [ ] Only employee's own entries
  - [ ] Displays: service, price, tip, payment method, date, time
  - [ ] Sorted by date (newest first)
  - [ ] Shows "No services found" when empty

- [ ] **Pull to Refresh**
  - [ ] Reloads data for current month

- [ ] **Data Isolation**
  - [ ] Employee sees ONLY their own entries
  - [ ] Cannot see other employees' data

### 2.4 Employee Profile Screen ✓

- [ ] **Profile Display**
  - [ ] Shows employee name
  - [ ] Shows email
  - [ ] Shows phone
  - [ ] Shows commission percentage
  - [ ] Shows organization name

- [ ] **Statistics** (if implemented)
  - [ ] Total services all-time
  - [ ] Total earned all-time
  - [ ] Average per service

- [ ] **Logout**
  - [ ] Logout button works
  - [ ] Returns to login screen
  - [ ] Clears session data

---

## 3. DATA PERSISTENCE TESTING (1 hour)

### 3.1 Create Test Data

- [ ] **As Owner:**
  - [ ] Add 3+ employees with different commission rates
  - [ ] Add 10+ services across different categories
  - [ ] Add 15+ work entries spanning multiple days
  - [ ] Use all payment methods
  - [ ] Add entries with and without tips
  - [ ] Add entries with custom services

### 3.2 Verify Data Persistence

- [ ] **Close and Reopen App**
  - [ ] All employees still present
  - [ ] All services still present
  - [ ] All work entries still present
  - [ ] Dashboard calculations still correct

- [ ] **Check Firebase Console**
  - [ ] Navigate to Firebase Firestore
  - [ ] Verify `organizations` collection has your org
  - [ ] Verify `users` collection has all employees
  - [ ] Verify `services` collection has all services
  - [ ] Verify `workEntries` collection has all entries
  - [ ] Check data structure matches types

### 3.3 Data Integrity

- [ ] **Timestamps**
  - [ ] createdAt is set correctly
  - [ ] updatedAt updates on edit
  - [ ] Dates are stored as Firebase Timestamps

- [ ] **References**
  - [ ] orgId matches across collections
  - [ ] employeeId references correct user
  - [ ] serviceId references correct service (when not custom)

- [ ] **Calculations**
  - [ ] Dashboard totals match sum of entries
  - [ ] Employee totals match their entries
  - [ ] Service counts are accurate

---

## 4. OFFLINE MODE TESTING (1 hour)

### 4.1 Offline Behavior

- [ ] **Turn on Airplane Mode**
  - [ ] App continues to function
  - [ ] Shows cached data
  - [ ] Appropriate offline indicators (if implemented)

- [ ] **Read Operations**
  - [ ] Can view dashboard with cached data
  - [ ] Can view employees list
  - [ ] Can view services list
  - [ ] Can view history

- [ ] **Write Operations**
  - [ ] Add work entry while offline
  - [ ] Check if queued or shows error
  - [ ] Add employee while offline
  - [ ] Check behavior

- [ ] **Reconnect**
  - [ ] Turn off Airplane Mode
  - [ ] Wait for reconnection
  - [ ] Check if queued operations sync
  - [ ] Verify data in Firebase Console

### 4.2 Network Error Handling

- [ ] **Poor Connection**
  - [ ] Test with slow 3G/2G
  - [ ] Loading states show appropriately
  - [ ] Timeouts handled gracefully

- [ ] **Connection Loss During Operation**
  - [ ] Start adding entry, turn off wifi
  - [ ] Check error message
  - [ ] Check if data is lost or saved locally

---

## 5. EDGE CASES & ERROR HANDLING (1 hour)

### 5.1 Empty States

- [ ] Dashboard with no entries
- [ ] Employees list with no employees
- [ ] Services list with no services
- [ ] History with no entries for month
- [ ] Search with no results

### 5.2 Large Data Sets

- [ ] Add 50+ work entries
- [ ] Check performance
- [ ] Check scrolling smoothness
- [ ] Check if lists paginate (if implemented)

### 5.3 Special Characters

- [ ] Employee name with emojis
- [ ] Service name with special characters
- [ ] Notes with long text
- [ ] Prices with decimals

### 5.4 Invalid Inputs

- [ ] Very large price (999999)
- [ ] Very large tip
- [ ] Very long names (100+ chars)
- [ ] Empty required fields

### 5.5 Concurrent Operations

- [ ] Add entry on owner device
- [ ] Check if appears on employee device (after refresh)
- [ ] Edit employee on one device
- [ ] Check updates on another device

### 5.6 Permission Tests

- [ ] Employee tries to access owner routes (should fail)
- [ ] Employee tries to see other employees' data (should fail)
- [ ] Verify Firebase security rules work

---

## 6. UI/UX TESTING (30 minutes)

### 6.1 Visual Polish

- [ ] All text is readable
- [ ] Colors are consistent with theme
- [ ] Icons display correctly
- [ ] No UI overflow or cut-off text
- [ ] Proper spacing and alignment

### 6.2 Navigation

- [ ] Bottom tabs work (if implemented)
- [ ] Back buttons work consistently
- [ ] Modal dismissal works (tap outside, back button)
- [ ] Deep navigation doesn't break

### 6.3 Responsiveness

- [ ] Test on different screen sizes
- [ ] Landscape mode (if supported)
- [ ] Keyboard doesn't cover inputs
- [ ] ScrollViews work properly

### 6.4 Feedback

- [ ] Loading spinners show for async operations
- [ ] Success messages for completed actions
- [ ] Error messages are clear and helpful
- [ ] Pull-to-refresh animations smooth

---

## 7. PERFORMANCE TESTING (30 minutes)

### 7.1 App Performance

- [ ] App startup time < 3 seconds
- [ ] Screen transitions are smooth
- [ ] No janky scrolling
- [ ] No memory leaks (test extended usage)

### 7.2 Data Loading

- [ ] Dashboard loads < 2 seconds
- [ ] Lists load < 1 second
- [ ] Image loading (if any)
- [ ] Firebase queries optimized

### 7.3 Memory Usage

- [ ] Check memory usage in development
- [ ] No crashes after extended use
- [ ] No zombie listeners

---

## 8. SECURITY TESTING (30 minutes)

### 8.1 Authentication

- [ ] Cannot access app without login
- [ ] Session persists properly
- [ ] Logout clears session
- [ ] Cannot spoof user ID

### 8.2 Data Access

- [ ] Employee cannot see other employees' detailed entries
- [ ] Employee cannot access owner features
- [ ] Cannot access data from other organizations
- [ ] Firebase rules prevent unauthorized access

### 8.3 Input Sanitization

- [ ] SQL injection attempts fail (N/A for Firebase)
- [ ] XSS attempts fail
- [ ] Script injection in text fields

---

## BUG TRACKING

### Critical Bugs 🔴

| #   | Description | Steps to Reproduce | Status | Fix |
| --- | ----------- | ------------------ | ------ | --- |
| 1   |             |                    | ⏳     |     |

### Major Bugs 🟡

| #   | Description | Steps to Reproduce | Status | Fix |
| --- | ----------- | ------------------ | ------ | --- |
| 1   |             |                    | ⏳     |     |

### Minor Bugs 🟢

| #   | Description | Steps to Reproduce | Status | Fix |
| --- | ----------- | ------------------ | ------ | --- |
| 1   |             |                    | ⏳     |     |

---

## TEST RESULTS SUMMARY

### Overall Status: ⏳ IN PROGRESS

**Completion**: 0/8 sections tested

| Section             | Status | Pass Rate | Time |
| ------------------- | ------ | --------- | ---- |
| 1. Owner Flow       | ⏳     | 0/6       | -    |
| 2. Employee Flow    | ⏳     | 0/4       | -    |
| 3. Data Persistence | ⏳     | 0/3       | -    |
| 4. Offline Mode     | ⏳     | 0/2       | -    |
| 5. Edge Cases       | ⏳     | 0/6       | -    |
| 6. UI/UX            | ⏳     | 0/4       | -    |
| 7. Performance      | ⏳     | 0/3       | -    |
| 8. Security         | ⏳     | 0/3       | -    |

---

## NEXT STEPS

After testing is complete:

1. **Fix All Critical Bugs** 🔴
   - Blockers that prevent core functionality
   - Must be fixed before launch

2. **Fix Major Bugs** 🟡
   - Issues that affect user experience
   - Should be fixed before launch

3. **Document Minor Bugs** 🟢
   - Can be fixed in post-launch updates
   - Add to backlog

4. **Create Production Build**
   - Clean build for release
   - Sign with release keystore
   - Generate AAB for Play Store

5. **Prepare Store Listing**
   - Screenshots
   - Description
   - Privacy Policy
   - App icons

6. **Phase 6: Production Deployment**

---

## TESTING TIPS

### How to Test Efficiently

1. **Start Fresh**: Uninstall app, clear Firebase data, start with clean slate
2. **Test Methodically**: Follow checklist section by section
3. **Document Everything**: Take screenshots of bugs
4. **Use Real Scenarios**: Test like a real salon would use the app
5. **Test Both Roles**: Switch between owner and employee accounts
6. **Check Firebase**: Verify data in Firebase Console regularly
7. **Test Edge Cases**: Try to break the app with unusual inputs
8. **Performance Matters**: If something feels slow, it is slow

### Testing Commands

```bash
# Clear app data (Android)
adb shell pm clear com.cutbook

# View logs
npx react-native log-android

# Check Firebase data
# Visit: https://console.firebase.google.com/project/cutbook-47881/firestore

# Monitor network requests
# Use React Native Debugger or Flipper
```

---

_Ready to begin Phase 5 testing! Follow this checklist methodically and document all findings._
