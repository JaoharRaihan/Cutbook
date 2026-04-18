#!/bin/bash

# Quick Rebuild with New Icons
# This rebuilds the Android app with your new custom icons

echo "🚀 Rebuilding CutBook with New Icons"
echo "===================================="
echo ""

cd /Users/jaoharraihan/Desktop/NAW/CutBook/android

echo "🧹 Cleaning previous build..."
./gradlew clean
echo ""

echo "📦 Building release APK with new icons..."
./gradlew assembleRelease
echo ""

echo "✅ BUILD COMPLETE!"
echo ""
echo "📱 Your new APK with custom icon:"
echo "   app/build/outputs/apk/release/app-release.apk"
echo ""
echo "🔍 To install on device:"
echo "   adb install app/build/outputs/apk/release/app-release.apk"
echo ""
echo "📂 Opening build folder..."
open app/build/outputs/apk/release/
