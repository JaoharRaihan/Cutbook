/**
 * WorkEntryDetailScreen.tsx
 * Detailed view of a work entry with edit/delete actions
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
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useData, useTheme, useLanguage} from '@/context';
import {PaymentMethod} from '@/types';
import {formatBDT, formatDateISO} from '@/utils';
import {useThemedStyles} from '@/hooks/useThemedStyles';
import {ThemeColors} from '@/constants/theme';

// ============================================================================
// COMPONENT
// ============================================================================

export default function WorkEntryDetailScreen({route, navigation}: any): React.ReactElement {
  const {entryId} = route.params;
  const {workEntries, updateWorkEntry, deleteWorkEntry, loading: dataLoading} = useData();
  const {colors, isDarkMode} = useTheme();
  const {language, t} = useLanguage();
  const styles = useThemedStyles(getStyles);

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state for editing
  const [serviceName, setServiceName] = useState('');
  const [price, setPrice] = useState('');
  const [tip, setTip] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [note, setNote] = useState('');

  // Get entry from workEntries
  const entry = useMemo(() => {
    return workEntries.find(e => e.id === entryId);
  }, [entryId, workEntries]);

  // Initialize form when entering edit mode
  const initializeForm = () => {
    if (entry) {
      setServiceName(entry.serviceName);
      setPrice(entry.price.toString());
      setTip((entry.tip || 0).toString());
      setPaymentMethod(entry.paymentMethod);
      setNote(entry.note || '');
    }
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleEdit = () => {
    initializeForm();
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!entry) return;

    const error = validateForm();
    if (error) {
      Alert.alert(
        language === 'en'
          ? 'Validation Error'
          : language === 'bn'
            ? 'যাচাইকরণ ত্রুটি'
            : language === 'es'
              ? 'Error de Validación'
              : 'सत्यापन त्रुटि',
        error,
      );
      return;
    }

    setSaving(true);
    try {
      await updateWorkEntry(entryId, {
        serviceName: serviceName.trim(),
        price: parseFloat(price),
        tip: tip ? parseFloat(tip) : 0,
        paymentMethod,
        note: note.trim() || undefined,
      });
      Alert.alert(
        t.common.success,
        language === 'en'
          ? 'Entry updated'
          : language === 'bn'
            ? 'এন্ট্রি আপডেট করা হয়েছে'
            : language === 'es'
              ? 'Entrada actualizada'
              : 'प्रविष्टि अपडेट की गई',
      );
      setIsEditing(false);
    } catch (err: any) {
      Alert.alert(t.common.error, err.message || 'Failed to update entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t.workEntries.deleteEntry,
      language === 'en'
        ? 'Are you sure you want to delete this work entry?'
        : language === 'bn'
          ? 'আপনি কি নিশ্চিত যে আপনি এই কাজের এন্ট্রিটি মুছতে চান?'
          : language === 'es'
            ? '¿Está seguro de que desea eliminar esta entrada de trabajo?'
            : 'क्या आप वाकई इस कार्य प्रविष्टि को हटाना चाहते हैं?',
      [
        {text: t.common.cancel, style: 'cancel'},
        {
          text: t.common.delete,
          style: 'destructive',
          onPress: confirmDelete,
        },
      ],
    );
  };

  const confirmDelete = async () => {
    setSaving(true);
    try {
      await deleteWorkEntry(entryId);
      Alert.alert(
        language === 'en'
          ? 'Deleted'
          : language === 'bn'
            ? 'মুছে ফেলা হয়েছে'
            : language === 'es'
              ? 'Eliminado'
              : 'हटा दिया गया',
        language === 'en'
          ? 'Entry has been deleted'
          : language === 'bn'
            ? 'এন্ট্রি মুছে ফেলা হয়েছে'
            : language === 'es'
              ? 'La entrada ha sido eliminada'
              : 'प्रविष्टि हटा दी गई है',
        [{text: t.common.done, onPress: () => navigation.goBack()}],
      );
    } catch (err: any) {
      Alert.alert(t.common.error, err.message || 'Failed to delete entry');
      setSaving(false);
    }
  };

  const validateForm = (): string | null => {
    if (!serviceName.trim())
      return language === 'en'
        ? 'Service name is required'
        : language === 'bn'
          ? 'সেবার নাম আবশ্যক'
          : language === 'es'
            ? 'El nombre del servicio es obligatorio'
            : 'सेवा का नाम आवश्यक है';
    if (!price || isNaN(parseFloat(price)))
      return language === 'en'
        ? 'Valid price is required'
        : language === 'bn'
          ? 'বৈধ মূল্য আবশ্যক'
          : language === 'es'
            ? 'Se requiere un precio válido'
            : 'वैध मूल्य आवश्यक है';
    if (parseFloat(price) < 0)
      return language === 'en'
        ? 'Price must be positive'
        : language === 'bn'
          ? 'মূল্য অবশ্যই ইতিবাচক হতে হবে'
          : language === 'es'
            ? 'El precio debe ser positivo'
            : 'मूल्य सकारात्मक होना चाहिए';
    return null;
  };

  const getPaymentMethodColor = (method: PaymentMethod): string => {
    switch (method) {
      case PaymentMethod.CASH:
        return colors.payment.cash || '#4CAF50';
      case PaymentMethod.BKASH:
        return colors.payment.bkash || '#E91E63';
      case PaymentMethod.CARD:
        return colors.payment.card || colors.primary[500];
      case PaymentMethod.NAGAD:
        return colors.payment.nagad || '#FF9800';
      default:
        return colors.text.hint;
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

  const formatDateTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const dateStr = formatDateISO(d);
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const timeStr = `${displayHours}:${displayMinutes} ${ampm}`;
    return language === 'en'
      ? `${dateStr} at ${timeStr}`
      : language === 'bn'
        ? `${dateStr} সময় ${timeStr}`
        : language === 'es'
          ? `${dateStr} a las ${timeStr}`
          : `${dateStr} को ${timeStr}`;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (dataLoading || !entry) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>
            {language === 'en'
              ? 'Loading entry...'
              : language === 'bn'
                ? 'এন্ট্রি লোড হচ্ছে...'
                : language === 'es'
                  ? 'Cargando entrada...'
                  : 'प्रविष्टि लोड हो रही है...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isEditing) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar
          barStyle={isDarkMode ? 'light-content' : 'dark-content'}
          backgroundColor={colors.background.paper}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}>
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled">
            {/* Edit Form */}
            <Text style={styles.editTitle}>{t.workEntries.editEntry}</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t.services.serviceName}</Text>
              <TextInput
                style={styles.input}
                placeholder={t.services.serviceName}
                placeholderTextColor={colors.text.hint}
                value={serviceName}
                onChangeText={setServiceName}
                editable={!saving}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>{t.workEntries.price}</Text>
              <View style={styles.currencyInput}>
                <Text style={styles.currencySymbol}>৳</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0"
                  placeholderTextColor={colors.text.hint}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                  editable={!saving}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {language === 'en'
                  ? 'Tip (Optional)'
                  : language === 'bn'
                    ? 'টিপ (ঐচ্ছিক)'
                    : language === 'es'
                      ? 'Propina (Opcional)'
                      : 'टिप (वैकल्पिक)'}
              </Text>
              <View style={styles.currencyInput}>
                <Text style={styles.currencySymbol}>৳</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0"
                  placeholderTextColor={colors.text.hint}
                  value={tip}
                  onChangeText={setTip}
                  keyboardType="numeric"
                  editable={!saving}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {language === 'en'
                  ? 'Notes (Optional)'
                  : language === 'bn'
                    ? 'নোট (ঐচ্ছিক)'
                    : language === 'es'
                      ? 'Notas (Opcionales)'
                      : 'नोट्स (वैकल्पिक)'}
              </Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder={
                  language === 'en'
                    ? 'Any notes about this entry...'
                    : language === 'bn'
                      ? 'এই এন্ট্রি সম্পর্কে কোন নোট...'
                      : language === 'es'
                        ? 'Cualquier nota sobre esta entrada...'
                        : 'इस प्रविष्टि के बारे में कोई भी नोट...'
                }
                placeholderTextColor={colors.text.hint}
                value={note}
                onChangeText={setNote}
                multiline
                editable={!saving}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={saving}>
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {language === 'en'
                    ? '💾 Save Changes'
                    : language === 'bn'
                      ? '💾 পরিবর্তন সংরক্ষণ করুন'
                      : language === 'es'
                        ? '💾 Guardar Cambios'
                        : '💾 परिवर्तन सहेजें'}
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelEdit}
              disabled={saving}>
              <Text style={styles.cancelButtonText}>{t.common.cancel}</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background.paper}
      />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.serviceHeader}>
            <Text style={styles.serviceName}>{entry.serviceName}</Text>
            {entry.edited && (
              <View style={styles.editedBadge}>
                <Text style={styles.editedText}>
                  {language === 'en'
                    ? '✏️ Edited'
                    : language === 'bn'
                      ? '✏️ সম্পাদিত'
                      : language === 'es'
                        ? '✏️ Editado'
                        : '✏️ संपादित'}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>
              {language === 'en'
                ? 'Total Amount'
                : language === 'bn'
                  ? 'মোট পরিমাণ'
                  : language === 'es'
                    ? 'Monto Total'
                    : 'कुल राशि'}
            </Text>
            <Text style={styles.amountValue}>{formatBDT(entry.price + (entry.tip || 0))}</Text>
            {entry.tip !== undefined && entry.tip > 0 && (
              <Text style={styles.tipText}>
                {language === 'en'
                  ? `(Service: ${formatBDT(entry.price)} + Tip: ${formatBDT(entry.tip)})`
                  : language === 'bn'
                    ? `(সেবা: ${formatBDT(entry.price)} + টিপ: ${formatBDT(entry.tip)})`
                    : language === 'es'
                      ? `(Servicio: ${formatBDT(entry.price)} + Propina: ${formatBDT(entry.tip)})`
                      : `(सेवा: ${formatBDT(entry.price)} + टिप: ${formatBDT(entry.tip)})`}
              </Text>
            )}
          </View>

          <View style={styles.employeeContainer}>
            <View style={styles.employeeAvatar}>
              <Text style={styles.employeeInitial}>
                {entry.employeeName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.employeeInfo}>
              <Text style={styles.employeeLabel}>{t.employees.employee}</Text>
              <Text style={styles.employeeName}>{entry.employeeName}</Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <View
            style={[
              styles.paymentMethodCard,
              {backgroundColor: getPaymentMethodColor(entry.paymentMethod) + '15'},
            ]}>
            <View
              style={[
                styles.paymentMethodBadge,
                {backgroundColor: getPaymentMethodColor(entry.paymentMethod)},
              ]}>
              <Text style={styles.paymentMethodText}>
                {getPaymentMethodLabel(entry.paymentMethod)}
              </Text>
            </View>
          </View>
        </View>

        {/* Details */}
        {entry.note !== undefined && entry.note.trim() !== '' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t.workEntries.notes}</Text>
            <Text style={styles.noteText}>{entry.note}</Text>
          </View>
        )}

        {entry.edited && (
          <View style={styles.editWarning}>
            <Text style={styles.editWarningText}>
              {language === 'en'
                ? `⚠️ This entry was last edited ${formatDateTime(entry.updatedAt)}`
                : language === 'bn'
                  ? `⚠️ এই এন্ট্রিটি সর্বশেষ সম্পাদিত হয়েছিল ${formatDateTime(entry.updatedAt)}`
                  : language === 'es'
                    ? `⚠️ Esta entrada fue editada por última vez el ${formatDateTime(entry.updatedAt)}`
                    : `⚠️ इस प्रविष्टि को अंतिम बार ${formatDateTime(entry.updatedAt)} को संपादित किया गया था`}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit} disabled={saving}>
            <Text style={styles.editButtonText}>
              {language === 'en'
                ? '✏️ Edit Entry'
                : language === 'bn'
                  ? '✏️ এন্ট্রি সম্পাদনা'
                  : language === 'es'
                    ? '✏️ Editar Entrada'
                    : '✏️ प्रविष्टि संपादित करें'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={saving}>
            <Text style={styles.deleteButtonText}>
              {language === 'en'
                ? '🗑️ Delete Entry'
                : language === 'bn'
                  ? '🗑️ এন্ট্রি মুছুন'
                  : language === 'es'
                    ? '🗑️ Eliminar Entrada'
                    : '🗑️ प्रविष्टि हटाएं'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.actionWarning}>
            {language === 'en'
              ? '⚠️ Changes affect commission calculations'
              : language === 'bn'
                ? '⚠️ পরিবর্তনগুলো কমিশন হিসাবের উপর প্রভাব ফেলে'
                : language === 'es'
                  ? '⚠️ Los cambios afectan los cálculos de comisiones'
                  : '⚠️ परिवर्तन कमीशन की गणना को प्रभावित करते हैं'}
          </Text>
        </View>

        {/* Transaction Info */}
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionText}>
            {language === 'en'
              ? `Entry ID: ${entry.id}`
              : language === 'bn'
                ? `এন্ট্রি আইডি: ${entry.id}`
                : language === 'es'
                  ? `ID de Entrada: ${entry.id}`
                  : `प्रविष्टि आईडी: ${entry.id}`}
          </Text>
          <Text style={styles.transactionText}>
            {language === 'en'
              ? `Created: ${formatDateTime(entry.createdAt)}`
              : language === 'bn'
                ? `তৈরি হয়েছে: ${formatDateTime(entry.createdAt)}`
                : language === 'es'
                  ? `Creado: ${formatDateTime(entry.createdAt)}`
                  : `निर्मित: ${formatDateTime(entry.createdAt)}`}
          </Text>
        </View>
      </ScrollView>
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background.default,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: colors.text.secondary,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
    },
    headerCard: {
      backgroundColor: colors.background.paper,
      borderRadius: 16,
      padding: 20,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border.light,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: isDarkMode ? 0.3 : 0.05,
      shadowRadius: 8,
      elevation: 4,
    },
    serviceHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: 20,
    },
    serviceName: {
      flex: 1,
      fontSize: 24,
      fontWeight: '700',
      color: colors.text.primary,
    },
    editedBadge: {
      backgroundColor: isDarkMode ? colors.neutral[100] : '#FFF3E0',
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: isDarkMode ? 1 : 0,
      borderColor: colors.border.light,
    },
    editedText: {
      fontSize: 12,
      color: colors.warning.dark,
    },
    amountContainer: {
      alignItems: 'center',
      paddingVertical: 20,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border.light,
      marginBottom: 20,
    },
    amountLabel: {
      fontSize: 14,
      color: colors.text.secondary,
      marginBottom: 8,
    },
    amountValue: {
      fontSize: 36,
      fontWeight: '700',
      color: colors.success.main,
      marginBottom: 4,
    },
    tipText: {
      fontSize: 13,
      color: colors.text.hint,
    },
    employeeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    employeeAvatar: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: colors.primary[500],
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    employeeInitial: {
      fontSize: 20,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    employeeInfo: {
      flex: 1,
    },
    employeeLabel: {
      fontSize: 13,
      color: colors.text.secondary,
      marginBottom: 2,
    },
    employeeName: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text.primary,
    },
    section: {
      backgroundColor: colors.background.paper,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: 16,
    },
    paymentMethodCard: {
      borderRadius: 8,
      padding: 12,
      alignItems: 'center',
    },
    paymentMethodBadge: {
      paddingHorizontal: 20,
      paddingVertical: 8,
      borderRadius: 20,
    },
    paymentMethodText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    noteText: {
      fontSize: 14,
      color: colors.text.primary,
      lineHeight: 20,
    },
    editWarning: {
      backgroundColor: isDarkMode ? colors.neutral[100] : '#FFF3E0',
      borderRadius: 8,
      padding: 12,
      marginTop: 12,
      borderWidth: isDarkMode ? 1 : 0,
      borderColor: colors.border.light,
      marginBottom: 16,
    },
    editWarningText: {
      fontSize: 13,
      color: colors.warning.dark,
      textAlign: 'center',
    },
    editButton: {
      backgroundColor: isDarkMode ? colors.background.paper : colors.primary[50],
      borderRadius: 8,
      paddingVertical: 14,
      alignItems: 'center',
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.primary[500],
    },
    editButtonText: {
      color: colors.primary[500],
      fontSize: 16,
      fontWeight: '600',
    },
    deleteButton: {
      backgroundColor: isDarkMode ? colors.background.paper : '#FFEBEE',
      borderRadius: 8,
      paddingVertical: 14,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.error.main,
    },
    deleteButtonText: {
      color: colors.error.main,
      fontSize: 16,
      fontWeight: '600',
    },
    actionWarning: {
      fontSize: 12,
      color: colors.warning.dark,
      marginTop: 12,
      textAlign: 'center',
    },
    transactionInfo: {
      alignItems: 'center',
      paddingVertical: 16,
    },
    transactionText: {
      fontSize: 12,
      color: colors.text.hint,
      marginBottom: 4,
    },
    keyboardView: {
      flex: 1,
    },
    editTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: 20,
      paddingHorizontal: 16,
      paddingTop: 16,
    },
    formGroup: {
      marginBottom: 20,
      paddingHorizontal: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.background.default,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border.light,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
      color: colors.text.primary,
    },
    textarea: {
      minHeight: 80,
      textAlignVertical: 'top',
      paddingTop: 12,
    },
    currencyInput: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.default,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border.light,
      paddingHorizontal: 12,
    },
    currencySymbol: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.secondary,
      marginRight: 8,
    },
    priceInput: {
      flex: 1,
      paddingVertical: 10,
      fontSize: 14,
      color: colors.text.primary,
    },
    saveButton: {
      backgroundColor: colors.success.main,
      borderRadius: 8,
      paddingVertical: 14,
      alignItems: 'center',
      marginBottom: 12,
      marginHorizontal: 16,
    },
    saveButtonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: '600',
    },
    cancelButton: {
      backgroundColor: colors.background.default,
      borderRadius: 8,
      paddingVertical: 14,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border.light,
      marginBottom: 20,
      marginHorizontal: 16,
    },
    cancelButtonText: {
      color: colors.text.primary,
      fontSize: 16,
      fontWeight: '600',
    },
    buttonDisabled: {
      opacity: 0.6,
    },
  });
