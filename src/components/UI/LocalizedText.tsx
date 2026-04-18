/**
 * LocalizedText.tsx
 * Text component with automatic Bengali numeral conversion
 */

import React from 'react';
import {Text, TextProps, TextStyle} from 'react-native';
import {useLanguage} from '@/context/LanguageContext';
import {toBengaliNumerals} from '@/utils/bengaliNumerals';

// ============================================================================
// TYPES
// ============================================================================

export interface LocalizedTextProps extends TextProps {
  children: string | number;
  convertNumerals?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function LocalizedText({
  children,
  convertNumerals = true,
  ...textProps
}: LocalizedTextProps): React.ReactElement {
  const {language} = useLanguage();

  let displayText = String(children);

  // Convert numerals to Bengali if language is Bengali
  if (convertNumerals && language === 'bn') {
    displayText = toBengaliNumerals(displayText);
  }

  return <Text {...textProps}>{displayText}</Text>;
}

// ============================================================================
// CURRENCY TEXT COMPONENT
// ============================================================================

export interface CurrencyTextProps extends TextProps {
  amount: number;
  showSymbol?: boolean;
  short?: boolean;
}

export function CurrencyText({
  amount,
  showSymbol = true,
  short = false,
  style,
  ...textProps
}: CurrencyTextProps): React.ReactElement {
  const {language} = useLanguage();

  let displayText: string;

  if (short) {
    // Short format: ৳12.3L
    let value: number;
    let suffix: string;

    if (amount >= 10000000) {
      value = amount / 10000000;
      suffix = 'Cr';
    } else if (amount >= 100000) {
      value = amount / 100000;
      suffix = 'L';
    } else if (amount >= 1000) {
      value = amount / 1000;
      suffix = 'K';
    } else {
      const formatted = amount.toLocaleString('en-US');
      displayText = language === 'bn' ? toBengaliNumerals(formatted) : formatted;
      return (
        <Text {...textProps} style={style}>
          {showSymbol && '৳'}
          {displayText}
        </Text>
      );
    }

    const formatted = value.toFixed(1);
    displayText = language === 'bn' ? toBengaliNumerals(formatted) : formatted;
    displayText = `${displayText}${suffix}`;
  } else {
    // Full format: ৳1,234.00
    const formatted = amount.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    displayText = language === 'bn' ? toBengaliNumerals(formatted) : formatted;
  }

  return (
    <Text {...textProps} style={style}>
      {showSymbol && '৳'}
      {displayText}
    </Text>
  );
}

// ============================================================================
// PERCENTAGE TEXT COMPONENT
// ============================================================================

export interface PercentageTextProps extends TextProps {
  value: number;
  decimals?: number;
}

export function PercentageText({
  value,
  decimals = 0,
  style,
  ...textProps
}: PercentageTextProps): React.ReactElement {
  const {language} = useLanguage();

  const formatted = value.toFixed(decimals);
  const displayText = language === 'bn' ? toBengaliNumerals(formatted) : formatted;

  return (
    <Text {...textProps} style={style}>
      {displayText}%
    </Text>
  );
}

// ============================================================================
// DATE TEXT COMPONENT
// ============================================================================

export interface DateTextProps extends TextProps {
  date: Date;
  format?: 'short' | 'long' | 'time';
}

export function DateText({
  date,
  format = 'short',
  style,
  ...textProps
}: DateTextProps): React.ReactElement {
  const {language} = useLanguage();

  let displayText: string;

  if (format === 'time') {
    // Time format: 12:30 PM
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;

    displayText = `${displayHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    displayText = language === 'bn' ? toBengaliNumerals(displayText) : displayText;
  } else if (format === 'long') {
    // Long format: 12 January 2024
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

    const day = date.getDate();
    const month = date.getMonth();
    const year = date.getFullYear();

    if (language === 'bn') {
      displayText = `${toBengaliNumerals(day.toString())} ${BENGALI_MONTHS[month]} ${toBengaliNumerals(year.toString())}`;
    } else {
      displayText = `${day} ${ENGLISH_MONTHS[month]} ${year}`;
    }
  } else {
    // Short format: 12/01/2024
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();

    displayText = `${day}/${month}/${year}`;
    displayText = language === 'bn' ? toBengaliNumerals(displayText) : displayText;
  }

  return (
    <Text {...textProps} style={style}>
      {displayText}
    </Text>
  );
}
