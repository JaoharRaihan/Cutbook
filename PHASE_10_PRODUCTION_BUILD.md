# 🚀 Phase 10: Production Build Guide

**Date**: January 19, 2026
**Status**: Ready to Build
**Goal**: Generate production builds for Play Store and App Store

---

## 📋 Overview

This phase will guide you through:

1. ✅ Generate Android Keystore (signing certificate)
2. ✅ Configure Android Build for Release
3. ✅ Build Android APK/AAB
4. ✅ Configure iOS Signing
5. ✅ Build iOS IPA
6. ✅ Deploy to Stores

**Estimated Time**: 3-4 hours

---

## 📦 Part 1: Android Production Build (1-2 hours)

### Step 1: Generate Android Keystore (15 min)

A keystore is a signing certificate that proves you're the legitimate developer of the app.

**Important**: Keep this file VERY secure! If you lose it, you can never update your app again!

#### Generate Keystore Command:

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore cutbook-release.keystore -alias cutbook-key -keyalg RSA -keysize 2048 -validity 10000
```

**You'll be asked for**:

- **Keystore password**: Choose a strong password (write it down!)
- **Key password**: Can be same as keystore password
- **Name**: Your name or company name
- **Organization**: CutBook
- **City**: Dhaka
- **State**: Dhaka
- **Country Code**: BD

**Output**: Creates `cutbook-release.keystore` file in `android/app/`

⚠️ **SECURITY**:

- ✅ Keep keystore file safe (backup to secure location)
- ✅ Keep passwords safe (use password manager)
- ❌ NEVER commit keystore to Git
- ❌ NEVER share keystore publicly

---

### Step 2: Configure Android Signing (10 min)

#### A. Create `gradle.properties` (if not exists)

Create/edit: `android/gradle.properties`

Add these lines:

```properties
CUTBOOK_UPLOAD_STORE_FILE=cutbook-release.keystore
CUTBOOK_UPLOAD_KEY_ALIAS=cutbook-key
CUTBOOK_UPLOAD_STORE_PASSWORD=your_keystore_password
CUTBOOK_UPLOAD_KEY_PASSWORD=your_key_password
```

⚠️ **Add to .gitignore**:

```bash
# Add this line to your .gitignore
android/gradle.properties
android/app/cutbook-release.keystore
```

#### B. Update `android/app/build.gradle`

Find the `signingConfigs` section and add:

```gradle
android {
    // ...existing config...

    signingConfigs {
        release {
            if (project.hasProperty('CUTBOOK_UPLOAD_STORE_FILE')) {
                storeFile file(CUTBOOK_UPLOAD_STORE_FILE)
                storePassword CUTBOOK_UPLOAD_STORE_PASSWORD
                keyAlias CUTBOOK_UPLOAD_KEY_ALIAS
                keyPassword CUTBOOK_UPLOAD_KEY_PASSWORD
            }
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

### Step 3: Build Android APK/AAB (30 min)

#### Option A: Build AAB (App Bundle) - Recommended for Play Store

```bash
cd android
./gradlew bundleRelease
```

**Output**: `android/app/build/outputs/bundle/release/app-release.aab`

**File size**: ~20-30 MB

#### Option B: Build APK (for testing or direct distribution)

```bash
cd android
./gradlew assembleRelease
```

**Output**: `android/app/build/outputs/apk/release/app-release.apk`

**File size**: ~40-50 MB

**Note**: Play Store requires AAB, but APK is useful for testing before uploading.

---

### Step 4: Test Release Build (10 min)

Install the APK on your device to test:

```bash
adb install android/app/build/outputs/apk/release/app-release.apk
```

**Test Checklist**:

- [ ] App opens without crashing
- [ ] Login/Register works
- [ ] Create organization works
- [ ] Add work entry works
- [ ] Data syncs across devices
- [ ] No debug messages visible

---

## 🍎 Part 2: iOS Production Build (1-2 hours)

### Step 1: Apple Developer Account Setup (30 min)

**Prerequisites**:

1. Apple Developer Account ($99/year)
   - Enroll at: https://developer.apple.com/programs/enroll/
2. Mac computer with Xcode installed

#### A. Create App ID

1. Go to: https://developer.apple.com/account/resources/identifiers/list
2. Click **"+"** to create new identifier
3. Select **"App IDs"** → Continue
4. Select **"App"** → Continue
5. Fill in:
   - **Description**: CutBook
   - **Bundle ID**: `com.cutbook` (explicit)
   - **Capabilities**: Enable "Sign in with Apple" if needed
6. Click **"Continue"** → **"Register"**

#### B. Create Certificates

1. Go to: https://developer.apple.com/account/resources/certificates/list
2. Click **"+"** to create new certificate
3. Select **"iOS Distribution"** → Continue
4. Follow instructions to create Certificate Signing Request (CSR)
5. Upload CSR and download certificate
6. Double-click certificate to install in Keychain

#### C. Create Provisioning Profile

1. Go to: https://developer.apple.com/account/resources/profiles/list
2. Click **"+"** to create new profile
3. Select **"App Store"** → Continue
4. Select your App ID (com.cutbook) → Continue
5. Select your Distribution Certificate → Continue
6. Name it: "CutBook App Store" → Generate
7. Download and double-click to install

---

### Step 2: Configure Xcode Signing (15 min)

1. Open Xcode:

```bash
cd ios
open CutBook.xcworkspace
```

2. Select **CutBook** project in left sidebar
3. Select **CutBook** target
4. Go to **"Signing & Capabilities"** tab
5. **Uncheck** "Automatically manage signing"
6. Select:
   - **Team**: Your Apple Developer team
   - **Provisioning Profile**: "CutBook App Store"
7. Verify Bundle Identifier: `com.cutbook`

---

### Step 3: Update iOS Version & Build Number (5 min)

In Xcode, under **"General"** tab:

- **Version**: 1.0.0
- **Build**: 1

Or edit `ios/CutBook/Info.plist`:

```xml
<key>CFBundleShortVersionString</key>
<string>1.0.0</string>
<key>CFBundleVersion</key>
<string>1</string>
```

---

### Step 4: Archive and Export IPA (20 min)

#### A. Archive the App

1. In Xcode, select **"Any iOS Device (arm64)"** as destination
2. Menu: **Product** → **Archive**
3. Wait for build to complete (5-10 minutes)
4. Xcode Organizer will open automatically

#### B. Export IPA

1. Select the archive
2. Click **"Distribute App"**
3. Select **"App Store Connect"** → Next
4. Select **"Upload"** → Next
5. Select your provisioning profile → Next
6. Review and click **"Export"**
7. Choose save location
8. Wait for export (2-3 minutes)

**Output**: `CutBook.ipa` file (~50-70 MB)

---

## 📱 Part 3: Deploy to Stores (1 hour)

### A. Google Play Store Submission

#### 1. Create Play Console Account

- Go to: https://play.google.com/console
- Pay one-time $25 registration fee

#### 2. Create App Listing

1. Click **"Create app"**
2. Fill in:
   - **App name**: CutBook - Salon Manager
   - **Default language**: English (US) or Bengali
   - **App or game**: App
   - **Free or paid**: Free
   - **Declarations**: Check required boxes

#### 3. Complete Store Listing

Go to **"Store presence"** → **"Main store listing"**:

- **Short description**: (80 chars)

  ```
  Professional salon management app. Track work, earnings, and employees easily.
  ```

- **Full description**: (4000 chars)

  ```
  CutBook is a comprehensive salon and barbershop management solution designed for
  salon owners and employees in Bangladesh. Manage your business efficiently with
  real-time tracking, multi-device sync, and detailed analytics.

  KEY FEATURES:
  ✅ Work Entry Tracking
  ✅ Employee Management
  ✅ Service Management
  ✅ Daily Summaries & Reports
  ✅ Multi-Device Sync
  ✅ Offline Support
  ✅ Payment Method Tracking (Cash, bKash, Nagad, Card)
  ✅ Commission Calculation
  ✅ Team Collaboration

  PERFECT FOR:
  - Salon Owners
  - Barbershop Managers
  - Beauty Parlors
  - Spa Centers
  - Hair Stylists
  - Employees

  CONTACT: jaoharraihan@gmail.com
  ```

- **App icon**: 512x512 PNG (create with AI or designer)
- **Feature graphic**: 1024x500 PNG
- **Phone screenshots**: At least 2 (1080x1920 or similar)

#### 4. Upload AAB

1. Go to **"Release"** → **"Production"**
2. Click **"Create new release"**
3. Upload `app-release.aab`
4. Fill in release notes:
   ```
   Initial release of CutBook
   - Professional salon management
   - Real-time sync across devices
   - Offline support
   - Employee tracking
   ```
5. Click **"Save"** → **"Review release"** → **"Start rollout to Production"**

**Review time**: 1-7 days

---

### B. Apple App Store Submission

#### 1. Create App Store Connect Record

1. Go to: https://appstoreconnect.apple.com
2. Click **"My Apps"** → **"+"** → **"New App"**
3. Fill in:
   - **Platform**: iOS
   - **Name**: CutBook - Salon Manager
   - **Primary Language**: English (US)
   - **Bundle ID**: com.cutbook
   - **SKU**: cutbook
   - **User Access**: Full Access

#### 2. Fill App Information

- **Name**: CutBook - Salon Manager
- **Subtitle**: Professional Salon Management
- **Category**: Business / Productivity
- **Content Rights**: Check if you own rights

#### 3. Prepare for Submission

**App Store Icon**: 1024x1024 PNG (no transparency, no rounded corners)

**Screenshots** (Required for each device):

- iPhone 6.7" (1290x2796): At least 1
- iPhone 6.5" (1242x2688): At least 1
- iPad Pro 12.9" (2048x2732): At least 1

**Description**:

```
CutBook is the ultimate salon management app for barbershops, beauty salons,
and spa centers. Designed specifically for Bangladeshi businesses.

FEATURES:
• Track daily work entries and earnings
• Manage employees and services
• Real-time sync across multiple devices
• Work offline - data syncs automatically
• Detailed daily and employee reports
• Support for bKash, Nagad, and other payment methods
• Professional commission tracking
• Multi-language support

PERFECT FOR:
Salon owners, barbershop managers, stylists, and beauty professionals who
want to streamline their business operations.

Contact: jaoharraihan@gmail.com
```

#### 4. Upload Build

1. In App Store Connect, go to your app
2. Under **"Build"**, click **"+"**
3. Select the build you uploaded via Xcode
4. Fill in **"What's New in This Version"**:
   ```
   Initial release
   - Professional salon management tools
   - Real-time multi-device sync
   - Offline support
   - Comprehensive reporting
   ```

#### 5. Submit for Review

1. Complete all required fields
2. Add app review information:
   - **Email**: jaoharraihan@gmail.com
   - **Phone**: Your phone number
   - **Test credentials** (create a demo account):
     - Username: demo@cutbook.app
     - Password: Demo@123
3. Click **"Submit for Review"**

**Review time**: 1-3 days (usually 24-48 hours)

---

## ✅ Pre-Submission Checklist

### Android

- [ ] Keystore generated and backed up
- [ ] Version set to 1.0.0
- [ ] AAB built successfully
- [ ] Release APK tested on physical device
- [ ] All features working in release mode
- [ ] No debug logs visible
- [ ] Store listing complete
- [ ] Screenshots prepared (at least 2)
- [ ] Feature graphic created
- [ ] Privacy policy uploaded

### iOS

- [ ] Apple Developer account active
- [ ] App ID created
- [ ] Distribution certificate created
- [ ] Provisioning profile created
- [ ] Xcode signing configured
- [ ] Version set to 1.0.0
- [ ] Archive created successfully
- [ ] IPA exported
- [ ] App Store listing complete
- [ ] Screenshots for all required devices
- [ ] App icon (1024x1024) ready
- [ ] Privacy policy URL provided

---

## 🎉 After Submission

### What Happens Next:

**Google Play Store**:

1. Automated review (15 minutes - 2 hours)
2. Manual review (if flagged): 1-7 days
3. Published! Users can download immediately

**Apple App Store**:

1. Manual review: 24-72 hours
2. Possible rejection (can resubmit with fixes)
3. Approved and published!

### Common Rejection Reasons:

**Both Stores**:

- Missing privacy policy
- Misleading screenshots
- Bugs or crashes
- Insufficient testing

**Apple Specific**:

- Guideline 4.3 (spam/duplicate)
- Missing demo credentials
- Incomplete functionality
- UI/UX issues

---

## 🔧 Troubleshooting

### Android Build Errors:

**"Keystore not found"**:

- Check path in gradle.properties
- Ensure keystore file is in android/app/

**"Signing config not found"**:

- Check build.gradle signingConfigs section
- Verify gradle.properties has correct values

**"Duplicate resources"**:

- Clean build: `cd android && ./gradlew clean`
- Try again

### iOS Build Errors:

**"Code signing failed"**:

- Check Xcode signing settings
- Verify provisioning profile is valid
- Check certificate is in Keychain

**"Archive failed"**:

- Clean build folder: Product → Clean Build Folder
- Check for TypeScript errors
- Update CocoaPods: `cd ios && pod install`

**"Upload to App Store failed"**:

- Check bundle ID matches App ID
- Verify provisioning profile is App Store type
- Check version/build number

---

## 📞 Need Help?

**Issues during build**:

- Check error messages carefully
- Google the specific error
- Check React Native documentation
- Check Firebase documentation

**Store rejection**:

- Read rejection reason carefully
- Fix the issue
- Increment build number
- Resubmit

---

## 🎯 Success Metrics

Once published, monitor:

- **Downloads**: How many users install
- **Crashes**: Use Firebase Crashlytics
- **Reviews**: Respond to user feedback
- **Active users**: Daily/monthly active users
- **Retention**: How many users come back

---

## 🚀 Post-Launch

After successful launch:

1. Monitor crash reports
2. Respond to user reviews
3. Fix critical bugs immediately
4. Plan feature updates
5. Update regularly (every 2-4 weeks)

---

_Ready to build! Let's get CutBook on the app stores!_ 🎉
