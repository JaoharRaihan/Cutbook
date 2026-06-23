/**
 * ResetPasswordScreen.tsx
 * Allows the user to enter their new password and submits the reset request to firestore.
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
import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {SafeAreaView} from 'react-native-safe-area-context';
import type {StackNavigationProp} from '@react-navigation/stack';
import {useTheme, useLanguage, useAuth} from '@/context';
import type {AuthStackParamList} from '@/navigation/AuthNavigator';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import {useThemedStyles} from '@/hooks/useThemedStyles';
import {ThemeColors} from '@/constants/theme';

type ResetPasswordNavigationProp = StackNavigationProp<AuthStackParamList, 'ResetPassword'>;
type ResetPasswordRouteProp = RouteProp<AuthStackParamList, 'ResetPassword'>;

const ResetPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ResetPasswordNavigationProp>();
  const route = useRoute<ResetPasswordRouteProp>();
  const {phone} = route.params;

  const {colors} = useTheme();
  const {updatePasswordAfterReset} = useAuth();
  const {language, t} = useLanguage();
  const styles = useThemedStyles(getStyles);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({password: '', confirmPassword: ''});

  // Validate inputs
  const validate = (): boolean => {
    const newErrors = {password: '', confirmPassword: ''};
    let isValid = true;

    if (!password) {
      newErrors.password = t.validation.required;
      isValid = false;
    } else if (password.length < 6) {
      newErrors.password =
        language === 'en'
          ? 'Password must be at least 6 characters'
          : language === 'bn'
            ? 'পাসওয়ার্ড অবশ্যই কমপক্ষে ৬ অক্ষরের হতে হবে'
            : 'La contraseña debe tener al menos 6 caracteres';
      isValid = false;
    }

    if (!confirmPassword) {
      newErrors.confirmPassword =
        language === 'en'
          ? 'Please confirm your password'
          : language === 'bn'
            ? 'পাসওয়ার্ড নিশ্চিত করুন'
            : 'Confirme su contraseña';
      isValid = false;
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword =
        language === 'en'
          ? 'Passwords do not match'
          : language === 'bn'
            ? 'পাসওয়ার্ড মেলেনি'
            : 'Las contraseñas no coinciden';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Submit Password Reset
  const handleSubmit = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      await updatePasswordAfterReset(phone, password.trim());

      Alert.alert(language === 'en' ? 'Success' : 'সফল', t.auth.passwordResetSuccess, [
        {
          text: 'OK',
          onPress: () => {
            // Reset navigation state and go to Login screen
            navigation.reset({
              index: 0,
              routes: [{name: 'Login'}],
            });
          },
        },
      ]);
    } catch (err: any) {
      Alert.alert(t.common.error, err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

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
          <Text style={styles.headerTitle}>{t.auth.resetPasswordButton}</Text>
          <View style={styles.headerRightPlaceholder} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <MaterialIcons name="lock-reset" size={50} color={colors.primary[500]} />
            </View>

            <Text style={styles.title}>{t.auth.newPassword}</Text>

            <Text style={styles.subtitle}>
              {language === 'en'
                ? 'Create a secure new password for your Cutbook account.'
                : language === 'bn'
                  ? 'আপনার কাটবুক অ্যাকাউন্টের জন্য একটি নতুন নিরাপদ পাসওয়ার্ড তৈরি করুন।'
                  : 'Crea una nueva contraseña segura para tu cuenta.'}
            </Text>

            {/* New Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t.auth.newPassword} *</Text>
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
                    if (errors.password) setErrors(prev => ({...prev, password: ''}));
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
            </View>

            {/* Confirm New Password Input */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>{t.auth.confirmNewPassword} *</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={[
                    styles.input,
                    styles.passwordInput,
                    errors.confirmPassword ? styles.inputError : null,
                  ]}
                  placeholder={t.auth.confirmNewPassword}
                  placeholderTextColor={colors.text.hint}
                  value={confirmPassword}
                  onChangeText={text => {
                    setConfirmPassword(text);
                    if (errors.confirmPassword) setErrors(prev => ({...prev, confirmPassword: ''}));
                  }}
                  secureTextEntry={!showConfirmPassword}
                  editable={!loading}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}>
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

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.button, loading ? styles.buttonDisabled : null]}
              onPress={handleSubmit}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>{t.auth.resetPasswordButton}</Text>
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
      width: 90,
      height: 90,
      borderRadius: 45,
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
      marginBottom: 24,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 8,
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
    button: {
      backgroundColor: colors.primary[500],
      paddingVertical: 16,
      borderRadius: 8,
      alignItems: 'center',
      marginTop: 16,
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

export default ResetPasswordScreen;
