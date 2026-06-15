/**
 * EmployeeTransactionsScreen.tsx
 * Employee view for pending payment transactions
 */

import React, {useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {TransactionStatus} from '@/types';
import {useAuth} from '@/context';
import {useOrg} from '@/context';
import {formatBDT} from '@/utils/currency';
import {formatDateISO} from '@/utils/date';

export default function EmployeeTransactionsScreen(): React.ReactElement {
  const {user} = useAuth();
  const {employeeTransactions, respondToTransaction, loading} = useOrg();
  const [respondingTo, setRespondingTo] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  // Filter transactions for current employee
  const myTransactions = useMemo(() => {
    if (!user?.id) return [];
    return employeeTransactions.filter(t => t.employeeId === user.id);
  }, [employeeTransactions, user?.id]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Just wait a moment since data is already real-time synced
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleRespond = async (transactionId: string, status: TransactionStatus) => {
    setRespondingTo(transactionId);
    try {
      await respondToTransaction(transactionId, status);
      const action = status === TransactionStatus.ACCEPTED ? 'Accepted' : 'Rejected';
      Alert.alert('Success', `Payment ${action.toLowerCase()}`);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to respond to transaction');
    } finally {
      setRespondingTo(null);
    }
  };

  const getStatusColor = (status: TransactionStatus): string => {
    switch (status) {
      case TransactionStatus.PENDING:
        return '#FFC107';
      case TransactionStatus.ACCEPTED:
        return '#4CAF50';
      case TransactionStatus.REJECTED:
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusLabel = (status: TransactionStatus): string => {
    switch (status) {
      case TransactionStatus.PENDING:
        return 'Pending';
      case TransactionStatus.ACCEPTED:
        return 'Accepted';
      case TransactionStatus.REJECTED:
        return 'Rejected';
      default:
        return 'Unknown';
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading payments...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} colors={['#2196F3']} />
        }>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Payments</Text>
          <Text style={styles.headerSubtitle}>
            {myTransactions.length === 0
              ? 'No payments yet'
              : `${myTransactions.length} payment(s)`}
          </Text>
        </View>

        {myTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📭</Text>
            <Text style={styles.emptyStateTitle}>No Payments</Text>
            <Text style={styles.emptyStateMessage}>
              When your owner sends you a payment, it will appear here
            </Text>
          </View>
        ) : (
          <View>
            {myTransactions.map((transaction: any) => (
              <View key={transaction.id} style={styles.transactionCard}>
                <View style={styles.transactionHeader}>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.senderName}>{transaction.ownerName}</Text>
                    <Text style={styles.transactionDate}>
                      {formatDateISO(transaction.createdAt)}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      {backgroundColor: getStatusColor(transaction.status) + '20'},
                    ]}>
                    <Text style={[styles.statusText, {color: getStatusColor(transaction.status)}]}>
                      {getStatusLabel(transaction.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.amountContainer}>
                  <Text style={styles.amountLabel}>Amount</Text>
                  <Text style={styles.amount}>{formatBDT(transaction.amount)}</Text>
                </View>

                {transaction.note && (
                  <View style={styles.noteContainer}>
                    <Text style={styles.noteLabel}>Note</Text>
                    <Text style={styles.noteText}>{transaction.note}</Text>
                  </View>
                )}

                {transaction.status === TransactionStatus.PENDING && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[
                        styles.rejectButton,
                        respondingTo === transaction.id && styles.buttonDisabled,
                      ]}
                      onPress={() => handleRespond(transaction.id, TransactionStatus.REJECTED)}
                      disabled={respondingTo === transaction.id}>
                      {respondingTo === transaction.id ? (
                        <ActivityIndicator color="#F44336" size="small" />
                      ) : (
                        <>
                          <Text style={styles.rejectButtonIcon}>✕</Text>
                          <Text style={styles.rejectButtonText}>Reject</Text>
                        </>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.acceptButton,
                        respondingTo === transaction.id && styles.buttonDisabled,
                      ]}
                      onPress={() => handleRespond(transaction.id, TransactionStatus.ACCEPTED)}
                      disabled={respondingTo === transaction.id}>
                      {respondingTo === transaction.id ? (
                        <ActivityIndicator color="#FFFFFF" size="small" />
                      ) : (
                        <>
                          <Text style={styles.acceptButtonIcon}>✓</Text>
                          <Text style={styles.acceptButtonText}>Accept</Text>
                        </>
                      )}
                    </TouchableOpacity>
                  </View>
                )}

                {transaction.status === TransactionStatus.ACCEPTED && (
                  <View style={styles.acceptedInfo}>
                    <Text style={styles.acceptedIcon}>✓</Text>
                    <View>
                      <Text style={styles.acceptedLabel}>Accepted</Text>
                      <Text style={styles.acceptedDate}>
                        {transaction.respondedAt ? formatDateISO(transaction.respondedAt) : ''}
                      </Text>
                    </View>
                  </View>
                )}

                {transaction.status === TransactionStatus.REJECTED && (
                  <View style={styles.rejectedInfo}>
                    <Text style={styles.rejectedIcon}>✕</Text>
                    <View>
                      <Text style={styles.rejectedLabel}>Rejected</Text>
                      <Text style={styles.rejectedDate}>
                        {transaction.respondedAt ? formatDateISO(transaction.respondedAt) : ''}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            ))}
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
    paddingTop: 16,
  },
  header: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#757575',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  emptyStateMessage: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 20,
  },
  transactionCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#999999',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  amountContainer: {
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
    fontWeight: '500',
  },
  amount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1976D2',
  },
  noteContainer: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  noteLabel: {
    fontSize: 11,
    color: '#757575',
    marginBottom: 4,
    fontWeight: '500',
  },
  noteText: {
    fontSize: 14,
    color: '#212121',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  rejectButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#F44336',
    gap: 6,
  },
  rejectButtonIcon: {
    fontSize: 18,
    color: '#F44336',
  },
  rejectButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#F44336',
  },
  acceptButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    paddingVertical: 10,
    gap: 6,
  },
  acceptButtonIcon: {
    fontSize: 18,
    color: '#FFFFFF',
  },
  acceptButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  acceptedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
  },
  acceptedIcon: {
    fontSize: 20,
    color: '#4CAF50',
    fontWeight: '700',
  },
  acceptedLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 2,
  },
  acceptedDate: {
    fontSize: 12,
    color: '#558B2F',
  },
  rejectedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 10,
  },
  rejectedIcon: {
    fontSize: 20,
    color: '#F44336',
    fontWeight: '700',
  },
  rejectedLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#C62828',
    marginBottom: 2,
  },
  rejectedDate: {
    fontSize: 12,
    color: '#E53935',
  },
});
