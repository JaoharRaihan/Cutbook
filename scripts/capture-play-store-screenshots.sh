#!/bin/bash

# CutBook Screenshot Capture Script
# Takes clean screenshots from Android emulator without borders

echo "🎯 CutBook Screenshot Capture Tool"
echo "=================================="
echo ""

# Create screenshots directory
mkdir -p ~/Desktop/cutbook-screenshots
cd ~/Desktop/cutbook-screenshots

echo "📱 Checking for running emulator..."
adb devices

echo ""
echo "✅ Ready to capture screenshots!"
echo ""
echo "INSTRUCTIONS:"
echo "1. Open CutBook app in your emulator"
echo "2. Navigate to each screen"
echo "3. Press ENTER when ready to capture"
echo ""
echo "We'll capture 6 screens:"
echo "  1. Dashboard (Owner home screen)"
echo "  2. Add Work Entry screen"
echo "  3. Employees list"
echo "  4. Services list"
echo "  5. Employee view (switch to employee account)"
echo "  6. History/Reports screen"
echo ""
echo "Ready? Press ENTER to start..."
read

# Screenshot 1 - Dashboard
echo "📸 Screenshot 1: Navigate to DASHBOARD..."
echo "Press ENTER when ready"
read
adb shell screencap -p /sdcard/screenshot1.png
adb pull /sdcard/screenshot1.png dashboard.png
echo "✅ Saved: dashboard.png"
echo ""

# Screenshot 2 - Add Work Entry
echo "📸 Screenshot 2: Navigate to ADD WORK ENTRY screen..."
echo "Press ENTER when ready"
read
adb shell screencap -p /sdcard/screenshot2.png
adb pull /sdcard/screenshot2.png add-work-entry.png
echo "✅ Saved: add-work-entry.png"
echo ""

# Screenshot 3 - Employees
echo "📸 Screenshot 3: Navigate to EMPLOYEES screen..."
echo "Press ENTER when ready"
read
adb shell screencap -p /sdcard/screenshot3.png
adb pull /sdcard/screenshot3.png employees.png
echo "✅ Saved: employees.png"
echo ""

# Screenshot 4 - Services
echo "📸 Screenshot 4: Navigate to SERVICES screen..."
echo "Press ENTER when ready"
read
adb shell screencap -p /sdcard/screenshot4.png
adb pull /sdcard/screenshot4.png services.png
echo "✅ Saved: services.png"
echo ""

# Screenshot 5 - Employee View
echo "📸 Screenshot 5: Switch to EMPLOYEE account and show dashboard..."
echo "Press ENTER when ready"
read
adb shell screencap -p /sdcard/screenshot5.png
adb pull /sdcard/screenshot5.png employee-view.png
echo "✅ Saved: employee-view.png"
echo ""

# Screenshot 6 - History
echo "📸 Screenshot 6: Navigate to HISTORY/ANALYTICS screen..."
echo "Press ENTER when ready"
read
adb shell screencap -p /sdcard/screenshot6.png
adb pull /sdcard/screenshot6.png history.png
echo "✅ Saved: history.png"
echo ""

# Clean up device storage
adb shell rm /sdcard/screenshot*.png

echo "🎉 ALL DONE!"
echo ""
echo "📁 Your screenshots are saved at:"
echo "   ~/Desktop/cutbook-screenshots/"
echo ""
echo "Files created:"
ls -lh ~/Desktop/cutbook-screenshots/
echo ""
echo "✅ These screenshots are perfect for Play Console!"
echo "   - No emulator borders"
echo "   - Correct aspect ratio"
echo "   - High quality PNG"
echo ""
echo "📤 Next step: Upload these 6 PNG files to Play Console"
