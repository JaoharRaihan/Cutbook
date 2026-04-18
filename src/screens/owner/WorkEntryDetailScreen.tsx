/**
 * WorkEntryDetailScreen.tsx
 * Detailed view of a work entry with edit/delete actions
 */

import React, {useState, useEffect} from 'react';
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
} from 'react-native';
import {WorkEntry, PaymentMethod} from '@/types';
import {formatBDT, formatDateISO} from '@/utils';

// ============================================================================
// COMPONENT
// ============================================================================

export default function WorkEntryDetailScreen({route, navigation}: any): React.ReactElement {
  const {entryId} = route.params;
  const [loading, setLoading] = useState(true);
  const [entry, setEntry] = useState<WorkEntry | null>(null);

  // Mock entry data
  const mockEntry: WorkEntry = {
    id: 'entry_1',
    orgId: 'org_1',
    employeeId: 'user_2',
    employeeName: 'Karim Ahmed',
    serviceId: 'service_1',
    serviceName: 'Regular Haircut',
    price: 300,
    tip: 50,
    paymentMethod: PaymentMethod.CASH,
    note: 'Customer requested extra styling',
    createdBy: 'user_1',
    createdByName: 'Owner Name',
    createdAt: new Date(),
    updatedAt: new Date(),
    edited: false,
  };

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    loadEntry();
  }, [entryId]);

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadEntry = async () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setEntry(mockEntry);
      setLoading(false);
    }, 500);
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleEdit = () => {
    Alert.alert('Edit Entry', 'Edit functionality will be implemented in a future update.', [
      {text: 'OK'},
    ]);
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this work entry? This action cannot be undone.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: confirmDelete,
        },
      ],
    );
  };

  const confirmDelete = () => {
    Alert.alert('Deleted', 'Work entry has been deleted.', [
      {
        text: 'OK',
        onPress: () => navigation.goBack(),
      },
    ]);
  };

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  const getPaymentMethodColor = (method: PaymentMethod): string => {
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
  };

  const getPaymentMethodLabel = (method: PaymentMethod): string => {
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
  };

  const formatDateTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const dateStr = formatDateISO(d);
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const timeStr = `${displayHours}:${displayMinutes} ${ampm}`;
    return `${dateStr} at ${timeStr}`;
  };

  // ============================================================================
  // RENDER METHODS
  // ============================================================================

  const renderInfoRow = (label: string, value: string, highlight?: boolean) => {
    return (
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={[styles.infoValue, highlight && styles.infoValueHighlight]}>{value}</Text>
      </View>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading || !entry) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading entry...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const totalAmount = entry.price + (entry.tip || 0);

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
            <Text style={styles.amountValue}>{formatBDT(totalAmount)}</Text>
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

        {/* Details Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Details</Text>

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

          {renderInfoRow('Service Price', formatBDT(entry.price))}
          {entry.tip && entry.tip > 0 && renderInfoRow('Tip', formatBDT(entry.tip))}
          {renderInfoRow('Total', formatBDT(totalAmount), true)}
        </View>

        {/* Transaction Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Information</Text>

          {renderInfoRow('Created By', entry.createdByName)}
          {renderInfoRow('Created At', formatDateTime(entry.createdAt))}
          {entry.edited && entry.updatedAt && (
            <>
              {renderInfoRow('Last Updated', formatDateTime(entry.updatedAt))}
              <View style={styles.editWarning}>
                <Text style={styles.editWarningText}>⚠️ This entry has been modified</Text>
              </View>
            </>
          )}
        </View>

        {/* Service Details */}
        {(entry.serviceId || entry.note) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Additional Details</Text>

            {entry.serviceId && renderInfoRow('Service ID', entry.serviceId)}
            {entry.note && (
              <View style={styles.noteContainer}>
                <Text style={styles.noteLabel}>Notes:</Text>
                <Text style={styles.noteText}>{entry.note}</Text>
              </View>
            )}
          </View>
        )}

        {/* Edit History */}
        {entry.edited && entry.editLogs && entry.editLogs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Edit History</Text>

            {entry.editLogs.map((log, index) => (
              <View key={index} style={styles.editLogItem}>
                <Text style={styles.editLogText}>Edited by {log.editedByName || 'Unknown'}</Text>
                <Text style={styles.editLogDate}>{formatDateTime(new Date(log.timestamp))}</Text>
                {log.reason && <Text style={styles.editLogChanges}>Reason: {log.reason}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>

          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.editButtonText}>✏️ Edit Entry</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteButtonText}>🗑️ Delete Entry</Text>
          </TouchableOpacity>

          <Text style={styles.actionWarning}>
            ⚠️ Changes to work entries affect commission calculations
          </Text>
        </View>

        {/* Receipt Info */}
        <View style={styles.receiptInfo}>
          <Text style={styles.receiptText}>Entry ID: {entry.id}</Text>
          {entry.receiptNumber && (
            <Text style={styles.receiptText}>Receipt: #{entry.receiptNumber}</Text>
          )}
        </View>
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
  receiptText: {
    fontSize: 12,
    color: '#9E9E9E',
    marginBottom: 4,
  },
});
