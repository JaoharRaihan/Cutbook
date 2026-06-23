/**
 * OTPVerificationScreen.tsx
 * Screen with a 6-digit verification code input, resend timer, and verification logic.
 */

import React, {useState, useRef, useEffect} from 'react';
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
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {StackNavigationProp} from '@react-navigation/stack';
import {useAuth, useTheme, useLanguage} from '@/context';
import type {AuthStackParamList} from '@/navigation/AuthNavigator';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import {useThemedStyles} from '@/hooks/useThemedStyles';
import {ThemeColors} from '@/constants/theme';

type OTPVerificationRouteProp = RouteProp<AuthStackParamList, 'OTPVerification'>;
type OTPVerificationNavigationProp = StackNavigationProp<AuthStackParamList, 'OTPVerification'>;

const TIMER_SECONDS = 60;

const OTPVerificationScreen: React.FC = () => {
  const navigation = useNavigation<OTPVerificationNavigationProp>();
  const route = useRoute<OTPVerificationRouteProp>();
  const {phone, flow, registrationData} = route.params;

  const {sendPhoneOTP, verifyPhoneOTPAndLink, verifyPhoneOTPForReset} = useAuth();
  const {colors} = useTheme();
  const {language, t} = useLanguage();
  const styles = useThemedStyles(getStyles);

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(TIMER_SECONDS);
  const [canResend, setCanResend] = useState(false);

  // References for inputs
  const inputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  // Resend OTP timer effect
  useEffect(() => {
    let interval: any;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Handle digit input
  const handleChangeText = (text: string, index: number) => {
    // Only allow digits
    const cleaned = text.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleaned;
    setOtp(newOtp);

    if (cleaned && index < 5) {
      // Focus next input
      inputRefs[index + 1].current?.focus();
    }
  };

  // Handle backspace key press
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      // Clear previous and focus previous input
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs[index - 1].current?.focus();
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (!canResend) return;

    setLoading(true);
    try {
      await sendPhoneOTP(phone);
      setTimer(TIMER_SECONDS);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs[0].current?.focus();
    } catch (err: any) {
      Alert.alert(t.common.error, err.message || 'Failed to resend code');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      Alert.alert(
        t.common.error,
        language === 'en'
          ? 'Please enter the complete 6-digit code'
          : language === 'bn'
            ? 'দয়া করে সম্পূর্ণ ৬-সংখ্যার কোডটি লিখুন'
            : 'Introduce el código completo',
      );
      return;
    }

    setLoading(true);
    try {
      if (flow === 'register' && registrationData) {
        await verifyPhoneOTPAndLink(code, {
          name: registrationData.name,
          phone: registrationData.phone,
          email: registrationData.email,
          password: registrationData.password,
          role: registrationData.role,
        });

        Alert.alert(
          language === 'en' ? 'Success' : 'সফল',
          language === 'en'
            ? 'Account created successfully!'
            : 'অ্যাকাউন্ট সফলভাবে তৈরি করা হয়েছে!',
        );
      } else if (flow === 'reset_password') {
        await verifyPhoneOTPForReset(phone, code);
        navigation.navigate('ResetPassword', {phone});
      }
    } catch (err: any) {
      Alert.alert(t.common.error, err.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  // Automatically trigger verification when 6 digits are filled
  useEffect(() => {
    if (otp.join('').length === 6) {
      handleVerify();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [otp]);

  // Clean phone display formatting
  const displayPhone = `+88 ${phone.slice(0, 4)}-${phone.slice(4, 7)}-${phone.slice(7)}`;

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={loading}>
            <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t.auth.otpTitle}</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="sms" size={50} color={colors.primary[500]} />
            </View>

            <Text style={styles.title}>{t.auth.enterOtp}</Text>

            <Text style={styles.subtitle}>{t.auth.otpSent.replace('{phone}', displayPhone)}</Text>

            {/* OTP Boxes Grid */}
            <View style={styles.otpGrid}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={inputRefs[index]}
                  style={[styles.otpInput, digit ? styles.otpInputFilled : null]}
                  value={digit}
                  onChangeText={text => handleChangeText(text, index)}
                  onKeyPress={e => handleKeyPress(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  selectTextOnFocus
                  editable={!loading}
                />
              ))}
            </View>

            {/* Verify Button */}
            <TouchableOpacity
              style={[styles.button, loading ? styles.buttonDisabled : null]}
              onPress={handleVerify}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>{t.auth.verify}</Text>
              )}
            </TouchableOpacity>

            {/* Resend Panel */}
            <View style={styles.resendContainer}>
              {canResend ? (
                <TouchableOpacity onPress={handleResend} disabled={loading}>
                  <Text style={styles.resendLink}>{t.auth.resendOtp}</Text>
                </TouchableOpacity>
              ) : (
                <Text style={styles.timerText}>
                  {t.auth.resendIn.replace('{seconds}', timer.toString())}
                </Text>
              )}
            </View>
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
      alignItems: 'center',
    },
    iconContainer: {
      width: 90,
      height: 90,
      borderRadius: 45,
      backgroundColor: isDarkMode ? colors.neutral[200] : colors.primary[50],
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 24,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text.primary,
      marginBottom: 12,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: colors.text.secondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 36,
      paddingHorizontal: 20,
    },
    otpGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
      marginBottom: 36,
      gap: 8,
    },
    otpInput: {
      flex: 1,
      height: 56,
      borderWidth: 1.5,
      borderColor: colors.border.main,
      borderRadius: 12,
      backgroundColor: colors.background.paper,
      textAlign: 'center',
      fontSize: 22,
      fontWeight: 'bold',
      color: colors.text.primary,
    },
    otpInputFilled: {
      borderColor: colors.primary[500],
      backgroundColor: isDarkMode ? colors.neutral[200] : colors.primary[50] + '10', // subtle transparency tint
    },
    button: {
      backgroundColor: colors.primary[500],
      width: '100%',
      paddingVertical: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginBottom: 24,
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
    resendContainer: {
      alignItems: 'center',
      marginTop: 8,
    },
    resendLink: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.primary[500],
      textDecorationLine: 'underline',
    },
    timerText: {
      fontSize: 14,
      color: colors.text.secondary,
    },
  });

export default OTPVerificationScreen;
