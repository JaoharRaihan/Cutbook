/**
 * HistoryScreen.tsx
 * Employee work history with dashboard-style period filter + calendar date picker
 */

import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAuth, useOrg, useData, useTheme, useLanguage} from '@/context';
import {PaymentMethod, TimePeriod} from '@/types';
import {formatBDT, calculateEmployeeCommission} from '@/utils';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import {useThemedStyles} from '@/hooks/useThemedStyles';
import {ThemeColors} from '@/constants/theme';
import DatePickerModal from '@/components/UI/DatePickerModal';
import {formatDateISO, isToday} from '@/utils/date';
import {getDateRange} from '@/hooks/useDailySummary';

export const Palette = {
  inkBlack: '#04151f',
  darkSlateGrey: '#183a37',
  wheat: '#efd6ac',
  burntOrange: '#c44900',
  midnightViolet: '#432534',
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function HistoryScreen(): React.ReactElement {
  const {user: currentUser} = useAuth();
  const {currentOrg, employeeTransactions} = useOrg();
  const {workEntries, loading, refreshData} = useData();
  const {colors, isDarkMode} = useTheme();
  const {language, t} = useLanguage();
  const styles = useThemedStyles(getStyles);

  const [refreshing, setRefreshing] = useState(false);

  // ── Filter state (mirrors owner dashboard) ──
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(TimePeriod.TODAY);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  // ── Locale helpers ──
  const localeStr =
    language === 'bn'
      ? 'bn-BD'
      : language === 'es'
        ? 'es-ES'
        : language === 'hi'
          ? 'hi-IN'
          : 'en-US';

  const periodLabel = useMemo(() => {
    switch (timePeriod) {
      case TimePeriod.TODAY:
        return language === 'en'
          ? 'Today'
          : language === 'bn'
            ? 'আজ'
            : language === 'es'
              ? 'Hoy'
              : 'आज';
      case TimePeriod.WEEKLY:
        return language === 'en'
          ? 'This Week'
          : language === 'bn'
            ? 'এই সপ্তাহ'
            : language === 'es'
              ? 'Esta Semana'
              : 'इस सप्ताह';
      case TimePeriod.MONTHLY:
        return language === 'en'
          ? 'This Month'
          : language === 'bn'
            ? 'এই মাস'
            : language === 'es'
              ? 'Este Mes'
              : 'इस महीने';
      case TimePeriod.YEARLY:
        return language === 'en'
          ? 'This Year'
          : language === 'bn'
            ? 'এই বছর'
            : language === 'es'
              ? 'Este Año'
              : 'इस साल';
      default:
        return '';
    }
  }, [timePeriod, language]);

  // Filter for current employee's entries
  const myEntries = useMemo(() => {
    return workEntries.filter(entry => entry.employeeId === currentUser?.id);
  }, [workEntries, currentUser]);

  // Date range
  const dateRange = useMemo(() => {
    return getDateRange(timePeriod, selectedDate);
  }, [timePeriod, selectedDate]);

  // Filter entries for selected period
  const filteredEntries = useMemo(() => {
    return myEntries
      .filter(entry => {
        const entryDate = new Date(entry.createdAt);
        return entryDate >= dateRange.start && entryDate <= dateRange.end;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [myEntries, dateRange]);

  // Summary stats for the filtered period
  const periodStats = useMemo(() => {
    const totalServices = filteredEntries.length;
    const serviceRevenue = filteredEntries.reduce((sum, e) => sum + e.price, 0);
    const totalTips = filteredEntries.reduce((sum, e) => sum + (e.tip || 0), 0);
    const totalIncome = serviceRevenue + totalTips;
    const commissionPercentage = currentUser?.commissionPercentage || 0;

    let commission = 0;
    if (currentOrg) {
      filteredEntries.forEach(entry => {
        commission += calculateEmployeeCommission(entry.price, currentOrg, commissionPercentage);
      });
    }
    commission = Math.round(commission);
    const myEarnings = commission + totalTips;
    return {totalServices, totalIncome, totalTips, commission, myEarnings, commissionPercentage};
  }, [filteredEntries, currentOrg, currentUser?.commissionPercentage]);

  const periodPayouts = useMemo(() => {
    if (!currentUser?.id || !employeeTransactions) return [];
    return employeeTransactions.filter(p => {
      if (p.status !== 'accepted') return false;
      if (p.employeeId !== currentUser.id) return false;
      const payoutDate = new Date(p.createdAt);
      return payoutDate >= dateRange.start && payoutDate <= dateRange.end;
    });
  }, [employeeTransactions, currentUser?.id, dateRange]);

  const totalPayoutsAmount = useMemo(() => {
    return periodPayouts.reduce((sum, p) => sum + p.amount, 0);
  }, [periodPayouts]);

  const unifiedTransactions = useMemo(() => {
    // 1. Work Entries (Services)
    const entriesTxns = filteredEntries.map(entry => ({
      id: entry.id,
      type: 'entry' as const,
      name: entry.serviceName || 'Service',
      amount: entry.price + (entry.tip || 0),
      date: new Date(entry.createdAt),
      raw: entry,
    }));

    // 2. Payouts (Accepted payments from salon)
    const payoutsTxns = periodPayouts.map(payout => ({
      id: payout.id,
      type: 'payout' as const,
      name:
        language === 'en'
          ? 'Payout received'
          : language === 'bn'
            ? 'পে-আউট পেয়েছেন'
            : language === 'es'
              ? 'Pago recibido'
              : 'पेआउट प्राप्त हुआ',
      amount: payout.amount,
      date: new Date(payout.createdAt),
      raw: payout,
    }));

    // Combine and sort by date descending
    const combined = [...entriesTxns, ...payoutsTxns];
    combined.sort((a, b) => b.date.getTime() - a.date.getTime());
    return combined;
  }, [filteredEntries, periodPayouts, language]);

  const sections = useMemo(() => {
    const groups: {[key: string]: any[]} = {};

    unifiedTransactions.forEach(item => {
      const dateStr = item.date.toDateString();
      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(item);
    });

    return Object.keys(groups).map(dateStr => {
      const dateObj = new Date(dateStr);

      let title = '';
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      if (dateObj.toDateString() === today.toDateString()) {
        title =
          language === 'en' ? 'Today' : language === 'bn' ? 'আজ' : language === 'es' ? 'Hoy' : 'आज';
      } else if (dateObj.toDateString() === yesterday.toDateString()) {
        title =
          language === 'en'
            ? 'Yesterday'
            : language === 'bn'
              ? 'গতকাল'
              : language === 'es'
                ? 'Ayer'
                : 'कल';
      } else {
        title = dateObj.toLocaleDateString(localeStr, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        });
      }

      return {
        title,
        data: groups[dateStr],
      };
    });
  }, [unifiedTransactions, language, localeStr]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } catch (error) {
      console.error('Error refreshing history:', error);
    } finally {
      setRefreshing(false);
    }
  };

  // ============================================================================
  // FORMAT HELPERS
  // ============================================================================

  const formatTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const formatTxnDate = (d: Date): string => {
    const dateStr = d.toLocaleDateString(localeStr, {month: 'short', day: 'numeric'});
    return `${dateStr} • ${formatTime(d)}`;
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

  // ============================================================================
  // RENDER METHODS
  // ============================================================================

  const renderTransaction = ({item}: {item: any}) => {
    const isEntry = item.type === 'entry';

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
      const payLabel = getPaymentMethodLabel(payMethod);
      details = `${payLabel}`;
    } else {
      iconName = 'account-balance-wallet';
      iconColor = colors.secondary?.[500] || '#9C27B0';
      typeLabel =
        language === 'en'
          ? 'Payout'
          : language === 'bn'
            ? 'পে-আউট'
            : language === 'es'
              ? 'Pago'
              : 'पेआउट';
      amountPrefix = '-';
      amountColor = colors.secondary?.[500] || '#9C27B0';
      details =
        language === 'en'
          ? 'From salon'
          : language === 'bn'
            ? 'সেলুন থেকে'
            : language === 'es'
              ? 'Del salón'
              : 'স্যালুন থেকে';
    }

    const handlePress = () => {
      if (isEntry) {
        Alert.alert(
          language === 'en'
            ? 'Service Details'
            : language === 'bn'
              ? 'সেবার বিবরণ'
              : language === 'es'
                ? 'Detalles del Servicio'
                : 'सेवा विवरण',
          `${language === 'en' ? 'Service' : 'সেবা'}: ${item.name}\n` +
            `${language === 'en' ? 'Price' : 'মূল্য'}: ${formatBDT(item.raw.price)}\n` +
            (item.raw.tip
              ? `${language === 'en' ? 'Tip' : 'টিপ'}: ${formatBDT(item.raw.tip)}\n`
              : '') +
            `${language === 'en' ? 'Payment' : 'পেমেন্ট'}: ${getPaymentMethodLabel(
              item.raw.paymentMethod,
            )}\n` +
            `${language === 'en' ? 'Time' : 'সময়'}: ${formatTxnDate(item.date)}` +
            (item.raw.note ? `\n${language === 'en' ? 'Note' : 'নোট'}: ${item.raw.note}` : ''),
        );
      } else {
        Alert.alert(
          language === 'en'
            ? 'Payout Details'
            : language === 'bn'
              ? 'পে-আউট বিবরণ'
              : language === 'es'
                ? 'Detalles del Pago'
                : 'पेआउट विवरण',
          `${language === 'en' ? 'Amount Received' : 'প্রাপ্ত পরিমাণ'}: ${formatBDT(
            item.amount,
          )}\n` +
            `${language === 'en' ? 'Time' : 'সময়'}: ${formatTxnDate(item.date)}` +
            (item.raw.note ? `\n${language === 'en' ? 'Note' : 'নোট'}: ${item.raw.note}` : ''),
        );
      }
    };

    return (
      <TouchableOpacity activeOpacity={0.7} onPress={handlePress} style={styles.customTxnCard}>
        <View style={styles.txnLeft}>
          <View
            style={[
              styles.txnIconBg,
              {
                backgroundColor: isEntry ? 'rgba(76, 175, 80, 0.1)' : 'rgba(156, 39, 176, 0.1)',
              },
            ]}>
            <MaterialIcons name={iconName as any} size={24} color={iconColor} />
          </View>
          <View style={styles.txnTextContainer}>
            <Text style={styles.txnTitleText} numberOfLines={1}>
              {item.name}
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
  };

  const renderHeader = () => {
    const earningsSubtitle =
      currentOrg?.defaultCommissionMode === 'fixed'
        ? `${formatBDT(periodStats.commissionPercentage, true, 0)} + tips`
        : `${periodStats.commissionPercentage}% + tips`;

    return (
      <>
        {/* ── Period Filter Tabs ── */}
        <View style={styles.filterContainer}>
          {(
            [TimePeriod.TODAY, TimePeriod.WEEKLY, TimePeriod.MONTHLY, TimePeriod.YEARLY] as const
          ).map(period => (
            <TouchableOpacity
              key={period}
              style={[styles.filterTab, timePeriod === period && styles.filterTabActive]}
              onPress={() => setTimePeriod(period)}>
              <Text
                style={[styles.filterTabText, timePeriod === period && styles.filterTabTextActive]}>
                {period === TimePeriod.TODAY
                  ? t.common.today
                  : period === TimePeriod.WEEKLY
                    ? language === 'en'
                      ? 'Weekly'
                      : language === 'bn'
                        ? 'সাপ্তাহিক'
                        : language === 'es'
                          ? 'Semanal'
                          : 'साप्ताहिक'
                    : period === TimePeriod.MONTHLY
                      ? language === 'en'
                        ? 'Monthly'
                        : language === 'bn'
                          ? 'মাসিক'
                          : language === 'es'
                            ? 'Mensual'
                            : 'मासिक'
                      : language === 'en'
                        ? 'Yearly'
                        : language === 'bn'
                          ? 'বার্ষিক'
                          : language === 'es'
                            ? 'Anual'
                            : 'वार्षिक'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Consolidated Financial Overview Card ── */}
        <View style={styles.overviewCard}>
          <View style={styles.overviewMain}>
            <Text style={styles.overviewLabel}>
              {language === 'en'
                ? 'Net Earnings'
                : language === 'bn'
                  ? 'নেট উপার্জন'
                  : language === 'es'
                    ? 'Ganancias Netas'
                    : 'नेट कमाई'}
            </Text>
            <Text style={styles.overviewValue}>{formatBDT(periodStats.myEarnings)}</Text>
            <Text style={styles.overviewSubtitle}>{earningsSubtitle}</Text>
          </View>

          <View style={styles.overviewDivider} />

          <View style={styles.overviewStatsContainer}>
            <View style={styles.overviewStatRow}>
              <View style={styles.overviewStatItem}>
                <MaterialIcons
                  name="content-cut"
                  size={18}
                  color={colors.primary[300]}
                  style={styles.statIcon}
                />
                <View>
                  <Text style={styles.statLabel}>
                    {language === 'en'
                      ? 'Services'
                      : language === 'bn'
                        ? 'সেবা সমূহ'
                        : language === 'es'
                          ? 'Servicios'
                          : 'सेवाएं'}
                  </Text>
                  <Text style={styles.statValue}>{periodStats.totalServices}</Text>
                </View>
              </View>

              <View style={styles.overviewStatItem}>
                <MaterialIcons
                  name="star"
                  size={18}
                  color={colors.info.light}
                  style={styles.statIcon}
                />
                <View>
                  <Text style={styles.statLabel}>
                    {language === 'en'
                      ? 'Commission'
                      : language === 'bn'
                        ? 'কমিশন'
                        : language === 'es'
                          ? 'Comisión'
                          : 'कमीशन'}
                  </Text>
                  <Text style={styles.statValue}>{formatBDT(periodStats.commission)}</Text>
                </View>
              </View>
            </View>

            <View style={styles.overviewStatRow}>
              <View style={styles.overviewStatItem}>
                <MaterialIcons
                  name="savings"
                  size={18}
                  color={colors.warning.light}
                  style={styles.statIcon}
                />
                <View>
                  <Text style={styles.statLabel}>
                    {language === 'en'
                      ? 'Tips'
                      : language === 'bn'
                        ? 'টিপস'
                        : language === 'es'
                          ? 'Propinas'
                          : 'टिप्स'}
                  </Text>
                  <Text style={styles.statValue}>{formatBDT(periodStats.totalTips)}</Text>
                </View>
              </View>

              <View style={styles.overviewStatItem}>
                <MaterialIcons
                  name="account-balance-wallet"
                  size={18}
                  color={colors.error.light}
                  style={styles.statIcon}
                />
                <View>
                  <Text style={styles.statLabel}>
                    {language === 'en'
                      ? 'Payouts'
                      : language === 'bn'
                        ? 'পে-আউট'
                        : language === 'es'
                          ? 'Pagos'
                          : 'पेआउट'}
                  </Text>
                  <Text style={styles.statValue}>{formatBDT(totalPayoutsAmount)}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Entries Header */}
        {unifiedTransactions.length > 0 && (
          <View style={styles.entriesHeader}>
            <Text style={styles.entriesHeaderTitle}>
              {language === 'en'
                ? `Activity History (${unifiedTransactions.length})`
                : language === 'bn'
                  ? `কার্যক্রমের ইতিহাস (${unifiedTransactions.length}টি)`
                  : language === 'es'
                    ? `Historial de Actividad (${unifiedTransactions.length})`
                    : `गतिविधि इतिहास (${unifiedTransactions.length})`}
            </Text>
          </View>
        )}
      </>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <MaterialIcons
        name="hourglass-empty"
        style={styles.emptyIcon}
        size={40}
        color={colors.text.hint}
      />
      <Text style={styles.emptyTitle}>{t.empty.noServices}</Text>
      <Text style={styles.emptyText}>
        {language === 'en'
          ? `No services found for ${periodLabel}`
          : language === 'bn'
            ? `${periodLabel}-এর জন্য কোনো সেবা পাওয়া যায়নি`
            : language === 'es'
              ? `No se encontraron servicios para ${periodLabel}`
              : `${periodLabel} के लिए कोई सेवा नहीं मिली`}
      </Text>
    </View>
  );

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
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>
            {language === 'en'
              ? 'Work History'
              : language === 'bn'
                ? 'কাজের ইতিহাস'
                : language === 'es'
                  ? 'Historial de Trabajo'
                  : 'कार्य इतिहास'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {language === 'en'
              ? 'Track your performance over time'
              : language === 'bn'
                ? 'সময়ের সাথে আপনার পারফরম্যান্স ট্র্যাক করুন'
                : language === 'es'
                  ? 'Realice un seguimiento de su rendimiento a lo largo del tiempo'
                  : 'समय के साथ अपने प्रदर्शन को ट्रैक करें'}
          </Text>
        </View>

        {/* Calendar button */}
        <TouchableOpacity
          style={styles.calendarBtn}
          onPress={() => setDatePickerVisible(true)}
          activeOpacity={0.7}>
          <MaterialIcons name="event" size={16} color={colors.primary[400]} />
          <Text style={styles.calendarBtnLabel}>
            {isToday(selectedDate) ? t.common.today : formatDateISO(selectedDate)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Loading State */}
      {loading && unifiedTransactions.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>
            {language === 'en'
              ? 'Loading history...'
              : language === 'bn'
                ? 'ইতিহাস লোড হচ্ছে...'
                : language === 'es'
                  ? 'Cargando historial...'
                  : 'इतिहास लोड हो रहा है...'}
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          renderItem={renderTransaction}
          renderSectionHeader={({section: {title}}) => (
            <View style={styles.sectionHeaderContainer}>
              <Text style={styles.sectionHeaderTitle}>{title}</Text>
            </View>
          )}
          keyExtractor={item => item.id + '-' + item.type}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          stickySectionHeadersEnabled={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[colors.primary[500]]}
              tintColor={colors.primary[500]}
            />
          }
        />
      )}

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={datePickerVisible}
        selectedDate={selectedDate}
        onClose={() => setDatePickerVisible(false)}
        onDateChange={(date: Date) => {
          setSelectedDate(date);
          setDatePickerVisible(false);
        }}
      />
    </SafeAreaView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const getStyles = (colors: ThemeColors, isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.default,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.background.paper,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: isDarkMode ? 0.2 : 0.06,
      shadowRadius: 6,
      elevation: 4,
    },
    headerLeft: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text.primary,
    },
    headerSubtitle: {
      fontSize: 12,
      color: colors.text.secondary,
      marginTop: 2,
    },
    calendarBtn: {
      flexDirection: 'row',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: colors.background.paper,
      borderWidth: 1,
      borderColor: colors.border.main,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4,
    },
    calendarBtnLabel: {
      fontSize: 10,
      color: colors.text.secondary,
      fontWeight: '600',
    },
    listContent: {
      padding: 16,
      paddingBottom: 24,
    },
    // ── Filter Tabs ──
    filterContainer: {
      flexDirection: 'row',
      backgroundColor: colors.background.paper,
      borderRadius: 12,
      padding: 4,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    filterTab: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      borderRadius: 8,
    },
    filterTabActive: {
      backgroundColor: colors.primary[500],
    },
    filterTabText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text.secondary,
    },
    filterTabTextActive: {
      color: '#FFFFFF',
    },
    // ── Overview Card ──
    overviewCard: {
      backgroundColor: colors.background.paper,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border.light,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: isDarkMode ? 0.2 : 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    overviewMain: {
      alignItems: 'center',
      paddingVertical: 8,
    },
    overviewLabel: {
      fontSize: 12,
      fontWeight: '600',
      textTransform: 'uppercase',
      color: colors.text.secondary,
      letterSpacing: 0.8,
      marginBottom: 4,
    },
    overviewValue: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.success.main,
    },
    overviewSubtitle: {
      fontSize: 12,
      color: colors.text.secondary,
      marginTop: 2,
    },
    overviewDivider: {
      height: 1,
      backgroundColor: colors.border.light,
      marginVertical: 14,
    },
    overviewStatsContainer: {
      gap: 12,
    },
    overviewStatRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    overviewStatItem: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 10,
    },
    statIcon: {
      padding: 6,
      backgroundColor: isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)',
      borderRadius: 8,
    },
    statLabel: {
      fontSize: 11,
      color: colors.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    statValue: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text.primary,
    },
    // ── Timeline Section Header ──
    sectionHeaderContainer: {
      paddingVertical: 8,
      marginTop: 12,
      marginBottom: 6,
    },
    sectionHeaderTitle: {
      fontSize: 12,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      color: colors.text.secondary,
    },
    // ── Entry Card (legacy, kept to prevent compile/TS issues if any dependencies exist) ──
    entryCard: {
      backgroundColor: colors.background.paper,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    entryHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    entryDateContainer: {},
    entryDate: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.primary,
    },
    entryTime: {
      fontSize: 12,
      color: colors.text.secondary,
    },
    paymentBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    paymentBadgeText: {
      fontSize: 11,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    entryService: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text.primary,
    },
    entryFooter: {
      flexDirection: 'row',
      gap: 16,
    },
    entryPriceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    entryPriceLabel: {
      fontSize: 13,
      color: colors.text.secondary,
    },
    entryPrice: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text.primary,
    },
    entryTipContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    entryTipLabel: {
      fontSize: 13,
      color: colors.text.secondary,
    },
    entryTip: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.warning.main,
    },
    entryTotal: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    entryTotalLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.secondary,
    },
    entryTotalAmount: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.success.main,
    },
    entriesHeader: {
      marginBottom: 12,
      marginTop: 8,
    },
    entriesHeaderTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
    },
    // ── Unified custom transaction card styles ──
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
    // ── States ──
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 16,
    },
    loadingText: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 60,
      paddingHorizontal: 20,
      backgroundColor: colors.background.paper,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border.light,
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
    emptyText: {
      fontSize: 14,
      color: colors.text.secondary,
      textAlign: 'center',
      lineHeight: 20,
    },
  });
