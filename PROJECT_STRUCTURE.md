# CutBook - Project Structure

## 📁 Directory Structure

```
CutBook/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── UI/             # Base UI components (Button, Input, Card, etc.)
│   │   └── shared/         # Business logic components (WorkEntryForm, EmployeeCard, etc.)
│   │
│   ├── screens/            # App screens/pages
│   │   ├── auth/          # Authentication screens (Login, Register, OTP)
│   │   ├── owner/         # Owner-specific screens (Dashboard, Employees, Services, etc.)
│   │   ├── employee/      # Employee-specific screens (Home, History, Profile)
│   │   └── onboarding/    # Onboarding screens (CreateOrg, JoinOrg)
│   │
│   ├── navigation/         # Navigation configuration
│   │   ├── RootNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   ├── OwnerNavigator.tsx
│   │   └── EmployeeNavigator.tsx
│   │
│   ├── context/            # React Context for state management
│   │   ├── AuthContext.tsx
│   │   ├── OrgContext.tsx
│   │   └── DataContext.tsx
│   │
│   ├── hooks/              # Custom React hooks
│   │   ├── useDailySummary.ts
│   │   ├── useOrgData.ts
│   │   └── useWorkEntries.ts
│   │
│   ├── utils/              # Utility functions
│   │   ├── date.ts
│   │   ├── currency.ts
│   │   ├── validation.ts
│   │   └── calculations.ts
│   │
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts
│   │
│   ├── constants/          # App constants
│   │   ├── theme.ts
│   │   ├── mockData.ts
│   │   └── translations.ts
│   │
│   └── assets/             # Static assets
│       ├── images/
│       └── fonts/
│
├── android/                # Android native code
├── ios/                    # iOS native code
├── App.tsx                 # Root component
├── index.js                # Entry point
└── package.json            # Dependencies

```

## 🎯 Purpose of Each Directory

### `/src/components/`
Reusable components that can be used across multiple screens:
- **UI/**: Low-level components (Button, Input, Modal, etc.)
- **shared/**: Business-specific components (WorkEntryForm, EmployeeCard, SummaryCard)

### `/src/screens/`
Full-screen views organized by user role:
- **auth/**: Login, Registration, OTP verification
- **owner/**: Dashboard, Employee management, Service management, Work entries, Reports
- **employee/**: Personal dashboard, Work history, Profile
- **onboarding/**: Organization creation and joining

### `/src/navigation/`
Navigation structure and routing configuration

### `/src/context/`
Global state management using React Context API:
- **AuthContext**: User authentication state
- **OrgContext**: Current organization data
- **DataContext**: Work entries and daily summaries

### `/src/hooks/`
Custom hooks for data fetching and business logic

### `/src/utils/`
Helper functions for common operations

### `/src/types/`
TypeScript interfaces and type definitions

### `/src/constants/`
Static data: theme, mock data, translations

### `/src/assets/`
Images, fonts, and other static files

---

## 🚀 Development Flow

1. **Types First**: Define interfaces in `/src/types/`
2. **Utils & Constants**: Create helper functions and theme
3. **UI Components**: Build base components in `/src/components/UI/`
4. **Context**: Setup state management
5. **Screens**: Build individual screens
6. **Navigation**: Connect screens with navigation
7. **Integration**: Connect everything together

---

Generated: December 2025
App: CutBook - Salon Management System
