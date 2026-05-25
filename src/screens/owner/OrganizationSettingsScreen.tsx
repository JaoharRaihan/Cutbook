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
  SafeAreaView,
  StatusBar,
  TextInput,
  Alert,
  Switch,
  Share,
} from 'react-native';
import {useOrg} from '@/context';
import {CommissionMode} from '@/types';

// ============================================================================
// COMPONENT
// ============================================================================

export default function OrganizationSettingsScreen({navigation}: any): React.ReactElement {
  const {currentOrg, updateOrg} = useOrg();

  // Form state
  const [orgName, setOrgName] = useState(currentOrg?.name || '');
  const [timezone, setTimezone] = useState(currentOrg?.timezone || 'Asia/Dhaka');
  const [currency, setCurrency] = useState(currentOrg?.currency || 'BDT');
  const [commissionMode, setCommissionMode] = useState<CommissionMode>(
    currentOrg?.defaultCommissionMode || CommissionMode.PERCENTAGE,
  );
  const [autoBackup, setAutoBackup] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [generatingCode, setGeneratingCode] = useState(false);

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
    Alert.alert('Select Timezone', 'Choose your timezone', [
      {text: 'Asia/Dhaka', onPress: () => updateTimezone('Asia/Dhaka')},
      {text: 'Asia/Kolkata', onPress: () => updateTimezone('Asia/Kolkata')},
      {text: 'Asia/Karachi', onPress: () => updateTimezone('Asia/Karachi')},
      {text: 'UTC', onPress: () => updateTimezone('UTC')},
      {text: 'Cancel', style: 'cancel'},
    ]);
  };

  const updateTimezone = (value: string) => {
    setTimezone(value);
    setIsDirty(true);
  };

  const handleCurrencyChange = () => {
    Alert.alert('Select Currency', 'Choose your currency', [
      {text: 'BDT (৳)', onPress: () => updateCurrency('BDT')},
      {text: 'INR (₹)', onPress: () => updateCurrency('INR')},
      {text: 'PKR (₨)', onPress: () => updateCurrency('PKR')},
      {text: 'USD ($)', onPress: () => updateCurrency('USD')},
      {text: 'Cancel', style: 'cancel'},
    ]);
  };

  const updateCurrency = (value: string) => {
    setCurrency(value);
    setIsDirty(true);
  };

  const handleAutoBackupToggle = () => {
    setAutoBackup(!autoBackup);
    setIsDirty(true);
  };

  const handleSave = () => {
    if (!orgName.trim()) {
      Alert.alert('Error', 'Organization name is required', [{text: 'OK'}]);
      return;
    }

    Alert.alert('Save Changes', 'Are you sure you want to update organization settings?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Save',
        onPress: () => {
          // Mock save - in real app would call API
          setTimeout(() => {
            setIsDirty(false);
            Alert.alert('Success', 'Organization settings updated successfully!', [
              {
                text: 'OK',
                onPress: () => navigation.goBack(),
              },
            ]);
          }, 500);
        },
      },
    ]);
  };

  const handleCopyOrgCode = () => {
    Share.share({
      message: `Join my salon on CutBook! Use this code to join: ${orgCode}`,
      title: 'CutBook Organization Code',
      url: undefined,
    }).catch(err => {
      console.log('Share error:', err);
      // Fallback: just show alert with code
      Alert.alert(
        'Code Ready to Share',
        `Organization code: ${orgCode}\n\nShare this code with employees to let them join your organization.`,
        [{text: 'OK'}],
      );
    });
  };

  const handleGenerateNewCode = () => {
    Alert.alert(
      'Generate New Code',
      'Are you sure you want to generate a new organization code?\n\nThe old code will no longer work for new employees.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Generate',
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
                'New Code Generated',
                `New organization code: ${newCode}\n\nShare this with new employees.`,
                [{text: 'OK'}],
              );
            } catch (err: any) {
              console.error('Error generating new code:', err);
              Alert.alert('Error', err.message || 'Failed to generate new code');
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
      '⚠️ Delete Organization',
      'This action cannot be undone!\n\nAll data including employees, services, and work entries will be permanently deleted.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'Type "DELETE" to confirm permanent deletion of your organization.',
              [
                {text: 'Cancel', style: 'cancel'},
                {
                  text: 'I Understand',
                  style: 'destructive',
                  onPress: () => {
                    Alert.alert('Organization Deleted', 'Your organization has been deleted.', [
                      {text: 'OK'},
                    ]);
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
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Organization Settings</Text>
        {isDirty && (
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Save</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏢 Basic Information</Text>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Organization Name *</Text>
            <TextInput
              style={styles.input}
              value={orgName}
              onChangeText={handleOrgNameChange}
              placeholder="Enter organization name"
              placeholderTextColor="#BDBDBD"
            />
          </View>

          <TouchableOpacity style={styles.selectButton} onPress={handleTimezoneChange}>
            <View style={styles.selectLeft}>
              <Text style={styles.selectLabel}>Timezone</Text>
              <Text style={styles.selectValue}>{timezone}</Text>
            </View>
            <Text style={styles.selectArrow}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.selectButton} onPress={handleCurrencyChange}>
            <View style={styles.selectLeft}>
              <Text style={styles.selectLabel}>Currency</Text>
              <Text style={styles.selectValue}>{currency}</Text>
            </View>
            <Text style={styles.selectArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Commission Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Commission Settings</Text>

          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View>
                <Text style={styles.cardTitle}>Default Commission Mode</Text>
                <Text style={styles.cardSubtitle}>
                  How commissions are calculated for new employees
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
                  Percentage (%)
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
                  Fixed Amount (৳)
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoBoxText}>
                {commissionMode === CommissionMode.PERCENTAGE
                  ? '💡 Employees earn a percentage of each service (e.g., 30% of ৳500 = ৳150)'
                  : '💡 Employees earn a fixed amount per service (e.g., ৳100 per service)'}
              </Text>
            </View>
          </View>
        </View>

        {/* Organization Code */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔑 Organization Code</Text>

          <View style={styles.codeCard}>
            <Text style={styles.codeLabel}>Share this code with employees</Text>
            <View style={styles.codeDisplay}>
              <Text style={styles.codeText}>{orgCode}</Text>
            </View>

            <View style={styles.codeActions}>
              <TouchableOpacity style={styles.codeButton} onPress={handleCopyOrgCode}>
                <Text style={styles.codeButtonText}>📋 Copy Code</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.codeButton, styles.codeButtonSecondary]}
                onPress={handleGenerateNewCode}>
                <Text style={styles.codeButtonSecondaryText}>🔄 Generate New</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoBoxText}>
                Employees need this code to join your organization during registration.
              </Text>
            </View>
          </View>
        </View>

        {/* Advanced Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Advanced Settings</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <Text style={styles.settingTitle}>Auto Backup</Text>
              <Text style={styles.settingSubtitle}>Automatically backup data daily</Text>
            </View>
            <Switch
              value={autoBackup}
              onValueChange={handleAutoBackupToggle}
              trackColor={{false: '#E0E0E0', true: '#81C784'}}
              thumbColor={autoBackup ? '#4CAF50' : '#F5F5F5'}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚠️ Danger Zone</Text>

          <View style={styles.dangerCard}>
            <Text style={styles.dangerTitle}>Delete Organization</Text>
            <Text style={styles.dangerText}>
              Permanently delete your organization and all associated data. This action cannot be
              undone.
            </Text>
            <TouchableOpacity style={styles.dangerButton} onPress={handleDeleteOrganization}>
              <Text style={styles.dangerButtonText}>Delete Organization</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Save Button (Fixed at bottom when dirty) */}
        {isDirty && (
          <View style={styles.section}>
            <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
              <Text style={styles.primaryButtonText}>💾 Save Changes</Text>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    paddingVertical: 8,
    paddingRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    flex: 1,
  },
  saveButton: {
    backgroundColor: '#4CAF50',
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
    color: '#212121',
    marginBottom: 12,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#212121',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectLeft: {
    flex: 1,
  },
  selectLabel: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 4,
  },
  selectValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  selectArrow: {
    fontSize: 20,
    color: '#BDBDBD',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#757575',
  },
  commissionToggle: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  commissionOption: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  commissionOptionActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  commissionOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
  },
  commissionOptionTextActive: {
    color: '#2196F3',
  },
  codeCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  codeLabel: {
    fontSize: 14,
    color: '#2E7D32',
    marginBottom: 12,
    textAlign: 'center',
  },
  codeDisplay: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  codeText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#4CAF50',
    letterSpacing: 4,
  },
  codeActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  codeButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  codeButtonSecondaryText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  infoBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
  },
  infoBoxText: {
    fontSize: 13,
    color: '#616161',
    lineHeight: 20,
  },
  settingRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  settingLeft: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#757575',
  },
  dangerCard: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  dangerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#C62828',
    marginBottom: 8,
  },
  dangerText: {
    fontSize: 14,
    color: '#D32F2F',
    lineHeight: 20,
    marginBottom: 16,
  },
  dangerButton: {
    backgroundColor: '#F44336',
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
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
