/**
 * WorkEntryDetailScreen.tsx
 * Detailed view of a work entry with edit/delete actions
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
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {useData} from '@/context';
import {PaymentMethod} from '@/types';
import {formatBDT, formatDateISO} from '@/utils';

// ============================================================================
// COMPONENT
// ============================================================================

export default function WorkEntryDetailScreen({route, navigation}: any): React.ReactElement {
  const {entryId} = route.params;
  const {workEntries, updateWorkEntry, deleteWorkEntry, loading: dataLoading} = useData();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state for editing
  const [serviceName, setServiceName] = useState('');
  const [price, setPrice] = useState('');
  const [tip, setTip] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [note, setNote] = useState('');

  // Get entry from workEntries
  const entry = useMemo(() => {
    return workEntries.find(e => e.id === entryId);
  }, [entryId, workEntries]);

  // Initialize form when entering edit mode
  const initializeForm = () => {
    if (entry) {
      setServiceName(entry.serviceName);
      setPrice(entry.price.toString());
      setTip((entry.tip || 0).toString());
      setPaymentMethod(entry.paymentMethod);
      setNote(entry.note || '');
    }
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleEdit = () => {
    initializeForm();
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (!entry) return;

    const error = validateForm();
    if (error) {
      Alert.alert('Validation Error', error);
      return;
    }

    setSaving(true);
    try {
      await updateWorkEntry(entryId, {
        serviceName: serviceName.trim(),
        price: parseFloat(price),
        tip: tip ? parseFloat(tip) : 0,
        paymentMethod,
        note: note.trim() || undefined,
      });
      Alert.alert('Success', 'Entry updated');
      setIsEditing(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to update entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Entry', 'Are you sure you want to delete this work entry?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: confirmDelete,
      },
    ]);
  };

  const confirmDelete = async () => {
    setSaving(true);
    try {
      await deleteWorkEntry(entryId);
      Alert.alert('Deleted', 'Entry has been deleted', [
        {text: 'OK', onPress: () => navigation.goBack()},
      ]);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to delete entry');
      setSaving(false);
    }
  };

  const validateForm = (): string | null => {
    if (!serviceName.trim()) return 'Service name is required';
    if (!price || isNaN(parseFloat(price))) return 'Valid price is required';
    if (parseFloat(price) < 0) return 'Price must be positive';
    return null;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (dataLoading || !entry) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading entry...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isEditing) {
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
            {/* Edit Form */}
            <Text style={styles.editTitle}>Edit Work Entry</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Service Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Service name"
                value={serviceName}
                onChangeText={setServiceName}
                editable={!saving}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Price</Text>
              <View style={styles.currencyInput}>
                <Text style={styles.currencySymbol}>৳</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="numeric"
                  editable={!saving}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Tip (Optional)</Text>
              <View style={styles.currencyInput}>
                <Text style={styles.currencySymbol}>৳</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0"
                  value={tip}
                  onChangeText={setTip}
                  keyboardType="numeric"
                  editable={!saving}
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Notes (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textarea]}
                placeholder="Any notes about this entry..."
                value={note}
                onChangeText={setNote}
                multiline
                editable={!saving}
              />
            </View>

            <TouchableOpacity
              style={[styles.saveButton, saving && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={saving}>
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveButtonText}>💾 Save Changes</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancelEdit}
              disabled={saving}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.serviceHeader}>
            <Text style={styles.serviceName}>{entry.serviceName}</Text>
            {entry.edited && (
              <View style={styles.editedBadge}>
                <Text style={styles.editedText}>✏️ Edited</Text>
              </View>
            )}
          </View>

          <View style={styles.amountContainer}>
            <Text style={styles.amountLabel}>Total Amount</Text>
            <Text style={styles.amountValue}>{formatBDT(entry.price + (entry.tip || 0))}</Text>
            {entry.tip && entry.tip > 0 && (
              <Text style={styles.tipText}>
                (Service: {formatBDT(entry.price)} + Tip: {formatBDT(entry.tip)})
              </Text>
            )}
          </View>

          <View style={styles.employeeContainer}>
            <View style={styles.employeeAvatar}>
              <Text style={styles.employeeInitial}>
                {entry.employeeName.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.employeeInfo}>
              <Text style={styles.employeeLabel}>Employee</Text>
              <Text style={styles.employeeName}>{entry.employeeName}</Text>
            </View>
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <View
            style={[
              styles.paymentMethodCard,
              {backgroundColor: getPaymentMethodColor(entry.paymentMethod) + '15'},
            ]}>
            <View
              style={[
                styles.paymentMethodBadge,
                {backgroundColor: getPaymentMethodColor(entry.paymentMethod)},
              ]}>
              <Text style={styles.paymentMethodText}>
                {getPaymentMethodLabel(entry.paymentMethod)}
              </Text>
            </View>
          </View>
        </View>

        {/* Details */}
        {entry.note && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.noteText}>{entry.note}</Text>
          </View>
        )}

        {entry.edited && entry.editLogs && entry.editLogs.length > 0 && (
          <View style={styles.editWarning}>
            <Text style={styles.editWarningText}>
              ⚠️ This entry was last edited {formatDateTime(entry.updatedAt)}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit} disabled={saving}>
            <Text style={styles.editButtonText}>✏️ Edit Entry</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete} disabled={saving}>
            <Text style={styles.deleteButtonText}>🗑️ Delete Entry</Text>
          </TouchableOpacity>

          <Text style={styles.actionWarning}>⚠️ Changes affect commission calculations</Text>
        </View>

        {/* Transaction Info */}
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionText}>Entry ID: {entry.id}</Text>
          <Text style={styles.transactionText}>Created: {formatDateTime(entry.createdAt)}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getPaymentMethodColor(method: PaymentMethod): string {
  switch (method) {
    case PaymentMethod.CASH:
      return '#4CAF50';
    case PaymentMethod.BKASH:
      return '#E91E63';
    case PaymentMethod.CARD:
      return '#2196F3';
    case PaymentMethod.NAGAD:
      return '#FF9800';
    default:
      return '#757575';
  }
}

function getPaymentMethodLabel(method: PaymentMethod): string {
  switch (method) {
    case PaymentMethod.CASH:
      return 'Cash';
    case PaymentMethod.BKASH:
      return 'bKash';
    case PaymentMethod.CARD:
      return 'Card';
    case PaymentMethod.NAGAD:
      return 'Nagad';
    default:
      return method;
  }
}

function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const dateStr = formatDateISO(d);
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
  const timeStr = `${displayHours}:${displayMinutes} ${ampm}`;
  return `${dateStr} at ${timeStr}`;
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
  headerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  serviceName: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
  },
  editedBadge: {
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  editedText: {
    fontSize: 12,
    color: '#F57C00',
  },
  amountContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 4,
  },
  tipText: {
    fontSize: 13,
    color: '#757575',
  },
  employeeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  employeeAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  employeeInitial: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  employeeInfo: {
    flex: 1,
  },
  employeeLabel: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 2,
  },
  employeeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
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
  paymentMethodCard: {
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  paymentMethodBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  infoLabel: {
    fontSize: 14,
    color: '#757575',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
    textAlign: 'right',
    flex: 1,
    marginLeft: 16,
  },
  infoValueHighlight: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
  },
  editWarning: {
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  editWarningText: {
    fontSize: 13,
    color: '#F57C00',
    textAlign: 'center',
  },
  noteContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
  },
  noteLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#757575',
    marginBottom: 6,
  },
  noteText: {
    fontSize: 14,
    color: '#212121',
    lineHeight: 20,
  },
  editLogItem: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  editLogText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#212121',
    marginBottom: 4,
  },
  editLogDate: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  editLogChanges: {
    fontSize: 13,
    color: '#424242',
  },
  editButton: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  editButtonText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  deleteButtonText: {
    color: '#D32F2F',
    fontSize: 16,
    fontWeight: '600',
  },
  actionWarning: {
    fontSize: 12,
    color: '#F57C00',
    marginTop: 12,
    textAlign: 'center',
  },
  receiptInfo: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  transactionInfo: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  transactionText: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 4,
  },
  keyboardView: {
    flex: 1,
  },
  editTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#212121',
  },
  textarea: {
    minHeight: 80,
    textAlignVertical: 'top',
    paddingTop: 12,
  },
  currencyInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
    color: '#757575',
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
    color: '#212121',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 20,
  },
  cancelButtonText: {
    color: '#212121',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
