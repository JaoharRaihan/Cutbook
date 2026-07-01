/**
 * AddWorkEntryScreen.tsx
 * Form to add a new work entry (Owner Version)
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
import {WorkEntry, PaymentMethod, Service, User} from '@/types';
import {useThemedStyles} from '@/hooks/useThemedStyles';
import {ThemeColors} from '@/constants/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';
const bkashLogo = require('@/assets/Logo/bkash_payment_logo.png');
const nagadLogo = require('@/assets/Logo/Nagad-Logo.wine.png');

// ============================================================================
// COMPONENT
// ============================================================================

export default function AddWorkEntryScreen({navigation}: any): React.ReactElement {
  // Contexts
  const {orgUsers, orgServices, currentOrg, loading: orgLoading} = useOrg();
  const {addWorkEntry, loading: dataLoading} = useData();
  const {user} = useAuth();
  const {colors, isDarkMode} = useTheme();
  const {language, t} = useLanguage();
  const styles = useThemedStyles(getStyles);

  // Form state
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [customServiceName, setCustomServiceName] = useState('');
  const [price, setPrice] = useState('');
  const [tip, setTip] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [note, setNote] = useState('');
  const [showEmployeePicker, setShowEmployeePicker] = useState(false);
  const [showServicePicker, setShowServicePicker] = useState(false);
  const [useCustomService, setUseCustomService] = useState(false);

  const [searchEmployeeQuery, setSearchEmployeeQuery] = useState('');
  const [searchServiceQuery, setSearchServiceQuery] = useState('');

  // Filter active employees, owner and services with search capability
  const activeEmployees = useMemo(() => {
    const list = orgUsers.filter(
      u => (u.role === 'employee' || u.role === 'owner') && u.status === 'active',
    );
    if (!searchEmployeeQuery.trim()) return list;
    const query = searchEmployeeQuery.toLowerCase();
    return list.filter(u => u.name.toLowerCase().includes(query) || u.phone.includes(query));
  }, [orgUsers, searchEmployeeQuery]);

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

  const loading = orgLoading || dataLoading;

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

      // Get employee info
      const employee = activeEmployees.find((e: User) => e.id === selectedEmployee);
      if (!employee) {
        Alert.alert(
          t.common.error,
          language === 'en'
            ? 'Selected employee not found'
            : language === 'bn'
              ? 'নির্বাচিত কর্মী পাওয়া যায়নি'
              : language === 'es'
                ? 'Empleado seleccionado no encontrado'
                : 'चयनित कर्मचारी नहीं मिला',
        );
        return;
      }

      // Prepare work entry
      const newEntry: any = {
        orgId: currentOrg?.id,
        employeeId: selectedEmployee,
        employeeName: employee.name,
        serviceId,
        serviceName,
        price: parseFloat(price),
        paymentMethod,
        createdBy: user?.id || 'unknown',
        createdByName: user?.name || 'Owner',
        edited: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Only add optional fields if they have values
      if (tip && parseFloat(tip) > 0) {
        newEntry.tip = parseFloat(tip);
      }
      if (note.trim()) {
        newEntry.note = note.trim();
      }

      // Save to Firebase
      await addWorkEntry(newEntry as WorkEntry);

      const totalAmount = parseFloat(price) + (tip ? parseFloat(tip) : 0);

      Alert.alert(
        t.common.success,
        language === 'en'
          ? `Work entry for ${employee.name} has been added!\nTotal: ৳${totalAmount}`
          : language === 'bn'
            ? `${employee.name}-এর কাজের এন্ট্রি যোগ করা হয়েছে!\nমোট: ৳${totalAmount}`
            : language === 'es'
              ? `¡Se ha añadido la entrada de trabajo para ${employee.name}!\nTotal: ৳${totalAmount}`
              : `${employee.name} के लिए कार्य प्रविष्टि जोड़ दी गई है!\nकुल: ৳${totalAmount}`,
        [
          {
            text:
              language === 'en'
                ? 'Add Another'
                : language === 'bn'
                  ? 'আরেকটি যোগ করুন'
                  : language === 'es'
                    ? 'Añadir otro'
                    : 'एक और जोड़ें',
            onPress: () => resetForm(),
          },
          {
            text: t.common.done,
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (err: any) {
      console.error('Error adding work entry:', err);
      Alert.alert(
        t.common.error,
        err.message ||
          (language === 'en'
            ? 'Failed to add work entry. Please try again.'
            : language === 'bn'
              ? 'কাজের এন্ট্রি যোগ করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।'
              : language === 'es'
                ? 'Error al añadir la entrada de trabajo. Por favor intente de nuevo.'
                : 'कार्य प्रविष्टि जोड़ने में विफल। कृपया पुनः प्रयास करें।'),
      );
    }
  };

  const resetForm = () => {
    setSelectedEmployee('');
    setSelectedServices([]);
    setCustomServiceName('');
    setPrice('');
    setTip('');
    setNote('');
    setUseCustomService(false);
  };

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

  const getEmployeeName = (id: string): string => {
    const employee = activeEmployees.find((e: User) => e.id === id);
    return employee ? employee.name : t.workEntries.selectEmployee;
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
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>
              {language === 'en'
                ? "Select employee, service, amount, and payment method, then tap 'Add Work Entry'"
                : language === 'bn'
                  ? "কর্মী, সেবা, পরিমাণ এবং পেমেন্ট পদ্ধতি নির্বাচন করুন, তারপর 'কাজের এন্ট্রি যোগ করুন' এ আলতো চাপুন"
                  : language === 'es'
                    ? "Seleccione el empleado, el servicio, el monto y el método de pago, luego toque 'Añadir entrada de trabajo'"
                    : "कर्मचारी, सेवा, राशि और भुगतान विधि चुनें, फिर 'कार्य प्रविष्टि जोड़ें' पर टैप करें"}
            </Text>
          </View>

          {/* Employee Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {language === 'en'
                ? 'Employee'
                : language === 'bn'
                  ? 'কর্মী'
                  : language === 'es'
                    ? 'Empleado'
                    : 'कर्मचारी'}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t.workEntries.selectEmployee} <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowEmployeePicker(!showEmployeePicker)}>
                <Text
                  style={[styles.pickerButtonText, !selectedEmployee && styles.placeholderText]}>
                  {selectedEmployee
                    ? getEmployeeName(selectedEmployee)
                    : t.workEntries.selectEmployee}
                </Text>
                <MaterialIcons
                  name={showEmployeePicker ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  size={20}
                  color={colors.text.hint}
                />
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
                        <Text style={styles.emptyStateSubtext}>
                          {language === 'en'
                            ? 'Add employees from Settings'
                            : language === 'bn'
                              ? 'সেটিংস থেকে কর্মী যোগ করুন'
                              : language === 'es'
                                ? 'Añadir empleados desde Configuración'
                                : 'सेटिंग्स से कर्मचारी जोड़ें'}
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
                            <Text style={styles.pickerOptionSubtext}>
                              {employee.role === 'owner' && !employee.commissionPercentage
                                ? language === 'en'
                                  ? 'Owner'
                                  : language === 'bn'
                                    ? 'মালিক'
                                    : language === 'es'
                                      ? 'Propietario'
                                      : 'Owner'
                                : language === 'en'
                                  ? `Commission: ${employee.commissionPercentage || 0}%`
                                  : language === 'bn'
                                    ? `কমিশন: ${employee.commissionPercentage || 0}%`
                                    : language === 'es'
                                      ? `Comisión: ${employee.commissionPercentage || 0}%`
                                      : `কमीशन: ${employee.commissionPercentage || 0}%`}
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
          </View>

          {/* Service Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {language === 'en'
                ? 'Service'
                : language === 'bn'
                  ? 'সেবা'
                  : language === 'es'
                    ? 'Servicio'
                    : 'सेवा'}
            </Text>

            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, !useCustomService && styles.toggleButtonActive]}
                onPress={() => setUseCustomService(false)}>
                <Text
                  style={[
                    styles.toggleButtonText,
                    !useCustomService && styles.toggleButtonTextActive,
                  ]}>
                  {t.workEntries.selectService}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.toggleButton, useCustomService && styles.toggleButtonActive]}
                onPress={() => setUseCustomService(true)}>
                <Text
                  style={[
                    styles.toggleButtonText,
                    useCustomService && styles.toggleButtonTextActive,
                  ]}>
                  {t.workEntries.customService}
                </Text>
              </TouchableOpacity>
            </View>

            {!useCustomService ? (
              <View style={styles.inputGroup}>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowServicePicker(!showServicePicker)}>
                  <Text
                    style={[
                      styles.pickerButtonText,
                      selectedServices.length === 0 && styles.placeholderText,
                    ]}>
                    {getSelectedServicesLabel()}
                  </Text>
                  <MaterialIcons
                    name={showServicePicker ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                    size={20}
                    color={colors.text.hint}
                  />
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
                          <Text style={styles.pickerOptionSubtext}>
                            {language === 'en'
                              ? 'Add services from Settings'
                              : language === 'bn'
                                ? 'সেটিংস থেকে সেবা যোগ করুন'
                                : language === 'es'
                                  ? 'Añadir servicios desde Configuración'
                                  : 'सेटींग्स से सेवा जोड़ें'}
                          </Text>
                        </View>
                      ) : (
                        activeServices.map((service: Service) => (
                          <TouchableOpacity
                            key={service.id}
                            style={[
                              styles.pickerOption,
                              selectedServices.includes(service.id) && styles.pickerOptionSelected,
                            ]}
                            onPress={() => {
                              handleServiceSelect(service.id);
                            }}>
                            <View>
                              <Text style={styles.pickerOptionText}>{service.name}</Text>
                              {service.defaultPrice && (
                                <Text style={styles.pickerOptionSubtext}>
                                  {language === 'en'
                                    ? `Default: ৳${service.defaultPrice}`
                                    : language === 'bn'
                                      ? `ডিফল্ট: ৳${service.defaultPrice}`
                                      : language === 'es'
                                        ? `Predeterminado: ৳${service.defaultPrice}`
                                        : `डिफ़ॉल्ट: ৳${service.defaultPrice}`}
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
              </View>
            ) : (
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Special Haircut"
                  placeholderTextColor={colors.text.hint}
                  value={customServiceName}
                  onChangeText={setCustomServiceName}
                  autoCapitalize="words"
                />
              </View>
            )}
          </View>

          {/* Price & Tip */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {language === 'en'
                ? 'Amount'
                : language === 'bn'
                  ? 'পরিমাণ'
                  : language === 'es'
                    ? 'Monto'
                    : 'राशि'}
            </Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t.workEntries.price} <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.priceInputContainer}>
                <Text style={styles.currencySymbol}>৳</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0"
                  placeholderTextColor={colors.text.hint}
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                />
              </View>
            </View>

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
              <View style={styles.priceInputContainer}>
                <Text style={styles.currencySymbol}>৳</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0"
                  placeholderTextColor={colors.text.hint}
                  value={tip}
                  onChangeText={setTip}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Total Display */}
            {price !== '' && (
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>
                  {language === 'en'
                    ? 'Total Amount:'
                    : language === 'bn'
                      ? 'মোট পরিমাণ:'
                      : language === 'es'
                        ? 'Monto Total:'
                        : 'कुल राशि:'}
                </Text>
                <Text style={styles.totalValue}>
                  ৳{parseFloat(price || '0') + parseFloat(tip || '0')}
                </Text>
              </View>
            )}
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t.workEntries.paymentMethod} <Text style={styles.required}>*</Text>
            </Text>

            <View style={styles.paymentGrid}>
              {paymentMethods.map(method => (
                <TouchableOpacity
                  key={method.value}
                  style={[
                    styles.paymentButton,
                    paymentMethod === method.value && styles.paymentButtonActive,
                    {borderColor: method.color},
                    paymentMethod === method.value && {
                      backgroundColor: method.color + '20',
                    },
                  ]}
                  onPress={() => setPaymentMethod(method.value)}>
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
                      styles.paymentLabel,
                      paymentMethod === method.value && {color: method.color},
                    ]}>
                    {method.label}
                  </Text>
                  {paymentMethod === method.value && (
                    <View style={[styles.paymentCheck, {backgroundColor: method.color}]}>
                      <Text style={styles.paymentCheckText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {language === 'en'
                ? 'Notes (Optional)'
                : language === 'bn'
                  ? 'নোট (ঐচ্ছিক)'
                  : language === 'es'
                    ? 'Notas (Opcionales)'
                    : 'नोट्स (वैकल्पिक)'}
            </Text>

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={
                language === 'en'
                  ? 'Add any notes about this service...'
                  : language === 'bn'
                    ? 'এই সেবা সম্পর্কে কোন নোট যোগ করুন...'
                    : language === 'es'
                      ? 'Añada cualquier nota sobre este servicio...'
                      : 'इस सेवा के बारे में कोई भी नोट जोड़ें...'
              }
              placeholderTextColor={colors.text.hint}
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}>
            <Text style={styles.submitButtonText}>
              {loading
                ? language === 'en'
                  ? 'Adding Entry...'
                  : language === 'bn'
                    ? 'এন্ট্রি যোগ করা হচ্ছে...'
                    : language === 'es'
                      ? 'Añadiendo entrada...'
                      : 'प्रविष्टि जोड़ी जा रही है...'
                : t.dashboard.addWorkEntry}
            </Text>
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
    paymentMethodLogo: {
      width: 50,
      height: 28,
      marginBottom: 8,
    },
    paymentMethodIcon: {
      marginBottom: 8,
    },
    keyboardView: {
      flex: 1,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 100,
    },
    infoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? colors.background.paper : colors.primary[50],
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDarkMode ? colors.border.light : colors.primary[100],
    },
    infoText: {
      flex: 1,
      fontSize: 14,
      color: colors.text.primary,
      lineHeight: 20,
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
    textArea: {
      minHeight: 80,
      paddingTop: 14,
    },
    placeholderText: {
      color: colors.text.hint,
    },
    pickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.background.default,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    pickerButtonText: {
      fontSize: 16,
      color: colors.text.primary,
    },
    pickerArrow: {
      fontSize: 12,
      color: colors.text.hint,
    },
    pickerOptions: {
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
    pickerOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
      backgroundColor: colors.background.paper,
    },
    pickerOptionSelected: {
      backgroundColor: isDarkMode ? colors.neutral[100] : colors.primary[50],
    },
    pickerOptionText: {
      fontSize: 16,
      color: colors.text.primary,
      fontWeight: '500',
    },
    pickerOptionSubtext: {
      fontSize: 13,
      color: colors.text.secondary,
      marginTop: 2,
    },
    checkmark: {
      fontSize: 18,
      color: colors.primary[500],
      fontWeight: '700',
    },
    toggleContainer: {
      flexDirection: 'row',
      marginBottom: 16,
      backgroundColor: colors.background.default,
      borderRadius: 8,
      padding: 4,
    },
    toggleButton: {
      flex: 1,
      paddingVertical: 10,
      alignItems: 'center',
      borderRadius: 6,
    },
    toggleButtonActive: {
      backgroundColor: colors.background.paper,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 1},
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    toggleButtonText: {
      fontSize: 14,
      fontWeight: '500',
      color: colors.text.secondary,
    },
    toggleButtonTextActive: {
      color: colors.primary[500],
      fontWeight: '600',
    },
    priceInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.default,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border.light,
      paddingLeft: 16,
    },
    currencySymbol: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text.secondary,
      marginRight: 8,
    },
    priceInput: {
      flex: 1,
      paddingVertical: 14,
      paddingRight: 16,
      fontSize: 16,
      color: colors.text.primary,
    },
    totalContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: isDarkMode ? colors.background.paper : '#E8F5E9',
      borderRadius: 8,
      padding: 16,
      marginTop: 8,
      borderWidth: isDarkMode ? 1 : 0,
      borderColor: colors.border.light,
    },
    totalLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.success.main,
    },
    totalValue: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.success.main,
    },
    paymentGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 12,
    },
    paymentButton: {
      flex: 1,
      minWidth: '45%',
      aspectRatio: 1.5,
      backgroundColor: colors.background.paper,
      borderRadius: 12,
      borderWidth: 2,
      padding: 12,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    paymentButtonActive: {
      borderWidth: 2,
    },
    paymentIcon: {
      fontSize: 32,
      marginBottom: 8,
    },
    paymentLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.primary,
    },
    paymentCheck: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    paymentCheckText: {
      fontSize: 12,
      color: '#FFFFFF',
      fontWeight: '700',
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
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
    emptyState: {
      padding: 16,
      alignItems: 'center',
    },
    emptyStateText: {
      fontSize: 14,
      color: colors.text.primary,
      fontWeight: '500',
    },
    emptyStateSubtext: {
      fontSize: 12,
      color: colors.text.secondary,
      marginTop: 4,
    },
  });
