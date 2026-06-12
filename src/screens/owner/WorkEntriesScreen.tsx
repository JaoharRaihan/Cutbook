/**
 * WorkEntriesScreen.tsx
 * List screen for viewing all work entries with filters
 */

import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ScrollView,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useOrg, useData} from '@/context';
import {WorkEntry, TransactionStatus} from '@/types';
import {formatBDT} from '@/utils';
import WorkEntryCard from '@/components/WorkEntryCard';
import MaterialIcons from '@react-native-vector-icons/material-icons';

// ============================================================================
// TYPES
// ============================================================================

type DateFilter = 'today' | 'week' | 'month' | 'year';

// ============================================================================
// COMPONENT
// ============================================================================

export default function WorkEntriesScreen({navigation}: any): React.ReactElement {
  const {currentOrg, orgUsers, employeeTransactions} = useOrg();
  const {workEntries, refreshData} = useData();
  const [refreshing, setRefreshing] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  // ============================================================================
  // FILTERING LOGIC
  // ============================================================================

  const getDateRange = (filter: DateFilter): {start: Date; end: Date} => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filter) {
      case 'today':
        return {start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000)};
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return {start: weekAgo, end: new Date(today.getTime() + 24 * 60 * 60 * 1000)};
      case 'month': {
        // Calendar month: [1st of this month, 1st of next month)
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        return {start, end};
      }
      case 'year': {
        // Year range: [Jan 1, next Jan 1)
        const start = new Date(today.getFullYear(), 0, 1);
        const end = new Date(today.getFullYear() + 1, 0, 1);
        return {start, end};
      }
      default:
        return {start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000)};
    }
  };

  const filteredEntries = useMemo(() => {
    let entries = [...workEntries];

    // Filter by date
    const {start, end} = getDateRange(dateFilter);
    entries = entries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      return entryDate >= start && entryDate < end;
    });

    // Filter by employee
    if (selectedEmployee) {
      entries = entries.filter(entry => entry.employeeId === selectedEmployee);
    }

    // Sort by date (newest first)
    entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return entries;
  }, [dateFilter, selectedEmployee, workEntries]);

  // ============================================================================
  // CALCULATIONS
  // ============================================================================

  const totalIncome = useMemo(() => {
    return filteredEntries.reduce((sum, entry) => {
      return sum + entry.price + (entry.tip || 0);
    }, 0);
  }, [filteredEntries]);

  const totalTips = useMemo(() => {
    return filteredEntries.reduce((sum, entry) => sum + (entry.tip || 0), 0);
  }, [filteredEntries]);

  // Calculate employee earnings breakdown
  const employeeEarnings = useMemo(() => {
    if (!selectedEmployee) return null;

    const employee = orgUsers.find(e => e.id === selectedEmployee);
    if (!employee) return null;

    // Commission from work entries
    const commissionPercentage = employee.commissionPercentage || 0;
    const commission = Math.round((totalIncome * commissionPercentage) / 100);

    // Get payouts for this employee (only accepted transactions)
    const acceptedPayouts = (employeeTransactions || [])
      .filter(t => t.employeeId === selectedEmployee && t.status === TransactionStatus.ACCEPTED)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      commissionPercentage,
      commission,
      acceptedPayouts,
      netAmount: commission + totalTips - acceptedPayouts,
      employeeName: employee.name,
    };
  }, [selectedEmployee, totalIncome, orgUsers, employeeTransactions]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } catch (error) {
      console.error('Error refreshing work entries:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleEntryPress = (entry: WorkEntry) => {
    navigation.navigate('WorkEntryDetail', {entryId: entry.id});
  };

  const handleAddEntry = () => {
    navigation.navigate('AddWorkEntry');
  };

  const getEmployeeName = (employeeId: string): string => {
    const employee = orgUsers.find(e => e.id === employeeId);
    return employee ? employee.name : 'Unknown';
  };

  // ============================================================================
  // RENDER METHODS
  // ============================================================================

  const renderDateFilter = () => {
    const filters: {value: DateFilter; label: string}[] = [
      {value: 'today', label: 'Today'},
      {value: 'week', label: 'This Week'},
      {value: 'month', label: 'This Month'},
      {value: 'year', label: 'This Year'},
    ];

    return (
      <View style={styles.filterContainer}>
        <View style={styles.dateFilters}>
          {filters.map(filter => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterButton,
                dateFilter === filter.value && styles.filterButtonActive,
              ]}
              onPress={() => setDateFilter(filter.value)}>
              <Text
                style={[
                  styles.filterButtonText,
                  dateFilter === filter.value && styles.filterButtonTextActive,
                ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderEmployeeFilter = () => {
    return (
      <View style={styles.employeeFilterContainer}>
        <Text style={styles.filterLabel}>Filter by Employee:</Text>
        <View style={styles.employeeChips}>
          <TouchableOpacity
            style={[styles.employeeChip, !selectedEmployee && styles.employeeChipActive]}
            onPress={() => setSelectedEmployee(null)}>
            <Text
              style={[styles.employeeChipText, !selectedEmployee && styles.employeeChipTextActive]}>
              All
            </Text>
          </TouchableOpacity>
          {orgUsers.map(employee => (
            <TouchableOpacity
              key={employee.id}
              style={[
                styles.employeeChip,
                selectedEmployee === employee.id && styles.employeeChipActive,
              ]}
              onPress={() => setSelectedEmployee(employee.id)}>
              <Text
                style={[
                  styles.employeeChipText,
                  selectedEmployee === employee.id && styles.employeeChipTextActive,
                ]}>
                {employee.name.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderSummary = () => {
    if (!employeeEarnings) return null;
    return (
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Income</Text>
          <Text style={styles.summaryValue}>{formatBDT(totalIncome)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>After Commision</Text>
          <Text style={styles.summaryValue}>{formatBDT(employeeEarnings.commission)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Tips</Text>
          <Text style={styles.summaryValue}>{formatBDT(totalTips)}</Text>
        </View>
      </View>
    );
  };

  const renderEmployeeEarnings = () => {
    if (!employeeEarnings) return null;

    return (
      <View style={styles.earningsContainer}>
        <View style={styles.earningsSection}>
          <Text style={styles.earningsTitle}>
            {employeeEarnings.employeeName}'s Earnings from Shop
          </Text>

          {/* Commission Earned */}
          <View style={styles.earningsRow}>
            <Text style={styles.earningsLabel}>
              Commission ({employeeEarnings.commissionPercentage}%)
            </Text>
            <Text style={styles.earningsValue}>{formatBDT(employeeEarnings.commission)}</Text>
          </View>

          <View style={styles.earningsRow}>
            <Text style={styles.earningsLabel}>Tips</Text>
            <Text style={styles.earningsValue}>{formatBDT(totalTips)}</Text>
          </View>

          <View style={styles.earningsRow}>
            <Text style={styles.earningsLabel}> Total (Com & Tips)</Text>
            <Text style={styles.earningsValue}>
              {formatBDT(employeeEarnings.commission + totalTips)}
            </Text>
          </View>
          {/* Payouts Given */}
          <View style={styles.earningsRow}>
            <Text style={styles.earningsLabel}>Minus: Payouts Given</Text>
            <Text style={[styles.earningsValue, styles.payoutValue]}>
              -{formatBDT(employeeEarnings.acceptedPayouts)}
            </Text>
          </View>

          {/* Net Amount */}
          <View style={[styles.earningsRow, styles.netAmountRow]}>
            <Text style={[styles.earningsLabel, styles.netAmountLabel]}>Net Amount</Text>
            <Text
              style={[
                styles.earningsValue,
                styles.netAmountValue,
                employeeEarnings.netAmount < 0 && styles.negativeAmount,
              ]}>
              {formatBDT(employeeEarnings.netAmount)}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyState}>
        <MaterialIcons name="addchart" style={styles.emptyIcon} />
        <Text style={styles.emptyTitle}>No entries found</Text>
        <Text style={styles.emptySubtitle}>
          {selectedEmployee
            ? 'This employee has no entries for the selected period'
            : 'No work entries for the selected date range'}
        </Text>
        <TouchableOpacity style={styles.emptyButton} onPress={handleAddEntry}>
          <Text style={styles.emptyButtonText}>Add First Entry</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Work Entries</Text>
        <Text style={styles.headerSubtitle}>{currentOrg?.name}</Text>
      </View>
      {/* Filters */}
      {renderDateFilter()}
      {renderEmployeeFilter()}
      <ScrollView>
        {/* Summary */}
        {renderSummary()}

        {/* Employee Earnings */}
        {renderEmployeeEarnings()}

        {/* List */}
        <FlatList
          data={filteredEntries}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <WorkEntryCard
              entry={item}
              employeeName={getEmployeeName(item.employeeId)}
              onPress={() => handleEntryPress(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#000000']}
              tintColor="#000000"
            />
          }
          ListEmptyComponent={renderEmptyState()}
        />

        {/* FAB */}
        <TouchableOpacity style={styles.fab} onPress={handleAddEntry}>
          <MaterialIcons name="add" style={styles.fabText} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  dateFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 14,
    paddingVertical: 1,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  employeeFilterContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  filterLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  employeeChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  employeeChip: {
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  employeeChipActive: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  employeeChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#757575',
  },
  employeeChipTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  summaryContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
  },
  earningsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  earningsSection: {
    backgroundColor: '#FFF9C4',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#FBC02D',
  },
  earningsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F57F17',
    marginBottom: 12,
  },
  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#FFE082',
  },
  earningsLabel: {
    fontSize: 13,
    color: '#333333',
    fontWeight: '500',
  },
  earningsValue: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000000',
  },
  payoutValue: {
    color: '#FF6F00',
  },
  netAmountRow: {
    borderBottomWidth: 0,
    paddingVertical: 12,
    backgroundColor: '#FFF59D',
    marginTop: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  netAmountLabel: {
    color: '#F57F17',
    fontWeight: '700',
    fontSize: 14,
  },
  netAmountValue: {
    fontSize: 18,
    color: '#000000',
  },
  negativeAmount: {
    color: '#D32F2F',
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  emptyButton: {
    backgroundColor: '#000000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    fontSize: 32,
    color: '#FFFFFF',
    fontWeight: '300',
  },
});
