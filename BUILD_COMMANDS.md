# 📦 Build Commands Reference

Quick reference for building CutBook for Android and iOS.

## Prerequisites

```bash
# Check environment
node --version  # v18+
npx react-native --version
java -version   # JDK 11+
echo $ANDROID_HOME  # Should be set

# Install dependencies
npm install
```

## Android

### Debug Build

```bash
# Run on emulator
npx react-native run-android

# Or manually
cd android && ./gradlew assembleDebug && cd ..
# APK at: android/app/build/outputs/apk/debug/app-debug.apk

# Install on device
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Release Build

```bash
# Generate release APK
cd android && ./gradlew assembleRelease && cd ..
# APK at: android/app/build/outputs/apk/release/app-release.apk

# Or AAB for Play Store
cd android && ./gradlew bundleRelease && cd ..
# AAB at: android/app/build/outputs/bundle/release/app-release.aab
```

### Clean Build

```bash
cd android
./gradlew clean
./gradlew cleanBuildCache
cd ..
```

## iOS (Mac only)

### Install Pods

```bash
cd ios && pod install && cd ..
```

### Run on Simulator

```bash
# Default simulator
npx react-native run-ios

# Specific device
npx react-native run-ios --simulator="iPhone 14 Pro"
```

### Build for Device

```bash
# Via Xcode
open ios/CutBook.xcworkspace

# Then: Product → Build (⌘B)
# Or: Product → Archive (for App Store)
```

## Common Issues

### Android

**Gradle build fails:**
```bash
cd android
./gradlew clean
rm -rf ~/.gradle/caches/
cd ..
```

**Metro bundler cache:**
```bash
npx react-native start --reset-cache
```

**Multiple APKs:**
Check `android/app/build/outputs/apk/` for different architectures

### iOS

**Pod install fails:**
```bash
cd ios
pod deintegrate
pod install
cd ..
```

**Xcode build fails:**
- Clean build folder: Product → Clean Build Folder (⇧⌘K)
- Derived data: ~/Library/Developer/Xcode/DerivedData

## App Sizes

**Target Sizes:**
- Debug APK: ~40-60 MB
- Release APK: ~20-30 MB
- AAB: ~15-25 MB
- iOS IPA: ~25-35 MB

## Version Bump

**Android** - `android/app/build.gradle`:
```gradle
versionCode 2
versionName "1.0.1"
```

**iOS** - `ios/CutBook/Info.plist`:
```xml
<key>CFBundleShortVersionString</key>
<string>1.0.1</string>
<key>CFBundleVersion</key>
<string>2</string>
```

## Distribution

### Google Play

1. Build AAB: `cd android && ./gradlew bundleRelease`
2. Upload to Play Console
3. Fill store listing
4. Submit for review

### App Store

1. Archive in Xcode
2. Upload via Transporter
3. Submit in App Store Connect

---

**Happy Building!** 🎉
