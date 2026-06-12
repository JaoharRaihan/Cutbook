/**
 * AddServiceScreen.tsx
 * Form to add a new service to the organization
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
import {useOrg} from '@/context';
import {Service, ServiceCategory} from '@/types';

// Stub type for omitted properties
type ServiceInput = Omit<Service, 'id' | 'createdAt' | 'updatedAt'>;

// ============================================================================
// COMPONENT
// ============================================================================

export default function AddServiceScreen({navigation}: any): React.ReactElement {
  const {addService, currentOrg} = useOrg();
  const [serviceName, setServiceName] = useState('');
  const [category, setCategory] = useState<ServiceCategory>(ServiceCategory.HAIRCUT);
  const [defaultPrice, setDefaultPrice] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
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

  const handleSubmit = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert('Validation Error', error);
      return;
    }

    if (!currentOrg) {
      Alert.alert('Error', 'Organization not found. Please try again.');
      return;
    }

    setLoading(true);

    try {
      const serviceData: ServiceInput = {
        orgId: currentOrg.id,
        name: serviceName.trim(),
        category,
        defaultPrice: defaultPrice ? parseFloat(defaultPrice) : 0,
        isActive: true,
      };

      // Only add optional fields if they have values (avoid undefined)
      if (description.trim()) {
        serviceData.description = description.trim();
      }
      if (duration.trim()) {
        serviceData.duration = parseInt(duration);
      }

      await addService(serviceData);

      Alert.alert('Success', `${serviceName} has been added!`, [
        {
          text: 'Add Another',
          onPress: () => resetForm(),
        },
        {
          text: 'Done',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (err: any) {
      console.error('Error adding service:', err);
      Alert.alert('Error', err.message || 'Failed to add service. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (cat: ServiceCategory): string => {
    const found = categories.find(c => c.value === cat);
    return found ? found.icon : '💈';
  };

  const resetForm = () => {
    setServiceName('');
    setCategory(ServiceCategory.HAIRCUT);
    setDefaultPrice('');
    setDescription('');
    setDuration('');
  };

  const getCategoryLabel = (cat: ServiceCategory): string => {
    const found = categories.find(c => c.value === cat);
    return found ? found.label : cat;
  };

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
            {/* <View style={styles.inputGroup}>
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
            </View> */}

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
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}>
            <Text style={styles.submitButtonText}>
              {loading ? 'Adding Service...' : 'Add Service'}
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
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  submitButton: {
    backgroundColor: '#000000',
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
