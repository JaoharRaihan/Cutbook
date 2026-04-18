#!/bin/bash

# ============================================================================
# Complete Play Store Upload Setup Script
# ============================================================================
# This script will guide you through the entire process of:
# 1. Installing your app icon
# 2. Generating keystore
# 3. Configuring signing
# 4. Building release AAB
# ============================================================================

set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "========================================"
echo "  CutBook - Play Store Upload Setup"
echo "========================================"
echo ""

# ============================================================================
# STEP 1: Install App Icon
# ============================================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 1: Install App Icon${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}You mentioned you created an app icon from an icon generator.${NC}"
echo -e "${YELLOW}Where is your icon pack located?${NC}"
echo ""
echo "Options:"
echo "  1) I have a ZIP file in ~/Downloads/"
echo "  2) I have extracted files in a folder"
echo "  3) I'll install it manually later"
echo ""
read -p "Choose option (1/2/3): " icon_option

if [ "$icon_option" = "1" ]; then
    echo ""
    echo -e "${BLUE}Looking for ZIP files in Downloads...${NC}"
    ls -1 ~/Downloads/*.zip 2>/dev/null || echo "No ZIP files found"
    echo ""
    read -p "Enter the filename (e.g., IconKitchen.zip): " zip_file

    if [ -f ~/Downloads/"$zip_file" ]; then
        echo -e "${BLUE}Extracting icon pack...${NC}"
        mkdir -p /tmp/cutbook_icons
        unzip ~/Downloads/"$zip_file" -d /tmp/cutbook_icons

        echo -e "${BLUE}Backing up old icons...${NC}"
        mkdir -p ~/Desktop/cutbook_icon_backup
        cp -r android/app/src/main/res/mipmap-* ~/Desktop/cutbook_icon_backup/ 2>/dev/null || true

        echo -e "${BLUE}Installing new icons...${NC}"
        # Try different common structures
        if [ -d /tmp/cutbook_icons/android/res ]; then
            cp -r /tmp/cutbook_icons/android/res/mipmap-* android/app/src/main/res/
        elif [ -d /tmp/cutbook_icons/res ]; then
            cp -r /tmp/cutbook_icons/res/mipmap-* android/app/src/main/res/
        elif [ -d /tmp/cutbook_icons/mipmap-hdpi ]; then
            cp -r /tmp/cutbook_icons/mipmap-* android/app/src/main/res/
        else
            echo -e "${RED}⚠ Could not find icon files in expected structure${NC}"
            echo "Please install manually - see UPLOAD_TO_PLAY_STORE_NOW.md"
        fi

        echo -e "${GREEN}✓ Icon installation complete!${NC}"
    else
        echo -e "${RED}File not found: ~/Downloads/$zip_file${NC}"
        echo "Continuing without icon installation..."
    fi
elif [ "$icon_option" = "2" ]; then
    echo ""
    read -p "Enter the folder path: " icon_folder
    if [ -d "$icon_folder" ]; then
        echo -e "${BLUE}Backing up old icons...${NC}"
        mkdir -p ~/Desktop/cutbook_icon_backup
        cp -r android/app/src/main/res/mipmap-* ~/Desktop/cutbook_icon_backup/ 2>/dev/null || true

        echo -e "${BLUE}Installing new icons...${NC}"
        cp -r "$icon_folder"/mipmap-* android/app/src/main/res/
        echo -e "${GREEN}✓ Icon installation complete!${NC}"
    else
        echo -e "${RED}Folder not found${NC}"
    fi
else
    echo -e "${YELLOW}Skipping icon installation - you can do this manually${NC}"
fi

echo ""
sleep 2

# ============================================================================
# STEP 2: Generate Keystore
# ============================================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 2: Generate Keystore (CRITICAL!)${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${RED}⚠️  WARNING: This keystore is your app's identity!${NC}"
echo -e "${RED}⚠️  If you lose it, you can NEVER update your app!${NC}"
echo -e "${RED}⚠️  Back it up in 3+ locations immediately!${NC}"
echo ""

if [ -f android/app/cutbook-release-key.keystore ]; then
    echo -e "${YELLOW}Keystore already exists at: android/app/cutbook-release-key.keystore${NC}"
    read -p "Do you want to use the existing keystore? (y/n): " use_existing

    if [ "$use_existing" = "y" ]; then
        echo -e "${GREEN}Using existing keystore${NC}"
    else
        echo -e "${RED}Deleting old keystore...${NC}"
        rm android/app/cutbook-release-key.keystore
        echo "Generating new keystore..."

        cd android/app
        keytool -genkeypair -v \
          -storetype PKCS12 \
          -keystore cutbook-release-key.keystore \
          -alias cutbook-key-alias \
          -keyalg RSA \
          -keysize 2048 \
          -validity 10000
        cd ../..

        echo -e "${GREEN}✓ New keystore generated!${NC}"
    fi
else
    echo "Generating keystore..."
    echo ""
    echo -e "${YELLOW}You'll be asked for:${NC}"
    echo "  - Keystore password (choose a strong password!)"
    echo "  - Your name, organization, city, state, country"
    echo "  - Use the SAME password for both keystore and key"
    echo ""
    read -p "Press ENTER to continue..."

    cd android/app
    keytool -genkeypair -v \
      -storetype PKCS12 \
      -keystore cutbook-release-key.keystore \
      -alias cutbook-key-alias \
      -keyalg RSA \
      -keysize 2048 \
      -validity 10000
    cd ../..

    echo ""
    echo -e "${GREEN}✓ Keystore generated successfully!${NC}"
fi

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${RED}⚠️  BACKUP YOUR KEYSTORE NOW!${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Backup keystore
echo -e "${BLUE}Creating backups...${NC}"
cp android/app/cutbook-release-key.keystore ~/Desktop/cutbook-release-key.keystore
cp android/app/cutbook-release-key.keystore ~/Documents/cutbook-release-key.keystore
echo -e "${GREEN}✓ Backed up to Desktop and Documents${NC}"
echo ""
echo -e "${RED}ALSO:${NC}"
echo "  1. Upload to Google Drive / Dropbox"
echo "  2. Email to yourself"
echo "  3. Save on USB drive"
echo ""
read -p "Press ENTER when you've backed up the keystore in 3+ places..."

# ============================================================================
# STEP 3: Create keystore.properties
# ============================================================================

echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 3: Configure Signing${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

read -sp "Enter your keystore password: " keystore_password
echo ""
read -sp "Enter your key password (usually same as keystore): " key_password
echo ""

# Create keystore.properties
cat > android/keystore.properties << EOF
CUTBOOK_UPLOAD_STORE_FILE=cutbook-release-key.keystore
CUTBOOK_UPLOAD_KEY_ALIAS=cutbook-key-alias
CUTBOOK_UPLOAD_STORE_PASSWORD=$keystore_password
CUTBOOK_UPLOAD_KEY_PASSWORD=$key_password
EOF

echo -e "${GREEN}✓ Signing configuration created!${NC}"
echo ""

# ============================================================================
# STEP 4: Build Release AAB
# ============================================================================

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 4: Build Release AAB${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

echo -e "${BLUE}Cleaning previous builds...${NC}"
cd android
./gradlew clean
cd ..

echo ""
echo -e "${BLUE}Building signed AAB (this takes 5-10 minutes)...${NC}"
echo -e "${YELLOW}Please be patient...${NC}"
echo ""

cd android
./gradlew bundleRelease
cd ..

# Check if AAB was created
if [ -f android/app/build/outputs/bundle/release/app-release.aab ]; then
    echo ""
    echo -e "${GREEN}✓ AAB built successfully!${NC}"

    # Copy to easy location
    cp android/app/build/outputs/bundle/release/app-release.aab ~/Desktop/cutbook-release.aab

    AAB_SIZE=$(ls -lh ~/Desktop/cutbook-release.aab | awk '{print $5}')

    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}✓ SUCCESS!${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo "Your release AAB is ready:"
    echo "  Location: ~/Desktop/cutbook-release.aab"
    echo "  Size: $AAB_SIZE"
    echo ""
    echo -e "${YELLOW}Next steps:${NC}"
    echo "  1. Go to https://play.google.com/console"
    echo "  2. Create a new app (if not already created)"
    echo "  3. Complete all required sections (content rating, privacy policy, etc.)"
    echo "  4. Upload ~/Desktop/cutbook-release.aab to Production"
    echo "  5. Add screenshots from store-listing/screenshots/"
    echo "  6. Submit for review!"
    echo ""
    echo "Full guide: UPLOAD_TO_PLAY_STORE_NOW.md"
    echo ""
else
    echo ""
    echo -e "${RED}❌ AAB was not created. Check for errors above.${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "  1. Check if keystore.properties has correct passwords"
    echo "  2. Make sure keystore file exists: android/app/cutbook-release-key.keystore"
    echo "  3. Try building again: cd android && ./gradlew bundleRelease"
    echo ""
fi

echo ""
