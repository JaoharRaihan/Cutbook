/**
 * Create Organization Screen
 * First-time owner setup - create new salon organization
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useOrg} from '@/context';
import Theme from '@/constants/theme';
import {CommissionMode} from '@/types';

// ============================================================================
// CREATE ORGANIZATION SCREEN
// ============================================================================

const CreateOrgScreen: React.FC = () => {
  const navigation = useNavigation();
  const {createOrg, loading} = useOrg();

  const [formData, setFormData] = useState({
    name: '',
    timezone: 'Asia/Dhaka',
    currency: 'BDT',
    defaultCommissionMode: CommissionMode.PERCENTAGE,
  });
  const [errors, setErrors] = useState({name: ''});

  // Update form field
  const updateField = (field: string, value: string | CommissionMode) => {
    setFormData(prev => ({...prev, [field]: value}));
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({...prev, [field]: ''}));
    }
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors = {name: ''};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = 'Organization name is required';
      isValid = false;
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle create organization
  const handleCreate = async () => {
    if (!validate()) {
      return;
    }

    try {
      await createOrg({
        name: formData.name.trim(),
        timezone: formData.timezone,
        currency: formData.currency,
        defaultCommissionMode: formData.defaultCommissionMode,
      });
      Alert.alert('Success', 'Organization created successfully!');
      // Navigation will be handled automatically by RootNavigator
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create organization');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>🏪</Text>
          <Text style={styles.title}>Create Your Salon</Text>
          <Text style={styles.subtitle}>Let's set up your salon organization</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Organization Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Salon Name *</Text>
            <TextInput
              style={[styles.input, errors.name ? styles.inputError : null]}
              placeholder="e.g., Elite Hair Salon"
              value={formData.name}
              onChangeText={text => updateField('name', text)}
              editable={!loading}
              autoCapitalize="words"
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            <Text style={styles.hint}>This will be visible to your employees</Text>
          </View>

          {/* Timezone */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Timezone</Text>
            <View style={styles.readonlyInput}>
              <Text style={styles.readonlyText}>🌍 Asia/Dhaka (GMT+6)</Text>
            </View>
            <Text style={styles.hint}>Bangladesh Standard Time</Text>
          </View>

          {/* Currency */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Currency</Text>
            <View style={styles.readonlyInput}>
              <Text style={styles.readonlyText}>৳ Bangladeshi Taka (BDT)</Text>
            </View>
            <Text style={styles.hint}>All amounts will be in BDT</Text>
          </View>

          {/* Commission Mode */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Default Commission Mode</Text>
            <Text style={styles.description}>
              Choose how employee commissions will be calculated by default
            </Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  formData.defaultCommissionMode === CommissionMode.PERCENTAGE
                    ? styles.radioButtonActive
                    : null,
                ]}
                onPress={() => updateField('defaultCommissionMode', CommissionMode.PERCENTAGE)}
                disabled={loading}>
                <View style={styles.radioCircle}>
                  {formData.defaultCommissionMode === CommissionMode.PERCENTAGE ? (
                    <View style={styles.radioCircleInner} />
                  ) : null}
                </View>
                <View style={styles.radioContent}>
                  <Text style={styles.radioTitle}>Percentage</Text>
                  <Text style={styles.radioDescription}>Employee gets a % of service price</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.radioButton,
                  formData.defaultCommissionMode === CommissionMode.FIXED
                    ? styles.radioButtonActive
                    : null,
                ]}
                onPress={() => updateField('defaultCommissionMode', CommissionMode.FIXED)}
                disabled={loading}>
                <View style={styles.radioCircle}>
                  {formData.defaultCommissionMode === CommissionMode.FIXED ? (
                    <View style={styles.radioCircleInner} />
                  ) : null}
                </View>
                <View style={styles.radioContent}>
                  <Text style={styles.radioTitle}>Fixed Amount</Text>
                  <Text style={styles.radioDescription}>
                    Employee gets fixed amount per service
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <Text style={styles.hint}>You can change this later in settings</Text>
          </View>

          {/* Create Button */}
          <TouchableOpacity
            style={[styles.createButton, loading ? styles.createButtonDisabled : null]}
            onPress={handleCreate}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.createButtonText}>Create Organization</Text>
            )}
          </TouchableOpacity>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>💡</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>What's Next?</Text>
              <Text style={styles.infoText}>After creating your organization, you can:</Text>
              <Text style={styles.infoText}>• Add services to your menu</Text>
              <Text style={styles.infoText}>• Invite employees to join</Text>
              <Text style={styles.infoText}>• Start tracking work entries</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  headerIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Theme.colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  },
  form: {
    paddingHorizontal: 24,
    paddingBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.text.primary,
    marginBottom: 8,
  },
  input: {
    fontSize: 16,
    color: Theme.colors.text.primary,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[300],
    borderRadius: Theme.borderRadius.md,
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: Theme.colors.error.main,
  },
  errorText: {
    fontSize: 12,
    color: Theme.colors.error.main,
    marginTop: 4,
  },
  hint: {
    fontSize: 12,
    color: Theme.colors.text.hint,
    marginTop: 4,
  },
  description: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
    marginBottom: 12,
  },
  readonlyInput: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[200],
    borderRadius: Theme.borderRadius.md,
    backgroundColor: Theme.colors.neutral[50],
  },
  readonlyText: {
    fontSize: 16,
    color: Theme.colors.text.primary,
  },
  radioGroup: {
    gap: 12,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderWidth: 2,
    borderColor: Theme.colors.neutral[300],
    borderRadius: Theme.borderRadius.md,
    backgroundColor: '#FFFFFF',
  },
  radioButtonActive: {
    borderColor: Theme.colors.primary[600],
    backgroundColor: Theme.colors.primary[50],
  },
  radioCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Theme.colors.neutral[400],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  radioCircleInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Theme.colors.primary[600],
  },
  radioContent: {
    flex: 1,
  },
  radioTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text.primary,
    marginBottom: 4,
  },
  radioDescription: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
  },
  createButton: {
    backgroundColor: Theme.colors.primary[600],
    paddingVertical: 16,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginTop: 8,
    ...Theme.shadows.md,
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoBox: {
    flexDirection: 'row',
    marginTop: 24,
    padding: 16,
    backgroundColor: Theme.colors.info.light,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.info.main,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.info.dark,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: Theme.colors.info.dark,
    marginBottom: 4,
  },
});

export default CreateOrgScreen;
