# 📋 Phase 5 Testing - Quick Checklist

Print this or keep it open while testing!

---

## 🚀 SETUP (15 minutes)

- [ ] Run pre-flight check: `./scripts/preflight-check.sh` ✅ DONE
- [ ] Build app: `npx react-native run-android`
- [ ] App opens successfully
- [ ] Create 3 test employees
- [ ] Create 8-10 test services
- [ ] Create 5+ work entries for today

---

## ⭐ CRITICAL PATHS (20 minutes)

### Path 1: Owner Adds Work Entry

- [ ] Login as owner
- [ ] Dashboard loads
- [ ] Tap "+" button
- [ ] Select employee
- [ ] Select service
- [ ] Price auto-fills
- [ ] Enter tip
- [ ] Select payment method
- [ ] Submit
- [ ] Success message shows
- [ ] Entry appears on dashboard
- [ ] Entry in Firebase Console

### Path 2: Employee Views Data

- [ ] Login as employee
- [ ] Home screen loads
- [ ] Today's summary correct
- [ ] Shows only this employee's entries
- [ ] Navigate to History
- [ ] Monthly summary correct
- [ ] Change month
- [ ] Data updates
- [ ] Only employee's data shown

### Path 3: Data Persistence

- [ ] Add 3 work entries
- [ ] Force close app
- [ ] Reopen app
- [ ] All entries present
- [ ] Dashboard totals correct
- [ ] Check Firebase Console

### Path 4: Offline Mode

- [ ] Load dashboard
- [ ] Enable Airplane Mode
- [ ] Navigate app (shows cached data)
- [ ] Try to add entry
- [ ] Disable Airplane Mode
- [ ] Check if syncs

**All 4 paths must pass!** ✅

---

## 👤 OWNER FLOW (2-3 hours)

### Dashboard

- [ ] Loading spinner shows
- [ ] Total revenue correct
- [ ] Total tips correct
- [ ] Service count correct
- [ ] Employee rankings correct
- [ ] Service breakdown correct
- [ ] Date picker works
- [ ] Pull to refresh works
- [ ] Empty state (no entries)

### Add Work Entry

- [ ] Employee dropdown works
- [ ] Service dropdown works
- [ ] Custom service works
- [ ] Price validation works
- [ ] Tip optional
- [ ] Payment methods all work
- [ ] Notes field works
- [ ] Submit saves to Firebase
- [ ] Form resets on "Add Another"
- [ ] "Done" returns to dashboard

### Employees Screen

- [ ] List shows all employees
- [ ] Active/inactive badges
- [ ] Search works
- [ ] Add employee works
- [ ] Edit employee works
- [ ] Toggle active/inactive works
- [ ] Pull to refresh works
- [ ] Empty state shows

### Services Screen

- [ ] List shows all services
- [ ] Grouped by category
- [ ] Active/inactive badges
- [ ] Search works
- [ ] Category filter works
- [ ] Add service works
- [ ] Edit service works
- [ ] Toggle active/inactive works
- [ ] Pull to refresh works
- [ ] Empty state shows

---

## 👷 EMPLOYEE FLOW (1-2 hours)

### Employee Login

- [ ] Can login
- [ ] Goes to employee home
- [ ] Cannot access owner features

### Employee Home

- [ ] Loading spinner shows
- [ ] Today's summary correct
- [ ] Shows only employee's entries
- [ ] Recent entries correct
- [ ] Pull to refresh works
- [ ] Empty state (no entries)

### Employee History

- [ ] Loading spinner shows
- [ ] Monthly summary correct
- [ ] Shows only employee's entries
- [ ] Month selector works
- [ ] Data filters by month
- [ ] Pull to refresh works
- [ ] Empty state shows

### Employee Profile

- [ ] Shows correct info
- [ ] Commission % displays
- [ ] Logout works

---

## 💾 DATA & PERSISTENCE (1 hour)

### Data Integrity

- [ ] Dashboard totals = sum of entries
- [ ] Employee totals = their entries only
- [ ] Service counts accurate
- [ ] Timestamps correct
- [ ] All fields save properly

### Firebase Check

- [ ] Organizations collection has org
- [ ] Users collection has employees
- [ ] Services collection has services
- [ ] WorkEntries collection has entries
- [ ] Data structure correct

### Persistence

- [ ] Data survives app restart
- [ ] Data survives force close
- [ ] Data survives device restart

---

## 🔌 OFFLINE MODE (30 min)

- [ ] App shows cached data offline
- [ ] Read operations work
- [ ] Write operations handle gracefully
- [ ] Clear error messages
- [ ] Syncs when reconnected
- [ ] No data loss

---

## 🎨 UI/UX (30 min)

- [ ] All text readable
- [ ] Colors consistent
- [ ] Icons display
- [ ] No overflow/cutoff
- [ ] Spacing looks good
- [ ] Buttons work
- [ ] Navigation smooth
- [ ] Keyboard doesn't cover inputs
- [ ] Scrolling smooth
- [ ] Loading states show
- [ ] Success messages clear
- [ ] Error messages helpful

---

## ⚡ PERFORMANCE (15 min)

- [ ] App starts < 3 seconds
- [ ] Dashboard loads < 2 seconds
- [ ] Lists load < 1 second
- [ ] Smooth scrolling
- [ ] No crashes
- [ ] No memory leaks

---

## 🔒 SECURITY (15 min)

- [ ] Must login to access app
- [ ] Employee sees only their data
- [ ] Employee cannot access owner features
- [ ] Cannot see other orgs' data
- [ ] Logout clears session

---

## 🐛 BUGS FOUND

### Critical 🔴

| #   | Screen | Issue | Status |
| --- | ------ | ----- | ------ |
| 1   |        |       |        |

### Major 🟡

| #   | Screen | Issue | Status |
| --- | ------ | ----- | ------ |
| 1   |        |       |        |

### Minor 🟢

| #   | Screen | Issue | Status |
| --- | ------ | ----- | ------ |
| 1   |        |       |        |

---

## ✅ COMPLETION

- [ ] All critical paths pass
- [ ] Owner flow complete
- [ ] Employee flow complete
- [ ] Data verified
- [ ] Offline tested
- [ ] UI/UX checked
- [ ] Performance acceptable
- [ ] Security verified
- [ ] All bugs documented
- [ ] Critical bugs fixed
- [ ] Retested fixes

**Ready for Phase 6?** [ ] YES [ ] NO

---

## 📊 FINAL STATS

- Tests Completed: \_\_\_/150+
- Tests Passed: \_\_\_
- Tests Failed: \_\_\_
- Bugs Found: \_\_\_
- Critical Bugs: \_\_\_
- Time Spent: \_\_\_ hours

**Signed Off**: ******\_****** Date: **\_\_\_**

---

_Keep this checklist open while testing!_
