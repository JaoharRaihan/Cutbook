# 📸 Quick Screenshot Guide

## ✅ EASIEST METHOD - Follow These Steps:

### Step 1: Start Emulator & Open App (2 min)

```bash
cd /Users/jaoharraihan/Desktop/NAW/CutBook
npm start
```

In another terminal:

```bash
npm run android
```

Wait for app to open in emulator.

---

### Step 2: Run Screenshot Script (5 min)

```bash
/Users/jaoharraihan/Desktop/NAW/CutBook/scripts/capture-play-store-screenshots.sh
```

The script will guide you! Just:

1. Navigate to each screen in the app
2. Press ENTER to capture
3. Repeat for all 6 screens

---

### Step 3: Screenshots Will Be Saved Here:

```
~/Desktop/cutbook-screenshots/
```

Files:

- dashboard.png
- add-work-entry.png
- employees.png
- services.png
- employee-view.png
- history.png

---

## 📤 Step 4: Upload to Play Console

1. Go to Play Console → Store listing → Phone screenshots
2. Click "Upload"
3. Select all 6 PNG files from `~/Desktop/cutbook-screenshots/`
4. Upload!

✅ These will be **perfect quality** without emulator borders!

---

## 🎯 Screens to Capture:

1. **Dashboard** - Owner home with cards
2. **Add Work Entry** - Form to add new work
3. **Employees** - List of employees
4. **Services** - List of services
5. **Employee View** - Employee's personal dashboard
6. **History** - Work history or analytics

---

## 🆘 Troubleshooting:

**"adb not found"**

```bash
# Check Android SDK location
which adb
# Should show: /Users/username/Library/Android/sdk/platform-tools/adb
```

**"No devices found"**

- Make sure emulator is running
- Try: `adb devices`

**"Permission denied"**

```bash
chmod +x /Users/jaoharraihan/Desktop/NAW/CutBook/scripts/capture-play-store-screenshots.sh
```

---

## ⚡ Alternative: Manual ADB Method

If script doesn't work, run these one by one:

```bash
# Create folder
mkdir -p ~/Desktop/cutbook-screenshots
cd ~/Desktop/cutbook-screenshots

# Navigate to screen 1 in app, then:
adb shell screencap -p /sdcard/screenshot1.png
adb pull /sdcard/screenshot1.png dashboard.png

# Navigate to screen 2 in app, then:
adb shell screencap -p /sdcard/screenshot2.png
adb pull /sdcard/screenshot2.png add-work-entry.png

# Repeat for all 6 screens...
```

---

**Time needed:** 10 minutes total
**Result:** 6 perfect screenshots ready for Play Console! 🎉
