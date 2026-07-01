/**
 * OrganizationSettingsScreen.tsx
 * Edit organization details and configuration – fully backend-connected
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
  ActivityIndicator,
} from 'react-native';
import {useOrg, useTheme, useLanguage} from '@/context';
import {CommissionMode} from '@/types';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import {useThemedStyles} from '@/hooks/useThemedStyles';
import {ThemeColors} from '@/constants/theme';

// ============================================================================
// COMMISSION MODE CONFIG
// ============================================================================

const getModeConfig = (language: string) => [
  {
    mode: CommissionMode.PERCENTAGE,
    icon: 'percent' as const,
    label:
      language === 'en'
        ? 'Percentage'
        : language === 'bn'
          ? 'শতাংশ'
          : language === 'es'
            ? 'Porcentaje'
            : 'प्रतिशत',
    unit: '%',
    description:
      language === 'en'
        ? 'Employees earn a % of each service price. e.g. 30% of ৳500 = ৳150'
        : language === 'bn'
          ? 'কর্মীরা প্রতিটি সেবার মূল্যের একটি % উপার্জন করে। যেমন, ৫০০৳ এর ৩০% = ১৫০৳'
          : language === 'es'
            ? 'Los empleados ganan un % del precio de cada servicio. p.ej. 30% de ৳500 = ৳150'
            : 'कर्मचारी प्रत्येक सेवा मूल्य का एक % कमाते हैं। जैसे ৳500 का 30% = ৳150',
    accentColor: '#3B82F6',
  },
  {
    mode: CommissionMode.FIXED,
    icon: 'attach-money' as const,
    label:
      language === 'en'
        ? 'Fixed Amount'
        : language === 'bn'
          ? 'নির্দিষ্ট পরিমাণ'
          : language === 'es'
            ? 'Monto Fijo'
            : 'निश्चित राशि',
    unit: '৳',
    description:
      language === 'en'
        ? 'Employees earn a fixed ৳ per service. e.g. ৳100 per haircut regardless of price'
        : language === 'bn'
          ? 'কর্মীরা প্রতি সেবায় নির্দিষ্ট ৳ পাবে। যেমন, প্রতিটি কাটে ১০০৳ মূল্য নির্বিশেষে'
          : language === 'es'
            ? 'Los empleados ganan ৳ fijo por servicio. p.ej. ৳100 por corte de precio'
            : 'कर्मचारी प्रति सेवा एक निश्चित ৳ कमाते हैं। जैसे ৳100 प्रति हेयरकट मूल्य की परवाह किए बिना',
    accentColor: '#10B981',
  },
  {
    mode: CommissionMode.SALARY,
    icon: 'account-balance-wallet' as const,
    label:
      language === 'en'
        ? 'Monthly Salary'
        : language === 'bn'
          ? 'মাসিক বেতন'
          : language === 'es'
            ? 'Salario Mensual'
            : 'मासिक वेतन',
    unit: '৳/mo',
    description:
      language === 'en'
        ? 'Employees receive a fixed monthly salary regardless of service count. Tips are theirs to keep.'
        : language === 'bn'
          ? 'কর্মীরা সেবা সংখ্যা নির্বিশেষে নির্দিষ্ট মাসিক বেতন পান। টিপস তাদের নিজেদের।'
          : language === 'es'
            ? 'Los empleados reciben un salario mensual fijo independientemente de los servicios. Las propinas son suyas.'
            : 'कर्मचारी सेवा संख्या की परवाह किए बिना एक निश्चित मासिक वेतन प्राप्त करते हैं। टिप्स उनके हैं।',
    accentColor: '#8B5CF6',
  },
];

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
    (currentOrg?.defaultCommissionMode as CommissionMode) || CommissionMode.PERCENTAGE,
  );
  const [autoBackup, setAutoBackup] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [saving, setSaving] = useState(false);

  const orgCode = currentOrg?.inviteCode || '------';
  const modeConfigs = getModeConfig(language);
  const selectedModeConfig = modeConfigs.find(c => c.mode === commissionMode);

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
          ? 'টাইমজোন নির্বাচন'
          : language === 'es'
            ? 'Zona Horaria'
            : 'समय क्षेत्र',
      '',
      [
        {
          text: 'Asia/Dhaka',
          onPress: () => {
            setTimezone('Asia/Dhaka');
            setIsDirty(true);
          },
        },
        {
          text: 'Asia/Kolkata',
          onPress: () => {
            setTimezone('Asia/Kolkata');
            setIsDirty(true);
          },
        },
        {
          text: 'Asia/Karachi',
          onPress: () => {
            setTimezone('Asia/Karachi');
            setIsDirty(true);
          },
        },
        {
          text: 'UTC',
          onPress: () => {
            setTimezone('UTC');
            setIsDirty(true);
          },
        },
        {text: t.common.cancel, style: 'cancel'},
      ],
    );
  };

  const handleCurrencyChange = () => {
    Alert.alert(
      language === 'en'
        ? 'Select Currency'
        : language === 'bn'
          ? 'মুদ্রা নির্বাচন'
          : language === 'es'
            ? 'Moneda'
            : 'मुद्रा',
      '',
      [
        {
          text: 'BDT (৳)',
          onPress: () => {
            setCurrency('BDT');
            setIsDirty(true);
          },
        },
        {
          text: 'INR (₹)',
          onPress: () => {
            setCurrency('INR');
            setIsDirty(true);
          },
        },
        {
          text: 'PKR (₨)',
          onPress: () => {
            setCurrency('PKR');
            setIsDirty(true);
          },
        },
        {
          text: 'USD ($)',
          onPress: () => {
            setCurrency('USD');
            setIsDirty(true);
          },
        },
        {text: t.common.cancel, style: 'cancel'},
      ],
    );
  };

  const handleCommissionModeChange = (mode: CommissionMode) => {
    if (mode === commissionMode) return;

    const modeLabel = modeConfigs.find(c => c.mode === mode)?.label || mode;
    Alert.alert(
      language === 'en'
        ? 'Change Commission Mode?'
        : language === 'bn'
          ? 'কমিশন মোড পরিবর্তন?'
          : language === 'es'
            ? '¿Cambiar modo?'
            : 'मोड बदलें?',
      language === 'en'
        ? `Switch to "${modeLabel}" mode? All new employees will default to this mode. Existing employees keep their current settings.`
        : language === 'bn'
          ? `"${modeLabel}" মোডে পরিবর্তন করবেন? নতুন কর্মীরা এই মোডে ডিফল্ট হবে। বিদ্যমান কর্মীরা তাদের বর্তমান সেটিংস রাখবে।`
          : language === 'es'
            ? `¿Cambiar al modo "${modeLabel}"? Los nuevos empleados usarán este modo por defecto.`
            : `"${modeLabel}" मोड में स्विच करें? नए कर्मचारी इस मोड में डिफ़ॉल्ट होंगे।`,
      [
        {text: t.common.cancel, style: 'cancel'},
        {
          text:
            language === 'en'
              ? 'Switch'
              : language === 'bn'
                ? 'পরিবর্তন করুন'
                : language === 'es'
                  ? 'Cambiar'
                  : 'बदलें',
          onPress: () => {
            setCommissionMode(mode);
            setIsDirty(true);
          },
        },
      ],
    );
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
              ? 'Nombre requerido'
              : 'नाम आवश्यक है',
      );
      return;
    }

    setSaving(true);
    try {
      await updateOrg({
        name: orgName.trim(),
        timezone,
        currency,
        defaultCommissionMode: commissionMode,
      });
      setIsDirty(false);
      Alert.alert(
        t.common.success,
        language === 'en'
          ? '✅ Organization settings saved successfully!'
          : language === 'bn'
            ? '✅ প্রতিষ্ঠানের সেটিংস সফলভাবে সংরক্ষিত!'
            : language === 'es'
              ? '✅ ¡Configuración guardada!'
              : '✅ सेटिंग्स सफलतापूर्वक सहेजी गईं!',
        [{text: t.common.done, onPress: () => navigation.goBack()}],
      );
    } catch (err: any) {
      Alert.alert(t.common.error, err.message || 'Failed to update organization settings');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyOrgCode = () => {
    Share.share({
      message:
        language === 'en'
          ? `Join my salon on CutBook! Use this code: ${orgCode}`
          : language === 'bn'
            ? `আমার সেলুনে যোগ দিন CutBook-এ! কোড: ${orgCode}`
            : language === 'es'
              ? `¡Únete a mi salón en CutBook! Código: ${orgCode}`
              : `CutBook पर मेरे सैलून से जुड़ें! कोड: ${orgCode}`,
      title: 'CutBook Organization Code',
      url: undefined,
    }).catch(() => {
      Alert.alert(
        language === 'en'
          ? 'Organization Code'
          : language === 'bn'
            ? 'প্রতিষ্ঠানের কোড'
            : language === 'es'
              ? 'Código'
              : 'कोड',
        `${orgCode}`,
        [{text: t.common.done}],
      );
    });
  };

  const handleGenerateNewCode = () => {
    Alert.alert(
      language === 'en'
        ? 'Generate New Code?'
        : language === 'bn'
          ? 'নতুন কোড?'
          : language === 'es'
            ? '¿Nuevo código?'
            : 'नया कोड?',
      language === 'en'
        ? 'The old code will stop working. Employees already joined are unaffected.'
        : language === 'bn'
          ? 'পুরানো কোড কাজ করবে না। ইতিমধ্যে যোগদানকারী কর্মীরা প্রভাবিত হবে না।'
          : language === 'es'
            ? 'El código antiguo dejará de funcionar. Los empleados ya unidos no se verán afectados.'
            : 'पुराना कोड काम करना बंद कर देगा। पहले से जुड़े कर्मचारी प्रभावित नहीं होंगे।',
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
            setSaving(true);
            try {
              const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
              let newCode = '';
              for (let i = 0; i < 6; i++) {
                newCode += chars.charAt(Math.floor(Math.random() * chars.length));
              }
              await updateOrg({inviteCode: newCode});
              Alert.alert(
                language === 'en'
                  ? 'New Code Generated'
                  : language === 'bn'
                    ? 'নতুন কোড তৈরি'
                    : language === 'es'
                      ? 'Nuevo código'
                      : 'नया कोड',
                `${newCode}`,
                [{text: t.common.done}],
              );
            } catch (err: any) {
              Alert.alert(t.common.error, err.message || 'Failed to generate new code');
            } finally {
              setSaving(false);
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
            ? '⚠️ Eliminar'
            : '⚠️ हटाएं',
      language === 'en'
        ? 'This will permanently delete ALL data: employees, services, entries. This cannot be undone.'
        : language === 'bn'
          ? 'এটি সমস্ত ডেটা স্থায়ীভাবে মুছে ফেলবে। এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।'
          : language === 'es'
            ? 'Esto eliminará permanentemente todos los datos. Esta acción no se puede deshacer.'
            : 'यह सभी डेटा स्थायी रूप से हटा देगा। यह पूर्ववत नहीं किया जा सकता।',
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
                    ? 'Confirmación final'
                    : 'अंतिम पुष्टि',
              language === 'en'
                ? 'Are you absolutely sure?'
                : language === 'bn'
                  ? 'আপনি কি সত্যিই নিশ্চিত?'
                  : language === 'es'
                    ? '¿Está absolutamente seguro?'
                    : 'क्या आप पूरी तरह सुनिश्चित हैं?',
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
                  onPress: async () => {
                    setSaving(true);
                    try {
                      await deleteOrg();
                    } catch (err: any) {
                      Alert.alert(t.common.error, err.message || 'Failed to delete');
                      setSaving(false);
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
          <MaterialIcons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{t.settings.organizationSettings}</Text>
          {currentOrg?.name ? <Text style={styles.headerSubtitle}>{currentOrg.name}</Text> : null}
        </View>
        {saving ? (
          <ActivityIndicator
            size="small"
            color={colors.primary[500]}
            style={{paddingHorizontal: 8}}
          />
        ) : isDirty ? (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <MaterialIcons name="check" size={18} color="#fff" />
            <Text style={styles.saveButtonText}>{t.common.save}</Text>
          </TouchableOpacity>
        ) : (
          <View style={{width: 70}} />
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* ── Basic Information ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="business" size={18} color={colors.primary[500]} />
            <Text style={styles.sectionTitle}>
              {language === 'en'
                ? 'Basic Information'
                : language === 'bn'
                  ? 'সাধারণ তথ্য'
                  : language === 'es'
                    ? 'Información Básica'
                    : 'बुनियादी जानकारी'}
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                {t.organization.orgName} <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={orgName}
                onChangeText={handleOrgNameChange}
                placeholder={
                  language === 'en'
                    ? 'Enter salon name'
                    : language === 'bn'
                      ? 'সেলুনের নাম লিখুন'
                      : language === 'es'
                        ? 'Nombre del salón'
                        : 'सैलून का नाम'
                }
                placeholderTextColor={colors.text.hint}
                maxLength={60}
              />
            </View>

            <TouchableOpacity style={styles.selectRow} onPress={handleTimezoneChange}>
              <View style={styles.selectRowLeft}>
                <MaterialIcons
                  name="schedule"
                  size={20}
                  color={colors.text.secondary}
                  style={styles.selectRowIcon}
                />
                <View>
                  <Text style={styles.selectRowLabel}>{t.organization.timezone}</Text>
                  <Text style={styles.selectRowValue}>{timezone}</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={colors.text.hint} />
            </TouchableOpacity>

            <View style={styles.rowDivider} />

            <TouchableOpacity style={styles.selectRow} onPress={handleCurrencyChange}>
              <View style={styles.selectRowLeft}>
                <MaterialIcons
                  name="payments"
                  size={20}
                  color={colors.text.secondary}
                  style={styles.selectRowIcon}
                />
                <View>
                  <Text style={styles.selectRowLabel}>{t.organization.currency}</Text>
                  <Text style={styles.selectRowValue}>{currency}</Text>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={colors.text.hint} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Commission / Salary Mode ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="monetization-on" size={18} color="#10B981" />
            <Text style={styles.sectionTitle}>
              {language === 'en'
                ? 'Payment Mode'
                : language === 'bn'
                  ? 'পেমেন্ট মোড'
                  : language === 'es'
                    ? 'Modo de Pago'
                    : 'भुगतान मोड'}
            </Text>
          </View>

          <Text style={styles.sectionSubtitle}>
            {language === 'en'
              ? 'Choose how employees are compensated. This sets the default for new employees — existing employees can have individual overrides.'
              : language === 'bn'
                ? 'কর্মীদের পারিশ্রমিক কীভাবে দেওয়া হবে তা চয়ন করুন। এটি নতুন কর্মীদের ডিফল্ট সেট করে।'
                : language === 'es'
                  ? 'Elija cómo se compensa a los empleados. Este es el modo predeterminado para nuevos empleados.'
                  : 'कर्मचारियों को कैसे मुआवजा दिया जाए। यह नए कर्मचारियों के लिए डिफ़ॉल्ट सेट करता है।'}
          </Text>

          <View style={styles.modeGrid}>
            {modeConfigs.map(config => {
              const isActive = commissionMode === config.mode;
              return (
                <TouchableOpacity
                  key={config.mode}
                  style={[
                    styles.modeCard,
                    isActive && {
                      borderColor: config.accentColor,
                      backgroundColor: isDarkMode
                        ? config.accentColor + '22'
                        : config.accentColor + '12',
                    },
                  ]}
                  onPress={() => handleCommissionModeChange(config.mode)}
                  activeOpacity={0.75}>
                  {/* Active check */}
                  {isActive && (
                    <View style={[styles.modeCheckBadge, {backgroundColor: config.accentColor}]}>
                      <MaterialIcons name="check" size={12} color="#fff" />
                    </View>
                  )}

                  <View style={[styles.modeIconBg, {backgroundColor: config.accentColor + '20'}]}>
                    <MaterialIcons name={config.icon} size={26} color={config.accentColor} />
                  </View>

                  <Text style={[styles.modeLabel, isActive && {color: config.accentColor}]}>
                    {config.label}
                  </Text>
                  <Text style={styles.modeUnit}>{config.unit}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Description for selected mode */}
          {selectedModeConfig && (
            <View
              style={[styles.modeDescCard, {borderColor: selectedModeConfig.accentColor + '60'}]}>
              <View
                style={[styles.modeDescAccent, {backgroundColor: selectedModeConfig.accentColor}]}
              />
              <View style={styles.modeDescContent}>
                <Text style={[styles.modeDescTitle, {color: selectedModeConfig.accentColor}]}>
                  {selectedModeConfig.label}
                </Text>
                <Text style={styles.modeDescText}>{selectedModeConfig.description}</Text>
              </View>
            </View>
          )}
        </View>

        {/* ── Organization Code ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="vpn-key" size={18} color="#F59E0B" />
            <Text style={styles.sectionTitle}>
              {language === 'en'
                ? 'Organization Code'
                : language === 'bn'
                  ? 'প্রতিষ্ঠানের কোড'
                  : language === 'es'
                    ? 'Código de Organización'
                    : 'संगठन कोड'}
            </Text>
          </View>

          <View style={styles.codeCard}>
            <Text style={styles.codeHint}>
              {language === 'en'
                ? 'Share this code with employees to let them join'
                : language === 'bn'
                  ? 'কর্মীদের যোগদানের জন্য এই কোড শেয়ার করুন'
                  : language === 'es'
                    ? 'Comparte este código con empleados para unirse'
                    : 'कर्मचारियों को शामिल होने के लिए यह कोड साझा करें'}
            </Text>

            <View style={styles.codeDisplay}>
              {orgCode.split('').map((char, i) => (
                <View key={i} style={styles.codeCharBox}>
                  <Text style={styles.codeChar}>{char}</Text>
                </View>
              ))}
            </View>

            <View style={styles.codeActions}>
              <TouchableOpacity style={styles.codeBtn} onPress={handleCopyOrgCode}>
                <MaterialIcons name="share" size={18} color="#fff" />
                <Text style={styles.codeBtnText}>
                  {language === 'en'
                    ? 'Share'
                    : language === 'bn'
                      ? 'শেয়ার'
                      : language === 'es'
                        ? 'Compartir'
                        : 'साझा करें'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.codeBtn, styles.codeBtnOutline]}
                onPress={handleGenerateNewCode}>
                <MaterialIcons name="refresh" size={18} color="#F59E0B" />
                <Text style={[styles.codeBtnText, {color: '#F59E0B'}]}>
                  {language === 'en'
                    ? 'New Code'
                    : language === 'bn'
                      ? 'নতুন কোড'
                      : language === 'es'
                        ? 'Nuevo'
                        : 'नया कोड'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* ── Advanced Settings ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="settings" size={18} color={colors.text.secondary} />
            <Text style={styles.sectionTitle}>
              {language === 'en'
                ? 'Advanced Settings'
                : language === 'bn'
                  ? 'উন্নত সেটিংস'
                  : language === 'es'
                    ? 'Config. Avanzada'
                    : 'उन्नत सेटिंग्स'}
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.settingRow}>
              <View style={styles.settingLeft}>
                <MaterialIcons
                  name="backup"
                  size={20}
                  color={colors.text.secondary}
                  style={{marginRight: 12}}
                />
                <View>
                  <Text style={styles.settingTitle}>
                    {language === 'en'
                      ? 'Auto Backup'
                      : language === 'bn'
                        ? 'স্বয়ংক্রিয় ব্যাকআপ'
                        : language === 'es'
                          ? 'Copia Automática'
                          : 'ऑटो बैकअप'}
                  </Text>
                  <Text style={styles.settingSubtitle}>
                    {language === 'en'
                      ? 'Daily data backup to cloud'
                      : language === 'bn'
                        ? 'দৈনিক ক্লাউড ব্যাকআপ'
                        : language === 'es'
                          ? 'Copia diaria a la nube'
                          : 'दैनिक क्लाउड बैकअप'}
                  </Text>
                </View>
              </View>
              <Switch
                value={autoBackup}
                onValueChange={v => {
                  setAutoBackup(v);
                  setIsDirty(true);
                }}
                trackColor={{false: colors.border.main, true: colors.success.light}}
                thumbColor={autoBackup ? colors.success.main : colors.neutral[400]}
              />
            </View>
          </View>
        </View>

        {/* ── Save Button ── */}
        {isDirty && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.primaryButton, saving && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <MaterialIcons name="save" size={20} color="#fff" />
                  <Text style={styles.primaryButtonText}>
                    {language === 'en'
                      ? 'Save Changes'
                      : language === 'bn'
                        ? 'পরিবর্তন সংরক্ষণ'
                        : language === 'es'
                          ? 'Guardar Cambios'
                          : 'परिवर्तन सहेजें'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ── Danger Zone ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="warning" size={18} color={colors.error.main} />
            <Text style={[styles.sectionTitle, {color: colors.error.main}]}>
              {language === 'en'
                ? 'Danger Zone'
                : language === 'bn'
                  ? 'ঝুঁকিপূর্ণ অঞ্চল'
                  : language === 'es'
                    ? 'Zona de Peligro'
                    : 'खतरा क्षेत्र'}
            </Text>
          </View>

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
                ? 'Permanently delete your organization and all data. Cannot be undone.'
                : language === 'bn'
                  ? 'আপনার প্রতিষ্ঠান এবং সমস্ত ডেটা স্থায়ীভাবে মুছে ফেলুন। পূর্বাবস্থায় ফেরানো যাবে না।'
                  : language === 'es'
                    ? 'Elimine permanentemente su organización y todos los datos. No se puede deshacer.'
                    : 'अपने संगठन और सभी डेटा को स्थायी रूप से हटाएं। पूर्ववत नहीं किया जा सकता।'}
            </Text>
            <TouchableOpacity
              style={[styles.dangerButton, saving && styles.buttonDisabled]}
              onPress={handleDeleteOrganization}
              disabled={saving}>
              <MaterialIcons name="delete-forever" size={20} color="#fff" />
              <Text style={styles.dangerButtonText}>
                {language === 'en'
                  ? 'Delete Organization'
                  : language === 'bn'
                    ? 'প্রতিষ্ঠান মুছুন'
                    : language === 'es'
                      ? 'Eliminar'
                      : 'हटाएं'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={{height: 32}} />
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
    // ── Header ──
    header: {
      backgroundColor: colors.background.paper,
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: isDarkMode ? colors.neutral[800] : colors.neutral[100],
    },
    headerCenter: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 17,
      fontWeight: '700',
      color: colors.text.primary,
    },
    headerSubtitle: {
      fontSize: 12,
      color: colors.text.secondary,
      marginTop: 1,
    },
    saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.success.main,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 10,
    },
    saveButtonText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    // ── Scroll ──
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    // ── Sections ──
    section: {
      paddingHorizontal: 16,
      marginTop: 20,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 6,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text.primary,
    },
    sectionSubtitle: {
      fontSize: 13,
      color: colors.text.secondary,
      lineHeight: 19,
      marginBottom: 14,
    },
    // ── Card ──
    card: {
      backgroundColor: colors.background.paper,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.border.light,
      overflow: 'hidden',
    },
    formGroup: {
      padding: 16,
      paddingBottom: 8,
    },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: colors.text.secondary,
      marginBottom: 8,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    required: {
      color: colors.error.main,
    },
    input: {
      backgroundColor: colors.background.default,
      borderRadius: 10,
      padding: 14,
      fontSize: 16,
      color: colors.text.primary,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    selectRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
    },
    selectRowLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    selectRowIcon: {},
    selectRowLabel: {
      fontSize: 12,
      color: colors.text.secondary,
      marginBottom: 2,
    },
    selectRowValue: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text.primary,
    },
    rowDivider: {
      height: 1,
      backgroundColor: colors.border.light,
      marginHorizontal: 16,
    },
    // ── Commission Mode ──
    modeGrid: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 14,
    },
    modeCard: {
      flex: 1,
      backgroundColor: colors.background.paper,
      borderRadius: 14,
      borderWidth: 2,
      borderColor: colors.border.light,
      padding: 14,
      alignItems: 'center',
      gap: 8,
      position: 'relative',
    },
    modeCheckBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 20,
      height: 20,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modeIconBg: {
      width: 48,
      height: 48,
      borderRadius: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modeLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.text.primary,
      textAlign: 'center',
    },
    modeUnit: {
      fontSize: 11,
      color: colors.text.hint,
      fontWeight: '500',
    },
    modeDescCard: {
      flexDirection: 'row',
      backgroundColor: colors.background.paper,
      borderRadius: 12,
      borderWidth: 1,
      overflow: 'hidden',
    },
    modeDescAccent: {
      width: 4,
    },
    modeDescContent: {
      flex: 1,
      padding: 14,
    },
    modeDescTitle: {
      fontSize: 13,
      fontWeight: '700',
      marginBottom: 4,
    },
    modeDescText: {
      fontSize: 13,
      color: colors.text.secondary,
      lineHeight: 19,
    },
    // ── Org Code ──
    codeCard: {
      backgroundColor: isDarkMode ? colors.background.paper : '#FFFBEB',
      borderRadius: 14,
      padding: 20,
      borderWidth: 1,
      borderColor: '#F59E0B60',
      alignItems: 'center',
    },
    codeHint: {
      fontSize: 13,
      color: colors.text.secondary,
      marginBottom: 16,
      textAlign: 'center',
    },
    codeDisplay: {
      flexDirection: 'row',
      gap: 8,
      marginBottom: 20,
    },
    codeCharBox: {
      width: 42,
      height: 52,
      backgroundColor: colors.background.default,
      borderRadius: 10,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: '#F59E0B60',
    },
    codeChar: {
      fontSize: 22,
      fontWeight: '800',
      color: '#D97706',
      letterSpacing: 0,
    },
    codeActions: {
      flexDirection: 'row',
      gap: 12,
      width: '100%',
    },
    codeBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: '#F59E0B',
      borderRadius: 10,
      paddingVertical: 12,
    },
    codeBtnOutline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: '#F59E0B',
    },
    codeBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#fff',
    },
    // ── Advanced ──
    settingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
    },
    settingLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    settingTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text.primary,
    },
    settingSubtitle: {
      fontSize: 12,
      color: colors.text.secondary,
      marginTop: 2,
    },
    // ── Save ──
    primaryButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.success.main,
      borderRadius: 14,
      paddingVertical: 16,
      shadowColor: colors.success.main,
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.35,
      shadowRadius: 8,
      elevation: 5,
    },
    primaryButtonText: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    buttonDisabled: {
      opacity: 0.55,
    },
    // ── Danger ──
    dangerCard: {
      backgroundColor: isDarkMode ? colors.background.paper : '#FFF5F5',
      borderRadius: 14,
      padding: 20,
      borderWidth: 1,
      borderColor: colors.error.main + '60',
    },
    dangerTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.error.main,
      marginBottom: 8,
    },
    dangerText: {
      fontSize: 13,
      color: isDarkMode ? colors.error.light : colors.error.main,
      lineHeight: 19,
      marginBottom: 16,
    },
    dangerButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: colors.error.main,
      borderRadius: 10,
      paddingVertical: 13,
    },
    dangerButtonText: {
      fontSize: 15,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });
