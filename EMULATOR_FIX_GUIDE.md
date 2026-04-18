# 🔧 Emulator Fix Guide

Your app built successfully but couldn't install on the emulator. Here's how to fix it.

---

## 🎯 The Problem

```
Failed to install on any devices.
Skipping device 'Pixel_8a(AVD)': Unknown API Level
```

This means your emulator is having compatibility issues. Let's fix it!

---

## ✅ Solution 1: Use Physical Device (Recommended - Fastest)

**Best option for screenshots** - better quality, no emulator issues!

### Step 1: Enable USB Debugging on Your Phone

1. **Open Settings** on your Android phone
2. **Go to About Phone** → Tap **Build Number** 7 times (enables Developer Mode)
3. **Go back** → **Developer Options**
4. **Enable USB Debugging** (toggle ON)

### Step 2: Connect Phone to Computer

1. **Connect phone** via USB cable
2. **Allow USB debugging** when prompted on phone (tap "OK")
3. **Verify connection**:

```bash
adb devices

# Should show:
# List of devices attached
# ABC123DEF        device
```

### Step 3: Run App on Phone

```bash
cd /Users/jaoharraihan/Desktop/NAW/CutBook
npx react-native run-android

# App will install on your physical phone!
# Much faster than emulator
# Better for screenshots (real device)
```

---

## ✅ Solution 2: Create New Emulator in Android Studio

If you don't have a physical device, create a compatible emulator.

### Step 1: Open Android Studio

```bash
# Open Android Studio
open -a "Android Studio"
```

### Step 2: Create New Virtual Device

1. **Click**: Tools → Device Manager (or AVD Manager)
2. **Click**: "+ Create Device"
3. **Choose**: Pixel 5 (or Pixel 6)
4. **Click**: Next
5. **Select System Image**:
   - **API Level**: 33 (Tiramisu) or 34 (UpsideDownCake)
   - Click "Download" if not installed
   - Wait for download to complete
6. **Click**: Next
7. **AVD Name**: Leave as "Pixel_5_API_33"
8. **Click**: Finish

### Step 3: Start New Emulator

1. **In Device Manager**, find your new "Pixel_5_API_33"
2. **Click** the Play ▶️ button
3. **Wait** for emulator to fully boot (1-2 minutes)
4. **Verify it's running**:

```bash
adb devices

# Should show:
# emulator-5554    device
```

### Step 4: Run App on New Emulator

```bash
cd /Users/jaoharraihan/Desktop/NAW/CutBook
npx react-native run-android
```

---

## ✅ Solution 3: Fix Current Emulator

Try fixing the existing Pixel_8a emulator.

### Option A: Restart Emulator

```bash
# Kill all emulators
adb devices

# For each emulator listed, run:
adb -s emulator-5554 emu kill

# Restart ADB
adb kill-server
adb start-server

# Open Android Studio → Device Manager
# Start Pixel_8a emulator again
# Wait for full boot

# Try running app again
cd /Users/jaoharraihan/Desktop/NAW/CutBook
npx react-native run-android
```

### Option B: Cold Boot Emulator

1. **Open Android Studio** → Device Manager
2. **Find Pixel_8a** in list
3. **Click dropdown arrow** next to Play button
4. **Select "Cold Boot Now"**
5. **Wait** for emulator to fully start
6. **Run app**:

```bash
npx react-native run-android
```

---

## ✅ Solution 4: Use Command Line (If All Else Fails)

```bash
# List available emulators
emulator -list-avds

# Start specific emulator
emulator @Pixel_5_API_33 &

# Wait 1-2 minutes for boot
# Then run app
npx react-native run-android
```

---

## 🎯 Quick Decision Tree

```
Do you have an Android phone?
├─ YES → Use Physical Device (Solution 1) ⭐ BEST OPTION
│         - Fastest
│         - Better screenshots
│         - No emulator issues
│
└─ NO → Use Emulator
        │
        ├─ Can you create new emulator?
        │  └─ YES → Create Pixel 5 API 33 (Solution 2) ⭐ RECOMMENDED
        │
        └─ Must use existing emulator?
           └─ Try restart/cold boot (Solution 3)
```

---

## 📝 After Fixing

Once your device is working and app is running:

### 1. **Create Test Data** (10 minutes)

- Sign in as owner
- Add 3-4 employees
- Add 8-10 services
- Add 8-10 work entries

### 2. **Capture Screenshots** (20 minutes)

```bash
./scripts/capture-screenshots.sh
```

### 3. **Continue with App Icon**

- See: `APP_ICON_QUICK_START.md`

---

## 🆘 Still Having Issues?

### Check ADB Connection

```bash
# Kill and restart ADB
adb kill-server
adb start-server

# List devices
adb devices

# Should show at least one device with "device" status
# NOT "offline" or "unauthorized"
```

### Clear Metro Bundler

```bash
# Kill Metro bundler
pkill -f "react-native start"

# Clear cache
npx react-native start --reset-cache
```

### Full Clean Build

```bash
cd /Users/jaoharraihan/Desktop/NAW/CutBook

# Clean everything
cd android
./gradlew clean
cd ..

# Clear watchman
watchman watch-del-all

# Clear Metro cache
rm -rf /tmp/metro-*

# Clear node modules cache
rm -rf node_modules
npm install

# Try again
npx react-native run-android
```

---

## 💡 Pro Tips

1. **Physical device is ALWAYS better** for screenshots
   - Higher quality
   - Real-world testing
   - Faster performance
   - No compatibility issues

2. **If using emulator**:
   - Use Pixel 5 or Pixel 6
   - API Level 33 or 34 (not too new, not too old)
   - Give it 2GB+ RAM
   - Enable hardware acceleration

3. **Common mistakes**:
   - ❌ Using too new API level (35+)
   - ❌ Using too old API level (<30)
   - ❌ Not waiting for full emulator boot
   - ❌ Not enabling USB debugging on phone

---

## ✅ Success Checklist

- [ ] Device shows in `adb devices` with "device" status
- [ ] Not showing "offline" or "unauthorized"
- [ ] App installs successfully (no errors)
- [ ] App launches and you see sign-in screen
- [ ] Can navigate through app without crashes
- [ ] Ready to create test data and take screenshots

---

## 🚀 Next Steps After Fix

1. ✅ **Device is working**
2. ✅ **App is running**
3. 📝 **Create test data** (employees, services, entries)
4. 📸 **Run**: `./scripts/capture-screenshots.sh`
5. 🎨 **Create app icon**: See `APP_ICON_QUICK_START.md`
6. 🚀 **Continue Phase 6**: See `PHASE_6_PLAY_STORE_SUBMISSION.md`

---

## 📞 Need More Help?

Check these files:

- `SCREENSHOTS_ICON_ACTION_PLAN.md` - Complete action plan
- `SCREENSHOT_AND_ICON_GUIDE.md` - Detailed guide
- `APP_ICON_QUICK_START.md` - Icon creation guide

---

**Estimated fix time**: 5-15 minutes
**Recommendation**: Use physical device if possible!

Good luck! 🚀
