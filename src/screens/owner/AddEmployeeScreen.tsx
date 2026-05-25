/**
 * AddEmployeeScreen.tsx
 * Register and add a new employee with phone number and password
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
  ActivityIndicator,
} from 'react-native';
import {useOrg} from '@/context';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {UserRole, UserStatus} from '@/types';

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Convert phone number to valid Firebase email format
 */
const phoneToFirebaseEmail = (phone: string): string => {
  const digitsOnly = phone.replace(/\D/g, '');
  return `auth_${digitsOnly}@cutbook.app`;
};

// ============================================================================
// COMPONENT
// ============================================================================

export default function AddEmployeeScreen({navigation}: any): React.ReactElement {
  const {currentOrg} = useOrg();
  const [employeeName, setEmployeeName] = useState('');
  const [employeePhone, setEmployeePhone] = useState('');
  const [employeePassword, setEmployeePassword] = useState('');
  const [commissionPercentage, setCommissionPercentage] = useState('30');
  const [loading, setLoading] = useState(false);

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateForm = (): string | null => {
    if (!employeeName.trim()) {
      return 'Please enter employee name';
    }

    if (!employeePhone.trim()) {
      return 'Please enter phone number';
    }

    if (employeePhone.replace(/\D/g, '').length < 10) {
      return 'Please enter a valid phone number';
    }

    if (!employeePassword.trim()) {
      return 'Please enter a password';
    }

    if (employeePassword.length < 6) {
      return 'Password must be at least 6 characters';
    }

    const commission = parseFloat(commissionPercentage);
    if (isNaN(commission) || commission < 0 || commission > 100) {
      return 'Commission must be between 0 and 100';
    }

    return null;
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRegisterEmployee = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert('Validation Error', error);
      return;
    }

    if (!currentOrg) {
      Alert.alert('Error', 'Organization not found');
      return;
    }

    setLoading(true);

    try {
      const email = phoneToFirebaseEmail(employeePhone);
      const password = employeePassword.trim();
      const commission = parseFloat(commissionPercentage);

      // Step 1: Create Firebase Auth account
      const userCredential = await auth().createUserWithEmailAndPassword(email, password);
      const uid = userCredential.user.uid;

      // Step 2: Create user document in Firestore
      const userData = {
        id: uid,
        orgId: currentOrg.id,
        name: employeeName.trim(),
        phone: employeePhone.trim(),
        email: email,
        role: UserRole.EMPLOYEE,
        status: UserStatus.ACTIVE,
        commissionPercentage: commission,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await firestore().collection('users').doc(uid).set(userData);

      Alert.alert(
        'Employee Registered Successfully! ✅',
        `Employee: ${employeeName}\nPhone: ${employeePhone}\nPassword: ${password}\n\nThey can now log in with these credentials.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (err: any) {
      console.error('Error registering employee:', err);

      let errorMessage = 'Failed to register employee';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This phone number is already registered. Use a different phone number.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Use at least 6 characters.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid phone number format.';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.sectionTitle}>Employee Information</Text>

            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Full Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter employee name"
                placeholderTextColor="#999"
                value={employeeName}
                onChangeText={setEmployeeName}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {/* Phone Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Phone Number <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="+880 1XXX-XXXXXX"
                placeholderTextColor="#999"
                value={employeePhone}
                onChangeText={setEmployeePhone}
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Password <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter a secure password (min. 6 characters)"
                placeholderTextColor="#999"
                value={employeePassword}
                onChangeText={setEmployeePassword}
                secureTextEntry={true}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {/* Commission Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Commission Percentage <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.percentageInputContainer}>
                <TextInput
                  style={styles.percentageInput}
                  placeholder="30"
                  placeholderTextColor="#999"
                  value={commissionPercentage}
                  onChangeText={setCommissionPercentage}
                  keyboardType="numeric"
                  editable={!loading}
                />
                <Text style={styles.percentageSymbol}>%</Text>
              </View>
              <Text style={styles.hint}>Default commission percentage for this employee</Text>
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={styles.infoText}>
              The employee can use their phone number and password to log in to the app after
              registration.
            </Text>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleRegisterEmployee}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Register Employee</Text>
            )}
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
  percentageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingRight: 16,
  },
  percentageInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#212121',
  },
  percentageSymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#757575',
  },
  hint: {
    fontSize: 12,
    color: '#757575',
    marginTop: 6,
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
