#!/bin/bash

# Build Release AAB Script for CutBook
# This script builds a signed release AAB for Google Play Store

echo "🚀 CutBook - Build Release AAB"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}Error: package.json not found. Run this script from the project root.${NC}"
    exit 1
fi

# Check if gradle.properties has signing config
if [ ! -f "android/gradle.properties" ]; then
    echo -e "${RED}Error: android/gradle.properties not found${NC}"
    exit 1
fi

if ! grep -q "MYAPP_UPLOAD_STORE_FILE" android/gradle.properties; then
    echo -e "${YELLOW}⚠️  Warning: Signing config not found in gradle.properties${NC}"
    echo "Make sure you have added:"
    echo "  MYAPP_UPLOAD_STORE_FILE=cutbook-upload-key.keystore"
    echo "  MYAPP_UPLOAD_KEY_ALIAS=cutbook-key-alias"
    echo "  MYAPP_UPLOAD_STORE_PASSWORD=your_password"
    echo "  MYAPP_UPLOAD_KEY_PASSWORD=your_password"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Get version info
VERSION_CODE=$(grep "versionCode" android/app/build.gradle | awk '{print $2}')
VERSION_NAME=$(grep "versionName" android/app/build.gradle | awk '{print $2}' | tr -d '"')

echo "📦 Building version: $VERSION_NAME (code: $VERSION_CODE)"
echo ""

# Step 1: Clean
echo "🧹 Step 1: Cleaning previous builds..."
cd android
./gradlew clean
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Clean failed${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Clean successful${NC}"
echo ""

# Step 2: Build AAB
echo "🔨 Step 2: Building release AAB..."
./gradlew bundleRelease
if [ $? -ne 0 ]; then
    echo -e "${RED}✗ Build failed${NC}"
    echo ""
    echo "Common issues:"
    echo "1. Check signing config in android/gradle.properties"
    echo "2. Verify keystore file exists"
    echo "3. Check passwords are correct"
    exit 1
fi
echo -e "${GREEN}✓ Build successful${NC}"
echo ""

# Check output
AAB_PATH="app/build/outputs/bundle/release/app-release.aab"
if [ -f "$AAB_PATH" ]; then
    AAB_SIZE=$(ls -lh "$AAB_PATH" | awk '{print $5}')
    echo -e "${GREEN}✓ AAB created successfully${NC}"
    echo ""
    echo "📍 Location: android/$AAB_PATH"
    echo "📊 Size: $AAB_SIZE"
    echo ""

    # Copy to root for easy access
    cp "$AAB_PATH" "../cutbook-v${VERSION_NAME}.aab"
    echo -e "${GREEN}✓ Copied to: cutbook-v${VERSION_NAME}.aab${NC}"
    echo ""
else
    echo -e "${RED}✗ AAB file not found${NC}"
    exit 1
fi

# Step 3: Build APK for testing (optional)
echo "📱 Step 3: Building release APK for testing..."
read -p "Build APK too? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ./gradlew assembleRelease
    if [ $? -eq 0 ]; then
        APK_PATH="app/build/outputs/apk/release/app-release.apk"
        if [ -f "$APK_PATH" ]; then
            APK_SIZE=$(ls -lh "$APK_PATH" | awk '{print $5}')
            echo -e "${GREEN}✓ APK created successfully${NC}"
            echo "📍 Location: android/$APK_PATH"
            echo "📊 Size: $APK_SIZE"
            echo ""

            # Copy to root
            cp "$APK_PATH" "../cutbook-v${VERSION_NAME}.apk"
            echo -e "${GREEN}✓ Copied to: cutbook-v${VERSION_NAME}.apk${NC}"
            echo ""
        fi
    else
        echo -e "${YELLOW}⚠️  APK build failed (AAB is still ready)${NC}"
    fi
fi

cd ..

echo "================================"
echo "🎉 Build Complete!"
echo "================================"
echo ""
echo "✅ Next steps:"
echo ""
echo "1. Test the APK (if built):"
echo "   adb install cutbook-v${VERSION_NAME}.apk"
echo ""
echo "2. Upload AAB to Play Console:"
echo "   File: cutbook-v${VERSION_NAME}.aab"
echo "   Location: $(pwd)/cutbook-v${VERSION_NAME}.aab"
echo ""
echo "3. Before uploading:"
echo "   - Test thoroughly"
echo "   - Check Firebase works"
echo "   - Verify all features"
echo ""
echo "4. After uploading:"
echo "   - Add release notes"
echo "   - Submit for review"
echo ""
echo "Good luck with your submission! 🚀"
