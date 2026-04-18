# Phase 5 Testing - Quick Start Guide

## 🚀 Quick Start: Begin Testing in 5 Minutes

### Step 1: Build & Install (2 minutes)

```bash
# Clean previous build
cd android && ./gradlew clean && cd ..

# Install development build on device/emulator
npx react-native run-android
```

### Step 2: Prepare Test Data (2 minutes)

Run this script or manually create:

- **2-3 test employees** with different commission rates (10%, 15%, 20%)
- **5-10 test services** across different categories
- **5+ work entries** for today

### Step 3: Begin Testing (1 minute)

Open `PHASE_5_TESTING_PLAN.md` and start checking items!

---

## 📋 Critical Test Paths (Must Pass)

### Path 1: Owner Adds Work Entry (5 min)

```
1. Login as owner
2. View dashboard (should load)
3. Tap "+" to add work entry
4. Select employee
5. Select service (check price auto-fills)
6. Enter tip
7. Select payment method
8. Submit
9. Verify appears on dashboard
10. Check Firebase Console has entry
```

**Expected**: Entry created, dashboard updates, Firebase has data
**Status**: [ ] PASS [ ] FAIL

---

### Path 2: Employee Views Their Data (5 min)

```
1. Login as employee
2. View home screen
3. Check today's summary is correct
4. View recent entries (only this employee's)
5. Navigate to History
6. Check monthly summary
7. Change month
8. Verify data updates
```

**Expected**: Employee sees only their data, calculations correct
**Status**: [ ] PASS [ ] FAIL

---

### Path 3: Data Persistence (3 min)

```
1. Add 3 work entries
2. Force close app
3. Reopen app
4. Check all entries still present
5. Check Firebase Console
```

**Expected**: All data persists after restart
**Status**: [ ] PASS [ ] FAIL

---

### Path 4: Offline Mode (3 min)

```
1. View dashboard (loads data)
2. Enable Airplane Mode
3. Navigate around app
4. Try to add entry
5. Disable Airplane Mode
6. Check if data syncs
```

**Expected**: App shows cached data, handles offline gracefully
**Status**: [ ] PASS [ ] FAIL

---

## 🐛 Common Issues to Watch For

### Issue 1: Mock Data Still Showing

**Symptoms**: Fake entries appear in lists
**Check**:

- [ ] EmployeeHomeScreen
- [ ] HistoryScreen
- [ ] DashboardScreen
      **Fix**: Should be fixed in Phase 4, verify no mock data

### Issue 2: Wrong Employee Data

**Symptoms**: Employee sees other employees' entries
**Check**:

- [ ] History screen filters by employeeId
- [ ] Home screen filters by employeeId
      **Fix**: Verify `myEntries` filter in both screens

### Issue 3: Dashboard Not Updating

**Symptoms**: New entries don't appear on dashboard
**Check**:

- [ ] useDailySummary hook uses real workEntries
- [ ] refreshData() is called
      **Fix**: Should be fixed in Phase 4, verify hook connection

### Issue 4: Empty States Not Showing

**Symptoms**: Blank screen when no data
**Check**:

- [ ] ListEmptyComponent rendered
- [ ] Conditional rendering works
      **Fix**: Verify loading && data.length === 0 logic

### Issue 5: Loading States Missing

**Symptoms**: App appears frozen during data fetch
**Check**:

- [ ] ActivityIndicator shows
- [ ] Loading text displays
      **Fix**: Verify loading state from useData()

---

## 🔍 Quick Debug Commands

### View App Logs

```bash
# Android logs
npx react-native log-android

# Filter for errors only
npx react-native log-android | grep -i error

# Filter for your console.log
npx react-native log-android | grep -i "work entry"
```

### Clear App Data (Start Fresh)

```bash
# Clear all app data and cache
adb shell pm clear com.cutbook

# Then rebuild
npx react-native run-android
```

### Check Firebase Data

```bash
# Open Firebase Console in browser
open https://console.firebase.google.com/project/cutbook-47881/firestore
```

### Restart Metro Bundler

```bash
# Stop current process (Ctrl+C)
# Then restart
npx react-native start --reset-cache
```

---

## 📊 Test Data Templates

### Test Employees

```
Employee 1:
- Name: Ahmed Hassan
- Email: ahmed@test.com
- Phone: +880 1711-123456
- Commission: 15%

Employee 2:
- Name: Sara Rahman
- Email: sara@test.com
- Phone: +880 1711-234567
- Commission: 20%

Employee 3:
- Name: Karim Ali
- Email: karim@test.com
- Phone: +880 1711-345678
- Commission: 10%
```

### Test Services

```
Haircut Category:
- Regular Haircut - ৳300
- Premium Haircut - ৳500
- Kids Haircut - ৳200

Styling Category:
- Hair Styling - ৳400
- Beard Trim - ৳150
- Shave - ৳100

Coloring Category:
- Full Color - ৳2000
- Highlights - ৳1500
- Touch Up - ৳800
```

### Test Work Entries

```
Today's Entries:
1. Ahmed Hassan - Regular Haircut - ৳300 - Tip: ৳50 - Cash
2. Sara Rahman - Premium Haircut - ৳500 - Tip: ৳100 - bKash
3. Ahmed Hassan - Beard Trim - ৳150 - Tip: ৳0 - Card
4. Karim Ali - Hair Styling - ৳400 - Tip: ৳50 - Nagad
5. Sara Rahman - Full Color - ৳2000 - Tip: ৳200 - Cash

Expected Dashboard Totals:
- Total Revenue: ৳3,350
- Total Tips: ৳400
- Total Services: 5

Expected Ahmed Hassan (Employee view):
- Total Earned: ৳450 (service only)
- Tips: ৳50
- Services: 2
```

---

## ✅ Testing Checklist - Priority Order

### 🔴 CRITICAL (Must work for launch)

- [ ] Owner can add work entry
- [ ] Entries save to Firebase
- [ ] Dashboard shows correct totals
- [ ] Employee sees only their data
- [ ] Data persists after app restart
- [ ] No mock data appears
- [ ] Authentication works
- [ ] No app crashes

### 🟡 IMPORTANT (Should work for launch)

- [ ] Pull to refresh works
- [ ] Search works in all lists
- [ ] Editing employees works
- [ ] Editing services works
- [ ] Date picker works
- [ ] Month picker works
- [ ] All payment methods work
- [ ] Validation shows helpful errors
- [ ] Loading states show everywhere

### 🟢 NICE TO HAVE (Can fix post-launch)

- [ ] Offline mode queues operations
- [ ] Performance is excellent
- [ ] Animations are smooth
- [ ] Empty states are beautiful
- [ ] Error messages are perfect
- [ ] All edge cases handled

---

## 🎯 Success Criteria

Phase 5 is complete when:

1. ✅ All CRITICAL items pass
2. ✅ 90%+ of IMPORTANT items pass
3. ✅ No critical bugs found
4. ✅ No major bugs blocking launch
5. ✅ App tested on at least 2 devices
6. ✅ Firebase data integrity verified
7. ✅ Both owner and employee flows work
8. ✅ Documentation updated with any known issues

---

## 📝 Bug Report Template

When you find a bug, document it like this:

```markdown
## Bug #X: [Short Description]

**Severity**: 🔴 Critical / 🟡 Major / 🟢 Minor

**Description**:
What happened that shouldn't have happened?

**Steps to Reproduce**:

1. Step one
2. Step two
3. Step three

**Expected Behavior**:
What should happen?

**Actual Behavior**:
What actually happened?

**Screenshots**:
[Attach if helpful]

**Device**: Android X / iOS X
**App Version**: X.X.X

**Console Errors**:
```

[Paste relevant errors]

```

**Firebase Data**:
[Screenshot of relevant Firestore data]

**Status**: ⏳ Open / 🔧 In Progress / ✅ Fixed
```

---

## 🚦 Quick Status Check

Before you begin, verify:

- [ ] Device/Emulator is running
- [ ] App is installed and opens
- [ ] You have owner login credentials
- [ ] You have employee login credentials
- [ ] Firebase Console is accessible
- [ ] You have 2-3 hours available
- [ ] You have `PHASE_5_TESTING_PLAN.md` open

**Ready to test?** Start with Path 1: Owner Adds Work Entry!

---

_Good luck testing! Remember: Every bug you find now is one less bug in production!_ 🐛🔨
