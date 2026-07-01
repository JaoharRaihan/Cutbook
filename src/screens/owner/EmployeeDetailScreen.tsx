/**
 * EmployeeDetailScreen.tsx
 * Per-employee commission mode selector + full details management
 */

import React, {useState, useMemo, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useOrg, useData, useTheme, useLanguage} from '@/context';
import {UserStatus, EmployeePermission, UserRole, CommissionMode} from '@/types';
import {formatBDT} from '@/utils/currency';
import {calculateEmployeeCommission} from '@/utils';
import {formatDateISO} from '@/utils/date';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import {useThemedStyles} from '@/hooks/useThemedStyles';
import {ThemeColors} from '@/constants/theme';

// ============================================================================
// MODE CONFIG  (colours aligned with app design system)
// ============================================================================

const MODES = [
  {
    mode: CommissionMode.PERCENTAGE,
    icon: 'show-chart' as const,
    // App primary – dark slate green
    color: '#183A37',
    bg: '#E8F0EE',
    border: '#5A8B84',
    labelEn: 'Percentage',
    labelBn: 'শতাংশ',
    labelEs: 'Porcentaje',
    labelHi: 'प्रतिशत',
    unitEn: '% per service',
    unitBn: '% প্রতি সেবায়',
    unitEs: '% por servicio',
    unitHi: '% प्रति सेवा',
  },
  {
    mode: CommissionMode.FIXED,
    icon: 'attach-money' as const,
    // App secondary – burnt orange
    color: '#C44900',
    bg: '#FFF8F0',
    border: '#EA9352',
    labelEn: 'Fixed Amount',
    labelBn: 'নির্দিষ্ট পরিমাণ',
    labelEs: 'Monto Fijo',
    labelHi: 'निश्चित राशि',
    unitEn: '৳ per service',
    unitBn: '৳ প্রতি সেবায়',
    unitEs: '৳ por servicio',
    unitHi: '৳ प्रति सेवा',
  },
  {
    mode: CommissionMode.SALARY,
    icon: 'account-balance-wallet' as const,
    // App accent – midnight violet
    color: '#432534',
    bg: '#FDF4F8',
    border: '#D262A2',
    labelEn: 'Monthly Salary',
    labelBn: 'মাসিক বেতন',
    labelEs: 'Salario Mensual',
    labelHi: 'मासिक वेतन',
    unitEn: '৳ / month',
    unitBn: '৳ / মাস',
    unitEs: '৳ / mes',
    unitHi: '৳ / माह',
  },
];

function modeLabel(m: (typeof MODES)[0], lang: string) {
  return lang === 'bn'
    ? m.labelBn
    : lang === 'es'
      ? m.labelEs
      : lang === 'hi'
        ? m.labelHi
        : m.labelEn;
}
function modeUnit(m: (typeof MODES)[0], lang: string) {
  return lang === 'bn' ? m.unitBn : lang === 'es' ? m.unitEs : lang === 'hi' ? m.unitHi : m.unitEn;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function EmployeeDetailScreen({route, navigation}: any): React.ReactElement {
  const {employeeId} = route.params;
  const {orgUsers, updateUserInOrg, employeeTransactions, createEmployeeTransaction, currentOrg} =
    useOrg();
  const {workEntries} = useData();
  const {colors, isDarkMode} = useTheme();
  const {language, t} = useLanguage();
  const styles = useThemedStyles(getStyles);

  // ── Local state ──
  const [savingMode, setSavingMode] = useState(false);
  const [isEditingRate, setIsEditingRate] = useState(false);
  const [rateInput, setRateInput] = useState('');
  const [savingRate, setSavingRate] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [savingPayment, setSavingPayment] = useState(false);
  const [savingPerm, setSavingPerm] = useState(false);
  const [savingDelete, setSavingDelete] = useState(false);

  // ── Derived ──
  const employee = useMemo(() => orgUsers.find(u => u.id === employeeId), [employeeId, orgUsers]);

  // Effective mode: employee override → org default → PERCENTAGE
  const effectiveMode: CommissionMode = useMemo(
    () =>
      (employee?.commissionMode as CommissionMode) ||
      (currentOrg?.defaultCommissionMode as CommissionMode) ||
      CommissionMode.PERCENTAGE,
    [employee?.commissionMode, currentOrg?.defaultCommissionMode],
  );

  const modeCfg = useMemo(
    () => MODES.find(m => m.mode === effectiveMode) ?? MODES[0],
    [effectiveMode],
  );

  const orgModeCfg = useMemo(
    () =>
      MODES.find(
        m =>
          m.mode ===
          ((currentOrg?.defaultCommissionMode as CommissionMode) || CommissionMode.PERCENTAGE),
      ) ?? MODES[0],
    [currentOrg?.defaultCommissionMode],
  );

  const isOrgDefault = !employee?.commissionMode; // No per-employee override set

  // ── Stats ──
  const stats = useMemo(() => {
    if (!employee) return null;
    const entries = workEntries.filter(e => e.employeeId === employeeId);
    const now = new Date();
    const ms = new Date(now.getFullYear(), now.getMonth(), 1);
    const me = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const monthEntries = entries.filter(e => {
      const d = typeof e.createdAt === 'string' ? new Date(e.createdAt) : e.createdAt;
      return d >= ms && d <= me;
    });

    // Commission earned (all-time) using per-employee effective mode + value
    let totalCommission = 0;
    if (currentOrg) {
      if (effectiveMode === CommissionMode.SALARY) {
        // salary: use months since join * monthly salary
        const joined = employee.createdAt ? new Date(employee.createdAt) : new Date();
        const diffM = Math.max(
          1,
          (now.getFullYear() - joined.getFullYear()) * 12 + now.getMonth() - joined.getMonth() + 1,
        );
        totalCommission = (employee.monthlySalary || 0) * diffM;
      } else {
        // build a fake org with this employee's effective mode for calculation
        const fakeOrg = {...currentOrg, defaultCommissionMode: effectiveMode as any};
        entries.forEach(e => {
          totalCommission += calculateEmployeeCommission(
            e.price,
            fakeOrg,
            employee.commissionPercentage || 0,
          );
        });
      }
    }

    return {
      totalServices: entries.length,
      totalRevenue: entries.reduce((s, e) => s + e.price, 0),
      totalTips: entries.reduce((s, e) => s + (e.tip || 0), 0),
      thisMonthServices: monthEntries.length,
      thisMonthRevenue: monthEntries.reduce((s, e) => s + e.price, 0),
      totalCommission: Math.round(totalCommission),
    };
  }, [employee, employeeId, workEntries, currentOrg, effectiveMode]);

  const totalReceived = useMemo(
    () =>
      employeeTransactions
        .filter(p => p.employeeId === employeeId && p.status === 'accepted')
        .reduce((s, p) => s + p.amount, 0),
    [employeeTransactions, employeeId],
  );

  const totalPending = useMemo(
    () =>
      employeeTransactions
        .filter(p => p.employeeId === employeeId && p.status === 'pending')
        .reduce((s, p) => s + p.amount, 0),
    [employeeTransactions, employeeId],
  );

  // ── Current rate display ──
  const currentRate = useMemo(() => {
    if (effectiveMode === CommissionMode.SALARY) {
      return formatBDT(employee?.monthlySalary || 0);
    } else if (effectiveMode === CommissionMode.FIXED) {
      return formatBDT(employee?.commissionPercentage || 0);
    }
    return `${employee?.commissionPercentage || 0}%`;
  }, [effectiveMode, employee]);

  const ratePlaceholder = useMemo(() => {
    if (effectiveMode === CommissionMode.SALARY) return employee?.monthlySalary?.toString() || '0';
    return employee?.commissionPercentage?.toString() || '0';
  }, [effectiveMode, employee]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSetMode = useCallback(
    async (mode: CommissionMode) => {
      if (!employee || mode === effectiveMode) return;

      const newMcfg = MODES.find(m => m.mode === mode)!;
      Alert.alert(
        language === 'en' ? 'Switch Payment Mode?' : 'পেমেন্ট মোড পরিবর্তন?',
        language === 'en'
          ? `Set ${employee.name} to "${modeLabel(newMcfg, language)}" mode?\n\nYou can update their ${mode === CommissionMode.SALARY ? 'monthly salary' : 'rate'} below.`
          : `${employee.name}-কে "${modeLabel(newMcfg, language)}" মোডে সেট করবেন?`,
        [
          {text: t.common.cancel, style: 'cancel'},
          {
            text: language === 'en' ? 'Switch' : 'পরিবর্তন',
            onPress: async () => {
              setSavingMode(true);
              try {
                await updateUserInOrg(employeeId, {commissionMode: mode});
                // Close edit panel if open
                setIsEditingRate(false);
                setRateInput('');
              } catch (err: any) {
                Alert.alert(t.common.error, err.message || 'Failed to update mode');
              } finally {
                setSavingMode(false);
              }
            },
          },
        ],
      );
    },
    [employee, effectiveMode, employeeId, language, t, updateUserInOrg],
  );

  const handleResetToOrgDefault = useCallback(async () => {
    setSavingMode(true);
    try {
      // Remove per-employee override so it falls back to org default
      await firebaseUpdateModeToUndefined(employeeId);
    } catch (err: any) {
      Alert.alert(t.common.error, err.message || 'Failed to reset');
    } finally {
      setSavingMode(false);
    }
  }, [employeeId, t]);

  const handleSaveRate = useCallback(async () => {
    if (!employee) return;
    const val = parseFloat(rateInput);

    if (effectiveMode === CommissionMode.SALARY) {
      if (isNaN(val) || val < 0) {
        Alert.alert(
          language === 'en' ? 'Invalid' : 'ভুল',
          language === 'en'
            ? 'Salary must be a positive number'
            : 'বেতন অবশ্যই ধনাত্মক সংখ্যা হতে হবে',
        );
        return;
      }
      setSavingRate(true);
      try {
        await updateUserInOrg(employeeId, {monthlySalary: val});
        setIsEditingRate(false);
        setRateInput('');
      } catch (err: any) {
        Alert.alert(t.common.error, err.message || 'Failed to save');
      } finally {
        setSavingRate(false);
      }
    } else {
      if (effectiveMode === CommissionMode.PERCENTAGE && (isNaN(val) || val < 0 || val > 100)) {
        Alert.alert(
          language === 'en' ? 'Invalid' : 'ভুল',
          language === 'en' ? 'Percentage must be 0–100' : 'শতাংশ ০-১০০ এর মধ্যে হতে হবে',
        );
        return;
      }
      if (isNaN(val) || val < 0) {
        Alert.alert(
          language === 'en' ? 'Invalid' : 'ভুল',
          language === 'en' ? 'Amount must be positive' : 'পরিমাণ ধনাত্মক হতে হবে',
        );
        return;
      }
      setSavingRate(true);
      try {
        await updateUserInOrg(employeeId, {commissionPercentage: val});
        setIsEditingRate(false);
        setRateInput('');
      } catch (err: any) {
        Alert.alert(t.common.error, err.message || 'Failed to save');
      } finally {
        setSavingRate(false);
      }
    }
  }, [employee, rateInput, effectiveMode, employeeId, language, t, updateUserInOrg]);

  const handleSendPayment = useCallback(async () => {
    if (!employee) return;
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert(
        language === 'en' ? 'Invalid Amount' : 'ভুল পরিমাণ',
        language === 'en' ? 'Enter a valid amount' : 'সঠিক পরিমাণ লিখুন',
      );
      return;
    }
    setSavingPayment(true);
    try {
      await createEmployeeTransaction(employeeId, amount, paymentNote || undefined);
      Alert.alert(
        language === 'en' ? '✓ Payment Sent' : '✓ পেমেন্ট পাঠানো হয়েছে',
        employee.role === UserRole.OWNER
          ? `${formatBDT(amount)} added.`
          : language === 'en'
            ? `${formatBDT(amount)} sent to ${employee.name}. Awaiting acceptance.`
            : `${formatBDT(amount)} ${employee.name}-এর কাছে পাঠানো হয়েছে।`,
      );
      setPaymentAmount('');
      setPaymentNote('');
    } catch (err: any) {
      Alert.alert(t.common.error, err.message || 'Failed to send payment');
    } finally {
      setSavingPayment(false);
    }
  }, [employee, paymentAmount, paymentNote, employeeId, language, t, createEmployeeTransaction]);

  const handleTogglePermission = useCallback(
    async (permission: EmployeePermission) => {
      if (!employee) return;
      const has = employee.permissions?.includes(permission) || false;
      const newPerms = has
        ? employee.permissions?.filter(p => p !== permission) || []
        : [...(employee.permissions || []), permission];
      setSavingPerm(true);
      try {
        await updateUserInOrg(employeeId, {permissions: newPerms});
        Alert.alert(
          language === 'en' ? 'Updated' : 'আপডেট হয়েছে',
          `Manager Access ${has ? (language === 'en' ? 'revoked' : 'বাতিল') : language === 'en' ? 'granted' : 'দেওয়া হয়েছে'}`,
        );
      } catch (err: any) {
        Alert.alert(t.common.error, err.message || 'Failed');
      } finally {
        setSavingPerm(false);
      }
    },
    [employee, employeeId, language, t, updateUserInOrg],
  );

  const handleDelete = useCallback(() => {
    if (!employee) return;
    Alert.alert(
      language === 'en' ? 'Remove Employee' : 'কর্মী সরান',
      language === 'en'
        ? `Remove ${employee.name} from the organization?`
        : `${employee.name}-কে সংগঠন থেকে সরাবেন?`,
      [
        {text: t.common.cancel, style: 'cancel'},
        {
          text: language === 'en' ? 'Remove' : 'সরান',
          style: 'destructive',
          onPress: async () => {
            setSavingDelete(true);
            try {
              await updateUserInOrg(employeeId, {orgId: ''});
              navigation.goBack();
            } catch (err: any) {
              Alert.alert(t.common.error, err.message || 'Failed');
              setSavingDelete(false);
            }
          },
        },
      ],
    );
  }, [employee, employeeId, language, t, navigation, updateUserInOrg]);

  const getStatusColor = (s: UserStatus) =>
    s === UserStatus.ACTIVE
      ? colors.success.main
      : s === UserStatus.BLOCKED
        ? colors.error.main
        : colors.warning.main;

  const getStatusLabel = (s: UserStatus) =>
    s === UserStatus.ACTIVE
      ? language === 'en'
        ? 'Active'
        : 'সক্রিয়'
      : s === UserStatus.BLOCKED
        ? language === 'en'
          ? 'Blocked'
          : 'ব্লক'
        : language === 'en'
          ? 'Pending'
          : 'অপেক্ষারত';

  // ============================================================================
  // LOADING GUARD
  // ============================================================================

  if (!employee || !stats) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>{language === 'en' ? 'Loading…' : 'লোড হচ্ছে…'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const statusColor = getStatusColor(employee.status);
  const hasManagerAccess = employee.permissions?.includes(EmployeePermission.CAN_ADD_ENTRIES);

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <SafeAreaView style={styles.container} edges={['bottom', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#183A37" />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* ── Profile Card ── */}
        <View style={styles.card}>
          <View
            style={[
              styles.avatarCircle,
              {backgroundColor: modeCfg.color, borderColor: modeCfg.border},
            ]}>
            <Text style={[styles.avatarChar, {color: '#FFFFFF'}]}>
              {employee.name.charAt(0).toUpperCase()}
            </Text>
          </View>

          <Text style={styles.employeeName}>
            {employee.name}
            {employee.role === UserRole.OWNER ? (
              <Text style={styles.ownerTag}> (Owner)</Text>
            ) : null}
          </Text>

          <View
            style={[
              styles.statusBadge,
              {backgroundColor: statusColor + '18', borderColor: statusColor + '50'},
            ]}>
            <View style={[styles.statusDot, {backgroundColor: statusColor}]} />
            <Text style={[styles.statusTxt, {color: statusColor}]}>
              {getStatusLabel(employee.status)}
            </Text>
          </View>

          <View style={styles.profileInfoList}>
            <View style={styles.profileInfoRow}>
              <MaterialIcons name="phone" size={15} color={colors.text.hint} />
              <Text style={styles.profileInfoTxt}>{employee.phone}</Text>
            </View>
            {employee.email && !employee.email.endsWith('@cutbook.app') && (
              <View style={styles.profileInfoRow}>
                <MaterialIcons name="mail-outline" size={15} color={colors.text.hint} />
                <Text style={styles.profileInfoTxt}>{employee.email}</Text>
              </View>
            )}
            <View style={styles.profileInfoRow}>
              <MaterialIcons name="event" size={15} color={colors.text.hint} />
              <Text style={styles.profileInfoTxt}>
                {language === 'en' ? 'Joined' : 'যোগ দিয়েছেন'} {formatDateISO(employee.createdAt)}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Performance Stats ── */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionIconBg, {backgroundColor: '#E8F0EE'}]}>
              <MaterialIcons name="bar-chart" size={18} color="#183A37" />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.sectionTitle}>
                {language === 'en' ? 'Performance' : 'পারফরম্যান্স'}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {language === 'en'
                  ? 'Earnings breakdown, services completed, and totals'
                  : 'উপার্জন এবং সম্পন্ন সেবার বিবরণ'}
              </Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={[styles.statCell, {backgroundColor: '#E8F0EE'}]}>
              <MaterialIcons name="content-cut" size={20} color="#183A37" />
              <Text
                style={[styles.statVal, {color: '#183A37'}]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.6}>
                {stats.totalServices}
              </Text>
              <Text style={styles.statLbl}>
                {language === 'en' ? 'Total Services' : 'মোট সেবা'}
              </Text>
            </View>
            <View style={[styles.statCell, {backgroundColor: '#FFF8F0'}]}>
              <MaterialIcons name="attach-money" size={20} color="#C44900" />
              <Text
                style={[styles.statVal, {color: '#C44900'}]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.6}>
                {formatBDT(stats.totalRevenue)}
              </Text>
              <Text style={styles.statLbl}>
                {language === 'en' ? 'Total Revenue' : 'মোট রাজস্ব'}
              </Text>
            </View>
            <View style={[styles.statCell, {backgroundColor: '#E8F0EE'}]}>
              <MaterialIcons name="today" size={20} color="#183A37" />
              <Text
                style={[styles.statVal, {color: '#183A37'}]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.6}>
                {stats.thisMonthServices}
              </Text>
              <Text style={styles.statLbl}>{language === 'en' ? 'This Month' : 'এই মাস'}</Text>
            </View>
            <View style={[styles.statCell, {backgroundColor: '#FFF8F0'}]}>
              <MaterialIcons name="trending-up" size={20} color="#C44900" />
              <Text
                style={[styles.statVal, {color: '#C44900'}]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.6}>
                {formatBDT(stats.thisMonthRevenue)}
              </Text>
              <Text style={styles.statLbl}>
                {language === 'en' ? 'Month Revenue' : 'মাসিক রাজস্ব'}
              </Text>
            </View>
          </View>

          {/* Commission / Salary + Tips + Balance row */}
          <View style={styles.earningsRow}>
            <View
              style={[
                styles.earningCell,
                {backgroundColor: modeCfg.bg, borderColor: modeCfg.border + '60'},
              ]}>
              <View style={styles.earningHeaderRow}>
                <MaterialIcons name="monetization-on" size={14} color={modeCfg.color} />
                <Text style={[styles.earningCellLabel, {color: modeCfg.color, marginBottom: 0}]}>
                  {effectiveMode === CommissionMode.SALARY
                    ? language === 'en'
                      ? 'Salary Due'
                      : 'বেতন প্রাপ্য'
                    : language === 'en'
                      ? 'Commission'
                      : 'কমিশন'}
                </Text>
              </View>
              <Text
                style={[styles.earningCellValue, {color: modeCfg.color}]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.6}>
                {formatBDT(stats.totalCommission)}
              </Text>
            </View>
            <View
              style={[styles.earningCell, {backgroundColor: '#FEF3C7', borderColor: '#F59E0B60'}]}>
              <View style={styles.earningHeaderRow}>
                <MaterialIcons name="card-giftcard" size={14} color="#D97706" />
                <Text style={[styles.earningCellLabel, {color: '#D97706', marginBottom: 0}]}>
                  {language === 'en' ? 'Tips' : 'টিপস'}
                </Text>
              </View>
              <Text
                style={[styles.earningCellValue, {color: '#D97706'}]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.6}>
                {formatBDT(stats.totalTips)}
              </Text>
            </View>
          </View>

          <View style={styles.earningsRow}>
            <View
              style={[styles.earningCell, {backgroundColor: '#D1FAE5', borderColor: '#10B98160'}]}>
              <View style={styles.earningHeaderRow}>
                <MaterialIcons name="check-circle" size={14} color="#059669" />
                <Text style={[styles.earningCellLabel, {color: '#059669', marginBottom: 0}]}>
                  {language === 'en' ? 'Received' : 'প্রাপ্ত'}
                </Text>
              </View>
              <Text
                style={[styles.earningCellValue, {color: '#059669'}]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.6}>
                {formatBDT(totalReceived)}
              </Text>
            </View>
            <View
              style={[styles.earningCell, {backgroundColor: '#FEF2F2', borderColor: '#EF444460'}]}>
              <View style={styles.earningHeaderRow}>
                <MaterialIcons name="hourglass-empty" size={14} color="#EF4444" />
                <Text style={[styles.earningCellLabel, {color: '#EF4444', marginBottom: 0}]}>
                  {language === 'en' ? 'Pending' : 'অপেক্ষারত'}
                </Text>
              </View>
              <Text
                style={[styles.earningCellValue, {color: '#EF4444'}]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.6}>
                {formatBDT(totalPending)}
              </Text>
            </View>
          </View>
        </View>

        {/* ── Give Payment ── */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionIconBg, {backgroundColor: '#ECFDF5'}]}>
              <MaterialIcons name="payment" size={18} color="#10B981" />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.sectionTitle}>
                {language === 'en' ? 'Give Payment to' : 'পেমেন্ট দিন'}{' '}
                <Text style={{color: colors.error.main}}>{employee.name}</Text>
              </Text>
              <Text style={styles.sectionSubtitle}>
                {language === 'en'
                  ? 'Send payouts or advances directly to employee account'
                  : 'কর্মীকে সরাসরি পেআউট বা অগ্রিম পেমেন্ট পাঠান'}
              </Text>
            </View>
          </View>

          {employee.role !== UserRole.OWNER && (
            <Text style={styles.payNote}>
              {language === 'en'
                ? 'Employee will receive a notification and must accept the payment.'
                : 'কর্মী একটি বিজ্ঞপ্তি পাবেন এবং পেমেন্ট গ্রহণ করতে হবে।'}
            </Text>
          )}

          <View
            style={[
              styles.payForm,
              {backgroundColor: colors.background.default, borderColor: colors.border.light},
            ]}>
            <View style={styles.payAmountRow}>
              <Text style={[styles.payCurrSymbol, {color: colors.primary[500]}]}>৳</Text>
              <TextInput
                style={[styles.payAmountInput, {color: colors.text.primary}]}
                placeholder="0"
                placeholderTextColor={colors.text.hint}
                keyboardType="decimal-pad"
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                editable={!savingPayment}
              />
            </View>
            <View style={[styles.payNoteDivider, {backgroundColor: colors.border.light}]} />
            <TextInput
              style={[styles.payNoteInput, {color: colors.text.primary}]}
              placeholder={
                language === 'en'
                  ? 'Note (optional) — Advance, Bonus, Salary...'
                  : 'নোট (ঐচ্ছিক) — অগ্রিম, বোনাস, বেতন...'
              }
              placeholderTextColor={colors.text.hint}
              multiline
              value={paymentNote}
              onChangeText={setPaymentNote}
              editable={!savingPayment}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.payBtn,
              savingPayment && styles.btnDisabled,
              {backgroundColor: colors.success.main},
            ]}
            onPress={handleSendPayment}
            disabled={savingPayment}>
            {savingPayment ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <MaterialIcons name="send" size={18} color="#fff" />
                <Text style={styles.payBtnTxt}>
                  {language === 'en' ? 'Send Payment' : 'পেমেন্ট পাঠান'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Commission Mode Selector ── */}
        <View style={styles.card}>
          <View style={styles.sectionHeaderRow}>
            <View style={[styles.sectionIconBg, {backgroundColor: modeCfg.bg}]}>
              <MaterialIcons name="monetization-on" size={18} color={modeCfg.color} />
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.sectionTitle}>
                {language === 'en'
                  ? 'Payment Mode'
                  : language === 'bn'
                    ? 'পেমেন্ট মোড'
                    : language === 'es'
                      ? 'Modo de Pago'
                      : 'भुगतान मोड'}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {language === 'en'
                  ? 'Set individually per employee — overrides org default'
                  : 'প্রতিটি কর্মীর জন্য আলাদাভাবে সেট করুন'}
              </Text>
            </View>
          </View>

          {/* 3-mode selector */}
          {savingMode ? (
            <View style={styles.modeSavingRow}>
              <ActivityIndicator size="small" color={colors.primary[500]} />
              <Text style={styles.modeSavingTxt}>
                {language === 'en' ? 'Updating mode…' : 'আপডেট হচ্ছে…'}
              </Text>
            </View>
          ) : (
            <View style={styles.modeRow}>
              {MODES.map(m => {
                const active = effectiveMode === m.mode;
                return (
                  <TouchableOpacity
                    key={m.mode}
                    style={[
                      styles.modeBtn,
                      active && {
                        backgroundColor: m.bg,
                        borderColor: m.color,
                        borderWidth: 2,
                      },
                    ]}
                    onPress={() => handleSetMode(m.mode)}
                    activeOpacity={0.75}>
                    {active && (
                      <View style={[styles.modeBtnCheck, {backgroundColor: m.color}]}>
                        <MaterialIcons name="check" size={10} color="#fff" />
                      </View>
                    )}
                    <View
                      style={[
                        styles.modeBtnIconBg,
                        {backgroundColor: active ? m.bg : colors.background.default},
                      ]}>
                      <MaterialIcons
                        name={m.icon}
                        size={22}
                        color={active ? m.color : colors.text.hint}
                      />
                    </View>
                    <Text
                      style={[styles.modeBtnLabel, active && {color: m.color, fontWeight: '700'}]}>
                      {modeLabel(m, language)}
                    </Text>
                    <Text style={[styles.modeBtnUnit, active && {color: m.color}]}>
                      {modeUnit(m, language)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}

          {/* Org-default reset chip */}
          {!isOrgDefault && !savingMode && (
            <TouchableOpacity style={styles.resetChip} onPress={handleResetToOrgDefault}>
              <MaterialIcons name="refresh" size={13} color={orgModeCfg.color} />
              <Text style={[styles.resetChipTxt, {color: orgModeCfg.color}]}>
                {language === 'en'
                  ? `Reset to org default (${modeLabel(orgModeCfg, language)})`
                  : `সংস্থার ডিফল্টে ফিরুন (${modeLabel(orgModeCfg, language)})`}
              </Text>
            </TouchableOpacity>
          )}

          {/* Divider */}
          <View style={styles.divider} />

          {/* Rate display / edit */}
          <Text style={[styles.rateLabel, {color: colors.text.secondary}]}>
            {effectiveMode === CommissionMode.SALARY
              ? language === 'en'
                ? 'Monthly Base Salary'
                : 'মাসিক মূল বেতন'
              : effectiveMode === CommissionMode.FIXED
                ? language === 'en'
                  ? 'Fixed Amount per Service'
                  : 'প্রতি সেবায় নির্দিষ্ট পরিমাণ'
                : language === 'en'
                  ? 'Commission Rate'
                  : 'কমিশনের হার'}
          </Text>

          {isEditingRate ? (
            <View
              style={[
                styles.rateEditRow,
                {backgroundColor: colors.background.default, borderColor: modeCfg.border},
              ]}>
              <TextInput
                style={[styles.rateEditInput, {color: modeCfg.color}]}
                value={rateInput}
                onChangeText={setRateInput}
                placeholder={ratePlaceholder}
                placeholderTextColor={colors.text.hint}
                keyboardType="numeric"
                autoFocus
                editable={!savingRate}
              />
              <Text style={styles.rateEditUnit}>{modeUnit(modeCfg, language)}</Text>
              <TouchableOpacity
                style={[styles.rateActionBtn, {backgroundColor: colors.success.main}]}
                onPress={handleSaveRate}
                disabled={savingRate}>
                {savingRate ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <MaterialIcons name="check" size={17} color="#fff" />
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.rateActionBtn, {backgroundColor: colors.error.main}]}
                onPress={() => {
                  setIsEditingRate(false);
                  setRateInput('');
                }}
                disabled={savingRate}>
                <MaterialIcons name="close" size={17} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={styles.rateDisplayRow}
              onPress={() => {
                setIsEditingRate(true);
                setRateInput(ratePlaceholder);
              }}>
              <Text
                style={[styles.rateValue, {color: modeCfg.color, flex: 1}]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.5}>
                {currentRate}
              </Text>
              <View
                style={[
                  styles.editPill,
                  {backgroundColor: modeCfg.bg, borderColor: modeCfg.border},
                ]}>
                <MaterialIcons name="edit" size={12} color={modeCfg.color} />
                <Text style={[styles.editPillTxt, {color: modeCfg.color}]}>
                  {language === 'en' ? 'Edit' : 'সম্পাদনা'}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {/* Earning hint */}
          <View
            style={[
              styles.hintBox,
              {backgroundColor: modeCfg.bg, borderColor: modeCfg.border + '60'},
            ]}>
            <MaterialIcons
              name="info-outline"
              size={14}
              color={modeCfg.color}
              style={{marginTop: 1}}
            />
            <Text style={[styles.hintTxt, {color: modeCfg.color}]}>
              {effectiveMode === CommissionMode.SALARY
                ? language === 'en'
                  ? `Earns ${formatBDT(employee.monthlySalary || 0)}/month fixed. Tips go directly to employee.`
                  : `প্রতি মাসে ${formatBDT(employee.monthlySalary || 0)} নির্দিষ্ট উপার্জন। টিপস সরাসরি কর্মীর।`
                : effectiveMode === CommissionMode.FIXED
                  ? language === 'en'
                    ? `Earns ${formatBDT(employee.commissionPercentage || 0)} for each service completed, plus tips.`
                    : `প্রতিটি সেবার জন্য ${formatBDT(employee.commissionPercentage || 0)} উপার্জন এবং টিপস।`
                  : language === 'en'
                    ? `Earns ${employee.commissionPercentage || 0}% of each service price, plus tips.`
                    : `প্রতিটি সেবার মূল্যের ${employee.commissionPercentage || 0}% উপার্জন এবং টিপস।`}
            </Text>
          </View>
        </View>

        {/* ── Permissions ── */}
        {employee.role !== UserRole.OWNER && (
          <View style={styles.card}>
            <View style={styles.sectionHeaderRow}>
              <View style={[styles.sectionIconBg, {backgroundColor: '#FDF4F8'}]}>
                <MaterialIcons name="security" size={18} color="#D262A2" />
              </View>
              <View style={{flex: 1}}>
                <Text style={[styles.sectionTitle, {color: colors.error.main}]}>
                  {language === 'en' ? 'PERMISSIONS' : 'অনুমতি'}
                </Text>
                <Text style={styles.sectionSubtitle}>
                  {language === 'en'
                    ? "Control what this employee can do when you're away"
                    : 'আপনার অনুপস্থিতিতে এই কর্মী কী করতে পারবে তা নিয়ন্ত্রণ করুন'}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.permCard,
                {backgroundColor: isDarkMode ? colors.neutral[100] : '#1F2937'},
              ]}>
              <View style={styles.permHeader}>
                <View style={{flex: 1}}>
                  <Text style={styles.permTitle}>
                    {language === 'en' ? 'Manager Access' : 'ম্যানেজার অ্যাক্সেস'}
                  </Text>
                  <Text style={styles.permSubtitle}>
                    {language === 'en'
                      ? 'Can add service entries and manage work logs'
                      : 'সেবার এন্ট্রি যোগ করতে এবং ওয়ার্ক লগ পরিচালনা করতে পারবেন'}
                  </Text>
                </View>
                <View
                  style={[
                    styles.permBadge,
                    hasManagerAccess
                      ? {backgroundColor: '#EF444420', borderColor: '#EF4444'}
                      : {backgroundColor: '#22C55E20', borderColor: '#22C55E'},
                  ]}>
                  <Text
                    style={[
                      styles.permBadgeTxt,
                      {color: hasManagerAccess ? '#EF4444' : '#22C55E'},
                    ]}>
                    {hasManagerAccess
                      ? language === 'en'
                        ? 'ON'
                        : 'চালু'
                      : language === 'en'
                        ? 'OFF'
                        : 'বন্ধ'}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[
                  styles.permToggle,
                  {backgroundColor: hasManagerAccess ? '#22C55E' : '#EF4444'},
                ]}
                onPress={() => handleTogglePermission(EmployeePermission.CAN_ADD_ENTRIES)}
                disabled={savingPerm}>
                {savingPerm ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.permToggleTxt}>
                    {hasManagerAccess
                      ? language === 'en'
                        ? 'Remove Access'
                        : 'অ্যাক্সেস সরান'
                      : language === 'en'
                        ? 'Give Access'
                        : 'অ্যাক্সেস দিন'}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Remove ── */}
        {employee.role !== UserRole.OWNER && (
          <View style={styles.card}>
            <TouchableOpacity
              style={[styles.removeBtn, savingDelete && styles.btnDisabled]}
              onPress={handleDelete}
              disabled={savingDelete}>
              {savingDelete ? (
                <ActivityIndicator color={colors.error.main} />
              ) : (
                <>
                  <MaterialIcons name="person-remove" size={19} color={colors.error.main} />
                  <Text style={[styles.removeBtnTxt, {color: colors.error.main}]}>
                    {language === 'en' ? 'Remove from Organization' : 'সংগঠন থেকে সরান'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        <View style={{height: 36}} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================================
// Helper — clears per-employee commissionMode so org default takes over
// ============================================================================

async function firebaseUpdateModeToUndefined(employeeId: string) {
  // Firestore: set field to FieldValue.delete() via partial update with undefined trick
  // We pass a special marker; updateUserInOrg does .update() which supports deleteField
  const firestore = require('@react-native-firebase/firestore').default;
  await firestore().collection('users').doc(employeeId).update({
    commissionMode: firestore.FieldValue.delete(),
    updatedAt: new Date(),
  });
}

// ============================================================================
// STYLES
// ============================================================================

const getStyles = (colors: ThemeColors, isDarkMode: boolean) =>
  StyleSheet.create({
    earningHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginBottom: 6,
    },
    container: {flex: 1, backgroundColor: colors.background.default},
    loadingWrap: {flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12},
    loadingText: {fontSize: 15, color: colors.text.secondary},

    // Header
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.background.paper,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: isDarkMode ? 0.3 : 0.07,
      shadowRadius: 3,
      elevation: 3,
    },
    backBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: isDarkMode ? colors.neutral[100] : colors.neutral[50],
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      flex: 1,
      textAlign: 'center',
      fontSize: 17,
      fontWeight: '700',
      color: colors.text.primary,
    },

    scroll: {flex: 1},
    scrollContent: {padding: 16, gap: 14},

    // Card
    card: {
      backgroundColor: colors.background.paper,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border.light,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: isDarkMode ? 0.15 : 0.05,
      shadowRadius: 6,
      elevation: 2,
    },

    // Profile
    avatarCircle: {
      width: 88,
      height: 88,
      borderRadius: 44,
      borderWidth: 2.5,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      marginBottom: 14,
    },
    avatarChar: {fontSize: 36, fontWeight: '800'},
    employeeName: {
      fontSize: 22,
      fontWeight: '800',
      color: colors.text.primary,
      textAlign: 'center',
      marginBottom: 10,
    },
    ownerTag: {fontSize: 14, fontWeight: '500', color: colors.text.hint},
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 14,
      paddingVertical: 5,
      borderRadius: 20,
      borderWidth: 1,
      alignSelf: 'center',
      marginBottom: 16,
    },
    statusDot: {width: 7, height: 7, borderRadius: 3.5},
    statusTxt: {fontSize: 12, fontWeight: '700'},
    profileInfoList: {width: '100%', gap: 8},
    profileInfoRow: {flexDirection: 'row', alignItems: 'center', gap: 10},
    profileInfoTxt: {fontSize: 14, color: colors.text.secondary, flex: 1},

    // Section header inside card
    sectionHeaderRow: {flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16},
    sectionIconBg: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sectionTitle: {fontSize: 15, fontWeight: '700', color: colors.text.primary, marginBottom: 4},
    sectionSubtitle: {fontSize: 12, color: colors.text.secondary, lineHeight: 17},

    // Mode selector
    modeSavingRow: {flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 12},
    modeSavingTxt: {fontSize: 14, color: colors.text.secondary},
    modeRow: {flexDirection: 'row', gap: 10, marginBottom: 12},
    modeBtn: {
      flex: 1,
      alignItems: 'center',
      gap: 6,
      paddingVertical: 16,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: colors.border.light,
      backgroundColor: colors.background.paper,
      position: 'relative',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    modeBtnCheck: {
      position: 'absolute',
      top: 7,
      right: 7,
      width: 18,
      height: 18,
      borderRadius: 9,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modeBtnIconBg: {
      width: 42,
      height: 42,
      borderRadius: 21,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modeBtnLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.text.secondary,
      textAlign: 'center',
    },
    modeBtnUnit: {fontSize: 10, color: colors.text.hint, textAlign: 'center'},

    // Reset chip
    resetChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      backgroundColor: colors.background.default,
      borderWidth: 1,
      borderColor: colors.border.light,
      marginBottom: 12,
    },
    resetChipTxt: {fontSize: 11, fontWeight: '600'},

    divider: {height: 1, backgroundColor: colors.border.light, marginVertical: 14},

    // Rate
    rateLabel: {
      fontSize: 11,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    rateDisplayRow: {flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12},
    rateValue: {fontSize: 30, fontWeight: '800'},
    editPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
      borderWidth: 1,
    },
    editPillTxt: {fontSize: 12, fontWeight: '700'},
    rateEditRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      borderWidth: 1.5,
      paddingHorizontal: 14,
      paddingVertical: 8,
      gap: 8,
      marginBottom: 12,
    },
    rateEditInput: {flex: 1, fontSize: 22, fontWeight: '700'},
    rateEditUnit: {fontSize: 11, color: '#9CA3AF', fontWeight: '600'},
    rateActionBtn: {
      width: 34,
      height: 34,
      borderRadius: 17,
      justifyContent: 'center',
      alignItems: 'center',
    },

    // Hint
    hintBox: {
      flexDirection: 'row',
      gap: 8,
      padding: 12,
      borderRadius: 10,
      borderWidth: 1,
    },
    hintTxt: {flex: 1, fontSize: 12, lineHeight: 18, fontWeight: '500'},

    // Stats grid
    statsGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10},
    statCell: {
      width: '47.5%',
      borderRadius: 12,
      padding: 14,
      alignItems: 'center',
      gap: 4,
    },
    statVal: {fontSize: 17, fontWeight: '700'},
    statLbl: {fontSize: 11, color: colors.text.hint, textAlign: 'center'},

    // Earnings row
    earningsRow: {flexDirection: 'row', gap: 10, marginBottom: 10},
    earningCell: {
      flex: 1,
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      alignItems: 'center',
      gap: 4,
    },
    earningCellLabel: {fontSize: 12, fontWeight: '600', color: colors.text.secondary},
    earningCellValue: {fontSize: 17, fontWeight: '800'},

    // Payment
    payNote: {fontSize: 12, color: colors.text.secondary, marginBottom: 14, lineHeight: 18},
    payForm: {
      borderRadius: 12,
      borderWidth: 1,
      overflow: 'hidden',
      marginBottom: 14,
    },
    payAmountRow: {flexDirection: 'row', alignItems: 'center', padding: 14},
    payCurrSymbol: {fontSize: 26, fontWeight: '800', marginRight: 8},
    payAmountInput: {flex: 1, fontSize: 26, fontWeight: '700'},
    payNoteDivider: {height: 1},
    payNoteInput: {padding: 14, fontSize: 14, minHeight: 58, textAlignVertical: 'top'},
    payBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      borderRadius: 12,
      paddingVertical: 14,
    },
    payBtnTxt: {fontSize: 15, fontWeight: '700', color: '#fff'},

    // Permissions
    permDesc: {fontSize: 12, color: colors.text.secondary, marginBottom: 14, lineHeight: 18},
    permCard: {borderRadius: 14, padding: 16},
    permHeader: {flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 14},
    permTitle: {color: '#F9FAFB', fontSize: 15, fontWeight: '700', marginBottom: 3},
    permSubtitle: {color: '#9CA3AF', fontSize: 12, lineHeight: 17},
    permBadge: {paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, borderWidth: 1},
    permBadgeTxt: {fontSize: 11, fontWeight: '800'},
    permToggle: {borderRadius: 10, paddingVertical: 11, alignItems: 'center'},
    permToggleTxt: {color: '#fff', fontSize: 14, fontWeight: '700'},

    // Remove
    removeBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: '#FEF2F2',
      borderRadius: 12,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: '#EF444430',
    },
    removeBtnTxt: {fontSize: 15, fontWeight: '600'},
    btnDisabled: {opacity: 0.5},
  });
