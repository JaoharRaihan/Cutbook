import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StatusBar,
  Image,
  Modal,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useOrg, useData, useTheme, useLanguage} from '@/context';
import useDailySummary, {getDateRange} from '@/hooks/useDailySummary';
import {useNotifications} from '@/hooks/useNotifications';
import {usePushNotifications} from '@/hooks/usePushNotifications';
import SummaryCard from '@/components/SummaryCard';
import EmployeeRankCard from '@/components/EmployeeRankCard';
import DatePickerModal from '@/components/UI/DatePickerModal';
import {formatBDT} from '@/utils/currency';
import {formatDateISO, isToday} from '@/utils/date';
import {TimePeriod} from '@/types';
import {useThemedStyles} from '@/hooks/useThemedStyles';
import {ThemeColors} from '@/constants/theme';
import Theme from '@/constants/theme';

export const Palette = {
  inkBlack: '#04151f',
  darkSlateGrey: '#183a37',
  wheat: '#efd6ac',
  burntOrange: '#c44900',
  midnightViolet: '#432534',
};

export default function DashboardScreen({navigation}: any): React.ReactElement {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const {currentOrg, employeeTransactions} = useOrg();
  const {unreadCount} = useNotifications();
  const {expenses, workEntries} = useData();
  const {isDarkMode, colors} = useTheme();
  const {language, t} = useLanguage();
  const styles = useThemedStyles(getStyles);

  // Initialize push notifications — requests permission + saves FCM token for owner
  usePushNotifications(navigation);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [showAllTopEmployees, setShowAllTopEmployees] = useState(false);
  const [showOnlyPayouts, setShowOnlyPayouts] = useState(false);
  const {summary, loading, error, refresh, timePeriod, setTimePeriod} =
    useDailySummary(selectedDate);

  const periodExpenses = useMemo(() => {
    const {start, end} = getDateRange(timePeriod, selectedDate);
    return expenses.filter(e => {
      const expDate = new Date(e.createdAt);
      return expDate >= start && expDate <= end;
    });
  }, [expenses, timePeriod, selectedDate]);

  const totalExpensesAmount = useMemo(() => {
    return periodExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [periodExpenses]);

  const periodPayouts = useMemo(() => {
    const {start, end} = getDateRange(timePeriod, selectedDate);
    return (employeeTransactions || []).filter(p => {
      if (p.status !== 'accepted') return false;
      const payoutDate = new Date(p.createdAt);
      return p.orgId === currentOrg?.id && payoutDate >= start && payoutDate <= end;
    });
  }, [employeeTransactions, currentOrg?.id, timePeriod, selectedDate]);

  const totalPayoutsAmount = useMemo(() => {
    return periodPayouts.reduce((sum, p) => sum + p.amount, 0);
  }, [periodPayouts]);

  const recentTransactions = useMemo(() => {
    const {start, end} = getDateRange(timePeriod, selectedDate);

    const entriesTxns = (workEntries || [])
      .filter(entry => {
        const entryDate = new Date(entry.createdAt);
        return entry.orgId === currentOrg?.id && entryDate >= start && entryDate <= end;
      })
      .map(entry => ({
        id: entry.id,
        type: 'entry',
        name: entry.serviceName || 'Service',
        employeeName: entry.employeeName,
        amount: entry.price + (entry.tip || 0),
        date: new Date(entry.createdAt),
      }));

    const expensesTxns = periodExpenses.map(expense => ({
      id: expense.id,
      type: 'expense',
      name: expense.name,
      employeeName: expense.createdByName || '',
      amount: expense.amount,
      date: new Date(expense.createdAt),
    }));

    const payoutsTxns = periodPayouts.map(payout => ({
      id: payout.id,
      type: 'payout',
      name: payout.employeeName,
      employeeName: payout.employeeName,
      amount: payout.amount,
      date: new Date(payout.createdAt),
    }));

    const combined = [...entriesTxns, ...expensesTxns, ...payoutsTxns];
    combined.sort((a, b) => b.date.getTime() - a.date.getTime());

    const baseTransactions = showOnlyPayouts
      ? combined.filter(txn => txn.type === 'payout')
      : combined;

    return baseTransactions.slice(0, 10);
  }, [workEntries, periodExpenses, periodPayouts, currentOrg?.id, timePeriod, selectedDate, showOnlyPayouts]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background.paper}
      />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{currentOrg?.name || t.dashboard.title}</Text>
          <Text style={styles.headerSubtitle}>
            {isToday(selectedDate) ? t.common.today : formatDateISO(selectedDate)}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            onPress={() => navigation.navigate('Notifications')}
            activeOpacity={0.7}
            style={styles.notificationBtn}>
            <MaterialIcons name="notifications" size={26} color={colors.text.primary} />
            {unreadCount > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            colors={[colors.primary[500]]}
            tintColor={colors.primary[500]}
          />
        }>
        {/* Period Filter */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              timePeriod === TimePeriod.TODAY && styles.filterButtonActive,
            ]}
            onPress={() => setTimePeriod(TimePeriod.TODAY)}>
            <Text
              style={[
                styles.filterButtonText,
                timePeriod === TimePeriod.TODAY && styles.filterButtonTextActive,
              ]}>
              {t.common.today}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              timePeriod === TimePeriod.WEEKLY && styles.filterButtonActive,
            ]}
            onPress={() => setTimePeriod(TimePeriod.WEEKLY)}>
            <Text
              style={[
                styles.filterButtonText,
                timePeriod === TimePeriod.WEEKLY && styles.filterButtonTextActive,
              ]}>
              {language === 'en'
                ? 'Weekly'
                : language === 'bn'
                  ? 'সাপ্তাহিক'
                  : language === 'es'
                    ? 'Semanal'
                    : 'साप्ताहिक'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              timePeriod === TimePeriod.MONTHLY && styles.filterButtonActive,
            ]}
            onPress={() => setTimePeriod(TimePeriod.MONTHLY)}>
            <Text
              style={[
                styles.filterButtonText,
                timePeriod === TimePeriod.MONTHLY && styles.filterButtonTextActive,
              ]}>
              {language === 'en'
                ? 'Monthly'
                : language === 'bn'
                  ? 'মাসিক'
                  : language === 'es'
                    ? 'Mensual'
                    : 'मासिक'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              timePeriod === TimePeriod.YEARLY && styles.filterButtonActive,
            ]}
            onPress={() => setTimePeriod(TimePeriod.YEARLY)}>
            <Text
              style={[
                styles.filterButtonText,
                timePeriod === TimePeriod.YEARLY && styles.filterButtonTextActive,
              ]}>
              {language === 'en'
                ? 'Yearly'
                : language === 'bn'
                  ? 'বার্ষিক'
                  : language === 'es'
                    ? 'Anual'
                    : 'वार्षिक'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterButton, styles.calendarButton]}
            onPress={() => setDatePickerVisible(true)}
            activeOpacity={0.8}>
            <MaterialCommunityIcons name="calendar" size={14} color={isDarkMode ? Palette.wheat : Palette.darkSlateGrey} />
            <Text style={styles.filterButtonText}>
              {isToday(selectedDate) ? t.common.today : formatDateISO(selectedDate)}
            </Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>❌ {error}</Text>
            <TouchableOpacity onPress={refresh} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>{t.common.confirm}</Text>
            </TouchableOpacity>
          </View>
        )}
        {!error && summary && (
          <>
            <SummaryCard
              title={
                language === 'en'
                  ? 'Net Revenue'
                  : language === 'bn'
                    ? 'নেট রাজস্ব'
                    : language === 'es'
                      ? 'Ingresos Netos'
                      : 'नेट राजस्व'
              }
              value={formatBDT(
                summary.totalIncome + summary.totalTips - totalExpensesAmount - totalPayoutsAmount,
              )}
              icon={
                <MaterialIcons
                  name="monetization-on"
                  size={26}
                  color={isDarkMode ? colors.success.light : colors.success.dark}
                />
              }
              subtitle={`${summary.entryCount} ${t.reports.totalEntries}`}
              color="success"
            />
            <View style={styles.gridContainer}>
              <View style={styles.gridRow}>
                <View style={styles.gridItem}>
                  <SummaryCard
                    title={
                      language === 'en'
                        ? 'Without Tips'
                        : language === 'bn'
                          ? 'টিপস ছাড়া'
                          : language === 'es'
                            ? 'Sin Propinas'
                            : 'टिप के बिना'
                    }
                    value={formatBDT(summary.totalIncome)}
                    icon={
                      <MaterialIcons
                        name="account-balance-wallet"
                        size={24}
                        color={isDarkMode ? colors.primary[300] : colors.primary[700]}
                      />
                    }
                    color="primary"
                    style={styles.gridItemCard}
                  />
                </View>
                <View style={styles.gridItem}>
                  <SummaryCard
                    title={
                      language === 'en'
                        ? 'Tips'
                        : language === 'bn'
                          ? 'টিপস'
                          : language === 'es'
                            ? 'Propinas'
                            : 'टिप्स'
                    }
                    value={formatBDT(summary.totalTips)}
                    icon={
                      <MaterialIcons
                        name="savings"
                        size={24}
                        color={isDarkMode ? colors.warning.light : colors.warning.dark}
                      />
                    }
                    color="warning"
                    style={styles.gridItemCard}
                  />
                </View>
              </View>
              <View style={styles.gridRow}>
                <View style={styles.gridItem}>
                  <SummaryCard
                    title={
                      language === 'en'
                        ? 'Earnings'
                        : language === 'bn'
                          ? 'উপার্জন'
                          : language === 'es'
                            ? 'Ganancias'
                            : 'कमाई'
                    }
                    value={formatBDT(
                      summary.totalIncome - summary.totalCommission - totalExpensesAmount,
                    )}
                    icon={
                      <MaterialIcons
                        name="payments"
                        size={24}
                        color={isDarkMode ? colors.info.light : colors.info.dark}
                      />
                    }
                    // subtitle={`${t.tabs.expenses}: ${formatBDT(totalExpensesAmount)}`}
                    color="info"
                    style={styles.gridItemCard}
                  />
                </View>
                <View style={styles.gridItem}>
                  <SummaryCard
                    title={t.tabs.expenses}
                    value={formatBDT(totalExpensesAmount)}
                    icon={
                      <MaterialIcons
                        name="shopping-bag"
                        size={24}
                        color={isDarkMode ? colors.error.light : colors.error.dark}
                      />
                    }
                    color="error"
                    style={styles.gridItemCard}
                  />
                </View>
              </View>
              <View style={styles.gridRow}>
                <View style={styles.gridItem}>
                  <SummaryCard
                    title={
                      language === 'en'
                        ? 'Payouts'
                        : language === 'bn'
                          ? 'পে-আউট'
                          : language === 'es'
                            ? 'Pagos'
                            : 'पेआउट'
                    }
                    value={formatBDT(totalPayoutsAmount)}
                    icon={
                      <MaterialIcons
                        name="account-balance-wallet"
                        size={24}
                        color={isDarkMode ? colors.primary[300] : colors.primary[700]}
                      />
                    }
                    color="primary"
                    style={styles.gridItemCard}
                  />
                </View>

                {/* paymentSummaryCard (match SummaryCard outer look) */}
                <View style={styles.gridItem}>
                  <View style={styles.paymentSummaryCard}>
                    <Text style={styles.paymentSummaryTitle}>
                      {language === 'en'
                        ? 'Payment Methods'
                        : language === 'bn'
                          ? 'পেমেন্ট পদ্ধতি'
                          : language === 'es'
                            ? 'Métodos de Pago'
                            : 'भुगतान के तरीके'}
                    </Text>

                    <View style={styles.paymentRows}>
                      <View style={styles.paymentRow}>
                        <View style={styles.paymentLabelContainer}>
                          <MaterialCommunityIcons
                            name="cash"
                            size={16}
                            color={isDarkMode ? '#10B981' : '#059669'}
                          />
                          <Text style={styles.paymentLabel}>{t.payment.cash}</Text>
                        </View>
                        <Text style={styles.paymentValue}>{formatBDT(summary.totalCash)}</Text>
                      </View>

                      <View style={styles.paymentRow}>
                        <View style={styles.paymentLabelContainer}>
                          <Image
                            source={require('@/assets/Logo/bkash_payment_logo.png')}
                            style={styles.paymentLogoImage}
                            resizeMode="contain"
                          />
                          <Text style={styles.paymentLabel}>{t.payment.bkash}</Text>
                        </View>
                        <Text style={styles.paymentValue}>{formatBDT(summary.totalBkash)}</Text>
                      </View>

                      <View style={styles.paymentRow}>
                        <View style={styles.paymentLabelContainer}>
                          <MaterialIcons
                            name="qr-code"
                            size={15}
                            color={isDarkMode ? '#10B981' : '#006A4E'}
                            style={styles.paymentRowIcon}
                          />
                          <Text style={styles.paymentLabel}>Bangla QR</Text>
                        </View>
                        <Text style={styles.paymentValue}>
                          {formatBDT(summary.totalBanglaQr || 0)}
                        </Text>
                      </View>

                      <TouchableOpacity
                        style={styles.seeMoreRow}
                        onPress={() => setShowPaymentModal(true)}
                        activeOpacity={0.7}>
                        <Text style={styles.seeMoreText}>
                          {language === 'en' ? 'See More' : 'আরও দেখুন'}
                        </Text>
                        <MaterialIcons
                          name="keyboard-arrow-right"
                          size={14}
                          color={colors.primary[500]}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            {!error && summary && summary.entryCount === 0 && (
              <View style={styles.emptyState}>
                <TouchableOpacity
                  style={styles.emptyStateButton}
                  onPress={() => navigation.navigate('AddWorkEntry')}>
                  <View style={styles.emptyStateContent}>
                    <MaterialIcons name="note-add" size={50} color="#ffffff" />
                    <Text style={styles.emptyStateButtonText}>
                      {language === 'en'
                        ? 'Create first entry today'
                        : language === 'bn'
                          ? 'আজকের প্রথম এন্ট্রি তৈরি করুন'
                          : language === 'es'
                            ? 'Crear primera entrada hoy'
                            : 'आज की पहली प्रविष्टि बनाएं'}
                    </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.bottomSpacing} />
            <Text style={styles.sectionTitle}>
              {language === 'en'
                ? '⚡ Quick Actions'
                : language === 'bn'
                  ? '⚡ দ্রুত অ্যাকশন'
                  : language === 'es'
                    ? '⚡ Acciones Rápidas'
                    : '⚡ त्वरित क्रियाएं'}
            </Text>
            <View style={styles.actionsGrid}>
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonPrimary]}
                  onPress={() => navigation.navigate('AddWorkEntry')}>
                  <MaterialIcons name="note-add" size={50} color="#f3e7e7" />
                  <Text style={styles.actionButtonTextPrimary}>{t.dashboard.addWorkEntry}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonSecondary]}
                  onPress={() => navigation.navigate('WorkEntries')}>
                  <MaterialIcons name="table-view" size={50} color={colors.text.primary} />
                  <Text style={styles.actionButtonText}>{t.workEntries.title}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonSecondary]}
                  onPress={() => navigation.navigate('Reports')}>
                  <MaterialIcons name="bar-chart" size={50} color={colors.text.primary} />
                  <Text style={styles.actionButtonText}>{t.reports.summary}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonPrimary]}
                  onPress={() => navigation.navigate('Expenses')}>
                  <MaterialIcons name="shopping-bag" size={50} color="#f3e7e7" />
                  <Text style={styles.actionButtonTextPrimary}>{t.tabs.expenses}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {language === 'en'
                    ? '💸 Recent Transactions'
                    : language === 'bn'
                      ? '💸 সাম্প্রতিক লেনদেন'
                      : language === 'es'
                        ? '💸 Transacciones Recientes'
                        : '💸 हाल के लेन-देन'}
                </Text>
                <View style={styles.sectionActions}>
                  <TouchableOpacity
                    style={[styles.toggleButton, showOnlyPayouts && styles.toggleButtonActive]}
                    onPress={() => setShowOnlyPayouts(prev => !prev)}>
                    <MaterialIcons
                      name="payments"
                      size={14}
                      color={showOnlyPayouts ? '#FFFFFF' : colors.primary[500]}
                    />
                    <Text style={[styles.toggleButtonText, showOnlyPayouts && styles.toggleButtonTextActive]}>
                      {language === 'en'
                        ? showOnlyPayouts
                          ? 'Payouts Only'
                          : 'Payouts'
                        : language === 'bn'
                          ? showOnlyPayouts
                            ? 'শুধু পে-আউট'
                            : 'পে-আউট'
                          : language === 'es'
                            ? showOnlyPayouts
                              ? 'Solo Pagos'
                              : 'Pagos'
                            : showOnlyPayouts
                              ? 'केवल पेआउट'
                              : 'पेआउट'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => navigation.navigate('WorkEntries')}>
                    <Text style={styles.seeAllText}>
                      {language === 'en'
                        ? 'See All'
                        : language === 'bn'
                          ? 'সব দেখুন'
                          : language === 'es'
                            ? 'Ver todo'
                            : 'सभी देखें'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.transactionsCard}>
                {recentTransactions.length === 0 ? (
                  <Text style={styles.noTransactionsText}>
                    {language === 'en'
                      ? 'No transactions for this period'
                      : language === 'bn'
                        ? 'এই সময়ের জন্য কোন লেনদেন নেই'
                        : language === 'es'
                          ? 'No hay transacciones para este período'
                          : 'इस अवधि के लिए कोई लेन-देन नहीं'}
                  </Text>
                ) : (
                  recentTransactions.map((txn, index) => {
                    const isEntry = txn.type === 'entry';
                    const isExpense = txn.type === 'expense';
                    const isPayout = txn.type === 'payout';

                    let iconName = 'receipt';
                    let iconColor = colors.success.main;
                    let typeLabel = '';
                    let amountPrefix = '+';
                    let amountColor = colors.success.main;

                    if (isExpense) {
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
                    } else if (isPayout) {
                      iconName = 'account-balance-wallet';
                      iconColor = colors.warning.main;
                      typeLabel =
                        language === 'en'
                          ? 'Payout'
                          : language === 'bn'
                            ? 'পে-আউট'
                            : language === 'es'
                              ? 'Pago'
                              : 'पेआउट';
                      amountPrefix = '-';
                      amountColor = colors.warning.dark;
                    } else {
                      typeLabel =
                        language === 'en'
                          ? 'Service'
                          : language === 'bn'
                            ? 'সেবা'
                            : language === 'es'
                              ? 'Servicio'
                              : 'सेवा';
                    }

                    return (
                      <View
                        key={txn.id + '-' + txn.type + '-' + index}
                        style={[
                          styles.transactionRow,
                          index < recentTransactions.length - 1 && styles.borderBottom,
                        ]}>
                        <View style={styles.txnLeftContainer}>
                          <View
                            style={[
                              styles.txnIconWrapper,
                              isEntry
                                ? styles.txnIconWrapperEntry
                                : isExpense
                                  ? styles.txnIconWrapperExpense
                                  : styles.txnIconWrapperPayout,
                            ]}>
                            <MaterialIcons name={iconName} size={18} color={iconColor} />
                          </View>
                          <View style={styles.txnInfo}>
                            <Text style={styles.txnName} numberOfLines={1}>
                              {txn.name}
                            </Text>
                            <View style={styles.txnSubInfo}>
                              <Text style={styles.txnTypeLabel}>{typeLabel}</Text>
                              {txn.employeeName ? (
                                <>
                                  <Text style={styles.bullet}> • </Text>
                                  <Text style={styles.txnEmployee} numberOfLines={1}>
                                    {txn.employeeName}
                                  </Text>
                                </>
                              ) : null}
                            </View>
                          </View>
                        </View>
                        <View style={styles.txnRightContainer}>
                          <Text style={[styles.txnAmount, {color: amountColor}]}>
                            {amountPrefix}
                            {formatBDT(txn.amount)}
                          </Text>
                          <Text style={styles.txnTime}>
                            {txn.date.toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                )}
                {recentTransactions.length > 0 && (
                  <TouchableOpacity
                    style={styles.seeMoreButton}
                    onPress={() => navigation.navigate('WorkEntries')}>
                    <Text style={styles.seeMoreButtonText}>
                      {language === 'en'
                        ? 'See More Transactions →'
                        : language === 'bn'
                          ? 'আরো লেনদেন দেখুন →'
                          : language === 'es'
                            ? 'Ver más transacciones →'
                            : 'और लेन-देन देखें →'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {summary.topEmployees.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🏆 {t.dashboard.topEmployees}</Text>
                <View style={styles.rankCardsContainer}>
                  {(showAllTopEmployees
                    ? summary.topEmployees
                    : summary.topEmployees.slice(0, 3)
                  ).map((employee: any, index: number) => (
                    <EmployeeRankCard
                      key={employee.employeeId}
                      rank={index + 1}
                      name={employee.employeeName}
                      totalIncome={employee.totalIncome}
                      serviceCount={employee.serviceCount}
                    />
                  ))}
                  {summary.topEmployees.length > 3 && (
                    <TouchableOpacity onPress={() => setShowAllTopEmployees(!showAllTopEmployees)}>
                      <Text style={styles.morePayouts}>
                        {showAllTopEmployees
                          ? language === 'en'
                            ? 'Show Less'
                            : language === 'bn'
                              ? 'কম দেখান'
                              : language === 'es'
                                ? 'Mostrar menos'
                                : 'कम दिखाएं'
                          : `+${summary.topEmployees.length - 3} ${language === 'en' ? 'more employees (Show More)' : language === 'bn' ? 'জন কর্মী (আরো দেখান)' : language === 'es' ? 'más empleados (Ver más)' : 'और कर्मचारी (अधिक दिखाएं)'}`}
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* Floating Action Button to Add Work Entry */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddWorkEntry')}
        activeOpacity={0.8}>
        <MaterialIcons name="note-add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={datePickerVisible}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onClose={() => setDatePickerVisible(false)}
      />

      {/* Payment methods breakdown Modal */}
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowPaymentModal(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPaymentModal(false)}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {language === 'en'
                  ? 'Payment Methods'
                  : language === 'bn'
                    ? 'পেমেন্ট পদ্ধতিসমূহ'
                    : 'Payment Methods'}
              </Text>
              <TouchableOpacity
                onPress={() => setShowPaymentModal(false)}
                style={styles.modalCloseButton}>
                <MaterialIcons name="close" size={22} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* Cash */}
              <View style={styles.modalPaymentRow}>
                <View style={styles.paymentLabelContainer}>
                  <MaterialCommunityIcons
                    name="cash"
                    size={20}
                    color={isDarkMode ? '#10B981' : '#059669'}
                  />
                  <Text style={styles.modalPaymentLabel}>{t.payment.cash}</Text>
                </View>
                <Text style={styles.modalPaymentValue}>{formatBDT(summary?.totalCash || 0)}</Text>
              </View>

              {/* bKash */}
              <View style={styles.modalPaymentRow}>
                <View style={styles.paymentLabelContainer}>
                  <Image
                    source={require('@/assets/Logo/bkash_payment_logo.png')}
                    style={styles.modalPaymentLogo}
                    resizeMode="contain"
                  />
                  <Text style={styles.modalPaymentLabel}>{t.payment.bkash}</Text>
                </View>
                <Text style={styles.modalPaymentValue}>{formatBDT(summary?.totalBkash || 0)}</Text>
              </View>

              {/* Nagad */}
              <View style={styles.modalPaymentRow}>
                <View style={styles.paymentLabelContainer}>
                  <Image
                    source={require('@/assets/Logo/Nagad-Logo.wine.png')}
                    style={styles.modalPaymentLogo}
                    resizeMode="contain"
                  />
                  <Text style={styles.modalPaymentLabel}>{t.payment.nagad}</Text>
                </View>
                <Text style={styles.modalPaymentValue}>{formatBDT(summary?.totalNagad || 0)}</Text>
              </View>

              {/* Card */}
              <View style={styles.modalPaymentRow}>
                <View style={styles.paymentLabelContainer}>
                  <MaterialCommunityIcons
                    name="credit-card"
                    size={20}
                    color={isDarkMode ? '#3B82F6' : '#2563EB'}
                  />
                  <Text style={styles.modalPaymentLabel}>{t.payment.card}</Text>
                </View>
                <Text style={styles.modalPaymentValue}>{formatBDT(summary?.totalCard || 0)}</Text>
              </View>

              {/* Bangla QR */}
              <View style={styles.modalPaymentRow}>
                <View style={styles.paymentLabelContainer}>
                  <MaterialIcons
                    name="qr-code"
                    size={18}
                    color={isDarkMode ? '#10B981' : '#006A4E'}
                    style={styles.paymentRowIcon}
                  />
                  <Text style={styles.modalPaymentLabel}>Bangla QR</Text>
                </View>
                <Text style={styles.modalPaymentValue}>
                  {formatBDT(summary?.totalBanglaQr || 0)}
                </Text>
              </View>

              <View style={styles.modalPaymentRowLast}>
                <View style={styles.paymentLabelContainer}>
                  <MaterialIcons
                    name="rocket"
                    size={18}
                    color={isDarkMode ? '#A78BFA' : '#8C2D8B'}
                    style={styles.paymentRowIcon}
                  />
                  <Text style={styles.modalPaymentLabel}>Rocket</Text>
                </View>
                <Text style={styles.modalPaymentValue}>{formatBDT(summary?.totalRocket || 0)}</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors, isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDarkMode ? Palette.inkBlack : '#FAFBFB',
    },

    fab: {
      position: 'absolute',
      bottom: 24,
      right: 24,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: Palette.darkSlateGrey,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    },

    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: isDarkMode ? Palette.inkBlack : '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? Palette.darkSlateGrey : Palette.wheat,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: isDarkMode ? 0.2 : 0.06,
      shadowRadius: 6,
      elevation: 4,
    },

    headerTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: isDarkMode ? '#FFFFFF' : Palette.inkBlack,
    },

    headerSubtitle: {
      fontSize: 13,
      color: isDarkMode ? Palette.wheat : Palette.darkSlateGrey,
      marginTop: 2,
    },

    dateButton: {
      flexDirection: 'column',
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderRadius: 10,
      backgroundColor: isDarkMode ? Palette.darkSlateGrey : '#FFFFFF',
      borderWidth: 1,
      borderColor: Palette.wheat,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 3,
    },

    dateButtonLabel: {
      fontSize: 9,
      color: isDarkMode ? Palette.wheat : Palette.darkSlateGrey,
      fontWeight: '600',
    },

    scrollView: {
      flex: 1,
    },

    scrollContent: {
      padding: 16,
    },

    errorContainer: {
      backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.2)' : '#FEE2E2',
      padding: 14,
      borderRadius: 10,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: '#FCA5A5',
    },

    errorText: {
      fontSize: 15,
      color: '#DC2626',
      textAlign: 'center',
      marginBottom: 10,
    },

    retryButton: {
      backgroundColor: '#DC2626',
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
      alignSelf: 'center',
    },

    retryButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '600',
    },

    gridContainer: {
      marginTop: 8,
    },

    gridRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 12,
    },

    gridItem: {
      flex: 1,
    },
    paymentSummaryCard: {
      flex: 1,
      padding: 16,
      borderRadius: Theme.borderRadius.lg,
      borderWidth: 1,
      borderColor: isDarkMode ? '#334155' : '#CBD5E1',
      backgroundColor: isDarkMode ? '#0F172A' : '#F1F5F9',
      minHeight: 160,
      justifyContent: 'space-between',
      ...Theme.shadows.sm,
    },

    paymentSummaryTitle: {
      fontSize: 11,
      fontWeight: '600',
      color: isDarkMode ? '#94A3B8' : '#475569',
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
    },

    seeMoreRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 5,
      marginTop: 2,
    },
    seeMoreText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primary[500],
      marginRight: 2,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalContent: {
      width: '85%',
      backgroundColor: colors.background.paper,
      borderRadius: 16,
      padding: 20,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 10},
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 10,
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
      paddingBottom: 10,
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text.primary,
    },
    modalCloseButton: {
      padding: 4,
    },
    modalBody: {
      gap: 2,
    },
    modalPaymentRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    },
    modalPaymentRowLast: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
      borderBottomWidth: 0,
    },
    modalPaymentLabel: {
      color: colors.text.primary,
      fontSize: 14,
      fontWeight: '600',
    },
    modalPaymentValue: {
      color: colors.text.primary,
      fontSize: 14,
      fontWeight: '700',
    },
    modalPaymentLogo: {
      width: 32,
      height: 18,
    },
    paymentRowIcon: {
      marginRight: 2,
    },
    paymentRows: {
      gap: 0,
    },

    paymentRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 4,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
    },

    paymentLabelContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },

    paymentLogoImage: {
      width: 26,
      height: 14,
    },

    paymentLabel: {
      color: isDarkMode ? '#94A3B8' : '#475569',
      fontSize: 11,
      fontWeight: '600',
    },

    paymentValue: {
      color: isDarkMode ? '#F8FAFC' : '#1E293B',
      fontSize: 11,
      fontWeight: '700',
    },
    section: {
      marginTop: 16,
    },

    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: isDarkMode ? Palette.wheat : Palette.darkSlateGrey,
      marginBottom: 12,
    },

    rankCardsContainer: {
      gap: 12,
    },

    actionsGrid: {
      gap: 12,
    },

    actionsRow: {
      flexDirection: 'row',
      gap: 12,
    },

    actionButton: {
      flex: 1,
      padding: 12,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      height: 130,
      gap: 6,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: isDarkMode ? 0.3 : 0.08,
      shadowRadius: 6,
      elevation: 3,
    },

    actionButtonPrimary: {
      backgroundColor: Palette.darkSlateGrey,
    },

    actionButtonSecondary: {
      backgroundColor: isDarkMode ? Palette.midnightViolet : '#FFFFFF',
      borderWidth: 1,
      borderColor: isDarkMode ? Palette.darkSlateGrey : Palette.wheat,
    },

    actionButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: isDarkMode ? '#FFFFFF' : Palette.darkSlateGrey,
      textAlign: 'center',
    },

    actionButtonTextPrimary: {
      fontSize: 15,
      fontWeight: '600',
      color: '#ffffff',
      textAlign: 'center',
    },

    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 5,
    },

    emptyStateButton: {
      backgroundColor: Palette.darkSlateGrey,
      paddingVertical: 12,
      paddingHorizontal: 24,
      borderRadius: 10,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 3},
      shadowOpacity: 0.15,
      shadowRadius: 6,
      elevation: 4,
    },

    emptyStateButtonText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '600',
      paddingHorizontal: 10,
    },

    bottomSpacing: {
      height: 24,
      marginTop: -20,
    },

    morePayouts: {
      fontSize: 12,
      color: isDarkMode ? Palette.wheat : Palette.burntOrange,
      marginTop: 10,
      fontWeight: '600',
      textAlign: 'center',
    },

    filterContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 12,
      paddingHorizontal: 4,
    },

    filterButton: {
      flex: 1,
      minWidth: 72,
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 10,
      backgroundColor: isDarkMode ? Palette.inkBlack : '#FFFFFF',
      borderWidth: 1,
      borderColor: isDarkMode ? Palette.darkSlateGrey : Palette.wheat,
      alignItems: 'center',
      justifyContent: 'center',
    },

    calendarButton: {
      flexBasis: '100%',
      flexGrow: 1,
      flexDirection: 'row',
      gap: 6,
      marginTop: 2,
    },

    filterButtonActive: {
      backgroundColor: Palette.darkSlateGrey,
      borderColor: Palette.darkSlateGrey,
    },

    filterButtonText: {
      fontSize: 10,
      fontWeight: '600',
      color: isDarkMode ? Palette.wheat : Palette.darkSlateGrey,
      textAlign: 'center',
    },

    filterButtonTextActive: {
      color: '#FFFFFF',
      fontWeight: '700',
    },

    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      gap: 8,
    },
    sectionActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      flexShrink: 1,
    },
    toggleButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 6,
      paddingHorizontal: 10,
      borderRadius: 999,
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.08)' : '#F3F4F6',
      borderWidth: 1,
      borderColor: isDarkMode ? 'rgba(255,255,255,0.1)' : '#E5E7EB',
    },
    toggleButtonActive: {
      backgroundColor: Palette.darkSlateGrey,
      borderColor: Palette.darkSlateGrey,
    },
    toggleButtonText: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.primary[500],
    },
    toggleButtonTextActive: {
      color: '#FFFFFF',
    },
    seeAllText: {
      fontSize: 13,
      fontWeight: '600',
      color: isDarkMode ? Palette.wheat : Palette.burntOrange,
    },
    transactionsCard: {
      backgroundColor: isDarkMode ? Palette.midnightViolet : '#FFFFFF',
      borderRadius: 16,
      borderWidth: 1,
      borderColor: isDarkMode ? Palette.darkSlateGrey : Palette.wheat,
      padding: 16,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: isDarkMode ? 0.2 : 0.05,
      shadowRadius: 6,
      elevation: 2,
    },
    noTransactionsText: {
      fontSize: 14,
      color: colors.text.secondary,
      textAlign: 'center',
      paddingVertical: 16,
    },
    transactionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
    },
    borderBottom: {
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? 'rgba(239, 214, 172, 0.2)' : 'rgba(24, 58, 55, 0.1)',
    },
    txnLeftContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      marginRight: 12,
    },
    txnIconWrapper: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    txnInfo: {
      flex: 1,
    },
    txnName: {
      fontSize: 14,
      fontWeight: '600',
      color: isDarkMode ? '#FFFFFF' : Palette.inkBlack,
      marginBottom: 2,
    },
    txnSubInfo: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    txnTypeLabel: {
      fontSize: 11,
      color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : Palette.darkSlateGrey,
      fontWeight: '500',
    },
    bullet: {
      fontSize: 11,
      color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : Palette.darkSlateGrey,
    },
    txnEmployee: {
      fontSize: 11,
      color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : Palette.darkSlateGrey,
      flex: 1,
    },
    txnRightContainer: {
      alignItems: 'flex-end',
    },
    txnAmount: {
      fontSize: 14,
      fontWeight: '700',
      marginBottom: 2,
    },
    txnTime: {
      fontSize: 10,
      color: isDarkMode ? 'rgba(255, 255, 255, 0.6)' : Palette.darkSlateGrey,
    },
    seeMoreButton: {
      marginTop: 8,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: isDarkMode ? 'rgba(239, 214, 172, 0.2)' : 'rgba(24, 58, 55, 0.1)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    seeMoreButtonText: {
      fontSize: 13,
      fontWeight: '600',
      color: isDarkMode ? Palette.wheat : Palette.burntOrange,
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    notificationBtn: {
      position: 'relative',
      marginRight: 4,
    },
    badge: {
      position: 'absolute',
      top: -4,
      right: -4,
      backgroundColor: colors.error.main,
      borderRadius: 9,
      minWidth: 18,
      height: 18,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 3,
    },
    badgeText: {
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: '700',
    },
    gridItemCard: {
      flex: 1,
      minHeight: 160,
      justifyContent: 'space-between',
    },
    emptyStateContent: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    txnIconWrapperEntry: {
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
    },
    txnIconWrapperExpense: {
      backgroundColor: 'rgba(244, 67, 54, 0.1)',
    },
    txnIconWrapperPayout: {
      backgroundColor: 'rgba(255, 152, 0, 0.1)',
    },
  });
