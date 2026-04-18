/**
 * testing.ts
 * Testing utilities and helpers
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================================================
// MOCK DATA VALIDATORS
// ============================================================================

/**
 * Validate that required mock data exists in AsyncStorage
 */
export async function validateMockDataIntegrity(): Promise<{
  valid: boolean;
  missing: string[];
  errors: string[];
}> {
  const missing: string[] = [];
  const errors: string[] = [];

  try {
    // Check auth token
    const authToken = await AsyncStorage.getItem('auth_token');
    if (!authToken) missing.push('auth_token');

    // Check current user
    const currentUser = await AsyncStorage.getItem('current_user');
    if (!currentUser) {
      missing.push('current_user');
    } else {
      try {
        const user = JSON.parse(currentUser);
        if (!user.id || !user.name || !user.role) {
          errors.push('current_user: Missing required fields');
        }
      } catch {
        errors.push('current_user: Invalid JSON');
      }
    }

    // Check current org
    const currentOrg = await AsyncStorage.getItem('current_org');
    if (!currentOrg) {
      missing.push('current_org');
    } else {
      try {
        const org = JSON.parse(currentOrg);
        if (!org.id || !org.name) {
          errors.push('current_org: Missing required fields');
        }
      } catch {
        errors.push('current_org: Invalid JSON');
      }
    }

    // Check language preference
    const language = await AsyncStorage.getItem('language');
    if (!language) {
      missing.push('language');
    } else if (language !== 'en' && language !== 'bn') {
      errors.push(`language: Invalid value "${language}"`);
    }

    return {
      valid: missing.length === 0 && errors.length === 0,
      missing,
      errors,
    };
  } catch (error) {
    errors.push(`AsyncStorage error: ${error}`);
    return {valid: false, missing, errors};
  }
}

/**
 * Clear all mock data (for testing)
 */
export async function clearAllMockData(): Promise<void> {
  await AsyncStorage.clear();
}

/**
 * Seed test data
 */
export async function seedTestData(): Promise<void> {
  // Add minimal test data for quick testing
  await AsyncStorage.setItem('auth_token', 'test_token_123');
  await AsyncStorage.setItem(
    'current_user',
    JSON.stringify({
      id: 'user-1',
      name: 'Test User',
      phone: '+8801712345678',
      role: 'owner',
      orgId: 'org-1',
    }),
  );
  await AsyncStorage.setItem(
    'current_org',
    JSON.stringify({
      id: 'org-1',
      name: 'Test Salon',
      ownerId: 'user-1',
      currency: 'BDT',
      timezone: 'Asia/Dhaka',
    }),
  );
  await AsyncStorage.setItem('language', 'en');
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate phone number format
 */
export function validatePhoneFormat(phone: string): boolean {
  // Bangladesh phone: +880 followed by 10 digits
  const regex = /^\+880\d{10}$/;
  return regex.test(phone);
}

/**
 * Validate email format
 */
export function validateEmailFormat(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Validate price (positive number)
 */
export function validatePrice(price: number): boolean {
  return typeof price === 'number' && price >= 0 && !isNaN(price);
}

/**
 * Validate commission percentage (0-100)
 */
export function validateCommission(percentage: number): boolean {
  return (
    typeof percentage === 'number' && percentage >= 0 && percentage <= 100 && !isNaN(percentage)
  );
}

/**
 * Validate date is valid
 */
export function validateDate(date: Date): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

// ============================================================================
// PERFORMANCE TESTING
// ============================================================================

/**
 * Measure function execution time
 */
export async function measurePerformance<T>(fn: () => T | Promise<T>, label: string): Promise<T> {
  const start = Date.now();
  const result = await fn();
  const end = Date.now();
  console.log(`⏱️ [Performance] ${label}: ${end - start}ms`);
  return result;
}

/**
 * Test FlatList performance with large dataset
 */
export function generateLargeDataset(size: number): Array<{id: string; name: string}> {
  return Array.from({length: size}, (_, i) => ({
    id: `item-${i}`,
    name: `Item ${i + 1}`,
  }));
}

// ============================================================================
// UI TESTING HELPERS
// ============================================================================

/**
 * Simulate delay (for testing loading states)
 */
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if text fits in container (basic check)
 */
export function willTextOverflow(text: string, maxLength: number): boolean {
  return text.length > maxLength;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

// ============================================================================
// CALCULATION TESTING
// ============================================================================

/**
 * Test commission calculation accuracy
 */
export function testCommissionCalculation(
  price: number,
  percentage: number,
): {
  commission: number;
  ownerShare: number;
  employeeShare: number;
  valid: boolean;
} {
  const commission = (price * percentage) / 100;
  const employeeShare = commission;
  const ownerShare = price - commission;

  const valid =
    Math.abs(price - (employeeShare + ownerShare)) < 0.01 && // Account for floating point
    commission >= 0 &&
    ownerShare >= 0 &&
    employeeShare >= 0;

  return {
    commission: Number(commission.toFixed(2)),
    ownerShare: Number(ownerShare.toFixed(2)),
    employeeShare: Number(employeeShare.toFixed(2)),
    valid,
  };
}

/**
 * Test currency formatting
 */
export function testCurrencyFormatting(amount: number): {
  formatted: string;
  short: string;
  bengali: string;
  valid: boolean;
} {
  const formatted = `৳${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  // Short format (K/L/Cr)
  let short: string;
  if (amount >= 10000000) {
    short = `৳${(amount / 10000000).toFixed(1)}Cr`;
  } else if (amount >= 100000) {
    short = `৳${(amount / 100000).toFixed(1)}L`;
  } else if (amount >= 1000) {
    short = `৳${(amount / 1000).toFixed(1)}K`;
  } else {
    short = formatted;
  }

  // Bengali numerals (simplified)
  const bengaliMap: {[key: string]: string} = {
    '0': '০',
    '1': '১',
    '2': '২',
    '3': '৩',
    '4': '৪',
    '5': '৫',
    '6': '৬',
    '7': '৭',
    '8': '৮',
    '9': '৯',
  };
  const bengali = formatted.replace(/\d/g, d => bengaliMap[d] || d);

  const valid = !isNaN(amount) && amount >= 0;

  return {formatted, short, bengali, valid};
}

// ============================================================================
// EDGE CASE GENERATORS
// ============================================================================

/**
 * Generate edge case test data
 */
export const EdgeCaseData = {
  // Very long names
  longNames: [
    'A'.repeat(50),
    'Muhammad Abdul Karim Bin Abdullah Al-Hassan',
    'অতিশয় দীর্ঘ বাংলা নাম যা স্ক্রীনে ফিট হবে না',
  ],

  // Special characters
  specialCharacters: ["O'Brien", 'Jean-Paul', 'Müller', 'José', 'নাম & নাম', 'Test<Script>'],

  // Edge numbers
  edgeNumbers: [
    0, // Zero
    0.01, // Very small
    999999.99, // Large
    10000000, // 1 Crore
    100000, // 1 Lakh
    -100, // Negative (should be rejected)
    NaN, // Invalid
    Infinity, // Invalid
  ],

  // Edge dates
  edgeDates: [
    new Date('2024-01-01'), // Year start
    new Date('2024-12-31'), // Year end
    new Date('2024-02-29'), // Leap year
    new Date('2024-02-28'), // Non-leap
    new Date('1970-01-01'), // Unix epoch
    new Date('2099-12-31'), // Far future
  ],

  // Phone numbers
  phoneNumbers: [
    '+8801712345678', // Valid
    '01712345678', // Missing country code
    '+880171234567', // Too short
    '+88017123456789', // Too long
    '+8809876543210', // Different operator
    'invalid', // Invalid
  ],

  // Emails
  emails: [
    'test@example.com', // Valid
    'user.name@example.co.uk', // Valid with dots
    'user+tag@example.com', // Valid with plus
    'invalid', // Invalid
    '@example.com', // Missing local
    'user@', // Missing domain
    '', // Empty
  ],
};

// ============================================================================
// TEST REPORTERS
// ============================================================================

/**
 * Log test results
 */
export function logTestResults(
  testName: string,
  results: {
    passed: number;
    failed: number;
    total: number;
  },
): void {
  const {passed, failed, total} = results;
  const passRate = ((passed / total) * 100).toFixed(1);

  console.log('\n' + '='.repeat(50));
  console.log(`📊 Test Results: ${testName}`);
  console.log('='.repeat(50));
  console.log(`✅ Passed: ${passed}/${total} (${passRate}%)`);
  console.log(`❌ Failed: ${failed}/${total}`);
  console.log('='.repeat(50) + '\n');
}

/**
 * Assert with logging
 */
export function assert(condition: boolean, message: string): boolean {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
  } else {
    console.error(`❌ FAIL: ${message}`);
  }
  return condition;
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
  validateMockDataIntegrity,
  clearAllMockData,
  seedTestData,
  validatePhoneFormat,
  validateEmailFormat,
  validatePrice,
  validateCommission,
  validateDate,
  measurePerformance,
  generateLargeDataset,
  delay,
  willTextOverflow,
  truncateText,
  testCommissionCalculation,
  testCurrencyFormatting,
  EdgeCaseData,
  logTestResults,
  assert,
};
