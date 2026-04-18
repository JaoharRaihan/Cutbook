# 🔥 Firebase Integration Plan - CutBook

**Goal**: Add Firebase for user authentication and real-time data sync
**Benefits**: Team sync, multi-device access, cloud backup
**Timeline**: 6-8 hours integration work

---

## 🎯 Firebase Features to Implement

### 1. **Firebase Authentication** 🔐

- Replace mock authentication with real Firebase Auth
- Email/password authentication
- User management in cloud
- Secure token-based auth
- Password reset via email

### 2. **Cloud Firestore** 📊

- Real-time database
- Store organizations, employees, services, work entries
- Automatic sync across devices
- Offline support (data caches locally)
- Real-time updates for team

### 3. **Firebase Storage** (Optional for v2.0)

- Store employee photos
- Organization logos
- Profile pictures

### 4. **Cloud Functions** (Optional for v2.0)

- Server-side calculations
- Automated reports
- Email notifications

---

## 📋 Firebase Setup Steps

### Step 1: Create Firebase Project (15 minutes)

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Click "Add Project"

2. **Project Configuration**
   - Project name: **CutBook**
   - Enable Google Analytics: ✅ Yes (recommended)
   - Analytics location: Bangladesh
   - Accept terms

3. **Add Apps**
   - Add iOS app
   - Add Android app
   - Add Web app (for future web dashboard)

---

### Step 2: Android Configuration (20 minutes)

**Download config files:**

1. In Firebase Console → Project Settings
2. Select your Android app
3. Download `google-services.json`
4. Place in: `android/app/google-services.json`

**Update build.gradle files:**

File: `android/build.gradle`

```gradle
buildscript {
    dependencies {
        // Add this line
        classpath 'com.google.gms:google-services:4.4.0'
    }
}
```

File: `android/app/build.gradle`

```gradle
apply plugin: "com.android.application"
// Add this line
apply plugin: 'com.google.gms.google-services'

dependencies {
    // Add Firebase dependencies
    implementation platform('com.google.firebase:firebase-bom:32.7.0')
    implementation 'com.google.firebase:firebase-auth'
    implementation 'com.google.firebase:firebase-firestore'
}
```

---

### Step 3: iOS Configuration (20 minutes)

**Download config files:**

1. In Firebase Console → Project Settings
2. Select your iOS app
3. Download `GoogleService-Info.plist`
4. Add to Xcode project

**Install CocoaPods:**

```bash
cd ios
pod install
cd ..
```

---

### Step 4: Install React Native Firebase (5 minutes)

```bash
npm install --save @react-native-firebase/app
npm install --save @react-native-firebase/auth
npm install --save @react-native-firebase/firestore

# For iOS
cd ios && pod install && cd ..
```

---

## 🏗️ Database Structure (Firestore)

### Collections Schema:

```
users/
  ├── {userId}
      ├── email: string
      ├── name: string
      ├── phone: string
      ├── role: "owner" | "employee"
      ├── organizationId: string
      ├── createdAt: timestamp
      └── updatedAt: timestamp

organizations/
  ├── {orgId}
      ├── name: string
      ├── phone: string
      ├── address: string
      ├── inviteCode: string
      ├── ownerId: string
      ├── settings: {}
      ├── createdAt: timestamp
      └── members: [userId1, userId2...]

services/
  ├── {serviceId}
      ├── organizationId: string
      ├── name: string
      ├── category: string
      ├── price: number
      ├── duration: number
      ├── isActive: boolean
      └── createdAt: timestamp

employees/
  ├── {employeeId}
      ├── organizationId: string
      ├── userId: string (link to users collection)
      ├── name: string
      ├── phone: string
      ├── role: string
      ├── commissionRate: number
      ├── status: "active" | "inactive"
      └── stats: {}

workEntries/
  ├── {entryId}
      ├── organizationId: string
      ├── employeeId: string
      ├── serviceId: string
      ├── date: timestamp
      ├── price: number
      ├── tip: number
      ├── paymentMethod: string
      ├── notes: string
      ├── createdBy: userId
      ├── createdAt: timestamp
      ├── editHistory: []
      └── isDeleted: boolean
```

---

## 🔧 Code Changes Required

### 1. Update AuthContext.tsx

**Replace mock authentication with Firebase Auth:**

```typescript
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';

// Register function
const register = async (email: string, password: string, name: string, phone: string) => {
  try {
    setLoading(true);

    // Create user in Firebase Auth
    const userCredential = await auth().createUserWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Create user profile in Firestore
    await firestore().collection('users').doc(user.uid).set({
      email,
      name,
      phone,
      role: 'owner', // or 'employee'
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });

    setUser({id: user.uid, email, name, phone, role: 'owner'});
    setSuccessMessage('Registration successful!');
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  } finally {
    setLoading(false);
  }
};

// Login function
const login = async (email: string, password: string) => {
  try {
    setLoading(true);

    // Sign in with Firebase Auth
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    const user = userCredential.user;

    // Get user profile from Firestore
    const userDoc = await firestore().collection('users').doc(user.uid).get();
    const userData = userDoc.data();

    setUser({
      id: user.uid,
      email: userData.email,
      name: userData.name,
      phone: userData.phone,
      role: userData.role,
    });
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  } finally {
    setLoading(false);
  }
};

// Logout function
const logout = async () => {
  await auth().signOut();
  setUser(null);
};
```

---

### 2. Update OrgContext.tsx

**Replace AsyncStorage with Firestore:**

```typescript
import firestore from '@react-native-firebase/firestore';

// Create organization
const createOrganization = async (name: string, phone: string, address: string) => {
  try {
    const inviteCode = generateInviteCode();
    const orgRef = firestore().collection('organizations').doc();

    await orgRef.set({
      name,
      phone,
      address,
      inviteCode,
      ownerId: user.id,
      members: [user.id],
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

    setOrganization({
      id: orgRef.id,
      name,
      phone,
      address,
      inviteCode,
      ownerId: user.id,
    });
  } catch (error) {
    console.error('Create org error:', error);
    throw error;
  }
};

// Listen to organization updates (real-time)
useEffect(() => {
  if (!user?.organizationId) return;

  const unsubscribe = firestore()
    .collection('organizations')
    .doc(user.organizationId)
    .onSnapshot(doc => {
      if (doc.exists) {
        setOrganization({id: doc.id, ...doc.data()});
      }
    });

  return () => unsubscribe();
}, [user?.organizationId]);
```

---

### 3. Update DataContext.tsx

**Replace local work entries with Firestore:**

```typescript
import firestore from '@react-native-firebase/firestore';

// Add work entry
const addWorkEntry = async (entry: WorkEntry) => {
  try {
    const entryRef = firestore().collection('workEntries').doc();

    await entryRef.set({
      ...entry,
      organizationId: organization.id,
      createdBy: user.id,
      createdAt: firestore.FieldValue.serverTimestamp(),
      isDeleted: false,
    });

    return {id: entryRef.id, ...entry};
  } catch (error) {
    console.error('Add entry error:', error);
    throw error;
  }
};

// Listen to work entries (real-time)
useEffect(() => {
  if (!organization?.id) return;

  const unsubscribe = firestore()
    .collection('workEntries')
    .where('organizationId', '==', organization.id)
    .where('isDeleted', '==', false)
    .orderBy('date', 'desc')
    .onSnapshot(snapshot => {
      const entries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWorkEntries(entries);
    });

  return () => unsubscribe();
}, [organization?.id]);
```

---

## 🔒 Firebase Security Rules

**Firestore Security Rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Organization members can read org data
    match /organizations/{orgId} {
      allow read: if request.auth != null &&
                     request.auth.uid in resource.data.members;
      allow write: if request.auth != null &&
                      request.auth.uid == resource.data.ownerId;
    }

    // Organization members can manage services
    match /services/{serviceId} {
      allow read, write: if request.auth != null &&
                            exists(/databases/$(database)/documents/organizations/$(resource.data.organizationId));
    }

    // Organization members can manage work entries
    match /workEntries/{entryId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null &&
                               request.auth.uid == resource.data.createdBy;
    }
  }
}
```

---

## 💰 Firebase Pricing

### Free Tier (Spark Plan):

- ✅ Authentication: 50,000 MAU
- ✅ Firestore: 1 GB storage, 50K reads/day, 20K writes/day
- ✅ Perfect for starting out (10-20 salons)

### Paid Tier (Blaze Plan):

- Pay as you go
- ~$25-50/month for 50-100 salons
- ~$100-200/month for 500 salons

**Recommendation**: Start with free tier!

---

## 📊 Implementation Timeline

### Phase A: Firebase Setup (1 hour)

- [ ] Create Firebase project
- [ ] Add Android app config
- [ ] Add iOS app config
- [ ] Install dependencies

### Phase B: Authentication (2 hours)

- [ ] Update AuthContext with Firebase Auth
- [ ] Update login/register screens
- [ ] Test authentication flow
- [ ] Handle password reset

### Phase C: Organization Data (2 hours)

- [ ] Update OrgContext with Firestore
- [ ] Migrate to cloud storage
- [ ] Real-time organization sync
- [ ] Test invite code system

### Phase D: Work Entries & Services (2-3 hours)

- [ ] Update DataContext with Firestore
- [ ] Real-time work entry sync
- [ ] Service management in cloud
- [ ] Employee management in cloud

### Phase E: Testing & Migration (1-2 hours)

- [ ] Test multi-device sync
- [ ] Test offline mode
- [ ] Data migration strategy
- [ ] Handle conflicts

**Total**: 8-10 hours

---

## 🚀 Deployment Strategy

### Option 1: Firebase First (Recommended)

1. Complete Firebase integration
2. Test thoroughly
3. Deploy to app stores
4. All users start with cloud sync

### Option 2: Hybrid Approach

1. Deploy current version (local only)
2. Add Firebase in v1.1 update
3. Provide migration tool
4. Users can choose local or cloud

**My Recommendation**: Option 1 - Launch with Firebase from day 1!

---

## 🎯 Next Steps

**Tell me:**

1. **"Start Firebase integration now"**
   → I'll guide you through setup step-by-step
   → Add 8-10 hours to timeline
   → Launch with cloud sync

2. **"Firebase setup guide first"**
   → I'll create detailed step-by-step guide
   → You follow at your own pace
   → Report back when done

3. **"Do it together"**
   → We integrate Firebase screen by screen
   → I'll write the code
   → You test each step

**Which approach do you prefer?**

---

_Firebase will enable team sync, multi-device access, and real-time updates!_ 🔥
