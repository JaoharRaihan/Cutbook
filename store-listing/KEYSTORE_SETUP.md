# Keystore Generation & Signing Setup

## ⚠️ CRITICAL: Read This First!

**Your keystore is the KEY to your app's future**:

- If you lose it, you can NEVER update your app on the Play Store
- You'll have to publish a completely new app (new package name, lose all users)
- Google cannot help you recover a lost keystore
- Back it up in multiple secure locations

---

## Step 1: Generate Upload Keystore

### Navigate to app directory

```bash
cd android/app
```

### Generate keystore

```bash
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore cutbook-upload-key.keystore \
  -alias cutbook-key-alias \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

### You'll be prompted for:

```
Enter keystore password: [ENTER STRONG PASSWORD]
Re-enter new password: [REPEAT PASSWORD]

What is your first and last name?
  [Unknown]:  Your Name  (or Company Name)

What is the name of your organizational unit?
  [Unknown]:  Development  (or leave blank)

What is the name of your organization?
  [Unknown]:  CutBook  (or your company)

What is the name of your City or Locality?
  [Unknown]:  Your City

What is the name of your State or Province?
  [Unknown]:  Your State

What is the two-letter country code for this unit?
  [Unknown]:  BD  (for Bangladesh, or your country)

Is CN=Your Name, OU=Development, O=CutBook, L=Your City, ST=Your State, C=BD correct?
  [no]:  yes

Enter key password for <cutbook-key-alias>
        (RETURN if same as keystore password):  [PRESS ENTER or use different password]
```

---

## Step 2: Secure Your Credentials

### Create a secure password file (DO NOT COMMIT TO GIT)

Create `android/keystore-info.txt`:

```
KEYSTORE INFORMATION - KEEP SECURE!
====================================

Keystore File: cutbook-upload-key.keystore
Location: /Users/[YOUR_USER]/Desktop/NAW/CutBook/android/app/

Keystore Password: [YOUR_KEYSTORE_PASSWORD]
Key Alias: cutbook-key-alias
Key Password: [YOUR_KEY_PASSWORD]

Generated Date: [TODAY'S DATE]

BACKUP LOCATIONS:
1. [Location 1, e.g., USB Drive]
2. [Location 2, e.g., Cloud Storage - Encrypted]
3. [Location 3, e.g., External Hard Drive]

⚠️  NEVER LOSE THIS FILE OR THE KEYSTORE!
⚠️  NEVER COMMIT TO GIT!
⚠️  STORE IN SECURE, ENCRYPTED LOCATION!
```

### Add to .gitignore (if not already)

```bash
echo "android/app/cutbook-upload-key.keystore" >> .gitignore
echo "android/keystore-info.txt" >> .gitignore
echo "android/gradle.properties" >> .gitignore
```

---

## Step 3: Configure Gradle for Signing

### Edit `android/gradle.properties`

Add these lines to the end:

```properties
# Keystore configuration for release builds
MYAPP_UPLOAD_STORE_FILE=cutbook-upload-key.keystore
MYAPP_UPLOAD_KEY_ALIAS=cutbook-key-alias
MYAPP_UPLOAD_STORE_PASSWORD=your_keystore_password_here
MYAPP_UPLOAD_KEY_PASSWORD=your_key_password_here
```

**Replace**:

- `your_keystore_password_here` with your actual keystore password
- `your_key_password_here` with your actual key password (or keystore password if same)

---

### Edit `android/app/build.gradle`

Find the `android { ... }` block and add signing configuration:

```gradle
android {
    ...

    signingConfigs {
        debug {
            // Default debug config (already there)
        }
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
        debug {
            // Debug config (already there)
        }
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            shrinkResources true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

## Step 4: Verify Setup

### Test signing configuration

```bash
cd android

# This should work without errors
./gradlew app:dependencies
```

### Check keystore

```bash
# List keystore contents
keytool -list -v -keystore app/cutbook-upload-key.keystore

# You'll be prompted for password
# Should show your key alias and details
```

---

## Step 5: Backup Your Keystore

### 🔴 CRITICAL: Backup NOW!

1. **USB Drive**:

   ```bash
   # Copy keystore to USB drive
   cp android/app/cutbook-upload-key.keystore /Volumes/[USB_NAME]/cutbook-backup/
   cp android/keystore-info.txt /Volumes/[USB_NAME]/cutbook-backup/
   ```

2. **Cloud Storage** (Encrypted):
   - Encrypt the keystore file first
   - Upload to Google Drive / Dropbox / iCloud (encrypted)
   - Do NOT upload passwords in plain text

3. **Password Manager**:
   - Store passwords in 1Password / LastPass / Bitwarden
   - Tag as "Critical - CutBook Keystore"

4. **Physical Backup**:
   - Print keystore info (store in safe)
   - External hard drive
   - Office safe

---

## Step 6: Test Release Build

### Build release APK to test

```bash
cd android
./gradlew assembleRelease
```

### If successful

```bash
# APK will be at:
ls -lh app/build/outputs/apk/release/app-release.apk

# Install on device to test
adb install app/build/outputs/apk/release/app-release.apk
```

### Test thoroughly

- Open app
- Login
- Create data
- Verify Firebase works
- Check all features
- No debug logs should appear

---

## Common Issues & Solutions

### Issue 1: "Keystore file not found"

```bash
# Check file exists
ls -la android/app/cutbook-upload-key.keystore

# If missing, you didn't generate it correctly
# Re-run keytool command from Step 1
```

### Issue 2: "Password incorrect"

```bash
# Check gradle.properties has correct passwords
cat android/gradle.properties | grep MYAPP_

# If wrong, update gradle.properties with correct passwords
```

### Issue 3: "Release variant has no signing config"

```bash
# Check android/app/build.gradle
# Ensure signingConfigs.release is defined
# Ensure buildTypes.release has: signingConfig signingConfigs.release
```

### Issue 4: Build succeeds but app crashes

```bash
# Check ProGuard rules
# Edit android/app/proguard-rules.pro
# Add keep rules for Firebase and React Native

# Common keep rules:
-keep class com.facebook.react.** { *; }
-keep class com.google.firebase.** { *; }
```

---

## Security Checklist

Before building for production:

- [ ] Keystore generated successfully
- [ ] Passwords are strong (12+ characters)
- [ ] Passwords stored in secure password manager
- [ ] Keystore file backed up to USB drive
- [ ] Keystore file backed up to cloud (encrypted)
- [ ] Keystore file backed up to external drive
- [ ] keystore-info.txt created and backed up
- [ ] .gitignore updated (keystore not in git)
- [ ] gradle.properties has signing config
- [ ] build.gradle has signingConfigs.release
- [ ] Test build succeeds
- [ ] Release APK tested on device
- [ ] All features work in release build

---

## Keystore Information Reference

**Keep this handy for future releases**:

```
File Location: android/app/cutbook-upload-key.keystore
Alias: cutbook-key-alias
Algorithm: RSA
Key Size: 2048 bits
Validity: 10,000 days (~27 years)
Format: PKCS12

Package Name: com.cutbook
First Version: 1.0.0
Initial Release: [DATE]
```

---

## Google Play App Signing

**Note**: Google Play can manage your app signing key for you (recommended for new apps):

1. When you first upload your AAB to Play Console
2. Google will prompt you to enroll in "Google Play App Signing"
3. **Recommendation**: Enroll! Benefits:
   - Google securely stores your key
   - You can lose your upload key and reset it
   - More secure
   - Still need to keep your upload keystore

**How it works**:

- You sign with your **upload key** (the one you just created)
- Google re-signs with their **app signing key**
- If you lose your upload key, Google can generate a new one
- You can NEVER lose the app

**To enroll**:

- First AAB upload → Choose "Continue with app signing"
- Follow prompts
- Done!

---

## Version Management

Each release needs a new version:

**Edit `android/app/build.gradle`**:

```gradle
android {
    defaultConfig {
        ...
        versionCode 1        // Increment: 1, 2, 3, 4...
        versionName "1.0.0"  // Update: "1.0.0", "1.0.1", "1.1.0"...
    }
}
```

**Version naming**:

- Major: 1.0.0 → 2.0.0 (big changes)
- Minor: 1.0.0 → 1.1.0 (new features)
- Patch: 1.0.0 → 1.0.1 (bug fixes)

---

## Next Steps

After signing setup is complete:

1. ✅ Verify keystore is backed up
2. ✅ Test release build works
3. → Run `./scripts/build-release.sh` to build AAB
4. → Upload AAB to Play Console
5. → Submit for review

---

**🔴 Remember: Your keystore is IRREPLACEABLE. Protect it like your most valuable possession!**

---

_Keystore setup complete? → Proceed to building release AAB!_
