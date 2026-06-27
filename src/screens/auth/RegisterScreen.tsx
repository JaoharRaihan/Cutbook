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
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import type {StackNavigationProp} from '@react-navigation/stack';
import {useAuth, useTheme, useLanguage, getPhoneFormats, normalizePhone} from '@/context';
import type {AuthStackParamList} from '@/navigation/AuthNavigator';
import {UserRole} from '@/types';
import firestore from '@react-native-firebase/firestore';
import {useThemedStyles} from '@/hooks/useThemedStyles';
import {ThemeColors} from '@/constants/theme';

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

// ============================================================================
// REGISTER SCREEN COMPONENT
// ============================================================================

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const {loading, sendPhoneOTP} = useAuth();
  const {colors} = useTheme();
  const {language, t} = useLanguage();
  const [localLoading, setLocalLoading] = useState(false);
  const isSubmitDisabled = loading || localLoading;

  const styles = useThemedStyles(getStyles);

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
    const cleaned = text.replace(/\D/g, '');
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
      newErrors.name = t.validation.required;
      isValid = false;
    } else if (formData.name.trim().length < 2) {
      newErrors.name =
        language === 'en'
          ? 'Name must be at least 2 characters'
          : language === 'bn'
            ? 'নাম অবশ্যই কমপক্ষে ২ অক্ষরের হতে হবে'
            : language === 'es'
              ? 'El nombre debe tener al menos 2 caracteres'
              : 'नाम कम से कम 2 अक्षरों का होना चाहिए';
      isValid = false;
    }

    // Phone validation
    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone) {
      newErrors.phone = t.validation.required;
      isValid = false;
    } else if (cleanPhone.length !== 11) {
      newErrors.phone =
        language === 'en'
          ? 'Phone number must be 11 digits'
          : language === 'bn'
            ? 'ফোন নম্বর অবশ্যই ১১ সংখ্যার হতে হবে'
            : language === 'es'
              ? 'El número de teléfono debe tener 11 dígitos'
              : 'फ़ोन नंबर 11 अंकों का होना चाहिए';
      isValid = false;
    } else if (!cleanPhone.startsWith('01')) {
      newErrors.phone =
        language === 'en'
          ? 'Phone number must start with 01'
          : language === 'bn'
            ? 'ফোন নম্বর অবশ্যই ০১ দিয়ে শুরু হতে হবে'
            : language === 'es'
              ? 'El número de teléfono debe comenzar con 01'
              : 'फ़ोन नंबर 01 से शुरू होना चाहिए';
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = t.validation.required;
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password =
        language === 'en'
          ? 'Password must be at least 6 characters'
          : language === 'bn'
            ? 'পাসওয়ার্ড অবশ্যই কমপক্ষে ৬ অক্ষরের হতে হবে'
            : language === 'es'
              ? 'La contraseña debe tener al menos 6 caracteres'
              : 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए';
      isValid = false;
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword =
        language === 'en'
          ? 'Please confirm your password'
          : language === 'bn'
            ? 'পাসওয়ার্ড নিশ্চিত করুন'
            : language === 'es'
              ? 'Confirme su contraseña'
              : 'अपने पासवर्ड की पुष्टि करें';
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword =
        language === 'en'
          ? 'Passwords do not match'
          : language === 'bn'
            ? 'পাসওয়ার্ড মেলেনি'
            : language === 'es'
              ? 'Las contraseñas no coinciden'
              : 'पासवर्ड मेल नहीं खाते';
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

    setLocalLoading(true);
    try {
      const trimmedPassword = formData.password.trim();
      if (!trimmedPassword) {
        throw new Error('Password cannot be empty');
      }

      // Check if phone number is already registered in Firestore (handling format variants)
      const phoneCheckSnap = await firestore()
        .collection('users')
        .where('phone', 'in', getPhoneFormats(formData.phone))
        .get();
      if (!phoneCheckSnap.empty) {
        throw new Error(
          language === 'en'
            ? 'Phone number already registered'
            : language === 'bn'
              ? 'ফোন নম্বর ইতিমধ্যে নিবন্ধিত'
              : language === 'es'
                ? 'El número de teléfono ya está registrado'
                : 'फ़ोन नंबर पहले से पंजीकृत है',
        );
      }

      // Send OTP
      const normalizedPhone = normalizePhone(formData.phone);
      await sendPhoneOTP(normalizedPhone);

      // Navigate to OTP verification screen
      navigation.navigate('OTPVerification', {
        phone: normalizedPhone,
        flow: 'register',
        registrationData: {
          name: formData.name.trim(),
          phone: normalizedPhone,
          email: formData.email.trim() || undefined,
          password: trimmedPassword,
          role: formData.role,
        },
      });
    } catch (error: any) {
      Alert.alert(
        language === 'en'
          ? 'Registration Failed'
          : language === 'bn'
            ? 'নিবন্ধন ব্যর্থ হয়েছে'
            : language === 'es'
              ? 'Registro Fallido'
              : 'पंजीकरण विफल',
        error.message || 'Could not create account',
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Image style={styles.applogo} source={require('../../assets/CutBook_logo.png')} />
          <Text style={styles.tagline}>
            {language === 'en'
              ? 'Professional Salon Management'
              : language === 'bn'
                ? 'পেশাদার সেলুন ম্যানেজমেন্ট'
                : language === 'es'
                  ? 'Gestión Profesional de Salones'
                  : 'पेशेवर सैलून प्रबंधन'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.title}>{t.auth.register}</Text>
          <Text style={styles.subtitle}>
            {language === 'en'
              ? 'Start managing your salon'
              : language === 'bn'
                ? 'আপনার সেলুন পরিচালনা শুরু করুন'
                : language === 'es'
                  ? 'Comience a administrar su salón'
                  : 'अपना सैलून प्रबंधित करना शुरू करें'}
          </Text>

          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t.auth.name} *</Text>
            <TextInput
              style={[styles.input, errors.name ? styles.inputError : null]}
              placeholder={t.auth.enterName}
              placeholderTextColor={colors.text.hint}
              value={formData.name}
              onChangeText={text => updateField('name', text)}
              editable={!isSubmitDisabled}
              autoCapitalize="words"
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
          </View>

          {/* Phone Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t.auth.phone} *</Text>
            <View style={styles.phoneInputWrapper}>
              <Text style={styles.countryCode}>+88</Text>
              <TextInput
                style={[styles.input, styles.phoneInput, errors.phone ? styles.inputError : null]}
                placeholder="018XXXXXXXX"
                placeholderTextColor={colors.text.hint}
                value={formData.phone}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={11}
                editable={!isSubmitDisabled}
              />
            </View>
            {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
          </View>

          {/* Role Selection */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              {language === 'en'
                ? 'Account Type'
                : language === 'bn'
                  ? 'অ্যাকাউন্টের ধরন'
                  : language === 'es'
                    ? 'Tipo de Cuenta'
                    : 'खाता प्रकार'}{' '}
              *
            </Text>
            <View style={styles.roleContainer}>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  formData.role === UserRole.OWNER ? styles.roleButtonActive : null,
                ]}
                onPress={() => setFormData(prev => ({...prev, role: UserRole.OWNER}))}
                disabled={isSubmitDisabled}>
                <Text
                  style={[
                    styles.roleButtonText,
                    formData.role === UserRole.OWNER ? styles.roleButtonTextActive : null,
                  ]}>
                  {language === 'en'
                    ? 'Salon Owner'
                    : language === 'bn'
                      ? 'সেলুন মালিক'
                      : language === 'es'
                        ? 'Dueño del Salón'
                        : 'सैलून मालिक'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.roleButton,
                  formData.role === UserRole.EMPLOYEE ? styles.roleButtonActive : null,
                ]}
                onPress={() => setFormData(prev => ({...prev, role: UserRole.EMPLOYEE}))}
                disabled={isSubmitDisabled}>
                <Text
                  style={[
                    styles.roleButtonText,
                    formData.role === UserRole.EMPLOYEE ? styles.roleButtonTextActive : null,
                  ]}>
                  {t.employees.employee}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.hint}>
              {formData.role === UserRole.OWNER
                ? language === 'en'
                  ? 'Create and manage your salon'
                  : language === 'bn'
                    ? 'আপনার সেলুন তৈরি করুন এবং পরিচালনা করুন'
                    : language === 'es'
                      ? 'Cree y administre su salón'
                      : 'अपना सैलून बनाएं और प्रबंधित करें'
                : language === 'en'
                  ? 'Join an existing salon with invite code'
                  : language === 'bn'
                    ? 'আমন্ত্রণ কোড দিয়ে বিদ্যমান সেলুনে যোগ দিন'
                    : language === 'es'
                      ? 'Únase a un salón existente con código de invitación'
                      : 'आमंत्रण कोड के साथ मौजूदा सैलून में शामिल हों'}
            </Text>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t.auth.password} *</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  errors.password ? styles.inputError : null,
                ]}
                placeholder={t.auth.enterPassword}
                placeholderTextColor={colors.text.hint}
                value={formData.password}
                onChangeText={text => updateField('password', text)}
                secureTextEntry={!showPassword}
                editable={!isSubmitDisabled}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
                disabled={isSubmitDisabled}>
                <MaterialIcons
                  name={showPassword ? 'visibility' : 'visibility-off'}
                  size={24}
                  color={colors.text.secondary}
                />
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              {language === 'en'
                ? 'Confirm Password'
                : language === 'bn'
                  ? 'পাসওয়ার্ড নিশ্চিত করুন'
                  : language === 'es'
                    ? 'Confirmar Contraseña'
                    : 'पासवर्ड की पुष्टि करें'}{' '}
              *
            </Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  errors.confirmPassword ? styles.inputError : null,
                ]}
                placeholder={
                  language === 'en'
                    ? 'Confirm Password'
                    : language === 'bn'
                      ? 'পাসওয়ার্ড নিশ্চিত করুন'
                      : language === 'es'
                        ? 'Confirmar Contraseña'
                        : 'पासवर्ड की पुष्टि करें'
                }
                placeholderTextColor={colors.text.hint}
                value={formData.confirmPassword}
                onChangeText={text => updateField('confirmPassword', text)}
                secureTextEntry={!showConfirmPassword}
                editable={!isSubmitDisabled}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isSubmitDisabled}>
                <MaterialIcons
                  name={showConfirmPassword ? 'visibility' : 'visibility-off'}
                  size={24}
                  color={colors.text.secondary}
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword ? (
              <Text style={styles.errorText}>{errors.confirmPassword}</Text>
            ) : null}
          </View>

          {/* Register Button */}
          <TouchableOpacity
            style={[styles.registerButton, isSubmitDisabled ? styles.registerButtonDisabled : null]}
            onPress={handleRegister}
            disabled={isSubmitDisabled}>
            {isSubmitDisabled ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.registerButtonText}>{t.auth.registerButton}</Text>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>{t.auth.alreadyHaveAccount} </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              disabled={isSubmitDisabled}>
              <Text style={styles.loginLink}>{t.auth.login}</Text>
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

const getStyles = (colors: ThemeColors, isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.default,
    },
    scrollContent: {
      flexGrow: 1,
    },
    header: {
      alignItems: 'center',
      paddingTop: 60,
      paddingBottom: 30,
      backgroundColor: isDarkMode ? colors.background.paper : '#FFFFFF',
      borderBottomWidth: isDarkMode ? 1 : 0,
      borderBottomColor: colors.border.light,
    },
    applogo: {
      width: 100,
      height: 100,
      paddingVertical: 40,
    },
    tagline: {
      fontSize: 14,
      color: colors.text.secondary,
      fontWeight: 'bold',
      marginTop: 8,
    },
    form: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 32,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text.primary,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: colors.text.secondary,
      marginBottom: 24,
    },
    inputContainer: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 8,
    },
    phoneInputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    countryCode: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
      paddingHorizontal: 12,
      paddingVertical: 16,
      backgroundColor: isDarkMode ? colors.neutral[200] : colors.neutral[100],
      borderTopLeftRadius: 8,
      borderBottomLeftRadius: 8,
      borderWidth: 1,
      borderColor: colors.border.main,
      borderRightWidth: 0,
    },
    input: {
      fontSize: 16,
      color: colors.text.primary,
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderWidth: 1,
      borderColor: colors.border.main,
      borderRadius: 8,
      backgroundColor: colors.background.paper,
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
    inputError: {
      borderColor: colors.error.main,
    },
    errorText: {
      fontSize: 12,
      color: colors.error.main,
      marginTop: 4,
    },
    hint: {
      fontSize: 12,
      color: colors.text.hint,
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
      borderColor: colors.border.main,
      borderRadius: 8,
      alignItems: 'center',
      backgroundColor: colors.background.paper,
    },
    roleButtonActive: {
      borderColor: colors.primary[500],
      backgroundColor: isDarkMode ? colors.neutral[200] : colors.primary[50],
    },
    roleButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.secondary,
    },
    roleButtonTextActive: {
      color: colors.primary[500],
    },
    registerButton: {
      backgroundColor: colors.primary[500],
      paddingVertical: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 8,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
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
      color: colors.text.secondary,
    },
    loginLink: {
      fontSize: 14,
      fontWeight: '600',
      color: isDarkMode ? colors.primary[400] : colors.primary[600],
    },
  });

export default RegisterScreen;
