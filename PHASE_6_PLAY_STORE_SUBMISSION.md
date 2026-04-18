# Phase 6: Google Play Store Submission Guide

**Status**: 📋 READY TO BEGIN
**Estimated Duration**: 4-6 hours
**Date**: February 2026

---

## Overview

Complete guide to submit your CutBook app to the Google Play Store. This phase covers creating store assets, generating a signed production build, and submitting to Google Play Console.

---

## Prerequisites Checklist

Before starting Phase 6, ensure:

- [x] Phase 5 testing completed
- [ ] All critical bugs fixed
- [ ] App tested on real device
- [ ] Firebase project is production-ready
- [ ] You have a Google Play Developer account ($25 one-time fee)
- [ ] You have app icons ready (launcher icons)
- [ ] Privacy Policy URL ready

---

## 📱 SECTION 1: Create Store Assets (2 hours)

### 1.1 App Screenshots (Required)

**Required**: Minimum 2 screenshots, maximum 8 screenshots per device type

#### Screenshot Requirements:

- **Format**: JPEG or 24-bit PNG (no alpha)
- **Dimensions**:
  - Phone: 1080 x 1920 minimum (9:16 aspect ratio)
  - Tablet: 1200 x 1920 minimum
- **File size**: Maximum 8MB each
- **Recommended**: 4-6 high-quality screenshots

#### Screenshots to Capture:

1. **Owner Dashboard** (Main screen)
   - Show daily summary with real data
   - Employee rankings visible
   - Service breakdown
   - Clean, professional look

2. **Add Work Entry** (Key feature)
   - Form with employee selection
   - Service selection
   - Payment methods
   - Professional and easy to use

3. **Employee Management** (Management feature)
   - List of employees
   - Shows commission rates
   - Clean interface

4. **Service Management** (Management feature)
   - Services grouped by category
   - Pricing visible
   - Easy navigation

5. **Employee View** (Employee perspective)
   - Employee home screen
   - Today's earnings
   - Recent services

6. **History/Reports** (Analytics)
   - Monthly history view
   - Summary statistics
   - Professional data display

#### How to Take Screenshots:

**On Android Device/Emulator:**

```bash
# 1. Open app and navigate to desired screen
# 2. Take screenshot
adb shell screencap -p /sdcard/screenshot.png

# 3. Pull screenshot to computer
adb pull /sdcard/screenshot.png ./screenshots/

# Alternative: Use Android Studio's screenshot tool
# Device Manager > ... > Screenshot
```

**Recommended Tools:**

- **Fastlane Frameit**: Add device frames
- **Figma/Canva**: Add text overlays and polish
- **Android Studio**: Built-in screenshot tool

#### Screenshot Tips:

- ✅ Use real data (not lorem ipsum)
- ✅ Show the app in use (not empty states)
- ✅ Keep UI clean and uncluttered
- ✅ Use consistent device/theme
- ✅ Add subtle text overlays explaining features
- ❌ Don't include personal/sensitive data
- ❌ Don't use copyrighted content
- ❌ Don't add excessive text

---

### 1.2 Feature Graphic (Required)

**Required**: 1 feature graphic

#### Requirements:

- **Dimensions**: 1024 x 500 pixels (exact)
- **Format**: JPEG or 24-bit PNG (no alpha)
- **File size**: Maximum 1MB
- **Purpose**: Displayed at top of store listing

#### Content Ideas:

- App logo + tagline
- Key features highlighted
- Clean, professional design
- Use app's color scheme (#2196F3 blue)
- Include "Salon Management" or "Commission Tracking"

#### Tools:

- Canva (easiest, templates available)
- Figma (professional)
- Adobe Spark (online, free)

---

### 1.3 App Icon (Required)

Already created! Located at:

- `android/app/src/main/res/mipmap-*/ic_launcher.png`
- `android/app/src/main/res/mipmap-*/ic_launcher_round.png`

**Verify icons**:

```bash
# Check if icons exist
ls -la android/app/src/main/res/mipmap-*/ic_launcher.png
```

---

### 1.4 Promotional Assets (Optional but Recommended)

#### Promo Video (Optional)

- **Length**: 30 seconds to 2 minutes
- **Format**: YouTube URL
- **Content**: Show app in action
- **Skip if**: Not enough time/budget

#### Promotional Graphics (Optional)

- **180 x 120**: Promo graphic (optional)
- Skip for initial launch

---

## 📝 SECTION 2: Write Store Listing (1 hour)

### 2.1 App Title

**Requirements**:

- Maximum 50 characters
- Unique on Google Play
- Descriptive

**Recommended**:

```
CutBook - Salon Management
```

or

```
CutBook: Salon & Barber Shop
```

**Check availability**: Search Google Play Store first

---

### 2.2 Short Description

**Requirements**:

- Maximum 80 characters
- Appears in search results
- Concise, compelling

**Recommended**:

```
Track salon services, manage employees, and calculate commissions effortlessly.
```

(79 characters)

---

### 2.3 Full Description

**Requirements**:

- Maximum 4000 characters
- Rich text formatting (Google Play Console editor)
- Highlight key features

**Template** (Copy and customize):

```
CutBook is a powerful salon and barbershop management app designed to help salon owners track daily services, manage employees, and calculate commissions with ease.

📊 KEY FEATURES FOR OWNERS

• Daily Dashboard - View revenue, tips, and service counts at a glance
• Work Entry Management - Quickly record completed services with employee, service name, price, and payment method
• Employee Management - Add employees, set commission rates, and track performance
• Service Catalog - Organize services by category with default pricing
• Commission Tracking - Automatically calculate employee earnings based on commission rates
• Payment Methods - Support for Cash, bKash, Card, and Nagad
• Real-time Sync - All data backed up to cloud in real-time

👨‍💼 FEATURES FOR EMPLOYEES

• Personal Dashboard - See your daily earnings and tips
• Service History - Review your work history by month
• Performance Tracking - Track your completed services over time
• Commission Summary - Know exactly how much you've earned

💼 PERFECT FOR

✓ Barbershops
✓ Hair Salons
✓ Beauty Parlors
✓ Spa Centers
✓ Nail Salons
✓ Any service-based business with commission-based employees

🔒 SECURE & RELIABLE

• Cloud backup with Firebase
• Data encrypted and secure
• Offline access to recent data
• Multi-device support

🇧🇩 MADE FOR BANGLADESH

• Supports Bangladeshi Taka (৳)
• bKash and Nagad payment tracking
• Bengali language support (coming soon)
• Designed for local businesses

🚀 GET STARTED

1. Create your salon/shop account
2. Add your employees and services
3. Start recording work entries
4. Track performance and commissions

No complicated setup. No monthly fees. Just simple, effective salon management.

Download CutBook today and simplify your salon operations!

---

Need help? Contact us at: support@cutbook.app
Privacy Policy: [Your Privacy Policy URL]
```

---

### 2.4 Category

**Select**: Business or Productivity

**Recommended**: **Business**

---

### 2.5 Tags (Keywords)

**Maximum**: 5 tags

**Recommended**:

- salon management
- barbershop
- commission tracking
- employee management
- service booking

---

### 2.6 Contact Information

**Required**:

- **Email**: Your support email (e.g., support@cutbook.app or your personal email)
- **Website**: Optional (can use GitHub repo or landing page)
- **Privacy Policy**: **REQUIRED** - URL to privacy policy

**Privacy Policy**:
You already have `PRIVACY_POLICY.md`. You need to:

1. Host it somewhere accessible (GitHub Pages, your website, etc.)
2. Or use a privacy policy generator and host on Google Sites (free)

---

### 2.7 Content Rating

**Required**: Complete questionnaire in Play Console

**Expected rating**: Everyone or PEGI 3 (no inappropriate content)

**Questions will ask about**:

- Violence
- Sexual content
- Profanity
- Controlled substances
- User-generated content
- Data collection

**Your app**: Should be rated "Everyone" - it's a business tool

---

## 🔐 SECTION 3: Generate Signed APK/AAB (1-2 hours)

### 3.1 Create Upload Keystore (First Time Only)

**If you don't have a keystore yet**:

```bash
cd android/app

# Generate keystore
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore cutbook-upload-key.keystore \
  -alias cutbook-key-alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000

# You'll be prompted for:
# - Keystore password (SAVE THIS!)
# - Alias password (SAVE THIS!)
# - Your name/organization details
```

**⚠️ CRITICAL**:

- Store passwords in a secure password manager
- Back up `cutbook-upload-key.keystore` file
- If you lose this, you can NEVER update your app!

---

### 3.2 Configure Gradle for Signing

Edit `android/gradle.properties`:

```bash
# Add these lines (replace with your passwords)
MYAPP_UPLOAD_STORE_FILE=cutbook-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=cutbook-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=your_keystore_password
MYAPP_UPLOAD_KEY_PASSWORD=your_key_password
```

**⚠️ Security**: Add `gradle.properties` to `.gitignore`!

---

Edit `android/app/build.gradle`:

```gradle
android {
    ...

    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_UPLOAD_STORE_FILE')) {
                storeFile file(MYAPP_UPLOAD_STORE_FILE)
                storePassword MYAPP_UPLOAD_STORE_PASSWORD
                keyAlias MYAPP_UPLOAD_KEY_ALIAS
                keyPassword MYAPP_UPLOAD_KEY_PASSWORD
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

### 3.3 Update Version Code & Name

Edit `android/app/build.gradle`:

```gradle
android {
    defaultConfig {
        ...
        versionCode 1        // Increment for each release (1, 2, 3...)
        versionName "1.0.0"  // User-visible version (1.0.0, 1.0.1, 1.1.0...)
    }
}
```

---

### 3.4 Build Release AAB (Android App Bundle)

**Recommended for Google Play**:

```bash
cd android

# Clean build
./gradlew clean

# Build release AAB
./gradlew bundleRelease

# AAB will be at:
# android/app/build/outputs/bundle/release/app-release.aab
```

**Verify build**:

```bash
ls -lh app/build/outputs/bundle/release/app-release.aab
```

---

### 3.5 Build Release APK (Optional)

**For testing before upload**:

```bash
cd android

# Build release APK
./gradlew assembleRelease

# APK will be at:
# android/app/build/outputs/apk/release/app-release.apk
```

**Test APK on device**:

```bash
adb install app/build/outputs/apk/release/app-release.apk
```

---

### 3.6 Verify Build

**Check AAB size**:

- Should be under 150MB (yours will likely be 20-40MB)

**Test signed APK**:

- Install on device
- Test all features
- Ensure Firebase works
- Check no debug logs appear

---

## 🚀 SECTION 4: Google Play Console Setup (1-2 hours)

### 4.1 Create Google Play Developer Account

**Cost**: $25 USD (one-time)

**Steps**:

1. Go to https://play.google.com/console/signup
2. Sign in with Google account
3. Pay $25 registration fee
4. Accept agreements
5. Complete account setup

**Wait time**: Account review can take 1-2 days

---

### 4.2 Create New App

**In Play Console**:

1. Click "Create app"
2. Fill in details:
   - **App name**: CutBook - Salon Management
   - **Default language**: English (United States)
   - **App or game**: App
   - **Free or paid**: Free
3. Accept declarations
4. Click "Create app"

---

### 4.3 Complete Dashboard Tasks

Play Console will show required tasks:

#### ✅ Task 1: Set up your app

**App access**:

- Select: "All functionality is available without restrictions"
- (Unless you have login-only features - then explain)

**Ads**:

- Select: "No, my app does not contain ads"

**Content ratings**:

- Complete questionnaire
- Expected: "Everyone" rating

**Target audience**:

- Select: "18 and over" (business app)

**News app**:

- Select: "No"

**COVID-19 contact tracing**:

- Select: "No"

**Data safety**:

- Complete data collection questionnaire
- List: Email, Name, Organization name
- State: Data is encrypted, user can request deletion

---

#### ✅ Task 2: Store settings

**App details**:

- Upload: Screenshots (2-8)
- Upload: Feature graphic (1024 x 500)
- Short description (80 chars)
- Full description (4000 chars)

**Categorization**:

- Category: Business
- Tags: salon management, barbershop, etc.

**Contact details**:

- Email: Your support email
- Website: Optional
- Privacy policy: **REQUIRED** URL

**Store listing**:

- Complete all required fields

---

#### ✅ Task 3: Production release

**Countries/regions**:

- Select countries to release in
- Recommended: Start with Bangladesh, then expand

**Create release**:

1. Click "Create new release"
2. Upload AAB file (`app-release.aab`)
3. Add release notes:

```
Initial release of CutBook!

✨ Features:
• Track daily services and revenue
• Manage employees and commission rates
• Organize services by category
• Support multiple payment methods
• Employee dashboard for tracking earnings
• Monthly history and reports

This is our first release. We appreciate your feedback!
```

4. Review release
5. Save (don't submit yet!)

---

### 4.4 Internal Testing (Optional but Recommended)

**Before production release**:

1. Create internal testing track
2. Upload AAB
3. Add test users (email addresses)
4. Test for 1-2 days
5. Fix any issues
6. Then promote to production

**Benefits**:

- Test on real Play Store
- Catch issues before public release
- Fast review process

---

### 4.5 Submit for Review

**Final checks**:

- [ ] All store listing complete
- [ ] Screenshots look professional
- [ ] Description is clear
- [ ] Privacy policy accessible
- [ ] AAB uploaded successfully
- [ ] Release notes written
- [ ] Content rating received
- [ ] Data safety completed
- [ ] App tested thoroughly

**Submit**:

1. Review all sections
2. Click "Send for review"
3. Wait for approval (typically 1-7 days)

---

## 📋 SECTION 5: Post-Submission (30 min)

### 5.1 Monitor Review Status

**Check Play Console daily**:

- Status updates
- Review feedback
- Approval notifications

**Possible outcomes**:

- ✅ Approved - Your app is live!
- ⚠️ Needs changes - Address issues and resubmit
- ❌ Rejected - Fix major issues and resubmit

---

### 5.2 Prepare for Launch

**Once approved**:

1. **Tell your client**:
   - App is live on Play Store
   - Share store link
   - Provide user guide

2. **Monitor**:
   - User reviews
   - Crash reports (Play Console)
   - Firebase Analytics

3. **Support**:
   - Respond to reviews
   - Fix reported bugs
   - Plan updates

---

### 5.3 Post-Launch Marketing

**Share your app**:

- Direct link: https://play.google.com/store/apps/details?id=com.cutbook
- QR code (generate online)
- Social media
- Client's salon

---

## 🛠️ Troubleshooting

### Build Errors

**Error: Could not find build-tools**

```bash
# Install build tools
cd android
./gradlew installDebug
```

**Error: Keystore not found**

```bash
# Check keystore location
ls -la app/cutbook-upload-key.keystore

# Update gradle.properties path
MYAPP_UPLOAD_STORE_FILE=cutbook-upload-key.keystore
```

**Error: Duplicate resources**

```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew bundleRelease
```

---

### Play Console Issues

**Rejection: Privacy Policy**

- Ensure URL is accessible
- Must be HTTPS
- Must explain data collection

**Rejection: Content Rating**

- Complete questionnaire fully
- Be accurate about app content

**Rejection: Data Safety**

- List all collected data
- Explain how data is used
- State security measures

---

## 📂 File Checklist

Before submission, ensure you have:

```
✅ Store Assets
├── screenshots/ (2-8 images)
│   ├── 01_dashboard.png
│   ├── 02_add_entry.png
│   ├── 03_employees.png
│   ├── 04_services.png
│   ├── 05_employee_view.png
│   └── 06_history.png
├── feature_graphic.png (1024x500)
└── app_icon.png (512x512, if needed)

✅ Build Outputs
├── app-release.aab (for Play Store)
├── app-release.apk (for testing)
└── mapping.txt (ProGuard, if enabled)

✅ Documentation
├── privacy_policy.txt (hosted URL)
├── store_listing.txt (description, etc.)
└── release_notes.txt

✅ Credentials (SECURE!)
├── keystore_passwords.txt (encrypted/secure)
└── cutbook-upload-key.keystore (backed up!)
```

---

## ✅ Success Criteria

Phase 6 is complete when:

1. ✅ All store assets created (screenshots, feature graphic)
2. ✅ Store listing written (title, descriptions, etc.)
3. ✅ Signed AAB generated successfully
4. ✅ Play Console account set up
5. ✅ App submitted for review
6. ✅ App approved and live on Play Store
7. ✅ Client notified and app shared

---

## 🎉 Congratulations!

Once your app is live, you've completed all 6 phases:

- ✅ Phase 1: AddWorkEntry Fixed
- ✅ Phase 2: Employees Fixed
- ✅ Phase 3: Services Fixed
- ✅ Phase 4: All Screens Fixed
- ✅ Phase 5: Testing Complete
- ✅ Phase 6: Play Store Submission

**Your app is now live and ready for users!** 🚀

---

## 📞 Need Help?

**Common Resources**:

- Play Console Help: https://support.google.com/googleplay/android-developer
- React Native Docs: https://reactnative.dev/docs/signed-apk-android
- Firebase Console: https://console.firebase.google.com

**Next Steps**:

- Monitor user feedback
- Plan feature updates
- Fix bugs promptly
- Iterate and improve

---

_Ready to submit? Let's get CutBook on the Play Store!_
