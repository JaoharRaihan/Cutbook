/**
 * EmployeeHomeScreen.tsx
 * Employee home screen showing today's summary and recent entries
 */

import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  RefreshControl,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAuth, useOrg, useData} from '@/context';
import {WorkEntry, PaymentMethod, EmployeePermission} from '@/types';
import {formatBDT} from '@/utils';
import MaterialIcons from '@react-native-vector-icons/material-icons';

// ============================================================================
// COMPONENT
// ============================================================================

export default function EmployeeHomeScreen({navigation}: any): React.ReactElement {
  const {user: currentUser} = useAuth();
  const {currentOrg} = useOrg();
  const {workEntries, refreshData} = useData();
  const [refreshing, setRefreshing] = useState(false);

  const todayStr = useMemo(() => {
    const today = new Date();
    return today.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  // Filter for current employee's entries
  const myEntries = useMemo(() => {
    return workEntries.filter(entry => entry.employeeId === currentUser?.id);
  }, [workEntries, currentUser]);

  // Filter for today's entries
  const todayEntries = useMemo(() => {
    const today = new Date();
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

    return myEntries.filter(entry => {
      const entryDate = new Date(entry.createdAt);
      return entryDate >= todayStart && entryDate < todayEnd;
    });
  }, [myEntries]);

  // Calculate today's stats
  const todayStats = useMemo(() => {
    const totalServices = todayEntries.length;
    const totalIncome = todayEntries.reduce(
      (sum, entry) => sum + entry.price + (entry.tip || 0),
      0,
    );
    const totalTips = todayEntries.reduce((sum, entry) => sum + (entry.tip || 0), 0);

    return {totalServices, totalIncome, totalTips};
  }, [todayEntries]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshData();
    } catch (error) {
      console.error('Error refreshing data:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleViewHistory = () => {
    navigation.navigate('History');
  };

  const handleAddEntry = () => {
    // Check if employee has permission to add entries
    const canAddEntries =
      currentUser?.permissions?.includes(EmployeePermission.CAN_ADD_ENTRIES) || false;

    if (!canAddEntries) {
      Alert.alert(
        'Permission Denied',
        'Your manager has not granted you access to add work entries. Please contact your manager to enable this feature.',
        [{text: 'OK'}],
      );
      return;
    }

    // Navigate to add entry screen
    navigation.navigate('AddEntry');
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

  const renderRecentEntry = (entry: WorkEntry) => {
    const totalAmount = entry.price + (entry.tip || 0);

    return (
      <View key={entry.id} style={styles.entryCard}>
        <View style={styles.entryHeader}>
          <View style={styles.entryTimeContainer}>
            <Text style={styles.entryTime}>{formatTime(entry.createdAt)}</Text>
            <View
              style={[
                styles.paymentBadge,
                {backgroundColor: getPaymentMethodColor(entry.paymentMethod)},
              ]}>
              <Text style={styles.paymentBadgeText}>
                {getPaymentMethodLabel(entry.paymentMethod)}
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.entryService}>{entry.serviceName}</Text>

        <View style={styles.entryFooter}>
          <Text style={styles.entryPrice}>{formatBDT(totalAmount)}</Text>
          {entry.tip && entry.tip > 0 && (
            <Text style={styles.entryTip}>+{formatBDT(entry.tip)} tip</Text>
          )}
        </View>
      </View>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2196F3" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={['#2196F3']}
            tintColor="#FFFFFF"
          />
        }>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'E'}
              </Text>
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.greeting}>Hello,</Text>
              <Text style={styles.userName}>{currentUser?.name || 'Employee'}</Text>
            </View>
          </View>
          <Text style={styles.date}>{todayStr}</Text>
          <Text style={styles.orgName}>{currentOrg?.name}</Text>
        </View>

        {/* Today's Summary Cards */}
        <View style={styles.summarySection}>
          <Text style={styles.sectionTitle}>Today's Summary</Text>
          <View style={[styles.summaryCard, styles.summaryCardPrimary]}>
            <Text style={styles.summaryIcon}>💰</Text>
            <Text style={styles.summaryLabel}>Total Income</Text>
            <Text style={styles.summaryValue}>{formatBDT(todayStats.totalIncome)}</Text>
            {currentUser?.commissionPercentage && (
              <Text style={styles.summarySubtext}>
                Your {currentUser.commissionPercentage}%: ৳
                {Math.round((todayStats.totalIncome * currentUser.commissionPercentage) / 100)}
              </Text>
            )}
          </View>
        </View>
        <View style={styles.summaryGrid}>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryCarda}>
              <MaterialIcons name="content-cut" style={styles.summaryIcons} />
              <Text style={styles.summaryLabel}>Services</Text>
              <Text style={styles.summaryValue}>{todayStats.totalServices}</Text>
              <Text style={styles.summarySubtext}>
                {todayStats.totalServices === 0
                  ? 'No services yet'
                  : todayStats.totalServices === 1
                    ? 'Keep it up!'
                    : 'Great work!'}
              </Text>
            </View>

            <View style={styles.summaryCarda}>
              <MaterialIcons name="savings" style={styles.summaryIcons} />
              <Text style={styles.summaryLabel}>Tips</Text>
              <Text style={styles.summaryValue}>{formatBDT(todayStats.totalTips)}</Text>
              <Text style={styles.summarySubtext}>
                {todayStats.totalTips > 0 ? 'Excellent!' : 'No tips yet'}
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Entries */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Services</Text>
            {todayEntries.length > 0 && (
              <TouchableOpacity onPress={handleViewHistory}>
                <Text style={styles.viewAllLink}>View All →</Text>
              </TouchableOpacity>
            )}
          </View>

          {todayEntries.length > 0 ? (
            <View style={styles.entriesList}>
              {todayEntries.slice(0, 5).map(entry => renderRecentEntry(entry))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <MaterialIcons name="library-add" style={styles.emptyIcon} />
              <Text style={styles.emptyTitle}>No services yet today</Text>
              <Text style={styles.emptyText}>Your completed services will appear here</Text>
            </View>
          )}

          {todayEntries.length > 5 && (
            <TouchableOpacity style={styles.viewAllButton} onPress={handleViewHistory}>
              <Text style={styles.viewAllButtonText}>View All {todayEntries.length} Services</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Stats Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}> Your Info</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Commission Rate</Text>
              <Text style={styles.infoValue}>{currentUser?.commissionPercentage || 0}%</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{currentUser?.phone}</Text>
            </View>
            {/* {currentUser?.email && (
              <>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{currentUser.email}</Text>
                </View>
              </>
            )} */}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          {(currentUser?.permissions?.includes(EmployeePermission.CAN_ADD_ENTRIES) || false) && (
            <TouchableOpacity style={styles.actionButton} onPress={handleAddEntry}>
              <MaterialIcons name="domain-add" style={styles.actionButtonIcon} />
              <Text style={styles.actionButtonText}>Add Entry</Text>
            </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    backgroundColor: '#e8f3ef',
    paddingHorizontal: 20,
    paddingTop: 7,
    paddingBottom: 4,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerInfo: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 2,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000000',
  },
  date: {
    fontSize: 14,
    color: '#000000',
    marginTop: 8,
  },
  orgName: {
    fontSize: 13,
    color: '#ea2f16',
    marginTop: 4,
  },
  summarySection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 16,
  },
  summaryGrid: {
    gap: 2,
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryCardPrimary: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  summaryIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  summaryIcons: {
    fontSize: 30,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  viewAllLink: {
    fontSize: 14,
    color: '#2196F3',
    fontWeight: '600',
  },
  entriesList: {
    gap: 12,
  },
  entryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  entryHeader: {
    marginBottom: 8,
  },
  entryTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  entryTime: {
    fontSize: 13,
    color: '#757575',
    fontWeight: '500',
  },
  paymentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  paymentBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  entryService: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 8,
  },
  entryFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  entryPrice: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  entryTip: {
    fontSize: 13,
    color: '#FF9800',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
  viewAllButton: {
    backgroundColor: '#E3F2FD',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  viewAllButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2196F3',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#757575',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#F5F5F5',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  actionButtonIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  summaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingHorizontal: 15,
  },

  summaryCarda: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#c0c3c0',
  },
});
