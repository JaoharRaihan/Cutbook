# Screenshot Capture Guide for CutBook

## Requirements

**Format**: JPEG or 24-bit PNG (no alpha)
**Dimensions**: 1080 x 1920 pixels minimum (9:16 aspect ratio)
**Maximum file size**: 8MB per screenshot
**Quantity**: 2-8 screenshots (recommend 6)

---

## Recommended Screenshots (in order)

### 1. Owner Dashboard ⭐ (Most Important)

**What to show**: Daily summary with real data
**Screen**: `src/screens/owner/DashboardScreen.tsx`

**Setup**:

- Add 5-8 work entries for today
- Use different employees
- Include various services
- Mix payment methods
- Ensure good variety of data

**What users will see**:

- Total revenue prominently displayed
- Total tips
- Service count
- Employee rankings
- Service breakdown
- Professional, clean interface

**Capture when**: Dashboard shows meaningful data

---

### 2. Add Work Entry Form ⭐

**What to show**: Easy entry creation
**Screen**: `src/screens/owner/AddWorkEntryScreen.tsx`

**Setup**:

- Fill in employee (selected)
- Fill in service (selected)
- Fill in price (show amount)
- Show a payment method selected
- Keep form partially filled (not empty, not complete)

**What users will see**:

- Clean, intuitive form
- Clear sections
- Easy selection dropdowns
- Payment method icons
- Professional design

**Capture when**: Form is partially filled out

---

### 3. Employee Management

**What to show**: Team management interface
**Screen**: `src/screens/owner/EmployeesScreen.tsx`

**Setup**:

- Add 4-6 employees
- Mix of active/inactive (mostly active)
- Different commission rates
- Include phone numbers

**What users will see**:

- List of employees
- Commission percentages
- Active status badges
- Clean, organized layout

**Capture when**: Employee list is populated

---

### 4. Service Management

**What to show**: Service catalog organization
**Screen**: `src/screens/owner/ServicesScreen.tsx`

**Setup**:

- Add 8-12 services
- Multiple categories (Haircut, Styling, Coloring, etc.)
- Include prices
- Mix of active/inactive services

**What users will see**:

- Services grouped by category
- Default prices
- Category organization
- Easy navigation

**Capture when**: Services are categorized and displayed

---

### 5. Employee Dashboard

**What to show**: Employee perspective
**Screen**: `src/screens/employee/EmployeeHomeScreen.tsx`

**Setup**:

- Login as employee (not owner)
- Ensure employee has 3-5 entries for today
- Include tips on some entries

**What users will see**:

- Employee's daily earnings
- Tips earned
- Service count
- Recent work entries
- Personal performance tracking

**Capture when**: Logged in as employee with data

---

### 6. History/Reports

**What to show**: Monthly tracking
**Screen**: `src/screens/employee/HistoryScreen.tsx`

**Setup**:

- Login as employee
- Navigate to History
- Select current month
- Ensure 5-10 entries in view

**What users will see**:

- Monthly summary
- List of services
- Date filtering
- Performance tracking

**Capture when**: History screen shows monthly data

---

## How to Capture Screenshots

### Method 1: Android Device/Emulator (Easiest)

**From Android Studio**:

1. Open Device Manager
2. Click the three dots (•••) on your device
3. Select "Screenshot"
4. Save to `screenshots/` folder

**Using ADB**:

```bash
# Create screenshots directory
mkdir -p screenshots

# Take screenshot
adb shell screencap -p /sdcard/screenshot.png

# Pull to computer
adb pull /sdcard/screenshot.png screenshots/01_dashboard.png

# Repeat for each screen
```

---

### Method 2: Using React Native

Add to your development tools (temporary):

```typescript
// Take screenshot programmatically
import {captureScreen} from 'react-native-view-shot';

const takeScreenshot = () => {
  captureScreen({
    format: 'png',
    quality: 1.0,
  }).then(uri => console.log('Screenshot saved:', uri));
};
```

---

### Method 3: Physical Device

1. Open CutBook app
2. Navigate to desired screen
3. Press Power + Volume Down (Android)
4. Transfer images to computer

---

## Preparing Screenshots

### 1. Check Dimensions

```bash
# Install ImageMagick if needed
brew install imagemagick  # macOS
# or
sudo apt install imagemagick  # Linux

# Check image dimensions
identify screenshots/*.png

# Resize if needed (to 1080x1920)
convert input.png -resize 1080x1920 output.png
```

### 2. Add Device Frame (Optional)

**Using Fastlane Frameit**:

```bash
# Install
gem install fastlane

# Add frames
fastlane frameit
```

**Using Online Tools**:

- https://mockuphone.com/
- https://smartmockups.com/
- https://www.screely.com/

---

### 3. Add Text Overlays (Optional)

**Tools**:

- Canva (easiest, free)
- Figma (professional)
- Adobe Spark (free)
- Photoshop (advanced)

**Text ideas**:

- "Track Daily Revenue"
- "Manage Your Team"
- "Easy Entry Creation"
- "Employee Dashboard"
- etc.

**Tips**:

- Keep text minimal
- Use app's color scheme (#2196F3)
- High contrast (white text on semi-transparent overlay)
- Don't cover important UI elements

---

### 4. Optimize File Size

```bash
# Install pngquant (optional)
brew install pngquant  # macOS

# Optimize PNG files
pngquant --quality=65-80 screenshots/*.png

# Or use online tools:
# https://tinypng.com/
# https://compressor.io/
```

---

## Screenshot Checklist

Before uploading to Play Store:

- [ ] All screenshots are 1080 x 1920 or larger
- [ ] All screenshots are PNG or JPEG
- [ ] No personal/sensitive data visible
- [ ] Status bar looks clean (time, battery, etc.)
- [ ] No debug info visible
- [ ] App looks professional
- [ ] Data is realistic (not "Test User" everywhere)
- [ ] UI is in final state (no dev tools)
- [ ] Screenshots show key features
- [ ] Images are high quality
- [ ] File sizes under 8MB each
- [ ] Named clearly (01_dashboard.png, etc.)

---

## File Naming Convention

```
screenshots/
├── 01_dashboard.png          (Main screen - always first!)
├── 02_add_entry.png          (Key feature)
├── 03_employees.png          (Management)
├── 04_services.png           (Catalog)
├── 05_employee_view.png      (Employee perspective)
└── 06_history.png            (Reports)
```

---

## Screenshot Test Data

### Create This Data Before Capturing:

**Employees** (3-4):

```
1. Ahmed Hassan - 15% commission
2. Sara Rahman - 20% commission
3. Karim Ali - 10% commission
```

**Services** (8-10):

```
Haircut:
- Regular Haircut - ৳300
- Premium Haircut - ৳500

Styling:
- Hair Styling - ৳400
- Beard Trim - ৳150

Coloring:
- Full Color - ৳2000
- Highlights - ৳1500
```

**Work Entries** (5-8 for today):

```
1. Ahmed Hassan - Regular Haircut - ৳300 - Tip: ৳50 - Cash
2. Sara Rahman - Premium Haircut - ৳500 - Tip: ৳100 - bKash
3. Ahmed Hassan - Beard Trim - ৳150 - Card
4. Karim Ali - Hair Styling - ৳400 - Tip: ৳50 - Nagad
5. Sara Rahman - Full Color - ৳2000 - Tip: ৳200 - Cash
```

---

## Quality Standards

### ✅ Good Screenshot Example:

- Real, meaningful data
- Clean interface
- Professional look
- Key features visible
- High resolution
- Good contrast

### ❌ Bad Screenshot Example:

- "Lorem ipsum" text
- Empty lists
- "Test User" everywhere
- Debug overlays
- Low resolution
- Cluttered UI
- Personal data visible

---

## Quick Capture Script

Save this as `scripts/capture-screenshots.sh`:

```bash
#!/bin/bash

mkdir -p screenshots

echo "📸 Screenshot Capture Script"
echo "=============================="
echo ""
echo "Instructions:"
echo "1. Open app on device/emulator"
echo "2. Navigate to desired screen"
echo "3. Press ENTER to capture"
echo "4. Repeat for all screens"
echo ""

screens=("dashboard" "add_entry" "employees" "services" "employee_view" "history")
count=1

for screen in "${screens[@]}"; do
    echo "Screen $count: $screen"
    echo "Navigate to this screen and press ENTER..."
    read

    adb shell screencap -p /sdcard/screenshot.png
    adb pull /sdcard/screenshot.png "screenshots/0${count}_${screen}.png"

    if [ $? -eq 0 ]; then
        echo "✓ Captured: 0${count}_${screen}.png"
    else
        echo "✗ Failed to capture"
    fi

    echo ""
    ((count++))
done

echo "=============================="
echo "✅ Screenshot capture complete!"
echo "Check screenshots/ folder"
```

---

## After Capturing

**Review checklist**:

1. Open all screenshots
2. Check quality and clarity
3. Verify no sensitive data
4. Ensure proper dimensions
5. Test on different screen sizes
6. Get feedback from others
7. Make adjustments if needed

**Upload to**:

- Google Play Console (Production)
- TestFlight (if doing iOS later)
- Marketing materials
- Landing page

---

_Remember: Your screenshots are often the first thing users see. Make them count!_
