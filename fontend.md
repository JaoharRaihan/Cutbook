
🎨 CutBook - Frontend-Only Implementation Plan (React Native CLI)
Phase 1: Project Foundation
Step 1.1: Initialize React Native Project
Create new React Native project with TypeScript: npx react-native init CutBook --template react-native-template-typescript
Verify installation and run on iOS/Android emulator
Clean up default boilerplate
Step 1.2: Project Structure Setup

CutBook/├── src/│   ├── components/│   │   ├── UI/│   │   └── shared/│   ├── screens/│   │   ├── auth/│   │   ├── owner/│   │   ├── employee/│   │   └── onboarding/│   ├── navigation/│   ├── context/│   ├── hooks/│   ├── utils/│   ├── types/│   ├── constants/│   └── assets/├── App.tsx└── package.json
Step 1.3: Install Navigation & Core Dependencies

# React Navigation@react-navigation/native@react-navigation/stack@react-navigation/bottom-tabsreact-native-screensreact-native-safe-area-contextreact-native-gesture-handler# Utilitiesdate-fns@react-native-async-storage/async-storagereact-native-vector-icons# Forms & UI (optional)react-hook-form
Step 1.4: Development Tools Setup
ESLint + Prettier configuration
TypeScript strict config
VS Code extensions recommendations
Git initialization
Phase 2: Design System & UI Foundation
Step 2.1: Theme System
File: src/constants/theme.ts
Colors palette (primary, secondary, success, error, neutral)
Typography scale (heading, body, caption)
Spacing system (4px base)
Border radius values
Shadow definitions
Step 2.2: Base UI Components
src/components/UI/Button.tsx - Primary, secondary, outline variants
src/components/UI/Input.tsx - Text input with label, error states
src/components/UI/Card.tsx - Container with shadow
src/components/UI/Loading.tsx - Spinner/skeleton loaders
src/components/UI/Badge.tsx - Status badges
src/components/UI/IconButton.tsx - Icon-only button
src/components/UI/Modal.tsx - Bottom sheet modal
src/components/UI/Dropdown.tsx - Select/picker component
Step 2.3: Layout Components
src/components/UI/Screen.tsx - Safe area wrapper
src/components/UI/Header.tsx - Navigation header
src/components/UI/EmptyState.tsx - Empty list placeholder
src/components/UI/ErrorState.tsx - Error boundary UI
Phase 3: TypeScript Types & Mock Data
Step 3.1: Type Definitions
File: src/types/index.ts

// User rolesenum UserRole { OWNER = 'owner', EMPLOYEE = 'employee' }enum PaymentMethod { CASH = 'cash', BKASH = 'bkash', CARD = 'card', OTHER = 'other' }// Main interfacesinterface User { id, name, phone, email?, role, orgId, commissionPercentage?, status, createdAt }interface Organization { id, name, ownerId, timezone, currency, defaultCommissionMode, createdAt }interface Service { id, orgId, name, defaultPrice?, category, createdAt }interface WorkEntry { id, orgId, employeeId, serviceId?, serviceName, price, tip?, paymentMethod, createdBy, createdAt, edited }interface DailySummary { date, orgId, totalIncome, totalCash, totalBkash, employeeBreakdown, generatedAt }
Step 3.2: Mock Data
File: src/constants/mockData.ts
Sample organizations (3-5 salons)
Sample users (2 owners, 5-8 employees)
Sample services (15-20 services across categories)
Sample work entries (50+ entries over 7 days)
Sample daily summaries
Step 3.3: Utility Functions
src/utils/date.ts - Format date, get today, date ranges
src/utils/currency.ts - Format BDT (৳1,234.00)
src/utils/validation.ts - Phone, email, number validators
src/utils/calculations.ts - Sum totals, calculate commission
Phase 4: State Management Setup
Step 4.1: AuthContext (Mock)
File: src/context/AuthContext.tsx
State: currentUser, loading, isAuthenticated
Methods: login(phone, password), register(userData), logout()
Use AsyncStorage to persist mock auth token
Mock delay (500ms) for realistic feel
Step 4.2: OrgContext (Mock)
File: src/context/OrgContext.tsx
State: currentOrg, orgUsers, orgServices
Methods: createOrg(), joinOrg(), fetchServices(), fetchUsers()
Load from mock data
Step 4.3: DataContext (Work Entries & Summaries)
File: src/context/DataContext.tsx
State: workEntries, dailySummaries
Methods: addWorkEntry(), updateWorkEntry(), deleteWorkEntry(), getDailySummary(date)
CRUD operations on local mock data (AsyncStorage backed)
Phase 5: Navigation Structure
Step 5.1: Root Navigator
File: src/navigation/RootNavigator.tsx
Splash screen → Auth check → Main app
Conditional rendering based on auth state
Step 5.2: Auth Navigator (Stack)
Splash Screen
Login Screen
Register Screen
OTP Verification Screen
Step 5.3: Owner Navigator (Bottom Tabs)
Tab 1: Dashboard (Stack: Dashboard → WorkEntryDetail, Reports)
Tab 2: Employees (Stack: EmployeeList → AddEmployee, EmployeeDetail)
Tab 3: Services (Stack: ServiceList → AddService, EditService)
Tab 4: Profile/Settings
Step 5.4: Employee Navigator (Bottom Tabs)
Tab 1: Home (Today's summary)
Tab 2: History (Stack: HistoryList → EntryDetail)
Tab 3: Profile
Phase 6: Authentication Screens
Step 6.1: Splash Screen
File: src/screens/auth/SplashScreen.tsx
App logo animation
Check AsyncStorage for auth token
Navigate to Login or Dashboard
Step 6.2: Login Screen
File: src/screens/auth/LoginScreen.tsx
Phone number input (with country code selector)
Password input (with show/hide toggle)
"Login" button
"Don't have account? Register" link
Form validation
Step 6.3: Register Screen
File: src/screens/auth/RegisterScreen.tsx
Name, Phone, Email (optional), Password inputs
Role selector (Owner/Employee - for demo)
"Register" button
Mock registration (add to AsyncStorage)
Step 6.4: OTP Verification Screen (Optional for MVP)
File: src/screens/auth/OTPScreen.tsx
6-digit OTP input boxes
Resend OTP button
Mock verification
Phase 7: Onboarding Screens (Owner)
Step 7.1: Create Organization Screen
File: src/screens/onboarding/CreateOrgScreen.tsx
Organization name input
Timezone selector
Currency (default BDT)
Commission mode toggle
"Create Organization" button
Step 7.2: Join Organization Screen
File: src/screens/onboarding/JoinOrgScreen.tsx
Org code input (6-digit)
"Join" button
Mock join logic
Phase 8: Owner Dashboard (Core Screen)
Step 8.1: Dashboard Main View
File: src/screens/owner/DashboardScreen.tsx
Header: Organization name, date selector
Summary Cards:
Total Income Today (৳)
Total Cash (৳)
Total Bkash (৳)
Total Entries Count
Top 3 Employees Section (Card with employee name, photo, total)
Quick Action Buttons:
Add Work Entry
View All Entries
Export Report
Add Employee
Pull-to-refresh
Component: src/components/SummaryCard.tsx
Component: src/components/EmployeeRankCard.tsx
Step 8.2: Custom Hook for Dashboard
File: src/hooks/useDailySummary.ts
Fetch today's summary from DataContext
Calculate totals from work entries
Return: { summary, loading, refresh }
Phase 9: Employee Management (Owner)
Step 9.1: Employee List Screen
File: src/screens/owner/EmployeesScreen.tsx
Search bar (filter by name)
FlatList of employees
Employee card: Name, phone, role badge, status
"Add Employee" FAB (Floating Action Button)
Pull-to-refresh
Step 9.2: Add Employee Screen
File: src/screens/owner/AddEmployeeScreen.tsx
Form: Name, Phone, Email (optional), Role, Commission %
"Add Employee" button
Form validation
Add to mock data
Step 9.3: Employee Detail Screen
File: src/screens/owner/EmployeeDetailScreen.tsx
View employee info
Edit button (navigate to edit form)
Stats: Total services, total income, this month's performance
Delete employee button (with confirmation)
Component: src/components/EmployeeCard.tsx
Phase 10: Service Management (Owner)
Step 10.1: Service List Screen
File: src/screens/owner/ServicesScreen.tsx
Group by category (Sections: Haircut, Shave, Color, etc.)
SectionList with service cards
Service card: Name, default price, edit icon
"Add Service" FAB
Search/filter
Step 10.2: Add Service Screen
File: src/screens/owner/AddServiceScreen.tsx
Form: Service name, Category (dropdown), Default price (optional)
"Add Service" button
Add to mock data
Step 10.3: Edit Service Screen
File: src/screens/owner/EditServiceScreen.tsx
Same form as Add, pre-filled
"Update" and "Delete" buttons
Confirmation modal for delete
Phase 11: Work Entry Management (Owner)
Step 11.1: Work Entry List Screen
File: src/screens/owner/WorkEntriesScreen.tsx
Date filter (Today, Yesterday, Custom range)
FlatList of work entries
Entry card: Service name, employee name, price, payment method, timestamp
"Add Work Entry" FAB
Filter by employee dropdown
Pull-to-refresh
Component: src/components/WorkEntryCard.tsx
Step 11.2: Add Work Entry Screen
File: src/screens/owner/AddWorkEntryScreen.tsx
Employee dropdown (required)
Service dropdown with search (optional - can type custom)
Service name text input (if custom)
Price input (numeric keyboard)
Tip input (optional)
Payment method selector (Cash, bKash, Card, Other)
Notes input (optional)
"Submit Entry" button
Form validation
Component: src/components/WorkEntryForm.tsx
Step 11.3: Work Entry Detail Screen
File: src/screens/owner/WorkEntryDetailScreen.tsx
Display all entry details
Edit button (owner only)
Delete button with confirmation
Show edit history if edited
Phase 12: Reports & Export (Owner)
Step 12.1: Reports Screen
File: src/screens/owner/ReportsScreen.tsx
Date range selector (Today, This Week, This Month, Custom)
Summary section: Total income, total entries, breakdown by payment
Employee breakdown table/cards
Charts (optional): Bar chart of daily income, pie chart of payment methods
"Export CSV" button (mock - show success toast)
Step 12.2: Export Functionality (Mock)
Generate CSV string from data
Mock download (show success message)
Future: Use react-native-fs and Share API
Phase 13: Employee Screens
Step 13.1: Employee Home Screen
File: src/screens/employee/HomeScreen.tsx
Header: Employee name, today's date
Today's Summary Cards:
Total Services (count)
Total Income (৳)
Total Tips (৳)
Recent entries list (last 5)
"View All History" button
Step 13.2: Employee History Screen
File: src/screens/employee/HistoryScreen.tsx
Month selector (dropdown or calendar)
FlatList of personal work entries (filtered by employeeId)
Entry card: Service, price, tip, date, time
Pull-to-refresh
Monthly total at bottom
Step 13.3: Employee Profile Screen
File: src/screens/employee/ProfileScreen.tsx
Profile info: Name, phone, email
Commission percentage display
Overall stats: Total services, total income, member since
Logout button
Phase 14: Settings & Profile (Owner)
Step 14.1: Settings Screen
File: src/screens/owner/SettingsScreen.tsx
Organization settings section
User management link
Language toggle (English/Bengali - UI only)
About app
Logout button
Step 14.2: Organization Settings
File: src/screens/owner/OrgSettingsScreen.tsx
Edit org name
Change commission mode
View org code for invites
Phase 15: Shared Components
Step 15.1: Business Logic Components
src/components/DatePicker.tsx - Date/range selector
src/components/SearchBar.tsx - Search with debounce
src/components/FilterChips.tsx - Filter options
src/components/StatsCard.tsx - Reusable stat display
src/components/PaymentMethodBadge.tsx - Icon + label
src/components/RoleBadge.tsx - Owner/Employee badge
Step 15.2: Form Components
src/components/PhoneInput.tsx - Phone with country code
src/components/NumericInput.tsx - Number with BDT formatting
src/components/RadioGroup.tsx - Radio button group
src/components/Checkbox.tsx - Custom checkbox
Phase 16: Polish & UX Enhancements
Step 16.1: Loading States
Skeleton loaders for lists
Spinner for button actions
Pull-to-refresh indicators
Step 16.2: Empty States
No employees yet
No services added
No entries today
Friendly illustrations + CTA buttons
Step 16.3: Error Handling
Form validation errors
Network error states (for future API)
Toast notifications for success/error
Step 16.4: Animations
Screen transitions (fade/slide)
Button press feedback
List item animations
Modal slide-up
Phase 17: Offline Support (Mock)
Step 17.1: AsyncStorage Integration
Save all mock data to AsyncStorage
Load on app start
Persist auth state
Persist current org selection
Step 17.2: Sync Indicator (UI Only)
Status badge in header (Online/Offline)
Mock sync animation
"Last synced" timestamp display
Phase 18: Bengali Language Support (Basic)
Step 18.1: Internationalization Setup
Install react-i18next or simple translation object
File: src/constants/translations.ts
English and Bengali strings
Language toggle in settings
Step 18.2: Bengali Numerals & Currency
Format numbers with Bengali digits (optional)
BDT symbol: ৳
Phase 19: Testing & Refinement
Step 19.1: Manual Testing Checklist
<input disabled="" type="checkbox"> All navigation flows work
<input disabled="" type="checkbox"> Forms validate properly
<input disabled="" type="checkbox"> Mock data persists after app restart
<input disabled="" type="checkbox"> Responsive on different screen sizes
<input disabled="" type="checkbox"> Owner vs Employee views are distinct
<input disabled="" type="checkbox"> All buttons/actions have feedback
Step 19.2: Edge Cases
Empty state handling
Long text overflow (names, service names)
Large lists (100+ entries)
Date edge cases (month boundaries)
Phase 20: Build & Demo Preparation
Step 20.1: Android Build
Generate debug APK
Test on real device
Performance check
Step 20.2: iOS Build (if Mac available)
Run on simulator
Generate IPA for TestFlight (optional)
Step 20.3: Demo Data
Create realistic demo scenario
1 salon with 5 employees
7 days of entries
Various services and payments
Execution Order (Frontend Only):
✅ Setup (Steps 1.1 - 1.4) - Project initialization
✅ Design System (Steps 2.1 - 2.3) - UI components
✅ Types & Mock Data (Steps 3.1 - 3.3) - Data foundation
✅ State Management (Steps 4.1 - 4.3) - Context APIs
✅ Navigation (Steps 5.1 - 5.4) - App structure
✅ Auth Screens (Steps 6.1 - 6.4) - Login/Register
✅ Onboarding (Steps 7.1 - 7.2) - Org creation
✅ Owner Dashboard (Steps 8.1 - 8.2) - Main screen
✅ Employee Management (Steps 9.1 - 9.3) - CRUD employees
✅ Service Management (Steps 10.1 - 10.3) - CRUD services
✅ Work Entries (Steps 11.1 - 11.3) - Core feature
✅ Reports (Steps 12.1 - 12.2) - Analytics
✅ Employee Views (Steps 13.1 - 13.3) - Employee app
✅ Settings (Steps 14.1 - 14.2) - Configuration
✅ Shared Components (Steps 15.1 - 15.2) - Reusables
✅ Polish (Steps 16.1 - 16.4) - UX refinement
✅ Offline Mock (Steps 17.1 - 17.2) - Data persistence
✅ i18n (Steps 18.1 - 18.2) - Bengali support
✅ Testing (Steps 19.1 - 19.2) - QA
✅ Build (Steps 20.1 - 20.3) - Demo ready