/**
 * useDailySummary Hook
 * Custom hook for fetching and managing daily summary data
 */

import {useState, useEffect, useCallback} from 'react';
import {useOrg, useData} from '@/context';
import {formatDateISO} from '@/utils/date';
import {WorkEntry, PaymentMethod} from '@/types';

// ============================================================================
// TYPES
// ============================================================================

interface EmployeeStats {
  employeeId: string;
  employeeName: string;
  totalIncome: number;
  serviceCount: number;
}

interface DailySummaryData {
  date: string;
  totalIncome: number;
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
}

// ============================================================================
// HOOK
// ============================================================================

const useDailySummary = (selectedDate?: Date): UseDailySummaryResult => {
  const {currentOrg, orgUsers} = useOrg();
  const {workEntries} = useData();
  const [summary, setSummary] = useState<DailySummaryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate summary from work entries
  const calculateSummary = useCallback(
    async (date: Date = new Date()): Promise<DailySummaryData> => {
      const dateStr = formatDateISO(date);

      // Filter entries for the organization and date from real Firebase data
      const entries = workEntries.filter((entry: WorkEntry) => {
        const entryDate = formatDateISO(new Date(entry.createdAt));
        return entry.orgId === currentOrg?.id && entryDate === dateStr;
      });

      // Calculate totals
      let totalIncome = 0;
      let totalCash = 0;
      let totalBkash = 0;
      let totalNagad = 0;
      let totalCard = 0;
      let totalOther = 0;

      // Track employee stats
      const employeeStatsMap = new Map<string, EmployeeStats>();

      entries.forEach((entry: WorkEntry) => {
        const amount = entry.price + (entry.tip || 0);
        totalIncome += amount;

        // Sum by payment method
        switch (entry.paymentMethod) {
          case PaymentMethod.CASH:
            totalCash += amount;
            break;
          case PaymentMethod.BKASH:
            totalBkash += amount;
            break;
          case PaymentMethod.NAGAD:
            totalNagad += amount;
            break;
          case PaymentMethod.CARD:
            totalCard += amount;
            break;
          case PaymentMethod.OTHER:
            totalOther += amount;
            break;
        }

        // Update employee stats
        const existing = employeeStatsMap.get(entry.employeeId);
        if (existing) {
          existing.totalIncome += amount;
          existing.serviceCount += 1;
        } else {
          employeeStatsMap.set(entry.employeeId, {
            employeeId: entry.employeeId,
            employeeName: entry.employeeName,
            totalIncome: amount,
            serviceCount: 1,
          });
        }
      });

      // Get top 3 employees
      const topEmployees = Array.from(employeeStatsMap.values())
        .sort((a, b) => b.totalIncome - a.totalIncome)
        .slice(0, 3);

      return {
        date: dateStr,
        totalIncome,
        totalCash,
        totalBkash,
        totalNagad,
        totalCard,
        totalOther,
        entryCount: entries.length,
        topEmployees,
      };
    },
    [currentOrg, workEntries],
  );

  // Fetch summary data
  const fetchSummary = useCallback(async () => {
    if (!currentOrg) {
      setError('No organization selected');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await calculateSummary(selectedDate);
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch summary');
    } finally {
      setLoading(false);
    }
  }, [currentOrg, selectedDate, calculateSummary]);

  // Refresh function
  const refresh = useCallback(async () => {
    await fetchSummary();
  }, [fetchSummary]);

  // Initial fetch
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return {
    summary,
    loading,
    error,
    refresh,
  };
};

export default useDailySummary;
