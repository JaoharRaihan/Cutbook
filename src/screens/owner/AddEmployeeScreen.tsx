/**
 * AddEmployeeScreen.tsx
 * Generate and share invite code for new employee
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import {useOrg} from '@/context';

// ============================================================================
// COMPONENT
// ============================================================================

export default function AddEmployeeScreen({navigation}: any): React.ReactElement {
  const {currentOrg} = useOrg();
  const [employeeName, setEmployeeName] = useState('');
  const [employeePhone, setEmployeePhone] = useState('');
  const [commissionPercentage, setCommissionPercentage] = useState('30');
  const [loading, setLoading] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [invitedEmployee, setInvitedEmployee] = useState<{name: string; phone: string} | null>(
    null,
  );

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateForm = (): string | null => {
    if (!employeeName.trim()) {
      return 'Please enter employee name';
    }

    if (!employeePhone.trim()) {
      return 'Please enter phone number';
    }

    if (employeePhone.length < 10) {
      return 'Please enter a valid phone number';
    }

    const commission = parseFloat(commissionPercentage);
    if (isNaN(commission) || commission < 0 || commission > 100) {
      return 'Commission must be between 0 and 100';
    }

    return null;
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const generateInviteCode = (): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleGenerateInvite = async () => {
    const error = validateForm();
    if (error) {
      Alert.alert('Validation Error', error);
      return;
    }

    setLoading(true);

    try {
      // Generate a unique invite code
      const code = generateInviteCode();

      // Store invite info temporarily (you may want to save this to a 'invites' collection in Firestore)
      // For now, we'll just display it to the owner
      setInviteCode(code);
      setInvitedEmployee({
        name: employeeName.trim(),
        phone: employeePhone.trim(),
      });

      // Note: The employee will use this code to register and join the org
      // See: OrgContext.joinOrg(inviteCode)
    } catch (err: any) {
      console.error('Error generating invite:', err);
      Alert.alert('Error', 'Failed to generate invite code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyInviteCode = async () => {
    if (!inviteCode) return;

    // In a real app, you'd use react-native-clipboard
    // For now, just show in alert
    Alert.alert('Invite Code', inviteCode, [
      {
        text: 'Copy',
        onPress: () => {
          // TODO: Implement clipboard copy for each platform
          Alert.alert('Copied', `Invite code ${inviteCode} copied to clipboard!`);
        },
      },
      {text: 'Share', onPress: () => handleShareInvite()},
      {text: 'Done'},
    ]);
  };

  const handleShareInvite = async () => {
    if (!inviteCode || !invitedEmployee) return;

    const message = `Join ${currentOrg?.name || 'our salon'} on CutBook!\nInvite Code: ${inviteCode}\n\nDownload CutBook and use this code to join as an employee.`;

    try {
      // TODO: Implement native share or send via SMS/WhatsApp
      Alert.alert(
        'Share Invite',
        'In production, this would open share dialog or send SMS:\n\n' + message,
      );
    } catch (err) {
      console.error('Error sharing invite:', err);
    }
  };

  const handleDone = () => {
    navigation.goBack();
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (inviteCode && invitedEmployee) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.successContainer}>
            <Text style={styles.successIcon}>✅</Text>
            <Text style={styles.successTitle}>Invite Generated!</Text>
            <Text style={styles.successSubtitle}>Share this code with your employee</Text>

            {/* Employee Info */}
            <View style={styles.employeeCard}>
              <Text style={styles.employeeLabel}>Employee Name</Text>
              <Text style={styles.employeeValue}>{invitedEmployee.name}</Text>

              <Text style={[styles.employeeLabel, {marginTop: 12}]}>Phone Number</Text>
              <Text style={styles.employeeValue}>{invitedEmployee.phone}</Text>

              <Text style={[styles.employeeLabel, {marginTop: 12}]}>Commission</Text>
              <Text style={styles.employeeValue}>{commissionPercentage}%</Text>
            </View>

            {/* Invite Code Display */}
            <View style={styles.inviteCodeContainer}>
              <Text style={styles.inviteCodeLabel}>Invite Code</Text>
              <View style={styles.inviteCodeBox}>
                <Text style={styles.inviteCodeText}>{inviteCode}</Text>
                <TouchableOpacity onPress={handleCopyInviteCode} style={styles.copyButton}>
                  <Text style={styles.copyButtonText}>📋</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.instructionText}>
                Share this code with your employee. They can use it to join{' '}
                {currentOrg?.name || 'the organization'} as an employee.
              </Text>
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.shareButton} onPress={handleShareInvite}>
                <Text style={styles.shareButtonText}>📤 Share Invite</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
                <Text style={styles.doneButtonText}>✓ Done</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled">
          {/* Form Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Employee Information</Text>

            {/* Name Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Full Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter employee name"
                placeholderTextColor="#999"
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
                Phone Number <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="+880 1XXX-XXXXXX"
                placeholderTextColor="#999"
                value={employeePhone}
                onChangeText={setEmployeePhone}
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!loading}
              />
            </View>

            {/* Commission Input */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Commission Percentage <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.percentageInputContainer}>
                <TextInput
                  style={styles.percentageInput}
                  placeholder="30"
                  placeholderTextColor="#999"
                  value={commissionPercentage}
                  onChangeText={setCommissionPercentage}
                  keyboardType="numeric"
                  editable={!loading}
                />
                <Text style={styles.percentageSymbol}>%</Text>
              </View>
              <Text style={styles.hint}>Default commission percentage for this employee</Text>
            </View>
          </View>

          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={styles.infoText}>
              An invite code will be generated that you can share with the employee. They will use
              it to create their account and join your organization.
            </Text>
          </View>
        </ScrollView>

        {/* Submit Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleGenerateInvite}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.submitButtonText}>Generate Invite Code</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  required: {
    color: '#F44336',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#212121',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  percentageInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingRight: 16,
  },
  percentageInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#212121',
  },
  percentageSymbol: {
    fontSize: 18,
    fontWeight: '600',
    color: '#757575',
  },
  hint: {
    fontSize: 12,
    color: '#757575',
    marginTop: 6,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  infoIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  footer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  submitButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  submitButtonDisabled: {
    backgroundColor: '#BDBDBD',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },

  // Success state styles
  successContainer: {
    paddingVertical: 32,
  },
  successIcon: {
    fontSize: 64,
    textAlign: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 32,
  },
  employeeCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  employeeLabel: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '500',
  },
  employeeValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  inviteCodeContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  inviteCodeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  inviteCodeBox: {
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#4CAF50',
    borderStyle: 'dashed',
  },
  inviteCodeText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4CAF50',
    letterSpacing: 4,
  },
  copyButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    padding: 8,
  },
  copyButtonText: {
    fontSize: 20,
  },
  instructionText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 20,
  },
  buttonGroup: {
    gap: 12,
  },
  shareButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  shareButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  doneButton: {
    backgroundColor: '#757575',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
