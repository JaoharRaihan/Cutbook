/**
 * ReportsScreen.tsx
 * Analytics and reports screen with date range filtering
 */

import React, {useState, useMemo} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useOrg, useData} from '@/context';
import {PaymentMethod} from '@/types';
import {formatBDT} from '@/utils';
import MaterialIcons from '@react-native-vector-icons/material-icons';

// ============================================================================
// TYPES
// ============================================================================

type DateRange = 'today' | 'week' | 'month' | 'year' | 'custom';

interface EmployeeStats {
  employeeId: string;
  employeeName: string;
  totalServices: number;

  // Display totals
  totalIncome: number; // includes tips (kept for existing UI)
  totalTips: number;

  // Used to show “after commission” (tips excluded)
  totalPrice: number;
  totalIncomeAfterCommission: number;

  // Rounded commission amount based on totalPrice * commissionPercentage
  totalCommission: number;

  avgPerService: number;
  commissionPercentage?: number;
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

export default function ReportsScreen({navigation: _navigation}: any): React.ReactElement {
  const {currentOrg, orgUsers} = useOrg();
  const {workEntries} = useData();
  const [dateRange, setDateRange] = useState<DateRange>('today');

  // ============================================================================
  // FILTERING LOGIC
  // ============================================================================

  // NOTE: ReportsScreen uses a custom DateRange type that currently does not include
  // 'year'. Dashboard has a Yearly timePeriod; to keep both screens consistent, we
  // intentionally map “year” to “custom” range here when needed.

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
        return {
          start: today,
          end: new Date(today.getTime() + 24 * 60 * 60 * 1000),
        };
    }
  };

  const filteredEntries = useMemo(() => {
    const {start, end} = getDateRange(dateRange);
    return workEntries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      return entryDate >= start && entryDate < end;
    });
  }, [dateRange, workEntries]);

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
        const orgUser = orgUsers.find(u => u.id === entry.employeeId);

        breakdown[entry.employeeId] = {
          employeeId: entry.employeeId,
          employeeName: entry.employeeName,
          totalServices: 0,
          totalIncome: 0,
          totalTips: 0,
          totalPrice: 0,
          totalIncomeAfterCommission: 0,
          totalCommission: 0,
          avgPerService: 0,
          // commission comes from Firebase (orgUsers is loaded from Firestore)
          commissionPercentage: orgUser?.commissionPercentage,
        };
      }

      const stats = breakdown[entry.employeeId];
      stats.totalServices += 1;

      // totals shown on existing UI
      stats.totalIncome += entry.price + (entry.tip || 0);
      stats.totalTips += entry.tip || 0;

      // totals used for “after commission” (tips excluded)
      stats.totalPrice += entry.price;
    });

    // Calculate after-commission totals, averages, and sort by income
    return Object.values(breakdown)
      .map(stats => {
        const commissionPercentage = stats.commissionPercentage ?? 0;

        // After commission is based on price-only total (tips excluded)
        // commission = priceTotal * (commissionPercentage / 100)
        const commissionAmount = (stats.totalPrice * commissionPercentage) / 100;

        // Fix: keep commission integer/rounded in UI to match other screens logic.
        // (Only affects display calculations, not the underlying entry data.)
        const roundedCommissionAmount = Math.round(commissionAmount);
        const roundedTotalIncomeAfterCommission = stats.totalPrice - roundedCommissionAmount;

        return {
          ...stats,
          totalIncomeAfterCommission: roundedTotalIncomeAfterCommission,
          // store rounded commission so the “Commission Earned” row is consistent
          totalCommission: roundedCommissionAmount,
          avgPerService: stats.totalServices > 0 ? stats.totalIncome / stats.totalServices : 0,
        };
      })
      .sort((a, b) => b.totalIncome - a.totalIncome);
  }, [filteredEntries, orgUsers]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const _handleExport = () => {
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

  const getRangeLabel = (range: DateRange): string => {
    switch (range) {
      case 'today':
        return 'Today';
      case 'week':
        return 'Last 7 Days';
      case 'month':
        return 'Last 30 Days';
      case 'year':
        return 'This Year';
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
      {value: 'year', label: 'This Year'},
    ];

    return (
      <View style={styles.filterContainer}>
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
            {getRangeLabel(dateRange)} • {currentOrg?.name}
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
            <MaterialIcons name="sticky-note-2" style={styles.summaryIcon} />
            <Text style={styles.summaryLabel}>Total Entries</Text>
            <Text style={styles.summaryValue}>{totalEntries}</Text>
          </View>
          <View style={styles.summaryCard}>
            <MaterialIcons name="bar-chart" style={styles.summaryIcon} />
            <Text style={styles.summaryLabel}>Total Income & Tips</Text>
            <Text style={styles.summaryValue}>{formatBDT(totalIncome)}</Text>
          </View>
          <View style={styles.summaryCard}>
            <MaterialIcons name="tips-and-updates" style={styles.summaryIcon} />
            <Text style={styles.summaryLabel}>Total Tips</Text>
            <Text style={styles.summaryValue}>{formatBDT(totalTips)}</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardPrimary]}>
            <MaterialIcons name="attach-money" size={16} style={styles.summaryIcon} />
            <Text style={styles.summaryLabel}>Total Income</Text>
            <Text style={styles.summaryValue}>{formatBDT(totalIncome - totalTips)}</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardPrimary]}>
            <MaterialIcons name="currency-bitcoin" style={styles.summaryIcon} />
            <Text style={styles.summaryLabel}>Salon Earrings</Text>
            <Text style={styles.summaryValue}>
              {formatBDT(
                employeeBreakdown.reduce(
                  (sum, e) => sum + e.totalIncomeAfterCommission + e.totalTips,
                  0,
                ),
              )}
            </Text>{' '}
          </View>
          <View style={styles.summaryCard}>
            <MaterialIcons name="currency-exchange" style={styles.summaryIcon} />
            <Text style={styles.summaryLabel}>Employees Earnings</Text>
            <Text style={styles.summaryValue}>
              {formatBDT(
                (totalEntries > 0 ? totalIncome + totalTips : 0) -
                  employeeBreakdown.reduce(
                    (sum, e) => sum + e.totalIncomeAfterCommission + e.totalTips,
                    0,
                  ),
              )}
            </Text>
          </View>
        </View>

        {/* Employee Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Employee Performance</Text>

          {employeeBreakdown.length > 0 ? (
            employeeBreakdown.map((employee, index) => (
              <View key={employee.employeeId} style={styles.employeeItem}>
                <View style={styles.employeeRank}>
                  <Text style={styles.rankNumber}>#{index + 1}</Text>
                </View>

                <View style={styles.employeeInfo}>
                  <Text style={styles.employeeName}>{employee.employeeName}</Text>
                  <View style={styles.employeeStats}>
                    <Text style={styles.employeeStat}>{employee.totalServices} services</Text>
                    <MaterialIcons
                      name="keyboard-double-arrow-right"
                      style={styles.employeeStatDivider}
                    />
                    <Text style={styles.employeeStat}>{formatBDT(employee.totalTips)} tips</Text>
                  </View>
                  {/* Commission Earned */}
                  <View style={styles.earningsRow}>
                    <Text style={styles.earningsLabel}>
                      Commission ({employee.commissionPercentage ?? 0}%)
                    </Text>
                  </View>
                </View>

                <View style={styles.employeeAmount}>
                  <Text style={styles.employeeIncome}>{formatBDT(employee.totalIncome)}</Text>
                  {/* <Text style={styles.comtipsincome}>
                    {formatBDT(employee.totalIncomeAfterCommission + employee.totalTips)}
                  </Text> */}
                  <Text style={styles.comtipsincome}>
                    {formatBDT(employee.totalPrice - employee.totalIncomeAfterCommission)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>No employee data available</Text>
          )}
        </View>

        {/* Payment Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Methods</Text>

          {paymentBreakdown.length > 0 ? (
            <View>
              {/* Pie Graph (no external chart libs) */}
              <View style={styles.paymentPieWrapper}>
                <View style={styles.paymentPie}>
                  {(() => {
                    const sorted = paymentBreakdown.slice().sort((a, b) => b.total - a.total);

                    const total = Math.max(
                      sorted.reduce((s, x) => s + x.total, 0),
                      0,
                    );
                    if (total <= 0) return null;

                    const centerX = 0;
                    const centerY = 0;

                    // tighter pie for nicer visuals
                    const radius = 66;
                    const thickness = 10;

                    let cumulative = 0;
                    return sorted.map((p, idx) => {
                      const fraction = total > 0 ? p.total / total : 0;
                      const start = cumulative;
                      const end = cumulative + fraction;
                      cumulative = end;

                      const startDeg = start * 360 - 90;
                      const endDeg = end * 360 - 90;
                      const sweep = Math.max(endDeg - startDeg, 0.0001);

                      // tighter slice look: draw multiple radii per angle sample
                      const steps = Math.max(28, Math.floor(sweep));
                      const sliceSamples = 4;

                      return (
                        <React.Fragment key={idx}>
                          {Array.from({length: steps}).map((_, i) => {
                            const localDeg = startDeg + (i * sweep) / steps;
                            const theta = (localDeg * Math.PI) / 180;
                            const color = getPaymentMethodColor(p.method);

                            return (
                              <React.Fragment key={i}>
                                {Array.from({length: sliceSamples}).map((__, rIdx) => {
                                  // draw thickness by stepping inward radii
                                  const r = radius - rIdx * (thickness / sliceSamples);
                                  const x = centerX + Math.cos(theta) * r;
                                  const y = centerY + Math.sin(theta) * r;
                                  const size = 6;

                                  return (
                                    <View
                                      key={`${i}-${rIdx}`}
                                      style={[
                                        styles.paymentPieDot,
                                        {
                                          backgroundColor: color,
                                          width: size,
                                          height: size,
                                          borderRadius: size / 2,
                                          transform: [{translateX: x}, {translateY: y}],
                                        },
                                      ]}
                                    />
                                  );
                                })}
                              </React.Fragment>
                            );
                          })}
                        </React.Fragment>
                      );
                    });
                  })()}

                  <View style={styles.paymentPieCenter}>
                    <Text style={styles.paymentPieCenterTitle}>Total</Text>
                    <Text style={styles.paymentPieCenterValue}>{formatBDT(totalIncome)}</Text>
                  </View>
                </View>
              </View>

              {/* Legend */}
              <View style={styles.paymentLegend}>
                {paymentBreakdown
                  .slice()
                  .sort((a, b) => b.total - a.total)
                  .map((p, idx) => (
                    <View key={idx} style={styles.legendItem}>
                      <View
                        style={[
                          styles.legendDot,
                          {backgroundColor: getPaymentMethodColor(p.method)},
                        ]}
                      />
                      <View style={styles.legendColumn}>
                        <Text style={styles.legendText}>{getPaymentMethodLabel(p.method)}</Text>
                        <Text style={styles.legendSubText}>{p.percentage.toFixed(1)}%</Text>
                      </View>
                    </View>
                  ))}
              </View>
            </View>
          ) : (
            <Text style={styles.emptyText}>No payment data available</Text>
          )}
        </View>

        {/* Export Section
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📤 Export</Text>

onPress={_handleExport}
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
        </View> */}

        {/* Empty State
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
        )} */}
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
    padding: 6,
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
    paddingVertical: 1,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#242322',
    borderColor: '#000000',
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

  earningsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
    marginTop: 8,
  },
  earningsLabel: {
    fontSize: 13,
    color: '#333333',
    fontWeight: '500',
  },
  earningsValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4CAF50',
  },

  // New graph styles (Payment Methods)
  paymentGraphWrapper: {
    marginTop: 6,
  },
  paymentGraphRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 14,
  },
  paymentGraphLeft: {
    width: 110,
    paddingRight: 12,
  },
  paymentCountSmall: {
    marginTop: 6,
    fontSize: 12,
    color: '#757575',
    fontWeight: '500',
  },
  paymentGraphBarColumn: {
    flex: 1,
  },
  paymentGraphBarTrack: {
    height: 150,
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  paymentGraphBarFill: {
    width: '100%',
    borderRadius: 12,
  },
  paymentGraphBarMeta: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentGraphTotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212121',
  },
  paymentGraphPercent: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2196F3',
  },

  paymentPieWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },

  paymentPie: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  paymentPieDot: {
    position: 'absolute',
    left: '50%',
    top: '50%',
  },

  paymentPieCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },

  paymentPieCenterTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6B7280',
  },
  paymentPieCenterValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    marginTop: 6,
  },

  paymentLegend: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212121',
  },
  legendSubText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2196F3',
  },

  legendColumn: {
    flexDirection: 'column',
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
    color: '#000000',
    marginHorizontal: 6,
  },
  commission: {
    fontSize: 12,
    color: '#008000',
    fontWeight: '400',
  },
  employeeAmount: {
    alignItems: 'flex-end',
  },
  employeeIncome: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 10,
  },
  comtipsincome: {
    fontSize: 18,
    paddingVertical: 8,
    color: '#4CAF50',
    fontWeight: '700',
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
