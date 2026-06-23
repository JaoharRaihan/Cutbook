import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {useAuth, useOrg, useData, useTheme, useLanguage} from '@/context';
import {formatBDT} from '@/utils/currency';
import {formatDateISO} from '@/utils/date';
import {TransactionStatus, User, UserRole} from '@/types';
import type {NotificationType} from '@/types/notifications';
import {createNotification} from '@/services/notificationService';
import {useThemedStyles} from '@/hooks/useThemedStyles';
import {ThemeColors} from '@/constants/theme';

type TabType = 'expenses' | 'payouts';

export default function ExpensesScreen(): React.ReactElement {
  const {user} = useAuth();
  const {orgUsers, employeeTransactions, createEmployeeTransaction} = useOrg();
  const {expenses, addExpense, deleteExpense} = useData();
  const {isDarkMode, colors} = useTheme();
  const {language, t} = useLanguage();
  const styles = useThemedStyles(getStyles);

  const [activeTab, setActiveTab] = useState<TabType>('expenses');
  const [saving, setSaving] = useState(false);

  // Expense Form State
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');

  // Payout Form State
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutNote, setPayoutNote] = useState('');
  const [employeePickerVisible, setEmployeePickerVisible] = useState(false);

  // Filter employees (including owner)
  const employees = useMemo(() => {
    return orgUsers.filter(u => u.role === UserRole.EMPLOYEE || u.role === UserRole.OWNER);
  }, [orgUsers]);

  // Calculations for Expenses
  const totalExpensesAllTime = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  // Filter payouts list
  const recentPayouts = useMemo(() => {
    return employeeTransactions.slice(0, 20); // Show last 20 payouts
  }, [employeeTransactions]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleAddExpense = async () => {
    if (!expenseName.trim()) {
      Alert.alert(t.common.error, t.expenses.invalidName);
      return;
    }

    const amount = parseFloat(expenseAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert(t.common.error, t.expenses.invalidAmount);
      return;
    }

    setSaving(true);
    try {
      await addExpense(expenseName, amount);
      Alert.alert(
        t.common.success,
        language === 'en'
          ? `Added expense: ${expenseName} of ${formatBDT(amount)}`
          : language === 'bn'
            ? `খরচ যোগ করা হয়েছে: ${expenseName} (${formatBDT(amount)})`
            : language === 'es'
              ? `Gasto añadido: ${expenseName} de ${formatBDT(amount)}`
              : `खर्च जोड़ा गया: ${expenseName} (${formatBDT(amount)})`,
      );
      setExpenseName('');
      setExpenseAmount('');
    } catch (err: any) {
      Alert.alert(t.common.error, err.message || 'Failed to add expense');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteExpense = (id: string, name: string, amount: number) => {
    Alert.alert(
      t.expenses.deleteExpense,
      t.expenses.areYouSureDeleteExpense
        .replace('{name}', name)
        .replace('{amount}', formatBDT(amount)),
      [
        {text: t.common.cancel, style: 'cancel'},
        {
          text: t.common.delete,
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteExpense(id);
              Alert.alert(t.common.success, 'Expense deleted');
            } catch (err: any) {
              Alert.alert(t.common.error, err.message || 'Failed to delete expense');
            }
          },
        },
      ],
    );
  };

  const handleSendPayout = async () => {
    if (!selectedEmployee) {
      Alert.alert(t.common.error, t.expenses.invalidEmployee);
      return;
    }

    const amount = parseFloat(payoutAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert(t.common.error, t.expenses.invalidAmount);
      return;
    }

    setSaving(true);
    try {
      const txn = await createEmployeeTransaction(
        selectedEmployee.id,
        amount,
        payoutNote || undefined,
      );

      const isOwnerRecipient = selectedEmployee.role === UserRole.OWNER;

      if (user && !isOwnerRecipient) {
        const type: NotificationType = 'PAYMENT_REQUEST';
        await createNotification({
          orgId: txn.orgId,
          recipientId: selectedEmployee.id,
          senderId: user.id,
          type,
          title: 'Payment request',
          message: `You have received a payment request of ${formatBDT(
            amount,
          )} from ${user.name || 'Salon Owner'}.`,
          relatedRequestId: txn.id,
          isRead: false,
        });
      }

      Alert.alert(
        t.common.success,
        isOwnerRecipient
          ? language === 'en'
            ? `Payout of ${formatBDT(amount)} recorded for yourself (Owner). Auto-accepted.`
            : language === 'bn'
              ? `নিজের জন্য (মালিক) ${formatBDT(amount)}-এর পেআউট রেকর্ড করা হয়েছে। স্বয়ংক্রিয়ভাবে গৃহীত হয়েছে।`
              : language === 'es'
                ? `Pago de ${formatBDT(amount)} registrado para usted (Propietario). Autoaceptado.`
                : `अपने लिए (स्वामी) ${formatBDT(amount)} का भुगतान दर्ज किया गया। स्वतः स्वीकृत।`
          : t.expenses.payoutSuccessAlert
              .replace('{amount}', formatBDT(amount))
              .replace('{name}', selectedEmployee.name),
      );
      setPayoutAmount('');
      setPayoutNote('');
      setSelectedEmployee(null);
    } catch (err: any) {
      Alert.alert(t.common.error, err.message || 'Failed to send payment request');
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (status: TransactionStatus): string => {
    switch (status) {
      case TransactionStatus.PENDING:
        return '#FF9800';
      case TransactionStatus.ACCEPTED:
        return '#4CAF50';
      case TransactionStatus.REJECTED:
        return '#F44336';
      default:
        return '#9E9E9E';
    }
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

      {/* Tabs Header */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'expenses' && styles.tabButtonActive]}
          onPress={() => setActiveTab('expenses')}>
          <MaterialIcons
            name="shopping-bag"
            size={20}
            color={
              activeTab === 'expenses'
                ? isDarkMode
                  ? colors.primary[400]
                  : '#000000'
                : colors.text.secondary
            }
          />
          <Text style={[styles.tabText, activeTab === 'expenses' && styles.tabTextActive]}>
            {t.expenses.tabExpenses}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'payouts' && styles.tabButtonActive]}
          onPress={() => setActiveTab('payouts')}>
          <MaterialIcons
            name="payments"
            size={20}
            color={
              activeTab === 'payouts'
                ? isDarkMode
                  ? colors.primary[400]
                  : '#000000'
                : colors.text.secondary
            }
          />
          <Text style={[styles.tabText, activeTab === 'payouts' && styles.tabTextActive]}>
            {t.expenses.tabPayouts}
          </Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'expenses' ? (
        <ScrollView style={styles.tabContent} keyboardShouldPersistTaps="handled">
          {/* Header Metric Card */}
          <View style={styles.totalCard}>
            <Text style={styles.totalLabel}>{t.expenses.totalRecorded}</Text>
            <Text style={styles.totalValue}>{formatBDT(totalExpensesAllTime)}</Text>
            <Text style={styles.totalSubtitle}>
              {expenses.length} {t.expenses.numEntries}
            </Text>
          </View>

          {/* Add Expense Form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.expenses.addNewExpense}</Text>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t.expenses.expenseName}</Text>
              <TextInput
                style={styles.formInput}
                placeholder={
                  language === 'en'
                    ? 'e.g., Shampoo, Rent, Tissue'
                    : language === 'bn'
                      ? 'যেমন, শ্যাম্পু, ভাড়া, টিস্যু'
                      : language === 'es'
                        ? 'ej. Champú, Alquiler, Pañuelos'
                        : 'जैसे, शैम्पू, किराया, टिशू'
                }
                placeholderTextColor={colors.text.hint}
                value={expenseName}
                onChangeText={setExpenseName}
                editable={!saving}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t.expenses.amountBDT}</Text>
              <TextInput
                style={styles.formInput}
                placeholder={
                  language === 'en'
                    ? 'Enter amount'
                    : language === 'bn'
                      ? 'পরিমাণ লিখুন'
                      : language === 'es'
                        ? 'Introducir cantidad'
                        : 'राशि दर्ज करें'
                }
                placeholderTextColor={colors.text.hint}
                keyboardType="decimal-pad"
                value={expenseAmount}
                onChangeText={setExpenseAmount}
                editable={!saving}
              />
            </View>

            <TouchableOpacity
              style={[styles.actionButton, saving && styles.buttonDisabled]}
              onPress={handleAddExpense}
              disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <MaterialIcons name="add" size={20} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>{t.expenses.recordExpense}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Expenses List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.expenses.expenseLogs}</Text>
            {expenses.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>{t.expenses.noExpenses}</Text>
              </View>
            ) : (
              expenses.map(item => (
                <View key={item.id} style={styles.logRow}>
                  <View style={styles.logInfo}>
                    <Text style={styles.logName}>{item.name}</Text>
                    <Text style={styles.logMeta}>
                      {t.expenses.loggedOn} {formatDateISO(item.createdAt)} by{' '}
                      {item.createdByName || 'Owner'}
                    </Text>
                  </View>
                  <View style={styles.logRight}>
                    <Text style={styles.logAmount}>{formatBDT(item.amount)}</Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteExpense(item.id, item.name, item.amount)}
                      style={styles.deleteBtn}>
                      <MaterialIcons name="delete" size={20} color={colors.error.main} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
          <View style={{height: 40}} />
        </ScrollView>
      ) : (
        <ScrollView style={styles.tabContent} keyboardShouldPersistTaps="handled">
          {/* Central Payout Form */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.expenses.sendPayment}</Text>
            <Text style={styles.sectionDescription}>{t.expenses.sendPaymentDesc}</Text>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>
                {language === 'en'
                  ? 'Select Employee *'
                  : language === 'bn'
                    ? 'কর্মী নির্বাচন করুন *'
                    : language === 'es'
                      ? 'Seleccionar Empleado *'
                      : 'कर्मचारी चुनें *'}
              </Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setEmployeePickerVisible(true)}>
                <Text
                  style={
                    selectedEmployee ? styles.pickerTextSelected : styles.pickerTextPlaceholder
                  }>
                  {selectedEmployee
                    ? `${selectedEmployee.name}${
                        selectedEmployee.role === UserRole.OWNER
                          ? ` (${
                              language === 'en'
                                ? 'Owner'
                                : language === 'bn'
                                  ? 'মালিক'
                                  : language === 'es'
                                    ? 'Propietario'
                                    : 'स्वामी'
                            })`
                          : ''
                      }`
                    : language === 'en'
                      ? 'Choose an employee'
                      : language === 'bn'
                        ? 'একজন কর্মী বেছে নিন'
                        : language === 'es'
                          ? 'Elegir un empleado'
                          : 'एक कर्मचारी चुनें'}
                </Text>
                <MaterialIcons name="arrow-drop-down" size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t.expenses.amountBDT}</Text>
              <TextInput
                style={styles.formInput}
                placeholder={
                  language === 'en'
                    ? 'Enter amount'
                    : language === 'bn'
                      ? 'পরিমাণ লিখুন'
                      : language === 'es'
                        ? 'Introducir cantidad'
                        : 'राशि दर्ज करें'
                }
                placeholderTextColor={colors.text.hint}
                keyboardType="decimal-pad"
                value={payoutAmount}
                onChangeText={setPayoutAmount}
                editable={!saving}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>{t.expenses.noteOptional}</Text>
              <TextInput
                style={[styles.formInput, styles.noteInputForm]}
                placeholder={
                  language === 'en'
                    ? 'e.g., Daily payout, Advance payment'
                    : language === 'bn'
                      ? 'যেমন, দৈনিক পেআউট, অগ্রিম পেমেন্ট'
                      : language === 'es'
                        ? 'ej. Pago diario, Pago por adelantado'
                        : 'जैसे, दैनिक भुगतान, अग्रिम भुगतान'
                }
                placeholderTextColor={colors.text.hint}
                multiline
                value={payoutNote}
                onChangeText={setPayoutNote}
                editable={!saving}
              />
            </View>

            <TouchableOpacity
              style={[styles.actionButton, styles.payoutBtn, saving && styles.buttonDisabled]}
              onPress={handleSendPayout}
              disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <MaterialIcons name="send" size={18} color="#FFFFFF" />
                  <Text style={styles.actionButtonText}>{t.expenses.sendPaymentRequest}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* Recent Payouts List */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.expenses.recentPayoutRequests}</Text>
            {recentPayouts.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>{t.expenses.noPayouts}</Text>
              </View>
            ) : (
              recentPayouts.map(txn => (
                <View key={txn.id} style={styles.logRow}>
                  <View style={styles.logInfo}>
                    <Text style={styles.logName}>{txn.employeeName}</Text>
                    <Text style={styles.logMeta}>
                      {t.expenses.initiated} {formatDateISO(txn.createdAt)} •{' '}
                      {txn.note ||
                        (language === 'en'
                          ? 'No note'
                          : language === 'bn'
                            ? 'কোন নোট নেই'
                            : language === 'es'
                              ? 'Sin nota'
                              : 'कोई नोट नहीं')}
                    </Text>
                  </View>
                  <View style={styles.payoutRight}>
                    <Text style={styles.payoutAmountLabel}>{formatBDT(txn.amount)}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {backgroundColor: getStatusColor(txn.status) + '15'},
                      ]}>
                      <Text style={[styles.statusText, {color: getStatusColor(txn.status)}]}>
                        {txn.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
          <View style={{height: 40}} />
        </ScrollView>
      )}

      {/* Employee Picker Modal */}
      <Modal
        visible={employeePickerVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setEmployeePickerVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setEmployeePickerVisible(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.expenses.chooseEmployee}</Text>
              <TouchableOpacity onPress={() => setEmployeePickerVisible(false)}>
                <MaterialIcons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            {employees.length === 0 ? (
              <View style={styles.modalEmpty}>
                <Text style={styles.modalEmptyText}>
                  {language === 'en'
                    ? 'No active employees found'
                    : language === 'bn'
                      ? 'কোন সক্রিয় কর্মী পাওয়া যায়নি'
                      : language === 'es'
                        ? 'No se encontraron empleados activos'
                        : 'कोई सक्रिय कर्मचारी नहीं मिला'}
                </Text>
              </View>
            ) : (
              <FlatList
                data={employees}
                keyExtractor={item => item.id}
                renderItem={({item}) => (
                  <TouchableOpacity
                    style={styles.employeeItem}
                    onPress={() => {
                      setSelectedEmployee(item);
                      setEmployeePickerVisible(false);
                    }}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                    </View>
                    <View>
                      <Text style={styles.employeeName}>
                        {item.name}
                        {item.role === UserRole.OWNER
                          ? ` (${
                              language === 'en'
                                ? 'Owner'
                                : language === 'bn'
                                  ? 'মালিক'
                                  : language === 'es'
                                    ? 'Propietario'
                                    : 'स्वामी'
                            })`
                          : ''}
                      </Text>
                      <Text style={styles.employeePhone}>{item.phone}</Text>
                    </View>
                  </TouchableOpacity>
                )}
              />
            )}
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
      backgroundColor: colors.background.default,
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: colors.background.paper,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    tabButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 16,
      gap: 8,
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    tabButtonActive: {
      borderBottomColor: colors.primary[500],
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.secondary,
    },
    tabTextActive: {
      color: colors.text.primary,
    },
    tabContent: {
      flex: 1,
      padding: 16,
    },
    totalCard: {
      backgroundColor: isDarkMode ? colors.neutral[100] : '#ECFDF5',
      borderRadius: 16,
      padding: 24,
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    totalLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: isDarkMode ? colors.text.primary : '#047857',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 8,
    },
    totalValue: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.success.main,
      marginBottom: 4,
    },
    totalSubtitle: {
      fontSize: 12,
      color: colors.text.secondary,
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
    sectionDescription: {
      fontSize: 13,
      color: colors.text.secondary,
      lineHeight: 18,
      marginBottom: 20,
    },
    formGroup: {
      marginBottom: 16,
    },
    formLabel: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 6,
    },
    formInput: {
      borderWidth: 1,
      borderColor: colors.border.main,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.text.primary,
      backgroundColor: colors.background.paper,
    },
    noteInputForm: {
      height: 70,
      textAlignVertical: 'top',
    },
    pickerButton: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border.main,
      borderRadius: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
      backgroundColor: colors.background.paper,
    },
    pickerTextPlaceholder: {
      fontSize: 16,
      color: colors.text.hint,
    },
    pickerTextSelected: {
      fontSize: 16,
      color: colors.text.primary,
      fontWeight: '500',
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary[500],
      borderRadius: 10,
      paddingVertical: 14,
      gap: 8,
      marginTop: 4,
    },
    payoutBtn: {
      backgroundColor: colors.success.main,
    },
    actionButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 24,
    },
    emptyText: {
      fontSize: 14,
      color: colors.text.hint,
    },
    logRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    logInfo: {
      flex: 1,
      paddingRight: 8,
    },
    logName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 4,
    },
    logMeta: {
      fontSize: 12,
      color: colors.text.secondary,
    },
    logRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    logAmount: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text.primary,
    },
    deleteBtn: {
      padding: 4,
    },
    payoutRight: {
      alignItems: 'flex-end',
      gap: 6,
    },
    payoutAmountLabel: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.success.main,
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 6,
    },
    statusText: {
      fontSize: 10,
      fontWeight: '700',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.background.paper,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      maxHeight: '70%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text.primary,
    },
    modalEmpty: {
      alignItems: 'center',
      paddingVertical: 40,
    },
    modalEmptyText: {
      color: colors.text.hint,
      fontSize: 14,
    },
    employeeItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
      gap: 12,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: isDarkMode ? colors.neutral[200] : colors.primary[50],
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      fontSize: 18,
      fontWeight: '700',
      color: isDarkMode ? colors.text.primary : colors.primary[500],
    },
    employeeName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text.primary,
    },
    employeePhone: {
      fontSize: 12,
      color: colors.text.secondary,
      marginTop: 2,
    },
  });
