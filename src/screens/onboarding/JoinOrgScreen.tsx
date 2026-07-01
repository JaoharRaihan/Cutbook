/**
 * Join Organization Screen
 * Employee onboarding - join existing salon using invite code
 */

import React, {useState, useRef} from 'react';
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
import {useOrg, useTheme, useLanguage, useAuth} from '@/context';
import Theme, {ThemeColors} from '@/constants/theme';
import {UserRole} from '@/types';
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
// JOIN ORGANIZATION SCREEN
// ============================================================================

const JoinOrgScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const {joinOrg, loading} = useOrg();
  const {updateUser} = useAuth();
  const {colors} = useTheme();
  const {language} = useLanguage();
  const styles = useThemedStyles(getStyles);

  const [inviteCode, setInviteCode] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<TextInput>(null);

  // Handle invite code change
  const handleCodeChange = (text: string) => {
    // Convert to uppercase and limit to 6 characters
    const cleaned = text.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const limited = cleaned.slice(0, 6);
    setInviteCode(limited);
    if (error) {
      setError('');
    }
  };

  // Validate invite code
  const validate = (): boolean => {
    if (!inviteCode) {
      setError(language === 'bn' ? 'আমন্ত্রণ কোড আবশ্যক' : 'Invite code is required');
      return false;
    }
    if (inviteCode.length !== 6) {
      setError(
        language === 'bn'
          ? 'আমন্ত্রণ কোড অবশ্যই ৬ অক্ষরের হতে হবে'
          : 'Invite code must be 6 characters',
      );
      return false;
    }
    return true;
  };

  // Handle join organization
  const handleJoin = async () => {
    if (!validate()) {
      return;
    }

    try {
      await joinOrg(inviteCode);
      Alert.alert(
        language === 'bn' ? 'সফল' : 'Success',
        language === 'bn'
          ? 'আপনি সেলুনে সফলভাবে যোগদান করেছেন!'
          : 'You have joined the organization!',
      );
    } catch (err: any) {
      setError(err.message || 'Invalid invite code');
      Alert.alert(
        language === 'bn' ? 'ত্রুটি' : 'Error',
        err.message || 'Failed to join organization',
      );
    }
  };

  // Handle switching role to owner and navigating to create salon screen
  const handleCreateOwnSalon = async () => {
    try {
      await updateUser({role: UserRole.OWNER});
      navigation.reset({
        index: 1,
        routes: [{name: 'OnboardingChoice'}, {name: 'CreateOrg'}],
      });
    } catch (err: any) {
      Alert.alert(
        language === 'bn' ? 'ত্রুটি' : 'Error',
        err.message || 'Failed to update account type',
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
          <MaterialIcons name="join-inner" style={styles.headerIcon} />
          <Text style={styles.title}>
            {language === 'bn' ? 'সেলুনে যোগ দিন' : 'Join Organization'}
          </Text>
          <Text style={styles.subtitle}>
            {language === 'bn'
              ? 'আপনার সেলুন মালিকের কাছ থেকে পাওয়া আমন্ত্রণ কোডটি লিখুন'
              : 'Enter the invite code from your salon owner'}
          </Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Invite Code Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{language === 'bn' ? 'আমন্ত্রণ কোড' : 'Invite Code'}</Text>
            <TextInput
              ref={inputRef}
              style={[styles.codeInput, error ? styles.inputError : null]}
              placeholder="XXXXXX"
              value={inviteCode}
              onChangeText={handleCodeChange}
              editable={!loading}
              autoCapitalize="characters"
              maxLength={6}
              autoFocus={true}
              placeholderTextColor={colors.text.hint}
              textAlign="center"
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Text style={styles.hint}>
              {language === 'bn'
                ? 'আপনার সেলুন মালিকের দেওয়া ৬-সংখ্যার কোড'
                : '6-character code provided by your salon owner'}
            </Text>
          </View>

          {/* Join Button */}
          <TouchableOpacity
            style={[styles.joinButton, loading ? styles.joinButtonDisabled : null]}
            onPress={handleJoin}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.joinButtonText}>
                {language === 'bn' ? 'সেলুনে যোগ দিন' : 'Join Organization'}
              </Text>
            )}
          </TouchableOpacity>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <MaterialIcons name="info-outline" style={styles.infoIcon} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>
                {language === 'bn' ? 'আমন্ত্রণ কোড কীভাবে পাবেন?' : 'How to get invite code?'}
              </Text>
              <Text style={styles.infoText}>
                {language === 'bn'
                  ? 'আপনার সেলুন মালিককে তার কোডটি শেয়ার করতে বলুন। তারা এটি তাদের সেটিংসে খুঁজে পাবেন।'
                  : 'Ask your salon owner to share the organization invite code with you. They can find it in their Settings.'}
              </Text>
            </View>
          </View>

          {/* Back Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              {language === 'bn'
                ? 'আপনার নিজের সেলুন তৈরি করতে চান?'
                : 'Want to create your own salon? '}
            </Text>
            <TouchableOpacity onPress={handleCreateOwnSalon} disabled={loading}>
              <Text style={styles.backLink}>{language === 'bn' ? 'ফিরে যান' : 'Go Back'}</Text>
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
      marginBottom: 12,
      textAlign: 'center',
    },
    codeInput: {
      fontSize: 32,
      fontWeight: 'bold',
      color: colors.text.primary,
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderWidth: 2,
      borderColor: Palette.darkSlateGrey,
      borderRadius: Theme.borderRadius.lg,
      backgroundColor: colors.background.paper,
      fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    },
    inputError: {
      borderColor: colors.error.main,
      backgroundColor: isDarkMode ? 'rgba(244,67,54,0.1)' : '#FFEBEE',
    },
    errorText: {
      fontSize: 12,
      color: colors.error.main,
      marginTop: 8,
      textAlign: 'center',
    },
    hint: {
      fontSize: 12,
      color: colors.text.hint,
      marginTop: 8,
      textAlign: 'center',
    },
    joinButton: {
      backgroundColor: Palette.darkSlateGrey,
      paddingVertical: 16,
      borderRadius: Theme.borderRadius.md,
      alignItems: 'center',
      marginTop: 8,
      borderWidth: 1,
      borderColor: isDarkMode ? Palette.wheat : 'transparent',
      ...Theme.shadows.md,
    },
    joinButtonDisabled: {
      opacity: 0.6,
    },
    joinButtonText: {
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
      lineHeight: 20,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 24,
    },
    footerText: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    backLink: {
      fontSize: 14,
      fontWeight: '600',
      color: Palette.burntOrange,
    },
  });

export default JoinOrgScreen;
