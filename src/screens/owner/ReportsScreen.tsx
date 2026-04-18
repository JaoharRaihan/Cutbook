/**
 * ReportsScreen.tsx
 * Analytics and reports screen with date range filtering
 */

import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import {useOrg} from '@/context';
import {WorkEntry, PaymentMethod, User} from '@/types';
import {formatBDT} from '@/utils';

// ============================================================================
// TYPES
// ============================================================================

type DateRange = 'today' | 'week' | 'month' | 'custom';

interface EmployeeStats {
  employeeId: string;
  employeeName: string;
  totalServices: number;
  totalIncome: number;
  totalTips: number;
  avgPerService: number;
}

interface PaymentStats {
  method: PaymentMethod;
  count: number;
  total: number;
  percentage: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function ReportsScreen({navigation}: any): React.ReactElement {
  const {currentOrg} = useOrg();
  const [dateRange, setDateRange] = useState<DateRange>('today');

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
      serviceName: 'Clean Shave',
      price: 100,
      paymentMethod: PaymentMethod.BKASH,
      createdBy: 'user_1',
      createdByName: 'Owner',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
      edited: false,
    },
    {
      id: 'entry_3',
      orgId: 'org_1',
      employeeId: 'user_2',
      employeeName: 'Karim Ahmed',
      serviceName: 'Beard Styling',
      price: 200,
      tip: 20,
      paymentMethod: PaymentMethod.CARD,
      createdBy: 'user_1',
      createdByName: 'Owner',
      createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      edited: true,
    },
    {
      id: 'entry_4',
      orgId: 'org_1',
      employeeId: 'user_4',
      employeeName: 'Sabbir Khan',
      serviceName: 'Premium Haircut',
      price: 500,
      tip: 100,
      paymentMethod: PaymentMethod.CASH,
      createdBy: 'user_1',
      createdByName: 'Owner',
      createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
      edited: false,
    },
    {
      id: 'entry_5',
      orgId: 'org_1',
      employeeId: 'user_3',
      employeeName: 'Rahim Islam',
      serviceName: 'Facial',
      price: 600,
      paymentMethod: PaymentMethod.NAGAD,
      createdBy: 'user_1',
      createdByName: 'Owner',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
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
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      edited: false,
    },
    {
      id: 'entry_7',
      orgId: 'org_1',
      employeeId: 'user_4',
      employeeName: 'Sabbir Khan',
      serviceName: 'Hair Color',
      price: 1500,
      tip: 200,
      paymentMethod: PaymentMethod.BKASH,
      createdBy: 'user_1',
      createdByName: 'Owner',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      edited: false,
    },
  ];

  // ============================================================================
  // FILTERING LOGIC
  // ============================================================================

  const getDateRange = (range: DateRange): {start: Date; end: Date} => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    switch (range) {
      case 'today':
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        };
      case 'week':
        const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        return {
          start: weekAgo,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        };
      case 'month':
        const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        return {
          start: monthAgo,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        };
      default:
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        };
    }
  };

  const filteredEntries = useMemo(() => {
    const {start, end} = getDateRange(dateRange);
    return mockEntries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      return entryDate >= start && entryDate < end;
    });
  }, [dateRange, mockEntries]);

  // ============================================================================
  // CALCULATIONS
  // ============================================================================

  const totalIncome = useMemo(() => {
    return filteredEntries.reduce((sum, entry) => {
      return sum + entry.price + (entry.tip || 0);
    }, 0);
  }, [filteredEntries]);

  const totalEntries = filteredEntries.length;

  const totalTips = useMemo(() => {
    return filteredEntries.reduce((sum, entry) => sum + (entry.tip || 0), 0);
  }, [filteredEntries]);

  const paymentBreakdown = useMemo((): PaymentStats[] => {
    const breakdown: {[key: string]: {count: number; total: number}} = {};

    filteredEntries.forEach(entry => {
      const method = entry.paymentMethod;
      if (!breakdown[method]) {
        breakdown[method] = {count: 0, total: 0};
      }
      breakdown[method].count += 1;
      breakdown[method].total += entry.price + (entry.tip || 0);
    });

    return Object.entries(breakdown).map(([method, data]) => ({
      method: method as PaymentMethod,
      count: data.count,
      total: data.total,
      percentage: totalIncome > 0 ? (data.total / totalIncome) * 100 : 0,
    }));
  }, [filteredEntries, totalIncome]);

  const employeeBreakdown = useMemo((): EmployeeStats[] => {
    const breakdown: {[key: string]: EmployeeStats} = {};

    filteredEntries.forEach(entry => {
      if (!breakdown[entry.employeeId]) {
        breakdown[entry.employeeId] = {
          employeeId: entry.employeeId,
          employeeName: entry.employeeName,
          totalServices: 0,
          totalIncome: 0,
          totalTips: 0,
          avgPerService: 0,
        };
      }

      const stats = breakdown[entry.employeeId];
      stats.totalServices += 1;
      stats.totalIncome += entry.price + (entry.tip || 0);
      stats.totalTips += entry.tip || 0;
    });

    // Calculate averages and sort by income
    return Object.values(breakdown)
      .map(stats => ({
        ...stats,
        avgPerService: stats.totalServices > 0 ? stats.totalIncome / stats.totalServices : 0,
      }))
      .sort((a, b) => b.totalIncome - a.totalIncome);
  }, [filteredEntries]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleExport = () => {
    Alert.alert(
      'Export Report',
      `Export ${totalEntries} entries as CSV?\n\nThis will generate a downloadable file with all transaction details.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Export',
          onPress: () => {
            // Mock export
            setTimeout(() => {
              Alert.alert(
                'Success',
                'Report exported successfully!\n\nFile: cutbook_report_' +
                  new Date().toISOString().split('T')[0] +
                  '.csv',
              );
            }, 500);
          },
        },
      ],
    );
  };

  const getPaymentMethodColor = (method: PaymentMethod): string => {
    switch (method) {
      case PaymentMethod.CASH:
        return '#4CAF50';
      case PaymentMethod.BKASH:
        return '#E91E63';
      case PaymentMethod.CARD:
        return '#2196F3';
      case PaymentMethod.NAGAD:
        return '#FF9800';
      default:
        return '#757575';
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod): string => {
    switch (method) {
      case PaymentMethod.CASH:
        return 'Cash';
      case PaymentMethod.BKASH:
        return 'bKash';
      case PaymentMethod.CARD:
        return 'Card';
      case PaymentMethod.NAGAD:
        return 'Nagad';
      default:
        return method;
    }
  };

  const getRangeLabelgetRangeLabel = (range: DateRange): string => {
    switch (range) {
      case 'today':
        return 'Today';
      case 'week':
        return 'Last 7 Days';
      case 'month':
        return 'Last 30 Days';
      default:
        return 'Custom';
    }
  };

  // ============================================================================
  // RENDER METHODS
  // ============================================================================

  const renderDateFilter = () => {
    const ranges: {value: DateRange; label: string}[] = [
      {value: 'today', label: 'Today'},
      {value: 'week', label: 'This Week'},
      {value: 'month', label: 'This Month'},
    ];

    return (
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Date Range:</Text>
        <View style={styles.dateFilters}>
          {ranges.map(range => (
            <TouchableOpacity
              key={range.value}
              style={[styles.filterButton, dateRange === range.value && styles.filterButtonActive]}
              onPress={() => setDateRange(range.value)}>
              <Text
                style={[
                  styles.filterButtonText,
                  dateRange === range.value && styles.filterButtonTextActive,
                ]}>
                {range.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
        <View>
          <Text style={styles.headerTitle}>Reports & Analytics</Text>
          <Text style={styles.headerSubtitle}>
            {getRangeLabelgetRangeLabel(dateRange)} • {currentOrg?.name}
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Date Filter */}
        {renderDateFilter()}

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={[styles.summaryCard, styles.summaryCardPrimary]}>
            <Text style={styles.summaryIcon}>💰</Text>
            <Text style={styles.summaryLabel}>Total Income</Text>
            <Text style={styles.summaryValue}>{formatBDT(totalIncome)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>📋</Text>
            <Text style={styles.summaryLabel}>Total Entries</Text>
            <Text style={styles.summaryValue}>{totalEntries}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>🎁</Text>
            <Text style={styles.summaryLabel}>Total Tips</Text>
            <Text style={styles.summaryValue}>{formatBDT(totalTips)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryIcon}>📊</Text>
            <Text style={styles.summaryLabel}>Avg per Entry</Text>
            <Text style={styles.summaryValue}>
              {formatBDT(totalEntries > 0 ? totalIncome / totalEntries : 0)}
            </Text>
          </View>
        </View>

        {/* Payment Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💳 Payment Methods</Text>

          {paymentBreakdown.length > 0 ? (
            paymentBreakdown.map((payment, index) => (
              <View key={index} style={styles.paymentItem}>
                <View style={styles.paymentHeader}>
                  <View
                    style={[
                      styles.paymentBadge,
                      {backgroundColor: getPaymentMethodColor(payment.method)},
                    ]}>
                    <Text style={styles.paymentBadgeText}>
                      {getPaymentMethodLabel(payment.method)}
                    </Text>
                  </View>
                  <Text style={styles.paymentCount}>{payment.count} entries</Text>
                </View>

                <View style={styles.paymentBar}>
                  <View
                    style={[
                      styles.paymentBarFill,
                      {
                        width: `${payment.percentage}%`,
                        backgroundColor: getPaymentMethodColor(payment.method),
                      },
                    ]}
                  />
                </View>

                <View style={styles.paymentFooter}>
                  <Text style={styles.paymentAmount}>{formatBDT(payment.total)}</Text>
                  <Text style={styles.paymentPercentage}>{payment.percentage.toFixed(1)}%</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No payment data available</Text>
          )}
        </View>

        {/* Employee Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👥 Employee Performance</Text>

          {employeeBreakdown.length > 0 ? (
            employeeBreakdown.map((employee, index) => (
              <View key={employee.employeeId} style={styles.employeeItem}>
                <View style={styles.employeeRank}>
                  <Text style={styles.rankNumber}>#{index + 1}</Text>
                </View>

                <View style={styles.employeeAvatar}>
                  <Text style={styles.employeeInitial}>
                    {employee.employeeName.charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.employeeInfo}>
                  <Text style={styles.employeeName}>{employee.employeeName}</Text>
                  <View style={styles.employeeStats}>
                    <Text style={styles.employeeStat}>{employee.totalServices} services</Text>
                    <Text style={styles.employeeStatDivider}>•</Text>
                    <Text style={styles.employeeStat}>{formatBDT(employee.totalTips)} tips</Text>
                  </View>
                </View>

                <View style={styles.employeeAmount}>
                  <Text style={styles.employeeIncome}>{formatBDT(employee.totalIncome)}</Text>
                  <Text style={styles.employeeAvg}>ø {formatBDT(employee.avgPerService)}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No employee data available</Text>
          )}
        </View>

        {/* Export Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📤 Export</Text>

          <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
            <View style={styles.exportButtonContent}>
              <Text style={styles.exportButtonIcon}>📄</Text>
              <View style={styles.exportButtonText}>
                <Text style={styles.exportButtonTitle}>Export to CSV</Text>
                <Text style={styles.exportButtonSubtitle}>
                  Download {totalEntries} entries as spreadsheet
                </Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.exportInfo}>
            <Text style={styles.exportInfoText}>
              ℹ️ CSV file includes all transaction details, employee info, and payment methods
            </Text>
          </View>
        </View>

        {/* Empty State */}
        {totalEntries === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>📊</Text>
            <Text style={styles.emptyTitle}>No Data Available</Text>
            <Text style={styles.emptySubtitle}>No work entries found for the selected period</Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('AddWorkEntry')}>
              <Text style={styles.emptyButtonText}>Add Work Entry</Text>
            </TouchableOpacity>
          </View>
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  dateFilters: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
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
    fontWeight: '600',
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  summaryCardPrimary: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  summaryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 6,
    textAlign: 'center',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 16,
  },
  paymentItem: {
    marginBottom: 20,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  paymentCount: {
    fontSize: 13,
    color: '#757575',
  },
  paymentBar: {
    height: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  paymentBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  paymentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  paymentPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
  },
  employeeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  employeeRank: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankNumber: {
    fontSize: 14,
    fontWeight: '700',
    color: '#757575',
  },
  employeeAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  employeeInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  employeeStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  employeeStat: {
    fontSize: 13,
    color: '#757575',
  },
  employeeStatDivider: {
    fontSize: 13,
    color: '#E0E0E0',
    marginHorizontal: 6,
  },
  employeeAmount: {
    alignItems: 'flex-end',
  },
  employeeIncome: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 2,
  },
  employeeAvg: {
    fontSize: 12,
    color: '#757575',
  },
  exportButton: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#2196F3',
    marginBottom: 12,
  },
  exportButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  exportButtonIcon: {
    fontSize: 40,
    marginRight: 16,
  },
  exportButtonText: {
    flex: 1,
  },
  exportButtonTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1565C0',
    marginBottom: 4,
  },
  exportButtonSubtitle: {
    fontSize: 13,
    color: '#1976D2',
  },
  exportInfo: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
  },
  exportInfoText: {
    fontSize: 12,
    color: '#E65100',
    lineHeight: 18,
  },
  emptyText: {
    fontSize: 14,
    color: '#9E9E9E',
    textAlign: 'center',
    paddingVertical: 20,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
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
});
