# CutBook Phase 1 - Complete Implementation Guide

**Goal:** Make the app fully functional and production-ready
**Timeline:** 5 days
**Target:** Deploy to App Store & Play Store simultaneously

---

## 📋 Table of Contents

1. [Status Overview](#status-overview)
2. [Day 1-2: Complete Critical Screens](#day-1-2-complete-critical-screens)
3. [Day 3: Secondary Features](#day-3-secondary-features)
4. [Day 4: Testing & Error Handling](#day-4-testing--error-handling)
5. [Day 5: Store Submission](#day-5-store-submission)

---

## 🔍 Status Overview

### ✅ ALREADY WORKING

| Component              | Status      | Details                                                         |
| ---------------------- | ----------- | --------------------------------------------------------------- |
| **AuthContext**        | ✅ Complete | Login, Register, Logout, updateUser                             |
| **OrgContext**         | ✅ Complete | createOrg, joinOrg, service management, user updates            |
| **DataContext**        | ✅ Complete | addWorkEntry, updateWorkEntry, deleteWorkEntry, getDailySummary |
| **LoginScreen**        | ✅ Complete | Full authentication flow                                        |
| **RegisterScreen**     | ✅ Complete | New user registration with role selection                       |
| **AddWorkEntryScreen** | ✅ Complete | Connected to addWorkEntry()                                     |
| **AddServiceScreen**   | ✅ FIXED    | Now calls addService() context method                           |
| **AddEmployeeScreen**  | ✅ FIXED    | Invite-based system implemented                                 |
| **EmployeesScreen**    | ✅ Complete | Lists employees with search                                     |

### ❌ NEEDS IMPLEMENTATION

| Component                  | Priority | Effort | Status         |
| -------------------------- | -------- | ------ | -------------- |
| EditServiceScreen          | HIGH     | 30 min | Placeholder    |
| EmployeeDetailScreen       | HIGH     | 45 min | Mock data only |
| WorkEntryDetailScreen      | HIGH     | 45 min | Mock data only |
| ReportsScreen              | MEDIUM   | 60 min | Empty          |
| OrganizationSettingsScreen | MEDIUM   | 45 min | Empty          |
| SettingsScreen             | LOW      | 30 min | Empty          |
| ErrorBoundary              | HIGH     | 20 min | Missing        |
| Error handling in screens  | HIGH     | 60 min | Minimal        |

---

## 🚀 Day 1-2: Complete Critical Screens

### **STEP 1: EditServiceScreen** (30 minutes)

**What it does:** Edit existing service details or delete the service

**File:** `src/screens/owner/EditServiceScreen.tsx`

**Current state:** Has form UI but not connected to context

**What needs to change:**

1. Import `useData` and connect to `updateService()` and `deleteService()`
2. Fetch service from context `orgServices`
3. Pre-populate form fields
4. Add save/delete handlers

**Implementation:**

```bash
# Make sure to use the updateService method from useOrg context
# The service should come from orgServices in the useOrg() hook
# On save: call updateService(serviceId, updatedData)
# On delete: call deleteService(serviceId)
```

**Key functions needed:**

```typescript
const {orgServices, updateService, deleteService, loading} = useOrg();

// On mount, find service from orgServices
useEffect(() => {
  const foundService = orgServices.find(s => s.id === serviceId);
  if (foundService) {
    setService(foundService);
    // Pre-populate form
  }
}, [serviceId, orgServices]);

// On save
const handleSave = async () => {
  await updateService(serviceId, {
    name: serviceName,
    category,
    defaultPrice: parseFloat(defaultPrice),
    description,
    duration: duration ? parseInt(duration) : undefined,
    isActive,
  });
};

// On delete
const handleDelete = async () => {
  Alert.alert('Delete Service', 'Are you sure?', [
    {text: 'Cancel'},
    {
      text: 'Delete',
      onPress: async () => {
        await deleteService(serviceId);
        navigation.goBack();
      },
    },
  ]);
};
```

---

### **STEP 2: EmployeeDetailScreen** (45 minutes)

**What it does:** Show employee profile, statistics, and commission breakdown

**File:** `src/screens/owner/EmployeeDetailScreen.tsx`

**Current state:** Mock data only, no context connection

**What needs to change:**

1. Import context hooks: `useOrg()`, `useData()`
2. Get employee from `orgUsers`
3. Calculate statistics from `workEntries`
4. Show commission breakdown for this month
5. Add ability to update employee commission percentage

**Implementation:**

```typescript
const {employeeId} = route.params;
const {orgUsers, updateUserInOrg, loading: orgLoading} = useOrg();
const {workEntries} = useData();

// Find employee
const employee = useMemo(() => {
  return orgUsers.find(u => u.id === employeeId);
}, [employeeId, orgUsers]);

// Calculate stats
const stats = useMemo(() => {
  if (!employee) return null;

  const employeeEntries = workEntries.filter(e => e.employeeId === employeeId);

  // This month's entries
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const thisMonthEntries = employeeEntries.filter(e => {
    const entryDate = typeof e.createdAt === 'string' ? new Date(e.createdAt) : e.createdAt;
    return entryDate >= monthStart;
  });

  return {
    totalServices: employeeEntries.length,
    totalIncome: employeeEntries.reduce((sum, e) => sum + e.price + (e.tip || 0), 0),
    thisMonthServices: thisMonthEntries.length,
    thisMonthIncome: thisMonthEntries.reduce((sum, e) => sum + e.price + (e.tip || 0), 0),
    averagePerService:
      employeeEntries.length > 0
        ? employeeEntries.reduce((sum, e) => sum + e.price, 0) / employeeEntries.length
        : 0,
  };
}, [employeeId, workEntries, employee]);

// Handle update commission
const handleUpdateCommission = async (newPercentage: string) => {
  if (!employee) return;
  try {
    await updateUserInOrg(employeeId, {
      commissionPercentage: parseFloat(newPercentage),
    });
    Alert.alert('Success', 'Commission updated');
  } catch (error: any) {
    Alert.alert('Error', error.message);
  }
};
```

---

### **STEP 3: WorkEntryDetailScreen** (45 minutes)

**What it does:** View work entry details, edit, or delete

**File:** `src/screens/owner/WorkEntryDetailScreen.tsx`

**Current state:** Mock data only

**What needs to change:**

1. Import `useData()` and get work entry from `workEntries`
2. Pre-populate form with current entry data
3. Add edit mode with form controls
4. Implement save and delete handlers

**Implementation:**

```typescript
const {entryId} = route.params;
const {workEntries, updateWorkEntry, deleteWorkEntry, loading} = useData();
const {orgServices} = useOrg();
const [isEditing, setIsEditing] = useState(false);

// Find entry
const entry = useMemo(() => {
  return workEntries.find(e => e.id === entryId);
}, [entryId, workEntries]);

// Pre-populate when in edit mode
useEffect(() => {
  if (entry && isEditing) {
    setServiceName(entry.serviceName);
    setPrice(entry.price.toString());
    setTip((entry.tip || 0).toString());
    setPaymentMethod(entry.paymentMethod);
    setNote(entry.note || '');
  }
}, [isEditing, entry]);

// Handle save
const handleSave = async () => {
  if (!entry) return;
  try {
    await updateWorkEntry(entryId, {
      serviceName: setServiceName.trim(),
      price: parseFloat(price),
      tip: tip ? parseFloat(tip) : 0,
      paymentMethod,
      note: note.trim() || undefined,
    });
    setIsEditing(false);
    Alert.alert('Success', 'Entry updated');
  } catch (error: any) {
    Alert.alert('Error', error.message);
  }
};

// Handle delete
const handleDelete = async () => {
  Alert.alert('Delete Entry', 'Are you sure?', [
    {text: 'Cancel'},
    {
      text: 'Delete',
      onPress: async () => {
        try {
          await deleteWorkEntry(entryId);
          navigation.goBack();
        } catch (error: any) {
          Alert.alert('Error', error.message);
        }
      },
    },
  ]);
};
```

---

## 📊 Day 3: Secondary Features

### **STEP 4: ReportsScreen** (60 minutes)

**What it does:** Show business analytics and reports

**File:** `src/screens/owner/ReportsScreen.tsx`

**Features to implement:**

- Daily/Weekly/Monthly revenue breakdown
- Top services by income
- Top employees by commission
- Payment method breakdown (pie chart or bars)
- Date range picker

**Key logic:**

```typescript
// Calculate monthly revenue
const monthlyData = useMemo(() => {
  const months = {};
  workEntries.forEach(entry => {
    const date = typeof entry.createdAt === 'string' ? new Date(entry.createdAt) : entry.createdAt;
    const monthKey = format(date, 'MMM yyyy');
    if (!months[monthKey]) months[monthKey] = 0;
    months[monthKey] += entry.price + (entry.tip || 0);
  });
  return months;
}, [workEntries]);

// Top services
const topServices = useMemo(() => {
  const serviceMap = {};
  workEntries.forEach(entry => {
    if (!serviceMap[entry.serviceName]) serviceMap[entry.serviceName] = 0;
    serviceMap[entry.serviceName] += entry.price + (entry.tip || 0);
  });
  return Object.entries(serviceMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
}, [workEntries]);
```

---

### **STEP 5: OrganizationSettingsScreen** (45 minutes)

**What it does:** Manage organization settings, timezone, currency, default commission

**File:** `src/screens/owner/OrganizationSettingsScreen.tsx`

**Features:**

- Edit organization name
- Change default commission mode/value
- Update timezone and currency
- View invite code

**Key implementation:**

```typescript
const {currentOrg, updateOrg, loading} = useOrg();
const [orgName, setOrgName] = useState(currentOrg?.name || '');
const [defaultCommission, setDefaultCommission] = useState(
  currentOrg?.defaultCommissionValue?.toString() || '0',
);

const handleSave = async () => {
  await updateOrg({
    name: orgName,
    defaultCommissionValue: parseFloat(defaultCommission),
  });
  Alert.alert('Success', 'Organization settings updated');
};
```

---

### **STEP 6: SettingsScreen** (30 minutes)

**What it does:** User profile and app settings

**File:** `src/screens/*/SettingsScreen.tsx`

**Features:**

- View/edit user profile
- Change password
- Log out
- App version info

---

## 🧪 Day 4: Testing & Error Handling

### **STEP 7: Add ErrorBoundary Component** (20 minutes)

**File:** `src/components/ErrorBoundary.tsx`

```typescript
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {hasError: false, error: null};
  }

  static getDerivedStateFromError(error: Error) {
    return {hasError: true, error};
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({hasError: false, error: null});
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.error}>{this.state.error?.message}</Text>
          <TouchableOpacity style={styles.button} onPress={this.handleReset}>
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {fontSize: 20, fontWeight: 'bold', marginBottom: 10},
  error: {fontSize: 14, color: '#F44336', marginBottom: 20},
  button: {backgroundColor: '#2196F3', padding: 12, borderRadius: 8},
  buttonText: {color: 'white', fontWeight: '600'},
});
```

---

### **STEP 8: Add Error Handling to Context** (20 minutes)

Ensure all context methods properly catch errors and display user-friendly messages.

**Pattern to follow in all context methods:**

```typescript
try {
  // ... operation
  setSuccessMessage('Operation successful');
} catch (err: any) {
  const message =
    err.code === 'permission-denied'
      ? "You don't have permission to perform this action"
      : err.message || 'Something went wrong. Please try again.';
  setError(message);
  throw new Error(message);
} finally {
  setLoading(false);
}
```

---

### **STEP 9: Add Input Validation** (30 minutes)

Add validation to all form screens:

```typescript
const validateForm = (): string | null => {
  if (!field.trim()) return 'Field is required';
  if (!isValidPhone(field)) return 'Invalid phone format';
  if (!isValidEmail(field)) return 'Invalid email format';
  if (parseFloat(field) < 0) return 'Amount must be positive';
  return null;
};

// Use before submitting
const handleSubmit = () => {
  const error = validateForm();
  if (error) {
    Alert.alert('Validation Error', error);
    return;
  }
  // proceed...
};
```

---

## ✅ Day 4 Testing Checklist

### Owner Flow

- [ ] Register as owner
- [ ] Create organization
- [ ] Add service (check saved in Firestore)
- [ ] Generate employee invite code
- [ ] Add work entry
- [ ] Edit work entry
- [ ] Delete work entry
- [ ] View employee details
- [ ] Update employee commission
- [ ] View reports
- [ ] Update organization settings
- [ ] Log out and log back in

### Employee Flow

- [ ] Register as employee
- [ ] Join organization with invite code
- [ ] View home dashboard
- [ ] View work history
- [ ] View profile
- [ ] Log out

### Edge Cases

- [ ] Offline sync (disable network, add entry, reconnect)
- [ ] Multiple users in same org
- [ ] Concurrent edits (same entry from 2 users)
- [ ] Large dataset performance (100+ entries)

---

## 📦 Day 5: Store Submission

### iOS App Store

```bash
# 1. Update build number in Xcode
# ios/CutBook/Info.plist
# CFBundleVersion: 1
# CFBundleShortVersionString: 1.0.0

# 2. Create archive
xcode-select --install
cd ios
pod install
cd ..

# 3. Build for release
npm run build:ios

# 4. Upload to TestFlight
# - Use Xcode: Product > Archive
# - Organizer > Distribute App > TestFlight

# 5. Wait for review (2-3 days)
# 6. Submit to App Store

# Checklist:
# - App name: CutBook
# - Description: Professional Salon Management System
# - Category: Business
# - Support URL: (add your website)
# - Privacy Policy URL: (add your privacy policy)
# - Keywords: salon, management, commission, booking
# - Screenshot (5): Show key features
```

### Google Play Store

```bash
# 1. Generate release key
# keytool -genkey -v -keystore my-release-key.keystore \
#   -keyalg RSA -keysize 2048 -validity 10000 \
#   -alias my-key-alias

# 2. Build release APK
npm run build:android

# 3. Upload to Google Play Console
# - Create new release
# - Upload APK
# - Fill out store listing
# - Add screenshots
# - Set pricing & distribution

# Checklist:
# - App name: CutBook
# - Description: Professional Salon Management System
# - Short description: Manage employees, services & commissions
# - Category: Business
# - Content rating: Completed questionnaire
# - Target age: 3+
# - Screenshot: Show dashboard, employee list, work entries
```

---

## 🔧 Configuration Checklist

### Firebase Setup

- [ ] Enable Firestore Database (Production mode)
- [ ] Enable Authentication (Email/Password)
- [ ] Set security rules (use firestore.rules)
- [ ] Enable offline persistence
- [ ] Create collections: users, organizations, services, workEntries, dailySummaries

### App Configuration

- [ ] Update app.json version
- [ ] Update README with correct info
- [ ] Test demo credentials work
- [ ] Verify all screenshots are accurate
- [ ] Test app on physical devices (iOS + Android)

### Release Notes

```
Version 1.0.0 - Initial Release

Features:
✅ Owner dashboard with daily summaries
✅ Employee management with commission tracking
✅ Service management
✅ Work entry logging and editing
✅ Business reports and analytics
✅ Offline support with auto-sync
✅ Multi-language support (English/Bengali)
✅ Real-time data synchronization

Bug Fixes:
- Initial release
```

---

## 📞 Post-Launch Monitoring

1. Monitor Firestore usage (ensure within free tier)
2. Check app crash reports in Xcode Cloud / Play Console
3. Respond to user reviews
4. Monitor database performance
5. Plan next features based on user feedback

---

## 🎯 Success Criteria

✅ All forms save data to Firestore
✅ All screens display real data from context
✅ Error messages are user-friendly
✅ App works offline and syncs online
✅ No console errors
✅ Passes TestFlight review
✅ Passes Play Store review
✅ App loads in < 3 seconds
✅ All buttons are responsive

---

## 📚 Additional Resources

- [React Native Docs](https://reactnative.dev/)
- [Firebase Docs](https://firebase.google.com/docs)
- [App Store Connect Help](https://developer.apple.com/app-store-connect/)
- [Google Play Console Help](https://support.google.com/googleplay/android-developer/)

---

**Last Updated:** May 25, 2026
**Status:** Ready for implementation
