/**
 * AddServiceScreen.tsx
 * Form to add a new service to the organization
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
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useOrg, useTheme, useLanguage} from '@/context';
import {Service, ServiceCategory} from '@/types';
import {useThemedStyles} from '@/hooks/useThemedStyles';
import {ThemeColors} from '@/constants/theme';

// Stub type for omitted properties
type ServiceInput = Omit<Service, 'id' | 'createdAt' | 'updatedAt'>;

// ============================================================================
// COMPONENT
// ============================================================================

export default function AddServiceScreen({navigation}: any): React.ReactElement {
  const {addService, currentOrg} = useOrg();
  const {colors, isDarkMode} = useTheme();
  const {language, t} = useLanguage();
  const styles = useThemedStyles(getStyles);

  const [serviceName, setServiceName] = useState('');
  const [category, setCategory] = useState<ServiceCategory>(ServiceCategory.HAIRCUT);
  const [defaultPrice, setDefaultPrice] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);

  const categories = [
    {
      value: ServiceCategory.HAIRCUT,
      label: t.services.haircut,
      icon: '✂️',
    },
    {
      value: ServiceCategory.SHAVE,
      label: t.services.shave,
      icon: '🪒',
    },
    {
      value: ServiceCategory.BEARD,
      label:
        language === 'en'
          ? 'Beard'
          : language === 'bn'
            ? 'দাড়ি'
            : language === 'es'
              ? 'Barba'
              : 'दाढ़ी',
      icon: '🧔',
    },
    {
      value: ServiceCategory.COLOR,
      label: t.services.coloring,
      icon: '🎨',
    },
    {
      value: ServiceCategory.FACIAL,
      label: t.services.facial,
      icon: '💆',
    },
    {
      value: ServiceCategory.MASSAGE,
      label: t.services.massage,
      icon: '💆‍♂️',
    },
    {
      value: ServiceCategory.SPA,
      label:
        language === 'en' ? 'Spa' : language === 'bn' ? 'স্পা' : language === 'es' ? 'Spa' : 'स्पा',
      icon: '🛁',
    },
    {
      value: ServiceCategory.OTHER,
      label: t.services.other,
      icon: '✨',
    },
  ];

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateForm = (): string | null => {
    if (!serviceName.trim()) {
      return language === 'en'
        ? 'Please enter service name'
        : language === 'bn'
          ? 'দয়া করে সেবার নাম লিখুন'
          : language === 'es'
            ? 'Por favor ingrese el nombre del servicio'
            : 'कृपया सेवा का नाम दर्ज करें';
    }

    if (defaultPrice && isNaN(parseFloat(defaultPrice))) {
      return language === 'en'
        ? 'Please enter a valid price'
        : language === 'bn'
          ? 'দয়া করে একটি বৈধ মূল্য লিখুন'
          : language === 'es'
            ? 'Por favor ingrese un precio válido'
            : 'कृपया एक मान्य मूल्य दर्ज करें';
    }

    if (duration && isNaN(parseInt(duration))) {
      return language === 'en'
        ? 'Please enter a valid duration'
        : language === 'bn'
          ? 'দয়া করে একটি বৈধ সময়সীমা লিখুন'
          : language === 'es'
            ? 'Por favor ingrese una duración válida'
            : 'कृपया एक मान्य अवधि दर्ज करें';
    }

    return null;
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSubmit = async () => {
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
          ? 'Organization not found. Please try again.'
          : language === 'bn'
            ? 'প্রতিষ্ঠান পাওয়া যায়নি। আবার চেষ্টা করুন।'
            : language === 'es'
              ? 'Organización no encontrada. Por favor intente de nuevo.'
              : 'संगठन नहीं मिला। कृपया पुनः प्रयास करें।',
      );
      return;
    }

    setLoading(true);

    try {
      const serviceData: ServiceInput = {
        orgId: currentOrg.id,
        name: serviceName.trim(),
        category,
        defaultPrice: defaultPrice ? parseFloat(defaultPrice) : 0,
        isActive: true,
      };

      // Only add optional fields if they have values (avoid undefined)
      if (description.trim()) {
        serviceData.description = description.trim();
      }
      if (duration.trim()) {
        serviceData.duration = parseInt(duration);
      }

      await addService(serviceData);

      Alert.alert(
        t.common.success,
        language === 'en'
          ? `${serviceName} has been added!`
          : language === 'bn'
            ? `${serviceName} যোগ করা হয়েছে!`
            : language === 'es'
              ? `¡Se ha añadido ${serviceName}!`
              : `${serviceName} जोड़ दिया गया है!`,
        [
          {
            text:
              language === 'en'
                ? 'Add Another'
                : language === 'bn'
                  ? 'আরেকটি যোগ করুন'
                  : language === 'es'
                    ? 'Añadir otro'
                    : 'एक और जोड़ें',
            onPress: () => resetForm(),
          },
          {
            text: t.common.done,
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (err: any) {
      console.error('Error adding service:', err);
      Alert.alert(
        t.common.error,
        err.message ||
          (language === 'en'
            ? 'Failed to add service. Please try again.'
            : language === 'bn'
              ? 'সেবা যোগ করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।'
              : language === 'es'
                ? 'Error al añadir el servicio. Por favor intente de nuevo.'
                : 'सेवा जोड़ने में विफल। कृपया पुनः प्रयास करें।'),
      );
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (cat: ServiceCategory): string => {
    const found = categories.find(c => c.value === cat);
    return found ? found.icon : '💈';
  };

  const resetForm = () => {
    setServiceName('');
    setCategory(ServiceCategory.HAIRCUT);
    setDefaultPrice('');
    setDescription('');
    setDuration('');
  };

  const getCategoryLabel = (cat: ServiceCategory): string => {
    const found = categories.find(c => c.value === cat);
    return found ? found.label : cat;
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
                ? 'Service Information'
                : language === 'bn'
                  ? 'সেবার তথ্য'
                  : language === 'es'
                    ? 'Información del Servicio'
                    : 'सेवा की जानकारी'}
            </Text>

            {/* Service Name */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t.services.serviceName} <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Regular Haircut"
                placeholderTextColor={colors.text.hint}
                value={serviceName}
                onChangeText={setServiceName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>

            {/* Category */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t.services.category} <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowCategoryPicker(!showCategoryPicker)}>
                <Text style={styles.pickerButtonText}>
                  {getCategoryIcon(category)} {getCategoryLabel(category)}
                </Text>
                <Text style={styles.pickerArrow}>{showCategoryPicker ? '▲' : '▼'}</Text>
              </TouchableOpacity>

              {showCategoryPicker && (
                <View style={styles.pickerOptions}>
                  {categories.map(cat => (
                    <TouchableOpacity
                      key={cat.value}
                      style={[
                        styles.pickerOption,
                        category === cat.value && styles.pickerOptionSelected,
                      ]}
                      onPress={() => {
                        setCategory(cat.value);
                        setShowCategoryPicker(false);
                      }}>
                      <Text style={styles.pickerOptionText}>
                        {cat.icon} {cat.label}
                      </Text>
                      {category === cat.value && <Text style={styles.checkmark}>✓</Text>}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Default Price */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {language === 'en'
                  ? 'Default Price (Optional)'
                  : language === 'bn'
                    ? 'ডিফল্ট মূল্য (ঐচ্ছিক)'
                    : language === 'es'
                      ? 'Precio Predeterminado (Opcional)'
                      : 'डिफ़ॉल्ट मूल्य (वैकल्पिक)'}
              </Text>
              <View style={styles.priceInputContainer}>
                <Text style={styles.currencySymbol}>৳</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0"
                  placeholderTextColor={colors.text.hint}
                  value={defaultPrice}
                  onChangeText={setDefaultPrice}
                  keyboardType="numeric"
                />
              </View>
              <Text style={styles.hint}>
                {language === 'en'
                  ? 'Leave empty if price varies per session'
                  : language === 'bn'
                    ? 'সেশন অনুযায়ী মূল্য পরিবর্তিত হলে খালি রাখুন'
                    : language === 'es'
                      ? 'Deje vacío si el precio varía según la sesión'
                      : 'यदि प्रत्येक सत्र में मूल्य भिन्न होता है तो खाली छोड़ दें'}
              </Text>
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {language === 'en'
                  ? 'Description (Optional)'
                  : language === 'bn'
                    ? 'বিবরণ (ঐচ্ছিক)'
                    : language === 'es'
                      ? 'Descripción (Opcional)'
                      : 'विवरण (वैकल्पिक)'}
              </Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder={
                  language === 'en'
                    ? 'Brief description of the service...'
                    : language === 'bn'
                      ? 'সেবাটির সংক্ষিপ্ত বিবরণ...'
                      : language === 'es'
                        ? 'Breve descripción del servicio...'
                        : 'सेवा का संक्षिप्त विवरण...'
                }
                placeholderTextColor={colors.text.hint}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}>
            <Text style={styles.submitButtonText}>
              {loading
                ? language === 'en'
                  ? 'Adding Service...'
                  : language === 'bn'
                    ? 'সেবা যোগ করা হচ্ছে...'
                    : language === 'es'
                      ? 'Añadiendo servicio...'
                      : 'सेवा जोड़ी जा रही है...'
                : t.services.addService}
            </Text>
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
    textArea: {
      minHeight: 100,
      paddingTop: 14,
    },
    pickerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.background.default,
      borderRadius: 8,
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    pickerButtonText: {
      fontSize: 16,
      color: colors.text.primary,
    },
    pickerArrow: {
      fontSize: 12,
      color: colors.text.hint,
    },
    pickerOptions: {
      marginTop: 8,
      backgroundColor: colors.background.paper,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border.light,
      overflow: 'hidden',
    },
    pickerOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
      backgroundColor: colors.background.paper,
    },
    pickerOptionSelected: {
      backgroundColor: isDarkMode ? colors.neutral[100] : colors.primary[50],
    },
    pickerOptionText: {
      fontSize: 16,
      color: colors.text.primary,
    },
    checkmark: {
      fontSize: 18,
      color: colors.primary[500],
      fontWeight: '700',
    },
    priceInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.default,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border.light,
      paddingLeft: 16,
    },
    currencySymbol: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text.secondary,
      marginRight: 8,
    },
    priceInput: {
      flex: 1,
      paddingVertical: 14,
      paddingRight: 16,
      fontSize: 16,
      color: colors.text.primary,
    },
    hint: {
      fontSize: 12,
      color: colors.text.hint,
      marginTop: 6,
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
