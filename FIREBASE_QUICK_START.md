# 🚀 Firebase Quick Start Guide

**Goal**: Get Firebase set up in 30 minutes
**What you'll do**: Create project, install packages, basic config

---

## Step 1: Create Firebase Project (10 minutes)

### 1.1 Go to Firebase Console

🔗 **https://console.firebase.google.com/**

### 1.2 Create New Project

1. Click **"Create a project"** or **"Add project"**
2. **Project name**: `CutBook`
3. Click **Continue**
4. **Enable Google Analytics**: ✅ Yes (recommended)
5. Select **Default Account for Firebase**
6. Click **Create project**
7. Wait ~30 seconds for setup
8. Click **Continue** when done

---

## Step 2: Add Android App (5 minutes)

### 2.1 Register Android App

1. In Firebase Console → Click **Android icon** (robot)
2. **Android package name**: `com.cutbook`
3. **App nickname**: `CutBook Android` (optional)
4. **Debug signing certificate SHA-1**: Leave blank for now
5. Click **Register app**

### 2.2 Download Config File

1. Click **Download google-services.json**
2. Save file to your computer
3. **IMPORTANT**: Move it to: `android/app/google-services.json`

### 2.3 Follow Firebase Instructions

- Skip SDK setup for now (we'll do it next)
- Click **Next** → **Next** → **Continue to console**

---

## Step 3: Add iOS App (5 minutes)

### 3.1 Register iOS App

1. In Firebase Console → Click **iOS icon** (Apple)
2. **iOS bundle ID**: `com.cutbook`
3. **App nickname**: `CutBook iOS` (optional)
4. **App Store ID**: Leave blank
5. Click **Register app**

### 3.2 Download Config File

1. Click **Download GoogleService-Info.plist**
2. Save file to your computer
3. **IMPORTANT**: You'll add this to Xcode later

### 3.3 Continue

- Skip SDK setup for now
- Click **Next** → **Next** → **Continue to console**

---

## Step 4: Enable Authentication (3 minutes)

### 4.1 Go to Authentication

1. In Firebase Console → Left sidebar
2. Click **Build** → **Authentication**
3. Click **Get started**

### 4.2 Enable Email/Password

1. Click **Sign-in method** tab
2. Click **Email/Password**
3. Toggle **Enable** switch ON
4. Click **Save**

---

## Step 5: Enable Firestore Database (5 minutes)

### 5.1 Create Database

1. In Firebase Console → Left sidebar
2. Click **Build** → **Firestore Database**
3. Click **Create database**

### 5.2 Security Rules

- Select **Start in test mode** (for now)
- We'll add proper security rules later
- Click **Next**

### 5.3 Location

- Select **asia-south1** (Mumbai - closest to Bangladesh)
- Click **Enable**
- Wait ~30 seconds for database creation

---

## Step 6: Install React Native Firebase (5 minutes)

### 6.1 Open Terminal in Your Project

```bash
cd /Users/jaoharraihan/Desktop/NAW/CutBook
```

### 6.2 Install Packages

```bash
npm install @react-native-firebase/app
npm install @react-native-firebase/auth
npm install @react-native-firebase/firestore
```

### 6.3 iOS CocoaPods (Mac only)

```bash
cd ios
pod install
cd ..
```

---

## Step 7: Add Firebase to Android (Already done!)

The `google-services.json` file you downloaded needs to be in:

```
android/app/google-services.json
```

Make sure it's there!

---

## Step 8: Add Firebase to iOS (5 minutes)

### 8.1 Open Xcode

```bash
open ios/CutBook.xcworkspace
```

### 8.2 Add GoogleService-Info.plist

1. In Xcode left sidebar, right-click on **CutBook** folder
2. Select **Add Files to "CutBook"...**
3. Select the `GoogleService-Info.plist` file you downloaded
4. ✅ Check **"Copy items if needed"**
5. ✅ Check **"Add to targets: CutBook"**
6. Click **Add**

---

## ✅ Verification Checklist

After completing all steps, verify:

- [ ] Firebase project created: `CutBook`
- [ ] Android app registered in Firebase
- [ ] `google-services.json` in `android/app/`
- [ ] iOS app registered in Firebase
- [ ] `GoogleService-Info.plist` added to Xcode project
- [ ] Authentication enabled (Email/Password)
- [ ] Firestore Database created (test mode)
- [ ] NPM packages installed
- [ ] iOS pods installed

---

## 🎯 What's Next?

Once Firebase is set up, I'll help you:

1. **Update AuthContext** - Replace mock auth with Firebase Auth
2. **Update OrgContext** - Store organizations in Firestore
3. **Update DataContext** - Store work entries in Firestore
4. **Add Real-time Sync** - Listen to database changes
5. **Add Security Rules** - Protect your data
6. **Test Multi-device** - Verify sync works

---

## 🆘 Common Issues

### "google-services.json not found"

→ Make sure file is in `android/app/` folder (not `android/`)

### "GoogleService-Info.plist not found"

→ Open Xcode and add file properly (Step 8.2)

### "pod install failed"

→ Try: `cd ios && pod deintegrate && pod install`

### "Firebase not initialized"

→ Restart Metro bundler: `npm start --reset-cache`

---

## 📞 Ready to Continue?

**Tell me when you've completed these steps:**

- "Firebase setup complete" → I'll start integration
- "Stuck on step X" → I'll help you troubleshoot
- "Need help with X" → I'll guide you through it

---

**Time estimate**: 30-40 minutes total
**Next phase**: 8-10 hours of code integration

---

_Firebase will transform your app into a cloud-connected, team-synced powerhouse!_ 🔥
