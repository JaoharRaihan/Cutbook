/**
 * ProfileScreen.tsx
 * Employee profile with personal info and stats
 */

import React, {useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
} from 'react-native';
import {useAuth, useOrg} from '@/context';
import {WorkEntry, PaymentMethod} from '@/types';
import {formatBDT} from '@/utils';

// ============================================================================
// COMPONENT
// ============================================================================

export default function ProfileScreen(): React.ReactElement {
  const {user: currentUser, logout} = useAuth();
  const {currentOrg} = useOrg();

  // Mock work entries for stats calculation
  const mockEntries: WorkEntry[] = [
    {
      id: 'entry_1',
      orgId: 'org_1',
      employeeId: 'user_2',
      employeeName: 'Karim Ahmed',
      serviceName: 'Regular Haircut',
      price: 300,
      tip: 50,
      paymentMethod: PaymentMethod.CASH,
      createdBy: 'user_1',
      createdByName: 'Owner',
      createdAt: new Date(),
      updatedAt: new Date(),
      edited: false,
    },
    {
      id: 'entry_2',
      orgId: 'org_1',
      employeeId: 'user_2',
      employeeName: 'Karim Ahmed',
      serviceName: 'Beard Trim',
      price: 150,
      tip: 0,
      paymentMethod: PaymentMethod.BKASH,
      createdBy: 'user_1',
      createdByName: 'Owner',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      edited: false,
    },
    {
      id: 'entry_3',
      orgId: 'org_1',
      employeeId: 'user_2',
      employeeName: 'Karim Ahmed',
      serviceName: 'Hair Color',
      price: 800,
      tip: 100,
      paymentMethod: PaymentMethod.CARD,
      createdBy: 'user_1',
      createdByName: 'Owner',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      edited: false,
    },
    {
      id: 'entry_4',
      orgId: 'org_1',
      employeeId: 'user_2',
      employeeName: 'Karim Ahmed',
      serviceName: 'Facial Treatment',
      price: 600,
      tip: 50,
      paymentMethod: PaymentMethod.CASH,
      createdBy: 'user_1',
      createdByName: 'Owner',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      edited: false,
    },
  ];

  // Calculate overall stats
  const overallStats = useMemo(() => {
    const totalServices = mockEntries.length;
    const totalIncome = mockEntries.reduce((sum, entry) => sum + entry.price + (entry.tip || 0), 0);
    const totalTips = mockEntries.reduce((sum, entry) => sum + (entry.tip || 0), 0);
    const avgPerService = totalServices > 0 ? totalIncome / totalServices : 0;

    // Calculate this month stats
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEntries = mockEntries.filter(entry => new Date(entry.createdAt) >= monthStart);
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
  }, [mockEntries]);

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

        {/* Personal Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Personal Information</Text>

          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoValue}>{currentUser?.phone}</Text>
            </View>

            {currentUser?.email && (
              <>
                <View style={styles.infoDivider} />
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Email</Text>
                  <Text style={styles.infoValue}>{currentUser.email}</Text>
                </View>
              </>
            )}

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

        {/* Commission Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>💰 Commission</Text>

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

        {/* Overall Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Overall Statistics</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>✂️</Text>
              <Text style={styles.statLabel}>Total Services</Text>
              <Text style={styles.statValue}>{overallStats.totalServices}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>💵</Text>
              <Text style={styles.statLabel}>Total Income</Text>
              <Text style={styles.statValue}>{formatBDT(overallStats.totalIncome)}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>🎁</Text>
              <Text style={styles.statLabel}>Total Tips</Text>
              <Text style={styles.statValue}>{formatBDT(overallStats.totalTips)}</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📈</Text>
              <Text style={styles.statLabel}>Avg per Service</Text>
              <Text style={styles.statValue}>
                {formatBDT(Math.round(overallStats.avgPerService))}
              </Text>
            </View>
          </View>
        </View>

        {/* This Month */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📅 This Month</Text>

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

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>🚪 Logout</Text>
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
    backgroundColor: '#2196F3',
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
    backgroundColor: '#1976D2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  avatarLargeText: {
    fontSize: 40,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
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
    color: '#BDBDBD',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 11,
    color: '#E0E0E0',
  },
});
