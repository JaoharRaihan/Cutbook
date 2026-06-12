/**
 * Register Screen
 * New user registration
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type {StackNavigationProp} from '@react-navigation/stack';
import {useAuth} from '@/context';
import type {AuthStackParamList} from '@/navigation/AuthNavigator';
import {UserRole} from '@/types';
import Theme from '@/constants/theme';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

// ============================================================================
// REGISTER SCREEN COMPONENT
// ============================================================================

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const {register, loading} = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: UserRole.OWNER,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Format phone number as user types
  const handlePhoneChange = (text: string) => {
    // Remove non-numeric characters
    const cleaned = text.replace(/\D/g, '');

    // Limit to 11 digits (Bangladesh format: 01XXXXXXXXX)
    const limited = cleaned.slice(0, 11);

    setFormData(prev => ({...prev, phone: limited}));
    if (errors.phone) {
      setErrors(prev => ({...prev, phone: ''}));
    }
  };

  // Update form field
  const updateField = (field: string, value: string) => {
    setFormData(prev => ({...prev, [field]: value}));
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({...prev, [field]: ''}));
    }
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors = {
      name: '',
      phone: '',
      email: '',
      password: '',
      confirmPassword: '',
    };
    let isValid = true;

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
      isValid = false;
    }

    // Phone validation
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone) {
      newErrors.phone = 'Phone number is required';
      isValid = false;
    } else if (cleanPhone.length !== 11) {
      newErrors.phone = 'Phone number must be 11 digits';
      isValid = false;
    } else if (!cleanPhone.startsWith('01')) {
      newErrors.phone = 'Phone number must start with 01';
      isValid = false;
    }

    // Email validation (optional but must be valid if provided)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle registration
  const handleRegister = async () => {
    if (!validate()) {
      return;
    }

    try {
      // Trim password to remove accidental whitespace
      const trimmedPassword = formData.password.trim();
      if (!trimmedPassword) {
        throw new Error('Password cannot be empty');
      }

      // Use phone as entered (frontend only shows entered phone)
      const cleanPhone = formData.phone;

      await register({
        name: formData.name.trim(),
        phone: cleanPhone,
        email: formData.email.trim() || undefined,
        password: formData.password.trim(),
        role: formData.role,
      });
      Alert.alert('Success', 'Registration successful! Please login.');
      navigation.navigate('Login');
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message || 'Could not create account');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Image style={styles.applogo} source={require('../../assets/loginlogo.png')} />
          <Text style={styles.tagline}>Professional Salon Management</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Start managing your salon</Text>

          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name *</Text>
            <TextInput
              style={[styles.input, errors.name ? styles.inputError : null]}
              placeholder="Enter your full name"
              value={formData.name}
              onChangeText={text => updateField('name', text)}
              editable={!loading}
              autoCapitalize="words"
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </View>

          {/* Phone Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number *</Text>
            <View style={styles.phoneInputWrapper}>
              <Text style={styles.countryCode}>+88</Text>
              <TextInput
                style={[styles.input, styles.phoneInput, errors.phone ? styles.inputError : null]}
                placeholder="01874XXXX26"
                value={formData.phone}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={11}
                editable={!loading}
              />
            </View>
            {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
          </View>

          {/* Email Input */}
          {/* <View style={styles.inputContainer}>
            <Text style={styles.label}>Email (Optional)</Text>
            <TextInput
              style={[styles.input, errors.email ? styles.inputError : null]}
              placeholder="your@email.com"
              value={formData.email}
              onChangeText={text => updateField('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View> */}

          {/* Role Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Account Type *</Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  formData.role === UserRole.OWNER ? styles.roleButtonActive : null,
                ]}
                onPress={() => setFormData(prev => ({...prev, role: UserRole.OWNER}))}
                disabled={loading}>
                <Text
                  style={[
                    styles.roleButtonText,
                    formData.role === UserRole.OWNER ? styles.roleButtonTextActive : null,
                  ]}>
                  Salon Owner
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  formData.role === UserRole.EMPLOYEE ? styles.roleButtonActive : null,
                ]}
                onPress={() => setFormData(prev => ({...prev, role: UserRole.EMPLOYEE}))}
                disabled={loading}>
                <Text
                  style={[
                    styles.roleButtonText,
                    formData.role === UserRole.EMPLOYEE ? styles.roleButtonTextActive : null,
                  ]}>
                  Employee
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.hint}>
              {formData.role === UserRole.OWNER
                ? 'Create and manage your salon'
                : 'Join an existing salon with invite code'}
            </Text>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password *</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  errors.password ? styles.inputError : null,
                ]}
                placeholder="At least 6 characters"
                value={formData.password}
                onChangeText={text => updateField('password', text)}
                secureTextEntry={!showPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                disabled={loading}>
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={24}
                  color="Gray"
                />
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password *</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  errors.confirmPassword ? styles.inputError : null,
                ]}
                placeholder="Re-enter your password"
                value={formData.confirmPassword}
                onChangeText={text => updateField('confirmPassword', text)}
                secureTextEntry={!showConfirmPassword}
                editable={!loading}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={loading}>
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={24}
                  color="Gray"
                />{' '}
              </TouchableOpacity>
            </View>
            {errors.confirmPassword ? (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            ) : null}
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.registerButton, loading ? styles.registerButtonDisabled : null]}
            onPress={handleRegister}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.registerButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={loading}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    paddingBottom: 30,
    backgroundColor: '#ffffff',
  },
  appName: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    letterSpacing: 1,
  },
  applogo: {
    width: 100,
    height: 100,
    paddingVertical: 40,
  },
  tagline: {
    fontSize: 14,
    color: '#000000',
    opacity: 0.9,
  },
  form: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 6,
    paddingBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Theme.colors.text.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Theme.colors.text.secondary,
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.text.primary,
    marginBottom: 8,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text.primary,
    paddingHorizontal: 12,
    paddingVertical: 16,
    backgroundColor: Theme.colors.neutral[100],
    borderTopLeftRadius: Theme.borderRadius.md,
    borderBottomLeftRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[300],
    borderRightWidth: 0,
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
  phoneInput: {
    flex: 1,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
  },
  passwordWrapper: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  eyeText: {
    fontSize: 20,
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
  roleContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 2,
    borderColor: Theme.colors.neutral[300],
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  roleButtonActive: {
    borderColor: '#ca5469',
    backgroundColor: '#ca5469',
  },
  roleButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.text.secondary,
  },
  roleButtonTextActive: {
    color: '#ffffff',
  },
  registerButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginTop: 8,
    ...Theme.shadows.md,
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  footerText: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#008000',
  },
});

export default RegisterScreen;
