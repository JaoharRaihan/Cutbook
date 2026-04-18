/**
 * HistoryScreen.tsx
 * Employee work history with monthly filtering
 */

import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  RefreshControl,
  Modal,
  ActivityIndicator,
} from 'react-native';
import {useAuth, useData} from '@/context';
import {WorkEntry, PaymentMethod} from '@/types';
import {formatBDT} from '@/utils';

// ============================================================================
// COMPONENT
// ============================================================================

export default function HistoryScreen(): React.ReactElement {
  const {user: currentUser} = useAuth();
  const {workEntries, loading, refreshData} = useData();
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Generate month options (last 12 months)
  const monthOptions = useMemo(() => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      months.push(date);
    }
    return months;
  }, []);

  // Filter for current employee's entries
  const myEntries = useMemo(() => {
    return workEntries.filter(entry => entry.employeeId === currentUser?.id);
  }, [workEntries, currentUser]);

  // Filter entries by selected month
  const filteredEntries = useMemo(() => {
    const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
    const monthEnd = new Date(
      selectedMonth.getFullYear(),
      selectedMonth.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    return myEntries
      .filter(entry => {
        const entryDate = new Date(entry.createdAt);
        return entryDate >= monthStart && entryDate <= monthEnd;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [selectedMonth, myEntries]);

  // Calculate monthly totals
  const monthlyStats = useMemo(() => {
    const totalIncome = filteredEntries.reduce(
      (sum, entry) => sum + entry.price + (entry.tip || 0),
      0,
    );
    const totalTips = filteredEntries.reduce((sum, entry) => sum + (entry.tip || 0), 0);
    const totalServices = filteredEntries.length;

    return {totalIncome, totalTips, totalServices};
  }, [filteredEntries]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } catch (error) {
      console.error('Error refreshing history:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleMonthSelect = (month: Date) => {
    setSelectedMonth(month);
    setModalVisible(false);
  };

  // ============================================================================
  // FORMAT HELPERS
  // ============================================================================

  const formatMonthYear = (date: Date): string => {
    return date.toLocaleDateString('en-US', {month: 'long', year: 'numeric'});
  };

  const formatDate = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

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

  // ============================================================================
  // RENDER METHODS
  // ============================================================================

  const renderEntry = ({item}: {item: WorkEntry}) => {
    const totalAmount = item.price + (item.tip || 0);

    return (
      <View style={styles.entryCard}>
        <View style={styles.entryHeader}>
          <View style={styles.entryDateContainer}>
            <Text style={styles.entryDate}>{formatDate(item.createdAt)}</Text>
            <Text style={styles.entryTime}>{formatTime(item.createdAt)}</Text>
          </View>
          <View
            style={[
              styles.paymentBadge,
              {backgroundColor: getPaymentMethodColor(item.paymentMethod)},
            ]}>
            <Text style={styles.paymentBadgeText}>{getPaymentMethodLabel(item.paymentMethod)}</Text>
          </View>
        </View>

        <Text style={styles.entryService}>{item.serviceName}</Text>

        <View style={styles.entryFooter}>
          <View style={styles.entryPriceContainer}>
            <Text style={styles.entryPriceLabel}>Service:</Text>
            <Text style={styles.entryPrice}>{formatBDT(item.price)}</Text>
          </View>
          {item.tip && item.tip > 0 && (
            <View style={styles.entryTipContainer}>
              <Text style={styles.entryTipLabel}>Tip:</Text>
              <Text style={styles.entryTip}>{formatBDT(item.tip)}</Text>
            </View>
          )}
        </View>

        <View style={styles.entryTotal}>
          <Text style={styles.entryTotalLabel}>Total</Text>
          <Text style={styles.entryTotalAmount}>{formatBDT(totalAmount)}</Text>
        </View>
      </View>
    );
  };

  const renderMonthOption = (month: Date) => {
    const isSelected =
      month.getMonth() === selectedMonth.getMonth() &&
      month.getFullYear() === selectedMonth.getFullYear();

    return (
      <TouchableOpacity
        key={month.toISOString()}
        style={[styles.monthOption, isSelected && styles.monthOptionSelected]}
        onPress={() => handleMonthSelect(month)}>
        <Text style={[styles.monthOptionText, isSelected && styles.monthOptionTextSelected]}>
          {formatMonthYear(month)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <>
      {/* Month Selector */}
      <TouchableOpacity style={styles.monthSelector} onPress={() => setModalVisible(true)}>
        <View>
          <Text style={styles.monthSelectorLabel}>Selected Month</Text>
          <Text style={styles.monthSelectorValue}>{formatMonthYear(selectedMonth)}</Text>
        </View>
        <Text style={styles.monthSelectorIcon}>📅</Text>
      </TouchableOpacity>

      {/* Monthly Summary */}
      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>📊 Monthly Summary</Text>
        </View>

        <View style={styles.summaryGrid}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>Total Income</Text>
            <Text style={styles.summaryItemValue}>{formatBDT(monthlyStats.totalIncome)}</Text>
            {currentUser?.commissionPercentage && (
              <Text style={styles.summaryItemSubtext}>
                Your {currentUser.commissionPercentage}%: ৳
                {Math.round((monthlyStats.totalIncome * currentUser.commissionPercentage) / 100)}
              </Text>
            )}
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>Services</Text>
            <Text style={styles.summaryItemValue}>{monthlyStats.totalServices}</Text>
            <Text style={styles.summaryItemSubtext}>
              {monthlyStats.totalServices === 0 ? 'No services' : 'Completed'}
            </Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryItem}>
            <Text style={styles.summaryItemLabel}>Tips</Text>
            <Text style={styles.summaryItemValue}>{formatBDT(monthlyStats.totalTips)}</Text>
            <Text style={styles.summaryItemSubtext}>
              {monthlyStats.totalTips > 0 ? 'Earned' : 'No tips'}
            </Text>
          </View>
        </View>
      </View>

      {/* Entries Header */}
      {filteredEntries.length > 0 && (
        <View style={styles.entriesHeader}>
          <Text style={styles.entriesHeaderTitle}>📝 Work History ({filteredEntries.length})</Text>
        </View>
      )}
    </>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>📭</Text>
      <Text style={styles.emptyTitle}>No services found</Text>
      <Text style={styles.emptyText}>
        You have no recorded services for {formatMonthYear(selectedMonth)}
      </Text>
    </View>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2196F3" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Work History</Text>
        <Text style={styles.headerSubtitle}>Track your performance over time</Text>
      </View>

      {/* Loading State */}
      {loading && filteredEntries.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading history...</Text>
        </View>
      ) : (
        /* Entries List */
        <FlatList
          data={filteredEntries}
          renderItem={renderEntry}
          keyExtractor={item => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#2196F3']}
            />
          }
        />
      )}

      {/* Month Selector Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Month</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={monthOptions}
              renderItem={({item}) => renderMonthOption(item)}
              keyExtractor={item => item.toISOString()}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E3F2FD',
  },
  listContent: {
    padding: 16,
    paddingBottom: 24,
  },
  monthSelector: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  monthSelectorLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 4,
  },
  monthSelectorValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  monthSelectorIcon: {
    fontSize: 32,
  },
  summaryCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  summaryHeader: {
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1976D2',
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryItemLabel: {
    fontSize: 12,
    color: '#1976D2',
    marginBottom: 6,
  },
  summaryItemValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },
  summaryItemSubtext: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '500',
  },
  summaryDivider: {
    width: 1,
    height: '100%',
    backgroundColor: '#90CAF9',
    marginHorizontal: 8,
  },
  entriesHeader: {
    marginBottom: 12,
  },
  entriesHeaderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  entryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  entryDateContainer: {},
  entryDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 2,
  },
  entryTime: {
    fontSize: 12,
    color: '#757575',
  },
  paymentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  entryService: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
  },
  entryFooter: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  entryPriceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  entryPriceLabel: {
    fontSize: 13,
    color: '#757575',
  },
  entryPrice: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
  },
  entryTipContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  entryTipLabel: {
    fontSize: 13,
    color: '#757575',
  },
  entryTip: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FF9800',
  },
  entryTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  entryTotalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
  },
  entryTotalAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4CAF50',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
  },
  modalClose: {
    fontSize: 24,
    color: '#757575',
    paddingHorizontal: 8,
  },
  monthOption: {
    padding: 16,
    marginHorizontal: 20,
    marginVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  monthOptionSelected: {
    backgroundColor: '#E3F2FD',
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  monthOptionText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#212121',
  },
  monthOptionTextSelected: {
    fontWeight: '700',
    color: '#2196F3',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#757575',
  },
});
