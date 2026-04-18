# 📦 CutBook - Build & Deployment Guide

**Project:** CutBook - Barber/Salon Management App  
**Version:** 1.0.0  
**Platform:** React Native (iOS & Android)  
**Date:** December 13, 2025

---

## 📋 Pre-Build Checklist

### Code Quality
- [ ] All TypeScript errors resolved
- [ ] ESLint warnings addressed
- [ ] No console.log statements in production code
- [ ] All commented code removed
- [ ] README.md updated

### Testing
- [ ] All manual tests passed (see TESTING_CHECKLIST.md)
- [ ] Edge cases tested
- [ ] Mock data persistence verified
- [ ] Navigation flows work
- [ ] Both languages tested (EN/BN)

### App Configuration
- [ ] App name set correctly
- [ ] Package name/Bundle ID configured
- [ ] App icon added
- [ ] Splash screen configured
- [ ] Version numbers set
- [ ] Permissions configured

---

## 🤖 Step 20.1: Android Build

### Prerequisites

```bash
# Check Java version (required: JDK 11 or newer)
java -version

# Check Android SDK
echo $ANDROID_HOME

# Verify Gradle
cd android && ./gradlew --version && cd ..
```

### Build Configuration

**File: `android/app/build.gradle`**

Update version codes:
```gradle
android {
    defaultConfig {
        applicationId "com.cutbook"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode 1
        versionName "1.0.0"
    }
}
```

### Generate Debug APK

```bash
# Clean previous builds
cd android
./gradlew clean
cd ..

# Generate debug APK
cd android
./gradlew assembleDebug
cd ..

# APK location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

### Generate Release APK (Unsigned)

```bash
# Build release APK (unsigned)
cd android
./gradlew assembleRelease
cd ..

# APK location:
# android/app/build/outputs/apk/release/app-release-unsigned.apk
```

### Generate Signed Release APK

**Step 1: Generate Keystore**

```bash
# Generate keystore (one-time setup)
keytool -genkeypair -v \
  -keystore cutbook-release-key.keystore \
  -alias cutbook-key-alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# Enter password when prompted (remember this!)
# Store keystore in: android/app/cutbook-release-key.keystore
```

**Step 2: Configure Signing**

Create `android/gradle.properties` (add to .gitignore):
```properties
CUTBOOK_UPLOAD_STORE_FILE=cutbook-release-key.keystore
CUTBOOK_UPLOAD_KEY_ALIAS=cutbook-key-alias
CUTBOOK_UPLOAD_STORE_PASSWORD=your_keystore_password
CUTBOOK_UPLOAD_KEY_PASSWORD=your_key_password
```

Update `android/app/build.gradle`:
```gradle
android {
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
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

**Step 3: Build Signed APK**

```bash
cd android
./gradlew assembleRelease
cd ..

# Signed APK location:
# android/app/build/outputs/apk/release/app-release.apk
```

### Test on Real Device

```bash
# Connect Android device via USB (enable USB debugging)
adb devices

# Install debug APK
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Or install release APK
adb install android/app/build/outputs/apk/release/app-release.apk

# Monitor logs
adb logcat *:S ReactNative:V ReactNativeJS:V
```

### Performance Check (Android)

```bash
# Check app size
ls -lh android/app/build/outputs/apk/release/app-release.apk

# Analyze APK
cd android
./gradlew :app:analyzeReleaseBundle
cd ..

# Check memory usage (while app is running)
adb shell dumpsys meminfo com.cutbook
```

### Common Android Build Issues

**Issue: Gradle build fails**
```bash
# Clear Gradle cache
cd android
./gradlew clean
./gradlew cleanBuildCache
cd ..
```

**Issue: "SDK location not found"**
```bash
# Create android/local.properties
echo "sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk" > android/local.properties
```

**Issue: "Java heap space"**
```bash
# Increase Gradle memory in android/gradle.properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError -Dfile.encoding=UTF-8
```

---

## 🍎 Step 20.2: iOS Build (Mac Only)

### Prerequisites

```bash
# Check Xcode
xcodebuild -version

# Check CocoaPods
pod --version

# Install/Update pods
cd ios
pod install
cd ..
```

### Build Configuration

**File: `ios/CutBook/Info.plist`**

Update version:
```xml
<key>CFBundleShortVersionString</key>
<string>1.0.0</string>
<key>CFBundleVersion</key>
<string>1</string>
```

### Run on iOS Simulator

```bash
# List available simulators
xcrun simctl list devices

# Run on iOS simulator
npx react-native run-ios

# Or specify simulator
npx react-native run-ios --simulator="iPhone 14 Pro"
```

### Build for Real Device

**Step 1: Configure Signing**

1. Open `ios/CutBook.xcworkspace` in Xcode
2. Select "CutBook" target
3. Go to "Signing & Capabilities"
4. Select your Team
5. Xcode will auto-generate provisioning profile

**Step 2: Connect Device**

1. Connect iPhone/iPad via USB
2. Trust computer on device
3. Select device in Xcode
4. Click "Build" (Cmd+B)

**Step 3: Run on Device**

```bash
# Run on connected device
npx react-native run-ios --device
```

### Generate IPA for TestFlight (Optional)

**Step 1: Archive**

1. Open Xcode
2. Product → Archive
3. Wait for archive to complete

**Step 2: Export IPA**

1. Window → Organizer
2. Select archive
3. "Distribute App"
4. Choose "Ad Hoc" or "Development"
5. Export IPA

**Step 3: Upload to TestFlight**

1. Use Transporter app
2. Upload IPA
3. Wait for processing
4. Add to TestFlight

### Performance Check (iOS)

```bash
# Check app size
ls -lh ios/build/Build/Products/Release-iphoneos/CutBook.app

# Instruments (profiling)
# Use Xcode Instruments for detailed profiling
```

---

## 🎯 Step 20.3: Demo Data Setup

### Demo Scenario

**1 Salon with 5 Employees**
- Owner: "Karim Ahmed" (Salon Manager)
- Employees:
  - "Rashed Ali" (Senior Barber) - 20% commission
  - "Shakib Hassan" (Junior Barber) - 15% commission
  - "Tanvir Islam" (Specialist) - 25% commission
  - "Fahim Rahman" (Trainee) - 10% commission

**7 Days of Entries**
- Total entries: 50-70 entries
- Mix of payment methods (Cash, bKash, Card)
- Various services (Haircut, Shave, Facial, etc.)
- Different price points (৳100 - ৳1,500)

**Services List**
- Haircut (Regular): ৳200
- Haircut (Premium): ৳400
- Shave: ৳100
- Beard Trim: ৳150
- Facial: ৳800
- Hair Color: ৳1,200
- Massage: ৳600

### Demo Data Script

See: `src/utils/demoData.ts` (created separately)

### Loading Demo Data

**On First Launch:**
1. Show "Demo Mode" banner
2. Auto-populate with realistic data
3. Allow user to clear and start fresh

**Or Manual:**
1. Go to Settings
2. "Load Demo Data" button
3. Confirmation dialog
4. Data loaded

---

## 📱 App Store Requirements

### App Icon

**Android:**
- Sizes: 48x48, 72x72, 96x96, 144x144, 192x192, 512x512
- Location: `android/app/src/main/res/mipmap-*/ic_launcher.png`

**iOS:**
- Sizes: Multiple sizes in Assets.xcassets
- Location: `ios/CutBook/Images.xcassets/AppIcon.appiconset/`

### Splash Screen

**Android:**
- Location: `android/app/src/main/res/drawable/launch_screen.png`

**iOS:**
- Location: `ios/CutBook/LaunchScreen.storyboard`

### Screenshots

Required sizes:
- iPhone 6.7" (1290 x 2796)
- iPhone 6.5" (1284 x 2778)
- iPhone 5.5" (1242 x 2208)
- Android Phone (1080 x 1920)
- Android Tablet (1600 x 2560)

Recommended screenshots:
1. Dashboard with today's summary
2. Employee list
3. Add work entry form
4. Reports screen
5. Bengali language view

### App Description

**Short Description (80 chars):**
"Manage your salon/barber shop: track services, employees, income & reports."

**Full Description:**
See: `APP_STORE_DESCRIPTION.md` (created separately)

### Privacy Policy

Required for app stores. See: `PRIVACY_POLICY.md`

---

## 🚀 Deployment Steps

### Google Play Store

1. **Create Developer Account** ($25 one-time fee)
2. **Create App in Console**
   - App name: "CutBook"
   - Category: Business
3. **Upload APK/AAB**
   - Internal testing track first
   - Then production
4. **Complete Store Listing**
   - Screenshots
   - Description
   - Privacy policy
5. **Submit for Review**

### Apple App Store

1. **Apple Developer Account** ($99/year)
2. **Create App in App Store Connect**
   - Bundle ID: com.cutbook
   - App name: "CutBook"
3. **Upload Build via Xcode/Transporter**
4. **Complete App Information**
   - Screenshots
   - Description
   - Privacy policy
5. **Submit for Review**

---

## 📊 Build Artifacts

### Generated Files

```
builds/
├── android/
│   ├── app-debug.apk          (Debug build for testing)
│   ├── app-release.apk        (Signed release)
│   └── app-release.aab        (Android App Bundle for Play Store)
├── ios/
│   ├── CutBook.app            (iOS app bundle)
│   └── CutBook.ipa            (For TestFlight/App Store)
└── README.md                  (Build notes)
```

### Version Tracking

```
Version 1.0.0 (Build 1) - December 13, 2025
- Initial release
- Owner dashboard
- Employee management
- Work entry tracking
- Reports & analytics
- Bengali language support
- Offline mock data
```

---

## ✅ Final Checklist

### Pre-Release
- [ ] All features working
- [ ] No critical bugs
- [ ] Tested on real devices (Android & iOS)
- [ ] Demo data loaded
- [ ] Screenshots taken
- [ ] App icon added
- [ ] Splash screen configured
- [ ] Privacy policy written
- [ ] App store listings prepared

### Build
- [ ] Android APK generated
- [ ] iOS IPA generated (if applicable)
- [ ] Both signed properly
- [ ] File sizes acceptable (<50MB ideal)
- [ ] Performance tested

### Distribution
- [ ] Uploaded to Play Store / App Store
- [ ] TestFlight build (iOS)
- [ ] Internal testing completed
- [ ] External testing (optional)
- [ ] Submitted for review

### Post-Launch
- [ ] Monitor crash reports
- [ ] Check user reviews
- [ ] Respond to feedback
- [ ] Plan v1.1 features

---

## 📞 Support & Resources

### Documentation
- React Native Docs: https://reactnative.dev
- Android Deployment: https://reactnative.dev/docs/signed-apk-android
- iOS Deployment: https://reactnative.dev/docs/publishing-to-app-store

### Tools
- Android Studio: https://developer.android.com/studio
- Xcode: https://developer.apple.com/xcode/
- Fastlane (CI/CD): https://fastlane.tools/

### Community
- React Native Discord
- Stack Overflow
- GitHub Issues

---

## 🎉 Congratulations!

Your CutBook app is now ready for deployment! 🚀

**Next Steps:**
1. Load demo data
2. Test on real devices
3. Take screenshots
4. Submit to app stores
5. Start marketing!

Good luck! 💪
