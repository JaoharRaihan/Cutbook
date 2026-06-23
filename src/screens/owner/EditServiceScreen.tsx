/**
 * EditServiceScreen.tsx
 * Form to edit or delete an existing service
 */

import React, {useState, useEffect} from 'react';
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
  Switch,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useOrg, useTheme, useLanguage} from '@/context';
import {Service, ServiceCategory} from '@/types';
import {formatDateISO} from '@/utils';
import {useThemedStyles} from '@/hooks/useThemedStyles';
import {ThemeColors} from '@/constants/theme';

// ============================================================================
// COMPONENT
// ============================================================================

export default function EditServiceScreen({route, navigation}: any): React.ReactElement {
  const {serviceId} = route.params;
  const {orgServices, updateService, deleteService} = useOrg();
  const {colors, isDarkMode} = useTheme();
  const {language, t} = useLanguage();
  const styles = useThemedStyles(getStyles);

  const [loading, setLoading] = useState(true);
  const [service, setService] = useState<Service | null>(null);
  const [serviceName, setServiceName] = useState('');
  const [category, setCategory] = useState<ServiceCategory>(ServiceCategory.HAIRCUT);
  const [defaultPrice, setDefaultPrice] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [isActive, setIsActive] = useState(true);
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
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    // Find service from orgServices
    const foundService = orgServices.find(s => s.id === serviceId);
    if (foundService) {
      setService(foundService);
      setServiceName(foundService.name);
      setCategory(foundService.category);
      setDefaultPrice(foundService.defaultPrice ? foundService.defaultPrice.toString() : '');
      setDescription(foundService.description || '');
      setDuration(foundService.duration ? foundService.duration.toString() : '');
      setIsActive(foundService.isActive);
    }
    setLoading(false);
  }, [serviceId, orgServices]);

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

  const handleUpdate = async () => {
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

    if (!service) {
      Alert.alert(
        t.common.error,
        language === 'en'
          ? 'Service not found'
          : language === 'bn'
            ? 'সেবা পাওয়া যায়নি'
            : language === 'es'
              ? 'Servicio no encontrado'
              : 'सेवा नहीं मिली',
      );
      return;
    }

    setLoading(true);

    try {
      await updateService(serviceId, {
        name: serviceName.trim(),
        category,
        defaultPrice: defaultPrice ? parseFloat(defaultPrice) : 0,
        description: description.trim() || undefined,
        duration: duration ? parseInt(duration) : undefined,
        isActive,
      });

      Alert.alert(
        t.common.success,
        language === 'en'
          ? `${serviceName} has been updated!`
          : language === 'bn'
            ? `${serviceName} আপডেট করা হয়েছে!`
            : language === 'es'
              ? `¡${serviceName} ha sido actualizado!`
              : `${serviceName} अपडेट कर दिया गया है!`,
        [
          {
            text: t.common.done,
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (err: any) {
      console.error('Error updating service:', err);
      Alert.alert(t.common.error, err.message || 'Failed to update service');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t.services.deleteService,
      language === 'en'
        ? `Are you sure you want to delete ${serviceName}? This action cannot be undone.`
        : language === 'bn'
          ? `আপনি কি নিশ্চিত যে আপনি ${serviceName} মুছতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।`
          : language === 'es'
            ? `¿Está seguro de que desea eliminar ${serviceName}? Esta acción no se puede deshacer.`
            : `क्या आप वाकई ${serviceName} को हटाना चाहते हैं? यह कार्रवाई पूर्ववत नहीं की जा सकती।`,
      [
        {text: t.common.cancel, style: 'cancel'},
        {
          text: t.common.delete,
          style: 'destructive',
          onPress: confirmDelete,
        },
      ],
    );
  };

  const confirmDelete = () => {
    Alert.alert(
      language === 'en'
        ? 'Final Confirmation'
        : language === 'bn'
          ? 'চূড়ান্ত নিশ্চিতকরণ'
          : language === 'es'
            ? 'Confirmación Final'
            : 'अंतिम पुष्टि',
      language === 'en'
        ? 'This will permanently delete this service and may affect existing work entries. Continue?'
        : language === 'bn'
          ? 'এটি স্থায়ীভাবে সেবাটি মুছে ফেলবে এবং বিদ্যমান কাজের এন্ট্রি প্রভাবিত করতে পারে। চালিয়ে যাবেন?'
          : language === 'es'
            ? 'Esto eliminará permanentemente este servicio y puede afectar las entradas de trabajo existentes. ¿Continuar?'
            : 'यह इस सेवा को स्थायी रूप से हटा देगा और मौजूदा कार्य प्रविष्टियों को प्रभावित कर सकता है। जारी रखें?',
      [
        {text: t.common.cancel, style: 'cancel'},
        {
          text:
            language === 'en'
              ? 'Yes, Delete'
              : language === 'bn'
                ? 'হ্যাঁ, মুছুন'
                : language === 'es'
                  ? 'Sí, eliminar'
                  : 'हाँ, हटाएँ',
          style: 'destructive',
          onPress: executeDelete,
        },
      ],
    );
  };

  const executeDelete = async () => {
    setLoading(true);

    try {
      await deleteService(serviceId);

      Alert.alert(
        language === 'en'
          ? 'Deleted'
          : language === 'bn'
            ? 'মুছে ফেলা হয়েছে'
            : language === 'es'
              ? 'Eliminado'
              : 'हटा दिया गया',
        language === 'en'
          ? `${serviceName} has been deleted.`
          : language === 'bn'
            ? `${serviceName} মুছে ফেলা হয়েছে।`
            : language === 'es'
              ? `${serviceName} ha sido eliminado.`
              : `${serviceName} को हटा दिया गया है।`,
        [
          {
            text: t.common.done,
            onPress: () => navigation.goBack(),
          },
        ],
      );
    } catch (err: any) {
      console.error('Error deleting service:', err);
      Alert.alert(
        t.common.error,
        err.message ||
          (language === 'en'
            ? 'Failed to delete service'
            : language === 'bn'
              ? 'সেবা মুছতে ব্যর্থ হয়েছে'
              : language === 'es'
                ? 'Error al eliminar el servicio'
                : 'सेवा हटाने में विफल'),
      );
      setLoading(false);
    }
  };

  const handleToggleActive = (value: boolean) => {
    if (!value) {
      Alert.alert(
        language === 'en'
          ? 'Deactivate Service'
          : language === 'bn'
            ? 'সেবা নিষ্ক্রিয় করুন'
            : language === 'es'
              ? 'Desactivar Servicio'
              : 'सेवा निष्क्रिय करें',
        language === 'en'
          ? 'Deactivating this service will hide it from the service list. Continue?'
          : language === 'bn'
            ? 'সেবাটি নিষ্ক্রিয় করলে তা সেবার তালিকা থেকে লুকিয়ে যাবে। চালিয়ে যাবেন?'
            : language === 'es'
              ? 'Desactivar este servicio lo ocultará de la lista de servicios. ¿Continuar?'
              : 'इस सेवा को निष्क्रिय करने से यह सेवा सूची से छिप जाएगी। जारी रखें?',
        [
          {text: t.common.cancel, style: 'cancel'},
          {
            text:
              language === 'en'
                ? 'Deactivate'
                : language === 'bn'
                  ? 'নিষ্ক্রিয় করুন'
                  : language === 'es'
                    ? 'Desactivar'
                    : 'निष्क्रिय करें',
            onPress: () => setIsActive(false),
          },
        ],
      );
    } else {
      setIsActive(true);
    }
  };

  const getCategoryIcon = (cat: ServiceCategory): string => {
    const found = categories.find(c => c.value === cat);
    return found ? found.icon : '💈';
  };

  const getCategoryLabel = (cat: ServiceCategory): string => {
    const found = categories.find(c => c.value === cat);
    return found ? found.label : cat;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading || !service) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>
            {language === 'en'
              ? 'Loading service...'
              : language === 'bn'
                ? 'সেবা লোড হচ্ছে...'
                : language === 'es'
                  ? 'Cargando servicio...'
                  : 'सेवा लोड हो रही है...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

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
          {/* Status Section */}
          <View style={styles.section}>
            <View style={styles.statusHeader}>
              <View>
                <Text style={styles.statusLabel}>
                  {language === 'en'
                    ? 'Service Status'
                    : language === 'bn'
                      ? 'সেবার অবস্থা'
                      : language === 'es'
                        ? 'Estado del Servicio'
                        : 'सेवा की स्थिति'}
                </Text>
                <Text style={styles.statusSubtext}>
                  {isActive
                    ? language === 'en'
                      ? 'Active in service list'
                      : language === 'bn'
                        ? 'সেবা তালিকায় সক্রিয়'
                        : language === 'es'
                          ? 'Activo en la lista de servicios'
                          : 'सेवा सूची में सक्रिय'
                    : language === 'en'
                      ? 'Hidden from list'
                      : language === 'bn'
                        ? 'তালিকা থেকে লুকানো'
                        : language === 'es'
                          ? 'Oculto de la lista'
                          : 'सूची से छिपा हुआ'}
                </Text>
              </View>
              <Switch
                value={isActive}
                onValueChange={handleToggleActive}
                trackColor={{false: colors.error.main, true: colors.success.main}}
                thumbColor="#FFFFFF"
                ios_backgroundColor={colors.error.main}
              />
            </View>
          </View>

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

            {/* Duration */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {language === 'en'
                  ? 'Duration (Optional)'
                  : language === 'bn'
                    ? 'সময়সীমা (ঐচ্ছিক)'
                    : language === 'es'
                      ? 'Duración (Opcional)'
                      : 'अवधि (वैकल्पिक)'}
              </Text>
              <View style={styles.durationInputContainer}>
                <TextInput
                  style={styles.durationInput}
                  placeholder="30"
                  placeholderTextColor={colors.text.hint}
                  value={duration}
                  onChangeText={setDuration}
                  keyboardType="numeric"
                />
                <Text style={styles.durationUnit}>
                  {language === 'en'
                    ? 'minutes'
                    : language === 'bn'
                      ? 'মিনিট'
                      : language === 'es'
                        ? 'minutos'
                        : 'मिनट'}
                </Text>
              </View>
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

            {/* Metadata */}
            <View style={styles.metadata}>
              <Text style={styles.metadataText}>
                {language === 'en'
                  ? 'Last updated: '
                  : language === 'bn'
                    ? 'সর্বশেষ আপডেট: '
                    : language === 'es'
                      ? 'Última actualización: '
                      : 'अंतिम अपडेट: '}
                {service.updatedAt ? formatDateISO(service.updatedAt) : 'N/A'}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {language === 'en'
                ? 'Actions'
                : language === 'bn'
                  ? 'পদক্ষেপ'
                  : language === 'es'
                    ? 'Acciones'
                    : 'कार्रवाई'}
            </Text>

            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Text style={styles.deleteButtonText}>
                {language === 'en'
                  ? '🗑️ Delete Service'
                  : language === 'bn'
                    ? '🗑️ সেবা মুছুন'
                    : language === 'es'
                      ? '🗑️ Eliminar Servicio'
                      : '🗑️ सेवा हटाएं'}
              </Text>
            </TouchableOpacity>

            <Text style={styles.deleteWarning}>
              {language === 'en'
                ? '⚠️ Deleting a service may affect existing work entries'
                : language === 'bn'
                  ? '⚠️ সেবাটি মুছলে বিদ্যমান কাজের এন্ট্রিতে প্রভাব পড়তে পারে'
                  : language === 'es'
                    ? '⚠️ Eliminar un servicio puede afectar las entradas de trabajo existentes'
                    : '⚠️ सेवा हटाने से मौजूदा कार्य प्रविष्टियाँ प्रभावित हो सकती हैं'}
            </Text>
          </View>
        </ScrollView>

        {/* Update Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.updateButton, loading && styles.updateButtonDisabled]}
            onPress={handleUpdate}
            disabled={loading}>
            <Text style={styles.updateButtonText}>
              {loading
                ? language === 'en'
                  ? 'Updating...'
                  : language === 'bn'
                    ? 'আপডেট হচ্ছে...'
                    : language === 'es'
                      ? 'Actualizando...'
                      : 'अपडेट हो रहा है...'
                : language === 'en'
                  ? '✓ Update Service'
                  : language === 'bn'
                    ? '✓ সেবা আপডেট করুন'
                    : language === 'es'
                      ? '✓ Actualizar Servicio'
                      : '✓ सेवा अपडेट करें'}
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background.default,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: colors.text.secondary,
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
    statusHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    statusLabel: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
    },
    statusSubtext: {
      fontSize: 13,
      color: colors.text.secondary,
      marginTop: 4,
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
    durationInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.default,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border.light,
      paddingRight: 16,
    },
    durationInput: {
      flex: 1,
      paddingHorizontal: 16,
      paddingVertical: 14,
      fontSize: 16,
      color: colors.text.primary,
    },
    durationUnit: {
      fontSize: 16,
      color: colors.text.secondary,
    },
    hint: {
      fontSize: 12,
      color: colors.text.hint,
      marginTop: 6,
    },
    metadata: {
      marginTop: 8,
      paddingTop: 16,
      borderTopWidth: 1,
      borderTopColor: colors.border.light,
    },
    metadataText: {
      fontSize: 13,
      color: colors.text.hint,
    },
    deleteButton: {
      backgroundColor: isDarkMode ? colors.background.paper : '#FFEBEE',
      borderRadius: 8,
      paddingVertical: 14,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: isDarkMode ? colors.error.main : '#FFCDD2',
    },
    deleteButtonText: {
      color: colors.error.main,
      fontSize: 16,
      fontWeight: '600',
    },
    deleteWarning: {
      fontSize: 12,
      color: colors.warning.main,
      marginTop: 12,
      textAlign: 'center',
    },
    footer: {
      padding: 16,
      backgroundColor: colors.background.paper,
      borderTopWidth: 1,
      borderTopColor: colors.border.light,
    },
    updateButton: {
      backgroundColor: colors.success.main,
      borderRadius: 12,
      paddingVertical: 16,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: isDarkMode ? 0.3 : 0.2,
      shadowRadius: 8,
      elevation: 5,
    },
    updateButtonDisabled: {
      backgroundColor: colors.neutral[300],
    },
    updateButtonText: {
      color: '#FFFFFF',
      fontSize: 18,
      fontWeight: '600',
    },
  });
