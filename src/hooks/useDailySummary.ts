/**
 * useDailySummary Hook
 * Custom hook for fetching and managing daily summary data
 * Supports time period filtering: today, weekly, monthly, yearly
 *
 * REACTIVE: Summary is derived synchronously from the live `workEntries` state
 * via useMemo, so it always reflects the latest data without any loading delay
 * or stale-cache risk.
 */

import {useState, useMemo, useCallback} from 'react';
import {useOrg, useData} from '@/context';
import {formatDateISO} from '@/utils/date';
import {WorkEntry, PaymentMethod, TimePeriod} from '@/types';
import {calculateEmployeeCommission} from '@/utils/calculations';

// ============================================================================
// TYPES
// ============================================================================

interface EmployeeStats {
  employeeId: string;
  employeeName: string;
  totalIncome: number;
  totalTips: number;
  serviceCount: number;
  commission: number;
}

interface DailySummaryData {
  date: string;
  totalIncome: number;
  totalTips: number;
  totalCommission: number;
  totalCash: number;
  totalBkash: number;
  totalNagad: number;
  totalCard: number;
  totalOther: number;
  entryCount: number;
  topEmployees: EmployeeStats[];
}

interface UseDailySummaryResult {
  summary: DailySummaryData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  timePeriod: TimePeriod;
  setTimePeriod: (period: TimePeriod) => void;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get date range for a given time period
 */
export const getDateRange = (
  period: TimePeriod,
  baseDate: Date = new Date(),
): {start: Date; end: Date} => {
  const start = new Date(baseDate);
  const end = new Date(baseDate);

  switch (period) {
    case TimePeriod.TODAY:
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      break;

    case TimePeriod.WEEKLY: {
      // Week starts on Sunday, ends on Saturday
      const day = start.getDay();
      const diff = start.getDate() - day;
      start.setDate(diff);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      break;
    }

    case TimePeriod.MONTHLY:
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
      break;

    case TimePeriod.YEARLY:
      start.setMonth(0);
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(11);
      end.setDate(31);
      end.setHours(23, 59, 59, 999);
      break;
  }

  return {start, end};
};

/**
 * Get display label for time period
 */
const getPeriodLabel = (period: TimePeriod, baseDate: Date = new Date()): string => {
  switch (period) {
    case TimePeriod.TODAY:
      return 'Today';
    case TimePeriod.WEEKLY: {
      const {start, end} = getDateRange(TimePeriod.WEEKLY, baseDate);
      return `${formatDateISO(start)} - ${formatDateISO(end)}`;
    }
    case TimePeriod.MONTHLY:
      return baseDate.toLocaleDateString('en-US', {year: 'numeric', month: 'long'});
    case TimePeriod.YEARLY:
      return baseDate.getFullYear().toString();
  }
};

// ============================================================================
// HOOK
// ============================================================================

const useDailySummary = (
  selectedDate?: Date,
  initialPeriod: TimePeriod = TimePeriod.TODAY,
): UseDailySummaryResult => {
  const {currentOrg, orgUsers} = useOrg();
  const {workEntries} = useData();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(initialPeriod);

  // ---------------------------------------------------------------------------
  // Derive summary synchronously from live workEntries (always fresh, no async)
  // Every time workEntries, timePeriod, selectedDate, currentOrg, or orgUsers
  // change, this recalculates instantly — no stale cache, no loading spinner.
  // ---------------------------------------------------------------------------
  const summary = useMemo<DailySummaryData | null>(() => {
    if (!currentOrg) return null;

    const baseDate = selectedDate || new Date();
    const {start, end} = getDateRange(timePeriod, baseDate);

    // Filter entries for this org and the selected period
    const entries = workEntries.filter((entry: WorkEntry) => {
      const entryDate = new Date(entry.createdAt);
      return entry.orgId === currentOrg.id && entryDate >= start && entryDate <= end;
    });

    let totalIncome = 0;
    let totalTips = 0;
    let totalCommission = 0;
    let totalCash = 0;
    let totalBkash = 0;
    let totalNagad = 0;
    let totalCard = 0;
    let totalOther = 0;

    const employeeStatsMap = new Map<string, EmployeeStats>();

    entries.forEach((entry: WorkEntry) => {
      const amount = entry.price;
      const tip = entry.tip || 0;
      totalIncome += amount;
      totalTips += tip;

      // Commission
      const employee = orgUsers.find(u => u.id === entry.employeeId);
      let entryCommission = 0;
      if (employee && currentOrg) {
        entryCommission = calculateEmployeeCommission(
          amount,
          currentOrg,
          employee.commissionPercentage,
        );
        totalCommission += entryCommission;
      }

      // Payment method totals (price + tip together)
      const totalAmount = amount + tip;
      switch (entry.paymentMethod) {
        case PaymentMethod.CASH:
          totalCash += totalAmount;
          break;
        case PaymentMethod.BKASH:
          totalBkash += totalAmount;
          break;
        case PaymentMethod.NAGAD:
          totalNagad += totalAmount;
          break;
        case PaymentMethod.CARD:
          totalCard += totalAmount;
          break;
        case PaymentMethod.OTHER:
          totalOther += totalAmount;
          break;
      }

      // Employee stats
      const existing = employeeStatsMap.get(entry.employeeId);
      if (existing) {
        existing.totalIncome += amount;
        existing.totalTips += tip;
        existing.serviceCount += 1;
        existing.commission += entryCommission;
      } else {
        employeeStatsMap.set(entry.employeeId, {
          employeeId: entry.employeeId,
          employeeName: entry.employeeName,
          totalIncome: amount,
          totalTips: tip,
          serviceCount: 1,
          commission: entryCommission,
        });
      }
    });

    const topEmployees = Array.from(employeeStatsMap.values()).sort(
      (a, b) => b.totalIncome - a.totalIncome,
    );

    return {
      date: getPeriodLabel(timePeriod, baseDate),
      totalIncome,
      totalTips,
      totalCommission,
      totalCash,
      totalBkash,
      totalNagad,
      totalCard,
      totalOther,
      entryCount: entries.length,
      topEmployees,
    };
  }, [currentOrg, workEntries, orgUsers, selectedDate, timePeriod]);

  // ---------------------------------------------------------------------------
  // refresh() kept for API compatibility with pull-to-refresh in screens.
  // The memo recalculates automatically, so this is a deliberate no-op.
  // ---------------------------------------------------------------------------
  const refresh = useCallback(async () => {
    // workEntries are kept live by the Firestore onSnapshot listener in
    // DataContext. The useMemo above re-runs on every workEntries change,
    // so there is nothing to do here.
  }, []);

  return {
    summary,
    loading: false, // always synchronous — no async loading state
    error: null,
    refresh,
    timePeriod,
    setTimePeriod,
  };
};

export default useDailySummary;
