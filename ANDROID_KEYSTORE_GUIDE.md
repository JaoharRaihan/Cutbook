# 🔐 Android Release Keystore Setup Guide

**Purpose**: Generate a secure keystore for signing Android release builds

---

## ⚠️ IMPORTANT SECURITY NOTES

1. **NEVER commit keystore to Git**
2. **NEVER share keystore publicly**
3. **Backup keystore securely** (you can't recover it)
4. **Store passwords safely** (use password manager)
5. **Losing keystore = can't update app** on Play Store

---

## 🔑 Step 1: Generate Release Keystore

### Command to Run:

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore cutbook-release.keystore -alias cutbook-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

### You'll Be Asked For:

1. **Keystore password**: Choose a strong password (save it!)
2. **Confirm password**: Re-enter the same password
3. **Key password**: Choose another strong password (save it!)
   - Can be same as keystore password
4. **First and last name**: Your name or company name
5. **Organizational unit**: Your department (e.g., "Development")
6. **Organization**: Your company name (e.g., "CutBook")
7. **City**: Your city (e.g., "Dhaka")
8. **State**: Your state/division (e.g., "Dhaka")
9. **Country code**: Your country (e.g., "BD" for Bangladesh)

### Example Output:

```
Enter keystore password: ************
Re-enter new password: ************
What is your first and last name?
  [Unknown]:  CutBook Team
What is the name of your organizational unit?
  [Unknown]:  Development
What is the name of your organization?
  [Unknown]:  CutBook
What is the name of your City or Locality?
  [Unknown]:  Dhaka
What is the name of your State or Province?
  [Unknown]:  Dhaka
What is the two-letter country code for this unit?
  [Unknown]:  BD
Is CN=CutBook Team, OU=Development, O=CutBook, L=Dhaka, ST=Dhaka, C=BD correct?
  [no]:  yes

Enter key password for <cutbook-key-alias>
	(RETURN if same as keystore password): ************
```

---

## 📝 Step 2: Save Your Keystore Information

**COPY THIS TEMPLATE AND FILL IT OUT:**

```
KEYSTORE INFORMATION (KEEP SECURE!)
===================================
Keystore File: android/app/cutbook-release.keystore
Keystore Password: [YOUR_KEYSTORE_PASSWORD]
Key Alias: cutbook-key-alias
Key Password: [YOUR_KEY_PASSWORD]

Organization Details:
- Name: [YOUR_NAME/COMPANY]
- Unit: [YOUR_UNIT]
- Organization: [YOUR_ORG]
- City: [YOUR_CITY]
- State: [YOUR_STATE]
- Country: [YOUR_COUNTRY_CODE]

Generated Date: January 3, 2026
Validity: 10,000 days (~27 years)
```

**SAVE THIS IN:**

- Password manager (recommended)
- Secure encrypted file
- Physical safe location

---

## ⚙️ Step 3: Configure Gradle for Signing

### 3.1 Create gradle.properties (in android/ folder)

**File**: `android/gradle.properties`

Add these lines (replace with your actual values):

```properties
MYAPP_RELEASE_STORE_FILE=cutbook-release.keystore
MYAPP_RELEASE_KEY_ALIAS=cutbook-key-alias
MYAPP_RELEASE_STORE_PASSWORD=your_keystore_password_here
MYAPP_RELEASE_KEY_PASSWORD=your_key_password_here
```

⚠️ **NEVER commit gradle.properties with passwords to Git!**

### 3.2 Add to .gitignore

Ensure this is in your `.gitignore`:

```
# Android release files
*.keystore
gradle.properties
```

### 3.3 Update android/app/build.gradle

Add release signing configuration:

```gradle
android {
    ...
    signingConfigs {
        debug {
            storeFile file('debug.keystore')
            storePassword 'android'
            keyAlias 'androiddebugkey'
            keyPassword 'android'
        }
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        debug {
            signingConfig signingConfigs.debug
        }
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
        }
    }
}
```

---

## 🏗️ Step 4: Build Release APK/AAB

### Build Release APK (for testing):

```bash
cd android
./gradlew assembleRelease
```

Output: `android/app/build/outputs/apk/release/app-release.apk`

### Build Release AAB (for Play Store):

```bash
cd android
./gradlew bundleRelease
```

Output: `android/app/build/outputs/bundle/release/app-release.aab`

---

## ✅ Step 5: Verify Your Build

### Test the Release APK:

```bash
# Install on connected device
adb install android/app/build/outputs/apk/release/app-release.apk

# Or drag & drop APK to emulator
```

### Check the AAB:

```bash
# Get info about the bundle
bundletool build-apks --bundle=android/app/build/outputs/bundle/release/app-release.aab --output=output.apks

# Install on device
bundletool install-apks --apks=output.apks
```

---

## 🔒 Security Checklist

- [ ] Keystore generated with strong passwords
- [ ] Passwords saved in secure location
- [ ] Keystore backed up to safe location
- [ ] `.gitignore` includes `*.keystore` and `gradle.properties`
- [ ] gradle.properties NOT committed to Git
- [ ] Keystore file permissions restricted (chmod 600)
- [ ] Backup keystore to encrypted cloud storage
- [ ] Backup keystore to physical external drive
- [ ] Team members know where backups are stored
- [ ] Recovery plan documented

---

## 🚨 If You Lose Your Keystore

**WARNING**: If you lose your keystore or passwords:

- ❌ You CANNOT update your app on Play Store
- ❌ You must create a new app with new package name
- ❌ Users must uninstall old app and install new one
- ❌ You lose all reviews and ratings

**There is NO recovery option!**

---

## 📦 Backup Strategy

### Recommended Backups:

1. **Primary**: Encrypted password manager
2. **Secondary**: Encrypted cloud storage (Google Drive, Dropbox)
3. **Tertiary**: External hard drive in safe location
4. **Quaternary**: Physical printout in secure location

### What to Backup:

- `cutbook-release.keystore` file
- All passwords and details
- gradle.properties file
- Organization details used

---

## 🎯 Next Steps

After keystore is generated and configured:

1. ✅ Test build release APK
2. ✅ Install and test on device
3. ✅ Verify app signs correctly
4. ✅ Build release AAB
5. ✅ Ready for Play Store upload!

---

## 📞 Need Help?

If you encounter issues:

1. Check error messages carefully
2. Verify passwords are correct
3. Ensure keystore file is in correct location
4. Check file permissions
5. Verify gradle configuration

Common issues:

- `Keystore was tampered with` = wrong password
- `File not found` = wrong path in gradle.properties
- `Failed to sign` = signing config incorrect

---

_This guide will help you securely generate and configure your Android release keystore!_
