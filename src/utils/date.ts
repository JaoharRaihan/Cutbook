/**
 * Date Utility Functions
 * Handles date formatting, parsing, and calculations
 */

import {
  format,
  parse,
  isValid,
  differenceInDays,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  subDays,
  subMonths,
  addDays,
  addMonths,
} from 'date-fns';

// ============================================================================
// FORMATTING
// ============================================================================

/**
 * Format date to display string
 * @param date - Date object, string, or timestamp
 * @param formatStr - Format pattern (default: 'DD MMM YYYY')
 * @returns Formatted date string
 */
export const formatDate = (
  date: Date | string | number,
  formatStr: string = 'dd MMM yyyy',
): string => {
  try {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;

    if (!isValid(dateObj)) {
      return 'Invalid Date';
    }

    return format(dateObj, formatStr);
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Format date to YYYY-MM-DD string (for API/storage)
 * @param date - Date object, string, or timestamp
 * @returns Date string in YYYY-MM-DD format
 */
export const formatDateISO = (date: Date | string | number): string => {
  return formatDate(date, 'yyyy-MM-dd');
};

/**
 * Format time to HH:MM AM/PM
 * @param date - Date object, string, or timestamp
 * @returns Time string (e.g., "02:30 PM")
 */
export const formatTime = (date: Date | string | number): string => {
  return formatDate(date, 'hh:mm a');
};

/**
 * Format date and time
 * @param date - Date object, string, or timestamp
 * @returns DateTime string (e.g., "15 Dec 2025, 02:30 PM")
 */
export const formatDateTime = (date: Date | string | number): string => {
  return formatDate(date, 'dd MMM yyyy, hh:mm a');
};

/**
 * Format date for display in lists (relative or absolute)
 * @param date - Date object, string, or timestamp
 * @returns User-friendly date string
 */
export const formatDisplayDate = (date: Date | string | number): string => {
  const dateObj = new Date(date);
  const today = new Date();
  const yesterday = subDays(today, 1);

  if (formatDateISO(dateObj) === formatDateISO(today)) {
    return 'Today';
  }

  if (formatDateISO(dateObj) === formatDateISO(yesterday)) {
    return 'Yesterday';
  }

  const diff = differenceInDays(today, dateObj);
  if (diff > 0 && diff <= 7) {
    return `${diff} days ago`;
  }

  return formatDate(dateObj, 'dd MMM yyyy');
};

// ============================================================================
// PARSING
// ============================================================================

/**
 * Parse date string to Date object
 * @param dateStr - Date string
 * @param formatStr - Expected format pattern
 * @returns Date object or null if invalid
 */
export const parseDate = (dateStr: string, formatStr: string = 'yyyy-MM-dd'): Date | null => {
  try {
    const parsed = parse(dateStr, formatStr, new Date());
    return isValid(parsed) ? parsed : null;
  } catch (error) {
    return null;
  }
};

/**
 * Check if date string is valid
 * @param dateStr - Date string
 * @returns True if valid date
 */
export const isValidDate = (dateStr: string): boolean => {
  const date = new Date(dateStr);
  return isValid(date);
};

// ============================================================================
// CURRENT DATE/TIME
// ============================================================================

/**
 * Get today's date at start of day
 * @returns Date object for today 00:00:00
 */
export const getToday = (): Date => {
  return startOfDay(new Date());
};

/**
 * Get today's date in YYYY-MM-DD format
 * @returns Today's date string
 */
export const getTodayString = (): string => {
  return formatDateISO(new Date());
};

/**
 * Get current timestamp
 * @returns Current timestamp in milliseconds
 */
export const getNow = (): number => {
  return Date.now();
};

/**
 * Get current date with time
 * @returns Current Date object
 */
export const getCurrentDateTime = (): Date => {
  return new Date();
};

// ============================================================================
// DATE RANGES
// ============================================================================

/**
 * Get date range for a period
 * @param period - Period type ('today', 'yesterday', 'last7Days', etc.)
 * @returns Object with start and end dates
 */
export const getDateRange = (
  period: 'today' | 'yesterday' | 'last7Days' | 'last30Days' | 'thisMonth' | 'lastMonth',
): {start: Date; end: Date} => {
  const today = getToday();

  switch (period) {
    case 'today':
      return {
        start: startOfDay(today),
        end: endOfDay(today),
      };

    case 'yesterday':
      const yesterday = subDays(today, 1);
      return {
        start: startOfDay(yesterday),
        end: endOfDay(yesterday),
      };

    case 'last7Days':
      return {
        start: startOfDay(subDays(today, 6)),
        end: endOfDay(today),
      };

    case 'last30Days':
      return {
        start: startOfDay(subDays(today, 29)),
        end: endOfDay(today),
      };

    case 'thisMonth':
      return {
        start: startOfMonth(today),
        end: endOfMonth(today),
      };

    case 'lastMonth':
      const lastMonth = subMonths(today, 1);
      return {
        start: startOfMonth(lastMonth),
        end: endOfMonth(lastMonth),
      };

    default:
      return {start: today, end: today};
  }
};

/**
 * Get week range (Sunday to Saturday)
 * @param date - Date within the week
 * @returns Object with start and end dates of the week
 */
export const getWeekRange = (date: Date = new Date()): {start: Date; end: Date} => {
  return {
    start: startOfWeek(date),
    end: endOfWeek(date),
  };
};

/**
 * Get month range
 * @param date - Date within the month
 * @returns Object with start and end dates of the month
 */
export const getMonthRange = (date: Date = new Date()): {start: Date; end: Date} => {
  return {
    start: startOfMonth(date),
    end: endOfMonth(date),
  };
};

/**
 * Get custom date range
 * @param startDate - Start date
 * @param endDate - End date
 * @returns Object with start and end dates at day boundaries
 */
export const getCustomRange = (
  startDate: Date | string,
  endDate: Date | string,
): {start: Date; end: Date} => {
  return {
    start: startOfDay(new Date(startDate)),
    end: endOfDay(new Date(endDate)),
  };
};

// ============================================================================
// DATE CALCULATIONS
// ============================================================================

/**
 * Calculate difference between dates in days
 * @param date1 - First date
 * @param date2 - Second date
 * @returns Number of days difference
 */
export const getDaysDifference = (
  date1: Date | string | number,
  date2: Date | string | number,
): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return differenceInDays(d1, d2);
};

/**
 * Add days to a date
 * @param date - Starting date
 * @param days - Number of days to add
 * @returns New date
 */
export const addDaysToDate = (date: Date | string, days: number): Date => {
  return addDays(new Date(date), days);
};

/**
 * Subtract days from a date
 * @param date - Starting date
 * @param days - Number of days to subtract
 * @returns New date
 */
export const subtractDaysFromDate = (date: Date | string, days: number): Date => {
  return subDays(new Date(date), days);
};

/**
 * Add months to a date
 * @param date - Starting date
 * @param months - Number of months to add
 * @returns New date
 */
export const addMonthsToDate = (date: Date | string, months: number): Date => {
  return addMonths(new Date(date), months);
};

/**
 * Subtract months from a date
 * @param date - Starting date
 * @param months - Number of months to subtract
 * @returns New date
 */
export const subtractMonthsFromDate = (date: Date | string, months: number): Date => {
  return subMonths(new Date(date), months);
};

// ============================================================================
// DATE COMPARISONS
// ============================================================================

/**
 * Check if date is today
 * @param date - Date to check
 * @returns True if date is today
 */
export const isToday = (date: Date | string | number): boolean => {
  return formatDateISO(date) === getTodayString();
};

/**
 * Check if date is in the past
 * @param date - Date to check
 * @returns True if date is before today
 */
export const isPast = (date: Date | string | number): boolean => {
  return new Date(date) < getToday();
};

/**
 * Check if date is in the future
 * @param date - Date to check
 * @returns True if date is after today
 */
export const isFuture = (date: Date | string | number): boolean => {
  return new Date(date) > endOfDay(new Date());
};

/**
 * Check if date is between two dates
 * @param date - Date to check
 * @param start - Start date
 * @param end - End date
 * @returns True if date is in range
 */
export const isDateInRange = (
  date: Date | string,
  start: Date | string,
  end: Date | string,
): boolean => {
  const d = new Date(date);
  const s = new Date(start);
  const e = new Date(end);
  return d >= s && d <= e;
};

// ============================================================================
// ARRAY GENERATION
// ============================================================================

/**
 * Generate array of dates between start and end
 * @param start - Start date
 * @param end - End date
 * @returns Array of dates
 */
export const getDateArray = (start: Date | string, end: Date | string): Date[] => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const dates: Date[] = [];

  let currentDate = startDate;
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }

  return dates;
};

/**
 * Generate array of date strings (YYYY-MM-DD) between start and end
 * @param start - Start date
 * @param end - End date
 * @returns Array of date strings
 */
export const getDateStringArray = (start: Date | string, end: Date | string): string[] => {
  return getDateArray(start, end).map(date => formatDateISO(date));
};

// ============================================================================
// MONTH/YEAR HELPERS
// ============================================================================

/**
 * Get month name
 * @param date - Date object or month number (0-11)
 * @returns Month name (e.g., "January")
 */
export const getMonthName = (date: Date | number): string => {
  if (typeof date === 'number') {
    date = new Date(2000, date, 1);
  }
  return format(date, 'MMMM');
};

/**
 * Get short month name
 * @param date - Date object or month number (0-11)
 * @returns Short month name (e.g., "Jan")
 */
export const getShortMonthName = (date: Date | number): string => {
  if (typeof date === 'number') {
    date = new Date(2000, date, 1);
  }
  return format(date, 'MMM');
};

/**
 * Get year
 * @param date - Date object
 * @returns Year (e.g., 2025)
 */
export const getYear = (date: Date | string): number => {
  return new Date(date).getFullYear();
};

/**
 * Get month number (0-11)
 * @param date - Date object
 * @returns Month number
 */
export const getMonth = (date: Date | string): number => {
  return new Date(date).getMonth();
};

/**
 * Get day of month (1-31)
 * @param date - Date object
 * @returns Day of month
 */
export const getDay = (date: Date | string): number => {
  return new Date(date).getDate();
};
