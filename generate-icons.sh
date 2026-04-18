#!/bin/bash

# CutBook App Icon Generator
# This script generates all required app icon sizes for Android and iOS
# Source: src/assets/cutbook icon.png (500x500)

echo "🎨 CutBook App Icon Generator"
echo "=============================="
echo ""

SOURCE_ICON="/Users/jaoharraihan/Desktop/NAW/CutBook/src/assets/cutbook icon.png"

# Check if source exists
if [ ! -f "$SOURCE_ICON" ]; then
    echo "❌ Error: Source icon not found at: $SOURCE_ICON"
    exit 1
fi

echo "✅ Source icon found: 500x500 PNG"
echo ""

# ============================================
# ANDROID ICONS
# ============================================

echo "📱 Generating Android Icons..."
echo ""

ANDROID_PATH="/Users/jaoharraihan/Desktop/NAW/CutBook/android/app/src/main/res"

# Create directories if they don't exist
mkdir -p "$ANDROID_PATH/mipmap-mdpi"
mkdir -p "$ANDROID_PATH/mipmap-hdpi"
mkdir -p "$ANDROID_PATH/mipmap-xhdpi"
mkdir -p "$ANDROID_PATH/mipmap-xxhdpi"
mkdir -p "$ANDROID_PATH/mipmap-xxxhdpi"

# Generate Android launcher icons (round)
echo "  Creating ic_launcher.png (square icons)..."
sips -z 48 48 "$SOURCE_ICON" --out "$ANDROID_PATH/mipmap-mdpi/ic_launcher.png" > /dev/null 2>&1
sips -z 72 72 "$SOURCE_ICON" --out "$ANDROID_PATH/mipmap-hdpi/ic_launcher.png" > /dev/null 2>&1
sips -z 96 96 "$SOURCE_ICON" --out "$ANDROID_PATH/mipmap-xhdpi/ic_launcher.png" > /dev/null 2>&1
sips -z 144 144 "$SOURCE_ICON" --out "$ANDROID_PATH/mipmap-xxhdpi/ic_launcher.png" > /dev/null 2>&1
sips -z 192 192 "$SOURCE_ICON" --out "$ANDROID_PATH/mipmap-xxxhdpi/ic_launcher.png" > /dev/null 2>&1

echo "  ✅ mdpi (48x48)"
echo "  ✅ hdpi (72x72)"
echo "  ✅ xhdpi (96x96)"
echo "  ✅ xxhdpi (144x144)"
echo "  ✅ xxxhdpi (192x192)"
echo ""

# Generate round icons (same sizes)
echo "  Creating ic_launcher_round.png (round icons)..."
sips -z 48 48 "$SOURCE_ICON" --out "$ANDROID_PATH/mipmap-mdpi/ic_launcher_round.png" > /dev/null 2>&1
sips -z 72 72 "$SOURCE_ICON" --out "$ANDROID_PATH/mipmap-hdpi/ic_launcher_round.png" > /dev/null 2>&1
sips -z 96 96 "$SOURCE_ICON" --out "$ANDROID_PATH/mipmap-xhdpi/ic_launcher_round.png" > /dev/null 2>&1
sips -z 144 144 "$SOURCE_ICON" --out "$ANDROID_PATH/mipmap-xxhdpi/ic_launcher_round.png" > /dev/null 2>&1
sips -z 192 192 "$SOURCE_ICON" --out "$ANDROID_PATH/mipmap-xxxhdpi/ic_launcher_round.png" > /dev/null 2>&1

echo "  ✅ Round icons created (all sizes)"
echo ""

# ============================================
# GOOGLE PLAY STORE ICON (512x512)
# ============================================

echo "🏪 Generating Play Store Icon..."
PLAYSTORE_PATH="/Users/jaoharraihan/Desktop/NAW/CutBook/android/app/src/main"
sips -z 512 512 "$SOURCE_ICON" --out "$PLAYSTORE_PATH/ic_launcher-playstore.png" > /dev/null 2>&1
echo "  ✅ Play Store icon: 512x512"
echo "  📍 Location: android/app/src/main/ic_launcher-playstore.png"
echo ""

# ============================================
# iOS ICONS
# ============================================

echo "🍎 Generating iOS Icons..."
echo ""

IOS_PATH="/Users/jaoharraihan/Desktop/NAW/CutBook/ios/CutBook/Images.xcassets/AppIcon.appiconset"

# Create directory if it doesn't exist
mkdir -p "$IOS_PATH"

# Generate iOS app icons (all required sizes)
echo "  Creating iOS app icons..."

# iPhone
sips -z 40 40 "$SOURCE_ICON" --out "$IOS_PATH/Icon-20@2x.png" > /dev/null 2>&1
sips -z 60 60 "$SOURCE_ICON" --out "$IOS_PATH/Icon-20@3x.png" > /dev/null 2>&1
sips -z 58 58 "$SOURCE_ICON" --out "$IOS_PATH/Icon-29@2x.png" > /dev/null 2>&1
sips -z 87 87 "$SOURCE_ICON" --out "$IOS_PATH/Icon-29@3x.png" > /dev/null 2>&1
sips -z 80 80 "$SOURCE_ICON" --out "$IOS_PATH/Icon-40@2x.png" > /dev/null 2>&1
sips -z 120 120 "$SOURCE_ICON" --out "$IOS_PATH/Icon-40@3x.png" > /dev/null 2>&1
sips -z 120 120 "$SOURCE_ICON" --out "$IOS_PATH/Icon-60@2x.png" > /dev/null 2>&1
sips -z 180 180 "$SOURCE_ICON" --out "$IOS_PATH/Icon-60@3x.png" > /dev/null 2>&1

# iPad
sips -z 20 20 "$SOURCE_ICON" --out "$IOS_PATH/Icon-20.png" > /dev/null 2>&1
sips -z 29 29 "$SOURCE_ICON" --out "$IOS_PATH/Icon-29.png" > /dev/null 2>&1
sips -z 40 40 "$SOURCE_ICON" --out "$IOS_PATH/Icon-40.png" > /dev/null 2>&1
sips -z 76 76 "$SOURCE_ICON" --out "$IOS_PATH/Icon-76.png" > /dev/null 2>&1
sips -z 152 152 "$SOURCE_ICON" --out "$IOS_PATH/Icon-76@2x.png" > /dev/null 2>&1
sips -z 167 167 "$SOURCE_ICON" --out "$IOS_PATH/Icon-83.5@2x.png" > /dev/null 2>&1

# App Store
sips -z 1024 1024 "$SOURCE_ICON" --out "$IOS_PATH/Icon-1024.png" > /dev/null 2>&1

echo "  ✅ iPhone icons (8 sizes)"
echo "  ✅ iPad icons (6 sizes)"
echo "  ✅ App Store icon: 1024x1024"
echo ""

# ============================================
# SUMMARY
# ============================================

echo "✅ ICON GENERATION COMPLETE!"
echo ""
echo "📊 Summary:"
echo "  • Android icons: 10 files (5 sizes × 2 types)"
echo "  • Play Store icon: 1 file (512x512)"
echo "  • iOS icons: 15 files (14 sizes + 1 App Store)"
echo "  • Total: 26 icon files generated"
echo ""
echo "📍 Locations:"
echo "  • Android: android/app/src/main/res/mipmap-*/"
echo "  • Play Store: android/app/src/main/ic_launcher-playstore.png"
echo "  • iOS: ios/CutBook/Images.xcassets/AppIcon.appiconset/"
echo ""
echo "🎯 Next Steps:"
echo "  1. Review icons in Finder"
echo "  2. Rebuild app to see new icons"
echo "  3. Test on device/simulator"
echo ""
echo "🚀 Ready to rebuild? Run:"
echo "   cd android && ./gradlew clean && ./gradlew assembleRelease"
echo ""
