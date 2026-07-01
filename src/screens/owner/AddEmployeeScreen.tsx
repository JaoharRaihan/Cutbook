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
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useOrg, useTheme, useLanguage} from '@/context';
import firebase from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import {UserRole, UserStatus} from '@/types';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import {useThemedStyles} from '@/hooks/useThemedStyles';
import {ThemeColors} from '@/constants/theme';

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
  const {colors, isDarkMode} = useTheme();
  const {language, t} = useLanguage();
  const styles = useThemedStyles(getStyles);

  const [employeeName, setEmployeeName] = useState('');
  const [employeePhone, setEmployeePhone] = useState('');
  const [employeePassword, setEmployeePassword] = useState('');
  const [commissionPercentage, setCommissionPercentage] = useState(
    currentOrg?.defaultCommissionMode === 'salary' ? '15000' : '30',
  );
  const [loading, setLoading] = useState(false);

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateForm = (): string | null => {
    if (!employeeName.trim()) {
      return language === 'en'
        ? 'Please enter employee name'
        : language === 'bn'
          ? 'দয়া করে কর্মীর নাম লিখুন'
          : language === 'es'
            ? 'Por favor ingrese el nombre del empleado'
            : 'कृपया कर्मचारी का नाम दर्ज करें';
    }

    if (!employeePhone.trim()) {
      return t.auth.enterPhone;
    }

    if (employeePhone.replace(/\D/g, '').length < 10) {
      return language === 'en'
        ? 'Please enter a valid phone number'
        : language === 'bn'
          ? 'দয়া করে একটি বৈধ ফোন নম্বর লিখুন'
          : language === 'es'
            ? 'Por favor ingrese un número de teléfono válido'
            : 'कृपया एक वैध फोन नंबर दर्ज करें';
    }

    if (!employeePassword.trim()) {
      return t.auth.enterPassword;
    }

    if (employeePassword.length < 6) {
      return language === 'en'
        ? 'Password must be at least 6 characters'
        : language === 'bn'
          ? 'পাসওয়ার্ডটি কমপক্ষে ৬ অক্ষরের হতে হবে'
          : language === 'es'
            ? 'La contraseña debe tener al menos 6 caracteres'
            : 'पासवर्ड कम से कम 6 अक्षरों का होना चाहिए';
    }

    const isSalaryMode = currentOrg?.defaultCommissionMode === 'salary';
    if (isSalaryMode) {
      const salary = parseFloat(commissionPercentage);
      if (isNaN(salary) || salary < 0) {
        return language === 'en'
          ? 'Salary must be a valid positive number'
          : language === 'bn'
            ? 'বেতন অবশ্যই একটি সঠিক ধনাত্মক সংখ্যা হতে হবে'
            : language === 'es'
              ? 'El salario debe ser un número positivo válido'
              : 'वेतन एक मान्य सकारात्मक संख्या होना चाहिए';
      }
    } else {
      const commission = parseFloat(commissionPercentage);
      if (isNaN(commission) || commission < 0 || commission > 100) {
        return language === 'en'
          ? 'Commission must be between 0 and 100'
          : language === 'bn'
            ? 'কমিশন ০ থেকে ১০০ এর মধ্যে হতে হবে'
            : language === 'es'
              ? 'La comisión debe estar entre 0 y 100'
              : 'कमीशन 0 और 100 के बीच होना चाहिए';
      }
    }

    return null;
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRegisterEmployee = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert(
        language === 'en'
          ? 'Validation Error'
          : language === 'bn'
            ? 'যাচাইকরণ ত্রুটি'
            : language === 'es'
              ? 'Error de Validación'
              : 'सत्यापन त्रुटि',
        error,
      );
      return;
    }

    if (!currentOrg) {
      Alert.alert(
        t.common.error,
        language === 'en'
          ? 'Organization not found'
          : language === 'bn'
            ? 'প্রতিষ্ঠান পাওয়া যায়নি'
            : language === 'es'
              ? 'Organización no encontrada'
              : 'संगठन नहीं मिला',
      );
      return;
    }

    setLoading(true);

    try {
      const email = phoneToFirebaseEmail(employeePhone);
      const password = employeePassword.trim();
      const isSalaryMode = currentOrg.defaultCommissionMode === 'salary';
      const commission = isSalaryMode ? 0 : parseFloat(commissionPercentage);
      const monthlySalary = isSalaryMode ? parseFloat(commissionPercentage) : 0;

      // Step 1: Create Firebase Auth account on a secondary Firebase app to prevent logging out the current owner
      const existingApp = firebase.apps.find(app => app.name === 'SecondaryApp');
      if (existingApp) {
        await existingApp.delete();
      }

      const secondaryApp = await firebase.initializeApp(firebase.app().options, 'SecondaryApp');
      let uid = '';
      try {
        const secondaryAuth = auth(secondaryApp);
        const userCredential = await secondaryAuth.createUserWithEmailAndPassword(email, password);
        uid = userCredential.user.uid;
      } finally {
        await secondaryApp.delete();
      }

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
        monthlySalary: monthlySalary,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await firestore().collection('users').doc(uid).set(userData);

      Alert.alert(
        language === 'en'
          ? 'Employee Registered Successfully! ✅'
          : language === 'bn'
            ? 'কর্মী সফলভাবে নিবন্ধিত হয়েছে! ✅'
            : language === 'es'
              ? '¡Empleado Registrado Exitosamente! ✅'
              : 'कर्मचारी सफलतापूर्वक पंजीकृत! ✅',
        language === 'en'
          ? `Employee: ${employeeName}\nPhone: ${employeePhone}\nPassword: ${password}\n\nThey can now log in with these credentials.`
          : language === 'bn'
            ? `কর্মী: ${employeeName}\nফোন: ${employeePhone}\nপাসওয়ার্ড: ${password}\n\nতারা এখন এই শংসাপত্রগুলি দিয়ে লগইন করতে পারবে।`
            : language === 'es'
              ? `Empleado: ${employeeName}\nTeléfono: ${employeePhone}\nContraseña: ${password}\n\nAhora pueden iniciar sesión con estas credenciales.`
              : `कर्मचारी: ${employeeName}\nफ़ोन: ${employeePhone}\nपासवर्ड: ${password}\n\nअब वे इन क्रेडेंशियल्स के साथ लॉग इन कर सकते हैं।`,
        [
          {
            text: t.common.done,
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (err: any) {
      console.error('Error registering employee:', err);

      let errorMessage =
        language === 'en'
          ? 'Failed to register employee'
          : language === 'bn'
            ? 'কর্মী নিবন্ধন করতে ব্যর্থ হয়েছে'
            : language === 'es'
              ? 'Error al registrar al empleado'
              : 'कर्मचारी को पंजीकृत करने में विफल';

      if (err.code === 'auth/email-already-in-use') {
        errorMessage =
          language === 'en'
            ? 'This phone number is already registered. Use a different phone number.'
            : language === 'bn'
              ? 'এই ফোন নম্বরটি ইতিমধ্যে নিবন্ধিত। একটি ভিন্ন ফোন নম্বর ব্যবহার করুন।'
              : language === 'es'
                ? 'Este número de teléfono ya está registrado. Use un número diferente.'
                : 'यह फोन नंबर पहले से ही पंजीकृत है। दूसरा फोन नंबर उपयोग करें।';
      } else if (err.code === 'auth/weak-password') {
        errorMessage =
          language === 'en'
            ? 'Password is too weak. Use at least 6 characters.'
            : language === 'bn'
              ? 'পাসওয়ার্ডটি খুব দুর্বল। কমপক্ষে ৬টি অক্ষর ব্যবহার করুন।'
              : language === 'es'
                ? 'La contraseña es demasiado débil. Use al menos 6 caracteres.'
                : 'पासवर्ड बहुत कमजोर है। कम से कम 6 अक्षरों का प्रयोग करें।';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage =
          language === 'en'
            ? 'Invalid phone number format.'
            : language === 'bn'
              ? 'অবৈধ ফোন নম্বর বিন্যাস।'
              : language === 'es'
                ? 'Formato de número de teléfono inválido.'
                : 'अमान्य फोन नंबर प्रारूप।';
      }

      Alert.alert(t.common.error, errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background.paper}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {/* Form Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {language === 'en'
                ? 'Employee Information'
                : language === 'bn'
                  ? 'কর্মীর তথ্য'
                  : language === 'es'
                    ? 'Información del Empleado'
                    : 'कर्मचारी की जानकारी'}
            </Text>

            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t.auth.name} <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder={t.auth.enterName}
                placeholderTextColor={colors.text.hint}
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
                {t.auth.phone} <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="01874-XXXX26"
                placeholderTextColor={colors.text.hint}
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
                {t.auth.password} <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder={t.auth.enterPassword}
                placeholderTextColor={colors.text.hint}
                value={employeePassword}
                onChangeText={setEmployeePassword}
                secureTextEntry={true}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            <View style={styles.inputGroup}>
              {currentOrg?.defaultCommissionMode === 'salary' ? (
                <>
                  <Text style={styles.label}>
                    {language === 'en'
                      ? 'Monthly Salary'
                      : language === 'bn'
                        ? 'মাসিক বেতন'
                        : language === 'es'
                          ? 'Salario Mensual'
                          : 'मासिक वेतन'}{' '}
                    <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.percentageInputContainer}>
                    <TextInput
                      style={styles.percentageInput}
                      placeholder="15000"
                      placeholderTextColor={colors.text.hint}
                      value={commissionPercentage}
                      onChangeText={setCommissionPercentage}
                      keyboardType="numeric"
                      editable={!loading}
                    />
                    <Text style={styles.percentageSymbol}>৳</Text>
                  </View>
                  <Text style={styles.hint}>
                    {language === 'en'
                      ? 'Default monthly base salary for this employee'
                      : language === 'bn'
                        ? 'এই কর্মীর জন্য ডিফল্ট মাসিক মূল বেতন'
                        : language === 'es'
                          ? 'Salario base mensual predeterminado para este empleado'
                          : 'इस कर्मचारी के लिए डिफ़ॉल्ट मासिक मूल वेतन'}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={styles.label}>
                    {language === 'en'
                      ? 'Commission Percentage'
                      : language === 'bn'
                        ? 'কমিশনের হার'
                        : language === 'es'
                          ? 'Porcentaje de Comisión'
                          : 'कमीशन प्रतिशत'}{' '}
                    <Text style={styles.required}>*</Text>
                  </Text>
                  <View style={styles.percentageInputContainer}>
                    <TextInput
                      style={styles.percentageInput}
                      placeholder="30"
                      placeholderTextColor={colors.text.hint}
                      value={commissionPercentage}
                      onChangeText={setCommissionPercentage}
                      keyboardType="numeric"
                      editable={!loading}
                    />
                    <Text style={styles.percentageSymbol}>%</Text>
                  </View>
                  <Text style={styles.hint}>
                    {language === 'en'
                      ? 'Default commission percentage for this employee'
                      : language === 'bn'
                        ? 'এই কর্মীর জন্য ডিফল্ট কমিশন শতাংশ'
                        : language === 'es'
                          ? 'Porcentaje de comisión predeterminado para este empleado'
                          : 'इस कर्मचारी के लिए डिफ़ॉल्ट कमीशन प्रतिशत'}
                  </Text>
                </>
              )}
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <MaterialIcons name="lightbulb" style={styles.infoIcon} size={24} />
            <Text style={styles.infoText}>
              {language === 'en'
                ? 'The employee can use their phone number and password to log in to the app after registration.'
                : language === 'bn'
                  ? 'নিবন্ধনের পরে কর্মী তাদের ফোন নম্বর এবং পাসওয়ার্ড ব্যবহার করে অ্যাপে লগইন করতে পারবেন।'
                  : language === 'es'
                    ? 'El empleado puede usar su número de teléfono y contraseña para iniciar sesión en la aplicación después del registro.'
                    : 'पंजीकरण के बाद कर्मचारी ऐप में लॉग इन करने के लिए अपने फोन नंबर और पासवर्ड का उपयोग कर सकता है।'}
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
              <Text style={styles.submitButtonText}>{t.employees.addEmployee}</Text>
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

const getStyles = (colors: ThemeColors, isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.default,
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
      backgroundColor: colors.background.paper,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: 16,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 8,
    },
    required: {
      color: colors.error.main,
    },
    input: {
      backgroundColor: colors.background.default,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.text.primary,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    percentageInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.default,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border.light,
      paddingRight: 16,
    },
    percentageInput: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.text.primary,
    },
    percentageSymbol: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text.secondary,
    },
    hint: {
      fontSize: 12,
      color: colors.text.hint,
      marginTop: 6,
    },
    infoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? colors.background.paper : colors.primary[50],
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: isDarkMode ? colors.border.light : colors.primary[100],
    },
    infoIcon: {
      marginRight: 12,
      color: colors.primary[500],
    },
    infoText: {
      flex: 1,
      fontSize: 14,
      color: colors.text.primary,
      lineHeight: 20,
    },
    footer: {
      padding: 16,
      backgroundColor: colors.background.paper,
      borderTopWidth: 1,
      borderTopColor: colors.border.light,
    },
    submitButton: {
      backgroundColor: colors.primary[500],
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: isDarkMode ? 0.3 : 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
    submitButtonDisabled: {
      backgroundColor: colors.neutral[300],
    },
    submitButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '600',
    },
  });
