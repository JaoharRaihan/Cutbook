# 🧪 CutBook Testing Checklist

**Project:** CutBook - Barber/Salon Management App  
**Testing Phase:** 19 - QA & Refinement  
**Date:** December 13, 2025  
**Status:** In Progress

---

## 📋 Step 19.1: Manual Testing Checklist

### ✅ Navigation Flows

#### Auth Navigation
- [ ] **Splash Screen**
  - [ ] Logo displays correctly
  - [ ] Animates smoothly
  - [ ] Navigates to Login if not authenticated
  - [ ] Navigates to Dashboard if authenticated
  - [ ] Loading state shows while checking auth

- [ ] **Login Screen**
  - [ ] Phone input accepts valid formats
  - [ ] Password input toggles visibility
  - [ ] Validation errors display correctly
  - [ ] "Login" button shows loading state
  - [ ] Mock login succeeds with delay
  - [ ] Navigates to Dashboard on success
  - [ ] "Register" link navigates correctly
  - [ ] Keyboard dismisses on submit

- [ ] **Register Screen**
  - [ ] All form fields validate properly
  - [ ] Role selector works (Owner/Employee)
  - [ ] Password confirmation matches
  - [ ] Registration succeeds
  - [ ] Navigates to onboarding/dashboard
  - [ ] Form clears on success

#### Onboarding Navigation (Owner)
- [ ] **Create Organization**
  - [ ] Form validation works
  - [ ] Organization created successfully
  - [ ] Navigates to Dashboard
  - [ ] Data persists in AsyncStorage

- [ ] **Join Organization**
  - [ ] Org code input works
  - [ ] Mock join logic succeeds
  - [ ] Navigates to Dashboard
  - [ ] Org data loads correctly

#### Owner Navigation (Bottom Tabs)
- [ ] **Tab 1: Dashboard**
  - [ ] Dashboard loads correctly
  - [ ] Navigates to Work Entry Detail
  - [ ] Navigates to Reports
  - [ ] Back navigation works
  - [ ] Tab icon highlights when active

- [ ] **Tab 2: Employees**
  - [ ] Employee List loads
  - [ ] Navigates to Add Employee
  - [ ] Navigates to Employee Detail
  - [ ] Navigates to Edit Employee
  - [ ] Back button works on all screens

- [ ] **Tab 3: Services**
  - [ ] Service List loads
  - [ ] Navigates to Add Service
  - [ ] Navigates to Edit Service
  - [ ] SectionList grouping works
  - [ ] Back navigation works

- [ ] **Tab 4: Settings**
  - [ ] Settings screen loads
  - [ ] Navigates to Organization Settings
  - [ ] Language toggle works
  - [ ] Logout navigates to Login

#### Employee Navigation (Bottom Tabs)
- [ ] **Tab 1: Home**
  - [ ] Today's summary displays
  - [ ] Recent entries list shows
  - [ ] "View All History" navigates correctly

- [ ] **Tab 2: History**
  - [ ] History list loads (filtered by employee)
  - [ ] Month selector works
  - [ ] Entry detail navigation works
  - [ ] Monthly total calculates correctly

- [ ] **Tab 3: Profile**
  - [ ] Profile info displays
  - [ ] Stats calculate correctly
  - [ ] Logout works

---

### ✅ Form Validation

#### Login/Register Forms
- [ ] **Phone Number**
  - [ ] Required field validation
  - [ ] Format validation (+880...)
  - [ ] Error message displays
  - [ ] Clears on valid input

- [ ] **Password**
  - [ ] Required field validation
  - [ ] Minimum length validation (6+ chars)
  - [ ] Show/hide toggle works
  - [ ] Confirmation matches (register)

- [ ] **Email**
  - [ ] Optional field handling
  - [ ] Format validation
  - [ ] Error message displays

#### Work Entry Form
- [ ] **Employee Selection**
  - [ ] Required field validation
  - [ ] Dropdown shows all employees
  - [ ] Search/filter works

- [ ] **Service Selection**
  - [ ] Dropdown works
  - [ ] Custom service input shows if needed
  - [ ] Service name required if custom

- [ ] **Price Input**
  - [ ] Required field validation
  - [ ] Numeric keyboard shows
  - [ ] Must be positive number
  - [ ] Formats as currency (৳)

- [ ] **Tip Input**
  - [ ] Optional field
  - [ ] Numeric keyboard
  - [ ] Accepts zero

- [ ] **Payment Method**
  - [ ] All options selectable (Cash, bKash, Card, Other)
  - [ ] One must be selected
  - [ ] Badge displays correctly

#### Employee Form
- [ ] **Name**
  - [ ] Required validation
  - [ ] Min length validation (2 chars)

- [ ] **Phone**
  - [ ] Required validation
  - [ ] Format validation
  - [ ] Duplicate check

- [ ] **Commission**
  - [ ] Numeric input
  - [ ] Percentage validation (0-100)
  - [ ] Displays with % symbol

#### Service Form
- [ ] **Service Name**
  - [ ] Required validation
  - [ ] Min length validation

- [ ] **Category**
  - [ ] Required selection
  - [ ] All categories available

- [ ] **Default Price**
  - [ ] Optional field
  - [ ] Numeric validation
  - [ ] Positive number check

---

### ✅ Mock Data Persistence

#### AsyncStorage Tests
- [ ] **Auth State**
  - [ ] Login persists after app restart
  - [ ] Auth token stored correctly
  - [ ] User data retrieved on load
  - [ ] Logout clears storage

- [ ] **Organization Data**
  - [ ] Current org persists
  - [ ] Org users persist
  - [ ] Org services persist
  - [ ] Changes save immediately

- [ ] **Work Entries**
  - [ ] New entries persist
  - [ ] Updated entries persist
  - [ ] Deleted entries removed
  - [ ] List reflects changes immediately

- [ ] **Daily Summaries**
  - [ ] Generated summaries persist
  - [ ] Recalculate on entry changes
  - [ ] Date ranges work correctly

- [ ] **Language Preference**
  - [ ] Selected language persists
  - [ ] Loads on app start
  - [ ] All translations display correctly

- [ ] **App State**
  - [ ] Close app → Reopen
  - [ ] Kill app → Relaunch
  - [ ] All data intact
  - [ ] No data loss

---

### ✅ Responsive Design

#### Screen Sizes
- [ ] **Small Phones** (iPhone SE, Android 5")
  - [ ] All text readable
  - [ ] Buttons not cramped
  - [ ] Lists scroll properly
  - [ ] Forms fit on screen

- [ ] **Standard Phones** (iPhone 13, Android 6")
  - [ ] Layout balanced
  - [ ] Cards display nicely
  - [ ] Spacing appropriate

- [ ] **Large Phones** (iPhone 14 Pro Max, Android 6.5"+)
  - [ ] Content not stretched
  - [ ] Good use of space
  - [ ] No excessive whitespace

- [ ] **Tablets** (iPad, Android tablets)
  - [ ] Layout adapts (if applicable)
  - [ ] Cards max-width applied
  - [ ] Readable on large screens

#### Orientation
- [ ] **Portrait Mode**
  - [ ] All screens work
  - [ ] Primary orientation

- [ ] **Landscape Mode** (Optional)
  - [ ] Graceful degradation
  - [ ] Or locked to portrait

---

### ✅ Owner vs Employee Views

#### Access Control (Mock)
- [ ] **Owner Access**
  - [ ] Can see all screens
  - [ ] Can add employees
  - [ ] Can add services
  - [ ] Can add work entries
  - [ ] Can edit/delete entries
  - [ ] Can view all reports

- [ ] **Employee Access**
  - [ ] Limited to own data
  - [ ] Cannot access employee management
  - [ ] Cannot access service management
  - [ ] Cannot see other employees' data
  - [ ] Can only view own history
  - [ ] Cannot access org settings

#### UI Differences
- [ ] **Owner Dashboard**
  - [ ] Shows org-wide stats
  - [ ] Shows all employees
  - [ ] Has management buttons

- [ ] **Employee Home**
  - [ ] Shows personal stats only
  - [ ] Shows own entries
  - [ ] No management options

---

### ✅ Button/Action Feedback

#### Interactive Elements
- [ ] **Buttons**
  - [ ] Press feedback (opacity change)
  - [ ] Loading states show spinner
  - [ ] Disabled state visible
  - [ ] Success animation (if any)

- [ ] **FAB (Floating Action Button)**
  - [ ] Hover effect works
  - [ ] Press animation smooth
  - [ ] Opens correct screen
  - [ ] Positioned correctly

- [ ] **List Items**
  - [ ] Press highlights item
  - [ ] Navigates on tap
  - [ ] Long press (if applicable)

- [ ] **Form Inputs**
  - [ ] Focus highlights border
  - [ ] Error state shows red
  - [ ] Success state (if any)
  - [ ] Clear button works

#### Feedback Types
- [ ] **Toast Notifications**
  - [ ] Success messages show
  - [ ] Error messages show
  - [ ] Auto-dismiss after 3s
  - [ ] Positioned correctly

- [ ] **Loading States**
  - [ ] Spinners show during actions
  - [ ] Skeleton loaders for lists
  - [ ] Pull-to-refresh works
  - [ ] No janky animations

- [ ] **Confirmation Dialogs**
  - [ ] Show before destructive actions
  - [ ] "Are you sure?" text clear
  - [ ] Cancel/Confirm buttons work
  - [ ] Dialog dismisses properly

---

## 📋 Step 19.2: Edge Cases

### Empty State Handling

- [ ] **No Employees**
  - [ ] Empty state displays
  - [ ] Friendly message shows
  - [ ] "Add Employee" CTA visible
  - [ ] Illustration/icon present

- [ ] **No Services**
  - [ ] Empty state displays
  - [ ] "Add Service" CTA works
  - [ ] Message explains next step

- [ ] **No Work Entries**
  - [ ] Empty state for today
  - [ ] Empty state for history
  - [ ] Empty state for date range
  - [ ] "Add Entry" CTA visible

- [ ] **Search No Results**
  - [ ] "No results found" message
  - [ ] Clear search button
  - [ ] Suggestions (if any)

### Long Text Overflow

- [ ] **Names**
  - [ ] Long employee names truncate with ellipsis
  - [ ] Long org names don't break layout
  - [ ] Long service names wrap properly

- [ ] **Service Names**
  - [ ] Very long service names (30+ chars)
  - [ ] Multi-word service names
  - [ ] Special characters handled

- [ ] **Notes/Comments**
  - [ ] Long notes in work entries
  - [ ] Scrollable or truncated
  - [ ] "Read more" if applicable

- [ ] **Bengali Text**
  - [ ] Bengali characters render correctly
  - [ ] Mixed English/Bengali text
  - [ ] Longer Bengali translations

### Large Lists (100+ Entries)

- [ ] **Performance**
  - [ ] FlatList/SectionList optimized
  - [ ] Smooth scrolling (60fps)
  - [ ] No lag on scroll
  - [ ] Memory usage reasonable

- [ ] **Pagination** (if implemented)
  - [ ] Load more on scroll
  - [ ] Loading indicator at bottom
  - [ ] No duplicate items

- [ ] **Search/Filter**
  - [ ] Fast search with debounce
  - [ ] Filter updates quickly
  - [ ] Clear filter works

### Date Edge Cases

- [ ] **Month Boundaries**
  - [ ] Last day of month
  - [ ] First day of month
  - [ ] Month transition (e.g., Jan 31 → Feb 1)
  - [ ] Leap year Feb 29

- [ ] **Year Boundaries**
  - [ ] Dec 31 → Jan 1
  - [ ] Year changes correctly

- [ ] **Time Zones**
  - [ ] Dates display in correct timezone
  - [ ] Timezone selector works
  - [ ] Consistent across app

- [ ] **Bengali Calendar**
  - [ ] Bengali month names correct
  - [ ] Bengali numerals in dates
  - [ ] Date formatting consistent

### Number Edge Cases

- [ ] **Zero Values**
  - [ ] Price: ৳0 displays correctly
  - [ ] Tip: ৳0 allowed
  - [ ] Zero entries today
  - [ ] Zero commission

- [ ] **Very Large Numbers**
  - [ ] 1,000,000+ (৳10L)
  - [ ] 10,000,000+ (৳1Cr)
  - [ ] Short format works
  - [ ] No number overflow

- [ ] **Decimals**
  - [ ] 2 decimal places max
  - [ ] Rounds correctly
  - [ ] No floating point errors
  - [ ] Bengali decimal separator (if any)

- [ ] **Negative Numbers** (Should Not Happen)
  - [ ] Validation prevents negatives
  - [ ] If somehow entered, handled gracefully

### Payment Method Edge Cases

- [ ] **All Payment Types**
  - [ ] Cash only entries
  - [ ] bKash only entries
  - [ ] Card only entries
  - [ ] "Other" entries
  - [ ] Mixed payment methods in list

- [ ] **Summary Calculations**
  - [ ] Total cash accurate
  - [ ] Total bKash accurate
  - [ ] Total card accurate
  - [ ] Sum equals total income

### Commission Edge Cases

- [ ] **Different Commission Rates**
  - [ ] 0% commission
  - [ ] 50% commission
  - [ ] 100% commission
  - [ ] Decimal percentages (15.5%)

- [ ] **Fixed vs Percentage**
  - [ ] Toggle between modes works
  - [ ] Calculations correct for each

### Language Switching

- [ ] **During Use**
  - [ ] Switch language mid-session
  - [ ] All text updates immediately
  - [ ] No layout breaks
  - [ ] Bengali numerals convert

- [ ] **Form Input**
  - [ ] Can type in Bengali
  - [ ] Can type in English
  - [ ] Numbers in both languages
  - [ ] Validation works for both

### Network Errors (Future API)

- [ ] **Mock Offline Mode**
  - [ ] "Offline" indicator shows
  - [ ] Local data accessible
  - [ ] "Sync pending" message
  - [ ] Mock sync animation

---

## 🐛 Known Issues & Workarounds

### Issue Tracker

| Issue | Severity | Status | Workaround |
|-------|----------|--------|------------|
| _Example: Long names overflow on small screens_ | Low | Open | Truncate with ellipsis |
| | | | |
| | | | |

---

## 📊 Testing Results Summary

### Test Coverage

- **Total Test Cases:** ~150+
- **Passed:** ___
- **Failed:** ___
- **Skipped:** ___
- **Coverage:** ___%

### Critical Bugs Found

1. _None yet_

### Nice-to-Have Improvements

1. _To be added during testing_

---

## ✅ Sign-Off

- [ ] All critical navigation flows tested
- [ ] All forms validated
- [ ] Data persistence verified
- [ ] Responsive on multiple devices
- [ ] Owner/Employee views distinct
- [ ] All buttons/actions have feedback
- [ ] Empty states handled
- [ ] Edge cases tested
- [ ] Performance acceptable
- [ ] Ready for Phase 20 (Build)

**Tested By:** _______________  
**Date:** _______________  
**Approved By:** _______________  
**Date:** _______________

---

## 📝 Notes

- This is a **mock/frontend-only** app, so no real API testing
- Focus on **UX, UI consistency, and data flow**
- **AsyncStorage** is the only persistence layer
- **Performance** should be tested on real devices, not just simulators
