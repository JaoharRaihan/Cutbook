# 🎬 Demo Data Setup Guide

This guide explains how to create realistic demo data for CutBook.

## Overview

Demo data should include:
- 1 salon organization
- 1 owner + 4-5 employees
- 12-15 services across categories
- 50-70 work entries over 7 days
- Various payment methods and prices

## Step-by-Step Setup

### 1. Create Organization

```typescript
const demoOrg = {
  id: 'demo-org-1',
  name: 'Elite Cuts Salon',
  ownerId: 'demo-user-1',
  timezone: 'Asia/Dhaka',
  currency: 'BDT',
  defaultCommissionMode: CommissionMode.PERCENTAGE,
  createdAt: new Date('2024-01-01'),
};
```

### 2. Create Users

**Owner:**
- Name: Karim Ahmed
- Phone: +8801712345678
- Role: OWNER

**Employees (4-5):**
- Rashed Ali (20% commission) - Senior Barber
- Shakib Hassan (15% commission) - Junior Barber
- Tanvir Islam (25% commission) - Specialist
- Fahim Rahman (10% commission) - Trainee

### 3. Create Services

**Haircut Category:**
- Regular Haircut - ৳200
- Premium Haircut - ৳400
- Kids Haircut - ৳150

**Shave/Beard Category:**
- Clean Shave - ৳100
- Beard Trim - ৳150
- Beard Styling - ৳250

**Facial Category:**
- Basic Facial - ৳600
- Premium Facial - ৳1,000

**Color Category:**
- Hair Color - ৳1,200
- Hair Highlights - ৳1,500

**Massage/Spa Category:**
- Head Massage - ৳300
- Full Body Massage - ৳800
- Hair Treatment - ৳500
- Hair Spa - ৳700

### 4. Create Work Entries

**Today (10-12 entries):**
- Mix of all employees
- Various services
- Different payment methods (60% Cash, 25% bKash, 10% Card, 5% Other)
- Some with tips (10-20%)
- Spread throughout the day

**Yesterday (8-10 entries):**
- Similar distribution
- Slightly lower volume

**Past 5 Days (30-40 entries):**
- Consistent daily volume
- Weekend days slightly higher
- Realistic service distribution

### 5. Payment Method Distribution

Realistic mix for Bangladesh:
- **Cash:** 60% (most common)
- **bKash:** 25% (mobile payment)
- **Card:** 10% (credit/debit)
- **Other:** 5% (Nagad, etc.)

### 6. Tips Distribution

- 30% of entries have tips
- Tip range: ৳10-৳200
- Higher tips on premium services

### 7. Service Popularity

**Most Popular (40%):**
- Regular Haircut
- Clean Shave
- Beard Trim

**Moderate (35%):**
- Premium Haircut
- Beard Styling
- Head Massage

**Occasional (25%):**
- Facials
- Hair Color
- Full services

## Loading Demo Data

### Option 1: First Launch Auto-Load

```typescript
// In App.tsx or initial screen
useEffect(() => {
  const checkFirstLaunch = async () => {
    const hasData = await AsyncStorage.getItem('has_data');
    if (!hasData) {
      await loadDemoData();
      await AsyncStorage.setItem('has_data', 'true');
      await AsyncStorage.setItem('demo_mode', 'true');
    }
  };
  checkFirstLaunch();
}, []);
```

### Option 2: Manual Load Button

```typescript
// In Settings screen
<TouchableOpacity onPress={async () => {
  Alert.alert(
    'Load Demo Data',
    'This will replace existing data. Continue?',
    [
      {text: 'Cancel', style: 'cancel'},
      {text: 'Load', onPress: async () => {
        await loadDemoData();
        showToast('Demo data loaded!');
      }}
    ]
  );
}}>
  <Text>Load Demo Data</Text>
</TouchableOpacity>
```

## Demo Mode Indicator

Show banner when in demo mode:

```typescript
const isDemoMode = await AsyncStorage.getItem('demo_mode') === 'true';

{isDemoMode && (
  <View style={styles.demoBanner}>
    <Text>🎬 Demo Mode - Sample Data</Text>
    <TouchableOpacity onPress={clearDemoData}>
      <Text>Clear</Text>
    </TouchableOpacity>
  </View>
)}
```

## Realistic Data Tips

1. **Names:** Use common Bangladeshi names
2. **Phone Numbers:** Use valid BD format (+880...)
3. **Timestamps:** Spread entries across business hours (9 AM - 8 PM)
4. **Prices:** Realistic for Dhaka market
5. **Services:** Match actual salon offerings
6. **Seasonal Variation:** More color services before Eid

## Testing Scenarios

Use demo data to test:

1. **Empty States:** Delete all entries for today
2. **Large Lists:** Add 100+ entries
3. **Long Names:** Test UI with very long employee/service names
4. **Edge Cases:** Zero prices, maximum tips, etc.
5. **Date Boundaries:** Entries on month/year boundaries
6. **Bengali Text:** Services named in Bengali

## Data Persistence

Ensure demo data persists:

```typescript
// Save to AsyncStorage
await AsyncStorage.multiSet([
  ['current_org', JSON.stringify(demoOrg)],
  ['org_users', JSON.stringify(demoUsers)],
  ['org_services', JSON.stringify(demoServices)],
  ['work_entries', JSON.stringify(demoEntries)],
  ['demo_mode', 'true'],
]);
```

## Clear Demo Data

```typescript
export async function clearDemoData() {
  await AsyncStorage.multiRemove([
    'current_org',
    'org_users',
    'org_services',
    'work_entries',
    'demo_mode',
    'has_data',
  ]);
}
```

## Screenshots with Demo Data

When taking app store screenshots:
1. Load demo data
2. Navigate to each screen
3. Ensure data looks realistic
4. Take both English and Bengali screenshots

## Important Notes

- Demo data should be representative of real usage
- Don't use real phone numbers or emails
- Keep data realistic for Bangladesh market
- Test app thoroughly with demo data
- Provide easy way to clear demo data

---

**Ready to build your demo data!** 🚀
