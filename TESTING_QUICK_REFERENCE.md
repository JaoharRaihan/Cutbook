# 🎯 Quick Testing Reference

## 📱 Test Credentials

### Owner Accounts (Can create organizations):

```
owner1@test.com : 123456
owner2@test.com : 123456
owner3@test.com : 123456
```

### Employee Accounts (Can join organizations):

```
employee1@test.com : 123456
employee2@test.com : 123456
employee3@test.com : 123456
```

---

## 🏃 Quick Test Flow

### Owner Flow (5-min smoke test):

1. **Login**: owner1@test.com / 123456
2. **Create Org**: "Test Salon" / 01711223344 / Dhaka
3. **Add Employee**: "John" / 01811223344 / Barber / 40%
4. **Add Service**: "Haircut" / 300 BDT / 30 min
5. **Add Entry**: John + Haircut + 50 tip + Cash
6. **Check Dashboard**: Verify summary shows correctly

### Employee Flow (3-min smoke test):

1. **Register**: employee1@test.com / 123456
2. **Join Org**: Use invite code from owner
3. **View Home**: Check today's summary
4. **Check History**: Verify entries appear

---

## ✅ Critical Features to Test

### Must Work:

- [ ] Login/Register
- [ ] Create organization
- [ ] Add employee
- [ ] Add service
- [ ] Create work entry
- [ ] View dashboard summary
- [ ] Data persists after restart

### Should Work:

- [ ] Edit employee
- [ ] Edit service
- [ ] Edit work entry
- [ ] Delete operations
- [ ] Filters work
- [ ] Search works
- [ ] Reports display

---

## 🐛 Common Issues to Check

- Forms validate properly (empty fields, invalid data)
- Loading states show during operations
- Success messages after actions
- Error messages are clear
- Navigation flows correctly
- Buttons don't allow double-tap
- Data syncs across screens
- App doesn't crash on edge cases

---

## 📊 Expected Numbers Test Case

Create these entries to verify calculations:

| Employee | Service | Price | Tip | Payment | Commission (40%) |
| -------- | ------- | ----- | --- | ------- | ---------------- |
| John     | Haircut | 300   | 50  | Cash    | 140              |
| John     | Beard   | 150   | 30  | bKash   | 72               |
| Sara     | Color   | 1500  | 200 | Nagad   | 680              |

**Dashboard should show:**

- Total Income: 2,230 BDT
- Cash: 350 BDT
- bKash: 180 BDT
- Nagad: 1,700 BDT
- John's earnings: 212 BDT
- Sara's earnings: 680 BDT

---

## 🎨 UI/UX Checklist

- [ ] Colors consistent
- [ ] Fonts readable
- [ ] Buttons easy to tap
- [ ] Icons make sense
- [ ] Spacing looks good
- [ ] No text cutoff
- [ ] Scrolling smooth
- [ ] Animations pleasant

---

_This is your quick reference during manual testing!_
