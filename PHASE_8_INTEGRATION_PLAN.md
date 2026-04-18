# 🔥 Phase 8: Firebase Code Integration Plan

**Status**: Ready to Start
**Date**: January 18, 2026
**Pods**: ✅ Installed Successfully

---

## ✅ Prerequisites Complete

- [x] Firebase project created (cutbook-47881)
- [x] Android & iOS apps registered
- [x] Config files placed
- [x] NPM packages installed
- [x] iOS pods installed ✅
- [x] Authentication enabled (Email/Password)
- [x] Firestore database created (US region)

---

## 📋 Integration Steps

### Step 1: Initialize Firebase (30 min) ⏳

**Goal**: Set up Firebase initialization and test connection

**Tasks**:

1. Initialize Firebase in `App.tsx`
2. Add Firebase connection test
3. Enable Firestore offline persistence
4. Add error boundary for Firebase errors

**Files to modify**:

- `App.tsx` - Add Firebase initialization

---

### Step 2: Migrate AuthContext (2-3 hours)

**Goal**: Replace mock authentication with real Firebase Auth

**Current Implementation** (Mock):

```typescript
// Mock login - just sets user in state
login: async (credentials) => {
  const mockUser = { id: '1', email: credentials.email, ...};
  setUser(mockUser);
  await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(mockUser));
}
```

**New Implementation** (Firebase):

```typescript
// Real Firebase Auth
login: async credentials => {
  const userCredential = await auth().signInWithEmailAndPassword(
    credentials.email,
    credentials.password,
  );

  // Load user profile from Firestore
  const userDoc = await firestore().collection('users').doc(userCredential.user.uid).get();

  const userData = userDoc.data();
  setUser({...userData, id: userCredential.user.uid});
};
```

**Tasks**:

1. ✅ Import Firebase modules (already done)
2. Replace `login()` with Firebase Auth
3. Replace `register()` with Firebase Auth + Firestore profile creation
4. Replace `logout()` with Firebase signOut
5. Add `onAuthStateChanged()` listener for session persistence
6. Add password reset functionality
7. Test authentication flows

**Files to modify**:

- `src/context/AuthContext.tsx` - Replace all auth logic

---

### Step 3: Migrate OrgContext (2-3 hours)

**Goal**: Move organization data from AsyncStorage to Firestore

**Current Implementation** (AsyncStorage):

```typescript
// Organizations stored locally only
const orgs = await AsyncStorage.getItem(STORAGE_KEYS.ORGANIZATIONS);
```

**New Implementation** (Firestore):

```typescript
// Organizations synced across devices
const unsubscribe = firestore()
  .collection('organizations')
  .where('ownerId', '==', userId)
  .onSnapshot(snapshot => {
    const orgs = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setOrganizations(orgs);
  });
```

**Firestore Structure**:

```
/organizations/{orgId}
  - name: string
  - ownerId: string
  - employeeCount: number
  - services: array
  - createdAt: timestamp
  - updatedAt: timestamp
```

**Tasks**:

1. Create Firestore collection for organizations
2. Add real-time listener with `onSnapshot()`
3. Replace save/load with Firestore operations
4. Add organization creation with auto-generated IDs
5. Add organization update/delete
6. Test multi-device sync

**Files to modify**:

- `src/context/OrgContext.tsx` - Replace AsyncStorage with Firestore

---

### Step 4: Migrate DataContext (2-3 hours)

**Goal**: Move work entries from AsyncStorage to Firestore

**Current Implementation** (AsyncStorage):

```typescript
// Work entries stored locally
const entries = await AsyncStorage.getItem(STORAGE_KEYS.WORK_ENTRIES);
```

**New Implementation** (Firestore):

```typescript
// Work entries with real-time sync
const unsubscribe = firestore()
  .collection('workEntries')
  .where('organizationId', '==', currentOrgId)
  .orderBy('date', 'desc')
  .onSnapshot(snapshot => {
    const entries = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    setWorkEntries(entries);
  });
```

**Firestore Structure**:

```
/workEntries/{entryId}
  - organizationId: string
  - employeeId: string
  - employeeName: string
  - serviceId: string
  - serviceName: string
  - date: timestamp
  - amount: number
  - commission: number
  - createdAt: timestamp
  - updatedAt: timestamp
```

**Tasks**:

1. Create Firestore collection for work entries
2. Add real-time listener for current organization
3. Replace save/load with Firestore operations
4. Add work entry creation/update/delete
5. Optimize queries for daily summaries
6. Test real-time updates

**Files to modify**:

- `src/context/DataContext.tsx` - Replace AsyncStorage with Firestore

---

### Step 5: Add Firestore Security Rules (1 hour)

**Goal**: Protect data with server-side security rules

**Security Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }

    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }

    // User profiles
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId);
    }

    // Organizations
    match /organizations/{orgId} {
      allow read: if isAuthenticated() &&
        resource.data.ownerId == request.auth.uid;
      allow create: if isAuthenticated() &&
        request.resource.data.ownerId == request.auth.uid;
      allow update, delete: if isAuthenticated() &&
        resource.data.ownerId == request.auth.uid;
    }

    // Work entries
    match /workEntries/{entryId} {
      allow read: if isAuthenticated() &&
        get(/databases/$(database)/documents/organizations/$(resource.data.organizationId)).data.ownerId == request.auth.uid;
      allow create: if isAuthenticated() &&
        get(/databases/$(database)/documents/organizations/$(request.resource.data.organizationId)).data.ownerId == request.auth.uid;
      allow update, delete: if isAuthenticated() &&
        get(/databases/$(database)/documents/organizations/$(resource.data.organizationId)).data.ownerId == request.auth.uid;
    }
  }
}
```

**Tasks**:

1. Navigate to Firebase Console → Firestore → Rules
2. Replace test mode rules with production rules
3. Test that unauthorized access is blocked
4. Verify authorized access works

**Where to add**:

- Firebase Console → Firestore Database → Rules tab

---

### Step 6: Testing (2-3 hours)

**Goal**: Verify all Firebase features work correctly

**Test Cases**:

**Authentication Tests**:

- [ ] Register new account
- [ ] Login with valid credentials
- [ ] Login fails with invalid credentials
- [ ] Logout clears session
- [ ] Session persists on app restart
- [ ] Password reset email works

**Organization Tests**:

- [ ] Create organization
- [ ] Organization appears immediately
- [ ] Edit organization name
- [ ] Delete organization
- [ ] Login on second device - see same organizations
- [ ] Add organization on device 1 - appears on device 2

**Work Entry Tests**:

- [ ] Add work entry
- [ ] Work entry appears immediately
- [ ] Edit work entry
- [ ] Delete work entry
- [ ] Daily summary calculates correctly
- [ ] Employee rankings show correct data
- [ ] Add entry on device 1 - appears on device 2 instantly

**Offline Tests**:

- [ ] Turn off WiFi
- [ ] Add work entries (should work)
- [ ] Turn on WiFi
- [ ] Verify entries sync to Firestore

**Security Tests**:

- [ ] Create second test account
- [ ] Verify Account A cannot see Account B's data
- [ ] Verify Account B cannot modify Account A's organizations

---

## 📊 Progress Tracking

**Estimated Time**: 8-10 hours total

- [ ] Step 1: Initialize Firebase (30 min)
- [ ] Step 2: Migrate AuthContext (2-3 hours)
- [ ] Step 3: Migrate OrgContext (2-3 hours)
- [ ] Step 4: Migrate DataContext (2-3 hours)
- [ ] Step 5: Add Security Rules (1 hour)
- [ ] Step 6: Testing (2-3 hours)

---

## 🚀 Let's Begin!

**Starting with Step 1**: Initialize Firebase in App.tsx

This will:

- Set up Firebase on app startup
- Enable offline persistence
- Add connection monitoring
- Add error handling

**Ready to start?** Let me know and I'll begin the integration! 🔥
