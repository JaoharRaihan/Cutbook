/**
 * Login Screen
 * Phone number and password authentication
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
import type {StackNavigationProp} from '@react-navigation/stack';
import {useAuth} from '@/context';
import type {AuthStackParamList} from '@/navigation/AuthNavigator';
import Theme from '@/constants/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

// ============================================================================
// LOGIN SCREEN COMPONENT
// ============================================================================

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const {login, loading} = useAuth();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({phone: '', password: ''});

  // Format phone number as user types
  const handlePhoneChange = (text: string) => {
    // Remove non-numeric characters
    const cleaned = text.replace(/\D/g, '');

    // Limit to 11 digits (Bangladesh format: 01XXXXXXXXX)
    const limited = cleaned.slice(0, 11);

    setPhone(limited);
    if (errors.phone) {
      setErrors(prev => ({...prev, phone: ''}));
    }
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors = {phone: '', password: ''};
    let isValid = true;

    // Phone validation
    const cleanPhone = phone.replace(/\D/g, '');
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

    // Password validation
    if (!password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle login
  const handleLogin = async () => {
    if (!validate()) {
      return;
    }

    try {
      // Trim password to remove accidental whitespace
      const trimmedPassword = password.trim();
      if (!trimmedPassword) {
        throw new Error('Password cannot be empty');
      }

      // Use phone as entered (frontend only shows entered phone)
      const cleanPhone = phone;

      console.log('🔍 LOGIN ATTEMPT:', {
        phoneInput: phone,
        passwordLength: trimmedPassword.length,
      });

      await login({phone: cleanPhone, password: trimmedPassword});
      // Navigation handled automatically by RootNavigator based on auth state
    } catch (error: any) {
      console.log('❌ Login Error:', error.message);
      Alert.alert('Login Failed', error.message || 'Invalid credentials');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Image style={styles.applogo} source={require('../../assets/loginlogo.png')} />
          <Text style={styles.tagline}>POS for Salon Management</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue</Text>

          {/* Phone Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.phoneInputWrapper}>
              <Text style={styles.countryCode}>+88</Text>
              <TextInput
                style={[styles.input, styles.phoneInput, errors.phone ? styles.inputError : null]}
                placeholder="01874XXXX26"
                value={phone}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={11}
                editable={!loading}
              />
            </View>
            {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
            <Text style={styles.hint}>Enter your 11-digit phone number</Text>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  errors.password ? styles.inputError : null,
                ]}
                placeholder="Enter your password"
                value={password}
                onChangeText={text => {
                  setPassword(text);
                  if (errors.password) {
                    setErrors(prev => ({...prev, password: ''}));
                  }
                }}
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

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading ? styles.loginButtonDisabled : null]}
            onPress={handleLogin}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={loading}>
              <Text style={styles.registerLink}>Register</Text>
            </TouchableOpacity>
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
    paddingBottom: 20,
    backgroundColor: '#fffffff',
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
    fontWeight: 'bold',
  },
  form: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
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
    marginBottom: 32,
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
  loginButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginTop: 8,
    ...Theme.shadows.md,
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 32,
  },
  footerText: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
  },
  registerLink: {
    fontSize: 14,
    fontWeight: '600',
    color: '#008000',
  },
});

export default LoginScreen;
