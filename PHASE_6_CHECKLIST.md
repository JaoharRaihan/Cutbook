# Phase 6: Store Submission - Quick Checklist

**Print this and check off as you complete each task!**

---

## 📋 PRE-SUBMISSION (1 hour)

### Testing Complete

- [ ] Phase 5 testing finished
- [ ] All critical bugs fixed
- [ ] App tested on real Android device
- [ ] Firebase is working in production
- [ ] No mock data appears
- [ ] All features functional

### Google Play Account

- [ ] Created Google Play Developer account ($25)
- [ ] Account verified and active
- [ ] Payment method added

### Privacy Policy

- [ ] Privacy policy written
- [ ] Hosted on accessible URL (HTTPS)
- [ ] URL tested and working

---

## 📱 STORE ASSETS (2 hours)

### Screenshots

- [ ] Created 2-8 high-quality screenshots
- [ ] Screenshots are 1080x1920 or larger
- [ ] Format: PNG or JPEG (no alpha)
- [ ] Show real data (not test data)
- [ ] No personal/sensitive information
- [ ] Professional and polished
- [ ] Named clearly (01_dashboard.png, etc.)

**Screenshot list**:

- [ ] 01 - Owner Dashboard
- [ ] 02 - Add Work Entry
- [ ] 03 - Employee Management
- [ ] 04 - Service Management
- [ ] 05 - Employee Dashboard
- [ ] 06 - History/Reports

### Feature Graphic

- [ ] Created feature graphic
- [ ] Dimensions: 1024 x 500 pixels (exact)
- [ ] Format: PNG or JPEG
- [ ] Under 1MB file size
- [ ] Professional design
- [ ] Uses app colors (#2196F3)

### App Icon

- [ ] Verified launcher icons exist
- [ ] Icons in all required sizes
- [ ] Tested on device (looks good)

---

## 📝 STORE LISTING (1 hour)

### Text Content

- [ ] App title written (50 chars max)
- [ ] Short description written (80 chars max)
- [ ] Full description written (4000 chars max)
- [ ] Highlights key features
- [ ] Professional and clear
- [ ] No spelling/grammar errors
- [ ] Updated placeholder text (email, privacy URL)

### Metadata

- [ ] Selected category (Business)
- [ ] Added tags/keywords (5 max)
- [ ] Provided contact email
- [ ] Privacy policy URL ready
- [ ] Content rating questionnaire prepared

### Release Notes

- [ ] Version 1.0.0 release notes written
- [ ] Highlights key features
- [ ] Professional tone
- [ ] Under 500 characters

---

## 🔐 BUILD & SIGNING (1-2 hours)

### Keystore Generation

- [ ] Generated upload keystore
- [ ] Saved keystore passwords securely
- [ ] Created keystore-info.txt
- [ ] Added to password manager

### Keystore Backup

- [ ] Backed up to USB drive
- [ ] Backed up to cloud (encrypted)
- [ ] Backed up to external drive
- [ ] Physical backup (printed info)

### Signing Configuration

- [ ] Updated gradle.properties with credentials
- [ ] Updated app/build.gradle with signing config
- [ ] Added keystore files to .gitignore
- [ ] Verified setup with test build

### Version Management

- [ ] Set versionCode to 1
- [ ] Set versionName to "1.0.0"
- [ ] Updated in build.gradle

### Build Release

- [ ] Ran clean build
- [ ] Built release AAB successfully
- [ ] AAB file created (~20-40MB)
- [ ] Built release APK for testing
- [ ] APK tested on device
- [ ] All features work in release
- [ ] Firebase works in release
- [ ] No debug logs visible

**Build command used**:

```bash
cd android
./gradlew clean
./gradlew bundleRelease
```

**Files created**:

- [ ] `app-release.aab` - for Play Store
- [ ] `app-release.apk` - for testing

---

## 🚀 PLAY CONSOLE SUBMISSION (1-2 hours)

### App Setup

- [ ] Logged into Play Console
- [ ] Created new app
- [ ] Filled in app name
- [ ] Selected default language (English)
- [ ] Accepted declarations

### Dashboard Tasks

#### Task: Set up your app

- [ ] Completed "App access" section
- [ ] Completed "Ads" declaration (No ads)
- [ ] Completed "Content ratings" questionnaire
- [ ] Completed "Target audience" selection
- [ ] Completed "News app" declaration
- [ ] Completed "COVID-19" declaration
- [ ] Completed "Data safety" section

#### Task: Store settings

- [ ] Uploaded screenshots (2-8)
- [ ] Uploaded feature graphic (1024x500)
- [ ] Added short description
- [ ] Added full description
- [ ] Selected app category
- [ ] Added tags
- [ ] Provided contact email
- [ ] Added privacy policy URL
- [ ] Added website (optional)

#### Task: Production release

- [ ] Selected release countries
- [ ] Created new release
- [ ] Uploaded AAB file
- [ ] Added release notes
- [ ] Reviewed release details

---

## 🔍 FINAL REVIEW (30 min)

### Pre-Submit Checklist

- [ ] All Play Console tasks completed (green checkmarks)
- [ ] Screenshots look professional
- [ ] Feature graphic displays correctly
- [ ] All text proofread (no typos)
- [ ] Privacy policy accessible
- [ ] AAB uploaded successfully
- [ ] Release notes clear
- [ ] Contact information correct
- [ ] App tested one final time

### Review Complete Dashboard

- [ ] No red warnings in Play Console
- [ ] All required fields filled
- [ ] Content rating received
- [ ] Data safety completed
- [ ] Store listing looks good in preview

---

## 📤 SUBMISSION (5 min)

### Submit for Review

- [ ] Clicked "Review release"
- [ ] Reviewed all information
- [ ] Clicked "Start rollout to Production"
- [ ] Confirmed submission
- [ ] Received confirmation

### Post-Submission

- [ ] Noted submission date/time
- [ ] Set calendar reminder to check status
- [ ] Bookmarked Play Console

**Submission info**:

- Date submitted: ******\_\_\_******
- Time submitted: ******\_\_\_******
- Version submitted: 1.0.0
- AAB file name: app-release.aab

---

## ⏳ WAITING FOR REVIEW (1-7 days)

### During Review Period

- [ ] Check Play Console daily
- [ ] Monitor email for updates
- [ ] Prepare for potential questions
- [ ] Don't make code changes yet

### If Approved ✅

- [ ] Celebrate! 🎉
- [ ] Note approval date
- [ ] Share store link with client
- [ ] Monitor reviews and ratings
- [ ] Prepare for bug reports

### If Changes Needed ⚠️

- [ ] Read feedback carefully
- [ ] Make required changes
- [ ] Rebuild AAB with fixes
- [ ] Increment versionCode
- [ ] Resubmit

### If Rejected ❌

- [ ] Understand rejection reason
- [ ] Fix critical issues
- [ ] Rebuild and resubmit
- [ ] Address all concerns

---

## 📱 POST-LAUNCH (After approval)

### App is Live!

- [ ] Verified app appears on Play Store
- [ ] Tested download from store
- [ ] Installation works correctly
- [ ] App opens and functions
- [ ] Firebase still working

### Share with Client

- [ ] Sent Play Store link to client
- [ ] Provided installation instructions
- [ ] Shared any important notes
- [ ] Set up support channel

**Play Store URL**:

```
https://play.google.com/store/apps/details?id=com.cutbook
```

### Monitoring

- [ ] Set up alerts for reviews
- [ ] Monitor crash reports
- [ ] Check user feedback
- [ ] Plan for updates

### Documentation

- [ ] Updated README with store link
- [ ] Documented release process
- [ ] Saved all credentials securely
- [ ] Created backup of signed AAB

---

## 🎯 SUCCESS CRITERIA

Phase 6 complete when ALL of these are true:

- ✅ App submitted to Play Store
- ✅ App approved by Google
- ✅ App live and downloadable
- ✅ Client informed
- ✅ All credentials backed up
- ✅ Monitoring in place

---

## 📊 PROGRESS TRACKER

| Step            | Status | Time Spent | Date Completed |
| --------------- | ------ | ---------- | -------------- |
| Pre-submission  | ⏳     | -          | -              |
| Store assets    | ⏳     | -          | -              |
| Store listing   | ⏳     | -          | -              |
| Build & signing | ⏳     | -          | -              |
| Play Console    | ⏳     | -          | -              |
| Final review    | ⏳     | -          | -              |
| Submission      | ⏳     | -          | -              |
| Approval        | ⏳     | -          | -              |
| Post-launch     | ⏳     | -          | -              |

**Total Time**: \_\_\_ hours

---

## 📞 QUICK REFERENCE

### Important Links

- Play Console: https://play.google.com/console
- Firebase Console: https://console.firebase.google.com
- Support: https://support.google.com/googleplay/android-developer

### Important Files

```
Build outputs:
├── cutbook-v1.0.0.aab        (Upload to Play Store)
├── cutbook-v1.0.0.apk        (For testing)

Credentials (SECURE!):
├── cutbook-upload-key.keystore
├── keystore-info.txt
└── gradle.properties

Store assets:
├── screenshots/
│   ├── 01_dashboard.png
│   ├── 02_add_entry.png
│   ├── 03_employees.png
│   ├── 04_services.png
│   ├── 05_employee_view.png
│   └── 06_history.png
├── feature_graphic.png
└── STORE_LISTING_CONTENT.md
```

### Build Commands

```bash
# Build release AAB
cd android && ./gradlew bundleRelease

# Or use script
./scripts/build-release.sh

# Test APK
adb install cutbook-v1.0.0.apk
```

---

## ✅ SIGN-OFF

**Submitted by**: **********\_**********
**Date**: **********\_**********
**Version**: 1.0.0
**Status**: [ ] Submitted [ ] Approved [ ] Live

**Notes**:

---

---

---

---

**🎉 You're ready to launch CutBook! Good luck!**
