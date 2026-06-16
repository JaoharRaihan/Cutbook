/**
 * ProfileScreen.tsx
 * Employee profile with personal info and stats
 */

import React, {useMemo} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useAuth, useOrg, useData} from '@/context';
import {TransactionStatus} from '@/types';
import {formatBDT} from '@/utils';
import MaterialIcons from '@react-native-vector-icons/material-icons';

// ============================================================================
// COMPONENT
// ============================================================================

export default function ProfileScreen(): React.ReactElement {
  const {user: currentUser, logout} = useAuth();
  const {currentOrg, employeeTransactions} = useOrg();
  const {workEntries} = useData();

  // Get real work entries for this employee
  const employeeEntries = useMemo(() => {
    if (!currentUser?.id || !workEntries) return [];
    return workEntries.filter(e => e.employeeId === currentUser.id);
  }, [currentUser?.id, workEntries]);

  // Get accepted transactions total for cash account
  const cashAccount = useMemo(() => {
    if (!currentUser?.id || !employeeTransactions) return {received: 0, pending: 0};
    const accepted = employeeTransactions
      .filter(t => t.employeeId === currentUser.id && t.status === TransactionStatus.ACCEPTED)
      .reduce((sum, t) => sum + t.amount, 0);
    const pending = employeeTransactions
      .filter(t => t.employeeId === currentUser.id && t.status === TransactionStatus.PENDING)
      .reduce((sum, t) => sum + t.amount, 0);
    return {received: accepted, pending};
  }, [currentUser?.id, employeeTransactions]);

  // Calculate overall stats from real work entries
  const overallStats = useMemo(() => {
    const entries = employeeEntries;
    const totalServices = entries.length;
    const totalIncome = entries.reduce((sum, entry) => sum + entry.price + (entry.tip || 0), 0);
    const totalTips = entries.reduce((sum, entry) => sum + (entry.tip || 0), 0);
    const avgPerService = totalServices > 0 ? totalIncome / totalServices : 0;

    // Calculate this month stats
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEntries = entries.filter(entry => {
      const entryDate =
        typeof entry.createdAt === 'string' ? new Date(entry.createdAt) : entry.createdAt;
      return entryDate >= monthStart;
    });
    const monthIncome = monthEntries.reduce(
      (sum, entry) => sum + entry.price + (entry.tip || 0),
      0,
    );

    return {
      totalServices,
      totalIncome,
      totalTips,
      avgPerService,
      monthIncome,
      monthServices: monthEntries.length,
    };
  }, [employeeEntries]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const formatDate = (date: Date | string | undefined): string => {
    if (!date) return 'N/A';
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2196F3" />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header with Avatar */}
        <View style={styles.header}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'E'}
            </Text>
          </View>
          <Text style={styles.userName}>{currentUser?.name || 'Employee'}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleBadgeText}>Employee</Text>
          </View>
        </View>
        {/* Overall Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overall Statistics</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <MaterialIcons name="content-cut" style={styles.statIcon} />
              <Text style={styles.statLabel}>Total Services</Text>
              <Text style={styles.statValue}>{overallStats.totalServices}</Text>
            </View>

            <View style={styles.statCard}>
              <MaterialIcons name="attach-money" style={styles.statIcon} />
              <Text style={styles.statLabel}>Total Income</Text>
              <Text style={styles.statValue}>{formatBDT(overallStats.totalIncome)}</Text>
            </View>

            <View style={styles.statCard}>
              <MaterialIcons name="card-giftcard" style={styles.statIcon} />
              <Text style={styles.statLabel}>Total Tips</Text>
              <Text style={styles.statValue}>{formatBDT(overallStats.totalTips)}</Text>
            </View>

            <View style={styles.statCard}>
              <MaterialIcons name="monetization-on" style={styles.statIcon} />
              <Text style={styles.statLabel}>Your Income</Text>
              {currentUser?.commissionPercentage && (
                <Text style={styles.statValue}>
                  ৳{Math.round((overallStats.monthIncome * currentUser.commissionPercentage) / 100)}
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* This Month */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Month</Text>

          <View style={[styles.card, styles.monthCard]}>
            <View style={styles.monthRow}>
              <View style={styles.monthItem}>
                <Text style={styles.monthItemLabel}>Services</Text>
                <Text style={styles.monthItemValue}>{overallStats.monthServices}</Text>
              </View>
              <View style={styles.monthDivider} />
              <View style={styles.monthItem}>
                <Text style={styles.monthItemLabel}>Income</Text>
                <Text style={styles.monthItemValue}>{formatBDT(overallStats.monthIncome)}</Text>
              </View>
            </View>

            {currentUser?.commissionPercentage && (
              <>
                <View style={styles.monthCommissionDivider} />
                <View style={styles.monthCommission}>
                  <Text style={styles.monthCommissionLabel}>
                    Your Commission ({currentUser.commissionPercentage}%)
                  </Text>
                  <Text style={styles.monthCommissionValue}>
                    ৳
                    {Math.round(
                      (overallStats.monthIncome * currentUser.commissionPercentage) / 100,
                    )}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>
        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>

          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone Number</Text>
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

            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Organization</Text>
              <Text style={styles.infoValue}>{currentOrg?.name || 'N/A'}</Text>
            </View>

            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>{formatDate(currentUser?.createdAt)}</Text>
            </View>
          </View>
        </View>

        {/* Cash Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cash Account</Text>

          <View style={[styles.card, styles.cashCard]}>
            <View style={styles.cashRow}>
              <View style={styles.cashItem}>
                <Text style={styles.cashLabel}>Total Received</Text>
                <Text style={styles.cashValue}>{formatBDT(cashAccount.received)}</Text>
                <Text style={styles.cashSubtext}>From accepted payments</Text>
              </View>
              <View style={styles.cashDivider} />
              <View style={styles.cashItem}>
                <Text style={styles.cashLabel}>Pending</Text>
                <Text style={styles.cashValuePending}>{formatBDT(cashAccount.pending)}</Text>
                <Text style={styles.cashSubtext}>Awaiting approval</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Commission Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Commission</Text>

          <View style={[styles.card, styles.commissionCard]}>
            <View style={styles.commissionHeader}>
              <Text style={styles.commissionLabel}>Your Commission Rate</Text>
              <Text style={styles.commissionValue}>{currentUser?.commissionPercentage || 0}%</Text>
            </View>

            <View style={styles.commissionInfo}>
              <Text style={styles.commissionInfoText}>
                💡 You earn {currentUser?.commissionPercentage || 0}% of each service you complete
              </Text>
            </View>

            <View style={styles.commissionExample}>
              <Text style={styles.commissionExampleTitle}>Example:</Text>
              <View style={styles.commissionExampleRow}>
                <Text style={styles.commissionExampleLabel}>Service: ৳500</Text>
                <Text style={styles.commissionExampleValue}>
                  Your share: ৳{Math.round((500 * (currentUser?.commissionPercentage || 0)) / 100)}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>CutBook v1.0.0</Text>
          <Text style={styles.footerSubtext}>Salon Management Made Simple</Text>
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
  header: {
    backgroundColor: '#e8f3ef',
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  avatarLarge: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarLargeText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#ffffff',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: '#1976D2',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  roleBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
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
  card: {
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
    paddingVertical: 12,
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
  commissionCard: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  commissionHeader: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 16,
  },
  commissionLabel: {
    fontSize: 14,
    color: '#2E7D32',
    marginBottom: 8,
  },
  commissionValue: {
    fontSize: 48,
    fontWeight: '700',
    color: '#4CAF50',
  },
  commissionInfo: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  commissionInfoText: {
    fontSize: 13,
    color: '#2E7D32',
    lineHeight: 20,
  },
  commissionExample: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
  },
  commissionExampleTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: 8,
  },
  commissionExampleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commissionExampleLabel: {
    fontSize: 13,
    color: '#757575',
  },
  commissionExampleValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#4CAF50',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 6,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
  },
  monthCard: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  monthRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  monthItem: {
    flex: 1,
    alignItems: 'center',
  },
  monthItemLabel: {
    fontSize: 13,
    color: '#1976D2',
    marginBottom: 6,
  },
  monthItemValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
  },
  monthDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#90CAF9',
  },
  monthCommissionDivider: {
    height: 1,
    backgroundColor: '#90CAF9',
    marginVertical: 12,
  },
  monthCommission: {
    alignItems: 'center',
  },
  monthCommissionLabel: {
    fontSize: 13,
    color: '#1976D2',
    marginBottom: 6,
  },
  monthCommissionValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#4CAF50',
  },
  cashCard: {
    backgroundColor: '#E3F2FD',
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
  },
  cashRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cashItem: {
    flex: 1,
    alignItems: 'center',
  },
  cashLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
    fontWeight: '600',
  },
  cashValue: {
    fontSize: 22,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 4,
  },
  cashValuePending: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFC107',
    marginBottom: 4,
  },
  cashSubtext: {
    fontSize: 11,
    color: '#999',
    fontStyle: 'italic',
  },
  cashDivider: {
    width: 1,
    height: 60,
    backgroundColor: '#BBDEFB',
    marginHorizontal: 12,
  },
  logoutButton: {
    backgroundColor: '#F44336',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 13,
    color: '#000000',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 11,
    color: '#000000',
  },
});
