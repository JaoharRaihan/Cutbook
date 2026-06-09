/**
 * AddWorkEntryScreen.tsx
 * Form to add a new work entry
 */

import React, {useState} from 'react';
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
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useOrg, useData, useAuth} from '@/context';
import {WorkEntry, PaymentMethod, Service, User} from '@/types';
import MaterialIcons from '@react-native-vector-icons/material-icons';

// ============================================================================
// COMPONENT
// ============================================================================

export default function AddWorkEntryScreen({navigation}: any): React.ReactElement {
  // Contexts
  const {orgUsers, orgServices, currentOrg, loading: orgLoading} = useOrg();
  const {addWorkEntry, loading: dataLoading} = useData();
  const {user} = useAuth();

  // Form state
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('');
  const [customServiceName, setCustomServiceName] = useState('');
  const [price, setPrice] = useState('');
  const [tip, setTip] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [note, setNote] = useState('');
  const [showEmployeePicker, setShowEmployeePicker] = useState(false);
  const [showServicePicker, setShowServicePicker] = useState(false);
  const [useCustomService, setUseCustomService] = useState(false);

  // Filter active employees and services
  const activeEmployees = orgUsers.filter(u => u.role === 'employee' && u.status === 'active');
  const activeServices = orgServices.filter(s => s.isActive);

  const loading = orgLoading || dataLoading;

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateForm = (): string | null => {
    if (!selectedEmployee) {
      return 'Please select an employee';
    }

    if (!useCustomService && !selectedService) {
      return 'Please select a service or use custom service name';
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
        const service = activeServices.find((s: Service) => s.id === selectedService);
        serviceName = service?.name || '';
        serviceId = service?.id;
      }

      // Get employee info
      const employee = activeEmployees.find((e: User) => e.id === selectedEmployee);
      if (!employee) {
        Alert.alert('Error', 'Selected employee not found');
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
        'Success',
        `Work entry for ${employee.name} has been added!\nTotal: ৳${totalAmount}`,
        [
          {
            text: 'Add Another',
            onPress: () => resetForm(),
          },
          {
            text: 'Done',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (err: any) {
      console.error('Error adding work entry:', err);
      Alert.alert('Error', err.message || 'Failed to add work entry. Please try again.');
    }
  };

  const resetForm = () => {
    setSelectedEmployee('');
    setSelectedService('');
    setCustomServiceName('');
    setPrice('');
    setTip('');
    setNote('');
    setUseCustomService(false);
  };

  const handleServiceSelect = (serviceId: string) => {
    setSelectedService(serviceId);
    setShowServicePicker(false);

    // Auto-fill price from service default
    const service = activeServices.find((s: Service) => s.id === serviceId);
    if (service?.defaultPrice) {
      setPrice(service.defaultPrice.toString());
    }
  };

  const getEmployeeName = (id: string): string => {
    const employee = activeEmployees.find((e: User) => e.id === id);
    return employee ? employee.name : 'Select Employee';
  };

  const getServiceName = (id: string): string => {
    const service = activeServices.find((s: Service) => s.id === id);
    return service ? service.name : 'Select Service';
  };

  const paymentMethods = [
    {value: PaymentMethod.CASH, label: 'Cash', icon: '💵', color: '#4CAF50'},
    {value: PaymentMethod.BKASH, label: 'bKash', icon: '📱', color: '#E91E63'},
    {value: PaymentMethod.CARD, label: 'Card', icon: '💳', color: '#2196F3'},
    {value: PaymentMethod.NAGAD, label: 'Nagad', icon: '📱', color: '#FF9800'},
  ];

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

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
              Select employee, service, amount, and payment method, then tap{''}
              <Text style={{fontWeight: '600', color: '#2E7D32', fontSize: 14}}>
                {' '}
                Add Work Entry Button
              </Text>{' '}
            </Text>
          </View>

          {/* Employee Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Employee</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Select Employee <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowEmployeePicker(!showEmployeePicker)}>
                <Text
                  style={[styles.pickerButtonText, !selectedEmployee && styles.placeholderText]}>
                  {selectedEmployee ? getEmployeeName(selectedEmployee) : 'Select Employee'}
                </Text>
                <Text style={styles.pickerArrow}>{showEmployeePicker ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {showEmployeePicker && (
                <View style={styles.pickerOptions}>
                  {activeEmployees.length === 0 ? (
                    <View style={styles.emptyState}>
                      <Text style={styles.emptyStateText}>No active employees found</Text>
                      <Text style={styles.emptyStateSubtext}>Add employees from Settings</Text>
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
                        }}>
                        <View>
                          <Text style={styles.pickerOptionText}>{employee.name}</Text>
                          <Text style={styles.pickerOptionSubtext}>
                            Commission: {employee.commissionPercentage}%
                          </Text>
                        </View>
                        {selectedEmployee === employee.id && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </TouchableOpacity>
                    ))
                  )}
                </View>
              )}
            </View>
          </View>

          {/* Service Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service</Text>

            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[styles.toggleButton, !useCustomService && styles.toggleButtonActive]}
                onPress={() => setUseCustomService(false)}>
                <Text
                  style={[
                    styles.toggleButtonText,
                    !useCustomService && styles.toggleButtonTextActive,
                  ]}>
                  Select Service
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
                  Custom Service
                </Text>
              </TouchableOpacity>
            </View>

            {!useCustomService ? (
              <View style={styles.inputGroup}>
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowServicePicker(!showServicePicker)}>
                  <Text
                    style={[styles.pickerButtonText, !selectedService && styles.placeholderText]}>
                    {selectedService ? getServiceName(selectedService) : 'Select Service'}
                  </Text>
                  <Text style={styles.pickerArrow}>{showServicePicker ? '▲' : '▼'}</Text>
                </TouchableOpacity>

                {showServicePicker && (
                  <View style={styles.pickerOptions}>
                    {activeServices.length === 0 ? (
                      <View style={styles.pickerOption}>
                        <Text style={styles.pickerOptionText}>No active services found</Text>
                        <Text style={styles.pickerOptionSubtext}>Add services from Settings</Text>
                      </View>
                    ) : (
                      activeServices.map((service: Service) => (
                        <TouchableOpacity
                          key={service.id}
                          style={[
                            styles.pickerOption,
                            selectedService === service.id && styles.pickerOptionSelected,
                          ]}
                          onPress={() => handleServiceSelect(service.id)}>
                          <View>
                            <Text style={styles.pickerOptionText}>{service.name}</Text>
                            {service.defaultPrice && (
                              <Text style={styles.pickerOptionSubtext}>
                                Default: ৳{service.defaultPrice}
                              </Text>
                            )}
                          </View>
                          {selectedService === service.id && (
                            <Text style={styles.checkmark}>✓</Text>
                          )}
                        </TouchableOpacity>
                      ))
                    )}
                  </View>
                )}
              </View>
            ) : (
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Special Haircut"
                  placeholderTextColor="#999"
                  value={customServiceName}
                  onChangeText={setCustomServiceName}
                  autoCapitalize="words"
                />
              </View>
            )}
          </View>

          {/* Price & Tip */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amount</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Price <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.priceInputContainer}>
                <Text style={styles.currencySymbol}>৳</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0"
                  placeholderTextColor="#999"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Tip (Optional)</Text>
              <View style={styles.priceInputContainer}>
                <Text style={styles.currencySymbol}>৳</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0"
                  placeholderTextColor="#999"
                  value={tip}
                  onChangeText={setTip}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Total Display */}
            {price && (
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalValue}>
                  ৳{parseFloat(price || '0') + parseFloat(tip || '0')}
                </Text>
              </View>
            )}
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Payment Method <Text style={styles.required}>*</Text>
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
                  <Text style={styles.paymentIcon}>{method.icon}</Text>
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
            <Text style={styles.sectionTitle}>Notes (Optional)</Text>

            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Add any notes about this service..."
              placeholderTextColor="#999"
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
              {loading ? 'Adding Entry...' : '✓ Add Work Entry'}
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
    paddingBottom: 100,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#d2f1d2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
    color: '#cb2323',
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#008000',
    lineHeight: 20,
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
  textArea: {
    minHeight: 80,
    paddingTop: 14,
  },
  placeholderText: {
    color: '#008000',
  },
  pickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#000000',
  },
  pickerArrow: {
    fontSize: 12,
    color: '#f50c20',
  },
  pickerOptions: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
    maxHeight: 250,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  pickerOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#060606',
    fontWeight: '500',
  },
  pickerOptionSubtext: {
    fontSize: 13,
    color: '#008000',
    marginTop: 2,
  },
  checkmark: {
    fontSize: 18,
    color: '#2510b2',
    fontWeight: '700',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    backgroundColor: '#F5F5F5',
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
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  toggleButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
  },
  toggleButtonTextActive: {
    color: '#008000',
    fontWeight: '600',
  },
  priceInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingLeft: 16,
  },
  currencySymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#757575',
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    paddingVertical: 14,
    paddingRight: 16,
    fontSize: 16,
    color: '#212121',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E7D32',
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
    backgroundColor: '#F5F5F5',
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
    color: '#212121',
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
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
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
  emptyState: {
    padding: 16,
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  emptyStateSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});
