/**
 * OrganizationSettingsScreen.tsx
 * Edit organization details and configuration
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  TextInput,
  Alert,
  Switch,
  Share,
} from 'react-native';
import {useOrg, useTheme, useLanguage} from '@/context';
import {CommissionMode} from '@/types';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import {useThemedStyles} from '@/hooks/useThemedStyles';
import {ThemeColors} from '@/constants/theme';

// ============================================================================
// COMPONENT
// ============================================================================

export default function OrganizationSettingsScreen({navigation}: any): React.ReactElement {
  const {currentOrg, updateOrg, deleteOrg} = useOrg();
  const {colors, isDarkMode} = useTheme();
  const {language, t} = useLanguage();
  const styles = useThemedStyles(getStyles);

  // Form state
  const [orgName, setOrgName] = useState(currentOrg?.name || '');
  const [timezone, setTimezone] = useState(currentOrg?.timezone || 'Asia/Dhaka');
  const [currency, setCurrency] = useState(currentOrg?.currency || 'BDT');
  const [commissionMode, setCommissionMode] = useState<CommissionMode>(
    currentOrg?.defaultCommissionMode || CommissionMode.PERCENTAGE,
  );
  const [autoBackup, setAutoBackup] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [_generatingCode, setGeneratingCode] = useState(false);

  // Organization code from Firestore
  const orgCode = currentOrg?.inviteCode || 'LOADING...';

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleOrgNameChange = (value: string) => {
    setOrgName(value);
    setIsDirty(true);
  };

  const handleTimezoneChange = () => {
    Alert.alert(
      language === 'en'
        ? 'Select Timezone'
        : language === 'bn'
          ? 'টাইমজোন নির্বাচন করুন'
          : language === 'es'
            ? 'Seleccionar Zona Horaria'
            : 'समय क्षेत्र चुनें',
      language === 'en'
        ? 'Choose your timezone'
        : language === 'bn'
          ? 'আপনার টাইমজোন বেছে নিন'
          : language === 'es'
            ? 'Elija su zona horaria'
            : 'अपना समय क्षेत्र चुनें',
      [
        {text: 'Asia/Dhaka', onPress: () => updateTimezone('Asia/Dhaka')},
        {text: 'Asia/Kolkata', onPress: () => updateTimezone('Asia/Kolkata')},
        {text: 'Asia/Karachi', onPress: () => updateTimezone('Asia/Karachi')},
        {text: 'UTC', onPress: () => updateTimezone('UTC')},
        {text: t.common.cancel, style: 'cancel'},
      ],
    );
  };

  const updateTimezone = (value: string) => {
    setTimezone(value);
    setIsDirty(true);
  };

  const handleCurrencyChange = () => {
    Alert.alert(
      language === 'en'
        ? 'Select Currency'
        : language === 'bn'
          ? 'মুদ্রা নির্বাচন করুন'
          : language === 'es'
            ? 'Seleccionar Moneda'
            : 'मुद्रा चुनें',
      language === 'en'
        ? 'Choose your currency'
        : language === 'bn'
          ? 'আপনার মুদ্রা বেছে নিন'
          : language === 'es'
            ? 'Elija su moneda'
            : 'अपनी मुद्रा चुनें',
      [
        {text: 'BDT (৳)', onPress: () => updateCurrency('BDT')},
        {text: 'INR (₹)', onPress: () => updateCurrency('INR')},
        {text: 'PKR (₨)', onPress: () => updateCurrency('PKR')},
        {text: 'USD ($)', onPress: () => updateCurrency('USD')},
        {text: t.common.cancel, style: 'cancel'},
      ],
    );
  };

  const updateCurrency = (value: string) => {
    setCurrency(value);
    setIsDirty(true);
  };

  const handleAutoBackupToggle = () => {
    setAutoBackup(!autoBackup);
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!orgName.trim()) {
      Alert.alert(
        t.common.error,
        language === 'en'
          ? 'Organization name is required'
          : language === 'bn'
            ? 'প্রতিষ্ঠানের নাম আবশ্যক'
            : language === 'es'
              ? 'El nombre de la organización es obligatorio'
              : 'संगठन का नाम आवश्यक है',
        [{text: t.common.done}],
      );
      return;
    }

    Alert.alert(
      language === 'en'
        ? 'Save Changes'
        : language === 'bn'
          ? 'পরিবর্তন সংরক্ষণ'
          : language === 'es'
            ? 'Guardar Cambios'
            : 'परिवर्तन सहेजें',
      language === 'en'
        ? 'Are you sure you want to update organization settings?'
        : language === 'bn'
          ? 'আপনি কি নিশ্চিত যে আপনি প্রতিষ্ঠানের সেটিংস আপডেট করতে চান?'
          : language === 'es'
            ? '¿Está seguro de que desea actualizar la configuración de la organización?'
            : 'क्या आप वाकई संगठन सेटिंग्स अपडेट करना चाहते हैं?',
      [
        {text: t.common.cancel, style: 'cancel'},
        {
          text: t.common.save,
          onPress: async () => {
            try {
              await updateOrg({
                name: orgName.trim(),
                timezone: timezone,
                currency: currency,
                defaultCommissionMode: commissionMode,
              });
              setIsDirty(false);
              Alert.alert(
                t.common.success,
                language === 'en'
                  ? 'Organization settings updated successfully!'
                  : language === 'bn'
                    ? 'প্রতিষ্ঠানের সেটিংস সফলভাবে আপডেট করা হয়েছে!'
                    : language === 'es'
                      ? '¡Configuración de la organización actualizada con éxito!'
                      : 'संगठन सेटिंग्स सफलतापूर्वक अपडेट की गईं!',
                [
                  {
                    text: t.common.done,
                    onPress: () => navigation.goBack(),
                  },
                ],
              );
            } catch (err: any) {
              Alert.alert(t.common.error, err.message || 'Failed to update organization settings');
            }
          },
        },
      ],
    );
  };

  const handleCopyOrgCode = () => {
    Share.share({
      message:
        language === 'en'
          ? `Join my salon on CutBook! Use this code to join: ${orgCode}`
          : language === 'bn'
            ? `আমার সেলুনে যোগ দিন কাটবুকে! যোগ দিতে এই কোডটি ব্যবহার করুন: ${orgCode}`
            : language === 'es'
              ? `¡Únete a mi salón en CutBook! Usa este código para unirte: ${orgCode}`
              : `कटबुक पर मेरे सैलून में शामिल हों! शामिल होने के लिए इस कोड का उपयोग करें: ${orgCode}`,
      title: 'CutBook Organization Code',
      url: undefined,
    }).catch(err => {
      console.log('Share error:', err);
      Alert.alert(
        language === 'en'
          ? 'Code Ready to Share'
          : language === 'bn'
            ? 'শেয়ার করার জন্য কোড প্রস্তুত'
            : language === 'es'
              ? 'Código Listo para Compartir'
              : 'साझा करने के लिए कोड तैयार',
        language === 'en'
          ? `Organization code: ${orgCode}\n\nShare this code with employees to let them join your organization.`
          : language === 'bn'
            ? `প্রতিষ্ঠানের কোড: ${orgCode}\n\nকর্মীদের আপনার প্রতিষ্ঠানে যোগ দিতে এই কোডটি শেয়ার করুন।`
            : language === 'es'
              ? `Código de organización: ${orgCode}\n\nComparta este código con los empleados para permitirles unirse a su organización.`
              : `संगठन कोड: ${orgCode}\n\nकर्मचारियों को अपने संगठन में शामिल होने देने के लिए इस कोड को उनके साथ साझा करें।`,
        [{text: t.common.done}],
      );
    });
  };

  const handleGenerateNewCode = () => {
    Alert.alert(
      language === 'en'
        ? 'Generate New Code'
        : language === 'bn'
          ? 'নতুন কোড তৈরি করুন'
          : language === 'es'
            ? 'Generar Nuevo Código'
            : 'नया कोड जनरेट करें',
      language === 'en'
        ? 'Are you sure you want to generate a new organization code?\n\nThe old code will no longer work for new employees.'
        : language === 'bn'
          ? 'আপনি কি নিশ্চিত যে আপনি একটি নতুন প্রতিষ্ঠানের কোড তৈরি করতে চান?\n\nপুরানো কোডটি আর নতুন কর্মীদের জন্য কাজ করবে না।'
          : language === 'es'
            ? '¿Está seguro de que desea generar un nuevo código de organización?\n\nEl código antiguo ya no funcionará para los nuevos empleados.'
            : 'क्या आप वाकई एक नया संगठन कोड जनरेट करना चाहते हैं?\n\nपुराना कोड अब नए कर्मचारियों के लिए काम नहीं करेगा।',
      [
        {text: t.common.cancel, style: 'cancel'},
        {
          text:
            language === 'en'
              ? 'Generate'
              : language === 'bn'
                ? 'তৈরি করুন'
                : language === 'es'
                  ? 'Generar'
                  : 'उत्पन्न करें',
          style: 'destructive',
          onPress: async () => {
            try {
              setGeneratingCode(true);

              // Generate new 6-character uppercase code
              const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
              let newCode = '';
              for (let i = 0; i < 6; i++) {
                newCode += chars.charAt(Math.floor(Math.random() * chars.length));
              }

              // Update organization in Firestore
              await updateOrg({inviteCode: newCode});

              Alert.alert(
                language === 'en'
                  ? 'New Code Generated'
                  : language === 'bn'
                    ? 'নতুন কোড তৈরি হয়েছে'
                    : language === 'es'
                      ? 'Nuevo Código Generado'
                      : 'नया कोड जनरेट किया गया',
                language === 'en'
                  ? `New organization code: ${newCode}\n\nShare this with new employees.`
                  : language === 'bn'
                    ? `নতুন প্রতিষ্ঠানের কোড: ${newCode}\n\nএটি নতুন কর্মীদের সাথে শেয়ার করুন।`
                    : language === 'es'
                      ? `Nuevo código de organización: ${newCode}\n\nComparta esto con los nuevos empleados.`
                      : `नया संगठन कोड: ${newCode}\n\nइसे नए कर्मचारियों के साथ साझा करें।`,
                [{text: t.common.done}],
              );
            } catch (err: any) {
              console.error('Error generating new code:', err);
              Alert.alert(t.common.error, err.message || 'Failed to generate new code');
            } finally {
              setGeneratingCode(false);
            }
          },
        },
      ],
    );
  };

  const handleDeleteOrganization = () => {
    Alert.alert(
      language === 'en'
        ? '⚠️ Delete Organization'
        : language === 'bn'
          ? '⚠️ প্রতিষ্ঠান মুছুন'
          : language === 'es'
            ? '⚠️ Eliminar Organización'
            : '⚠️ संगठन हटाएं',
      language === 'en'
        ? 'This action cannot be undone!\n\nAll data including employees, services, and work entries will be permanently deleted.'
        : language === 'bn'
          ? 'এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না!\n\nকর্মী, সেবা এবং কাজের এন্ট্রি সহ সমস্ত ডেটা স্থায়ীভাবে মুছে ফেলা হবে।'
          : language === 'es'
            ? '¡Esta acción no se puede deshacer!\n\nTodos los datos, incluidos los empleados, los servicios y las entradas de trabajo, se eliminarán permanentemente.'
            : 'यह कार्रवाई पूर्ववत नहीं की जा सकती!\n\nकर्मचारियों, सेवाओं और कार्य प्रविष्टियों सहित सभी डेटा स्थायी रूप से हटा दिए जाएंगे।',
      [
        {text: t.common.cancel, style: 'cancel'},
        {
          text: t.common.delete,
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              language === 'en'
                ? 'Final Confirmation'
                : language === 'bn'
                  ? 'চূড়ান্ত নিশ্চিতকরণ'
                  : language === 'es'
                    ? 'Confirmación Final'
                    : 'अंतिम पुष्टि',
              language === 'en'
                ? 'Are you absolutely sure you want to permanently delete your organization and all data?'
                : language === 'bn'
                  ? 'আপনি কি নিশ্চিত যে আপনি আপনার প্রতিষ্ঠান এবং সমস্ত ডেটা স্থায়ীভাবে মুছে ফেলতে চান?'
                  : language === 'es'
                    ? '¿Está seguro de que desea eliminar permanentemente su organización y todos los datos?'
                    : 'क्या आप वाकई अपने संगठन और सभी डेटा को स्थायी रूप से हटाना चाहते हैं?',
              [
                {text: t.common.cancel, style: 'cancel'},
                {
                  text:
                    language === 'en'
                      ? 'I Understand, Delete'
                      : language === 'bn'
                        ? 'আমি বুঝতে পেরেছি, মুছুন'
                        : language === 'es'
                          ? 'Entiendo, eliminar'
                          : 'मैं समझता हूँ, हटाएँ',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await deleteOrg();
                      Alert.alert(
                        language === 'en'
                          ? 'Organization Deleted'
                          : language === 'bn'
                            ? 'প্রতিষ্ঠান মুছে ফেলা হয়েছে'
                            : language === 'es'
                              ? 'Organización Eliminada'
                              : 'संगठन हटा दिया गया',
                        language === 'en'
                          ? 'Your organization and all associated data have been permanently deleted.'
                          : language === 'bn'
                            ? 'আপনার প্রতিষ্ঠান এবং সমস্ত সংশ্লিষ্ট ডেটা স্থায়ীভাবে মুছে ফেলা হয়েছে।'
                            : language === 'es'
                              ? 'Su organización y todos los datos asociados han sido eliminados permanentemente.'
                              : 'आपका संगठन और सभी संबद्ध डेटा स्थायी रूप से हटा दिए गए हैं।',
                        [{text: t.common.done}],
                      );
                    } catch (err: any) {
                      Alert.alert(
                        t.common.error,
                        err.message ||
                          (language === 'en'
                            ? 'Failed to delete organization. Please try again.'
                            : language === 'bn'
                              ? 'প্রতিষ্ঠান মুছতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।'
                              : language === 'es'
                                ? 'Error al eliminar la organización. Por favor intente de nuevo.'
                                : 'संगठन हटाने में विफल। कृपया पुनः प्रयास करें।'),
                      );
                    }
                  },
                },
              ],
            );
          },
        },
      ],
    );
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

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" style={styles.backIcon} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t.settings.organizationSettings}</Text>
        {isDirty && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>{t.common.save}</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'en'
              ? 'Basic Information'
              : language === 'bn'
                ? 'সাধারণ তথ্য'
                : language === 'es'
                  ? 'Información Básica'
                  : 'बुनियादी जानकारी'}
          </Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>{t.organization.orgName} *</Text>
            <TextInput
              style={styles.input}
              value={orgName}
              onChangeText={handleOrgNameChange}
              placeholder={
                language === 'en'
                  ? 'Enter organization name'
                  : language === 'bn'
                    ? 'প্রতিষ্ঠানের নাম লিখুন'
                    : language === 'es'
                      ? 'Ingrese el nombre de la organización'
                      : 'संगठन का नाम दर्ज करें'
              }
              placeholderTextColor={colors.text.hint}
            />
          </View>

          <TouchableOpacity style={styles.selectButton} onPress={handleTimezoneChange}>
            <View style={styles.selectLeft}>
              <Text style={styles.selectLabel}>{t.organization.timezone}</Text>
              <Text style={styles.selectValue}>{timezone}</Text>
            </View>
            <Text style={styles.selectArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.selectButton} onPress={handleCurrencyChange}>
            <View style={styles.selectLeft}>
              <Text style={styles.selectLabel}>{t.organization.currency}</Text>
              <Text style={styles.selectValue}>{currency}</Text>
            </View>
            <Text style={styles.selectArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Commission Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'en'
              ? '💰 Commission Settings'
              : language === 'bn'
                ? '💰 কমিশন সেটিংস'
                : language === 'es'
                  ? '💰 Configuración de Comisión'
                  : '💰 कमीशन सेटिंग्स'}
          </Text>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>{t.organization.commissionMode}</Text>
                <Text style={styles.cardSubtitle}>
                  {language === 'en'
                    ? 'How commissions are calculated for new employees'
                    : language === 'bn'
                      ? 'নতুন কর্মীদের কমিশন কীভাবে হিসাব করা হয়'
                      : language === 'es'
                        ? 'Cómo se calculan las comisiones para los nuevos empleados'
                        : 'नए कर्मचारियों के लिए कमीशन की गणना कैसे की जाती है'}
                </Text>
              </View>
            </View>

            <View style={styles.commissionToggle}>
              <TouchableOpacity
                style={[
                  styles.commissionOption,
                  commissionMode === CommissionMode.PERCENTAGE && styles.commissionOptionActive,
                ]}
                onPress={() => {
                  setCommissionMode(CommissionMode.PERCENTAGE);
                  setIsDirty(true);
                }}>
                <Text
                  style={[
                    styles.commissionOptionText,
                    commissionMode === CommissionMode.PERCENTAGE &&
                      styles.commissionOptionTextActive,
                  ]}>
                  {language === 'en'
                    ? 'Percentage (%)'
                    : language === 'bn'
                      ? 'শতাংশ (%)'
                      : language === 'es'
                        ? 'Porcentaje (%)'
                        : 'प्रतिशत (%)'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.commissionOption,
                  commissionMode === CommissionMode.FIXED && styles.commissionOptionActive,
                ]}
                onPress={() => {
                  setCommissionMode(CommissionMode.FIXED);
                  setIsDirty(true);
                }}>
                <Text
                  style={[
                    styles.commissionOptionText,
                    commissionMode === CommissionMode.FIXED && styles.commissionOptionTextActive,
                  ]}>
                  {language === 'en'
                    ? 'Fixed Amount (৳)'
                    : language === 'bn'
                      ? 'নির্দিষ্ট পরিমাণ (৳)'
                      : language === 'es'
                        ? 'Cantidad Fija (৳)'
                        : 'निश्चित राशि (৳)'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoBoxText}>
                {commissionMode === CommissionMode.PERCENTAGE
                  ? language === 'en'
                    ? '💡 Employees earn a percentage of each service (e.g., 30% of ৳500 = ৳150)'
                    : language === 'bn'
                      ? '💡 কর্মীরা প্রতিটি সেবার একটি নির্দিষ্ট শতাংশ উপার্জন করে (যেমন, ৫০০ ৳ এর ৩০% = ১৫০ ৳)'
                      : language === 'es'
                        ? '💡 Los empleados ganan un porcentaje de cada servicio (por ejemplo, 30% de ৳500 = ৳150)'
                        : '💡 कर्मचारी प्रत्येक सेवा का एक प्रतिशत कमाते हैं (जैसे, ৳500 का 30% = ৳150)'
                  : language === 'en'
                    ? '💡 Employees earn a fixed amount per service (e.g., ৳100 per service)'
                    : language === 'bn'
                      ? '💡 কর্মীরা প্রতি সেবায় একটি নির্দিষ্ট পরিমাণ উপার্জন করে (যেমন, প্রতি সেবায় ১০০ ৳)'
                      : language === 'es'
                        ? '💡 Los empleados ganan una cantidad fija por servicio (por ejemplo, ৳100 por servicio)'
                        : '💡 कर्मचारी प्रति सेवा एक निश्चित राशि कमाते हैं (जैसे, प्रति सेवा ৳100)'}
              </Text>
            </View>
          </View>
        </View>

        {/* Organization Code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'en'
              ? '🔑 Organization Code'
              : language === 'bn'
                ? '🔑 প্রতিষ্ঠানের কোড'
                : language === 'es'
                  ? '🔑 Código de Organización'
                  : '🔑 संगठन कोड'}
          </Text>

          <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>
              {language === 'en'
                ? 'Share this code with employees'
                : language === 'bn'
                  ? 'কর্মীদের সাথে এই কোডটি শেয়ার করুন'
                  : language === 'es'
                    ? 'Comparta este código con los empleados'
                    : 'कर्मचारियों के साथ यह कोड साझा करें'}
            </Text>
            <View style={styles.codeDisplay}>
              <Text style={styles.codeText}>{orgCode}</Text>
            </View>

            <View style={styles.codeActions}>
              <TouchableOpacity style={styles.codeButton} onPress={handleCopyOrgCode}>
                <Text style={styles.codeButtonText}>
                  {language === 'en'
                    ? '📋 Copy Code'
                    : language === 'bn'
                      ? '📋 কোড কপি করুন'
                      : language === 'es'
                        ? '📋 Copiar Código'
                        : '📋 कोड कॉपी करें'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.codeButton, styles.codeButtonSecondary]}
                onPress={handleGenerateNewCode}>
                <Text style={styles.codeButtonSecondaryText}>
                  {language === 'en'
                    ? '🔄 Generate New'
                    : language === 'bn'
                      ? '🔄 নতুন তৈরি করুন'
                      : language === 'es'
                        ? '🔄 Generar Nuevo'
                        : '🔄 नया उत्पन्न करें'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoBoxText}>
                {language === 'en'
                  ? 'Employees need this code to join your organization during registration.'
                  : language === 'bn'
                    ? 'কর্মীদের নিবন্ধনের সময় আপনার প্রতিষ্ঠানে যোগদানের জন্য এই কোডটি প্রয়োজন।'
                    : language === 'es'
                      ? 'Los empleados necesitan este código para unirse a su organización durante el registro.'
                      : 'कर्मचारियों को पंजीकरण के दौरान आपके संगठन में शामिल होने के लिए इस कोड की आवश्यकता होती है।'}
              </Text>
            </View>
          </View>
        </View>

        {/* Advanced Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'en'
              ? '⚙️ Advanced Settings'
              : language === 'bn'
                ? '⚙️ উন্নত সেটিংস'
                : language === 'es'
                  ? '⚙️ Configuración Avanzada'
                  : '⚙️ उन्नत सेटिंग्स'}
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingTitle}>
                {language === 'en'
                  ? 'Auto Backup'
                  : language === 'bn'
                    ? 'স্বয়ংক্রিয় ব্যাকআপ'
                    : language === 'es'
                      ? 'Copia de Seguridad Automática'
                      : 'ऑटो बैकअप'}
              </Text>
              <Text style={styles.settingSubtitle}>
                {language === 'en'
                  ? 'Automatically backup data daily'
                  : language === 'bn'
                    ? 'প্রতিদিন স্বয়ংক্রিয়ভাবে ডেটা ব্যাকআপ করুন'
                    : language === 'es'
                      ? 'Realizar copia de seguridad automáticamente todos los días'
                      : 'दैनिक रूप से स्वचालित रूप से डेटा बैकअप करें'}
              </Text>
            </View>
            <Switch
              value={autoBackup}
              onValueChange={handleAutoBackupToggle}
              trackColor={{false: colors.border.main, true: colors.success.light}}
              thumbColor={autoBackup ? colors.success.main : colors.neutral[400]}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {language === 'en'
              ? '⚠️ Danger Zone'
              : language === 'bn'
                ? '⚠️ ঝুঁকিপূর্ণ অঞ্চল'
                : language === 'es'
                  ? '⚠️ Zona de Peligro'
                  : '⚠️ खतरा क्षेत्र'}
          </Text>

          <View style={styles.dangerCard}>
            <Text style={styles.dangerTitle}>
              {language === 'en'
                ? 'Delete Organization'
                : language === 'bn'
                  ? 'প্রতিষ্ঠান মুছুন'
                  : language === 'es'
                    ? 'Eliminar Organización'
                    : 'संगठन हटाएं'}
            </Text>
            <Text style={styles.dangerText}>
              {language === 'en'
                ? 'Permanently delete your organization and all associated data. This action cannot be undone.'
                : language === 'bn'
                  ? 'স্থায়ীভাবে আপনার প্রতিষ্ঠান এবং সমস্ত সংশ্লিষ্ট ডেটা মুছে ফেলুন। এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।'
                  : language === 'es'
                    ? 'Elimine permanentemente su organización y todos los datos asociados. Esta acción no se puede deshacer.'
                    : 'अपने संगठन और सभी संबद्ध डेटा को स्थायी रूप से हटाएं। यह कार्रवाई पूर्ववत नहीं की जा सकती।'}
            </Text>
            <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteOrganization}>
              <Text style={styles.dangerButtonText}>
                {language === 'en'
                  ? 'Delete Organization'
                  : language === 'bn'
                    ? 'প্রতিষ্ঠান মুছুন'
                    : language === 'es'
                      ? 'Eliminar Organización'
                      : 'संगठन हटाएं'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button (Fixed at bottom when dirty) */}
        {isDirty && (
          <View style={styles.section}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
              <Text style={styles.primaryButtonText}>
                {language === 'en'
                  ? '💾 Save Changes'
                  : language === 'bn'
                    ? '💾 পরিবর্তন সংরক্ষণ করুন'
                    : language === 'es'
                      ? '💾 Guardar Cambios'
                      : '💾 परिवर्तन सहेजें'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
    header: {
      backgroundColor: colors.background.paper,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    backButton: {
      paddingVertical: 8,
      paddingRight: 16,
    },
    backIcon: {
      color: colors.text.primary,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text.primary,
      flex: 1,
    },
    saveButton: {
      backgroundColor: colors.success.main,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
    },
    saveButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 24,
    },
    section: {
      paddingHorizontal: 16,
      marginTop: 24,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: 12,
    },
    formGroup: {
      marginBottom: 16,
    },
    label: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 8,
    },
    input: {
      backgroundColor: colors.background.paper,
      borderRadius: 12,
      padding: 16,
      fontSize: 16,
      color: colors.text.primary,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    selectButton: {
      backgroundColor: colors.background.paper,
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    selectLeft: {
      flex: 1,
    },
    selectLabel: {
      fontSize: 13,
      color: colors.text.secondary,
      marginBottom: 4,
    },
    selectValue: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
    },
    selectArrow: {
      fontSize: 20,
      color: colors.text.hint,
    },
    card: {
      backgroundColor: colors.background.paper,
      borderRadius: 12,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    cardHeader: {
      marginBottom: 16,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 4,
    },
    cardSubtitle: {
      fontSize: 13,
      color: colors.text.secondary,
    },
    commissionToggle: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    commissionOption: {
      flex: 1,
      backgroundColor: colors.background.default,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    commissionOptionActive: {
      backgroundColor: isDarkMode ? colors.neutral[100] : colors.primary[50],
      borderColor: colors.primary[500],
    },
    commissionOptionText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.secondary,
    },
    commissionOptionTextActive: {
      color: colors.primary[500],
    },
    codeCard: {
      backgroundColor: isDarkMode ? colors.background.paper : '#E8F5E9',
      borderRadius: 12,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.success.main,
    },
    codeLabel: {
      fontSize: 14,
      color: isDarkMode ? colors.text.primary : '#2E7D32',
      marginBottom: 12,
      textAlign: 'center',
    },
    codeDisplay: {
      backgroundColor: colors.background.default,
      borderRadius: 8,
      paddingVertical: 20,
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    codeText: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.success.main,
      letterSpacing: 4,
    },
    codeActions: {
      flexDirection: 'row',
      gap: 12,
      marginBottom: 16,
    },
    codeButton: {
      flex: 1,
      backgroundColor: colors.success.main,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
    },
    codeButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    codeButtonSecondary: {
      backgroundColor: colors.background.paper,
      borderWidth: 1,
      borderColor: colors.success.main,
    },
    codeButtonSecondaryText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.success.main,
    },
    infoBox: {
      backgroundColor: colors.background.default,
      borderRadius: 8,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    infoBoxText: {
      fontSize: 13,
      color: colors.text.secondary,
      lineHeight: 20,
    },
    settingRow: {
      backgroundColor: colors.background.paper,
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    settingLeft: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 2,
    },
    settingSubtitle: {
      fontSize: 13,
      color: colors.text.secondary,
    },
    dangerCard: {
      backgroundColor: isDarkMode ? colors.background.paper : '#FFEBEE',
      borderRadius: 12,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.error.main,
    },
    dangerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: isDarkMode ? colors.error.main : '#C62828',
      marginBottom: 8,
    },
    dangerText: {
      fontSize: 14,
      color: colors.error.main,
      lineHeight: 20,
      marginBottom: 16,
    },
    dangerButton: {
      backgroundColor: colors.error.main,
      borderRadius: 8,
      paddingVertical: 12,
      alignItems: 'center',
    },
    dangerButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    primaryButton: {
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
    primaryButtonText: {
      fontSize: 18,
      fontWeight: '600',
      color: '#FFFFFF',
    },
  });
