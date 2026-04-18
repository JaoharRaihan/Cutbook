# CutBook - Development Guide

## 📦 Step 1.2: Project Structure Setup - COMPLETED ✅

### What We've Done:

1. ✅ **Initialized React Native Project**
   - React Native 0.83.0 with TypeScript
   - Package manager: npm
   - Platform: iOS & Android

2. ✅ **Created Folder Structure**
   ```
   src/
   ├── components/
   │   ├── UI/              # Base UI components
   │   └── shared/          # Business components
   ├── screens/
   │   ├── auth/            # Login, Register, OTP
   │   ├── owner/           # Owner screens
   │   ├── employee/        # Employee screens
   │   └── onboarding/      # Org setup
   ├── navigation/          # React Navigation
   ├── context/             # State management
   ├── hooks/               # Custom hooks
   ├── utils/               # Helper functions
   ├── types/               # TypeScript types
   ├── constants/           # Theme, mock data, i18n
   └── assets/              # Images, fonts
   ```

3. ✅ **Git Repository Initialized**
   - .gitignore configured
   - Ready for version control

## 🔧 Current Configuration

### Dependencies (Installed)
```json
{
  "react": "19.2.0",
  "react-native": "0.83.0",
  "react-native-safe-area-context": "^5.5.2"
}
```

### Dev Dependencies
- TypeScript 5.8.3
- ESLint configured
- Prettier configured
- Jest for testing

## 📋 Next Steps (Step 1.3: Install Dependencies)

### Required Packages to Install:

#### Navigation
- @react-navigation/native
- @react-navigation/stack
- @react-navigation/bottom-tabs
- react-native-screens (already have safe-area-context)
- react-native-gesture-handler

#### Utilities
- date-fns
- @react-native-async-storage/async-storage
- react-native-vector-icons

#### Forms & Validation (Optional)
- react-hook-form
- yup

## 🚀 Running the Project

### Start Metro Bundler
```bash
npm start
```

### Run on iOS
```bash
npm run ios
```

### Run on Android
```bash
npm run android
```

### Run Tests
```bash
npm test
```

### Lint Code
```bash
npm run lint
```

## 📝 Development Workflow

1. **Create types first** in `src/types/`
2. **Build UI components** in `src/components/UI/`
3. **Setup context** in `src/context/`
4. **Create screens** in `src/screens/`
5. **Configure navigation** in `src/navigation/`
6. **Test** as you build

## 🎨 Coding Standards

- Use **TypeScript** for all files
- Follow **ESLint** rules
- Use **Prettier** for formatting
- Write **meaningful commit messages**
- Keep components **small and focused**
- Use **functional components** with hooks

## 📱 App Architecture (Frontend Only - MVP)

```
User opens app
    ↓
Check AsyncStorage for auth token
    ↓
Authenticated? 
    YES → Navigate to Dashboard (Owner/Employee)
    NO  → Navigate to Login
    ↓
User actions (add entry, view summary, etc.)
    ↓
Update local state (Context)
    ↓
Persist to AsyncStorage (offline support)
    ↓
Display updated UI
```

---

**Status**: Step 1.2 Complete ✅  
**Next**: Step 1.3 - Install Navigation & Core Dependencies  
**Updated**: December 12, 2025
