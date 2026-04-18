# ⚡ CutBook - Quick Reference Card

## 🚀 Common Commands

```bash
# Start Development
npm start              # Start Metro
npm run ios           # Run iOS
npm run android       # Run Android
npm run start:reset   # Clear cache & start

# Code Quality (Run before commit!)
npm run type-check    # ✓ Check TypeScript
npm run lint         # ✓ Check ESLint
npm run lint:fix     # ⚡ Auto-fix issues
npm run format       # ⚡ Format all files

# Testing
npm test             # Run tests
npm run test:watch   # Watch mode
npm run test:coverage # With coverage

# Troubleshooting
npm run clean:cache  # Clean everything
```

## 📁 Import Paths (Use these!)

```typescript
import {Button} from '@/components/UI/Button';
import {DashboardScreen} from '@/screens/owner/Dashboard';
import {useAuth} from '@/context/AuthContext';
import {useDailySummary} from '@/hooks/useDailySummary';
import {formatDate} from '@/utils/date';
import {formatBDT} from '@/utils/currency';
import type {User, Organization} from '@/types';
import {colors, spacing} from '@/constants/theme';
import logo from '@/assets/images/logo.png';
```

## 🎨 Code Style

```typescript
// Component Template
import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import type {User} from '@/types';

interface Props {
  user: User;
  onPress: () => void;
}

export const UserCard: React.FC<Props> = ({user, onPress}) => {
  return (
    <View style={styles.container}>
      <Text>{user.name}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
});
```

## 🔧 VS Code Shortcuts

- **Shift + Alt + F**: Format document
- **Ctrl/Cmd + S**: Save (auto-format + auto-fix)
- **F5**: Start debugging
- **Ctrl/Cmd + P**: Quick open file
- **Ctrl/Cmd + Shift + P**: Command palette

## 📝 Git Workflow

```bash
# Before commit
npm run type-check
npm run lint
npm test

# Commit
git add .
git commit -m "feat: add user authentication"
git push
```

## 🐛 Common Issues & Fixes

### Metro bundler issues
```bash
npm run start:reset
```

### iOS build issues
```bash
cd ios && pod install && cd ..
npm run ios
```

### Android build issues
```bash
cd android && ./gradlew clean && cd ..
npm run android
```

### Nuclear option (if all else fails)
```bash
npm run clean:cache
```

### TypeScript errors
```bash
npm run type-check
# Fix the errors shown
```

### ESLint errors
```bash
npm run lint:fix
# If can't auto-fix, check the file manually
```

## 📂 Folder Purposes

| Folder | Purpose | Example |
|--------|---------|---------|
| `components/UI/` | Reusable UI primitives | Button, Input, Card |
| `components/shared/` | Business components | WorkEntryForm, EmployeeCard |
| `screens/` | Full-page views | Dashboard, Login |
| `navigation/` | Navigation config | RootNavigator |
| `context/` | Global state | AuthContext |
| `hooks/` | Custom hooks | useDailySummary |
| `utils/` | Helper functions | date.ts, currency.ts |
| `types/` | TypeScript types | index.ts |
| `constants/` | Static data | theme.ts, mockData.ts |
| `assets/` | Images, fonts | logo.png |

## 🎯 Development Workflow

1. Create types in `src/types/`
2. Create utils in `src/utils/`
3. Create UI components in `src/components/UI/`
4. Create context in `src/context/`
5. Create screens in `src/screens/`
6. Connect with navigation

## ✅ Pre-Commit Checklist

- [ ] TypeScript compiles (`npm run type-check`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] Code formatted (`npm run format`)
- [ ] Tests pass (`npm test`)
- [ ] App runs on simulator

## 📱 Test on Device

### iOS (Mac only)
1. Open Xcode: `xed -b ios`
2. Select device/simulator
3. Click Run or `npm run ios`

### Android
1. Start emulator (Android Studio)
2. Run `npm run android`

---

**Quick Links**:
- [Progress Tracker](PROGRESS.md)
- [Dev Tools Guide](STEP_1.4_DEV_TOOLS.md)
- [Project Structure](PROJECT_STRUCTURE.md)

**Status**: Phase 1 Complete ✅ | Ready for Phase 2 🚀
