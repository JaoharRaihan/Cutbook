/**
 * ForgotPasswordScreen.tsx
 * Allows user to enter their phone number to receive an OTP and reset password.
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
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {StackNavigationProp} from '@react-navigation/stack';
import {useTheme, useLanguage, useAuth} from '@/context';
import type {AuthStackParamList} from '@/navigation/AuthNavigator';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import {useThemedStyles} from '@/hooks/useThemedStyles';
import {ThemeColors} from '@/constants/theme';
import firestore from '@react-native-firebase/firestore';

type ForgotPasswordNavigationProp = StackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordNavigationProp>();
  const {colors} = useTheme();
  const {sendPhoneOTP} = useAuth();
  const {language, t} = useLanguage();
  const styles = useThemedStyles(getStyles);

  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Format phone number
  const handlePhoneChange = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    const limited = cleaned.slice(0, 11);
    setPhone(limited);
    if (error) setError('');
  };

  // Validate number
  const validate = (): boolean => {
    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) {
      setError(t.validation.required);
      return false;
    }
    if (cleanPhone.length !== 11) {
      setError(
        language === 'en'
          ? 'Phone number must be 11 digits'
          : language === 'bn'
            ? 'ফোন নম্বর অবশ্যই ১১ সংখ্যার হতে হবে'
            : language === 'es'
              ? 'El número de teléfono debe tener 11 dígitos'
              : 'फ़ोन नंबर 11 अंकों का होना चाहिए',
      );
      return false;
    }
    if (!cleanPhone.startsWith('01')) {
      setError(
        language === 'en'
          ? 'Phone number must start with 01'
          : language === 'bn'
            ? 'ফোন নম্বর অবশ্যই ০১ দিয়ে শুরু হতে হবে'
            : language === 'es'
              ? 'El número de teléfono debe comenzar con 01'
              : 'फ़ोन नंबर 01 से शुरू होना चाहिए',
      );
      return false;
    }
    return true;
  };

  // Handle Send OTP
  const handleSendOTP = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      // 1. Verify user exists in Firestore
      const userCheckSnap = await firestore().collection('users').where('phone', '==', phone).get();

      if (userCheckSnap.empty) {
        throw new Error(t.auth.phoneNotFound);
      }

      // 2. Send OTP
      await sendPhoneOTP(phone);

      // 3. Go to OTP screen
      navigation.navigate('OTPVerification', {
        phone,
        flow: 'reset_password',
      });
    } catch (err: any) {
      Alert.alert(
        language === 'en' ? 'Reset Failed' : language === 'bn' ? 'রিসেট ব্যর্থ হয়েছে' : 'Error',
        err.message || 'Something went wrong',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Back Button Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={loading}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.auth.forgotPassword}</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            {/* Lock/Security Icon */}
            <View style={styles.iconContainer}>
              <MaterialIcons name="lock-outline" size={60} color={colors.primary[500]} />
            </View>

            <Text style={styles.title}>
              {language === 'en'
                ? 'Reset Password'
                : language === 'bn'
                  ? 'পাসওয়ার্ড রিসেট'
                  : 'Restablecer contraseña'}
            </Text>

            <Text style={styles.subtitle}>
              {language === 'en'
                ? 'Enter your registered phone number. We will send you a 6-digit verification code.'
                : language === 'bn'
                  ? 'আপনার নিবন্ধিত ফোন নম্বর লিখুন। আমরা আপনাকে একটি ৬-সংখ্যার ওটিপি কোড পাঠাবো।'
                  : 'Introduce tu número de teléfono registrado. Te enviaremos un código de verificación.'}
            </Text>

            {/* Phone Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t.auth.phone}</Text>
              <View style={styles.phoneInputWrapper}>
                <Text style={styles.countryCode}>+88</Text>
                <TextInput
                  style={[styles.input, styles.phoneInput, error ? styles.inputError : null]}
                  placeholder="018XXXXXXXX"
                  placeholderTextColor={colors.text.hint}
                  value={phone}
                  onChangeText={handlePhoneChange}
                  keyboardType="phone-pad"
                  maxLength={11}
                  editable={!loading}
                />
              </View>
              {error ? <Text style={styles.errorText}>{error}</Text> : null}
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.button, loading ? styles.buttonDisabled : null]}
              onPress={handleSendOTP}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>
                  {language === 'en'
                    ? 'Send Verification Code'
                    : language === 'bn'
                      ? 'ভেরিফিকেশন কোড পাঠান'
                      : 'Enviar código'}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const getStyles = (colors: ThemeColors, isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.default,
    },
    keyboardView: {
      flex: 1,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
      backgroundColor: colors.background.paper,
    },
    backButton: {
      padding: 4,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.text.primary,
    },
    headerRightPlaceholder: {
      width: 32,
    },
    scrollContent: {
      flexGrow: 1,
    },
    content: {
      flex: 1,
      paddingHorizontal: 24,
      paddingTop: 40,
      paddingBottom: 24,
    },
    iconContainer: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: isDarkMode ? colors.neutral[200] : colors.primary[50],
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text.primary,
      textAlign: 'center',
      marginBottom: 12,
    },
    subtitle: {
      fontSize: 14,
      color: colors.text.secondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 32,
      paddingHorizontal: 10,
    },
    inputContainer: {
      marginBottom: 32,
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
    inputError: {
      borderColor: colors.error.main,
    },
    errorText: {
      fontSize: 12,
      color: colors.error.main,
      marginTop: 4,
    },
    button: {
      backgroundColor: colors.primary[500],
      paddingVertical: 16,
      borderRadius: 8,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: isDarkMode ? 0.3 : 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });

export default ForgotPasswordScreen;
