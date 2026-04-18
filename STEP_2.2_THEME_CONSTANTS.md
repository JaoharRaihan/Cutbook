# 🎨 Step 2.2 - Theme & Constants Setup

**Status**: ✅ Complete  
**Date**: December 12, 2025

---

## 📋 Overview

Created a comprehensive design system with theme configuration and app-wide constants. This provides a centralized, type-safe way to manage colors, typography, spacing, and other design tokens throughout the application.

---

## 📦 Files Created

### 1. `src/constants/theme.ts` (620+ lines)
**Purpose**: Complete design system with all visual design tokens

**Key Sections**:

#### Colors
- **Primary** (Blue): 10 shades from 50-900
- **Secondary** (Purple): 10 shades from 50-900
- **Accent** (Teal): 10 shades from 50-900
- **Success** (Green): light, main, dark
- **Warning** (Orange): light, main, dark
- **Error** (Red): light, main, dark
- **Info** (Light Blue): light, main, dark
- **Neutral** (Gray): 12 shades from 0-1000
- **Text**: primary, secondary, disabled, hint, inverse
- **Background**: default, paper, dark, overlay
- **Border**: light, main, dark
- **Payment Methods**: cash (green), bKash (pink), nagad (orange), card (blue), other (gray)
- **Status Colors**: active (green), blocked (red), pending (orange)
- **Category Colors**: 8 colors for service categories

#### Typography
- **Font Families**: System fonts (regular, medium, bold, semiBold, light)
- **Font Sizes**: 11 sizes from xs (10px) to 6xl (40px)
- **Font Weights**: 6 weights from light (300) to extraBold (800)
- **Line Heights**: tight, normal, relaxed, loose
- **Letter Spacing**: 6 options from tighter to widest
- **Predefined Styles**: h1-h6, body1-2, button, caption, overline

#### Spacing
- **Base Unit**: 4px
- **Scale**: xs (4px) to 6xl (64px)
- **Named Spacing**: screenPadding, cardPadding, sectionGap, elementGap, etc.

#### Border Radius
- **Scale**: none (0) to full (9999)
- **Named Radius**: button, card, input, modal, chip

#### Shadows
- **6 Levels**: none, sm, md, lg, xl, 2xl
- **Cross-Platform**: iOS shadowColor/shadowOffset, Android elevation

#### Other Design Tokens
- **Icon Sizes**: xs (12) to 4xl (64)
- **Opacity**: disabled, hover, selected, focus, divider
- **Z-Index**: appBar, drawer, modal, snackbar, tooltip
- **Animation**: durations (150ms-375ms), easing functions

### 2. `src/constants/index.ts` (300+ lines)
**Purpose**: App-wide constants and configuration

**Key Sections**:

#### App Configuration
```typescript
APP_CONFIG = {
  name: 'CutBook',
  version: '1.0.0',
  currency: 'BDT',
  currencySymbol: '৳',
  timezone: 'Asia/Dhaka',
  dateFormat: 'DD MMM YYYY',
  // ...
}
```

#### Storage Keys
- AsyncStorage keys for auth, user data, org, theme, language

#### Validation Rules
- Phone: Bangladesh format (01X-XXXXXXXX)
- Password: min 6 characters
- Name, price, commission, invite code rules

#### UI Labels
- Service categories (Haircut, Shave, Beard, etc.)
- Payment methods (Cash, bKash, Nagad, Card)
- User roles (Owner, Employee)
- User statuses (Active, Blocked, Pending)
- Commission modes (Percentage, Manual, Fixed)

#### Icons
- 50+ icon names for MaterialIcons
- Navigation, actions, status, business, services, payment

#### Messages
- **Error Messages**: 15+ common error scenarios
- **Success Messages**: 10+ success notifications
- **Placeholders**: Input field placeholders
- **Empty States**: No data messages

---

## 🎯 Usage Examples

### 1. Using Colors

```typescript
import {Theme} from '@/constants';
import {View, Text} from 'react-native';

const MyComponent = () => (
  <View style={{backgroundColor: Theme.colors.primary[500]}}>
    <Text style={{color: Theme.colors.text.primary}}>
      Hello CutBook
    </Text>
  </View>
);
```

### 2. Using Typography

```typescript
import {Theme} from '@/constants';
import {Text} from 'react-native';

const Heading = () => (
  <Text style={Theme.typography.styles.h1}>
    Dashboard
  </Text>
);

const Body = () => (
  <Text style={{
    fontSize: Theme.typography.fontSize.md,
    fontWeight: Theme.typography.fontWeight.regular,
  }}>
    Welcome to CutBook
  </Text>
);
```

### 3. Using Spacing

```typescript
import {Theme} from '@/constants';
import {View} from 'react-native';

const Container = () => (
  <View style={{
    padding: Theme.spacing.lg,        // 16px
    marginBottom: Theme.spacing.xl,   // 20px
    gap: Theme.spacing.md,            // 12px
  }}>
    {/* Content */}
  </View>
);
```

### 4. Using Shadows

```typescript
import {Theme} from '@/constants';
import {View} from 'react-native';

const Card = () => (
  <View style={{
    ...Theme.shadows.md,
    borderRadius: Theme.borderRadius.card,
    padding: Theme.spacing.cardPadding,
  }}>
    {/* Card content */}
  </View>
);
```

### 5. Using Constants

```typescript
import {APP_CONFIG, VALIDATION, ERROR_MESSAGES} from '@/constants';

// Currency formatting
const price = 500;
const formatted = `${APP_CONFIG.currencySymbol}${price}`; // ৳500

// Validation
const phoneRegex = VALIDATION.phone.pattern;
const isValid = phoneRegex.test('01712345678'); // true

// Error messages
const error = ERROR_MESSAGES.invalidCredentials;
```

### 6. Using Icons

```typescript
import {ICONS} from '@/constants';
import Icon from 'react-native-vector-icons/MaterialIcons';

const HomeIcon = () => (
  <Icon name={ICONS.home} size={24} color="#000" />
);
```

### 7. Using Payment Colors

```typescript
import {Theme} from '@/constants';
import {PaymentMethod} from '@/types';

const getPaymentColor = (method: PaymentMethod) => {
  return Theme.colors.payment[method];
};

// Usage
const color = getPaymentColor('bkash'); // #E2136E (bKash pink)
```

---

## 🎨 Design System Features

### ✅ Type Safety
- All theme values are strongly typed
- TypeScript autocomplete works perfectly
- Prevents typos and invalid values

### ✅ Consistency
- Centralized design tokens
- Same values used across entire app
- Easy to maintain and update

### ✅ Scalability
- Easy to add new colors/spacing
- Simple to create dark theme later
- Organized by category

### ✅ Best Practices
- 4px base spacing unit (industry standard)
- Color system with proper contrast ratios
- Typography scale following Material Design
- Cross-platform shadows (iOS + Android)

---

## 🎯 Design Principles

### Color Palette
- **Primary Blue**: Professional, trustworthy (salon management)
- **Secondary Purple**: Elegant, creative (beauty industry)
- **Accent Teal**: Modern, fresh
- **Payment Colors**: Brand-specific (bKash pink, Nagad orange)
- **Status Colors**: Semantic (green=active, red=blocked, orange=pending)

### Typography
- **System Fonts**: Native look & feel, better performance
- **Scale**: Clear hierarchy from body to headings
- **Readability**: Proper line heights and letter spacing

### Spacing
- **4px Base**: Divides evenly, works well for all screen sizes
- **Consistent Scale**: Predictable, harmonious layouts
- **Named Values**: Semantic spacing for common use cases

### Shadows
- **Elevation System**: 6 levels for depth hierarchy
- **Cross-Platform**: Works on both iOS and Android
- **Subtle**: Not overwhelming, professional

---

## 📊 Statistics

| Category | Count | Examples |
|----------|-------|----------|
| **Color Palettes** | 13 | Primary, Secondary, Accent, Success, Error, etc. |
| **Color Values** | 80+ | All shades, text, backgrounds, borders |
| **Typography Styles** | 11 | h1-h6, body1-2, button, caption, overline |
| **Spacing Values** | 11 | xs to 6xl + named spacing |
| **Border Radius** | 10 | none to full + named radius |
| **Shadows** | 6 | none, sm, md, lg, xl, 2xl |
| **Icons** | 50+ | Navigation, actions, business, services |
| **Messages** | 40+ | Errors, success, placeholders, empty states |

**Total Lines**: ~950 lines of configuration

---

## ✅ Verification

```bash
# Type check
npm run type-check
# ✅ No errors

# Lint check
npm run lint
# ✅ No errors
```

---

## 🔄 Next Steps

**Step 2.3**: Utility Functions
- Date utilities (format, parse, calculate)
- Currency utilities (format BDT)
- Validation utilities (phone, email, price)
- Calculation utilities (commission, totals, aggregation)

---

## 💡 Tips

### Creating Themed Components

```typescript
// Bad ❌
<View style={{backgroundColor: '#2196F3', padding: 16}}>

// Good ✅
<View style={{
  backgroundColor: Theme.colors.primary[500],
  padding: Theme.spacing.lg,
}}>
```

### Using Semantic Values

```typescript
// Bad ❌
<Text style={{fontSize: 16, fontWeight: '700'}}>

// Good ✅
<Text style={Theme.typography.styles.h6}>
```

### Payment Method Colors

```typescript
// Dynamic payment badge color
const getBadgeColor = (method: PaymentMethod) => 
  Theme.colors.payment[method];
```

---

**Step 2.2 Complete!** ✅  
**Phase 2 Progress**: 66% (2 of 3 steps)  
**Overall Progress**: ~26% (6 of 23 steps)

Ready to proceed to Step 2.3! 🚀
