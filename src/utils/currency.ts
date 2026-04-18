/**
 * Currency Utility Functions
 * Handles BDT (Bangladeshi Taka) formatting and parsing
 */

import {APP_CONFIG} from '@/constants';

// ============================================================================
// FORMATTING
// ============================================================================

/**
 * Format number to BDT currency string
 * @param amount - Amount to format
 * @param showSymbol - Whether to show currency symbol (default: true)
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted currency string (e.g., "৳1,234.50")
 */
export const formatBDT = (
  amount: number,
  showSymbol: boolean = true,
  decimals: number = 2,
): string => {
  // Handle invalid input
  if (typeof amount !== 'number' || isNaN(amount)) {
    return showSymbol ? `${APP_CONFIG.currencySymbol}0.00` : '0.00';
  }

  // Format with commas and decimals
  const formatted = amount.toLocaleString('en-BD', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return showSymbol ? `${APP_CONFIG.currencySymbol}${formatted}` : formatted;
};

/**
 * Format currency without decimals
 * @param amount - Amount to format
 * @param showSymbol - Whether to show currency symbol (default: true)
 * @returns Formatted currency string (e.g., "৳1,234")
 */
export const formatBDTNoDecimal = (amount: number, showSymbol: boolean = true): string => {
  return formatBDT(amount, showSymbol, 0);
};

/**
 * Format currency with compact notation (K, M, B)
 * @param amount - Amount to format
 * @param showSymbol - Whether to show currency symbol (default: true)
 * @returns Compact formatted string (e.g., "৳1.2K", "৳5.5M")
 */
export const formatBDTCompact = (amount: number, showSymbol: boolean = true): string => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return showSymbol ? `${APP_CONFIG.currencySymbol}0` : '0';
  }

  let value = amount;
  let suffix = '';

  if (amount >= 1_000_000_000) {
    value = amount / 1_000_000_000;
    suffix = 'B';
  } else if (amount >= 1_000_000) {
    value = amount / 1_000_000;
    suffix = 'M';
  } else if (amount >= 1_000) {
    value = amount / 1_000;
    suffix = 'K';
  }

  // Format with 1 decimal place for compact notation
  const formatted = value.toFixed(suffix ? 1 : 0);
  const result = `${formatted}${suffix}`;

  return showSymbol ? `${APP_CONFIG.currencySymbol}${result}` : result;
};

// ============================================================================
// PARSING
// ============================================================================

/**
 * Parse currency string to number
 * @param value - Currency string (e.g., "৳1,234.50", "1234.50", "1,234")
 * @returns Parsed number or 0 if invalid
 */
export const parseCurrency = (value: string): number => {
  if (!value || typeof value !== 'string') {
    return 0;
  }

  // Remove currency symbol, commas, and spaces
  const cleaned = value
    .replace(APP_CONFIG.currencySymbol, '')
    .replace(/,/g, '')
    .replace(/\s/g, '')
    .trim();

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Parse user input to valid number
 * @param input - User input string
 * @returns Parsed number or null if invalid
 */
export const parseInputAmount = (input: string): number | null => {
  if (!input || typeof input !== 'string') {
    return null;
  }

  const cleaned = input
    .replace(/[^\d.-]/g, '') // Keep only digits, dots, and minus
    .trim();

  if (cleaned === '' || cleaned === '-' || cleaned === '.') {
    return null;
  }

  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
};

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Check if amount is valid
 * @param amount - Amount to validate
 * @param allowZero - Whether to allow zero (default: true)
 * @param allowNegative - Whether to allow negative (default: false)
 * @returns True if valid amount
 */
export const isValidAmount = (
  amount: number,
  allowZero: boolean = true,
  allowNegative: boolean = false,
): boolean => {
  if (typeof amount !== 'number' || isNaN(amount) || !isFinite(amount)) {
    return false;
  }

  if (!allowZero && amount === 0) {
    return false;
  }

  if (!allowNegative && amount < 0) {
    return false;
  }

  return true;
};

/**
 * Validate price input
 * @param price - Price to validate
 * @param min - Minimum price (default: 0)
 * @param max - Maximum price (default: 1000000)
 * @returns True if valid price
 */
export const isValidPrice = (price: number, min: number = 0, max: number = 1_000_000): boolean => {
  return isValidAmount(price, false, false) && price >= min && price <= max;
};

// ============================================================================
// CALCULATIONS
// ============================================================================

/**
 * Calculate percentage of amount
 * @param amount - Base amount
 * @param percentage - Percentage (0-100)
 * @returns Calculated value
 */
export const calculatePercentage = (amount: number, percentage: number): number => {
  if (!isValidAmount(amount) || !isValidAmount(percentage)) {
    return 0;
  }
  return (amount * percentage) / 100;
};

/**
 * Calculate percentage with rounding
 * @param amount - Base amount
 * @param percentage - Percentage (0-100)
 * @param decimals - Decimal places (default: 2)
 * @returns Rounded calculated value
 */
export const calculatePercentageRounded = (
  amount: number,
  percentage: number,
  decimals: number = 2,
): number => {
  const value = calculatePercentage(amount, percentage);
  return roundAmount(value, decimals);
};

/**
 * Round amount to specified decimal places
 * @param amount - Amount to round
 * @param decimals - Decimal places (default: 2)
 * @returns Rounded amount
 */
export const roundAmount = (amount: number, decimals: number = 2): number => {
  if (!isValidAmount(amount)) {
    return 0;
  }
  const multiplier = Math.pow(10, decimals);
  return Math.round(amount * multiplier) / multiplier;
};

/**
 * Sum array of amounts
 * @param amounts - Array of amounts
 * @returns Total sum
 */
export const sumAmounts = (amounts: number[]): number => {
  if (!Array.isArray(amounts)) {
    return 0;
  }
  return amounts.reduce((sum, amount) => {
    return sum + (isValidAmount(amount) ? amount : 0);
  }, 0);
};

/**
 * Calculate average of amounts
 * @param amounts - Array of amounts
 * @returns Average value
 */
export const averageAmounts = (amounts: number[]): number => {
  if (!Array.isArray(amounts) || amounts.length === 0) {
    return 0;
  }
  const sum = sumAmounts(amounts);
  return sum / amounts.length;
};

// ============================================================================
// COMPARISON
// ============================================================================

/**
 * Compare two amounts (accounting for floating point precision)
 * @param amount1 - First amount
 * @param amount2 - Second amount
 * @param decimals - Precision (default: 2)
 * @returns True if amounts are equal
 */
export const areAmountsEqual = (
  amount1: number,
  amount2: number,
  decimals: number = 2,
): boolean => {
  const rounded1 = roundAmount(amount1, decimals);
  const rounded2 = roundAmount(amount2, decimals);
  return rounded1 === rounded2;
};

// ============================================================================
// FORMATTING HELPERS
// ============================================================================

/**
 * Format input value for display in input field
 * @param value - Current input value
 * @returns Formatted value
 */
export const formatInputValue = (value: string): string => {
  // Remove non-numeric characters except dot
  let cleaned = value.replace(/[^\d.]/g, '');

  // Ensure only one dot
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }

  // Limit decimal places to 2
  if (parts.length === 2 && parts[1].length > 2) {
    cleaned = parts[0] + '.' + parts[1].substring(0, 2);
  }

  return cleaned;
};

/**
 * Get display value for input field
 * @param value - Numeric value
 * @returns String value for input
 */
export const getInputDisplayValue = (value: number | string | null | undefined): string => {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  if (typeof value === 'number') {
    return value.toString();
  }

  return value;
};

// ============================================================================
// CURRENCY SYMBOLS & INFO
// ============================================================================

/**
 * Get currency symbol
 * @returns Currency symbol (৳)
 */
export const getCurrencySymbol = (): string => {
  return APP_CONFIG.currencySymbol;
};

/**
 * Get currency code
 * @returns Currency code (BDT)
 */
export const getCurrencyCode = (): string => {
  return APP_CONFIG.currency;
};

/**
 * Get currency info
 * @returns Object with currency details
 */
export const getCurrencyInfo = (): {
  code: string;
  symbol: string;
  name: string;
  decimals: number;
} => {
  return {
    code: APP_CONFIG.currency,
    symbol: APP_CONFIG.currencySymbol,
    name: 'Bangladeshi Taka',
    decimals: 2,
  };
};
