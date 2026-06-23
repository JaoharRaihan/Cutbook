/**
 * bengaliNumerals.ts
 * Bengali numeral conversion and formatting utilities
 */

import {Language} from '@/constants/translations';

// ============================================================================
// BENGALI NUMERALS MAPPING
// ============================================================================

const BENGALI_NUMERALS: Record<string, string> = {
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

const ENGLISH_NUMERALS: Record<string, string> = {
  '০': '0',
  '১': '1',
  '২': '2',
  '৩': '3',
  '৪': '4',
  '৫': '5',
  '৬': '6',
  '৭': '7',
  '৮': '8',
  '৯': '9',
};

// ============================================================================
// CONVERSION FUNCTIONS
// ============================================================================

/**
 * Convert English numerals to Bengali numerals
 * Example: "123" -> "১২৩"
 */
export function toBengaliNumerals(text: string): string {
  return text.replace(/[0-9]/g, digit => BENGALI_NUMERALS[digit] || digit);
}

/**
 * Convert Bengali numerals to English numerals
 * Example: "১২৩" -> "123"
 */
export function toEnglishNumerals(text: string): string {
  return text.replace(/[০-৯]/g, digit => ENGLISH_NUMERALS[digit] || digit);
}

/**
 * Format number with Bengali numerals
 * Example: 1234 -> "১,২৩৪"
 */
export function formatBengaliNumber(num: number): string {
  const formatted = num.toLocaleString('en-US');
  return toBengaliNumerals(formatted);
}

// ============================================================================
// CURRENCY FORMATTING
// ============================================================================

/**
 * Format currency in BDT with language support
 * @param amount - Amount in BDT
 * @param language - 'en' or 'bn'
 * @param showSymbol - Whether to show ৳ symbol
 */
export function formatCurrency(
  amount: number,
  language: Language = 'en',
  showSymbol: boolean = true,
): string {
  // Format with thousand separators
  const formatted = amount.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

  // Convert to Bengali if needed
  const displayAmount = language === 'bn' ? toBengaliNumerals(formatted) : formatted;

  // Add currency symbol
  return showSymbol ? `৳${displayAmount}` : displayAmount;
}

/**
 * Format currency (short version)
 * Example: 1234567 -> "৳১২.৩L" or "৳12.3L"
 */
export function formatCurrencyShort(amount: number, language: Language = 'en'): string {
  let value: number;
  let suffix: string;

  if (amount >= 10000000) {
    // Crore (10M+)
    value = amount / 10000000;
    suffix = 'Cr';
  } else if (amount >= 100000) {
    // Lakh (100K+)
    value = amount / 100000;
    suffix = 'L';
  } else if (amount >= 1000) {
    // Thousand
    value = amount / 1000;
    suffix = 'K';
  } else {
    return formatCurrency(amount, language);
  }

  const formatted = value.toFixed(1);
  const displayValue = language === 'bn' ? toBengaliNumerals(formatted) : formatted;

  return `৳${displayValue}${suffix}`;
}

// ============================================================================
// DATE FORMATTING
// ============================================================================

/**
 * Format date with Bengali numerals
 * Example: "12/01/2024" -> "১২/০১/২০২৪"
 */
export function formatBengaliDate(date: Date, language: Language = 'en'): string {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear().toString();

  const formatted = `${day}/${month}/${year}`;
  return language === 'bn' ? toBengaliNumerals(formatted) : formatted;
}

/**
 * Bengali month names
 */
const BENGALI_MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

const ENGLISH_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/**
 * Format date with month name
 * Example: "12 January 2024" or "১২ জানুয়ারি ২০২৪"
 */
export function formatDateWithMonth(date: Date, language: Language = 'en'): string {
  const day = date.getDate();
  const month = date.getMonth();
  const year = date.getFullYear();

  if (language === 'bn') {
    return `${toBengaliNumerals(day.toString())} ${BENGALI_MONTHS[month]} ${toBengaliNumerals(year.toString())}`;
  } else {
    return `${day} ${ENGLISH_MONTHS[month]} ${year}`;
  }
}

// ============================================================================
// TIME FORMATTING
// ============================================================================

/**
 * Format time with Bengali numerals
 * Example: "12:30 PM" -> "১২:৩০ PM"
 */
export function formatTime(date: Date, language: Language = 'en'): string {
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;

  const formatted = `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;

  return language === 'bn' ? toBengaliNumerals(formatted) : formatted;
}

// ============================================================================
// PERCENTAGE FORMATTING
// ============================================================================

/**
 * Format percentage with language support
 * Example: 15 -> "15%" or "১৫%"
 */
export function formatPercentage(value: number, language: Language = 'en'): string {
  const formatted = value.toFixed(0);
  const displayValue = language === 'bn' ? toBengaliNumerals(formatted) : formatted;
  return `${displayValue}%`;
}

// ============================================================================
// ORDINAL NUMBERS
// ============================================================================

/**
 * Get ordinal suffix (1st, 2nd, 3rd, etc.)
 */
export function getOrdinalSuffix(num: number, language: Language = 'en'): string {
  if (language === 'bn') {
    // Bengali uses "তম" or "ম" suffix
    return toBengaliNumerals(num.toString()) + 'তম';
  }

  const j = num % 10;
  const k = num % 100;

  if (j === 1 && k !== 11) {
    return num + 'st';
  }
  if (j === 2 && k !== 12) {
    return num + 'nd';
  }
  if (j === 3 && k !== 13) {
    return num + 'rd';
  }
  return num + 'th';
}

// ============================================================================
// PHONE NUMBER FORMATTING
// ============================================================================

/**
 * Format phone number with Bengali numerals
 * Example: "+8801712345678" -> "+৮৮০১৭১২৩৪৫৬৭৮"
 */
export function formatPhoneNumber(phone: string, language: Language = 'en'): string {
  return language === 'bn' ? toBengaliNumerals(phone) : phone;
}

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Check if string contains Bengali numerals
 */
export function hasBengaliNumerals(text: string): boolean {
  return /[০-৯]/.test(text);
}

/**
 * Check if string contains only Bengali numerals
 */
export function isAllBengaliNumerals(text: string): boolean {
  return /^[০-৯]+$/.test(text);
}

/**
 * Parse number from Bengali or English numerals
 */
export function parseLocalizedNumber(text: string): number {
  const englishText = toEnglishNumerals(text);
  return parseFloat(englishText.replace(/,/g, ''));
}
