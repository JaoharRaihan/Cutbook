import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useOrg, useData, useTheme, useLanguage} from '@/context';
import {WorkEntry} from '@/types';
import {formatBDT, calculateEmployeeCommission} from '@/utils';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import {useThemedStyles} from '@/hooks/useThemedStyles';
import {ThemeColors} from '@/constants/theme';

type DateFilter = 'today' | 'week' | 'month' | 'year';

export default function WorkEntriesScreen({navigation}: any): React.ReactElement {
  const {currentOrg, orgUsers, employeeTransactions} = useOrg();
  const {workEntries, expenses, refreshData} = useData();
  const {isDarkMode, colors} = useTheme();
  const {language, t} = useLanguage();
  const styles = useThemedStyles(getStyles);

  const [refreshing, setRefreshing] = useState(false);
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);

  const formatTime = (d: Date): string => {
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const formatTxnDate = (d: Date): string => {
    const dateStr = d.toLocaleDateString([], {month: 'short', day: 'numeric'});
    return `${dateStr} • ${formatTime(d)}`;
  };

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
        return {start: today, end: new Date(today.getTime() + 24 * 60 * 60 * 1000)};
    }
  };

  const unifiedTransactions = useMemo(() => {
    const {start, end} = getDateRange(dateFilter);

    // 1. Work Entries
    let entries = [...workEntries];
    entries = entries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      return entry.orgId === currentOrg?.id && entryDate >= start && entryDate < end;
    });
    if (selectedEmployee) {
      entries = entries.filter(entry => entry.employeeId === selectedEmployee);
    }
    const entriesTxns = entries.map(entry => ({
      id: entry.id,
      type: 'entry' as const,
      name: entry.serviceName || 'Service',
      employeeName: entry.employeeName,
      amount: entry.price + (entry.tip || 0),
      date: new Date(entry.createdAt),
      raw: entry,
    }));

    // 2. Expenses (only show if no employee is selected)
    let expensesTxns: any[] = [];
    if (!selectedEmployee) {
      const filteredExpenses = (expenses || []).filter(e => {
        const expDate = new Date(e.createdAt);
        return e.orgId === currentOrg?.id && expDate >= start && expDate < end;
      });
      expensesTxns = filteredExpenses.map(expense => ({
        id: expense.id,
        type: 'expense' as const,
        name: expense.name,
        employeeName: expense.createdByName || '',
        amount: expense.amount,
        date: new Date(expense.createdAt),
      }));
    }

    // 3. Accepted Payouts (Employee Transactions)
    let payouts = (employeeTransactions || []).filter(p => {
      if (p.status !== 'accepted') return false;
      const payoutDate = new Date(p.createdAt);
      return p.orgId === currentOrg?.id && payoutDate >= start && payoutDate < end;
    });
    if (selectedEmployee) {
      payouts = payouts.filter(p => p.employeeId === selectedEmployee);
    }
    const payoutsTxns = payouts.map(payout => ({
      id: payout.id,
      type: 'payout' as const,
      name: payout.employeeName,
      employeeName: payout.employeeName,
      amount: payout.amount,
      date: new Date(payout.createdAt),
    }));

    // Combine and sort by date descending
    const combined = [...entriesTxns, ...expensesTxns, ...payoutsTxns];
    combined.sort((a, b) => b.date.getTime() - a.date.getTime());

    return combined;
  }, [dateFilter, selectedEmployee, workEntries, expenses, employeeTransactions, currentOrg?.id]);

  // ============================================================================
  // CALCULATIONS
  // ============================================================================

  const totalIncome = useMemo(() => {
    return unifiedTransactions
      .filter(txn => txn.type === 'entry')
      .reduce((sum, txn: any) => sum + txn.amount, 0);
  }, [unifiedTransactions]);

  const totalTips = useMemo(() => {
    return unifiedTransactions
      .filter(txn => txn.type === 'entry')
      .reduce((sum, txn: any) => sum + (txn.raw.tip || 0), 0);
  }, [unifiedTransactions]);

  const totalExpensesAmount = useMemo(() => {
    return unifiedTransactions
      .filter(txn => txn.type === 'expense')
      .reduce((sum, txn: any) => sum + txn.amount, 0);
  }, [unifiedTransactions]);

  const totalPayoutsAmount = useMemo(() => {
    return unifiedTransactions
      .filter(txn => txn.type === 'payout')
      .reduce((sum, txn: any) => sum + txn.amount, 0);
  }, [unifiedTransactions]);

  // Calculate employee earnings breakdown
  const employeeEarnings = useMemo(() => {
    if (!selectedEmployee) return null;

    const employee = orgUsers.find(e => e.id === selectedEmployee);
    if (!employee) return null;

    // Commission from work entries computed entry-by-entry based on org commission settings
    const employeeCommissionValue = employee.commissionPercentage || 0;
    const employeeEntries = unifiedTransactions.filter(
      txn => txn.type === 'entry' && txn.raw.employeeId === selectedEmployee,
    );
    let commission = 0;
    if (currentOrg) {
      employeeEntries.forEach(txn => {
        commission += calculateEmployeeCommission(
          txn.raw.price,
          currentOrg,
          employeeCommissionValue,
        );
      });
    }
    commission = Math.round(commission);

    return {
      commissionPercentage: employeeCommissionValue,
      commission,
      acceptedPayouts: totalPayoutsAmount,
      netAmount: commission + totalTips - totalPayoutsAmount,
      employeeName: employee.name,
    };
  }, [selectedEmployee, unifiedTransactions, currentOrg, orgUsers, totalTips, totalPayoutsAmount]);

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

  // const getEmployeeName = (employeeId: string): string => {
  //   const employee = orgUsers.find(e => e.id === employeeId);
  //   return employee ? employee.name : 'Unknown';
  // };

  // ============================================================================
  // RENDER METHODS
  // ============================================================================

  const renderDateFilter = () => {
    const filters: {value: DateFilter; label: string}[] = [
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
        <Text style={styles.filterLabel}>
          {language === 'en'
            ? 'Filter by Employee:'
            : language === 'bn'
              ? 'কর্মী দ্বারা ফিল্টার করুন:'
              : language === 'es'
                ? 'Filtrar por Empleado:'
                : 'कर्मचारी द्वारा फ़िल्टर करें:'}
        </Text>
        <View style={styles.employeeChips}>
          <TouchableOpacity
            style={[styles.employeeChip, !selectedEmployee && styles.employeeChipActive]}
            onPress={() => setSelectedEmployee(null)}>
            <Text
              style={[styles.employeeChipText, !selectedEmployee && styles.employeeChipTextActive]}>
              {t.common.all}
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
    if (selectedEmployee) return null;

    const netRevenue = totalIncome - totalExpensesAmount - totalPayoutsAmount;

    return (
      <View style={styles.summaryContainer}>
        <View style={styles.revenueMainCard}>
          <Text style={styles.revenueMainLabel}>
            {language === 'en'
              ? 'Net Revenue'
              : language === 'bn'
                ? 'নেট রাজস্ব'
                : language === 'es'
                  ? 'Ingresos Netos'
                  : 'नेट राजस्व'}
          </Text>
          <Text style={[styles.revenueMainValue, netRevenue < 0 && styles.negativeAmount]}>
            {formatBDT(netRevenue)}
          </Text>
        </View>

        <View style={styles.summaryRowGrid}>
          <View style={styles.summaryMiniCard}>
            <Text style={styles.summaryMiniLabel}>{t.employees.totalIncome}</Text>
            <Text style={[styles.summaryMiniValue, {color: colors.success.main}]}>
              {formatBDT(totalIncome - totalTips)}
            </Text>
          </View>
          <View style={styles.summaryMiniCard}>
            <Text style={styles.summaryMiniLabel}>
              {language === 'en'
                ? 'Tips'
                : language === 'bn'
                  ? 'টিপস'
                  : language === 'es'
                    ? 'Propinas'
                    : 'टिप्स'}
            </Text>
            <Text style={[styles.summaryMiniValue, {color: colors.warning.dark}]}>
              {formatBDT(totalTips)}
            </Text>
          </View>
        </View>

        <View style={styles.summaryRowGrid}>
          <View style={styles.summaryMiniCard}>
            <Text style={styles.summaryMiniLabel}>{t.tabs.expenses}</Text>
            <Text style={[styles.summaryMiniValue, {color: colors.error.main}]}>
              -{formatBDT(totalExpensesAmount)}
            </Text>
          </View>
          <View style={styles.summaryMiniCard}>
            <Text style={styles.summaryMiniLabel}>
              {language === 'en'
                ? 'Payouts'
                : language === 'bn'
                  ? 'পে-আউট'
                  : language === 'es'
                    ? 'Pagos'
                    : 'पेआउट'}
            </Text>
            <Text style={[styles.summaryMiniValue, {color: colors.warning.dark}]}>
              -{formatBDT(totalPayoutsAmount)}
            </Text>
          </View>
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
            {employeeEarnings.employeeName}
            {language === 'en'
              ? "'s Earnings"
              : language === 'bn'
                ? ' এর উপার্জন'
                : language === 'es'
                  ? ` - Ganancias`
                  : ` की कमाई`}
          </Text>

          <View style={styles.earningsRow}>
            <Text style={styles.earningsLabel}>
              {t.employees.commission} (
              {currentOrg?.defaultCommissionMode === 'fixed'
                ? formatBDT(employeeEarnings.commissionPercentage, true, 0)
                : `${employeeEarnings.commissionPercentage}%`}
              )
            </Text>
            <Text style={styles.earningsValue}>{formatBDT(employeeEarnings.commission)}</Text>
          </View>

          <View style={styles.earningsRow}>
            <Text style={styles.earningsLabel}>
              {language === 'en'
                ? 'Tips'
                : language === 'bn'
                  ? 'টিপস'
                  : language === 'es'
                    ? 'Propinas'
                    : 'टिप्स'}
            </Text>
            <Text style={styles.earningsValue}>{formatBDT(totalTips)}</Text>
          </View>

          <View style={styles.earningsRow}>
            <Text style={styles.earningsLabel}>
              {language === 'en'
                ? 'Minus: Payouts'
                : language === 'bn'
                  ? 'বিয়োগ: পে-আউট'
                  : language === 'es'
                    ? 'Menos: Pagos'
                    : 'घटाएं: पेआउट'}
            </Text>
            <Text style={[styles.earningsValue, styles.payoutValue]}>
              -{formatBDT(employeeEarnings.acceptedPayouts)}
            </Text>
          </View>

          <View style={[styles.earningsRow, styles.netAmountRow]}>
            <Text style={[styles.earningsLabel, styles.netAmountLabel]}>
              {language === 'en'
                ? 'Net Amount'
                : language === 'bn'
                  ? 'নেট পরিমাণ'
                  : language === 'es'
                    ? 'Cantidad Neta'
                    : 'नेट राशि'}
            </Text>
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
        <MaterialIcons
          name="addchart"
          style={styles.emptyIcon}
          color={colors.text.hint}
          size={40}
        />
        <Text style={styles.emptyTitle}>{t.workEntries.noEntries}</Text>
        <Text style={styles.emptySubtitle}>
          {selectedEmployee
            ? language === 'en'
              ? 'This employee has no transactions for the selected period'
              : language === 'bn'
                ? 'নির্বাচিত সময়ের জন্য এই কর্মীর কোন লেনদেন নেই'
                : language === 'es'
                  ? 'Este empleado no tiene transacciones para el período seleccionado'
                  : 'चयनित अवधि के लिए इस कर्मचारी की कोई लेनदेन नहीं है'
            : language === 'en'
              ? 'No transactions for the selected date range'
              : language === 'bn'
                ? 'নির্বাচিত তারিখ পরিসীমার জন্য কোন লেনদেন নেই'
                : language === 'es'
                  ? 'No hay transacciones para el rango de fechas seleccionado'
                  : 'चयनित तिथि सीमा के लिए कोई लेनदेन नहीं है'}
        </Text>
        <TouchableOpacity style={styles.emptyButton} onPress={handleAddEntry}>
          <Text style={styles.emptyButtonText}>{t.workEntries.addEntry}</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background.paper}
      />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.workEntries.title}</Text>
        <Text style={styles.headerSubtitle}>{currentOrg?.name}</Text>
      </View>
      {renderDateFilter()}
      {renderEmployeeFilter()}

      <FlatList
        data={unifiedTransactions}
        keyExtractor={item => item.id + '-' + item.type}
        ListHeaderComponent={
          <View>
            {renderSummary()}
            {renderEmployeeEarnings()}
          </View>
        }
        renderItem={({item}: {item: any}) => {
          const isEntry = item.type === 'entry';
          const isExpense = item.type === 'expense';
          const isPayout = item.type === 'payout';

          let iconName = 'receipt';
          let iconColor = colors.success.main;
          let amountPrefix = '+';
          let amountColor = colors.success.main;
          let typeLabel = '';
          let details = '';

          if (isEntry) {
            iconName = 'content-cut';
            iconColor = colors.success.main;
            typeLabel =
              language === 'en'
                ? 'Service'
                : language === 'bn'
                  ? 'সেবা'
                  : language === 'es'
                    ? 'Servicio'
                    : 'सेवा';
            const payMethod = item.raw.paymentMethod;
            const payLabel =
              payMethod === 'cash'
                ? t.payment.cash
                : payMethod === 'bkash'
                  ? t.payment.bkash
                  : payMethod === 'nagad'
                    ? t.payment.nagad
                    : payMethod === 'card'
                      ? t.payment.card
                      : payMethod;
            details = `${payLabel} • By ${item.employeeName}`;
          } else if (isExpense) {
            iconName = 'shopping-bag';
            iconColor = colors.error.main;
            typeLabel =
              language === 'en'
                ? 'Expense'
                : language === 'bn'
                  ? 'খরচ'
                  : language === 'es'
                    ? 'Gasto'
                    : 'खर्च';
            amountPrefix = '-';
            amountColor = colors.error.main;
            details = item.employeeName ? `By ${item.employeeName}` : '';
          } else {
            iconName = 'account-balance-wallet';
            iconColor = colors.secondary[500];
            typeLabel =
              language === 'en'
                ? 'Payout'
                : language === 'bn'
                  ? 'পে-আউট'
                  : language === 'es'
                    ? 'Pago'
                    : 'পেআউট';
            amountPrefix = '-';
            amountColor = colors.secondary[500];
            details =
              language === 'en'
                ? `To ${item.name}`
                : language === 'bn'
                  ? `${item.name} কে`
                  : language === 'es'
                    ? `A ${item.name}`
                    : `${item.name} को`;
          }

          return (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => {
                if (isEntry) {
                  handleEntryPress(item.raw);
                } else if (isExpense) {
                  Alert.alert(
                    t.tabs.expenses,
                    `${language === 'en' ? 'Name' : 'নাম'}: ${item.name}\n${language === 'en' ? 'Amount' : 'পরিমাণ'}: ${formatBDT(item.amount)}\n${language === 'en' ? 'Recorded By' : 'রেকর্ড করেছেন'}: ${item.employeeName || 'System'}\n${language === 'en' ? 'Date' : 'তারিখ'}: ${item.date.toLocaleString()}`,
                  );
                } else {
                  Alert.alert(
                    language === 'en' ? 'Employee Payout' : 'কর্মীর পে-আউট',
                    `${language === 'en' ? 'Employee' : 'কর্মী'}: ${item.name}\n${language === 'en' ? 'Amount Paid' : 'প্রদত্ত পরিমাণ'}: ${formatBDT(item.amount)}\n${language === 'en' ? 'Date' : 'তারিখ'}: ${item.date.toLocaleString()}`,
                  );
                }
              }}
              style={styles.customTxnCard}>
              <View style={styles.txnLeft}>
                <View
                  style={[
                    styles.txnIconBg,
                    {
                      backgroundColor: isEntry
                        ? 'rgba(76, 175, 80, 0.1)'
                        : isExpense
                          ? 'rgba(244, 67, 54, 0.1)'
                          : 'rgba(255, 152, 0, 0.1)',
                    },
                  ]}>
                  <MaterialIcons name={iconName as any} size={24} color={iconColor} />
                </View>
                <View style={styles.txnTextContainer}>
                  <Text style={styles.txnTitleText} numberOfLines={1}>
                    {isEntry
                      ? item.name
                      : isPayout
                        ? language === 'en'
                          ? 'Payout to ' + item.name
                          : language === 'bn'
                            ? item.name + ' কে পে-আউট'
                            : 'Pago a ' + item.name
                        : item.name}
                  </Text>
                  <Text style={styles.txnSubtitleText}>
                    {typeLabel} • {details}
                  </Text>
                </View>
              </View>
              <View style={styles.txnRight}>
                <Text style={[styles.txnAmountText, {color: amountColor}]}>
                  {amountPrefix}
                  {formatBDT(item.amount)}
                </Text>
                <Text style={styles.txnDateText}>{formatTxnDate(item.date)}</Text>
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary[500]]}
            tintColor={colors.primary[500]}
          />
        }
        ListEmptyComponent={renderEmptyState()}
      />

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleAddEntry}>
        <MaterialIcons name="add" size={32} color="#FFFFFF" />
      </TouchableOpacity>
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
      backgroundColor: isDarkMode ? colors.background.paper : '#FFFFFF',
      paddingHorizontal: 20,
      paddingVertical: 16,
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
    employeeFilterContainer: {
      backgroundColor: colors.background.paper,
      paddingVertical: 6,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    filterLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text.primary,
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
      backgroundColor: colors.background.default,
      borderWidth: 1,
      borderColor: colors.border.main,
    },
    employeeChipActive: {
      backgroundColor: colors.primary[500],
      borderColor: colors.primary[500],
    },
    employeeChipText: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.text.secondary,
    },
    employeeChipTextActive: {
      color: '#ffffff',
      fontWeight: '600',
    },
    summaryContainer: {
      paddingHorizontal: 0,
      paddingTop: 16,
      paddingBottom: 8,
      gap: 12,
    },
    summaryCard: {
      flex: 1,
      backgroundColor: colors.background.paper,
      borderRadius: 12,
      padding: 12,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    summaryLabel: {
      fontSize: 12,
      color: colors.text.secondary,
      marginBottom: 4,
      textAlign: 'center',
    },
    summaryValue: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text.primary,
    },
    earningsContainer: {
      paddingHorizontal: 0,
      paddingBottom: 16,
    },
    earningsSection: {
      backgroundColor: isDarkMode ? colors.neutral[100] : '#FFF9C4',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: isDarkMode ? colors.border.light : '#FBC02D',
    },
    earningsTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: isDarkMode ? colors.text.primary : '#F57F17',
      marginBottom: 12,
    },
    earningsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? colors.border.light : '#FFE082',
    },
    earningsLabel: {
      fontSize: 13,
      color: colors.text.secondary,
      fontWeight: '500',
    },
    earningsValue: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text.primary,
    },
    payoutValue: {
      color: colors.warning.main,
    },
    netAmountRow: {
      borderBottomWidth: 0,
      paddingVertical: 12,
      backgroundColor: isDarkMode ? colors.neutral[200] : '#FFF59D',
      marginTop: 4,
      paddingHorizontal: 8,
      borderRadius: 8,
    },
    netAmountLabel: {
      color: isDarkMode ? colors.text.primary : '#F57F17',
      fontWeight: '700',
      fontSize: 14,
    },
    netAmountValue: {
      fontSize: 18,
      color: colors.text.primary,
    },
    negativeAmount: {
      color: colors.error.main,
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
      marginBottom: 16,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 8,
    },
    emptySubtitle: {
      fontSize: 14,
      color: colors.text.secondary,
      textAlign: 'center',
      marginBottom: 24,
      paddingHorizontal: 32,
    },
    emptyButton: {
      backgroundColor: colors.primary[500],
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
      backgroundColor: colors.primary[500],
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
    },
    revenueMainCard: {
      backgroundColor: colors.background.paper,
      borderRadius: 16,
      padding: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: colors.border.light,
      marginHorizontal: 0,
      marginTop: 0,
      marginBottom: 12,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: isDarkMode ? 0.2 : 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    revenueMainLabel: {
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
      color: colors.text.secondary,
      letterSpacing: 0.8,
      marginBottom: 4,
    },
    revenueMainValue: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text.primary,
    },
    summaryRowGrid: {
      flexDirection: 'row',
      gap: 12,
      marginHorizontal: 0,
      marginBottom: 12,
    },
    summaryMiniCard: {
      flex: 1,
      backgroundColor: colors.background.paper,
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    summaryMiniLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 4,
    },
    summaryMiniValue: {
      fontSize: 16,
      fontWeight: '700',
    },
    customTxnCard: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.background.paper,
      padding: 14,
      borderRadius: 12,
      marginHorizontal: 0,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: colors.border.light,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: isDarkMode ? 0.15 : 0.04,
      shadowRadius: 4,
      elevation: 1,
    },
    txnLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: 12,
    },
    txnIconBg: {
      width: 42,
      height: 42,
      borderRadius: 21,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    txnTextContainer: {
      flex: 1,
    },
    txnTitleText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 2,
    },
    txnSubtitleText: {
      fontSize: 11,
      color: colors.text.secondary,
    },
    txnRight: {
      alignItems: 'flex-end',
    },
    txnAmountText: {
      fontSize: 15,
      fontWeight: '700',
      marginBottom: 2,
    },
    txnDateText: {
      fontSize: 10,
      color: colors.text.secondary,
    },
  });
