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
import {useAuth, useTheme, useLanguage} from '@/context';
import type {AuthStackParamList} from '@/navigation/AuthNavigator';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import {useThemedStyles} from '@/hooks/useThemedStyles';
import {ThemeColors} from '@/constants/theme';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

// ============================================================================
// LOGIN SCREEN COMPONENT
// ============================================================================

const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const {login, loading} = useAuth();
  const {colors} = useTheme();
  const {language, t} = useLanguage();

  const styles = useThemedStyles(getStyles);

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({phone: '', password: ''});

  // Format phone number as user types
  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
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

    const cleanPhone = phone.replace(/\D/g, '');
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

    if (!password) {
      newErrors.password = t.validation.required;
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password =
        language === 'en'
          ? 'Password must be at least 6 characters'
          : language === 'bn'
            ? 'পাসওয়ার্ড অবশ্যই ৬ অক্ষরের হতে হবে'
            : language === 'es'
              ? 'La contraseña debe tener al menos 6 caracteres'
              : 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए';
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
      const trimmedPassword = password.trim();
      if (!trimmedPassword) {
        throw new Error(
          language === 'en'
            ? 'Password cannot be empty'
            : language === 'bn'
              ? 'পাসওয়ার্ড খালি হতে পারে না'
              : language === 'es'
                ? 'La contraseña no puede estar vacía'
                : 'पासवर्ड खाली नहीं हो सकता',
        );
      }

      await login({phone, password: trimmedPassword});
    } catch (error: any) {
      Alert.alert(
        language === 'en'
          ? 'Login Failed'
          : language === 'bn'
            ? 'লগইন ব্যর্থ হয়েছে'
            : language === 'es'
              ? 'Error de Inicio de Sesión'
              : 'लॉगिन विफल',
        error.message || 'Invalid credentials',
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Image style={styles.applogo} source={require('../../assets/CutBook_logo.png')} />
          <Text style={styles.tagline}>
            {language === 'en'
              ? 'POS for Salon Management'
              : language === 'bn'
                ? 'সেলুন পরিচালনার জন্য পিওএস'
                : language === 'es'
                  ? 'POS para Gestión de Salones'
                  : 'सैलून प्रबंधन के लिए पीओएस'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <Text style={styles.title}>
            {language === 'en'
              ? 'Welcome Back'
              : language === 'bn'
                ? 'স্বাগতম'
                : language === 'es'
                  ? 'Bienvenido'
                  : 'स्वागत हे'}
          </Text>
          <Text style={styles.subtitle}>
            {language === 'en'
              ? 'Sign in to continue'
              : language === 'bn'
                ? 'চালিয়ে যেতে সাইন ইন করুন'
                : language === 'es'
                  ? 'Inicie sesión para continuar'
                  : 'जारी रखने के लिए साइन इन करें'}
          </Text>

          {/* Phone Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t.auth.phone}</Text>
            <View style={styles.phoneInputWrapper}>
              <Text style={styles.countryCode}>+88</Text>
              <TextInput
                style={[styles.input, styles.phoneInput, errors.phone ? styles.inputError : null]}
                placeholder="018XXXXXXXX"
                placeholderTextColor={colors.text.hint}
                value={phone}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                maxLength={11}
                editable={!loading}
              />
            </View>
            {errors.phone ? <Text style={styles.errorText}>{errors.phone}</Text> : null}
            <Text style={styles.hint}>
              {language === 'en'
                ? 'Enter your 11-digit phone number'
                : language === 'bn'
                  ? 'আপনার ১১ সংখ্যার ফোন নম্বর লিখুন'
                  : language === 'es'
                    ? 'Ingrese su número de teléfono de 11 dígitos'
                    : 'अपना 11 अंकों का फ़ोन नंबर दर्ज करें'}
            </Text>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t.auth.password}</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[
                  styles.input,
                  styles.passwordInput,
                  errors.password ? styles.inputError : null,
                ]}
                placeholder={t.auth.enterPassword}
                placeholderTextColor={colors.text.hint}
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
                  color={colors.text.secondary}
                />
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

            {/* Forgot Password Link */}
            <TouchableOpacity
              style={styles.forgotPasswordContainer}
              onPress={() => navigation.navigate('ForgotPassword')}
              disabled={loading}>
              <Text style={styles.forgotPasswordText}>{t.auth.forgotPassword}</Text>
            </TouchableOpacity>
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={[styles.loginButton, loading ? styles.loginButtonDisabled : null]}
            onPress={handleLogin}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>{t.auth.loginButton}</Text>
            )}
          </TouchableOpacity>

          {/* Register Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>{t.auth.dontHaveAccount} </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={loading}>
              <Text style={styles.registerLink}>{t.auth.register}</Text>
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
      paddingBottom: 20,
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
      paddingTop: 32,
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
      marginBottom: 32,
    },
    inputContainer: {
      marginBottom: 24,
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
    forgotPasswordContainer: {
      alignSelf: 'flex-end',
      marginTop: 8,
      paddingVertical: 4,
    },
    forgotPasswordText: {
      fontSize: 14,
      fontWeight: '600',
      color: isDarkMode ? colors.primary[400] : colors.primary[600],
    },
    loginButton: {
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
      color: colors.text.secondary,
    },
    registerLink: {
      fontSize: 14,
      fontWeight: '600',
      color: isDarkMode ? colors.primary[400] : colors.primary[600],
    },
  });

export default LoginScreen;
