/**
 * Create Organization Screen
 * First-time owner setup - salon organization
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useOrg, useTheme, useLanguage} from '@/context';
import Theme, {ThemeColors} from '@/constants/theme';
import {CommissionMode} from '@/types';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import {useThemedStyles} from '@/hooks/useThemedStyles';

export const Palette = {
  inkBlack: '#04151f',
  darkSlateGrey: '#183a37',
  wheat: '#efd6ac',
  burntOrange: '#c44900',
  midnightViolet: '#432534',
};

// ============================================================================
// CREATE ORGANIZATION SCREEN
// ============================================================================

const CreateOrgScreen: React.FC = () => {
  useNavigation();
  const {createOrg, loading} = useOrg();
  const {colors} = useTheme();
  const {language} = useLanguage();
  const styles = useThemedStyles(getStyles);

  const [formData, setFormData] = useState({
    name: '',
    timezone: 'Asia/Dhaka',
    currency: 'BDT',
    defaultCommissionMode: CommissionMode.PERCENTAGE,
  });
  const [errors, setErrors] = useState({name: ''});

  // Update form field
  const updateField = (field: string, value: string | CommissionMode) => {
    setFormData(prev => ({...prev, [field]: value}));
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({...prev, [field]: ''}));
    }
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors = {name: ''};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = language === 'bn' ? 'সেলুনের নাম আবশ্যক' : 'Organization name is required';
      isValid = false;
    } else if (formData.name.trim().length < 3) {
      newErrors.name =
        language === 'bn'
          ? 'নাম অবশ্যই কমপক্ষে ৩ অক্ষরের হতে হবে'
          : 'Name must be at least 3 characters';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // Handle create organization
  const handleCreate = async () => {
    if (!validate()) {
      return;
    }

    try {
      const orgData = {
        name: formData.name.trim(),
        timezone: formData.timezone,
        currency: formData.currency,
        defaultCommissionMode: formData.defaultCommissionMode,
      };

      // Remove undefined values to avoid Firestore errors
      Object.keys(orgData).forEach(key => {
        if (orgData[key as keyof typeof orgData] === undefined) {
          delete orgData[key as keyof typeof orgData];
        }
      });

      await createOrg(orgData);
      Alert.alert(
        language === 'bn' ? 'সফল' : 'Success',
        language === 'bn' ? 'সেলুন সফলভাবে তৈরি করা হয়েছে!' : 'Organization created successfully!',
      );
    } catch (error: any) {
      Alert.alert(
        language === 'bn' ? 'ত্রুটি' : 'Error',
        error.message || 'Failed to create organization',
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
          <MaterialIcons name="domain-add" style={styles.headerIcon} />
          <Text style={styles.title}>
            {language === 'bn' ? 'আপনার সেলুন তৈরি করুন' : 'Create Your Salon'}
          </Text>
          <Text style={styles.subtitle}>
            {language === 'bn'
              ? 'আসুন আপনার সেলুন এস্টাবলিশমেন্ট সেট আপ করি'
              : "Let's set up your salon organization"}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Organization Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{language === 'bn' ? 'সেলুনের নাম *' : 'Salon Name *'}</Text>
            <TextInput
              style={[styles.input, errors.name ? styles.inputError : null]}
              placeholder={
                language === 'bn' ? 'যেমন: মায়ের দোয়া হেয়ার সেলুন' : 'e.g., Mayer Dua Hair Salon'
              }
              placeholderTextColor={colors.text.hint}
              value={formData.name}
              onChangeText={text => updateField('name', text)}
              editable={!loading}
              autoCapitalize="words"
            />
            {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            <Text style={styles.hint}>
              {language === 'bn'
                ? 'এটি আপনার কর্মীদের কাছে দৃশ্যমান হবে'
                : 'This will be visible to your employees'}
            </Text>
          </View>

          {/* Commission Mode */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              {language === 'bn' ? 'ডিফল্ট কমিশন মোড' : 'Default Commission Mode'}
            </Text>
            <Text style={styles.description}>
              {language === 'bn'
                ? 'কর্মীদের কমিশন ডিফল্টভাবে কীভাবে গণনা করা হবে তা চয়ন করুন'
                : 'Choose how employee commissions will be calculated by default'}
            </Text>
            <View style={styles.radioGroup}>
              <TouchableOpacity
                style={[
                  styles.radioButton,
                  formData.defaultCommissionMode === CommissionMode.PERCENTAGE
                    ? styles.radioButtonActive
                    : null,
                ]}
                onPress={() => updateField('defaultCommissionMode', CommissionMode.PERCENTAGE)}
                disabled={loading}>
                <View style={styles.radioCircle}>
                  {formData.defaultCommissionMode === CommissionMode.PERCENTAGE ? (
                    <View style={styles.radioCircleInner} />
                  ) : null}
                </View>
                <View style={styles.radioContent}>
                  <Text style={styles.radioTitle}>
                    {language === 'bn' ? 'শতকরা (পার্সেন্টেজ)' : 'Percentage'}
                  </Text>
                  <Text style={styles.radioDescription}>
                    {language === 'bn'
                      ? 'কর্মী সেবার মূল্যের একটি % পায়'
                      : 'Employee gets a % of service price'}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.radioButton,
                  formData.defaultCommissionMode === CommissionMode.FIXED
                    ? styles.radioButtonActive
                    : null,
                ]}
                onPress={() => updateField('defaultCommissionMode', CommissionMode.FIXED)}
                disabled={loading}>
                <View style={styles.radioCircle}>
                  {formData.defaultCommissionMode === CommissionMode.FIXED ? (
                    <View style={styles.radioCircleInner} />
                  ) : null}
                </View>
                <View style={styles.radioContent}>
                  <Text style={styles.radioTitle}>
                    {language === 'bn' ? 'নির্দিষ্ট পরিমাণ (ফিক্সড)' : 'Fixed Amount'}
                  </Text>
                  <Text style={styles.radioDescription}>
                    {language === 'bn'
                      ? 'কর্মী প্রতি সেবায় নির্দিষ্ট পরিমাণ টাকা পায়'
                      : 'Employee gets fixed amount per service'}
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <Text style={styles.hint}>
              {language === 'bn'
                ? 'আপনি এটি পরে সেটিংসে পরিবর্তন করতে পারেন'
                : 'You can change this later in settings'}
            </Text>
          </View>

          {/* Create Button */}
          <TouchableOpacity
            style={[styles.createButton, loading ? styles.createButtonDisabled : null]}
            onPress={handleCreate}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.createButtonText}>
                {language === 'bn' ? 'সেলুন তৈরি করুন' : 'Create Organization'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <MaterialIcons name="lightbulb" style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                {language === 'bn' ? 'পরবর্তী ধাপ কি?' : "What's Next?"}
              </Text>
              <Text style={styles.infoText}>
                {language === 'bn'
                  ? 'আপনার সেলুন তৈরি করার পরে, আপনি করতে পারেন:'
                  : 'After creating your organization, you can:'}
              </Text>
              <Text style={styles.infoText}>
                {language === 'bn' ? '• আপনার মেনুতে সেবা যোগ করুন' : '• Add services to your menu'}
              </Text>
              <Text style={styles.infoText}>
                {language === 'bn'
                  ? '• যোগদানের জন্য কর্মীদের আমন্ত্রণ জানান'
                  : '• Invite employees to join'}
              </Text>
              <Text style={styles.infoText}>
                {language === 'bn'
                  ? '• কাজের এন্ট্রি ট্র্যাক করা শুরু করুন'
                  : '• Start tracking work entries'}
              </Text>
            </View>
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
      backgroundColor: isDarkMode ? Palette.inkBlack : '#FAFBFB',
    },
    scrollContent: {
      flexGrow: 1,
    },
    header: {
      alignItems: 'center',
      paddingTop: 40,
      paddingBottom: 24,
      paddingHorizontal: 24,
    },
    headerIcon: {
      fontSize: 64,
      color: Palette.burntOrange,
      marginBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: 'bold',
      color: colors.text.primary,
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: colors.text.secondary,
      textAlign: 'center',
    },
    form: {
      paddingHorizontal: 24,
      paddingBottom: 32,
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
      borderRadius: Theme.borderRadius.md,
      backgroundColor: colors.background.paper,
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
    description: {
      fontSize: 14,
      color: colors.text.secondary,
      marginBottom: 12,
    },
    radioGroup: {
      gap: 12,
    },
    radioButton: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      padding: 16,
      borderWidth: 1.5,
      borderColor: colors.border.light,
      borderRadius: Theme.borderRadius.md,
      backgroundColor: colors.background.paper,
    },
    radioButtonActive: {
      borderColor: Palette.darkSlateGrey,
      backgroundColor: isDarkMode ? Palette.midnightViolet : colors.primary[50] + '15',
    },
    radioCircle: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: isDarkMode ? Palette.darkSlateGrey : colors.border.main,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
      marginTop: 2,
    },
    radioCircleInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: Palette.darkSlateGrey,
    },
    radioContent: {
      flex: 1,
    },
    radioTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 4,
    },
    radioDescription: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    createButton: {
      backgroundColor: Palette.darkSlateGrey,
      paddingVertical: 16,
      borderRadius: Theme.borderRadius.md,
      alignItems: 'center',
      marginTop: 8,
      borderWidth: 1,
      borderColor: isDarkMode ? Palette.wheat : 'transparent',
      ...Theme.shadows.md,
    },
    createButtonDisabled: {
      opacity: 0.6,
    },
    createButtonText: {
      fontSize: 16,
      fontWeight: '600',
      color: '#FFFFFF',
    },
    infoBox: {
      flexDirection: 'row',
      marginTop: 24,
      padding: 16,
      backgroundColor: isDarkMode ? Palette.midnightViolet : colors.primary[50] + '10',
      borderRadius: Theme.borderRadius.md,
      borderWidth: 1,
      borderColor: isDarkMode ? Palette.darkSlateGrey : colors.border.light,
    },
    infoIcon: {
      fontSize: 24,
      marginRight: 12,
      color: Palette.burntOrange,
    },
    infoContent: {
      flex: 1,
    },
    infoTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 8,
    },
    infoText: {
      fontSize: 13,
      color: colors.text.secondary,
      marginBottom: 4,
    },
  });

export default CreateOrgScreen;
