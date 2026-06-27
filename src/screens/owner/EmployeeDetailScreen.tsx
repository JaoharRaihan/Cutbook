/**
 * EmployeeDetailScreen.tsx
 * View and manage employee details
 */

import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import {useOrg, useData} from '@/context';
import {UserStatus, EmployeePermission, UserRole} from '@/types';
import {formatBDT} from '@/utils/currency';
import {formatDateISO} from '@/utils/date';
import MaterialIcons from '@react-native-vector-icons/material-icons';

// ============================================================================
// COMPONENT
// ============================================================================

export default function EmployeeDetailScreen({route, navigation}: any): React.ReactElement {
  const {employeeId} = route.params;
  const {orgUsers, updateUserInOrg, employeeTransactions, createEmployeeTransaction} = useOrg();
  const {workEntries} = useData();

  const [isEditingCommission, setIsEditingCommission] = useState(false);
  const [commissionInput, setCommissionInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');

  // Get employee from orgUsers
  const employee = useMemo(() => {
    return orgUsers.find(u => u.id === employeeId);
  }, [employeeId, orgUsers]);

  const employeePayouts = useMemo(() => {
    return employeeTransactions.filter(t => t.employeeId === employeeId);
  }, [employeeId, employeeTransactions]);

  // Calculate statistics from workEntries
  const stats = useMemo(() => {
    if (!employee) return null;

    const employeeEntries = workEntries.filter(e => e.employeeId === employeeId);

    // Get this month's date range
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const thisMonthEntries = employeeEntries.filter(e => {
      const entryDate = typeof e.createdAt === 'string' ? new Date(e.createdAt) : e.createdAt;
      return entryDate >= monthStart && entryDate <= monthEnd;
    });

    const totalIncome = employeeEntries.reduce((sum, e) => sum + e.price + (e.tip || 0), 0);
    const thisMonthIncome = thisMonthEntries.reduce((sum, e) => sum + e.price + (e.tip || 0), 0);
    const totalTips = employeeEntries.reduce((sum, entry) => sum + (entry.tip || 0), 0);

    return {
      totalServices: employeeEntries.length,
      totalIncome,
      totalTips,
      thisMonthServices: thisMonthEntries.length,
      thisMonthIncome,
      averagePerService:
        employeeEntries.length > 0
          ? employeeEntries.reduce((sum, e) => sum + e.price, 0) / employeeEntries.length
          : 0,
    };
  }, [employee, employeeId, workEntries]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSaveCommission = async () => {
    if (!employee) return;

    const newCommission = parseFloat(commissionInput);
    if (isNaN(newCommission) || newCommission < 0 || newCommission > 100) {
      Alert.alert('Invalid Input', 'Commission must be between 0 and 100');
      return;
    }

    setSaving(true);
    try {
      await updateUserInOrg(employeeId, {
        commissionPercentage: newCommission,
      });
      Alert.alert('Success', 'Commission updated');
      setIsEditingCommission(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update commission');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!employee) return;

    Alert.alert(
      'Delete Employee',
      `Are you sure you want to remove ${employee.name} from the organization?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setSaving(true);
            try {
              await updateUserInOrg(employeeId, {
                orgId: '',
              });
              Alert.alert('Success', 'Employee removed', [
                {text: 'OK', onPress: () => navigation.goBack()},
              ]);
            } catch (err: any) {
              Alert.alert('Error', err.message || 'Failed to remove employee');
              setSaving(false);
            }
          },
        },
      ],
    );
  };

  const getStatusColor = (status: UserStatus): string => {
    switch (status) {
      case UserStatus.ACTIVE:
        return '#4CAF50';
      case UserStatus.BLOCKED:
        return '#F44336';
      case UserStatus.PENDING:
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusLabel = (status: UserStatus): string => {
    switch (status) {
      case UserStatus.ACTIVE:
        return 'Active';
      case UserStatus.BLOCKED:
        return 'Blocked';
      case UserStatus.PENDING:
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const handleTogglePermission = async (permission: EmployeePermission) => {
    if (!employee) return;

    const hasPermission = employee.permissions?.includes(permission) || false;
    const newPermissions = hasPermission
      ? employee.permissions?.filter(p => p !== permission) || []
      : [...(employee.permissions || []), permission];

    setSaving(true);
    try {
      await updateUserInOrg(employeeId, {
        permissions: newPermissions,
      });

      const permissionLabel =
        permission === EmployeePermission.CAN_ADD_ENTRIES ? 'Add Entries' : permission;
      const action = hasPermission ? 'revoked' : 'granted';
      Alert.alert('Success', `Permission to ${permissionLabel} has been ${action}`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleSendPayment = async () => {
    if (!employee) return;

    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid amount');
      return;
    }

    setSaving(true);
    try {
      await createEmployeeTransaction(employeeId, amount, paymentNote || undefined);
      Alert.alert(
        'Success',
        employee.role === UserRole.OWNER
          ? `Payment of ${formatBDT(amount)} given to yourself. Auto-accepted.`
          : `Payment of ${formatBDT(amount)} sent to ${employee.name}. Awaiting acceptance.`,
      );
      setPaymentAmount('');
      setPaymentNote('');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to send payment');
    } finally {
      setSaving(false);
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (!employee || !stats) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading employee...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Employee Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{employee.name.charAt(0).toUpperCase()}</Text>
          </View>

          <Text style={styles.name}>
            {employee.name} {employee.role === UserRole.OWNER ? '(Owner)' : ''}
          </Text>

          <View
            style={[styles.statusBadge, {backgroundColor: getStatusColor(employee.status) + '20'}]}>
            <View style={[styles.statusDot, {backgroundColor: getStatusColor(employee.status)}]} />
            <Text style={[styles.statusText, {color: getStatusColor(employee.status)}]}>
              {getStatusLabel(employee.status)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="phone" style={styles.infoIcon} />
            <Text style={styles.infoText}>{employee.phone}</Text>
          </View>

          {employee.email && !employee.email.endsWith('@cutbook.app') && (
            <View style={styles.infoRow}>
              <MaterialIcons name="mail-outline" style={styles.infoIcon} />
              <Text style={styles.infoText}>{employee.email}</Text>
            </View>
          )}

          {/* Commission Editing */}
          <View style={styles.commissionContainer}>
            <Text style={styles.commissionLabel}>Commission</Text>
            {isEditingCommission ? (
              <View style={styles.commissionEditContainer}>
                <TextInput
                  style={styles.commissionInput}
                  placeholder={employee.commissionPercentage?.toString() || '0'}
                  value={commissionInput}
                  onChangeText={setCommissionInput}
                  keyboardType="numeric"
                  editable={!saving}
                />
                <Text style={styles.commissionUnit}>%</Text>
                <TouchableOpacity
                  style={styles.commissionSaveButton}
                  onPress={handleSaveCommission}
                  disabled={saving}>
                  <Text style={styles.commissionSaveText}>✓</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.commissionCancelButton}
                  onPress={() => {
                    setIsEditingCommission(false);
                    setCommissionInput('');
                  }}
                  disabled={saving}>
                  <Text style={styles.commissionCancelText}>✕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                onPress={() => {
                  setIsEditingCommission(true);
                  setCommissionInput(employee.commissionPercentage?.toString() || '0');
                }}
                style={styles.commissionDisplay}>
                <Text style={styles.commissionValue}>{employee.commissionPercentage || 0}%</Text>
                <Text style={styles.editHint}>tap to edit</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.infoRow}>
            <MaterialIcons name="calendar-month" style={styles.infoIcon} />
            <Text style={styles.infoText}>Joined {formatDateISO(employee.createdAt)}</Text>
          </View>
        </View>

        {/* Payment Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            💰 Give Money to <Text style={styles.redText}>{employee.name}</Text>
          </Text>
          <Text style={styles.paymentDescription}>
            {employee.role === UserRole.OWNER
              ? 'This payout will be automatically accepted and added to your received payouts.'
              : 'Employee will get a message and can accept or reject it.'}
          </Text>

          <View style={styles.paymentForm}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Amount (BDT) *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="Enter amount"
                keyboardType="decimal-pad"
                value={paymentAmount}
                onChangeText={setPaymentAmount}
                editable={!saving}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Note (Optional)</Text>
              <TextInput
                style={[styles.formInput, styles.noteInputForm]}
                placeholder="e.g., Daily advance, Bonus, Loan..."
                multiline
                value={paymentNote}
                onChangeText={setPaymentNote}
                editable={!saving}
              />
            </View>

            <TouchableOpacity
              style={[styles.sendPaymentButton, saving && styles.buttonDisabled]}
              onPress={handleSendPayment}
              disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <Text style={styles.sendPaymentButtonIcon}>✓</Text>
                  <Text style={styles.sendPaymentButtonText}>Send Payment</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}> Performance Statistics</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalServices}</Text>
              <Text style={styles.statLabel}>Total Services</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>{formatBDT(stats.totalIncome)}</Text>
              <Text style={styles.statLabel}>Total Income</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.thisMonthServices}</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>{formatBDT(stats.thisMonthIncome)}</Text>
              <Text style={styles.statLabel}>Month Income</Text>
            </View>

            <View style={styles.statCardtips}>
              <Text style={styles.statValue}>{formatBDT(stats.totalTips)}</Text>
              <Text style={styles.statLabel}>Total Tips</Text>
            </View>
            {employeePayouts.length > 0 && (
              <View style={styles.averageCard}>
                <Text style={styles.averageLabel}>Received Money</Text>
                <Text style={styles.averageValue}>
                  {formatBDT(employeePayouts.reduce((sum, item) => sum + item.amount, 0))}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Permissions Section */}
        {employee.role !== UserRole.OWNER && (
          <View style={styles.section}>
            <Text style={styles.sectionTitleper}>PERMISSIONS</Text>

            <Text style={styles.permissionDescription}>
              Control what this employee can do when you're not available
            </Text>

            {/* Grant Access Card */}
            <View style={styles.permissionCard}>
              {/* Header */}
              <View style={styles.permissionHeader}>
                <View style={styles.permissionTextContainer}>
                  <Text style={styles.permissionTitle}>Manager Access</Text>

                  <Text style={styles.permissionSubtitle}>
                    Can add entries and manage work logs for staff
                  </Text>
                </View>

                {/* Status Badge */}
                <View
                  style={[
                    styles.statusBadge,
                    employee.permissions?.includes(EmployeePermission.CAN_ADD_ENTRIES)
                      ? styles.statusActive
                      : styles.statusInactive,
                  ]}>
                  <Text style={styles.statusText}>
                    {employee.permissions?.includes(EmployeePermission.CAN_ADD_ENTRIES)
                      ? 'GRANTED'
                      : 'OFF'}
                  </Text>
                </View>
              </View>

              {/* Action Row */}
              <TouchableOpacity
                style={[
                  styles.grantButton,
                  employee.permissions?.includes(EmployeePermission.CAN_ADD_ENTRIES)
                    ? styles.revokeButton
                    : styles.enableButton,
                ]}
                onPress={() => handleTogglePermission(EmployeePermission.CAN_ADD_ENTRIES)}
                disabled={saving}>
                <Text style={styles.grantButtonText}>
                  {employee.permissions?.includes(EmployeePermission.CAN_ADD_ENTRIES)
                    ? 'Remove Access'
                    : 'Give Access'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        {employee.role !== UserRole.OWNER && (
          <View style={styles.section}>
            <TouchableOpacity
              style={[styles.deleteButton, saving && styles.buttonDisabled]}
              onPress={handleDelete}
              disabled={saving}>
              {saving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <MaterialIcons name="delete-forever" style={styles.deleteButtonIcon} />
                  <Text style={styles.deleteButtonText}>Remove from Organization</Text>
                </>
              )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#757575',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#000000',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 8,
    gap: 12,
  },
  infoIcon: {
    fontSize: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#757575',
    flex: 1,
  },
  commissionContainer: {
    width: '100%',
    paddingVertical: 8,
  },
  commissionLabel: {
    fontSize: 14,
    color: '#D4AF37',
    marginBottom: 8,
  },
  commissionDisplay: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 8,
  },
  commissionValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#008000',
  },
  editHint: {
    fontSize: 12,
    color: '#e91414',
    fontStyle: 'italic',
  },
  commissionEditContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  commissionInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#c3835c',
  },
  commissionUnit: {
    fontSize: 14,
    color: '#757575',
    fontWeight: '600',
  },
  commissionSaveButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commissionSaveText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  commissionCancelButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F44336',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commissionCancelText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
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
    color: '#000000',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statCardtips: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
  },
  averageCard: {
    width: '100%',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  averageLabel: {
    fontSize: 14,
    color: '#2E7D32',
    marginBottom: 4,
  },
  averageValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E7D32',
  },
  sectionTitleper: {
    fontSize: 18,
    fontWeight: '700',
    color: '#ff0606',
    marginBottom: 16,
  },
  permissionDescription: {
    color: '#000000',
    fontSize: 13,
    lineHeight: 18,
  },
  permissionCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 14,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },

  permissionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },

  permissionTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },

  permissionSubtitle: {
    color: '#a0a0a0',
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },

  statusActive: {
    backgroundColor: '#ff0000',
  },

  statusInactive: {
    backgroundColor: '#008000',
  },

  grantButton: {
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },

  enableButton: {
    backgroundColor: '#ff0000',
  },

  revokeButton: {
    backgroundColor: '#008000',
  },

  grantButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F44336',
    gap: 12,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  deleteButtonIcon: {
    fontSize: 24,
    color: '#ff1100',
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#F44336',
  },
  redText: {
    color: 'red',
  },
  permissionTextContainer: {
    flex: 1,
  },

  // Payment Styles
  paymentDescription: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 16,
    lineHeight: 18,
  },
  paymentForm: {
    backgroundColor: '#F9FDF7',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  formGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 6,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#C8E6C9',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 16,
    color: '#212121',
    backgroundColor: '#FFFFFF',
  },
  noteInputForm: {
    height: 70,
    textAlignVertical: 'top',
  },
  sendPaymentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 14,
    gap: 8,
    marginTop: 4,
  },
  sendPaymentButtonIcon: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  sendPaymentButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
