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
import {useOrg} from '@/context';
import Theme from '@/constants/theme';

// ============================================================================
// JOIN ORGANIZATION SCREEN
// ============================================================================

const JoinOrgScreen: React.FC = () => {
  const navigation = useNavigation();
  const {joinOrg, loading} = useOrg();

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
      setError('Invite code is required');
      return false;
    }
    if (inviteCode.length !== 6) {
      setError('Invite code must be 6 characters');
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
      Alert.alert('Success', 'You have joined the organization!');
      // Navigation will be handled automatically by RootNavigator
    } catch (err: any) {
      setError(err.message || 'Invalid invite code');
      Alert.alert('Error', err.message || 'Failed to join organization');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>🤝</Text>
          <Text style={styles.title}>Join Organization</Text>
          <Text style={styles.subtitle}>Enter the invite code from your salon owner</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {/* Invite Code Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Invite Code</Text>
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
              placeholderTextColor={Theme.colors.text.hint}
              textAlign="center"
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
            <Text style={styles.hint}>6-character code provided by your salon owner</Text>
          </View>

          {/* Join Button */}
          <TouchableOpacity
            style={[styles.joinButton, loading ? styles.joinButtonDisabled : null]}
            onPress={handleJoin}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.joinButtonText}>Join Organization</Text>
            )}
          </TouchableOpacity>

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>ℹ️</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>How to get invite code?</Text>
              <Text style={styles.infoText}>
                Ask your salon owner to share the organization invite code with you. They can find
                it in their Settings.
              </Text>
            </View>
          </View>

          {/* Back Link */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Want to create your own salon? </Text>
            <TouchableOpacity onPress={() => navigation.goBack()} disabled={loading}>
              <Text style={styles.backLink}>Go Back</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 32,
    paddingHorizontal: 24,
  },
  headerIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Theme.colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Theme.colors.text.secondary,
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
    color: Theme.colors.text.primary,
    marginBottom: 12,
    textAlign: 'center',
  },
  codeInput: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Theme.colors.text.primary,
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderWidth: 2,
    borderColor: Theme.colors.primary[600],
    borderRadius: Theme.borderRadius.lg,
    backgroundColor: Theme.colors.primary[50],
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  inputError: {
    borderColor: Theme.colors.error.main,
    backgroundColor: Theme.colors.error.light,
  },
  errorText: {
    fontSize: 12,
    color: Theme.colors.error.main,
    marginTop: 8,
    textAlign: 'center',
  },
  hint: {
    fontSize: 12,
    color: Theme.colors.text.hint,
    marginTop: 8,
    textAlign: 'center',
  },
  joinButton: {
    backgroundColor: Theme.colors.primary[600],
    paddingVertical: 16,
    borderRadius: Theme.borderRadius.md,
    alignItems: 'center',
    marginTop: 8,
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
    backgroundColor: Theme.colors.info.light,
    borderRadius: Theme.borderRadius.md,
    borderWidth: 1,
    borderColor: Theme.colors.info.main,
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.info.dark,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: Theme.colors.info.dark,
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
    color: Theme.colors.text.secondary,
  },
  backLink: {
    fontSize: 14,
    fontWeight: '600',
    color: Theme.colors.primary[600],
  },
});

export default JoinOrgScreen;
