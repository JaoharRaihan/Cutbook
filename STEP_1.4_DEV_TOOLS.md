# 🛠️ CutBook - Dev Tools Configuration (Step 1.4)

## ✅ Completed Configuration

### 1. TypeScript Configuration

**File**: `tsconfig.json`

#### Path Aliases Configured ✅
```typescript
"@/*"           → "src/*"
"@/components/*" → "src/components/*"
"@/screens/*"    → "src/screens/*"
"@/navigation/*" → "src/navigation/*"
"@/context/*"    → "src/context/*"
"@/hooks/*"      → "src/hooks/*"
"@/utils/*"      → "src/utils/*"
"@/types/*"      → "src/types/*"
"@/constants/*"  → "src/constants/*"
"@/assets/*"     → "src/assets/*"
```

**Benefits**:
- No more `../../../` relative imports
- Autocomplete support in VS Code
- Type-safe imports

**Example Usage**:
```typescript
// Before
import {Button} from '../../../components/UI/Button';

// After
import {Button} from '@/components/UI/Button';
```

#### Strict Mode Enabled ✅
- `strict: true` - Enables all strict type checking
- `skipLibCheck: true` - Faster compilation
- `resolveJsonModule: true` - Import JSON files

---

### 2. Babel Configuration

**File**: `babel.config.js`

#### Module Resolver Plugin ✅
```bash
npm install --save-dev babel-plugin-module-resolver
```

**Configured Aliases**:
- Maps TypeScript path aliases to runtime imports
- Supports `.ios.js`, `.android.js`, platform-specific files
- Works with Metro bundler

---

### 3. ESLint Configuration

**File**: `.eslintrc.js`

#### Installed Packages ✅
```bash
npm install --save-dev eslint-plugin-prettier eslint-config-prettier
```

#### Rules Configured:
- ✅ TypeScript-specific rules
- ✅ React Native best practices
- ✅ Prettier integration
- ✅ React Hooks dependency warnings
- ✅ Console.log warnings (allows warn/error)

#### Custom Rules:
```javascript
'@typescript-eslint/no-shadow': 'error'
'react-native/no-inline-styles': 'warn'
'react/react-in-jsx-scope': 'off'  // Not needed in React 17+
'react-hooks/exhaustive-deps': 'warn'
'no-console': ['warn', {allow: ['warn', 'error']}]
```

---

### 4. Prettier Configuration

**File**: `.prettierrc.js`

#### Updated Prettier ✅
```bash
npm install --save-dev prettier@latest
```

**Version**: 3.4.2 (latest)

#### Formatting Rules:
```javascript
{
  arrowParens: 'avoid',          // x => x  (not (x) => x)
  bracketSameLine: true,         // <Button> not <Button
  bracketSpacing: false,         // {x} not { x }
  singleQuote: true,             // 'text' not "text"
  trailingComma: 'all',          // [1, 2,]
  semi: true,                    // x = 1;
  tabWidth: 2,                   // 2 spaces
  printWidth: 100,               // Max line length
  endOfLine: 'auto'              // Cross-platform
}
```

---

### 5. VS Code Configuration

**Files Created**:
- `.vscode/settings.json` ✅
- `.vscode/extensions.json` ✅
- `.vscode/launch.json` ✅

#### Workspace Settings ✅

**Auto-formatting**:
- Format on save enabled
- ESLint auto-fix on save
- Prettier as default formatter

**Performance**:
- Excluded `node_modules`, `Pods`, build folders from search
- Optimized file watchers

**TypeScript**:
- Uses workspace TypeScript version
- Autocomplete for path aliases

#### Recommended Extensions ✅

**Essential** (Install these):
1. **ESLint** (`dbaeumer.vscode-eslint`)
2. **Prettier** (`esbenp.prettier-vscode`)
3. **React Native Tools** (`msjsdiag.vscode-react-native`)
4. **ES7+ React Snippets** (`dsznajder.es7-react-js-snippets`)

**Recommended**:
5. **TypeScript** (`ms-vscode.vscode-typescript-next`)
6. **Jest** (`orta.vscode-jest`)
7. **Jest Runner** (`firsttris.vscode-jest-runner`)
8. **GitHub Copilot** (`github.copilot`)
9. **Error Lens** (`usernamehw.errorlens`)
10. **Path Intellisense** (`christian-kohler.path-intellisense`)

#### Debug Configuration ✅

**Launch Configs**:
- Debug Android
- Debug iOS
- Attach to packager
- Run Jest Tests

---

### 6. EditorConfig

**File**: `.editorconfig` ✅

**Purpose**: Consistent formatting across all editors

**Settings**:
- Unix-style line endings (LF)
- UTF-8 encoding
- Trim trailing whitespace
- 2-space indentation for JS/TS/JSON
- 4-space for Gradle/XML

---

### 7. NPM Scripts

**File**: `package.json`

#### New Scripts Added ✅

```json
{
  "lint": "eslint .",                    // Check for errors
  "lint:fix": "eslint . --fix",          // Auto-fix errors
  "format": "prettier --write \"src/**/*.{ts,tsx,js,jsx,json}\"",
  "format:check": "prettier --check \"src/**/*.{ts,tsx,js,jsx,json}\"",
  "type-check": "tsc --noEmit",          // Check TypeScript types
  "start:reset": "react-native start --reset-cache",
  "test:watch": "jest --watch",
  "test:coverage": "jest --coverage",
  "clean": "...",                        // Clean native builds
  "clean:cache": "..."                   // Nuclear option: clean everything
}
```

#### Usage Examples:

```bash
# Development workflow
npm run type-check    # Check types
npm run lint         # Check linting
npm run lint:fix     # Auto-fix issues
npm run format       # Format all files

# Testing
npm test             # Run tests once
npm run test:watch   # Watch mode
npm run test:coverage # With coverage report

# Troubleshooting
npm run start:reset  # Reset Metro cache
npm run clean:cache  # Clean everything and reinstall
```

---

## 📦 New Packages Installed

| Package | Version | Purpose |
|---------|---------|---------|
| babel-plugin-module-resolver | 5.0.2 | Path alias resolution |
| eslint-plugin-prettier | 5.5.4 | Prettier ESLint integration |
| eslint-config-prettier | 9.2.0 | Disable conflicting rules |
| prettier | 3.4.2 | Code formatting |

**Total New Dev Dependencies**: 4 packages + 15 sub-dependencies

---

## ✅ Verification

### TypeScript ✅
```bash
npm run type-check
# ✓ No type errors
```

### ESLint ✅
```bash
npm run lint
# ✓ No linting errors (after auto-fix)
```

### Prettier ✅
```bash
npm run format:check
# ✓ All files formatted correctly
```

---

## 🚀 Developer Workflow

### Before Committing:
```bash
npm run type-check   # Ensure types are correct
npm run lint        # Check for issues
npm run format      # Format code
npm test           # Run tests
```

### VS Code Shortcuts:
- **Shift + Alt + F**: Format document
- **Ctrl/Cmd + S**: Save (auto-format + auto-fix)
- **F5**: Start debugging
- **Ctrl/Cmd + Shift + P**: Command palette

---

## 🎨 Code Style Guide

### Import Order:
```typescript
// 1. External packages
import React from 'react';
import {View, Text} from 'react-native';

// 2. Internal with path aliases
import {Button} from '@/components/UI/Button';
import {useAuth} from '@/context/AuthContext';
import {formatDate} from '@/utils/date';

// 3. Types
import type {User} from '@/types';

// 4. Styles (if separate file)
import styles from './styles';
```

### Component Structure:
```typescript
// 1. Imports
// 2. Types/Interfaces
// 3. Component
// 4. Styles
// 5. Export

import React from 'react';
import {View, Text} from 'react-native';

interface Props {
  title: string;
}

export const MyComponent: React.FC<Props> = ({title}) => {
  return (
    <View>
      <Text>{title}</Text>
    </View>
  );
};
```

### Naming Conventions:
- **Components**: PascalCase (`Button.tsx`, `UserCard.tsx`)
- **Files**: camelCase (`date.ts`, `calculations.ts`)
- **Folders**: lowercase (`components`, `screens`)
- **Constants**: UPPER_SNAKE_CASE (`API_URL`, `MAX_RETRIES`)
- **Types/Interfaces**: PascalCase (`User`, `WorkEntry`)

---

## 📚 Documentation Files

- ✅ `STEP_1.4_DEV_TOOLS.md` (this file)
- ✅ `.vscode/settings.json`
- ✅ `.vscode/extensions.json`
- ✅ `.vscode/launch.json`
- ✅ `.editorconfig`

---

## 🎯 What's Next? (Step 2.1)

**Phase 2: Core Architecture & Type System**
- Define TypeScript interfaces in `src/types/`
- Create theme system in `src/constants/theme.ts`
- Build utility functions in `src/utils/`

---

**Status**: Step 1.4 Complete ✅  
**Next**: Step 2.1 - TypeScript Types Definition  
**Updated**: December 12, 2025
