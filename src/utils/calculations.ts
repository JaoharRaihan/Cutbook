/**
 * Calculation Utility Functions
 * Business logic calculations for commissions, totals, and aggregations
 */

import type {
  WorkEntry,
  DailySummary,
  EmployeeBreakdown,
  Organization,
  CommissionMode,
} from '@/types';
import {PaymentMethod} from '@/types';
import {roundAmount, sumAmounts, calculatePercentage} from './currency';

// ============================================================================
// COMMISSION CALCULATIONS
// ============================================================================

/**
 * Calculate commission for a work entry
 * @param price - Service price
 * @param commissionMode - Commission mode (percentage, manual, fixed)
 * @param commissionValue - Commission value (% or fixed amount)
 * @returns Calculated commission
 */
export const calculateCommission = (
  price: number,
  commissionMode: CommissionMode,
  commissionValue?: number,
): number => {
  if (!commissionValue || commissionValue <= 0) {
    return 0;
  }

  switch (commissionMode) {
    case 'percentage':
      return roundAmount(calculatePercentage(price, commissionValue));

    case 'fixed':
      return roundAmount(commissionValue);

    case 'manual':
      return 0; // Manual mode requires explicit input

    default:
      return 0;
  }
};

/**
 * Calculate commission for employee based on organization settings
 * @param price - Service price
 * @param organization - Organization with commission settings
 * @param employeeCommissionPercentage - Employee-specific commission %
 * @returns Calculated commission
 */
export const calculateEmployeeCommission = (
  price: number,
  organization: Organization,
  employeeCommissionPercentage?: number,
): number => {
  const mode = organization.defaultCommissionMode;
  const value = employeeCommissionPercentage ?? organization.defaultCommissionValue;

  return calculateCommission(price, mode, value);
};

// ============================================================================
// WORK ENTRY CALCULATIONS
// ============================================================================

/**
 * Calculate total amount for a work entry (price + tip)
 * @param price - Service price
 * @param tip - Tip amount (optional)
 * @returns Total amount
 */
export const calculateWorkEntryTotal = (price: number, tip?: number): number => {
  return roundAmount(price + (tip || 0));
};

/**
 * Calculate total income from work entries
 * @param entries - Array of work entries
 * @returns Total income (sum of all prices, excluding tips)
 */
export const calculateTotalIncome = (entries: WorkEntry[]): number => {
  const prices = entries.map(entry => entry.price);
  return roundAmount(sumAmounts(prices));
};

/**
 * Calculate total tips from work entries
 * @param entries - Array of work entries
 * @returns Total tips
 */
export const calculateTotalTips = (entries: WorkEntry[]): number => {
  const tips = entries.map(entry => entry.tip || 0);
  return roundAmount(sumAmounts(tips));
};

/**
 * Calculate grand total from work entries (income + tips)
 * @param entries - Array of work entries
 * @returns Grand total
 */
export const calculateGrandTotal = (entries: WorkEntry[]): number => {
  const income = calculateTotalIncome(entries);
  const tips = calculateTotalTips(entries);
  return roundAmount(income + tips);
};

// ============================================================================
// PAYMENT METHOD BREAKDOWN
// ============================================================================

/**
 * Calculate total by payment method
 * @param entries - Array of work entries
 * @param paymentMethod - Payment method to filter by
 * @returns Total for payment method
 */
export const calculateTotalByPaymentMethod = (
  entries: WorkEntry[],
  paymentMethod: PaymentMethod,
): number => {
  const filtered = entries.filter(entry => entry.paymentMethod === paymentMethod);
  return calculateTotalIncome(filtered);
};

/**
 * Calculate payment method breakdown
 * @param entries - Array of work entries
 * @returns Object with totals for each payment method
 */
export const calculatePaymentBreakdown = (entries: WorkEntry[]): Record<PaymentMethod, number> => {
  return {
    [PaymentMethod.CASH]: calculateTotalByPaymentMethod(entries, PaymentMethod.CASH),
    [PaymentMethod.BKASH]: calculateTotalByPaymentMethod(entries, PaymentMethod.BKASH),
    [PaymentMethod.NAGAD]: calculateTotalByPaymentMethod(entries, PaymentMethod.NAGAD),
    [PaymentMethod.CARD]: calculateTotalByPaymentMethod(entries, PaymentMethod.CARD),
    [PaymentMethod.OTHER]: calculateTotalByPaymentMethod(entries, PaymentMethod.OTHER),
  };
};

// ============================================================================
// EMPLOYEE BREAKDOWN
// ============================================================================

/**
 * Calculate employee stats from work entries
 * @param entries - Array of work entries
 * @param employeeId - Employee ID
 * @param commissionPercentage - Employee's commission percentage
 * @returns Employee breakdown object
 */
export const calculateEmployeeStats = (
  entries: WorkEntry[],
  employeeId: string,
  commissionPercentage?: number,
): EmployeeBreakdown => {
  const employeeEntries = entries.filter(entry => entry.employeeId === employeeId);

  const totalCount = employeeEntries.length;
  const totalIncome = calculateTotalIncome(employeeEntries);
  const totalTips = calculateTotalTips(employeeEntries);

  let commission = 0;
  if (commissionPercentage) {
    commission = roundAmount(calculatePercentage(totalIncome, commissionPercentage));
  }

  return {
    employeeId,
    employeeName: employeeEntries[0]?.employeeName || '',
    totalCount,
    totalIncome,
    totalTips,
    commission,
  };
};

/**
 * Calculate breakdown for all employees
 * @param entries - Array of work entries
 * @param employeeCommissions - Map of employee IDs to commission percentages
 * @returns Array of employee breakdowns
 */
export const calculateAllEmployeeBreakdowns = (
  entries: WorkEntry[],
  employeeCommissions: Record<string, number>,
): EmployeeBreakdown[] => {
  // Get unique employee IDs
  const employeeIds = Array.from(new Set(entries.map(entry => entry.employeeId)));

  // Calculate stats for each employee
  return employeeIds.map(employeeId => {
    const commissionPercentage = employeeCommissions[employeeId];
    return calculateEmployeeStats(entries, employeeId, commissionPercentage);
  });
};

// ============================================================================
// DAILY SUMMARY GENERATION
// ============================================================================

/**
 * Generate daily summary from work entries
 * @param date - Date string (YYYY-MM-DD)
 * @param orgId - Organization ID
 * @param entries - Array of work entries for the day
 * @param employeeCommissions - Map of employee IDs to commission percentages
 * @returns Daily summary object
 */
export const generateDailySummary = (
  date: string,
  orgId: string,
  entries: WorkEntry[],
  employeeCommissions: Record<string, number>,
): Omit<DailySummary, 'id' | 'createdAt' | 'updatedAt'> => {
  const totalIncome = calculateTotalIncome(entries);
  const totalTips = calculateTotalTips(entries);
  const totalEntries = entries.length;

  const paymentBreakdown = calculatePaymentBreakdown(entries);
  const employeeBreakdown = calculateAllEmployeeBreakdowns(entries, employeeCommissions);

  // Calculate total commission from employee breakdown
  const totalCommission = employeeBreakdown.reduce((sum, emp) => sum + (emp.commission || 0), 0);

  return {
    date,
    orgId,
    totalIncome,
    totalTips,
    totalEntries,
    totalCash: paymentBreakdown[PaymentMethod.CASH],
    totalBkash: paymentBreakdown[PaymentMethod.BKASH],
    totalNagad: paymentBreakdown[PaymentMethod.NAGAD],
    totalCard: paymentBreakdown[PaymentMethod.CARD],
    totalOther: paymentBreakdown[PaymentMethod.OTHER],
    totalCommission,
    employeeBreakdown,
    generatedAt: Date.now(),
  };
};

// ============================================================================
// AGGREGATION FUNCTIONS
// ============================================================================

/**
 * Aggregate multiple daily summaries
 * @param summaries - Array of daily summaries
 * @returns Aggregated totals
 */
export const aggregateDailySummaries = (
  summaries: DailySummary[],
): {
  totalIncome: number;
  totalTips: number;
  totalEntries: number;
  totalCash: number;
  totalBkash: number;
  totalNagad: number;
  totalCard: number;
  totalOther: number;
  employeeBreakdown: Record<string, EmployeeBreakdown>;
} => {
  const totals = {
    totalIncome: 0,
    totalTips: 0,
    totalEntries: 0,
    totalCash: 0,
    totalBkash: 0,
    totalNagad: 0,
    totalCard: 0,
    totalOther: 0,
    employeeBreakdown: {} as Record<string, EmployeeBreakdown>,
  };

  summaries.forEach(summary => {
    totals.totalIncome += summary.totalIncome;
    totals.totalTips += summary.totalTips;
    totals.totalEntries += summary.totalEntries;
    totals.totalCash += summary.totalCash;
    totals.totalBkash += summary.totalBkash;
    totals.totalNagad += summary.totalNagad;
    totals.totalCard += summary.totalCard;
    totals.totalOther += summary.totalOther;

    // Aggregate employee breakdowns
    summary.employeeBreakdown.forEach(empBreakdown => {
      if (!totals.employeeBreakdown[empBreakdown.employeeId]) {
        totals.employeeBreakdown[empBreakdown.employeeId] = {
          employeeId: empBreakdown.employeeId,
          employeeName: empBreakdown.employeeName,
          totalCount: 0,
          totalIncome: 0,
          totalTips: 0,
          commission: 0,
        };
      }

      const existing = totals.employeeBreakdown[empBreakdown.employeeId];
      existing.totalCount += empBreakdown.totalCount;
      existing.totalIncome += empBreakdown.totalIncome;
      existing.totalTips += empBreakdown.totalTips;
      existing.commission = (existing.commission || 0) + (empBreakdown.commission || 0);
    });
  });

  // Round all totals
  totals.totalIncome = roundAmount(totals.totalIncome);
  totals.totalTips = roundAmount(totals.totalTips);
  totals.totalCash = roundAmount(totals.totalCash);
  totals.totalBkash = roundAmount(totals.totalBkash);
  totals.totalNagad = roundAmount(totals.totalNagad);
  totals.totalCard = roundAmount(totals.totalCard);
  totals.totalOther = roundAmount(totals.totalOther);

  // Round employee totals
  Object.values(totals.employeeBreakdown).forEach(empBreakdown => {
    empBreakdown.totalIncome = roundAmount(empBreakdown.totalIncome);
    empBreakdown.totalTips = roundAmount(empBreakdown.totalTips);
    empBreakdown.commission = roundAmount(empBreakdown.commission || 0);
  });

  return totals;
};

// ============================================================================
// STATISTICS
// ============================================================================

/**
 * Calculate average service price
 * @param entries - Array of work entries
 * @returns Average price
 */
export const calculateAveragePrice = (entries: WorkEntry[]): number => {
  if (entries.length === 0) return 0;
  const total = calculateTotalIncome(entries);
  return roundAmount(total / entries.length);
};

/**
 * Calculate average tip
 * @param entries - Array of work entries
 * @returns Average tip
 */
export const calculateAverageTip = (entries: WorkEntry[]): number => {
  if (entries.length === 0) return 0;
  const total = calculateTotalTips(entries);
  return roundAmount(total / entries.length);
};

/**
 * Find highest earning entry
 * @param entries - Array of work entries
 * @returns Entry with highest price
 */
export const findHighestEarningEntry = (entries: WorkEntry[]): WorkEntry | null => {
  if (entries.length === 0) return null;
  return entries.reduce((highest, entry) => (entry.price > highest.price ? entry : highest));
};

/**
 * Find most used payment method
 * @param entries - Array of work entries
 * @returns Most common payment method
 */
export const findMostUsedPaymentMethod = (entries: WorkEntry[]): PaymentMethod | null => {
  if (entries.length === 0) return null;

  const counts: Record<PaymentMethod, number> = {
    [PaymentMethod.CASH]: 0,
    [PaymentMethod.BKASH]: 0,
    [PaymentMethod.NAGAD]: 0,
    [PaymentMethod.CARD]: 0,
    [PaymentMethod.OTHER]: 0,
  };

  entries.forEach(entry => {
    counts[entry.paymentMethod]++;
  });

  let maxCount = 0;
  let mostUsed: PaymentMethod = PaymentMethod.CASH;

  Object.entries(counts).forEach(([method, count]) => {
    if (count > maxCount) {
      maxCount = count;
      mostUsed = method as PaymentMethod;
    }
  });

  return mostUsed;
};

// ============================================================================
// GROWTH CALCULATIONS
// ============================================================================

/**
 * Calculate percentage growth
 * @param current - Current value
 * @param previous - Previous value
 * @returns Growth percentage (positive or negative)
 */
export const calculateGrowthPercentage = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  const growth = ((current - previous) / previous) * 100;
  return roundAmount(growth, 1);
};

/**
 * Calculate growth between two periods
 * @param currentSummaries - Current period summaries
 * @param previousSummaries - Previous period summaries
 * @returns Growth statistics
 */
export const calculatePeriodGrowth = (
  currentSummaries: DailySummary[],
  previousSummaries: DailySummary[],
): {
  incomeGrowth: number;
  tipsGrowth: number;
  entriesGrowth: number;
} => {
  const current = aggregateDailySummaries(currentSummaries);
  const previous = aggregateDailySummaries(previousSummaries);

  return {
    incomeGrowth: calculateGrowthPercentage(current.totalIncome, previous.totalIncome),
    tipsGrowth: calculateGrowthPercentage(current.totalTips, previous.totalTips),
    entriesGrowth: calculateGrowthPercentage(current.totalEntries, previous.totalEntries),
  };
};
