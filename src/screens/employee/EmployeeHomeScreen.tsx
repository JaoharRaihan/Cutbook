/**
 * EmployeeHomeScreen.tsx
 * Employee home screen showing today's summary and recent entries
 */

import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAuth, useOrg, useData, useTheme, useLanguage} from '@/context';
import {useNotifications} from '@/hooks/useNotifications';
import {WorkEntry, PaymentMethod, EmployeePermission, TimePeriod} from '@/types';
import {formatBDT, calculateEmployeeCommission} from '@/utils';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import {useThemedStyles} from '@/hooks/useThemedStyles';
import {ThemeColors} from '@/constants/theme';
import DatePickerModal from '@/components/UI/DatePickerModal';
import {formatDateISO, isToday} from '@/utils/date';
import {getDateRange} from '@/hooks/useDailySummary';
import {usePushNotifications} from '@/hooks/usePushNotifications';
import SummaryCard from '@/components/SummaryCard';

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

export default function EmployeeHomeScreen({navigation}: any): React.ReactElement {
  const {user: currentUser} = useAuth();
  const {currentOrg, employeeTransactions} = useOrg();
  const {workEntries, refreshData} = useData();
  const {unreadCount} = useNotifications();
  const [refreshing, setRefreshing] = useState(false);
  const {isDarkMode, colors} = useTheme();
  const {language, t} = useLanguage();

  const styles = useThemedStyles(getStyles);

  // Initialize push notifications — requests permission + saves FCM token
  usePushNotifications(navigation);

  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [timePeriod, setTimePeriod] = useState<TimePeriod>(TimePeriod.TODAY);

  const todayStr = useMemo(() => {
    return selectedDate.toLocaleDateString(
      language === 'en'
        ? 'en-US'
        : language === 'bn'
          ? 'bn-BD'
          : language === 'es'
            ? 'es-ES'
            : 'hi-IN',
      {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
      },
    );
  }, [selectedDate, language]);

  // Filter for current employee's entries
  const myEntries = useMemo(() => {
    return workEntries.filter(entry => entry.employeeId === currentUser?.id);
  }, [workEntries, currentUser]);

  // Get date range based on selected period and date
  const dateRange = useMemo(() => {
    return getDateRange(timePeriod, selectedDate);
  }, [timePeriod, selectedDate]);

  // Filter entries for the selected employee and date range
  const todayEntries = useMemo(() => {
    return myEntries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      return entryDate >= dateRange.start && entryDate <= dateRange.end;
    });
  }, [myEntries, dateRange]);

  // Calculate statistics from filtered entries
  const todayStats = useMemo(() => {
    const totalServices = todayEntries.length;
    const serviceRevenue = todayEntries.reduce((sum, entry) => sum + entry.price, 0);
    const totalTips = todayEntries.reduce((sum, entry) => sum + (entry.tip || 0), 0);
    const totalIncome = serviceRevenue + totalTips; // total revenue generated

    // Employee's earnings: commission on service price + 100% of tips
    const commissionPercentage = currentUser?.commissionPercentage || 0;

    let commission = 0;
    if (currentOrg) {
      todayEntries.forEach(entry => {
        commission += calculateEmployeeCommission(entry.price, currentOrg, commissionPercentage);
      });
    }
    commission = Math.round(commission);
    const employeeEarnings = commission + totalTips;

    return {totalServices, totalIncome, serviceRevenue, totalTips, commission, employeeEarnings};
  }, [todayEntries, currentOrg, currentUser?.commissionPercentage]);

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

  // Dynamic summary title based on time period
  const summaryTitle = useMemo(() => {
    switch (timePeriod) {
      case TimePeriod.TODAY:
        return language === 'en'
          ? "Today's Summary"
          : language === 'bn'
            ? 'আজকের সারসংক্ষেপ'
            : language === 'es'
              ? 'Resumen de Hoy'
              : 'आज का सारांश';
      case TimePeriod.WEEKLY:
        return language === 'en'
          ? 'Weekly Summary'
          : language === 'bn'
            ? 'সাপ্তাহিক সারসংক্ষেপ'
            : language === 'es'
              ? 'Resumen Semanal'
              : 'साप्ताहिक सारांश';
      case TimePeriod.MONTHLY:
        return language === 'en'
          ? 'Monthly Summary'
          : language === 'bn'
            ? 'মাসিক সারসংক্ষেপ'
            : language === 'es'
              ? 'Resumen Mensual'
              : 'मासिक सारांश';
      case TimePeriod.YEARLY:
        return language === 'en'
          ? 'Yearly Summary'
          : language === 'bn'
            ? 'বার্ষিক সারসংক্ষেপ'
            : language === 'es'
              ? 'Resumen Anual'
              : 'वार्षिक सारांश';
      default:
        return language === 'en'
          ? 'Summary'
          : language === 'bn'
            ? 'সারসংক্ষেপ'
            : language === 'es'
              ? 'Resumen'
              : 'सारांश';
    }
  }, [timePeriod, language]);

  // Localized earnings subtext
  const subtextText = useMemo(() => {
    const commissionVal = todayStats.commission;
    const tipsVal = todayStats.totalTips;
    const earningsVal = todayStats.employeeEarnings;
    const pct = currentUser?.commissionPercentage || 0;
    const pctStr =
      currentOrg?.defaultCommissionMode === 'fixed' ? formatBDT(pct, true, 0) : `${pct}%`;

    if (language === 'en') {
      return `Your Share (${pctStr} + Tips): ৳${earningsVal} (Comm: ৳${commissionVal}, Tips: ৳${tipsVal})`;
    } else if (language === 'bn') {
      return `আপনার অংশ (${pctStr} + টিপস): ৳${earningsVal} (কমিশন: ৳${commissionVal}, টিপস: ৳${tipsVal})`;
    } else if (language === 'es') {
      return `Tu Parte (${pctStr} + Propina): ৳${earningsVal} (Com: ৳${commissionVal}, Propina: ৳${tipsVal})`;
    } else {
      return `आपका हिस्सा (${pctStr} + टिप): ৳${earningsVal} (कमीशन: ৳${commissionVal}, टिप: ৳${tipsVal})`;
    }
  }, [todayStats, currentOrg, currentUser?.commissionPercentage, language]);

  // Localized services count message
  const servicesSubtext = useMemo(() => {
    const count = todayStats.totalServices;
    if (count === 0) {
      return language === 'en'
        ? 'No services yet'
        : language === 'bn'
          ? 'কোন সেবা নেই'
          : language === 'es'
            ? 'Sin servicios aún'
            : 'कोई सेवा नहीं';
    } else if (count === 1) {
      return language === 'en'
        ? 'Keep it up!'
        : language === 'bn'
          ? 'চালিয়ে যান!'
          : language === 'es'
            ? '¡Sigue así!'
            : 'इसे जारी रखें!';
    } else {
      return language === 'en'
        ? 'Great work!'
        : language === 'bn'
          ? 'অসাধারণ কাজ!'
          : language === 'es'
            ? '¡Buen trabajo!'
            : 'बहुत बढ़िया!';
    }
  }, [todayStats.totalServices, language]);

  // Localized tips message
  const tipsSubtext = useMemo(() => {
    return todayStats.totalTips > 0
      ? language === 'en'
        ? 'Excellent!'
        : language === 'bn'
          ? 'চমৎকার!'
          : language === 'es'
            ? '¡Excelente!'
            : 'बहुत बढ़िया!'
      : language === 'en'
        ? 'No tips yet'
        : language === 'bn'
          ? 'কোন টিপস নেই'
          : language === 'es'
            ? 'Sin propinas aún'
            : 'कोई टिप नहीं';
  }, [todayStats.totalTips, language]);

  // Localized empty state title
  const emptyTitleText = useMemo(() => {
    if (timePeriod === TimePeriod.TODAY) {
      return language === 'en'
        ? 'No services yet today'
        : language === 'bn'
          ? 'আজ কোনো সেবা দেওয়া হয়নি'
          : language === 'es'
            ? 'Sin servicios hoy aún'
            : 'आज अभी तक कोई सेवा नहीं है';
    } else {
      return language === 'en'
        ? 'No services in this period'
        : language === 'bn'
          ? 'এই সময়ের মধ্যে কোনো সেবা দেওয়া হয়নি'
          : language === 'es'
            ? 'Sin servicios en este período'
            : 'इस अवधि में कोई सेवा नहीं';
    }
  }, [timePeriod, language]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewHistory = () => {
    navigation.navigate('History');
  };

  const handleAddEntry = () => {
    // Check if employee has permission to add entries
    const canAddEntries =
      currentUser?.permissions?.includes(EmployeePermission.CAN_ADD_ENTRIES) || false;

    if (!canAddEntries) {
      Alert.alert(
        language === 'en'
          ? 'Permission Denied'
          : language === 'bn'
            ? 'অনুমতি নেই'
            : language === 'es'
              ? 'Permiso Denegado'
              : 'अनुमति अस्वीकृत',
        language === 'en'
          ? 'Your manager has not granted you access to add work entries. Please contact your manager to enable this feature.'
          : language === 'bn'
            ? 'আপনার ম্যানেজার আপনাকে কাজের এন্ট্রি যোগ করার অনুমতি দেননি। এই বৈশিষ্ট্যটি সক্রিয় করতে আপনার ম্যানেজারের সাথে যোগাযোগ করুন।'
            : language === 'es'
              ? 'Su gerente no le ha otorgado acceso para agregar entradas de trabajo. Comuníquese con su gerente para habilitar esta función.'
              : 'आपके प्रबंधक ने आपको काम की प्रविष्टियाँ जोड़ने की अनुमति नहीं दी है। कृपया इस सुविधा को सक्षम करने के लिए अपने प्रबंधक से संपर्क करें।',
        [{text: t.common.done}],
      );
      return;
    }

    navigation.navigate('AddEntry');
  };

  // Helper to format payment method
  const getPaymentLabel = (method: PaymentMethod) => {
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
        return t.payment.other;
    }
  };

  // Helper to format entry time
  const formatTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  // ============================================================================
  // RENDER ITEMS
  // ============================================================================

  const renderRecentEntry = (entry: WorkEntry) => {
    const totalAmount = entry.price + (entry.tip || 0);

    return (
      <View key={entry.id} style={styles.entryCard}>
        <View style={styles.entryHeader}>
          <View style={styles.entryTimeContainer}>
            <Text style={styles.entryTime}>{formatTime(entry.createdAt)}</Text>
            <View
              style={[
                styles.paymentBadge,
                entry.paymentMethod === PaymentMethod.CASH
                  ? styles.badgeCash
                  : entry.paymentMethod === PaymentMethod.BKASH
                    ? styles.badgeBkash
                    : entry.paymentMethod === PaymentMethod.NAGAD
                      ? styles.badgeNagad
                      : styles.badgeCard,
              ]}>
              <Text style={styles.paymentBadgeText}>{getPaymentLabel(entry.paymentMethod)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.entryService}>{entry.serviceName}</Text>

        <View style={styles.entryFooter}>
          <Text style={styles.entryPrice}>{formatBDT(totalAmount)}</Text>
          {entry.tip && entry.tip > 0 ? (
            <Text style={styles.entryTip}>
              +{formatBDT(entry.tip || 0)}{' '}
              {language === 'en'
                ? 'tip'
                : language === 'bn'
                  ? 'টিপ'
                  : language === 'es'
                    ? 'propina'
                    : 'टिप'}
            </Text>
          ) : null}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background.paper}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary[500]]}
            tintColor={isDarkMode ? '#FFFFFF' : colors.primary[500]}
          />
        }>
        {/* Header */}
        <View style={styles.header}>
          <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'E'}
              </Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.greeting}>
                {language === 'en'
                  ? 'Hello,'
                  : language === 'bn'
                    ? 'হ্যালো,'
                    : language === 'es'
                      ? 'Hola,'
                      : 'नमस्ते,'}
              </Text>
              <Text style={styles.userName}>{currentUser?.name || 'Employee'}</Text>
              <Text style={styles.orgName}>{currentOrg?.name}</Text>
            </View>
          </View>

          {/* Header Right Actions */}
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setDatePickerVisible(true)}
              activeOpacity={0.7}>
              <MaterialIcons name="event" size={16} color="#7eadf8" />
              <Text style={styles.dateButtonLabel}>
                {isToday(selectedDate) ? t.common.today : formatDateISO(selectedDate)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate('Notifications')}
              activeOpacity={0.7}
              style={styles.notificationButton}>
              <MaterialIcons
                name="notifications"
                size={26}
                color={isDarkMode ? '#FFFFFF' : Palette.inkBlack}
              />
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 99 ? '99+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Date string */}
        <View style={styles.dateBar}>
          <Text style={styles.dateText}>{todayStr}</Text>
        </View>

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
        </View>

        {/* Summary Card */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>{summaryTitle}</Text>
          <SummaryCard
            title={
              language === 'en'
                ? 'Total Income'
                : language === 'bn'
                  ? 'মোট আয়'
                  : language === 'es'
                    ? 'Ingresos Totales'
                    : 'कुल आय'
            }
            value={formatBDT(todayStats.employeeEarnings)}
            icon={
              <MaterialIcons
                name="monetization-on"
                size={26}
                color={isDarkMode ? colors.success.light : colors.success.dark}
              />
            }
            subtitle={currentUser?.commissionPercentage ? subtextText : undefined}
            color="success"
          />

          <View style={styles.gridContainer}>
            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <SummaryCard
                  title={
                    language === 'en'
                      ? 'Services'
                      : language === 'bn'
                        ? 'সেবা'
                        : language === 'es'
                          ? 'Servicios'
                          : 'सेवाएं'
                  }
                  value={String(todayStats.totalServices)}
                  icon={
                    <MaterialIcons
                      name="content-cut"
                      size={24}
                      color={isDarkMode ? colors.primary[300] : colors.primary[700]}
                    />
                  }
                  subtitle={servicesSubtext}
                  color="primary"
                  style={{flex: 1, minHeight: 160, justifyContent: 'space-between'}}
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
                  value={formatBDT(todayStats.totalTips)}
                  icon={
                    <MaterialIcons
                      name="savings"
                      size={24}
                      color={isDarkMode ? colors.warning.light : colors.warning.dark}
                    />
                  }
                  subtitle={tipsSubtext}
                  color="warning"
                  style={{flex: 1, minHeight: 160, justifyContent: 'space-between'}}
                />
              </View>
            </View>

            <View style={styles.gridRow}>
              <View style={styles.gridItem}>
                <SummaryCard
                  title={
                    language === 'en'
                      ? 'Commission'
                      : language === 'bn'
                        ? 'কমিশন'
                        : language === 'es'
                          ? 'Comisión'
                          : 'कमीशन'
                  }
                  value={formatBDT(todayStats.commission)}
                  icon={
                    <MaterialIcons
                      name="star"
                      size={24}
                      color={isDarkMode ? colors.info.light : colors.info.dark}
                    />
                  }
                  subtitle={
                    currentOrg?.defaultCommissionMode === 'fixed'
                      ? language === 'en'
                        ? 'Fixed per service'
                        : language === 'bn'
                          ? 'প্রতি সেবায় নির্দিষ্ট'
                          : language === 'es'
                            ? 'Fija por servicio'
                            : 'प्रति सेवा निश्चित'
                      : `${currentUser?.commissionPercentage || 0}% rate`
                  }
                  color="info"
                  style={{flex: 1, minHeight: 160, justifyContent: 'space-between'}}
                />
              </View>

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
                      color={isDarkMode ? colors.error.light : colors.error.dark}
                    />
                  }
                  subtitle={
                    language === 'en'
                      ? 'From salon'
                      : language === 'bn'
                        ? 'সেলুন থেকে'
                        : language === 'es'
                          ? 'Del salón'
                          : 'सैलून से'
                  }
                  color="error"
                  style={{flex: 1, minHeight: 160, justifyContent: 'space-between'}}
                />
              </View>
            </View>
          </View>
        </View>

        {/* Recent Services */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              {language === 'en'
                ? 'Recent Services'
                : language === 'bn'
                  ? 'সাম্প্রতিক সেবাসমূহ'
                  : language === 'es'
                    ? 'Servicios Recientes'
                    : 'हाल की सेवाएं'}
            </Text>
            {todayEntries.length > 0 && (
              <TouchableOpacity onPress={handleViewHistory}>
                <Text style={styles.viewAllLink}>
                  {language === 'en'
                    ? 'View All →'
                    : language === 'bn'
                      ? 'সব দেখুন →'
                      : language === 'es'
                        ? 'Ver Todos →'
                        : 'सभी देखें →'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {todayEntries.length > 0 ? (
            <View style={styles.entriesList}>
              {todayEntries.slice(0, 5).map(entry => renderRecentEntry(entry))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons
                name="library-add"
                size={48}
                color={colors.text.hint}
                style={styles.emptyIcon}
              />
              <Text style={styles.emptyTitle}>{emptyTitleText}</Text>
              <Text style={styles.emptyText}>
                {language === 'en'
                  ? 'Your completed services will appear here'
                  : language === 'bn'
                    ? 'আপনার সম্পন্ন করা সেবাসমূহ এখানে প্রদর্শিত হবে'
                    : language === 'es'
                      ? 'Sus servicios completados aparecerán aquí'
                      : 'आपकी पूरी की गई सेवाएं यहां दिखाई देंगी'}
              </Text>
            </View>
          )}

          {todayEntries.length > 5 && (
            <TouchableOpacity style={styles.viewAllButton} onPress={handleViewHistory}>
              <Text style={styles.viewAllButtonText}>
                {language === 'en'
                  ? `View All ${todayEntries.length} Services`
                  : language === 'bn'
                    ? `সব ${todayEntries.length}টি সেবা দেখুন`
                    : language === 'es'
                      ? `Ver los ${todayEntries.length} Servicios`
                      : `सभी ${todayEntries.length} सेवाएं देखें`}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Stats Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'en'
              ? 'Your Info'
              : language === 'bn'
                ? 'আপনার তথ্য'
                : language === 'es'
                  ? 'Su Información'
                  : 'आपकी जानकारी'}
          </Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                {language === 'en'
                  ? 'Commission Rate'
                  : language === 'bn'
                    ? 'কমিশন হার'
                    : language === 'es'
                      ? 'Tasa de Comisión'
                      : 'कमीशन दर'}
              </Text>
              <Text style={styles.infoValue}>
                {currentOrg?.defaultCommissionMode === 'fixed'
                  ? formatBDT(currentUser?.commissionPercentage || 0, true, 0)
                  : `${currentUser?.commissionPercentage || 0}%`}
              </Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.auth.phone}</Text>
              <Text style={styles.infoValue}>{currentUser?.phone}</Text>
            </View>
            {currentUser?.email ? (
              <>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>{t.auth.email}</Text>
                  <Text style={styles.infoValue}>{currentUser.email}</Text>
                </View>
              </>
            ) : null}
          </View>
        </View>

        {/* Action Buttons */}
        {currentUser?.permissions?.includes(EmployeePermission.CAN_ADD_ENTRIES) || false ? (
          <View style={styles.actionButtonsContainer}>
            <TouchableOpacity style={styles.actionButton} onPress={handleAddEntry}>
              <MaterialIcons
                name="domain-add"
                size={24}
                color="#FFFFFF"
                style={styles.actionButtonIcon}
              />
              <Text style={styles.actionButtonText}>
                {language === 'en'
                  ? 'Add Entry'
                  : language === 'bn'
                    ? 'এন্ট্রি যোগ করুন'
                    : language === 'es'
                      ? 'Añadir Entrada'
                      : 'प्रविष्टि जोड़ें'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>

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
      backgroundColor: isDarkMode ? Palette.inkBlack : '#FAFBFB',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 24,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: isDarkMode ? Palette.inkBlack : '#FFFFFF',
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? Palette.darkSlateGrey : Palette.wheat,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: isDarkMode ? 0.2 : 0.06,
      shadowRadius: 6,
      elevation: 4,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: isDarkMode ? Palette.darkSlateGrey : Palette.wheat,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      borderWidth: 1,
      borderColor: isDarkMode ? Palette.wheat : Palette.darkSlateGrey,
    },
    avatarText: {
      fontSize: 18,
      fontWeight: '700',
      color: isDarkMode ? '#FFFFFF' : Palette.inkBlack,
    },
    headerInfo: {
      flex: 1,
    },
    greeting: {
      fontSize: 12,
      color: isDarkMode ? Palette.wheat : Palette.darkSlateGrey,
      marginBottom: 1,
    },
    userName: {
      fontSize: 16,
      fontWeight: '700',
      color: isDarkMode ? '#FFFFFF' : Palette.inkBlack,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    dateButton: {
      flexDirection: 'row',
      paddingHorizontal: 10,
      paddingVertical: 6,
      borderRadius: 8,
      backgroundColor: isDarkMode ? Palette.darkSlateGrey : '#FFFFFF',
      borderWidth: 1,
      borderColor: Palette.wheat,
      justifyContent: 'center',
      alignItems: 'center',
      gap: 4,
    },
    dateButtonLabel: {
      fontSize: 10,
      color: isDarkMode ? Palette.wheat : Palette.darkSlateGrey,
      fontWeight: '600',
    },
    notificationButton: {
      position: 'relative',
      padding: 4,
    },
    badge: {
      position: 'absolute',
      top: 0,
      right: 0,
      backgroundColor: colors.error.main,
      borderRadius: 8,
      minWidth: 16,
      height: 16,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 2,
    },
    badgeText: {
      color: '#FFFFFF',
      fontSize: 9,
      fontWeight: '700',
    },
    dateBar: {
      paddingHorizontal: 16,
      marginTop: 16,
      marginBottom: 4,
    },
    dateText: {
      fontSize: 14,
      color: isDarkMode ? Palette.wheat : Palette.darkSlateGrey,
      fontWeight: '600',
    },
    orgName: {
      fontSize: 11,
      color: isDarkMode ? Palette.wheat : Palette.darkSlateGrey,
      marginTop: 1,
      fontWeight: '600',
    },
    filterContainer: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 16,
      paddingHorizontal: 16,
      marginTop: 12,
    },
    filterButton: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 10,
      borderRadius: 10,
      backgroundColor: isDarkMode ? Palette.inkBlack : '#FFFFFF',
      borderWidth: 1,
      borderColor: isDarkMode ? Palette.darkSlateGrey : Palette.wheat,
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterButtonActive: {
      backgroundColor: Palette.darkSlateGrey,
      borderColor: Palette.darkSlateGrey,
    },
    filterButtonText: {
      fontSize: 11,
      fontWeight: '600',
      color: isDarkMode ? Palette.wheat : Palette.darkSlateGrey,
      textAlign: 'center',
    },
    filterButtonTextActive: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
    summarySection: {
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: isDarkMode ? Palette.wheat : Palette.darkSlateGrey,
      marginBottom: 12,
    },
    gridContainer: {
      marginTop: 12,
    },
    gridRow: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 12,
    },
    gridItem: {
      flex: 1,
    },
    section: {
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    viewAllLink: {
      fontSize: 14,
      color: isDarkMode ? Palette.wheat : Palette.burntOrange,
      fontWeight: '600',
    },
    entriesList: {
      gap: 12,
    },
    entryCard: {
      backgroundColor: isDarkMode ? Palette.midnightViolet : '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: isDarkMode ? Palette.darkSlateGrey : Palette.wheat,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: isDarkMode ? 0.2 : 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    entryHeader: {
      marginBottom: 8,
    },
    entryTimeContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    entryTime: {
      fontSize: 13,
      color: isDarkMode ? 'rgba(255,255,255,0.7)' : colors.text.secondary,
      fontWeight: '500',
    },
    paymentBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 8,
    },
    badgeCash: {
      backgroundColor: isDarkMode ? '#1b3821' : '#E8F5E9',
    },
    badgeBkash: {
      backgroundColor: isDarkMode ? '#381323' : '#FCE4EC',
    },
    badgeNagad: {
      backgroundColor: isDarkMode ? '#382013' : '#FFF3E0',
    },
    badgeCard: {
      backgroundColor: isDarkMode ? '#132838' : '#E3F2FD',
    },
    paymentBadgeText: {
      fontSize: 10,
      fontWeight: '600',
      color: colors.text.primary,
    },
    entryService: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 8,
    },
    entryFooter: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    entryPrice: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text.primary,
    },
    entryTip: {
      fontSize: 12,
      color: colors.success.main,
      fontWeight: '600',
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 32,
      backgroundColor: isDarkMode ? Palette.midnightViolet : '#FFFFFF',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDarkMode ? Palette.darkSlateGrey : Palette.wheat,
      paddingHorizontal: 16,
    },
    emptyIcon: {
      marginBottom: 12,
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: 6,
    },
    emptyText: {
      fontSize: 12,
      color: colors.text.secondary,
      textAlign: 'center',
      lineHeight: 18,
    },
    viewAllButton: {
      backgroundColor: isDarkMode ? Palette.midnightViolet : '#E3F2FD',
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
      marginTop: 12,
      borderWidth: isDarkMode ? 1 : 0,
      borderColor: Palette.darkSlateGrey,
    },
    viewAllButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: isDarkMode ? Palette.wheat : colors.primary[500],
    },
    infoCard: {
      backgroundColor: isDarkMode ? Palette.midnightViolet : '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: isDarkMode ? Palette.darkSlateGrey : Palette.wheat,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: isDarkMode ? 0.2 : 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    infoLabel: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.primary,
    },
    infoDivider: {
      height: 1,
      backgroundColor: isDarkMode ? 'rgba(239,214,172,0.2)' : colors.border.light,
    },
    actionButtonsContainer: {
      flexDirection: 'row',
      gap: 12,
      marginHorizontal: 16,
      marginTop: 16,
      marginBottom: 24,
    },
    actionButton: {
      flex: 1,
      backgroundColor: Palette.darkSlateGrey,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: 'center',
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 8,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    actionButtonIcon: {
      marginRight: 4,
    },
    actionButtonText: {
      fontSize: 15,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });
