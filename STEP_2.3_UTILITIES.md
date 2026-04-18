# 🔧 Step 2.3 - Utility Functions

**Status**: ✅ Complete  
**Date**: December 12, 2025

---

## 📋 Overview

Created comprehensive utility functions for date operations, currency formatting, input validation, and business calculations. These utilities provide the foundation for all business logic in the CutBook application.

---

## 📦 Files Created

### 1. `src/utils/date.ts` (450+ lines)
**Purpose**: Date formatting, parsing, and calculations

**Key Functions**:

#### Formatting (8 functions)
- `formatDate()` - Format date with custom pattern
- `formatDateISO()` - Format to YYYY-MM-DD
- `formatTime()` - Format time (hh:mm AM/PM)
- `formatDateTime()` - Combined date and time
- `formatDisplayDate()` - User-friendly relative dates ("Today", "Yesterday", "3 days ago")
- `getMonthName()` - Full month name
- `getShortMonthName()` - Short month name
- `formatPhone()` - Format Bangladesh phone number

#### Parsing (3 functions)
- `parseDate()` - Parse string to Date
- `isValidDate()` - Validate date string
- `getTodayString()` - Get today as YYYY-MM-DD

#### Current Date/Time (4 functions)
- `getToday()` - Today at 00:00:00
- `getTodayString()` - Today as string
- `getNow()` - Current timestamp
- `getCurrentDateTime()` - Current Date object

#### Date Ranges (5 functions)
- `getDateRange()` - Get range for period (today, last7Days, etc.)
- `getWeekRange()` - Sunday to Saturday
- `getMonthRange()` - First to last day of month
- `getCustomRange()` - Custom start/end dates
- `getDateArray()` - Generate array of dates

#### Calculations (4 functions)
- `getDaysDifference()` - Days between dates
- `addDaysToDate()` - Add days
- `subtractDaysFromDate()` - Subtract days
- `addMonthsToDate()` / `subtractMonthsToDate()` - Month arithmetic

#### Comparisons (4 functions)
- `isToday()` - Check if date is today
- `isPast()` - Check if date is before today
- `isFuture()` - Check if date is after today
- `isDateInRange()` - Check if date is between two dates

**Total**: 35+ date utility functions

---

### 2. `src/utils/currency.ts` (400+ lines)
**Purpose**: BDT currency formatting and calculations

**Key Functions**:

#### Formatting (5 functions)
- `formatBDT()` - Format to ৳1,234.50
- `formatBDTNoDecimal()` - Format to ৳1,234
- `formatBDTCompact()` - Compact notation (৳1.2K, ৳5.5M)
- `formatInputValue()` - Format for input field
- `getInputDisplayValue()` - Get display value

#### Parsing (2 functions)
- `parseCurrency()` - Parse "৳1,234.50" to 1234.50
- `parseInputAmount()` - Parse user input to number

#### Validation (2 functions)
- `isValidAmount()` - Check if valid amount
- `isValidPrice()` - Check if valid price (min/max)

#### Calculations (6 functions)
- `calculatePercentage()` - Calculate % of amount
- `calculatePercentageRounded()` - Calculate with rounding
- `roundAmount()` - Round to decimal places
- `sumAmounts()` - Sum array of amounts
- `averageAmounts()` - Calculate average
- `areAmountsEqual()` - Compare with precision

#### Currency Info (3 functions)
- `getCurrencySymbol()` - Get ৳
- `getCurrencyCode()` - Get BDT
- `getCurrencyInfo()` - Get full currency details

**Total**: 20+ currency utility functions

---

### 3. `src/utils/validation.ts` (500+ lines)
**Purpose**: Input validation and error messages

**Key Functions**:

#### Phone Validation (3 functions)
- `validatePhone()` - Validate Bangladesh format (01X-XXXXXXXX)
- `getPhoneError()` - Get error message
- `formatPhone()` - Format for display (01712 345678)

#### Email Validation (2 functions)
- `validateEmail()` - Validate email format
- `getEmailError()` - Get error message

#### Password Validation (3 functions)
- `validatePassword()` - Check min/max length
- `getPasswordError()` - Get error message
- `getPasswordConfirmError()` - Validate confirmation match

#### Name Validation (2 functions)
- `validateName()` - Check length requirements
- `getNameError()` - Get error message

#### Price Validation (2 functions)
- `validatePrice()` - Check price range
- `getPriceError()` - Get error message

#### Commission Validation (2 functions)
- `validateCommissionPercentage()` - Check 0-100 range
- `getCommissionPercentageError()` - Get error message

#### Invite Code Validation (3 functions)
- `validateInviteCode()` - Check 6-character alphanumeric
- `getInviteCodeError()` - Get error message
- `formatInviteCode()` - Format uppercase

#### Form Validation (4 functions)
- `validateRequired()` - Check required field
- `getRequiredError()` - Get error message
- `validateFields()` - Validate multiple fields
- `hasErrors()` - Check if errors exist

#### Sanitization (2 functions)
- `sanitizeString()` - Trim and clean string
- `sanitizeNumber()` - Parse and validate number

**Total**: 30+ validation functions

---

### 4. `src/utils/calculations.ts` (450+ lines)
**Purpose**: Business logic calculations

**Key Functions**:

#### Commission Calculations (2 functions)
- `calculateCommission()` - Calculate by mode (percentage/fixed/manual)
- `calculateEmployeeCommission()` - Calculate for employee with org settings

#### Work Entry Calculations (4 functions)
- `calculateWorkEntryTotal()` - Price + tip
- `calculateTotalIncome()` - Sum all prices
- `calculateTotalTips()` - Sum all tips
- `calculateGrandTotal()` - Income + tips

#### Payment Breakdown (2 functions)
- `calculateTotalByPaymentMethod()` - Total for specific method
- `calculatePaymentBreakdown()` - Breakdown for all methods

#### Employee Stats (2 functions)
- `calculateEmployeeStats()` - Stats for one employee
- `calculateAllEmployeeBreakdowns()` - Stats for all employees

#### Daily Summary (2 functions)
- `generateDailySummary()` - Generate summary from entries
- `aggregateDailySummaries()` - Aggregate multiple summaries

#### Statistics (4 functions)
- `calculateAveragePrice()` - Average service price
- `calculateAverageTip()` - Average tip
- `findHighestEarningEntry()` - Highest price entry
- `findMostUsedPaymentMethod()` - Most common payment method

#### Growth Calculations (2 functions)
- `calculateGrowthPercentage()` - Calculate % growth
- `calculatePeriodGrowth()` - Growth between periods

**Total**: 20+ calculation functions

---

### 5. `src/utils/index.ts`
**Purpose**: Central export for all utilities

```typescript
export * from './date';
export * from './currency';
export * from './validation';
export * from './calculations';
```

---

## 🎯 Usage Examples

### 1. Date Utilities

```typescript
import {formatDate, getDateRange, isToday, formatDisplayDate} from '@/utils';

// Format dates
const display = formatDate(new Date(), 'dd MMM yyyy'); // "12 Dec 2025"
const iso = formatDateISO(new Date()); // "2025-12-12"
const time = formatTime(new Date()); // "02:30 PM"

// Relative dates
const relative = formatDisplayDate('2025-12-11'); // "Yesterday"
const relative2 = formatDisplayDate('2025-12-05'); // "7 days ago"

// Date ranges
const {start, end} = getDateRange('last7Days');
const week = getWeekRange();
const month = getMonthRange();

// Comparisons
if (isToday(entry.createdAt)) {
  console.log('Created today!');
}
```

### 2. Currency Utilities

```typescript
import {formatBDT, formatBDTCompact, parseCurrency, calculatePercentage} from '@/utils';

// Formatting
const price = formatBDT(1234.5); // "৳1,234.50"
const compact = formatBDTCompact(1500000); // "৳1.5M"
const noDecimal = formatBDTNoDecimal(1234.5); // "৳1,235"

// Parsing
const amount = parseCurrency('৳1,234.50'); // 1234.5

// Calculations
const commission = calculatePercentage(500, 10); // 50
const total = sumAmounts([100, 200, 300]); // 600
```

### 3. Validation Utilities

```typescript
import {
  validatePhone,
  getPhoneError,
  validateEmail,
  getPriceError,
  validateFields,
} from '@/utils';

// Phone validation
const isValid = validatePhone('01712345678'); // true
const error = getPhoneError('0171234'); // "Phone must be 11 digits"

// Email validation
const emailValid = validateEmail('user@example.com'); // true

// Price validation
const priceError = getPriceError(50000); // null (valid)
const priceError2 = getPriceError(0); // "Price must be greater than 0"

// Form validation
const errors = validateFields({
  phone: {value: phone, validator: getPhoneError},
  price: {value: price, validator: getPriceError},
  name: {value: name, validator: v => getNameError(v, 'Service name')},
});

if (!hasErrors(errors)) {
  // Form is valid
}
```

### 4. Calculation Utilities

```typescript
import {
  calculateCommission,
  generateDailySummary,
  calculateEmployeeStats,
  aggregateDailySummaries,
} from '@/utils';

// Commission
const commission = calculateCommission(500, 'percentage', 10); // 50

// Employee stats
const stats = calculateEmployeeStats(entries, employeeId, 10);
// { employeeId, employeeName, totalCount, totalIncome, totalTips, commission }

// Daily summary
const summary = generateDailySummary(
  '2025-12-12',
  orgId,
  entries,
  employeeCommissions,
);

// Aggregate summaries
const totals = aggregateDailySummaries([summary1, summary2, summary3]);
// { totalIncome, totalTips, totalEntries, payment breakdown, employee breakdown }
```

---

## ✨ Key Features

### ✅ Type-Safe
- All functions fully typed with TypeScript
- Return types clearly defined
- IDE autocomplete support

### ✅ Comprehensive Error Handling
- Validates inputs
- Returns null/default values for invalid input
- Provides user-friendly error messages

### ✅ Bangladesh-Specific
- BDT currency (৳) formatting
- Bangladesh phone format (01X-XXXXXXXX)
- Asia/Dhaka timezone support

### ✅ Business Logic
- Commission calculations (percentage/fixed/manual)
- Daily summary generation
- Payment method breakdown
- Employee performance stats

### ✅ Well-Documented
- JSDoc comments for all functions
- Parameter descriptions
- Return type documentation
- Usage examples

---

## 📊 Statistics

| File | Lines | Functions | Purpose |
|------|-------|-----------|---------|
| `date.ts` | 450+ | 35+ | Date operations |
| `currency.ts` | 400+ | 20+ | Currency formatting |
| `validation.ts` | 500+ | 30+ | Input validation |
| `calculations.ts` | 450+ | 20+ | Business calculations |
| `index.ts` | 5 | - | Central export |

**Total**: ~1,800 lines, 105+ utility functions

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

## 🧪 Test Coverage (Future)

These utilities are designed to be easily testable:

```typescript
// Example test structure
describe('currency utils', () => {
  it('should format BDT correctly', () => {
    expect(formatBDT(1234.5)).toBe('৳1,234.50');
  });
  
  it('should parse currency string', () => {
    expect(parseCurrency('৳1,234.50')).toBe(1234.5);
  });
});
```

---

## 🔄 Next Steps

**Step 3.1**: Context Providers
- Create AuthContext with authentication logic
- Create OrgContext for organization management
- Create DataContext for work entries and summaries

**Step 3.2**: Custom Hooks
- useDailySummary() - Fetch and aggregate daily summaries
- useWorkEntries() - Manage work entries
- useOrgData() - Organization data and users

---

## 💡 Design Decisions

### Why date-fns?
- Tree-shakeable (only import what you use)
- Immutable (doesn't modify original dates)
- TypeScript support
- Modern, well-maintained

### Why BDT-Specific Formatting?
- Target market is Bangladesh
- Local currency symbol (৳)
- Local phone format
- Simplified UX

### Why Separate Validation Functions?
- Reusable across forms
- Consistent error messages
- Easy to test
- Easy to update validation rules

### Why Comprehensive Calculations?
- Complex business logic (commissions, aggregations)
- Reusable across different screens
- Single source of truth
- Easy to debug

---

**Step 2.3 Complete!** ✅  
**Phase 2 Complete!** 🎉  
**Overall Progress**: ~30% (7 of 23 steps)

Ready to proceed to Phase 3: Authentication System! 🚀
