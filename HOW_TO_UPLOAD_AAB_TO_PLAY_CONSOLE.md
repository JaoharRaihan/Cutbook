# Complete Guide: Upload AAB to Google Play Console

## 📋 Prerequisites Checklist

Before you start, make sure you have:

- [ ] AAB file built successfully (~40-50 MB)
- [ ] Keystore backed up (CRITICAL!)
- [ ] Screenshots ready (6 PNG files)
- [ ] App icon ready (512x512 PNG)
- [ ] Privacy policy URL (need to host somewhere)
- [ ] Google account with $25 for developer fee
- [ ] Credit card for one-time $25 payment

---

## STEP 1: Build & Verify AAB (5 minutes)

### 1.1 Check if Build Completed

```bash
cd /Users/jaoharraihan/Desktop/NAW/CutBook
ls -lh android/app/build/outputs/bundle/release/app-release.aab
```

**Expected output:** File size ~40-50 MB

### 1.2 Copy AAB to Desktop

```bash
cp android/app/build/outputs/bundle/release/app-release.aab ~/Desktop/cutbook-release.aab
```

### 1.3 Verify the Copy

```bash
ls -lh ~/Desktop/cutbook-release.aab
```

✅ **Checkpoint:** You should see `cutbook-release.aab` on your Desktop (~40-50 MB)

---

## STEP 2: Backup Keystore (CRITICAL - 5 minutes)

**⚠️ WARNING:** Without the keystore, you can NEVER update your app. Losing it means creating a new app!

### 2.1 Copy Keystore to Safe Locations

```bash
# Copy to Desktop
cp android/app/cutbook-release-key.keystore ~/Desktop/

# Copy to Documents
cp android/app/cutbook-release-key.keystore ~/Documents/

# Copy to iCloud/Dropbox (if you have)
cp android/app/cutbook-release-key.keystore ~/Library/Mobile\ Documents/com~apple~CloudDocs/
```

### 2.2 Write Down Credentials

Create a file called `KEYSTORE_CREDENTIALS.txt` and save it:

```
KEYSTORE CREDENTIALS - KEEP SAFE!
==================================
File: cutbook-release-key.keystore
Password: Cutbook
Alias: cutbook-key-alias
Date Created: February 14, 2026
```

### 2.3 Email Keystore to Yourself

1. Open Gmail/Email
2. Compose new email to yourself
3. Subject: "CutBook App Keystore - DO NOT DELETE"
4. Attach: `cutbook-release-key.keystore`
5. In body, paste the credentials above
6. Send

✅ **Checkpoint:** Keystore backed up in 3+ locations

---

## STEP 3: Create Play Console Account (15 minutes)

### 3.1 Go to Play Console

Visit: https://play.google.com/console/signup

### 3.2 Sign In with Google Account

Use the Google account you want as the app owner.

### 3.3 Pay $25 Registration Fee

- One-time payment (valid forever)
- Credit/debit card required
- Takes 2-5 minutes to process

### 3.4 Accept Developer Agreement

- Read and accept terms
- Complete account details:
  - Developer name (e.g., "Your Name" or "Your Company")
  - Email address
  - Phone number (optional)
  - Website (optional)

✅ **Checkpoint:** You're now in Play Console dashboard

---

## STEP 4: Create New App (10 minutes)

### 4.1 Click "Create app"

In Play Console dashboard, click the **"Create app"** button.

### 4.2 Fill App Details

**App name:** `CutBook - Salon Manager`

**Default language:**

- Choose: `English (United States)`
- OR: `Bengali` (if targeting Bangladesh only)

**App or game:** Select `App`

**Free or paid:** Select `Free`

### 4.3 Declarations

Check these boxes:

- ✅ I declare that this app complies with US export laws
- ✅ I declare this app is compliant with Google Play's Developer Program Policies

### 4.4 Click "Create app"

✅ **Checkpoint:** App created! You're now in the app dashboard.

---

## STEP 5: Complete Required Sections (60-90 minutes)

Play Console requires ALL sections to be complete before you can upload AAB. Complete in this order:

### 5.1 App Access (2 minutes)

**Navigation:** Left sidebar → Policy → App access

**Select:** "All or some functionality is restricted"

**Why restricted:** "All functionality is available without restrictions"

**Instructions for testing:** Leave empty or add:

```
Full functionality available to all users.
No login required for testing.
```

Click **Save** at bottom.

---

### 5.2 Ads (1 minute)

**Navigation:** Left sidebar → Policy → Ads

**Question:** Does your app contain ads?

**Select:** `No`

Click **Save**.

---

### 5.3 Content Rating (10 minutes)

**Navigation:** Left sidebar → Policy → Content rating

**Click:** "Start questionnaire"

**Email:** Your email address

**Category:** Select `Utility, Productivity, Communication, or Other`

**Answer all questions:**

- Violence: No
- Sexual content: No
- Language: No
- Controlled substances: No
- Gambling: No
- User interaction: No

**Result:** Your app will be rated "Everyone" or "PEGI 3"

Click **Submit** → **Apply rating**

✅ Ratings applied automatically

---

### 5.4 Target Audience (5 minutes)

**Navigation:** Left sidebar → Policy → Target audience and content

**Target age:** Select `Ages 18+`

**Why?** Business/professional app for salon owners and employees

**Store listing appeal:** `No` (not designed for children)

Click **Save** → **Next**

---

### 5.5 Privacy Policy (15 minutes - IMPORTANT!)

**Navigation:** Left sidebar → Policy → Privacy Policy

**⚠️ REQUIRED:** You MUST have a publicly accessible URL for privacy policy.

#### Option A: Use Firebase Hosting (Recommended - Free)

1. **Create policy file:**

```bash
cd /Users/jaoharraihan/Desktop/NAW/CutBook
cp store-listing/PRIVACY_POLICY_FIREBASE.md privacy-policy.html
```

2. **Install Firebase CLI:**

```bash
npm install -g firebase-tools
```

3. **Initialize Firebase Hosting:**

```bash
firebase login
firebase init hosting
# Choose: cutbook-47881
# Public directory: public
# Single-page app: No
```

4. **Create public folder and copy policy:**

```bash
mkdir -p public
cp store-listing/PRIVACY_POLICY_FIREBASE.md public/privacy-policy.html
```

5. **Deploy:**

```bash
firebase deploy --only hosting
```

6. **Get URL:**

```
Your privacy policy will be at:
https://cutbook-47881.web.app/privacy-policy.html
```

#### Option B: Use Google Sites (Easier but slower)

1. Go to: https://sites.google.com
2. Click "Create" → "Blank"
3. Title: "CutBook Privacy Policy"
4. Paste content from `store-listing/PRIVACY_POLICY_FIREBASE.md`
5. Click "Publish" → Get URL
6. Use that URL

#### Option C: Use GitHub Pages (For developers)

1. Create repo: `cutbook-privacy-policy`
2. Add file: `index.html` with privacy policy
3. Enable GitHub Pages
4. URL: `https://yourusername.github.io/cutbook-privacy-policy/`

**Enter Privacy Policy URL in Play Console** → Click **Save**

✅ **Checkpoint:** Privacy policy URL added

---

### 5.6 Data Safety (10 minutes)

**Navigation:** Left sidebar → Policy → Data safety

**Question:** Does your app collect or share user data?

**Answer:** `Yes` (because you use Firebase Auth & Firestore)

**Data types collected:**

- ✅ Personal info (name, email)
- ✅ App activity (work entries, services)

**Purpose:**

- Account management
- App functionality

**Data handling:**

- ✅ Data is encrypted in transit
- ✅ Data is encrypted at rest
- ✅ Users can request data deletion
- ✅ Data is not shared with third parties

Click **Save** → **Next**

---

## STEP 6: Store Listing (45 minutes)

**Navigation:** Left sidebar → Grow → Store presence → Main store listing

### 6.1 App Details

**App name:** `CutBook - Salon Manager`

**Short description (80 chars max):**

```
Track salon work, calculate commissions, manage employees & services efficiently
```

**Full description (4000 chars max):**

Copy from `store-listing/STORE_LISTING_CONTENT.md` - the full description is ready to use!

Or use this:

```
CutBook - Complete Salon Management Solution

Transform your salon's operations with CutBook, the all-in-one management app designed specifically for salon owners and their teams. Say goodbye to manual calculations and paperwork, and hello to automated commission tracking and real-time insights.

📊 KEY FEATURES

✂️ Work Entry Management
• Record services instantly with employee, service, price, and payment method
• Track tips separately for accurate commission calculations
• Add notes for special services or customer preferences
• View complete work history with filtering and search

💰 Automatic Commission Tracking
• Set custom commission rates per employee
• Real-time calculations as work entries are added
• Daily, weekly, and monthly summaries
• Transparent earnings breakdown for employees

👥 Employee Management
• Manage employee profiles and commission rates
• Role-based access (Owner and Employee views)
• Track individual performance and earnings
• Secure access with PIN codes

✂️ Service Catalog
• Create and manage service templates
• Set default prices for quick entry
• Organize services by category
• Custom services on-the-fly

📈 Analytics & Reports
• Daily summaries with total revenue and earnings
• Employee performance rankings
• Payment method breakdowns (Cash, bKash, Card, Nagad)
• Visual charts and insights

🔐 Secure & Private
• Firebase-powered authentication
• Secure cloud sync across devices
• Organization-based data isolation
• Privacy-first design

💡 PERFECT FOR

• Hair salons and barbershops
• Beauty parlors
• Spa and wellness centers
• Any service-based business with commission structure

🌟 WHY CUTBOOK?

✓ Save Hours: Automate calculations and paperwork
✓ Reduce Errors: Eliminate manual calculation mistakes
✓ Improve Transparency: Employees see their earnings in real-time
✓ Better Decisions: Insights from data, not guesswork
✓ Focus on Customers: Less admin, more service

📱 DUAL INTERFACES

Owner Dashboard:
• Complete business overview
• Add work entries for any employee
• Manage team and services
• Access all analytics and reports

Employee Portal:
• Personal earnings dashboard
• View own work history
• Track daily/weekly progress
• Secure with individual access

🔄 REAL-TIME SYNC

All data syncs instantly across devices. Make an entry on your phone, see it immediately on your tablet. Work offline, sync when connected.

🌐 BILINGUAL SUPPORT

Full support for English and Bengali (বাংলা), making it accessible for all team members.

🚀 GET STARTED IN MINUTES

1. Create your organization
2. Add employees with commission rates
3. Set up your service menu
4. Start recording work entries
5. Watch insights grow automatically

Whether you're running a single-chair barbershop or a multi-location salon chain, CutBook scales with your business. Join salon owners who have eliminated manual tracking and gained hours back in their day.

Download CutBook today and experience the future of salon management!

---

💬 Support: hello@cutbook.app
🌐 Website: www.cutbook.app
📱 Follow us for tips and updates

Made with ❤️ for salon professionals
```

### 6.2 App Icon

**Upload:** `~/Desktop/NAW/AppIcons/playstore.png` (512x512 PNG)

- Click "Upload" under "App icon"
- Select the playstore.png file
- Must be exactly 512x512 pixels

### 6.3 Feature Graphic (REQUIRED - create this)

**Size:** 1024 x 500 pixels

**Option 1: Use Canva (Recommended)**

1. Go to: https://www.canva.com
2. Create design → Custom size → 1024 x 500
3. Add background color (use app theme: #2196F3)
4. Add text: "CutBook - Salon Manager"
5. Add subtitle: "Track. Calculate. Grow."
6. Add icon or barbershop illustration
7. Download as PNG
8. Upload to Play Console

**Option 2: Quick Solid Color (Fast but basic)**

1. Create 1024x500 image with your app's primary color
2. Add app name in white text
3. Save as PNG

### 6.4 Phone Screenshots (REQUIRED)

You said you already have 6 screenshots! Upload them:

**Navigation:** Store listing → Screenshots → Phone

**Requirements:**

- Min 2 screenshots, max 8
- Size: 16:9 aspect ratio (e.g., 1920x1080 or 1080x1920)
- Format: PNG or JPG
- Max 8 MB each

**Upload your 6 screenshots:**

1. Click "Upload" under "Phone screenshots"
2. Select all 6 screenshot files
3. Arrange in order (drag to reorder)

**Recommended order:**

1. Dashboard/Home screen
2. Add Work Entry screen
3. Employee list
4. Analytics/Reports
5. Services management
6. Profile/Settings

### 6.5 Optional but Recommended

**Tablet screenshots:** Skip (not required)

**Wear OS screenshots:** Skip (not applicable)

**Android TV screenshots:** Skip (not applicable)

**Promo video:** Skip (optional, can add later)

### 6.6 Categorization

**App category:** Select `Business`

**Tags:** Add relevant tags:

- salon management
- business
- commission tracking
- employee management
- salon software

### 6.7 Contact Details

**Email:** Your business email (publicly visible)

**Phone:** Optional (publicly visible if added)

**Website:** Optional (publicly visible if added)

Click **Save** at bottom!

✅ **Checkpoint:** Store listing complete!

---

## STEP 7: Upload AAB (10 minutes) 🎉

NOW you can finally upload your AAB!

### 7.1 Go to Production Release

**Navigation:** Left sidebar → Release → Production

### 7.2 Create New Release

Click **"Create new release"** button

### 7.3 Upload AAB

**Method 1: Drag and drop**

- Drag `~/Desktop/cutbook-release.aab` into the upload area

**Method 2: Click to upload**

- Click "Upload"
- Navigate to Desktop
- Select `cutbook-release.aab`
- Click Open

### 7.4 Wait for Processing

- Upload takes 1-2 minutes
- Processing takes 2-5 minutes
- Status will show "Processing" → "Ready"

**⚠️ If you see warnings:**

- "This App Bundle contains native code": IGNORE (normal)
- "No deobfuscation file": IGNORE (optional)
- Permission warnings: Review (should be okay)

### 7.5 Release Name

**Release name:** `1.0.0` (or `1.0 (1)`)

### 7.6 Release Notes

**What's new in this release:**

Copy this (or write your own):

```
Welcome to CutBook 1.0! 🎉

• Complete salon management solution
• Automatic commission calculations
• Employee and service management
• Real-time analytics and reports
• Bilingual support (English & বাংলা)
• Secure cloud sync with Firebase

This is our first release. We're excited to help you manage your salon more efficiently!
```

Click **Save**

### 7.7 Review Release

Click **"Review release"** button

### 7.8 Check for Issues

Play Console will show any remaining issues:

✅ All green checkmarks = Ready to submit!
❌ Red X marks = Must fix before submitting

### 7.9 SUBMIT! 🚀

Click **"Start rollout to Production"**

Confirm: **"Rollout"**

🎉 **CONGRATULATIONS!** Your app is submitted!

---

## STEP 8: What Happens Next? (1-7 days)

### 8.1 Submission Confirmation

You'll see: "Your app is pending publication"

**Email:** You'll receive confirmation email within minutes

### 8.2 Google Review Process

**Timeline:** 1-7 days (typically 1-3 days)

**Status:** Check under Production → Releases

**Possible statuses:**

- ⏳ **Pending publication** - In review queue
- 🔍 **In review** - Google is testing your app
- ✅ **Approved** - App will go live automatically
- ❌ **Rejected** - Issues found (you can fix and resubmit)

### 8.3 If Approved

**Email:** You'll get "Your app is published" email

**Status:** App goes **LIVE** on Play Store automatically

**Time to live:** Within 24 hours of approval

### 8.4 Finding Your App

Once live, search Play Store for: "CutBook Salon Manager"

**Direct link format:**

```
https://play.google.com/store/apps/details?id=com.cutbook
```

---

## STEP 9: Share With Your Client (Once Live)

### 9.1 Get Play Store Link

In Play Console:

- Go to: Release → Production
- Copy "Google Play store link"

### 9.2 Share with Client

**Message template:**

```
Great news! CutBook is now LIVE on Google Play Store! 🎉

Download link: [Play Store Link]

Or search "CutBook Salon Manager" in Play Store

The app is ready for your salon team to start using.

Let me know if you need any help getting started!
```

---

## 🆘 Troubleshooting

### "AAB not built yet"

**Solution:** Wait for build to complete (5-10 minutes)

```bash
cd /Users/jaoharraihan/Desktop/NAW/CutBook/android
./gradlew bundleRelease
```

### "Store listing incomplete"

**Solution:** Fill ALL sections marked with red X:

- App access
- Ads
- Content rating
- Target audience
- Privacy policy
- Data safety
- Store listing (icon, screenshots, descriptions)

### "Missing privacy policy URL"

**Solution:** Host privacy policy (see Step 5.5) and add URL

### "Upload failed"

**Solutions:**

- Check internet connection
- Try different browser (Chrome recommended)
- Clear browser cache
- Try uploading again

### "APK/AAB signing error"

**Solution:** Keystore configured correctly? Check:

```bash
cat /Users/jaoharraihan/Desktop/NAW/CutBook/android/keystore.properties
```

Should show:

```
CUTBOOK_UPLOAD_STORE_FILE=cutbook-release-key.keystore
CUTBOOK_UPLOAD_KEY_ALIAS=cutbook-key-alias
CUTBOOK_UPLOAD_STORE_PASSWORD=Cutbook
CUTBOOK_UPLOAD_KEY_PASSWORD=Cutbook
```

### "App rejected by Google"

**Common reasons:**

1. **Privacy policy issues** - Make sure policy is accessible and complete
2. **Content rating incorrect** - Re-answer questionnaire honestly
3. **Metadata issues** - Check descriptions don't violate policies
4. **Permission issues** - Review app permissions

**Solution:** Read rejection email carefully, fix issues, resubmit

---

## 📝 Quick Command Reference

### Check if AAB exists

```bash
ls -lh ~/Desktop/NAW/CutBook/android/app/build/outputs/bundle/release/app-release.aab
```

### Copy AAB to Desktop

```bash
cp ~/Desktop/NAW/CutBook/android/app/build/outputs/bundle/release/app-release.aab ~/Desktop/cutbook-release.aab
```

### Verify AAB size

```bash
ls -lh ~/Desktop/cutbook-release.aab
```

### Backup keystore

```bash
cp ~/Desktop/NAW/CutBook/android/app/cutbook-release-key.keystore ~/Desktop/
cp ~/Desktop/NAW/CutBook/android/app/cutbook-release-key.keystore ~/Documents/
```

---

## ✅ Final Checklist

Before submitting, confirm:

- [ ] AAB built and copied to Desktop (~40-50 MB)
- [ ] Keystore backed up to 3+ locations
- [ ] Keystore credentials written down and saved
- [ ] Play Console account created ($25 paid)
- [ ] App created in Play Console
- [ ] All policy sections complete (App access, Ads, Content rating, Target audience, Privacy policy, Data safety)
- [ ] Store listing complete (Name, descriptions, icon, feature graphic, screenshots, category, contact email)
- [ ] AAB uploaded and processed successfully
- [ ] Release notes added
- [ ] Reviewed and submitted for production

---

## 🎯 Timeline Summary

| Phase                       | Duration      | Status         |
| --------------------------- | ------------- | -------------- |
| Build AAB                   | 5-10 min      | 🔄 In progress |
| Backup keystore             | 5 min         | ⏳ Pending     |
| Create Play Console account | 15 min        | ⏳ Pending     |
| Complete required sections  | 60-90 min     | ⏳ Pending     |
| Upload AAB                  | 10 min        | ⏳ Pending     |
| **Total Time**              | **2-3 hours** |                |
| Google Review               | 1-7 days      | ⏳ Pending     |
| **App Goes Live**           | **~1 week**   | 🎯 Goal        |

---

## 📞 Support

If you need help at any step:

1. **Check this guide first**
2. **Google Play Console Help:** https://support.google.com/googleplay/android-developer
3. **Firebase Hosting Guide:** https://firebase.google.com/docs/hosting
4. **Ask me for clarification**

---

**Good luck! You're almost there!** 🚀

Once your app is live, your client can download it from Play Store and start managing their salon efficiently with CutBook!
