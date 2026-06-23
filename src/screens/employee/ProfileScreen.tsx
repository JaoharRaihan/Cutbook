/**
 * ProfileScreen.tsx
 * Employee profile with personal info, stats, language & theme settings
 */

import React, {useMemo, useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  Switch,
  Modal,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAuth, useOrg, useData, useTheme, useLanguage, getLanguageName} from '@/context';
import {TransactionStatus} from '@/types';
import {formatBDT, calculateEmployeeCommission} from '@/utils';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import {useThemedStyles} from '@/hooks/useThemedStyles';
import {ThemeColors} from '@/constants/theme';
import {loadNotificationsEnabled, saveNotificationsEnabled} from '@/utils/storage';

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

export default function ProfileScreen(): React.ReactElement {
  const {user: currentUser, logout} = useAuth();
  const {currentOrg, employeeTransactions} = useOrg();
  const {workEntries} = useData();
  const {isDarkMode, toggleDarkMode, colors} = useTheme();
  const {language, setLanguage, t} = useLanguage();

  const styles = useThemedStyles(getStyles);

  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    const loadPrefs = async () => {
      const enabled = await loadNotificationsEnabled();
      setNotificationsEnabled(enabled);
    };
    loadPrefs();
  }, []);

  // Get real work entries for this employee
  const employeeEntries = useMemo(() => {
    if (!currentUser?.id || !workEntries) return [];
    return workEntries.filter(e => e.employeeId === currentUser.id);
  }, [currentUser?.id, workEntries]);

  // Get accepted transactions total for cash account
  const cashAccount = useMemo(() => {
    if (!currentUser?.id || !employeeTransactions) return {received: 0, pending: 0};
    const accepted = employeeTransactions
      .filter(txn => txn.employeeId === currentUser.id && txn.status === TransactionStatus.ACCEPTED)
      .reduce((sum, txn) => sum + txn.amount, 0);
    const pending = employeeTransactions
      .filter(txn => txn.employeeId === currentUser.id && txn.status === TransactionStatus.PENDING)
      .reduce((sum, txn) => sum + txn.amount, 0);
    return {received: accepted, pending};
  }, [currentUser?.id, employeeTransactions]);

  // Calculate overall stats from real work entries
  const overallStats = useMemo(() => {
    const entries = employeeEntries;
    const totalServices = entries.length;
    const totalIncome = entries.reduce((sum, entry) => sum + entry.price + (entry.tip || 0), 0);
    const totalTips = entries.reduce((sum, entry) => sum + (entry.tip || 0), 0);
    const avgPerService = totalServices > 0 ? totalIncome / totalServices : 0;

    // Calculate this month stats
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEntries = entries.filter(entry => {
      const entryDate =
        typeof entry.createdAt === 'string' ? new Date(entry.createdAt) : entry.createdAt;
      return entryDate >= monthStart;
    });
    const monthIncome = monthEntries.reduce(
      (sum, entry) => sum + entry.price + (entry.tip || 0),
      0,
    );

    const commissionPercentage = currentUser?.commissionPercentage || 0;
    let monthCommission = 0;
    if (currentOrg) {
      monthEntries.forEach(entry => {
        monthCommission += calculateEmployeeCommission(
          entry.price,
          currentOrg,
          commissionPercentage,
        );
      });
    }
    monthCommission = Math.round(monthCommission);

    return {
      totalServices,
      totalIncome,
      totalTips,
      avgPerService,
      monthIncome,
      monthServices: monthEntries.length,
      monthCommission,
    };
  }, [employeeEntries, currentOrg, currentUser?.commissionPercentage]);

  // Calculate earnings info (commission based on price only + tips)
  const earningsInfo = useMemo(() => {
    const commissionPercentage = currentUser?.commissionPercentage || 0;
    let commission = 0;
    if (currentOrg) {
      employeeEntries.forEach(entry => {
        commission += calculateEmployeeCommission(entry.price, currentOrg, commissionPercentage);
      });
    }
    commission = Math.round(commission);
    const totalEarned = commission + overallStats.totalTips;
    const netBalance = totalEarned - cashAccount.received;
    return {commission, totalEarned, netBalance};
  }, [
    overallStats,
    employeeEntries,
    currentOrg,
    currentUser?.commissionPercentage,
    cashAccount.received,
  ]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleLogout = () => {
    Alert.alert(
      t.auth.logout,
      language === 'en'
        ? 'Are you sure you want to logout?'
        : language === 'bn'
          ? 'আপনি কি নিশ্চিত যে আপনি লগআউট করতে চান?'
          : language === 'es'
            ? '¿Está seguro de que desea cerrar sesión?'
            : 'क्या आप वाकई लॉग आउट करना चाहते हैं?',
      [
        {text: t.common.cancel, style: 'cancel'},
        {
          text: t.auth.logout,
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ],
    );
  };

  const handleDarkModeToggle = async () => {
    await toggleDarkMode();
  };

  const handleNotificationsToggle = async () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    await saveNotificationsEnabled(newValue);
  };

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString(
      language === 'en'
        ? 'en-US'
        : language === 'bn'
          ? 'bn-BD'
          : language === 'es'
            ? 'es-ES'
            : 'hi-IN',
      {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      },
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

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with Avatar */}
        <View style={styles.header}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'E'}
            </Text>
          </View>
          <Text style={styles.userName}>{currentUser?.name || 'Employee'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>{t.employees.employee}</Text>
          </View>
        </View>

        {/* Overall Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.profile.statistics}</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <MaterialIcons
                name="content-cut"
                size={32}
                color={colors.primary[500]}
                style={styles.statIcon}
              />
              <Text style={styles.statLabel}>{t.employees.totalServices}</Text>
              <Text style={styles.statValue}>{overallStats.totalServices}</Text>
            </View>

            <View style={styles.statCard}>
              <MaterialIcons
                name="attach-money"
                size={32}
                color={colors.success.main}
                style={styles.statIcon}
              />
              <Text style={styles.statLabel}>{t.employees.totalIncome}</Text>
              <Text style={styles.statValue}>{formatBDT(overallStats.totalIncome)}</Text>
            </View>

            <View style={styles.statCard}>
              <MaterialIcons
                name="card-giftcard"
                size={32}
                color={colors.warning.main}
                style={styles.statIcon}
              />
              <Text style={styles.statLabel}>{t.workEntries.tip}</Text>
              <Text style={styles.statValue}>{formatBDT(overallStats.totalTips)}</Text>
            </View>

            <View style={styles.statCard}>
              <MaterialIcons
                name="monetization-on"
                size={32}
                color={colors.info.main}
                style={styles.statIcon}
              />
              <Text style={styles.statLabel}>
                {language === 'en'
                  ? 'Your Income'
                  : language === 'bn'
                    ? 'আপনার আয়'
                    : language === 'es'
                      ? 'Su Ingreso'
                      : 'आपकी आय'}
              </Text>
              <Text style={styles.statValue}>{formatBDT(earningsInfo.totalEarned)}</Text>
            </View>
          </View>
        </View>

        {/* This Month */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.profile.thisMonth}</Text>

          <View style={[styles.card, styles.monthCard]}>
            <View style={styles.monthRow}>
              <View style={styles.monthItem}>
                <Text style={styles.monthItemLabel}>{t.services.title}</Text>
                <Text style={styles.monthItemValue}>{overallStats.monthServices}</Text>
              </View>
              <View style={styles.monthDivider} />
              <View style={styles.monthItem}>
                <Text style={styles.monthItemLabel}>
                  {language === 'en'
                    ? 'Income'
                    : language === 'bn'
                      ? 'আয়'
                      : language === 'es'
                        ? 'Ingreso'
                        : 'आय'}
                </Text>
                <Text style={styles.monthItemValue}>{formatBDT(overallStats.monthIncome)}</Text>
              </View>
            </View>

            {currentUser?.commissionPercentage && (
              <>
                <View style={styles.monthCommissionDivider} />
                <View style={styles.monthCommission}>
                  <Text style={styles.monthCommissionLabel}>
                    {language === 'en'
                      ? 'Your Commission'
                      : language === 'bn'
                        ? 'আপনার কমিশন'
                        : language === 'es'
                          ? 'Su Comisión'
                          : 'आपका कमीशन'}{' '}
                    (
                    {currentOrg?.defaultCommissionMode === 'fixed'
                      ? formatBDT(currentUser.commissionPercentage, true, 0)
                      : `${currentUser.commissionPercentage}%`}
                    )
                  </Text>
                  <Text style={styles.monthCommissionValue}>
                    {formatBDT(overallStats.monthCommission)}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'en'
              ? 'Personal Information'
              : language === 'bn'
                ? 'ব্যক্তিগত তথ্য'
                : language === 'es'
                  ? 'Información Personal'
                  : 'व्यक्तिगत जानकारी'}
          </Text>

          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.auth.phone}</Text>
              <Text style={styles.infoValue}>{currentUser?.phone}</Text>
            </View>

            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>
                {language === 'en'
                  ? 'Organization'
                  : language === 'bn'
                    ? 'প্রতিষ্ঠান'
                    : language === 'es'
                      ? 'Organización'
                      : 'संगठन'}
              </Text>
              <Text style={styles.infoValue}>{currentOrg?.name || 'N/A'}</Text>
            </View>

            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.profile.memberSince}</Text>
              <Text style={styles.infoValue}>{formatDate(currentUser?.createdAt)}</Text>
            </View>
          </View>
        </View>

        {/* Cash Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'en'
              ? 'Cash Account'
              : language === 'bn'
                ? 'নগদ হিসাব'
                : language === 'es'
                  ? 'Cuenta de Efectivo'
                  : 'नकद खाता'}
          </Text>

          <View style={[styles.card, styles.cashCard]}>
            <View style={styles.cashRow}>
              <View style={styles.cashItem}>
                <Text style={styles.cashLabel}>
                  {language === 'en'
                    ? 'Total Earned'
                    : language === 'bn'
                      ? 'মোট অর্জিত'
                      : language === 'es'
                        ? 'Total Ganado'
                        : 'कुल अर्जित'}
                </Text>
                <Text style={styles.cashValue}>{formatBDT(earningsInfo.totalEarned)}</Text>
                <Text style={styles.cashSubtext}>
                  {language === 'en'
                    ? 'Com. + Tips'
                    : language === 'bn'
                      ? 'কমিশন + টিপস'
                      : language === 'es'
                        ? 'Com. + Propinas'
                        : 'कमीशन + टिप'}
                </Text>
              </View>
              <View style={styles.cashDivider} />
              <View style={styles.cashItem}>
                <Text style={styles.cashLabel}>
                  {language === 'en'
                    ? 'Total Received'
                    : language === 'bn'
                      ? 'মোট প্রাপ্তি'
                      : language === 'es'
                        ? 'Total Recibido'
                        : 'कुल प्राप्त'}
                </Text>
                <Text style={styles.cashValue}>{formatBDT(cashAccount.received)}</Text>
                <Text style={styles.cashSubtext}>
                  {language === 'en'
                    ? 'From accepted payments'
                    : language === 'bn'
                      ? 'অনুমোদিত পেমেন্ট থেকে'
                      : language === 'es'
                        ? 'De pagos aceptados'
                        : 'स्वीकृत भुगतानों से'}
                </Text>
              </View>
            </View>
            <View style={styles.cashSeparator} />
            <View style={styles.cashRow}>
              <View style={styles.cashItem}>
                <Text style={styles.cashLabel}>
                  {language === 'en'
                    ? 'Net Balance'
                    : language === 'bn'
                      ? 'নিট ব্যালেন্স'
                      : language === 'es'
                        ? 'Saldo Neto'
                        : 'शुद्ध शेष'}
                </Text>
                <Text
                  style={[
                    styles.cashValue,
                    earningsInfo.netBalance < 0 && {color: colors.error.main},
                  ]}>
                  {formatBDT(earningsInfo.netBalance)}
                </Text>
                <Text style={styles.cashSubtext}>
                  {language === 'en'
                    ? 'Remaining unpaid'
                    : language === 'bn'
                      ? 'বাকি পরিশোধযোগ্য'
                      : language === 'es'
                        ? 'Restante no pagado'
                        : 'शेष भुगतान'}
                </Text>
              </View>
              <View style={styles.cashDivider} />
              <View style={styles.cashItem}>
                <Text style={styles.cashLabel}>
                  {language === 'en'
                    ? 'Pending'
                    : language === 'bn'
                      ? 'অপেক্ষমাণ'
                      : language === 'es'
                        ? 'Pendiente'
                        : 'लंबित'}
                </Text>
                <Text style={styles.cashValuePending}>{formatBDT(cashAccount.pending)}</Text>
                <Text style={styles.cashSubtext}>
                  {language === 'en'
                    ? 'Awaiting approval'
                    : language === 'bn'
                      ? 'অনুমোদনের অপেক্ষায়'
                      : language === 'es'
                        ? 'Esperando aprobación'
                        : 'स्वीकृति की प्रतीक्षा'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Commission Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.employees.commission}</Text>

          <View style={[styles.card, styles.commissionCard]}>
            <View style={styles.commissionHeader}>
              <Text style={styles.commissionLabel}>
                {language === 'en'
                  ? 'Your Commission Rate'
                  : language === 'bn'
                    ? 'আপনার কমিশনের হার'
                    : language === 'es'
                      ? 'Su Tasa de Comisión'
                      : 'आपकी कमीशन दर'}
              </Text>
              <Text style={styles.commissionValue}>
                {currentOrg?.defaultCommissionMode === 'fixed'
                  ? formatBDT(currentUser?.commissionPercentage || 0, true, 0)
                  : `${currentUser?.commissionPercentage || 0}%`}
              </Text>
            </View>

            <View style={styles.commissionInfo}>
              <Text style={styles.commissionInfoText}>
                💡{' '}
                {currentOrg?.defaultCommissionMode === 'fixed'
                  ? language === 'en'
                    ? `You earn a fixed amount of ${formatBDT(currentUser?.commissionPercentage || 0, true, 0)} for each service you complete`
                    : language === 'bn'
                      ? `আপনার সম্পন্ন করা প্রতিটি সেবার জন্য আপনি ${formatBDT(currentUser?.commissionPercentage || 0, true, 0)} নির্দিষ্ট পরিমাণ উপার্জন করবেন`
                      : language === 'es'
                        ? `Usted gana una cantidad fija de ${formatBDT(currentUser?.commissionPercentage || 0, true, 0)} por cada servicio que complete`
                        : `आप अपनी पूरी की जाने वाली प्रत्येक सेवा के लिए ${formatBDT(currentUser?.commissionPercentage || 0, true, 0)} की एक निश्चित राशि कमाते हैं`
                  : language === 'en'
                    ? `You earn ${currentUser?.commissionPercentage || 0}% of each service you complete`
                    : language === 'bn'
                      ? `আপনার সম্পন্ন করা প্রতিটি সেবার ${currentUser?.commissionPercentage || 0}% আপনি উপার্জন করবেন`
                      : language === 'es'
                        ? `Usted gana el ${currentUser?.commissionPercentage || 0}% de cada servicio que complete`
                        : `आप अपनी पूरी की जाने वाली प्रत्येक सेवा का ${currentUser?.commissionPercentage || 0}% कमाते हैं`}
              </Text>
            </View>

            <View style={styles.commissionExample}>
              <Text style={styles.commissionExampleTitle}>
                {language === 'en'
                  ? 'Example:'
                  : language === 'bn'
                    ? 'উদাহরণ:'
                    : language === 'es'
                      ? 'Ejemplo:'
                      : 'उदाहरण:'}
              </Text>
              <View style={styles.commissionExampleRow}>
                <Text style={styles.commissionExampleLabel}>
                  {language === 'en'
                    ? 'Service:'
                    : language === 'bn'
                      ? 'সেবা:'
                      : language === 'es'
                        ? 'Servicio:'
                        : 'सेवा:'}{' '}
                  ৳500
                </Text>
                <Text style={styles.commissionExampleValue}>
                  {language === 'en'
                    ? 'Your share:'
                    : language === 'bn'
                      ? 'আপনার অংশ:'
                      : language === 'es'
                        ? 'Su parte:'
                        : 'आपका हिस्सा:'}{' '}
                  {currentOrg?.defaultCommissionMode === 'fixed'
                    ? formatBDT(currentUser?.commissionPercentage || 0, true, 0)
                    : formatBDT(
                        Math.round((500 * (currentUser?.commissionPercentage || 0)) / 100),
                        true,
                        0,
                      )}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── App Preferences ── */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <MaterialIcons name="construction" size={20} color={colors.text.primary} />
            <Text style={styles.sectionTitle}>
              {language === 'en'
                ? 'Preferences'
                : language === 'bn'
                  ? 'পছন্দসমূহ'
                  : language === 'es'
                    ? 'Preferencias'
                    : 'प्राथमिकताएं'}
            </Text>
          </View>

          {/* Language Selector */}
          <TouchableOpacity
            style={styles.prefRow}
            onPress={() => setLanguageModalVisible(true)}
            activeOpacity={0.7}>
            <View style={styles.prefLeft}>
              <MaterialIcons
                name="language"
                size={22}
                color={colors.text.secondary}
                style={styles.prefIcon}
              />
              <View>
                <Text style={styles.prefTitle}>{t.settings.language}</Text>
                <Text style={styles.prefSubtitle}>{getLanguageName(language)}</Text>
              </View>
            </View>
            <View style={styles.langBadge}>
              <Text style={styles.langBadgeText}>{language.toUpperCase()}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.prefDivider} />

          {/* Dark Mode Toggle */}
          <View style={styles.prefRow}>
            <View style={styles.prefLeft}>
              <MaterialIcons
                name="brightness-6"
                size={22}
                color={colors.text.secondary}
                style={styles.prefIcon}
              />
              <View>
                <Text style={styles.prefTitle}>{t.settings.theme}</Text>
                <Text style={styles.prefSubtitle}>
                  {isDarkMode ? t.settings.dark : t.settings.light}
                </Text>
              </View>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={handleDarkModeToggle}
              trackColor={{false: colors.border.main, true: colors.primary[300]}}
              thumbColor={isDarkMode ? colors.primary[500] : colors.neutral[400]}
            />
          </View>

          <View style={styles.prefDivider} />

          {/* Notifications Toggle */}
          <View style={styles.prefRow}>
            <View style={styles.prefLeft}>
              <MaterialIcons
                name="notifications"
                size={22}
                color={colors.text.secondary}
                style={styles.prefIcon}
              />
              <View>
                <Text style={styles.prefTitle}>{t.settings.notifications}</Text>
                <Text style={styles.prefSubtitle}>
                  {notificationsEnabled
                    ? t.settings.notificationsDesc
                    : t.settings.notificationsDisabled}
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              trackColor={{false: colors.border.main, true: colors.success.light}}
              thumbColor={notificationsEnabled ? colors.success.main : colors.neutral[400]}
            />
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialIcons name="exit-to-app" size={22} color="#FFFFFF" style={styles.logoutIcon} />
            <Text style={styles.logoutButtonText}>{t.auth.logout}</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>CutBook v1.0.0</Text>
          <Text style={styles.footerSubtext}>Salon Management Made Simple</Text>
        </View>
      </ScrollView>

      {/* Language Selector Modal */}
      <Modal
        visible={languageModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setLanguageModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLanguageModalVisible(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.settings.selectLanguage}</Text>
              <TouchableOpacity onPress={() => setLanguageModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.languageList}>
              {(['en', 'bn', 'es', 'hi'] as const).map(lang => (
                <TouchableOpacity
                  key={lang}
                  style={[styles.languageOption, language === lang && styles.languageOptionActive]}
                  onPress={async () => {
                    await setLanguage(lang);
                    setLanguageModalVisible(false);
                  }}>
                  <Text
                    style={[
                      styles.languageOptionText,
                      language === lang && styles.languageOptionTextActive,
                    ]}>
                    {getLanguageName(lang)}
                  </Text>
                  {language === lang && (
                    <MaterialIcons name="check" size={20} color={colors.primary[500]} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
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
    header: {
      backgroundColor: isDarkMode ? Palette.inkBlack : '#FFFFFF',
      alignItems: 'center',
      paddingVertical: 32,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: isDarkMode ? Palette.darkSlateGrey : Palette.wheat,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: isDarkMode ? 0.2 : 0.06,
      shadowRadius: 6,
      elevation: 4,
    },
    avatarLarge: {
      width: 88,
      height: 88,
      borderRadius: 44,
      backgroundColor: isDarkMode ? Palette.darkSlateGrey : Palette.wheat,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 2,
      borderColor: isDarkMode ? Palette.wheat : Palette.darkSlateGrey,
    },
    avatarLargeText: {
      fontSize: 36,
      fontWeight: '700',
      color: isDarkMode ? '#FFFFFF' : Palette.inkBlack,
    },
    userName: {
      fontSize: 22,
      fontWeight: '700',
      color: isDarkMode ? '#FFFFFF' : Palette.inkBlack,
      marginBottom: 8,
    },
    roleBadge: {
      backgroundColor: Palette.darkSlateGrey,
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: Palette.wheat,
    },
    roleBadgeText: {
      fontSize: 13,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    section: {
      paddingHorizontal: 16,
      marginTop: 24,
    },
    sectionTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: isDarkMode ? Palette.wheat : Palette.darkSlateGrey,
      marginBottom: 12,
    },
    card: {
      backgroundColor: isDarkMode ? Palette.midnightViolet : '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: isDarkMode ? Palette.darkSlateGrey : Palette.wheat,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: isDarkMode ? 0.15 : 0.04,
      shadowRadius: 4,
      elevation: 2,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 12,
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
    commissionCard: {
      backgroundColor: isDarkMode ? Palette.midnightViolet : '#FFFFFF',
      borderColor: isDarkMode ? Palette.darkSlateGrey : Palette.wheat,
    },
    commissionHeader: {
      alignItems: 'center',
      paddingVertical: 8,
      marginBottom: 16,
    },
    commissionLabel: {
      fontSize: 14,
      color: isDarkMode ? Palette.wheat : Palette.darkSlateGrey,
      marginBottom: 8,
    },
    commissionValue: {
      fontSize: 48,
      fontWeight: '700',
      color: colors.success.main,
    },
    commissionInfo: {
      backgroundColor: isDarkMode ? Palette.darkSlateGrey : '#FAF7F2',
      borderRadius: 8,
      padding: 12,
      marginBottom: 12,
    },
    commissionInfoText: {
      fontSize: 13,
      color: isDarkMode ? '#FFFFFF' : Palette.darkSlateGrey,
      lineHeight: 20,
    },
    commissionExample: {
      backgroundColor: isDarkMode ? Palette.darkSlateGrey : '#FAF7F2',
      borderRadius: 8,
      padding: 12,
    },
    commissionExampleTitle: {
      fontSize: 12,
      fontWeight: '600',
      color: isDarkMode ? '#FFFFFF' : Palette.darkSlateGrey,
      marginBottom: 8,
    },
    commissionExampleRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    commissionExampleLabel: {
      fontSize: 13,
      color: colors.text.secondary,
    },
    commissionExampleValue: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.success.main,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    statCard: {
      flex: 1,
      minWidth: '47%',
      backgroundColor: isDarkMode ? Palette.midnightViolet : '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDarkMode ? Palette.darkSlateGrey : Palette.wheat,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: isDarkMode ? 0.15 : 0.04,
      shadowRadius: 4,
      elevation: 2,
    },
    statIcon: {
      marginBottom: 8,
    },
    statLabel: {
      fontSize: 12,
      color: colors.text.secondary,
      marginBottom: 6,
    },
    statValue: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text.primary,
    },
    monthCard: {
      backgroundColor: isDarkMode ? Palette.midnightViolet : '#FFFFFF',
      borderColor: isDarkMode ? Palette.darkSlateGrey : Palette.wheat,
    },
    monthRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    monthItem: {
      flex: 1,
      alignItems: 'center',
    },
    monthItemLabel: {
      fontSize: 13,
      color: colors.text.secondary,
      marginBottom: 6,
    },
    monthItemValue: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text.primary,
    },
    monthDivider: {
      width: 1,
      height: 40,
      backgroundColor: isDarkMode ? 'rgba(239,214,172,0.2)' : colors.border.light,
    },
    monthCommissionDivider: {
      height: 1,
      backgroundColor: isDarkMode ? 'rgba(239,214,172,0.2)' : colors.border.light,
      marginVertical: 12,
    },
    monthCommission: {
      alignItems: 'center',
    },
    monthCommissionLabel: {
      fontSize: 13,
      color: colors.text.secondary,
      marginBottom: 6,
    },
    monthCommissionValue: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.success.main,
    },
    cashCard: {
      backgroundColor: isDarkMode ? Palette.midnightViolet : '#FFFFFF',
      borderLeftWidth: 4,
      borderLeftColor: Palette.burntOrange,
      borderColor: isDarkMode ? Palette.darkSlateGrey : Palette.wheat,
    },
    cashRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    cashItem: {
      flex: 1,
      alignItems: 'center',
    },
    cashLabel: {
      fontSize: 12,
      color: colors.text.secondary,
      marginBottom: 4,
      fontWeight: '600',
    },
    cashValue: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.success.main,
      marginBottom: 4,
    },
    cashValuePending: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.warning.main,
      marginBottom: 4,
    },
    cashSubtext: {
      fontSize: 11,
      color: colors.text.hint,
      fontStyle: 'italic',
    },
    cashDivider: {
      width: 1,
      height: 60,
      backgroundColor: isDarkMode ? 'rgba(239,214,172,0.2)' : colors.border.light,
      marginHorizontal: 12,
    },
    // ── Preferences ──
    prefRow: {
      backgroundColor: isDarkMode ? Palette.midnightViolet : '#FFFFFF',
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDarkMode ? Palette.darkSlateGrey : Palette.wheat,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: isDarkMode ? 0.15 : 0.04,
      shadowRadius: 4,
      elevation: 2,
    },
    prefLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    prefIcon: {
      marginRight: 12,
    },
    prefTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 2,
    },
    prefSubtitle: {
      fontSize: 13,
      color: colors.text.secondary,
    },
    prefDivider: {
      height: 10,
    },
    langBadge: {
      backgroundColor: isDarkMode ? Palette.darkSlateGrey : Palette.wheat,
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: Palette.wheat,
    },
    langBadgeText: {
      fontSize: 13,
      fontWeight: '700',
      color: isDarkMode ? '#FFFFFF' : Palette.darkSlateGrey,
    },
    logoutButton: {
      backgroundColor: colors.error.main,
      borderRadius: 12,
      paddingVertical: 16,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
    logoutButtonText: {
      fontSize: 18,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    logoutIcon: {
      marginRight: 8,
    },
    cashSeparator: {
      height: 1,
      backgroundColor: isDarkMode ? 'rgba(239,214,172,0.2)' : colors.border.light,
      marginVertical: 12,
    },
    footer: {
      alignItems: 'center',
      paddingVertical: 32,
    },
    footerText: {
      fontSize: 13,
      color: colors.text.hint,
      marginBottom: 4,
    },
    footerSubtext: {
      fontSize: 11,
      color: colors.text.hint,
    },
    // ── Modal ──
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.background.paper,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 24,
      maxHeight: '70%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
      paddingBottom: 12,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text.primary,
    },
    languageList: {
      gap: 8,
    },
    languageOption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      backgroundColor: colors.background.default,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    languageOptionActive: {
      borderColor: colors.primary[500],
      backgroundColor: isDarkMode ? colors.neutral[100] : colors.primary[50],
    },
    languageOptionText: {
      fontSize: 16,
      color: colors.text.primary,
      fontWeight: '500',
    },
    languageOptionTextActive: {
      color: colors.primary[500],
      fontWeight: '700',
    },
  });
