/**
 * AddWorkEntryScreen.tsx (Employee Version)
 * Form for employees to add their own work entries or others' entries
 * Only accessible if they have the CAN_ADD_ENTRIES permission
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useOrg, useData, useAuth} from '@/context';
import {PaymentMethod, Service, EmployeePermission, User} from '@/types';

// ============================================================================
// COMPONENT
// ============================================================================

export default function AddWorkEntryScreen({navigation}: any): React.ReactElement {
  // Contexts
  const {orgServices, orgUsers} = useOrg();
  const {addWorkEntry, loading: dataLoading} = useData();
  const {user} = useAuth();

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
      return 'Select service';
    }
    return selectedServices
      .map(id => {
        const service = activeServices.find((s: Service) => s.id === id);
        return service ? service.name : '';
      })
      .filter(Boolean)
      .join(', ');
  };

  // Filter active employees (all employees in the org)
  const activeEmployees = orgUsers.filter(u => u.status === 'active');

  // Filter active services
  const activeServices = orgServices.filter(s => s.isActive);

  const loading = dataLoading;

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateForm = (): string | null => {
    if (!selectedEmployee) {
      return 'Please select an employee';
    }

    if (!useCustomService && selectedServices.length === 0) {
      return 'Please select at least one service or use custom service name';
    }

    if (useCustomService && !customServiceName.trim()) {
      return 'Please enter a service name';
    }

    if (!price || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
      return 'Please enter a valid price';
    }

    if (tip && (isNaN(parseFloat(tip)) || parseFloat(tip) < 0)) {
      return 'Please enter a valid tip amount';
    }

    return null;
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSubmit = async () => {
    if (!canAddEntries) {
      Alert.alert('Permission Denied', 'You do not have permission to add work entries.');
      return;
    }

    const error = validateForm();
    if (error) {
      Alert.alert('Validation Error', error);
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
        serviceName = selectedServicesData.map(s => s.name).join(', ');
        if (selectedServicesData.length === 1) {
          serviceId = selectedServicesData[0].id;
        }
      }

      // Create entry object and save to Firestore
      // The listeners will automatically update UI when entry is created
      await addWorkEntry({
        employeeId: selectedEmployee,
        serviceId,
        serviceName,
        price: parseFloat(price),
        tip: tip ? parseFloat(tip) : 0,
        paymentMethod,
        note: note.trim() || undefined,
      });

      Alert.alert('Success', 'Work entry added successfully! ✅', [
        {
          text: 'OK',
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (err: any) {
      console.error('Error adding work entry:', err);
      Alert.alert('Error', err.message || 'Failed to add work entry');
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

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
                Employee <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.picker}
                onPress={() => setShowEmployeePicker(!showEmployeePicker)}>
                <Text style={styles.pickerText}>
                  {selectedEmployee
                    ? activeEmployees.find(e => e.id === selectedEmployee)?.name ||
                      'Select employee'
                    : 'Select employee'}
                </Text>
              </TouchableOpacity>

              {showEmployeePicker && (
                <ScrollView
                  style={styles.pickerDropdown}
                  scrollEnabled
                  showsVerticalScrollIndicator>
                  {activeEmployees.map((employee: User) => (
                    <TouchableOpacity
                      key={employee.id}
                      style={styles.pickerOption}
                      onPress={() => {
                        setSelectedEmployee(employee.id);
                        setShowEmployeePicker(false);
                      }}>
                      <Text
                        style={[
                          styles.pickerOptionText,
                          selectedEmployee === employee.id && styles.pickerOptionTextActive,
                        ]}>
                        {employee.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
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
                    Select Service
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
                    Custom Service
                  </Text>
                </TouchableOpacity>
              </View>

              {!useCustomService ? (
                <>
                  <Text style={styles.label}>Service</Text>
                  <TouchableOpacity
                    style={styles.picker}
                    onPress={() => setShowServicePicker(!showServicePicker)}>
                    <Text style={styles.pickerText}>
                      {getSelectedServicesLabel()}
                    </Text>
                  </TouchableOpacity>

                  {showServicePicker && (
                    <ScrollView
                      style={styles.pickerDropdown}
                      scrollEnabled
                      showsVerticalScrollIndicator>
                      {activeServices.map((service: Service) => (
                        <TouchableOpacity
                          key={service.id}
                          style={styles.pickerOption}
                          onPress={() => handleServiceSelect(service.id)}>
                          <View style={styles.pickerOptionContent}>
                            <Text
                              style={[
                                styles.pickerOptionText,
                                selectedServices.includes(service.id) && styles.pickerOptionTextActive,
                              ]}>
                              {service.name} {selectedServices.includes(service.id) ? '✓' : ''}
                            </Text>
                            {service.defaultPrice && (
                              <Text
                                style={[
                                  styles.pickerOptionPrice,
                                  selectedServices.includes(service.id) && styles.pickerOptionPriceActive,
                                ]}>
                                ৳{service.defaultPrice}
                              </Text>
                            )}
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </>
              ) : (
                <>
                  <Text style={styles.label}>Service Name</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter service name"
                    placeholderTextColor="#999"
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
                Price <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.currencyInputContainer}>
                <Text style={styles.currencySymbol}>৳</Text>
                <TextInput
                  style={styles.currencyInput}
                  placeholder="0"
                  placeholderTextColor="#999"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Tip Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tip (Optional)</Text>
              <View style={styles.currencyInputContainer}>
                <Text style={styles.currencySymbol}>৳</Text>
                <TextInput
                  style={styles.currencyInput}
                  placeholder="0"
                  placeholderTextColor="#999"
                  value={tip}
                  onChangeText={setTip}
                  keyboardType="decimal-pad"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Payment Method */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Payment Method</Text>
              <View style={styles.methodGrid}>
                {Object.values(PaymentMethod).map(method => (
                  <TouchableOpacity
                    key={method}
                    style={[
                      styles.methodButton,
                      paymentMethod === method && styles.methodButtonActive,
                    ]}
                    onPress={() => setPaymentMethod(method)}
                    disabled={loading}>
                    <Text
                      style={[
                        styles.methodButtonText,
                        paymentMethod === method && styles.methodButtonTextActive,
                      ]}>
                      {method.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Note Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Note (Optional)</Text>
              <TextInput
                style={[styles.input, styles.noteInput]}
                placeholder="Add any notes about this service"
                placeholderTextColor="#999"
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
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={styles.infoText}>
              This entry will be recorded for the selected employee and visible to your manager. You
              can add entries for yourself or other employees.
            </Text>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}>
            <Text style={styles.submitButtonText}>Add Entry</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  required: {
    color: '#F44336',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#212121',
    borderWidth: 1,
    borderColor: '#E0E0E0',
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
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  toggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#757575',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  picker: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pickerText: {
    fontSize: 16,
    color: '#212121',
  },
  pickerDropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginTop: 8,
    maxHeight: 300,
    zIndex: 1000,
    elevation: 8,
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  pickerOptionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#212121',
    flex: 1,
  },
  pickerOptionTextActive: {
    fontWeight: '700',
    color: '#2196F3',
  },
  pickerOptionPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginLeft: 8,
  },
  pickerOptionPriceActive: {
    color: '#2196F3',
  },
  currencyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2196F3',
    marginRight: 8,
  },
  currencyInput: {
    flex: 1,
    paddingHorizontal: 0,
    paddingVertical: 14,
    fontSize: 16,
    color: '#212121',
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
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  methodButtonActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  methodButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#757575',
  },
  methodButtonTextActive: {
    color: '#2196F3',
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
