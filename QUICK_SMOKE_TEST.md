# ⚡ 5-Minute Smoke Test

**Goal**: Verify the app launches and core features work

---

## 🏃 Quick Test (5 minutes)

### 1. **App Launch** (30 seconds)

- [ ] iOS simulator opens
- [ ] App loads without crash
- [ ] Shows login screen

### 2. **Owner Registration** (1 minute)

- [ ] Tap "Register"
- [ ] Fill: owner1@test.com / 123456 / 123456
- [ ] Tap Register
- [ ] ✅ Should navigate to Create Organization screen

### 3. **Create Organization** (1 minute)

- [ ] Fill: Test Salon / 01711223344 / Dhaka
- [ ] Tap Create
- [ ] ✅ Should navigate to Dashboard
- [ ] ✅ Should show empty state

### 4. **Add Employee** (1 minute)

- [ ] Navigate to Employees tab
- [ ] Tap Add Employee
- [ ] Fill: John / 01811223344 / Barber / 40%
- [ ] Save
- [ ] ✅ Should see employee in list

### 5. **Add Service** (1 minute)

- [ ] Navigate to Services tab
- [ ] Tap Add Service
- [ ] Fill: Haircut / Haircut category / 300 BDT
- [ ] Save
- [ ] ✅ Should see service in list

### 6. **Create Work Entry** (1.5 minutes)

- [ ] Navigate to Dashboard
- [ ] Tap Add Work Entry
- [ ] Select: John + Haircut
- [ ] Add tip: 50
- [ ] Payment: Cash
- [ ] Save
- [ ] ✅ Return to dashboard
- [ ] ✅ Should see updated summary (350 BDT total)

---

## ✅ **If all 6 steps pass:**

**Your app is working!** Core functionality is solid.

## ❌ **If something fails:**

**Tell me which step failed**, and we'll fix it together.

---

## 📊 **Expected Results:**

After completing this test, your dashboard should show:

- **Total Income**: 350 BDT
- **Cash**: 350 BDT
- **John's Earnings**: 140 BDT (40% of 350)
- **1 work entry**

---

## 🎯 **Next After Smoke Test:**

### ✅ **If Everything Works:**

1. Test employee flow (5 min)
2. Test data persistence (2 min)
3. Move to Phase 8 (Production Config)

### 🐛 **If Bugs Found:**

1. Tell me what broke
2. We fix it together
3. Re-test
4. Continue to Phase 8

---

**Let's see if the iOS simulator is ready!**
