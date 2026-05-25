/**
 * DataContext - Work Entries & Daily Summaries Management
 * Handles work entry CRUD operations and daily summary generation using Firestore
 */

import React, {createContext, useContext, useState, useEffect, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import type {WorkEntry, DailySummary, Service, EmployeeBreakdown, EditLog} from '@/types';
import {PaymentMethod} from '@/types';
import {STORAGE_KEYS, ERROR_MESSAGES} from '@/constants';
import {useAuth} from './AuthContext';
import {useOrg} from './OrgContext';
import {formatDateISO, parseDate} from '@/utils/date';
import {calculateEmployeeCommission} from '@/utils/calculations';

// ============================================================================
// TYPES
// ============================================================================

interface AddWorkEntryPayload {
  employeeId: string;
  serviceId?: string;
  serviceName: string;
  price: number;
  tip?: number;
  paymentMethod: PaymentMethod;
  note?: string;
}

interface UpdateWorkEntryPayload {
  serviceId?: string;
  serviceName?: string;
  price?: number;
  tip?: number;
  paymentMethod?: PaymentMethod;
  note?: string;
}

interface WorkEntryFilters {
  startDate?: Date | string;
  endDate?: Date | string;
  employeeId?: string;
  paymentMethod?: PaymentMethod;
}

interface DataContextValue {
  // State
  workEntries: WorkEntry[];
  dailySummaries: DailySummary[];
  loading: boolean;
  error: string | null;

  // Methods
  addWorkEntry: (payload: AddWorkEntryPayload) => Promise<WorkEntry>;
  updateWorkEntry: (id: string, payload: UpdateWorkEntryPayload) => Promise<void>;
  deleteWorkEntry: (id: string) => Promise<void>;
  getWorkEntries: (filters?: WorkEntryFilters) => WorkEntry[];
  getDailySummary: (date: Date | string) => Promise<DailySummary>;
  refreshData: () => Promise<void>;
  clearError: () => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const DataContext = createContext<DataContextValue | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export const DataProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const {user} = useAuth();
  const {currentOrg, orgUsers, orgServices} = useOrg();

  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([]);
  const [dailySummaries, setDailySummaries] = useState<DailySummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ============================================================================
  // SYNCHRONIZATION
  // ============================================================================

  useEffect(() => {
    let entriesUnsubscribe: () => void;
    let summariesUnsubscribe: () => void;

    if (currentOrg) {
      setLoading(true);

      // 1. Listen to Work Entries for this Org
      // Optimization: Limit to last 30 days? For now, all entries to keep it simple as expected by UI logic
      // Note: Removed orderBy from query to avoid composite index requirement - sort in memory instead
      entriesUnsubscribe = firestore()
        .collection('workEntries')
        .where('orgId', '==', currentOrg.id)
        .onSnapshot(
          (querySnapshot: any) => {
            const entries: WorkEntry[] = [];
            querySnapshot.forEach((docSnap: any) => {
              const data = docSnap.data() as WorkEntry;
              data.id = docSnap.id;
              if (data.createdAt && 'toDate' in (data.createdAt as any)) {
                data.createdAt = (data.createdAt as any).toDate();
              }
              if (data.updatedAt && 'toDate' in (data.updatedAt as any)) {
                data.updatedAt = (data.updatedAt as any).toDate();
              }
              if (data.editLogs) {
                data.editLogs = data.editLogs.map(log => ({
                  ...log,
                  timestamp:
                    'toDate' in (log.timestamp as any)
                      ? (log.timestamp as any).toDate()
                      : log.timestamp,
                }));
              }
              entries.push(data);
            });
            // Sort by createdAt in descending order (most recent first)
            entries.sort(
              (a, b) => (b.createdAt as Date).getTime() - (a.createdAt as Date).getTime(),
            );
            setWorkEntries(entries);
            AsyncStorage.setItem(STORAGE_KEYS.WORK_ENTRIES, JSON.stringify(entries));
          },
          (err: any) => {
            console.error('Error syncing work entries:', err);
            setError(err.message || 'Failed to sync work entries');
          },
        );

      summariesUnsubscribe = firestore()
        .collection('dailySummaries')
        .where('orgId', '==', currentOrg.id)
        .onSnapshot(
          (querySnapshot: any) => {
            const summaries: DailySummary[] = [];
            querySnapshot.forEach((docSnap: any) => {
              const data = docSnap.data() as DailySummary;
              data.id = docSnap.id;
              if (data.generatedAt && 'toDate' in (data.generatedAt as any)) {
                data.generatedAt = (data.generatedAt as any).toDate();
              }
              if (data.createdAt && 'toDate' in (data.createdAt as any)) {
                data.createdAt = (data.createdAt as any).toDate();
              }
              if (data.updatedAt && 'toDate' in (data.updatedAt as any)) {
                data.updatedAt = (data.updatedAt as any).toDate();
              }
              summaries.push(data);
            });
            setDailySummaries(summaries);
            AsyncStorage.setItem(STORAGE_KEYS.DAILY_SUMMARIES, JSON.stringify(summaries));
          },
          (err: any) => console.error('Error syncing summaries:', err),
        );

      setLoading(false);
    } else {
      setWorkEntries([]);
      setDailySummaries([]);
    }

    return () => {
      if (entriesUnsubscribe) entriesUnsubscribe();
      if (summariesUnsubscribe) summariesUnsubscribe();
    };
  }, [currentOrg]);

  // ============================================================================
  // ADD WORK ENTRY
  // ============================================================================

  const addWorkEntry = useCallback(
    async (payload: AddWorkEntryPayload): Promise<WorkEntry> => {
      if (!user || !currentOrg) {
        throw new Error('Must be logged in with an organization');
      }

      setLoading(true);
      setError(null);

      try {
        // Find employee and service details
        const employee = orgUsers.find(u => u.id === payload.employeeId);
        if (!employee) {
          throw new Error('Employee not found');
        }

        let service: Service | undefined;
        if (payload.serviceId) {
          service = orgServices.find(s => s.id === payload.serviceId);
        }

        const newEntryRef = firestore().collection('workEntries').doc();

        // Create new work entry with only defined values
        const newEntry: any = {
          id: newEntryRef.id,
          orgId: currentOrg.id,
          employeeId: payload.employeeId,
          employeeName: employee.name,
          serviceName: service ? service.name : payload.serviceName,
          price: payload.price,
          paymentMethod: payload.paymentMethod,
          createdBy: user.id,
          createdByName: user.name,
          edited: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        // Only add optional fields if they have values
        if (payload.serviceId) {
          newEntry.serviceId = payload.serviceId;
        }
        if (payload.tip && payload.tip > 0) {
          newEntry.tip = payload.tip;
        }
        if (payload.note && payload.note.trim()) {
          newEntry.note = payload.note.trim();
        }

        await newEntryRef.set(newEntry);
        // Listener updates state

        // Invalidate or update relevant daily summary if exists?
        // Ideally cloud functions handle aggregation, but for now we can regenerate client side on next getDailySummary call or force update?
        // getDailySummary logic checks existingSummary. It might be stale.
        // For simplicity, we assume summaries are generated on demand or nightly. Realtime updates of summaries might be too heavy for client.

        return newEntry as WorkEntry;
      } catch (err: any) {
        const errorMessage = err.message || ERROR_MESSAGES.somethingWentWrong;
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [user, currentOrg, orgUsers, orgServices],
  );

  // ============================================================================
  // UPDATE WORK ENTRY
  // ============================================================================

  const updateWorkEntry = useCallback(
    async (id: string, payload: UpdateWorkEntryPayload) => {
      if (!user) {
        throw new Error('Must be logged in');
      }

      setLoading(true);
      setError(null);

      try {
        const entryDocRef = firestore().collection('workEntries').doc(id);
        const entryDocSnap = await entryDocRef.get();
        if (!entryDocSnap.exists) {
          throw new Error('Work entry not found');
        }
        const existingEntry = entryDocSnap.data() as WorkEntry;

        // Find service if serviceId is provided
        let serviceName = payload.serviceName;
        if (payload.serviceId && !serviceName) {
          const service = orgServices.find(s => s.id === payload.serviceId);
          if (service) {
            serviceName = service.name;
          }
        }

        // Create edit log entry
        const editLog: EditLog = {
          editedBy: user.id,
          editedByName: user.name,
          previous: {
            serviceId: existingEntry.serviceId,
            serviceName: existingEntry.serviceName,
            price: existingEntry.price,
            tip: existingEntry.tip,
            paymentMethod: existingEntry.paymentMethod,
            note: existingEntry.note,
          },
          newValue: {
            serviceId: payload.serviceId ?? existingEntry.serviceId,
            serviceName: serviceName ?? existingEntry.serviceName,
            price: payload.price ?? existingEntry.price,
            tip: payload.tip !== undefined ? payload.tip : existingEntry.tip,
            paymentMethod: payload.paymentMethod ?? existingEntry.paymentMethod,
            note: payload.note !== undefined ? payload.note : existingEntry.note,
          },
          timestamp: new Date(),
        };

        const updatedData = {
          serviceId: payload.serviceId ?? existingEntry.serviceId,
          serviceName: serviceName ?? existingEntry.serviceName,
          price: payload.price ?? existingEntry.price,
          tip: payload.tip !== undefined ? payload.tip : existingEntry.tip,
          paymentMethod: payload.paymentMethod ?? existingEntry.paymentMethod,
          note: payload.note !== undefined ? payload.note : existingEntry.note,
          edited: true,
          editLogs: [...(existingEntry.editLogs || []), editLog],
          updatedAt: new Date(),
        };

        await entryDocRef.update(updatedData);

        console.log('✅ Work entry updated:', id);
      } catch (err: any) {
        const errorMessage = err.message || ERROR_MESSAGES.somethingWentWrong;
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [user, orgServices],
  );

  // ============================================================================
  // DELETE WORK ENTRY
  // ============================================================================

  const deleteWorkEntry = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);

    try {
      await firestore().collection('workEntries').doc(id).delete();
      console.log('✅ Work entry deleted:', id);
    } catch (err: any) {
      const errorMessage = err.message || ERROR_MESSAGES.somethingWentWrong;
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // GET WORK ENTRIES (Local Filter because we sync all for now)
  // ============================================================================

  const getWorkEntries = useCallback(
    (filters?: WorkEntryFilters): WorkEntry[] => {
      let filtered = [...workEntries];

      if (filters) {
        if (filters.startDate) {
          const startDate =
            typeof filters.startDate === 'string'
              ? parseDate(filters.startDate)
              : filters.startDate;
          if (startDate) {
            filtered = filtered.filter(e => {
              const entryDate =
                typeof e.createdAt === 'string' ? parseDate(e.createdAt) : e.createdAt;
              // Reset time part for comparison if needed, but let's assume exact or standard comparison
              return entryDate && entryDate >= startDate;
            });
          }
        }

        if (filters.endDate) {
          const endDate =
            typeof filters.endDate === 'string' ? parseDate(filters.endDate) : filters.endDate;
          if (endDate) {
            endDate.setHours(23, 59, 59, 999);
            filtered = filtered.filter(e => {
              const entryDate =
                typeof e.createdAt === 'string' ? parseDate(e.createdAt) : e.createdAt;
              return entryDate && entryDate <= endDate;
            });
          }
        }

        if (filters.employeeId) {
          filtered = filtered.filter(e => e.employeeId === filters.employeeId);
        }

        if (filters.paymentMethod) {
          filtered = filtered.filter(e => e.paymentMethod === filters.paymentMethod);
        }
      }

      // Sort
      return filtered.sort((a, b) => {
        const dateA = typeof a.createdAt === 'string' ? parseDate(a.createdAt) : a.createdAt;
        const dateB = typeof b.createdAt === 'string' ? parseDate(b.createdAt) : b.createdAt;
        if (!dateA || !dateB) return 0;
        return dateB.getTime() - dateA.getTime();
      });
    },
    [workEntries],
  );

  // ============================================================================
  // GET/GENERATE DAILY SUMMARY
  // ============================================================================

  const getDailySummary = useCallback(
    async (date: Date | string): Promise<DailySummary> => {
      if (!currentOrg) {
        throw new Error('Must have an organization');
      }

      setLoading(true);
      setError(null);

      try {
        const targetDate = typeof date === 'string' ? parseDate(date) : date;
        if (!targetDate) {
          throw new Error('Invalid date');
        }
        const dateStr = formatDateISO(targetDate);

        // Check availability locally first (synced)
        let existingSummary = dailySummaries.find(
          s => s.date === dateStr && s.orgId === currentOrg.id,
        );

        // Or query logic if not syncing all summaries
        if (!existingSummary) {
          const qs = await firestore()
            .collection('dailySummaries')
            .where('orgId', '==', currentOrg.id)
            .where('date', '==', dateStr)
            .limit(1)
            .get();
          if (!qs.empty) {
            const docSnap = qs.docs[0];
            const data = docSnap.data() as DailySummary;
            data.id = docSnap.id;
            // date conversions...
            existingSummary = data;
          }
        }

        if (existingSummary) {
          // TODO: check if it's stale? For now, return existing.
          return existingSummary;
        }

        // GENERATE NEW SUMMARY
        // Since we have workEntries synced, we can calculate locally -> save to firestore
        // OR query firestore for that day's entries if not fully synced.
        // Assuming `workEntries` state has all data we need (based on sync logic)

        let dayEntries = getWorkEntries({
          startDate: targetDate,
          endDate: targetDate,
        });

        // If local `workEntries` is empty but we suspect data exists, we might need to fetch from server?
        // But the listener fetches all ordered by time.

        // Calculate totals
        const totalIncome = dayEntries.reduce((sum, e) => sum + e.price + (e.tip || 0), 0);
        const totalTips = dayEntries.reduce((sum, e) => sum + (e.tip || 0), 0);
        const totalCash = dayEntries
          .filter(e => e.paymentMethod === PaymentMethod.CASH)
          .reduce((sum, e) => sum + e.price + (e.tip || 0), 0);
        const totalBkash = dayEntries
          .filter(e => e.paymentMethod === PaymentMethod.BKASH)
          .reduce((sum, e) => sum + e.price + (e.tip || 0), 0);
        const totalNagad = dayEntries
          .filter(e => e.paymentMethod === PaymentMethod.NAGAD)
          .reduce((sum, e) => sum + e.price + (e.tip || 0), 0);
        const totalCard = dayEntries
          .filter(e => e.paymentMethod === PaymentMethod.CARD)
          .reduce((sum, e) => sum + e.price + (e.tip || 0), 0);
        const totalOther = dayEntries
          .filter(e => e.paymentMethod === PaymentMethod.OTHER)
          .reduce((sum, e) => sum + e.price + (e.tip || 0), 0);

        let totalCommissionTotal = 0;
        const employeeMap = new Map<string, EmployeeBreakdown>();
        dayEntries.forEach(entry => {
          if (!employeeMap.has(entry.employeeId)) {
            employeeMap.set(entry.employeeId, {
              employeeId: entry.employeeId,
              employeeName: entry.employeeName,
              totalCount: 0,
              totalIncome: 0,
              totalTips: 0,
              commission: 0,
            });
          }
          const breakdown = employeeMap.get(entry.employeeId)!;
          breakdown.totalCount += 1;
          breakdown.totalIncome += entry.price;
          breakdown.totalTips += entry.tip || 0;

          // Calculate commission for this entry if role and settings match
          const employee = orgUsers.find(u => u.id === entry.employeeId);
          if (employee && currentOrg) {
            const entryCommission = calculateEmployeeCommission(
              entry.price,
              currentOrg,
              employee.commissionPercentage,
            );
            breakdown.commission = (breakdown.commission || 0) + entryCommission;
            totalCommissionTotal += entryCommission;
          }
        });

        const newSummaryRef = firestore().collection('dailySummaries').doc();
        const newSummary: DailySummary = {
          id: newSummaryRef.id,
          date: dateStr,
          orgId: currentOrg.id,
          totalIncome,
          totalTips,
          totalEntries: dayEntries.length,
          totalCash,
          totalBkash,
          totalNagad,
          totalCard,
          totalOther,
          totalCommission: totalCommissionTotal,
          employeeBreakdown: Array.from(employeeMap.values()),
          generatedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        await newSummaryRef.set(newSummary);

        return newSummary;
      } catch (err: any) {
        const errorMessage = err.message || ERROR_MESSAGES.somethingWentWrong;
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [currentOrg, dailySummaries, getWorkEntries, orgUsers],
  );

  const refreshData = useCallback(async () => {
    // No-op with realtime
    console.log('Refreshed data');
  }, []);

  const clearError = useCallback(() => setError(null), []);

  const value: DataContextValue = {
    workEntries,
    dailySummaries,
    loading,
    error,
    addWorkEntry,
    updateWorkEntry,
    deleteWorkEntry,
    getWorkEntries,
    getDailySummary,
    refreshData,
    clearError,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextValue => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};

export default DataContext;
export type {AddWorkEntryPayload, UpdateWorkEntryPayload, WorkEntryFilters};
