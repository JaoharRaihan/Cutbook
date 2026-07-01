/**
 * AddWorkEntryScreen.tsx (Employee Version)
 * Form for employees to add their own work entries or others' entries
 * Only accessible if they have the CAN_ADD_ENTRIES permission
 */

import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useOrg, useData, useAuth, useTheme, useLanguage} from '@/context';
import {PaymentMethod, Service, EmployeePermission, User} from '@/types';
import {useThemedStyles} from '@/hooks/useThemedStyles';
import MaterialIcons from '@react-native-vector-icons/material-icons';
const bkashLogo = require('@/assets/Logo/bkash_payment_logo.png');
const nagadLogo = require('@/assets/Logo/Nagad-Logo.wine.png');
import {ThemeColors} from '@/constants/theme';

// ============================================================================
// COMPONENT
// ============================================================================

export default function AddWorkEntryScreen({navigation}: any): React.ReactElement {
  // Contexts
  const {orgServices, orgUsers} = useOrg();
  const {addWorkEntry, loading: dataLoading} = useData();
  const {user} = useAuth();
  const {colors, isDarkMode} = useTheme();
  const {language, t} = useLanguage();
  const styles = useThemedStyles(getStyles);

  // Check permission
  const canAddEntries = user?.permissions?.includes(EmployeePermission.CAN_ADD_ENTRIES) || false;

  // Form state
  const [selectedEmployee, setSelectedEmployee] = useState<string>(user?.id || '');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customServiceName, setCustomServiceName] = useState('');
  const [price, setPrice] = useState('');
  const [tip, setTip] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [note, setNote] = useState('');
  const [showEmployeePicker, setShowEmployeePicker] = useState(false);
  const [showServicePicker, setShowServicePicker] = useState(false);
  const [useCustomService, setUseCustomService] = useState(false);

  const handleServiceSelect = (serviceId: string) => {
    setSelectedServices(prev => {
      const updated = prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId];

      // Auto-fill price from services default sum
      let totalDefaultPrice = 0;
      updated.forEach(id => {
        const service = activeServices.find((s: Service) => s.id === id);
        if (service?.defaultPrice) {
          totalDefaultPrice += service.defaultPrice;
        }
      });
      setPrice(totalDefaultPrice > 0 ? totalDefaultPrice.toString() : '');

      return updated;
    });
  };

  const getSelectedServicesLabel = (): string => {
    if (selectedServices.length === 0) {
      return t.workEntries.selectService;
    }
    return selectedServices
      .map(id => {
        const service = activeServices.find((s: Service) => s.id === id);
        return service ? service.name : '';
      })
      .filter(Boolean)
      .join(', ');
  };

  const [searchEmployeeQuery, setSearchEmployeeQuery] = useState('');
  const [searchServiceQuery, setSearchServiceQuery] = useState('');

  // Filter active employees (includes both employees and owner) with search capability
  const activeEmployees = useMemo(() => {
    const list = orgUsers.filter(
      u => (u.role === 'employee' || u.role === 'owner') && u.status === 'active',
    );
    if (!searchEmployeeQuery.trim()) return list;
    const query = searchEmployeeQuery.toLowerCase();
    return list.filter(u => u.name.toLowerCase().includes(query) || u.phone.includes(query));
  }, [orgUsers, searchEmployeeQuery]);

  // Filter active services with search capability
  const activeServices = useMemo(() => {
    const list = orgServices.filter((s: Service) => s.isActive);
    if (!searchServiceQuery.trim()) return list;
    const query = searchServiceQuery.toLowerCase();
    return list.filter(
      (s: Service) =>
        s.name.toLowerCase().includes(query) ||
        (s.category && s.category.toLowerCase().includes(query)),
    );
  }, [orgServices, searchServiceQuery]);

  const loading = dataLoading;

  const paymentMethods = [
    {
      value: PaymentMethod.CASH,
      label: t.payment.cash,
      iconName: 'payments' as const,
      color: colors.payment.cash || '#4CAF50',
    },
    {
      value: PaymentMethod.BKASH,
      label: t.payment.bkash,
      logo: bkashLogo,
      color: '#E2136E',
    },
    {
      value: PaymentMethod.NAGAD,
      label: t.payment.nagad,
      logo: nagadLogo,
      color: '#F37021',
    },
    {
      value: PaymentMethod.BANGLA_QR,
      label: 'Bangla QR',
      iconName: 'qr-code' as const,
      color: '#006A4E',
    },
    {
      value: PaymentMethod.ROCKET,
      label: 'Rocket',
      iconName: 'rocket' as const,
      color: '#8C2D8B',
    },
    {
      value: PaymentMethod.CARD,
      label: t.payment.card,
      iconName: 'credit-card' as const,
      color: colors.payment.card || colors.primary[500],
    },
  ];

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateForm = (): string | null => {
    if (!selectedEmployee) {
      return language === 'en'
        ? 'Please select an employee'
        : language === 'bn'
          ? 'দয়া করে একজন কর্মী নির্বাচন করুন'
          : language === 'es'
            ? 'Por favor seleccione un empleado'
            : 'कृपया एक कर्मचारी चुनें';
    }

    if (!useCustomService && selectedServices.length === 0) {
      return language === 'en'
        ? 'Please select at least one service or use custom service name'
        : language === 'bn'
          ? 'দয়া করে কমপক্ষে একটি সেবা নির্বাচন করুন বা কাস্টম সেবার নাম ব্যবহার করুন'
          : language === 'es'
            ? 'Por favor seleccione al menos un servicio o use un nombre de servicio personalizado'
            : 'कृपया कम से कम एक सेवा चुनें या कस्टम सेवा नाम का उपयोग करें';
    }

    if (useCustomService && !customServiceName.trim()) {
      return language === 'en'
        ? 'Please enter a service name'
        : language === 'bn'
          ? 'দয়া করে একটি সেবার নাম লিখুন'
          : language === 'es'
            ? 'Por favor ingrese un nombre de servicio'
            : 'कृपया सेवा का नाम दर्ज करें';
    }

    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      return language === 'en'
        ? 'Please enter a valid price'
        : language === 'bn'
          ? 'দয়া করে একটি বৈধ মূল্য লিখুন'
          : language === 'es'
            ? 'Por favor ingrese un precio válido'
            : 'कृपया एक मान्य मूल्य दर्ज करें';
    }

    if (tip && (isNaN(parseFloat(tip)) || parseFloat(tip) < 0)) {
      return language === 'en'
        ? 'Please enter a valid tip amount'
        : language === 'bn'
          ? 'দয়া করে একটি বৈধ টিপ পরিমাণ লিখুন'
          : language === 'es'
            ? 'Por favor ingrese un monto de propina válido'
            : 'कृपया एक मान्य टिप राशि दर्ज करें';
    }

    return null;
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSubmit = async () => {
    if (!canAddEntries) {
      Alert.alert(
        language === 'en'
          ? 'Permission Denied'
          : language === 'bn'
            ? 'অনুমতি অস্বীকৃত'
            : language === 'es'
              ? 'Permiso Denegado'
              : 'अनुमति अस्वीकृत',
        language === 'en'
          ? 'You do not have permission to add work entries.'
          : language === 'bn'
            ? 'আপনার কাজের এন্ট্রি যোগ করার অনুমতি নেই।'
            : language === 'es'
              ? 'No tiene permiso para añadir entradas de trabajo.'
              : 'आपके पास कार्य प्रविष्टियाँ जोड़ने की अनुमति नहीं है।',
      );
      return;
    }

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

    try {
      // Get service info
      let serviceName = '';
      let serviceId: string | undefined;
      if (useCustomService) {
        serviceName = customServiceName.trim();
      } else {
        const selectedServicesData = activeServices.filter((s: Service) =>
          selectedServices.includes(s.id),
        );
        serviceName = selectedServicesData.map((s: Service) => s.name).join(', ');
        if (selectedServicesData.length === 1) {
          serviceId = selectedServicesData[0].id;
        }
      }

      // Create entry object and save to Firestore
      await addWorkEntry({
        employeeId: selectedEmployee,
        serviceId,
        serviceName,
        price: parseFloat(price),
        tip: tip ? parseFloat(tip) : 0,
        paymentMethod,
        note: note.trim() || undefined,
      });

      Alert.alert(
        t.common.success,
        language === 'en'
          ? 'Work entry added successfully!'
          : language === 'bn'
            ? 'কাজের এন্ট্রি সফলভাবে যোগ করা হয়েছে!'
            : language === 'es'
              ? '¡Entrada de trabajo añadida con éxito!'
              : 'कार्य प्रविष्टि सफलतापूर्वक जोड़ी गई!',
        [
          {
            text: t.common.done,
            onPress: () => {
              navigation.goBack();
            },
          },
        ],
      );
    } catch (err: any) {
      console.error('Error adding work entry:', err);
      Alert.alert(t.common.error, err.message || 'Failed to add work entry');
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

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {/* Form Section */}
          <View style={styles.section}>
            {/* Employee Selection */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {language === 'en'
                  ? 'Employee'
                  : language === 'bn'
                    ? 'কর্মী'
                    : language === 'es'
                      ? 'Empleado'
                      : 'कर्मचारी'}{' '}
                <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.picker}
                onPress={() => setShowEmployeePicker(!showEmployeePicker)}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flex: 1,
                  }}>
                  <Text style={styles.pickerText}>
                    {selectedEmployee
                      ? activeEmployees.find(e => e.id === selectedEmployee)?.name ||
                        t.workEntries.selectEmployee
                      : t.workEntries.selectEmployee}
                  </Text>
                  <MaterialIcons
                    name={showEmployeePicker ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                    size={20}
                    color={colors.text.hint}
                  />
                </View>
              </TouchableOpacity>

              {showEmployeePicker && (
                <View style={styles.pickerDropdownContainer}>
                  {/* Search input inside dropdown */}
                  <View style={styles.pickerSearchContainer}>
                    <MaterialIcons
                      name="search"
                      size={18}
                      color={colors.text.hint}
                      style={styles.pickerSearchIcon}
                    />
                    <TextInput
                      style={styles.pickerSearchInput}
                      placeholder={language === 'en' ? 'Search employee...' : 'কর্মী খুঁজুন...'}
                      placeholderTextColor={colors.text.hint}
                      value={searchEmployeeQuery}
                      onChangeText={setSearchEmployeeQuery}
                      autoCapitalize="none"
                      autoCorrect={false}
                    />
                    {searchEmployeeQuery.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setSearchEmployeeQuery('')}
                        style={styles.pickerSearchClear}>
                        <MaterialIcons name="close" size={18} color={colors.text.hint} />
                      </TouchableOpacity>
                    )}
                  </View>
                  <ScrollView
                    style={styles.pickerOptions}
                    nestedScrollEnabled={true}
                    showsVerticalScrollIndicator={true}>
                    {activeEmployees.length === 0 ? (
                      <View style={styles.emptyState}>
                        <Text style={styles.emptyStateText}>
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
                      activeEmployees.map((employee: User) => (
                        <TouchableOpacity
                          key={employee.id}
                          style={[
                            styles.pickerOption,
                            selectedEmployee === employee.id && styles.pickerOptionSelected,
                          ]}
                          onPress={() => {
                            setSelectedEmployee(employee.id);
                            setShowEmployeePicker(false);
                            setSearchEmployeeQuery('');
                          }}>
                          <View>
                            <Text style={styles.pickerOptionText}>
                              {employee.name}{' '}
                              {employee.role === 'owner'
                                ? `(${language === 'en' ? 'Owner' : language === 'bn' ? 'মালিক' : 'Owner'})`
                                : ''}
                            </Text>
                          </View>
                          {selectedEmployee === employee.id && (
                            <Text style={styles.checkmark}>✓</Text>
                          )}
                        </TouchableOpacity>
                      ))
                    )}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Service Selection */}
            <View style={styles.inputGroup}>
              <View style={styles.toggleGroup}>
                <TouchableOpacity
                  style={[styles.toggle, !useCustomService && styles.toggleActive]}
                  onPress={() => {
                    setUseCustomService(false);
                    setSelectedServices([]);
                    setCustomServiceName('');
                    setPrice('');
                  }}>
                  <Text style={[styles.toggleText, !useCustomService && styles.toggleTextActive]}>
                    {t.workEntries.selectService}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggle, useCustomService && styles.toggleActive]}
                  onPress={() => {
                    setUseCustomService(true);
                    setSelectedServices([]);
                    setCustomServiceName('');
                    setPrice('');
                  }}>
                  <Text style={[styles.toggleText, useCustomService && styles.toggleTextActive]}>
                    {t.workEntries.customService}
                  </Text>
                </TouchableOpacity>
              </View>

              {!useCustomService ? (
                <>
                  <Text style={styles.label}>
                    {language === 'en'
                      ? 'Service'
                      : language === 'bn'
                        ? 'সেবা'
                        : language === 'es'
                          ? 'Servicio'
                          : 'सेवा'}
                  </Text>
                  <TouchableOpacity
                    style={styles.picker}
                    onPress={() => setShowServicePicker(!showServicePicker)}>
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flex: 1,
                      }}>
                      <Text style={styles.pickerText}>{getSelectedServicesLabel()}</Text>
                      <MaterialIcons
                        name={showServicePicker ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                        size={20}
                        color={colors.text.hint}
                      />
                    </View>
                  </TouchableOpacity>

                  {showServicePicker && (
                    <View style={styles.pickerDropdownContainer}>
                      {/* Search input inside dropdown */}
                      <View style={styles.pickerSearchContainer}>
                        <MaterialIcons
                          name="search"
                          size={18}
                          color={colors.text.hint}
                          style={styles.pickerSearchIcon}
                        />
                        <TextInput
                          style={styles.pickerSearchInput}
                          placeholder={language === 'en' ? 'Search service...' : 'সেবা খুঁজুন...'}
                          placeholderTextColor={colors.text.hint}
                          value={searchServiceQuery}
                          onChangeText={setSearchServiceQuery}
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                        {searchServiceQuery.length > 0 && (
                          <TouchableOpacity
                            onPress={() => setSearchServiceQuery('')}
                            style={styles.pickerSearchClear}>
                            <MaterialIcons name="close" size={18} color={colors.text.hint} />
                          </TouchableOpacity>
                        )}
                      </View>
                      <ScrollView
                        style={styles.pickerOptions}
                        nestedScrollEnabled={true}
                        showsVerticalScrollIndicator={true}>
                        {activeServices.length === 0 ? (
                          <View style={styles.pickerOption}>
                            <Text style={styles.pickerOptionText}>
                              {language === 'en'
                                ? 'No active services found'
                                : language === 'bn'
                                  ? 'কোন সক্রিয় সেবা পাওয়া যায়নি'
                                  : language === 'es'
                                    ? 'No se encontraron servicios activos'
                                    : 'कोई सक्रिय सेवा नहीं मिली'}
                            </Text>
                          </View>
                        ) : (
                          activeServices.map((service: Service) => (
                            <TouchableOpacity
                              key={service.id}
                              style={[
                                styles.pickerOption,
                                selectedServices.includes(service.id) &&
                                  styles.pickerOptionSelected,
                              ]}
                              onPress={() => {
                                handleServiceSelect(service.id);
                              }}>
                              <View style={styles.pickerOptionContent}>
                                <Text style={styles.pickerOptionText}>{service.name}</Text>
                                {service.defaultPrice && (
                                  <Text style={styles.pickerOptionPrice}>
                                    ৳{service.defaultPrice}
                                  </Text>
                                )}
                              </View>
                              {selectedServices.includes(service.id) && (
                                <Text style={styles.checkmark}>✓</Text>
                              )}
                            </TouchableOpacity>
                          ))
                        )}
                      </ScrollView>
                    </View>
                  )}
                </>
              ) : (
                <>
                  <Text style={styles.label}>{t.services.serviceName}</Text>
                  <TextInput
                    style={styles.input}
                    placeholder={
                      language === 'en'
                        ? 'Enter service name'
                        : language === 'bn'
                          ? 'সেবার নাম লিখুন'
                          : language === 'es'
                            ? 'Ingrese el nombre del servicio'
                            : 'सेवा का नाम दर्ज करें'
                    }
                    placeholderTextColor={colors.text.hint}
                    value={customServiceName}
                    onChangeText={setCustomServiceName}
                    editable={!loading}
                  />
                </>
              )}
            </View>

            {/* Price Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t.workEntries.price} <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.currencyInputContainer}>
                <Text style={styles.currencySymbol}>৳</Text>
                <TextInput
                  style={styles.currencyInput}
                  placeholder="0"
                  placeholderTextColor={colors.text.hint}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Tip Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {language === 'en'
                  ? 'Tip (Optional)'
                  : language === 'bn'
                    ? 'টিপ (ঐচ্ছিক)'
                    : language === 'es'
                      ? 'Propina (Opcional)'
                      : 'टिप (वैकल्पिक)'}
              </Text>
              <View style={styles.currencyInputContainer}>
                <Text style={styles.currencySymbol}>৳</Text>
                <TextInput
                  style={styles.currencyInput}
                  placeholder="0"
                  placeholderTextColor={colors.text.hint}
                  value={tip}
                  onChangeText={setTip}
                  keyboardType="decimal-pad"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Payment Method */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t.workEntries.paymentMethod} <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.methodGrid}>
                {paymentMethods.map(method => (
                  <TouchableOpacity
                    key={method.value}
                    style={[
                      styles.methodButton,
                      paymentMethod === method.value && styles.methodButtonActive,
                      {borderColor: method.color},
                      paymentMethod === method.value && {
                        backgroundColor: method.color + '20',
                      },
                    ]}
                    onPress={() => setPaymentMethod(method.value)}
                    disabled={loading}>
                    {method.logo ? (
                      <Image
                        source={method.logo}
                        style={styles.paymentMethodLogo}
                        resizeMode="contain"
                      />
                    ) : method.iconName ? (
                      <MaterialIcons
                        name={method.iconName}
                        size={28}
                        color={method.color}
                        style={styles.paymentMethodIcon}
                      />
                    ) : (
                      <Text style={styles.paymentIcon}>💵</Text>
                    )}
                    <Text
                      style={[
                        styles.methodButtonText,
                        paymentMethod === method.value && {color: method.color},
                      ]}>
                      {method.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Note Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {language === 'en'
                  ? 'Note (Optional)'
                  : language === 'bn'
                    ? 'নোট (ঐচ্ছিক)'
                    : language === 'es'
                      ? 'Nota (Opcional)'
                      : 'नोट (वैकल्पिक)'}
              </Text>
              <TextInput
                style={[styles.input, styles.noteInput]}
                placeholder={
                  language === 'en'
                    ? 'Add any notes about this service'
                    : language === 'bn'
                      ? 'এই সেবা সম্পর্কে কোন নোট যোগ করুন'
                      : language === 'es'
                        ? 'Añada cualquier nota sobre este servicio'
                        : 'इस सेवा के बारे में कोई भी नोट जोड़ें'
                }
                placeholderTextColor={colors.text.hint}
                value={note}
                onChangeText={setNote}
                multiline
                numberOfLines={3}
                editable={!loading}
              />
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <MaterialIcons
              name="lightbulb-outline"
              size={18}
              color={colors.primary[500]}
              style={{marginRight: 8}}
            />
            <Text style={styles.infoText}>
              {language === 'en'
                ? 'This entry will be recorded for the selected employee and visible to your manager. You can add entries for yourself or other employees.'
                : language === 'bn'
                  ? 'এই এন্ট্রিটি নির্বাচিত কর্মীর জন্য রেকর্ড করা হবে এবং আপনার ম্যানেজারের কাছে দৃশ্যমান হবে। আপনি নিজের বা অন্য কর্মীদের জন্য এন্ট্রি যোগ করতে পারেন।'
                  : language === 'es'
                    ? 'Esta entrada se registrará para el empleado seleccionado y será visible para su gerente. Puede añadir entradas para usted u otros empleados.'
                    : 'यह प्रविष्टि चयनित कर्मचारी के लिए दर्ज की जाएगी और आपके प्रबंधक को दिखाई देगी। आप अपने या अन्य कर्मचारियों के लिए प्रविष्टियां जोड़ सकते हैं।'}
            </Text>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}>
            <Text style={styles.submitButtonText}>{t.workEntries.addEntry}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    keyboardView: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
    },
    section: {
      backgroundColor: colors.background.paper,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 8,
    },
    required: {
      color: colors.error.main,
    },
    input: {
      backgroundColor: colors.background.default,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.text.primary,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    noteInput: {
      minHeight: 80,
      paddingTop: 14,
      textAlignVertical: 'top',
    },
    toggleGroup: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 12,
    },
    toggle: {
      flex: 1,
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: colors.background.default,
      borderWidth: 1,
      borderColor: colors.border.light,
      alignItems: 'center',
    },
    toggleActive: {
      backgroundColor: colors.primary[500],
      borderColor: colors.primary[500],
    },
    toggleText: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text.secondary,
    },
    toggleTextActive: {
      color: '#FFFFFF',
    },
    picker: {
      backgroundColor: colors.background.default,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    pickerText: {
      fontSize: 16,
      color: colors.text.primary,
    },
    pickerDropdown: {
      backgroundColor: 'transparent',
    },
    pickerDropdownContainer: {
      marginTop: 8,
      backgroundColor: colors.background.paper,
      borderRadius: 12,
      borderWidth: 1.5,
      borderColor: colors.border.light,
      overflow: 'hidden',
      maxHeight: 300,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: isDarkMode ? 0.2 : 0.08,
      shadowRadius: 6,
      elevation: 3,
    },
    pickerSearchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
      backgroundColor: colors.background.default,
    },
    pickerSearchIcon: {
      marginRight: 6,
    },
    pickerSearchInput: {
      flex: 1,
      fontSize: 14,
      color: colors.text.primary,
      padding: 0,
      height: 32,
    },
    pickerSearchClear: {
      padding: 4,
    },
    pickerOptions: {
      backgroundColor: 'transparent',
    },
    pickerOptionSelected: {
      backgroundColor: isDarkMode ? colors.neutral[100] : colors.primary[50],
    },
    checkmark: {
      fontSize: 16,
      color: colors.primary[500],
      fontWeight: 'bold',
      marginRight: 8,
    },
    paymentIcon: {
      fontSize: 24,
      marginBottom: 8,
    },
    paymentMethodLogo: {
      width: 50,
      height: 28,
      marginBottom: 8,
    },
    paymentMethodIcon: {
      marginBottom: 8,
    },
    emptyState: {
      padding: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    emptyStateText: {
      fontSize: 14,
      color: colors.text.secondary,
      textAlign: 'center',
    },
    pickerOption: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
      backgroundColor: colors.background.paper,
    },
    pickerOptionContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      width: '100%',
    },
    pickerOptionText: {
      fontSize: 16,
      color: colors.text.primary,
      flex: 1,
    },
    pickerOptionTextActive: {
      fontWeight: '700',
      color: colors.primary[500],
    },
    pickerOptionPrice: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.secondary,
      marginLeft: 8,
    },
    pickerOptionPriceActive: {
      color: colors.primary[500],
    },
    currencyInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.default,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border.light,
      paddingHorizontal: 12,
    },
    currencySymbol: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.primary[500],
      marginRight: 8,
    },
    currencyInput: {
      flex: 1,
      paddingHorizontal: 0,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.text.primary,
    },
    methodGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    methodButton: {
      flex: 1,
      minWidth: '30%',
      paddingVertical: 10,
      paddingHorizontal: 12,
      borderRadius: 8,
      backgroundColor: colors.background.default,
      borderWidth: 1,
      borderColor: colors.border.light,
      alignItems: 'center',
    },
    methodButtonActive: {
      backgroundColor: isDarkMode ? colors.neutral[100] : colors.primary[50],
      borderColor: colors.primary[500],
    },
    methodButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text.secondary,
    },
    methodButtonTextActive: {
      color: colors.primary[500],
    },
    infoCard: {
      flexDirection: 'row',
      backgroundColor: isDarkMode ? colors.background.paper : colors.primary[50],
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDarkMode ? colors.border.light : colors.primary[100],
      alignItems: 'center',
    },
    infoText: {
      flex: 1,
      fontSize: 14,
      color: colors.text.primary,
      lineHeight: 20,
    },
    footer: {
      padding: 16,
      backgroundColor: colors.background.paper,
      borderTopWidth: 1,
      borderTopColor: colors.border.light,
    },
    submitButton: {
      backgroundColor: colors.primary[500],
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: isDarkMode ? 0.3 : 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
    submitButtonDisabled: {
      backgroundColor: colors.neutral[300],
    },
    submitButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '600',
    },
  });
