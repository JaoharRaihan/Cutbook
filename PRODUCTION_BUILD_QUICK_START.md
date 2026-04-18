# 🚀 Quick Start: Build Production Apps (30 Minutes)

**Let's get your apps built and ready for store submission!**

---

## 🤖 Part 1: Android Build (15 minutes)

### Step 1: Generate Keystore (5 min)

Run this command and answer the prompts:

```bash
cd ~/Desktop/NAW/CutBook/android/app
keytool -genkeypair -v -storetype PKCS12 -keystore cutbook-release.keystore -alias cutbook-key -keyalg RSA -keysize 2048 -validity 10000
```

**You'll be asked**:

```
Enter keystore password: [type a strong password - WRITE IT DOWN!]
Re-enter new password: [same password]
What is your first and last name?: Jaohar Raihan
What is the name of your organizational unit?: CutBook
What is the name of your organization?: CutBook
What is the name of your City or Locality?: Dhaka
What is the name of your State or Province?: Dhaka
What is the two-letter country code for this unit?: BD
Is CN=..., OU=..., O=..., L=..., ST=..., C=... correct? yes

Enter key password for <cutbook-key>: [press ENTER to use same password]
```

✅ **Result**: `cutbook-release.keystore` file created in `android/app/`

⚠️ **IMPORTANT**: Write down your password! Keep the keystore file safe!

---

### Step 2: Configure Signing (3 min)

I'll update the files for you. Just provide your keystore password when ready.

**Your keystore password**: ********\_********

---

### Step 3: Build AAB for Play Store (7 min)

```bash
cd ~/Desktop/NAW/CutBook/android
./gradlew clean
./gradlew bundleRelease
```

⏳ **Wait**: 5-7 minutes for build to complete

✅ **Output**: `android/app/build/outputs/bundle/release/app-release.aab`

**File size**: ~25-35 MB

---

### Optional: Build APK for Testing

```bash
./gradlew assembleRelease
```

✅ **Output**: `android/app/build/outputs/apk/release/app-release.apk`

**Test on device**:

```bash
adb install app/build/outputs/apk/release/app-release.apk
```

---

## 🍎 Part 2: iOS Build (15 minutes)

### Prerequisites:

- ✅ Mac computer
- ✅ Xcode installed
- ✅ Apple Developer Account ($99/year)

### Step 1: Open Xcode (1 min)

```bash
cd ~/Desktop/NAW/CutBook/ios
open CutBook.xcworkspace
```

---

### Step 2: Configure Signing (5 min)

1. Select **"CutBook"** project in left sidebar
2. Select **"CutBook"** target
3. Go to **"Signing & Capabilities"** tab
4. Check **"Automatically manage signing"**
5. Select **Team**: Your Apple Developer team
6. Verify **Bundle Identifier**: `com.cutbook`

Xcode will automatically create certificates and profiles!

---

### Step 3: Archive & Export (9 min)

1. Select **"Any iOS Device (arm64)"** at top
2. Menu: **Product** → **Archive**
3. ⏳ Wait 5-7 minutes for archive
4. In Organizer:
   - Click **"Distribute App"**
   - Select **"App Store Connect"** → Next
   - Select **"Upload"** → Next
   - Click **"Upload"**
5. ⏳ Wait 2-3 minutes

✅ **Done**: Build uploaded to App Store Connect!

---

## 📱 What You'll Have:

### Android:

- ✅ `app-release.aab` (for Play Store)
- ✅ `app-release.apk` (for testing)
- ✅ `cutbook-release.keystore` (keep safe forever!)

### iOS:

- ✅ Build uploaded to App Store Connect
- ✅ Ready to submit for review

---

## 🎯 Next Steps:

1. **Play Store**:
   - Create app listing at https://play.google.com/console
   - Upload `app-release.aab`
   - Add screenshots and description
   - Submit for review

2. **App Store**:
   - Go to https://appstoreconnect.apple.com
   - Create app record
   - Select uploaded build
   - Add screenshots and description
   - Submit for review

---

## 💡 Tips:

- **Screenshots**: Take from simulator/emulator (1080x1920 for Android, various for iOS)
- **App Icon**: 512x512 for Play Store, 1024x1024 for App Store
- **Description**: Use the template in PHASE_10_PRODUCTION_BUILD.md
- **Privacy Policy**: Required for both stores (can create at https://app-privacy-policy-generator.firebaseapp.com/)

---

## 🆘 Troubleshooting:

**Android build fails**:

```bash
cd android
./gradlew clean
# Try build again
```

**iOS archive fails**:

- Product → Clean Build Folder
- Try archive again

**Keystore password forgotten**:

- ⚠️ Cannot recover! Must generate new keystore
- New keystore = new app (cannot update existing app)

---

**Ready to start? Let's generate the keystore!** 🔑
