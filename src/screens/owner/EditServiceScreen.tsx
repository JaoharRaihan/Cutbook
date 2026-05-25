/**
 * EditServiceScreen.tsx
 * Form to edit or delete an existing service
 */

import React, {useState, useEffect} from 'react';
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
  Switch,
  ActivityIndicator,
} from 'react-native';
import {useOrg} from '@/context';
import {Service, ServiceCategory} from '@/types';
import {formatDateISO} from '@/utils';

// ============================================================================
// COMPONENT
// ============================================================================

export default function EditServiceScreen({route, navigation}: any): React.ReactElement {
  const {serviceId} = route.params;
  const {orgServices, updateService, deleteService} = useOrg();
  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<Service | null>(null);
  const [serviceName, setServiceName] = useState('');
  const [category, setCategory] = useState<ServiceCategory>(ServiceCategory.HAIRCUT);
  const [defaultPrice, setDefaultPrice] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const categories = [
    {value: ServiceCategory.HAIRCUT, label: 'Haircut', icon: '✂️'},
    {value: ServiceCategory.SHAVE, label: 'Shave', icon: '🪒'},
    {value: ServiceCategory.BEARD, label: 'Beard', icon: '🧔'},
    {value: ServiceCategory.COLOR, label: 'Color', icon: '🎨'},
    {value: ServiceCategory.FACIAL, label: 'Facial', icon: '💆'},
    {value: ServiceCategory.MASSAGE, label: 'Massage', icon: '💆‍♂️'},
    {value: ServiceCategory.SPA, label: 'Spa', icon: '🛁'},
    {value: ServiceCategory.OTHER, label: 'Other', icon: '✨'},
  ];

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    // Find service from orgServices
    const foundService = orgServices.find(s => s.id === serviceId);
    if (foundService) {
      setService(foundService);
      setServiceName(foundService.name);
      setCategory(foundService.category);
      setDefaultPrice(foundService.defaultPrice ? foundService.defaultPrice.toString() : '');
      setDescription(foundService.description || '');
      setDuration(foundService.duration ? foundService.duration.toString() : '');
      setIsActive(foundService.isActive);
    }
    setLoading(false);
  }, [serviceId, orgServices]);

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateForm = (): string | null => {
    if (!serviceName.trim()) {
      return 'Please enter service name';
    }

    if (defaultPrice && isNaN(parseFloat(defaultPrice))) {
      return 'Please enter a valid price';
    }

    if (duration && isNaN(parseInt(duration))) {
      return 'Please enter a valid duration';
    }

    return null;
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleUpdate = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert('Validation Error', error);
      return;
    }

    if (!service) {
      Alert.alert('Error', 'Service not found');
      return;
    }

    setLoading(true);

    try {
      await updateService(serviceId, {
        name: serviceName.trim(),
        category,
        defaultPrice: defaultPrice ? parseFloat(defaultPrice) : 0,
        description: description.trim() || undefined,
        duration: duration ? parseInt(duration) : undefined,
        isActive,
      });

      Alert.alert('Success', `${serviceName} has been updated!`, [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err: any) {
      console.error('Error updating service:', err);
      Alert.alert('Error', err.message || 'Failed to update service');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Service',
      `Are you sure you want to delete ${serviceName}? This action cannot be undone.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ],
    );
  };

  const confirmDelete = () => {
    Alert.alert(
      'Final Confirmation',
      'This will permanently delete this service and may affect existing work entries. Continue?',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Yes, Delete',
          style: 'destructive',
          onPress: executeDelete,
        },
      ],
    );
  };

  const executeDelete = async () => {
    setLoading(true);

    try {
      await deleteService(serviceId);

      Alert.alert('Deleted', `${serviceName} has been deleted.`, [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err: any) {
      console.error('Error deleting service:', err);
      Alert.alert('Error', err.message || 'Failed to delete service');
      setLoading(false);
    }
  };

  const handleToggleActive = (value: boolean) => {
    if (!value) {
      Alert.alert(
        'Deactivate Service',
        'Deactivating this service will hide it from the service list. Continue?',
        [
          {text: 'Cancel', style: 'cancel'},
          {
            text: 'Deactivate',
            onPress: () => setIsActive(false),
          },
        ],
      );
    } else {
      setIsActive(true);
    }
  };

  const getCategoryIcon = (cat: ServiceCategory): string => {
    const found = categories.find(c => c.value === cat);
    return found ? found.icon : '💈';
  };

  const getCategoryLabel = (cat: ServiceCategory): string => {
    const found = categories.find(c => c.value === cat);
    return found ? found.label : cat;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading || !service) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading service...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
          {/* Status Section */}
          <View style={styles.section}>
            <View style={styles.statusHeader}>
              <View>
                <Text style={styles.statusLabel}>Service Status</Text>
                <Text style={styles.statusSubtext}>
                  {isActive ? 'Active in service list' : 'Hidden from list'}
                </Text>
              </View>
              <Switch
                value={isActive}
                onValueChange={handleToggleActive}
                trackColor={{false: '#D32F2F', true: '#4CAF50'}}
                thumbColor="#FFFFFF"
                ios_backgroundColor="#D32F2F"
              />
            </View>
          </View>

          {/* Form Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Service Information</Text>

            {/* Service Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Service Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Regular Haircut"
                placeholderTextColor="#999"
                value={serviceName}
                onChangeText={setServiceName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Category <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowCategoryPicker(!showCategoryPicker)}>
                <Text style={styles.pickerButtonText}>
                  {getCategoryIcon(category)} {getCategoryLabel(category)}
                </Text>
                <Text style={styles.pickerArrow}>{showCategoryPicker ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {showCategoryPicker && (
                <View style={styles.pickerOptions}>
                  {categories.map(cat => (
                    <TouchableOpacity
                      key={cat.value}
                      style={[
                        styles.pickerOption,
                        category === cat.value && styles.pickerOptionSelected,
                      ]}
                      onPress={() => {
                        setCategory(cat.value);
                        setShowCategoryPicker(false);
                      }}>
                      <Text style={styles.pickerOptionText}>
                        {cat.icon} {cat.label}
                      </Text>
                      {category === cat.value && <Text style={styles.checkmark}>✓</Text>}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Default Price */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Default Price (Optional)</Text>
              <View style={styles.priceInputContainer}>
                <Text style={styles.currencySymbol}>৳</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0"
                  placeholderTextColor="#999"
                  value={defaultPrice}
                  onChangeText={setDefaultPrice}
                  keyboardType="numeric"
                />
              </View>
              <Text style={styles.hint}>Leave empty if price varies per session</Text>
            </View>

            {/* Duration */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Duration (Optional)</Text>
              <View style={styles.durationInputContainer}>
                <TextInput
                  style={styles.durationInput}
                  placeholder="30"
                  placeholderTextColor="#999"
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="numeric"
                />
                <Text style={styles.durationUnit}>minutes</Text>
              </View>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Brief description of the service..."
                placeholderTextColor="#999"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Metadata */}
            <View style={styles.metadata}>
              <Text style={styles.metadataText}>
                Last updated: {service.updatedAt ? formatDateISO(service.updatedAt) : 'N/A'}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Actions</Text>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>🗑️ Delete Service</Text>
            </TouchableOpacity>

            <Text style={styles.deleteWarning}>
              ⚠️ Deleting a service may affect existing work entries
            </Text>
          </View>
        </ScrollView>

        {/* Update Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.updateButton, loading && styles.updateButtonDisabled]}
            onPress={handleUpdate}
            disabled={loading}>
            <Text style={styles.updateButtonText}>
              {loading ? 'Updating...' : '✓ Update Service'}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#757575',
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
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  statusSubtext: {
    fontSize: 13,
    color: '#757575',
    marginTop: 4,
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
    minHeight: 100,
    paddingTop: 14,
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
    color: '#212121',
  },
  pickerArrow: {
    fontSize: 12,
    color: '#757575',
  },
  pickerOptions: {
    marginTop: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  pickerOptionSelected: {
    backgroundColor: '#E3F2FD',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#212121',
  },
  checkmark: {
    fontSize: 18,
    color: '#2196F3',
    fontWeight: '700',
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
  durationInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingRight: 16,
  },
  durationInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#212121',
  },
  durationUnit: {
    fontSize: 16,
    color: '#757575',
  },
  hint: {
    fontSize: 12,
    color: '#757575',
    marginTop: 6,
  },
  metadata: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  metadataText: {
    fontSize: 13,
    color: '#757575',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  deleteButtonText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteWarning: {
    fontSize: 12,
    color: '#F57C00',
    marginTop: 12,
    textAlign: 'center',
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  updateButton: {
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
  updateButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  updateButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});
