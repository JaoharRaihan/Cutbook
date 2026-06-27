import React, {useState, useMemo} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useOrg, useData, useTheme, useLanguage} from '@/context';
import {PaymentMethod} from '@/types';
import {formatBDT, calculateEmployeeCommission} from '@/utils';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import {useThemedStyles} from '@/hooks/useThemedStyles';
import {ThemeColors} from '@/constants/theme';

type DateRange = 'today' | 'week' | 'month' | 'year' | 'custom';

interface EmployeeStats {
  employeeId: string;
  employeeName: string;
  totalServices: number;
  totalIncome: number;
  totalTips: number;
  totalPrice: number;
  totalIncomeAfterCommission: number;
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

export default function ReportsScreen({navigation: _navigation}: any): React.ReactElement {
  const {currentOrg, orgUsers} = useOrg();
  const {workEntries, expenses} = useData();
  const {isDarkMode, colors} = useTheme();
  const {language, t} = useLanguage();
  const styles = useThemedStyles(getStyles);

  const [dateRange, setDateRange] = useState<DateRange>('today');

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
      case 'month': {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        const end = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        return {start, end};
      }
      case 'year': {
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

  const filteredExpenses = useMemo(() => {
    const {start, end} = getDateRange(dateRange);
    return expenses.filter(e => {
      const expDate = new Date(e.createdAt);
      return expDate >= start && expDate < end;
    });
  }, [dateRange, expenses]);

  const totalExpensesAmount = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  // ============================================================================
  // COMPUTATIONS
  // ============================================================================

  const totalEntries = filteredEntries.length;
  const totalIncome = filteredEntries.reduce(
    (sum, entry) => sum + entry.price + (entry.tip || 0),
    0,
  );
  const totalTips = filteredEntries.reduce((sum, entry) => sum + (entry.tip || 0), 0);

  // Group by payment method
  const paymentBreakdown = useMemo((): PaymentStats[] => {
    const counts: {[key in PaymentMethod]?: number} = {};
    const totals: {[key in PaymentMethod]?: number} = {};

    filteredEntries.forEach(entry => {
      const method = entry.paymentMethod;
      counts[method] = (counts[method] || 0) + 1;
      totals[method] = (totals[method] || 0) + entry.price + (entry.tip || 0);
    });

    const total = filteredEntries.reduce((sum, entry) => sum + entry.price + (entry.tip || 0), 0);

    return Object.keys(totals).map(key => {
      const method = key as PaymentMethod;
      const count = counts[method] || 0;
      const amount = totals[method] || 0;
      return {
        method,
        count,
        total: amount,
        percentage: total > 0 ? (amount / total) * 100 : 0,
      };
    });
  }, [filteredEntries]);

  // Group by employee
  const employeeBreakdown = useMemo((): EmployeeStats[] => {
    const grouped: {
      [key: string]: Omit<
        EmployeeStats,
        'totalIncomeAfterCommission' | 'totalCommission' | 'avgPerService'
      >;
    } = {};

    filteredEntries.forEach(entry => {
      const id = entry.employeeId;
      const name = orgUsers.find(e => e.id === id)?.name || 'Unknown';

      if (!grouped[id]) {
        grouped[id] = {
          employeeId: id,
          employeeName: name,
          totalServices: 0,
          totalIncome: 0,
          totalTips: 0,
          totalPrice: 0,
        };
      }

      grouped[id].totalServices += 1;
      grouped[id].totalIncome += entry.price + (entry.tip || 0);
      grouped[id].totalTips += entry.tip || 0;
      grouped[id].totalPrice += entry.price;
    });

    return Object.keys(grouped)
      .map(id => {
        const stats = grouped[id];
        const employee = orgUsers.find(e => e.id === id);
        const commissionPercentage = employee?.commissionPercentage || 0;

        // Calculate commission entry-by-entry based on org commission mode
        const employeeEntries = filteredEntries.filter(entry => entry.employeeId === id);
        let commissionAmount = 0;
        if (currentOrg) {
          employeeEntries.forEach(entry => {
            commissionAmount += calculateEmployeeCommission(
              entry.price,
              currentOrg,
              commissionPercentage,
            );
          });
        }
        const roundedCommissionAmount = Math.round(commissionAmount);
        const roundedTotalIncomeAfterCommission = stats.totalPrice - roundedCommissionAmount;

        return {
          ...stats,
          totalIncomeAfterCommission: roundedTotalIncomeAfterCommission,
          totalCommission: roundedCommissionAmount,
          avgPerService: stats.totalServices > 0 ? stats.totalIncome / stats.totalServices : 0,
          commissionPercentage,
        };
      })
      .sort((a, b) => b.totalIncome - a.totalIncome);
  }, [filteredEntries, orgUsers, currentOrg]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const getPaymentMethodColor = (method: PaymentMethod): string => {
    switch (method) {
      case PaymentMethod.CASH:
        return colors.payment.cash;
      case PaymentMethod.BKASH:
        return colors.payment.bkash;
      case PaymentMethod.CARD:
        return colors.payment.card;
      case PaymentMethod.NAGAD:
        return colors.payment.nagad;
      default:
        return colors.payment.other;
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod): string => {
    switch (method) {
      case PaymentMethod.CASH:
        return t.payment.cash;
      case PaymentMethod.BKASH:
        return t.payment.bkash;
      case PaymentMethod.CARD:
        return t.payment.card;
      case PaymentMethod.NAGAD:
        return t.payment.nagad;
      default:
        return method;
    }
  };

  const getRangeLabel = (range: DateRange): string => {
    switch (range) {
      case 'today':
        return t.common.today;
      case 'week':
        return language === 'en'
          ? 'Last 7 Days'
          : language === 'bn'
            ? 'গত ৭ দিন'
            : language === 'es'
              ? 'Últimos 7 días'
              : 'पिछले 7 दिन';
      case 'month':
        return language === 'en'
          ? 'Last 30 Days'
          : language === 'bn'
            ? 'গত ৩০ দিন'
            : language === 'es'
              ? 'Últimos 30 días'
              : 'पिछले 30 दिन';
      case 'year':
        return language === 'en'
          ? 'This Year'
          : language === 'bn'
            ? 'এই বছর'
            : language === 'es'
              ? 'Este Año'
              : 'इस साल';
      default:
        return t.common.custom;
    }
  };

  // const handleExportCSV = async () => {
  //   try {
  //     let csvContent = 'Date,Type,Name,Employee,Amount,Tip,Payment Method,Notes\n';

  //     // Filtered entries
  //     filteredEntries.forEach(entry => {
  //       const dateStr = new Date(entry.createdAt).toISOString().split('T')[0];
  //       const typeStr = 'Service';
  //       const nameStr = `"${entry.serviceName.replace(/"/g, '""')}"`;
  //       const empStr = `"${(orgUsers.find(e => e.id === entry.employeeId)?.name || 'Unknown').replace(/"/g, '""')}"`;
  //       const amountStr = entry.price;
  //       const tipStr = entry.tip || 0;
  //       const pmStr = entry.paymentMethod;
  //       const notesStr = `"${(entry.note || '').replace(/"/g, '""')}"`;

  //       csvContent += `${dateStr},${typeStr},${nameStr},${empStr},${amountStr},${tipStr},${pmStr},${notesStr}\n`;
  //     });

  //     // Filtered expenses
  //     filteredExpenses.forEach(exp => {
  //       const dateStr = new Date(exp.createdAt).toISOString().split('T')[0];
  //       const typeStr = 'Expense';
  //       const nameStr = `"${exp.name.replace(/"/g, '""')}"`;
  //       const empStr = `"${(exp.createdByName || '').replace(/"/g, '""')}"`;
  //       const amountStr = exp.amount;
  //       const tipStr = 0;
  //       const pmStr = 'N/A';
  //       const notesStr = '';

  //       csvContent += `${dateStr},${typeStr},${nameStr},${empStr},${amountStr},${tipStr},${pmStr},${notesStr}\n`;
  //     });

  //     await Share.share({
  //       message: csvContent,
  //       title: 'CutBook_Report.csv',
  //     });
  //   } catch (error: any) {
  //     Alert.alert(t.common.error, error.message);
  //   }
  // };

  // ============================================================================
  // RENDER METHODS
  // ============================================================================

  const renderDateFilter = () => {
    const ranges: {value: DateRange; label: string}[] = [
      {value: 'today', label: t.common.today},
      {value: 'week', label: t.common.thisWeek},
      {value: 'month', label: t.common.thisMonth},
      {
        value: 'year',
        label:
          language === 'en'
            ? 'This Year'
            : language === 'bn'
              ? 'এই বছর'
              : language === 'es'
                ? 'Este Año'
                : 'इस साल',
      },
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
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background.paper}
      />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{t.reports.title}</Text>
          <Text style={styles.headerSubtitle}>
            {getRangeLabel(dateRange)} • {currentOrg?.name}
          </Text>
        </View>
      </View>

      {/* Date Filter Sticky at Top */}
      {renderDateFilter()}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Summary Cards Grid */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, styles.summaryCardPrimary]}>
              <View style={styles.summaryCardHeader}>
                <Text style={styles.summaryLabel}>{t.reports.totalEntries}</Text>
                <MaterialIcons name="sticky-note-2" size={20} color={colors.primary[500]} />
              </View>
              <Text style={styles.summaryValue}>{totalEntries}</Text>
            </View>
            <View style={styles.summaryCard}>
              <View style={styles.summaryCardHeader}>
                <Text style={styles.summaryLabel}>
                  {language === 'en'
                    ? 'Total Income & Tips'
                    : language === 'bn'
                      ? 'মোট আয় ও টিপস'
                      : language === 'es'
                        ? 'Ingresos y Propinas Totales'
                        : 'कुल आय और टिप्स'}
                </Text>
                <MaterialIcons name="bar-chart" size={20} color={colors.success.main} />
              </View>
              <Text style={styles.summaryValue}>{formatBDT(totalIncome)}</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={styles.summaryCard}>
              <View style={styles.summaryCardHeader}>
                <Text style={styles.summaryLabel}>
                  {language === 'en'
                    ? 'Total Tips'
                    : language === 'bn'
                      ? 'মোট টিপস'
                      : language === 'es'
                        ? 'Propinas Totales'
                        : 'कुल टिप्स'}
                </Text>
                <MaterialIcons name="tips-and-updates" size={20} color={colors.warning.dark} />
              </View>
              <Text style={styles.summaryValue}>{formatBDT(totalTips)}</Text>
            </View>
            <View style={[styles.summaryCard, styles.summaryCardPrimary]}>
              <View style={styles.summaryCardHeader}>
                <Text style={styles.summaryLabel}>{t.reports.totalRevenue}</Text>
                <MaterialIcons name="attach-money" size={20} color={colors.success.main} />
              </View>
              <Text style={styles.summaryValue}>{formatBDT(totalIncome - totalTips)}</Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, styles.summaryCardPrimary]}>
              <View style={styles.summaryCardHeader}>
                <Text style={styles.summaryLabel}>
                  {language === 'en'
                    ? 'Salon Gross Earnings'
                    : language === 'bn'
                      ? 'সেলুনের মোট উপার্জন'
                      : language === 'es'
                        ? 'Ganancias Brutas de Salón'
                        : 'सैलून की कुल कमाई'}
                </Text>
                <MaterialIcons name="account-balance" size={20} color={colors.primary[500]} />
              </View>
              <Text style={styles.summaryValue}>
                {formatBDT(
                  employeeBreakdown.reduce((sum, e) => sum + e.totalIncomeAfterCommission, 0),
                )}
              </Text>
            </View>
            <View style={styles.summaryCard}>
              <View style={styles.summaryCardHeader}>
                <Text style={styles.summaryLabel}>
                  {language === 'en'
                    ? 'Employees Earnings'
                    : language === 'bn'
                      ? 'কর্মীদের উপার্জন'
                      : language === 'es'
                        ? 'Ganancias de Empleados'
                        : 'कर्मचारियों की कमाई'}
                </Text>
                <MaterialIcons name="people" size={20} color={colors.primary[500]} />
              </View>
              <Text style={styles.summaryValue}>
                {formatBDT(
                  employeeBreakdown.reduce((sum, e) => sum + e.totalCommission + e.totalTips, 0),
                )}
              </Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={[styles.summaryCard, styles.summaryCardExpense]}>
              <View style={styles.summaryCardHeader}>
                <Text style={[styles.summaryLabel, {color: colors.error.main}]}>
                  {language === 'en'
                    ? 'Salon Expenses'
                    : language === 'bn'
                      ? 'সেলুনের খরচ'
                      : language === 'es'
                        ? 'Gastos del Salón'
                        : 'सैलून खर्च'}
                </Text>
                <MaterialIcons name="shopping-bag" size={20} color={colors.error.main} />
              </View>
              <Text style={[styles.summaryValue, {color: colors.error.main}]}>
                {formatBDT(totalExpensesAmount)}
              </Text>
            </View>
            <View style={[styles.summaryCard, styles.summaryCardNet]}>
              <View style={styles.summaryCardHeader}>
                <Text style={[styles.summaryLabel, {color: colors.success.main}]}>
                  {language === 'en'
                    ? 'Salon Net Earnings'
                    : language === 'bn'
                      ? 'সেলুনের নেট উপার্জন'
                      : language === 'es'
                        ? 'Ganancias Netas de Salón'
                        : 'सैलून की शुद्ध कमाई'}
                </Text>
                <MaterialIcons name="account-balance" size={20} color={colors.success.main} />
              </View>
              <Text style={[styles.summaryValue, {color: colors.success.main}]}>
                {formatBDT(
                  employeeBreakdown.reduce((sum, e) => sum + e.totalIncomeAfterCommission, 0) -
                    totalExpensesAmount,
                )}
              </Text>
            </View>
          </View>
        </View>

        {/* Employee Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.reports.byEmployee}</Text>

          {employeeBreakdown.length > 0 ? (
            employeeBreakdown.map((employee, index) => (
              <View key={employee.employeeId} style={styles.employeeItem}>
                <View style={styles.employeeRank}>
                  <Text style={styles.rankNumber}>#{index + 1}</Text>
                </View>

                <View style={styles.employeeInfo}>
                  <Text style={styles.employeeName}>{employee.employeeName}</Text>
                  <View style={styles.employeeStats}>
                    <Text style={styles.employeeStat}>
                      {employee.totalServices}{' '}
                      {language === 'en'
                        ? 'services'
                        : language === 'bn'
                          ? 'টি সেবা'
                          : language === 'es'
                            ? 'servicios'
                            : 'सेवाएं'}
                    </Text>
                    <MaterialIcons
                      name="keyboard-double-arrow-right"
                      size={14}
                      color={colors.text.hint}
                      style={styles.employeeStatDivider}
                    />
                    <Text style={styles.employeeStat}>
                      {formatBDT(employee.totalTips)}{' '}
                      {language === 'en'
                        ? 'tips'
                        : language === 'bn'
                          ? 'টিপস'
                          : language === 'es'
                            ? 'propinas'
                            : 'टिप्स'}
                    </Text>
                  </View>
                  {/* Commission info */}
                  <View style={styles.earningsRow}>
                    <Text style={styles.earningsLabel}>
                      {t.employees.commission} (
                      {currentOrg?.defaultCommissionMode === 'fixed'
                        ? formatBDT(employee.commissionPercentage ?? 0, true, 0)
                        : `${employee.commissionPercentage ?? 0}%`}
                      )
                    </Text>
                  </View>
                </View>

                <View style={styles.employeeAmount}>
                  <Text style={styles.employeeIncome}>{formatBDT(employee.totalIncome)}</Text>
                  <Text style={styles.comtipsincome}>
                    {language === 'en' ? 'Comm: ' : 'কমিশন: '}
                    {formatBDT(employee.totalCommission)}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.emptyText}>{t.reports.noData}</Text>
          )}
        </View>

        {/* Payment Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.reports.byPayment}</Text>

          {paymentBreakdown.length > 0 ? (
            <View>
              {paymentBreakdown.map((payment, idx) => (
                <View key={idx} style={styles.paymentItem}>
                  <View style={styles.paymentHeader}>
                    <Text style={styles.paymentMethod}>
                      {getPaymentMethodLabel(payment.method)}
                    </Text>
                    <Text style={styles.paymentCount}>
                      {payment.count} {totalEntries === 1 ? 'entry' : 'entries'}
                    </Text>
                  </View>
                  <View style={styles.paymentBarContainer}>
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
                    <Text
                      style={[
                        styles.paymentPercentage,
                        {color: getPaymentMethodColor(payment.method)},
                      ]}>
                      {payment.percentage.toFixed(1)}%
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <Text style={styles.emptyText}>{t.reports.noData}</Text>
          )}
        </View>

        {/* CSV Export Area */}
        {/* <View style={styles.section}>
          <TouchableOpacity
            style={styles.exportButton}
            activeOpacity={0.7}
            onPress={handleExportCSV}>
            <View style={styles.exportButtonContent}>
              <Text style={styles.exportButtonIcon}>📥</Text>
              <View style={styles.exportButtonText}>
                <Text style={styles.exportButtonTitle}>{t.dashboard.exportReport}</Text>
                <Text style={styles.exportButtonSubtitle}>
                  {language === 'en'
                    ? 'Save all logs as CSV spreadsheet'
                    : language === 'bn'
                      ? 'সমস্ত লগ CSV স্প্রেডশীট হিসাবে সংরক্ষণ করুন'
                      : language === 'es'
                        ? 'Guardar todos los registros como hoja de cálculo CSV'
                        : 'सभी लॉग को CSV स्प्रेडशीट के रूप में सहेजें'}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        </View> */}
      </ScrollView>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors, isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.default,
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: colors.background.paper,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text.primary,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.text.secondary,
      marginTop: 4,
    },
    filterContainer: {
      backgroundColor: colors.background.paper,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    dateFilters: {
      flexDirection: 'row',
      gap: 8,
    },
    filterButton: {
      paddingHorizontal: 14,
      paddingVertical: 4,
      borderRadius: 20,
      backgroundColor: colors.background.default,
      borderWidth: 1,
      borderColor: colors.border.main,
    },
    filterButtonActive: {
      backgroundColor: colors.primary[500],
      borderColor: colors.primary[500],
    },
    filterButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text.secondary,
    },
    filterButtonTextActive: {
      color: '#FFFFFF',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
    },
    summaryContainer: {
      marginTop: 16,
      marginBottom: 16,
      gap: 12,
    },
    summaryRow: {
      flexDirection: 'row',
      gap: 12,
    },
    summaryCardHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: colors.background.paper,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border.light,
      minHeight: 110,
      justifyContent: 'space-between',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: isDarkMode ? 0.2 : 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    summaryCardPrimary: {
      borderColor: colors.border.main,
    },
    summaryIcon: {
      fontSize: 24,
      color: colors.primary[500],
      marginBottom: 8,
    },
    summaryLabel: {
      fontSize: 11,
      color: colors.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      fontWeight: '600',
      flex: 1,
      marginRight: 6,
    },
    summaryValue: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text.primary,
    },
    section: {
      backgroundColor: colors.background.paper,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border.light,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: isDarkMode ? 0.2 : 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: 16,
    },
    paymentItem: {
      marginBottom: 16,
    },
    paymentHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    paymentMethod: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text.primary,
    },
    paymentCount: {
      fontSize: 13,
      color: colors.text.secondary,
    },
    paymentBarContainer: {
      height: 8,
      backgroundColor: colors.background.default,
      borderRadius: 4,
      marginBottom: 8,
      overflow: 'hidden',
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
      color: colors.text.primary,
    },
    paymentPercentage: {
      fontSize: 14,
      fontWeight: '600',
    },
    employeeItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    employeeRank: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.background.default,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    rankNumber: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text.secondary,
    },
    employeeInfo: {
      flex: 1,
    },
    employeeName: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 4,
    },
    employeeStats: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    employeeStat: {
      fontSize: 13,
      color: colors.text.secondary,
    },
    employeeStatDivider: {
      marginHorizontal: 6,
    },
    earningsRow: {
      marginTop: 2,
    },
    earningsLabel: {
      fontSize: 12,
      color: colors.text.hint,
    },
    employeeAmount: {
      alignItems: 'flex-end',
    },
    employeeIncome: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.success.main,
      marginBottom: 4,
    },
    comtipsincome: {
      fontSize: 14,
      color: colors.text.secondary,
      fontWeight: '600',
    },
    exportButton: {
      backgroundColor: isDarkMode ? colors.neutral[100] : colors.primary[50],
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.primary[500],
    },
    exportButtonContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16,
    },
    exportButtonIcon: {
      fontSize: 32,
      marginRight: 16,
    },
    exportButtonText: {
      flex: 1,
    },
    exportButtonTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDarkMode ? colors.text.primary : colors.primary[700],
      marginBottom: 4,
    },
    exportButtonSubtitle: {
      fontSize: 13,
      color: isDarkMode ? colors.text.secondary : colors.primary[700],
    },
    emptyText: {
      fontSize: 14,
      color: colors.text.hint,
      textAlign: 'center',
      paddingVertical: 20,
    },
    summaryCardExpense: {
      borderColor: colors.error.main,
      backgroundColor: isDarkMode ? 'rgba(244, 67, 54, 0.08)' : '#FFEBEE',
    },
    summaryCardNet: {
      borderColor: colors.success.main,
      backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.08)' : '#E8F5E9',
    },
  });
