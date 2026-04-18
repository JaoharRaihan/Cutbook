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
  SafeAreaView,
  StatusBar,
  RefreshControl,
} from 'react-native';
import {useOrg} from '@/context';
import {WorkEntry, PaymentMethod, User} from '@/types';
import {formatBDT} from '@/utils';
import WorkEntryCard from '@/components/WorkEntryCard';

// ============================================================================
// TYPES
// ============================================================================

type DateFilter = 'today' | 'yesterday' | 'week' | 'month';

// ============================================================================
// COMPONENT
// ============================================================================

export default function WorkEntriesScreen({navigation}: any): React.ReactElement {
  const {currentOrg} = useOrg();
  const [refreshing, setRefreshing] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  // Mock data
  const mockEmployees: User[] = [
    {
      id: 'user_2',
      name: 'Karim Ahmed',
      phone: '+8801712345678',
      role: 'employee' as any,
      orgId: 'org_1',
      commissionPercentage: 60,
      status: 'active' as any,
      createdAt: new Date('2024-01-15'),
    },
    {
      id: 'user_3',
      name: 'Rahim Islam',
      phone: '+8801812345678',
      role: 'employee' as any,
      orgId: 'org_1',
      commissionPercentage: 55,
      status: 'active' as any,
      createdAt: new Date('2024-02-01'),
    },
    {
      id: 'user_4',
      name: 'Sabbir Khan',
      phone: '+8801912345678',
      role: 'employee' as any,
      orgId: 'org_1',
      commissionPercentage: 50,
      status: 'active' as any,
      createdAt: new Date('2024-03-10'),
    },
  ];

  const mockEntries: WorkEntry[] = [
    {
      id: 'entry_1',
      orgId: 'org_1',
      employeeId: 'user_2',
      employeeName: 'Karim Ahmed',
      serviceId: 'service_1',
      serviceName: 'Regular Haircut',
      price: 300,
      tip: 50,
      paymentMethod: PaymentMethod.CASH,
      createdBy: 'user_1',
      createdByName: 'Owner',
      createdAt: new Date(),
      updatedAt: new Date(),
      edited: false,
    },
    {
      id: 'entry_2',
      orgId: 'org_1',
      employeeId: 'user_3',
      employeeName: 'Rahim Islam',
      serviceId: 'service_3',
      serviceName: 'Clean Shave',
      price: 100,
      paymentMethod: PaymentMethod.BKASH,
      createdBy: 'user_1',
      createdByName: 'Owner',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      edited: false,
    },
    {
      id: 'entry_3',
      orgId: 'org_1',
      employeeId: 'user_2',
      employeeName: 'Karim Ahmed',
      serviceId: 'service_5',
      serviceName: 'Beard Styling',
      price: 200,
      tip: 20,
      paymentMethod: PaymentMethod.CARD,
      createdBy: 'user_1',
      createdByName: 'Owner',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      edited: true,
    },
    {
      id: 'entry_4',
      orgId: 'org_1',
      employeeId: 'user_4',
      employeeName: 'Sabbir Khan',
      serviceId: 'service_2',
      serviceName: 'Premium Haircut',
      price: 500,
      tip: 100,
      paymentMethod: PaymentMethod.CASH,
      createdBy: 'user_1',
      createdByName: 'Owner',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      edited: false,
    },
    {
      id: 'entry_5',
      orgId: 'org_1',
      employeeId: 'user_3',
      employeeName: 'Rahim Islam',
      serviceId: 'service_7',
      serviceName: 'Facial',
      price: 600,
      paymentMethod: PaymentMethod.NAGAD,
      createdBy: 'user_1',
      createdByName: 'Owner',
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
      edited: false,
    },
    {
      id: 'entry_6',
      orgId: 'org_1',
      employeeId: 'user_2',
      employeeName: 'Karim Ahmed',
      serviceName: 'Custom Style',
      price: 400,
      tip: 50,
      paymentMethod: PaymentMethod.CASH,
      createdBy: 'user_1',
      createdByName: 'Owner',
      createdAt: new Date(Date.now() - 25 * 60 * 60 * 1000), // Yesterday
      updatedAt: new Date(Date.now() - 25 * 60 * 60 * 1000),
      edited: false,
    },
  ];

  // ============================================================================
  // FILTERING LOGIC
  // ============================================================================

  const getDateRange = (filter: DateFilter): {start: Date; end: Date} => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (filter) {
      case 'today':
        return {start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000)};
      case 'yesterday':
        const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
        return {start: yesterday, end: today};
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return {start: weekAgo, end: new Date(today.getTime() + 24 * 60 * 60 * 1000)};
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return {start: monthAgo, end: new Date(today.getTime() + 24 * 60 * 60 * 1000)};
      default:
        return {start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000)};
    }
  };

  const filteredEntries = useMemo(() => {
    let entries = [...mockEntries];

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
  }, [dateFilter, selectedEmployee, mockEntries]);

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

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleEntryPress = (entry: WorkEntry) => {
    navigation.navigate('WorkEntryDetail', {entryId: entry.id});
  };

  const handleAddEntry = () => {
    navigation.navigate('AddWorkEntry');
  };

  const getEmployeeName = (employeeId: string): string => {
    const employee = mockEmployees.find(e => e.id === employeeId);
    return employee ? employee.name : 'Unknown';
  };

  // ============================================================================
  // RENDER METHODS
  // ============================================================================

  const renderDateFilter = () => {
    const filters: {value: DateFilter; label: string}[] = [
      {value: 'today', label: 'Today'},
      {value: 'yesterday', label: 'Yesterday'},
      {value: 'week', label: 'This Week'},
      {value: 'month', label: 'This Month'},
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
          {mockEmployees.map(employee => (
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
    return (
      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Income</Text>
          <Text style={styles.summaryValue}>{formatBDT(totalIncome)}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Entries</Text>
          <Text style={styles.summaryValue}>{filteredEntries.length}</Text>
        </View>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Tips</Text>
          <Text style={styles.summaryValue}>{formatBDT(totalTips)}</Text>
        </View>
      </View>
    );
  };

  const renderEmptyState = () => {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyIcon}>📝</Text>
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

      {/* Summary */}
      {renderSummary()}

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
            colors={['#2196F3']}
            tintColor="#2196F3"
          />
        }
        ListEmptyComponent={renderEmptyState()}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleAddEntry}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
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
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  filterButtonActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
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
    paddingVertical: 12,
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  employeeChipActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  employeeChipText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#757575',
  },
  employeeChipTextActive: {
    color: '#2196F3',
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
    backgroundColor: '#2196F3',
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
    backgroundColor: '#2196F3',
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
