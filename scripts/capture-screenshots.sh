#!/bin/bash

# ============================================================================
# Screenshot Capture Script for CutBook
# ============================================================================
# This script automates capturing all 6 required screenshots for Play Store
#
# Requirements:
# - Device/emulator must be connected (adb devices)
# - App must be running on device
# - You must manually navigate to each screen when prompted
# ============================================================================

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Create screenshots directory
SCREENSHOTS_DIR="store-listing/screenshots"
mkdir -p "$SCREENSHOTS_DIR"

echo ""
echo "======================================"
echo "  CutBook Screenshot Capture Tool"
echo "======================================"
echo ""

# Check if device is connected
echo -e "${BLUE}Checking for connected device...${NC}"
if ! adb devices | grep -q "device$"; then
    echo -e "${RED}❌ No device found!${NC}"
    echo "Please connect a device or start an emulator, then try again."
    exit 1
fi

echo -e "${GREEN}✓ Device connected${NC}"
echo ""

# Function to capture screenshot
capture_screenshot() {
    local screen_name=$1
    local file_number=$2
    local instructions=$3

    echo ""
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}Screenshot ${file_number}/6: ${screen_name}${NC}"
    echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
    echo -e "${instructions}"
    echo ""
    echo -e "${YELLOW}Press ENTER when ready to capture...${NC}"
    read -r

    local temp_file="/sdcard/cutbook_screenshot_${file_number}.png"
    local output_file="${SCREENSHOTS_DIR}/${file_number}_${screen_name}.png"

    echo -e "${BLUE}Capturing screenshot...${NC}"
    adb shell screencap -p "$temp_file"

    echo -e "${BLUE}Downloading screenshot...${NC}"
    adb pull "$temp_file" "$output_file" > /dev/null 2>&1

    echo -e "${BLUE}Cleaning up device...${NC}"
    adb shell rm "$temp_file"

    # Check resolution
    if command -v sips > /dev/null 2>&1; then
        local width=$(sips -g pixelWidth "$output_file" | awk 'NR==2{print $2}')
        local height=$(sips -g pixelHeight "$output_file" | awk 'NR==2{print $2}')

        if [ "$width" -ge 1080 ] && [ "$height" -ge 1920 ]; then
            echo -e "${GREEN}✓ Screenshot saved: ${output_file}${NC}"
            echo -e "${GREEN}  Resolution: ${width} x ${height} (OK)${NC}"
        else
            echo -e "${RED}⚠ Screenshot saved but resolution is low: ${width} x ${height}${NC}"
            echo -e "${RED}  Minimum required: 1080 x 1920${NC}"
        fi
    else
        echo -e "${GREEN}✓ Screenshot saved: ${output_file}${NC}"
    fi

    echo ""
}

# Welcome message
echo -e "${BLUE}This script will help you capture all 6 screenshots.${NC}"
echo -e "${BLUE}Make sure your app is running and has test data loaded.${NC}"
echo ""
echo -e "${YELLOW}Tips:${NC}"
echo "  • Close any keyboard before capturing"
echo "  • Make sure status bar is clean (no notifications)"
echo "  • Use realistic test data (not 'Test User 1')"
echo "  • Show good numbers on Dashboard (৳5000+)"
echo ""
echo -e "${YELLOW}Press ENTER to start...${NC}"
read -r

# Screenshot 1: Dashboard
capture_screenshot "dashboard" "01" "\
${GREEN}Navigate to:${NC} Owner Dashboard (main screen)

${YELLOW}What to show:${NC}
  • Today's summary card with good revenue (৳5,000+)
  • List of 5-8 work entries for today
  • Mix of payment methods (Cash, bKash, Card)
  • Beautiful gradient header

${YELLOW}Checklist:${NC}
  ☐ Dashboard is the current screen
  ☐ Today's data is visible (not yesterday)
  ☐ At least 5 work entries showing
  ☐ Revenue looks professional (৳5000+)
  ☐ No keyboard visible
  ☐ Status bar is clean"

# Screenshot 2: Add Work Entry
capture_screenshot "add_entry" "02" "\
${GREEN}Navigate to:${NC} Dashboard → + Add Work Entry button

${YELLOW}What to show:${NC}
  • Beautiful form with all fields
  • Employee selector (can be open or closed)
  • Service selector showing options
  • Colorful payment method buttons
  • Price/tip fields filled in

${YELLOW}Checklist:${NC}
  ☐ Add Work Entry form is open
  ☐ All form sections visible (scroll to top)
  ☐ Payment method buttons showing colors
  ☐ Optional: Fill in some fields to show example
  ☐ No keyboard visible
  ☐ Form looks clean and professional"

# Screenshot 3: Employees
capture_screenshot "employees" "03" "\
${GREEN}Navigate to:${NC} Owner Dashboard → Bottom Nav → Employees tab

${YELLOW}What to show:${NC}
  • List of 3-4 employee cards
  • Each card showing name, commission %, rank
  • Beautiful card design with avatars
  • 'Add Employee' button visible at top

${YELLOW}Checklist:${NC}
  ☐ Employees screen is showing
  ☐ At least 3 employee cards visible
  ☐ Commission percentages showing
  ☐ Cards look organized and clean
  ☐ 'Add Employee' button visible
  ☐ Realistic employee names (not 'Test')"

# Screenshot 4: Services
capture_screenshot "services" "04" "\
${GREEN}Navigate to:${NC} Owner Dashboard → Bottom Nav → Services tab

${YELLOW}What to show:${NC}
  • Grid of 6-8 service cards
  • Mix of categories (Haircut, Beard, Color)
  • Prices visible on cards
  • Colorful category badges
  • 'Add Service' button at top

${YELLOW}Checklist:${NC}
  ☐ Services screen is showing
  ☐ At least 6 service cards visible
  ☐ Mix of service categories
  ☐ Prices showing (৳300-1000 range)
  ☐ Services have realistic names
  ☐ Grid layout looks organized"

# Screenshot 5: Employee History
capture_screenshot "history" "05" "\
${GREEN}Navigate to:${NC}
  1. Sign out from owner account
  2. Sign in as an employee
  3. Go to History tab (bottom navigation)

${YELLOW}What to show:${NC}
  • List of work entries from employee view
  • Multiple entries across different days
  • Summary showing earnings
  • Clean list design

${YELLOW}Checklist:${NC}
  ☐ Logged in as an employee (not owner)
  ☐ History screen is showing
  ☐ At least 5 work entries visible
  ☐ Dates showing (today, yesterday, etc)
  ☐ Earnings are visible
  ☐ List looks organized"

# Screenshot 6: Employee Home
capture_screenshot "employee_home" "06" "\
${GREEN}Navigate to:${NC} Employee app → Home tab (if not already signed in as employee, sign in first)

${YELLOW}What to show:${NC}
  • Today's summary card
  • Welcome message with employee name
  • Recent work entries (3-5 entries)
  • Commission percentage visible

${YELLOW}Checklist:${NC}
  ☐ Logged in as an employee (not owner)
  ☐ Home screen is showing
  ☐ Today's summary visible
  ☐ At least 3 work entries showing
  ☐ Employee name displayed
  ☐ Clean, welcoming layout"

# Summary
echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✓ All screenshots captured!${NC}"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# List captured screenshots
echo -e "${BLUE}Captured screenshots:${NC}"
ls -lh "$SCREENSHOTS_DIR"

echo ""
echo -e "${BLUE}Screenshots saved to:${NC} $SCREENSHOTS_DIR"
echo ""

# Verify all 6 screenshots
screenshot_count=$(ls -1 "$SCREENSHOTS_DIR" | wc -l | xargs)
if [ "$screenshot_count" -eq 6 ]; then
    echo -e "${GREEN}✓ All 6 screenshots captured successfully!${NC}"
else
    echo -e "${YELLOW}⚠ Warning: Expected 6 screenshots, found ${screenshot_count}${NC}"
fi

echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Review screenshots: open store-listing/screenshots/"
echo "  2. Verify quality and resolution"
echo "  3. Retake any poor quality screenshots"
echo "  4. Continue with PHASE_6_PLAY_STORE_SUBMISSION.md"
echo ""
echo -e "${GREEN}Happy submitting! 🚀${NC}"
echo ""
