/**
 * DashboardScreen.tsx
 * Owner Dashboard - Main view showing daily summary
 */

import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useOrg} from '@/context';
import useDailySummary from '@/hooks/useDailySummary';
import SummaryCard from '@/components/SummaryCard';
import EmployeeRankCard from '@/components/EmployeeRankCard';
import DatePickerModal from '@/components/UI/DatePickerModal';
import {formatBDT} from '@/utils/currency';
import {formatDateISO, isToday} from '@/utils/date';
import {TransactionStatus, TimePeriod} from '@/types';

export default function DashboardScreen({navigation}: any): React.ReactElement {
  const {currentOrg, employeeTransactions} = useOrg();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const {summary, loading, error, refresh, timePeriod, setTimePeriod} =
    useDailySummary(selectedDate);

  // Calculate cash account stats
  const cashStats = useMemo(() => {
    const acceptedTransactions =
      employeeTransactions?.filter(t => t.status === TransactionStatus.ACCEPTED) || [];

    const totalPaidOut = acceptedTransactions.reduce((sum, t) => sum + t.amount, 0);

    // Group by employee for breakdown
    const employeePayouts: {[key: string]: {name: string; amount: number; count: number}} = {};
    acceptedTransactions.forEach(t => {
      if (!employeePayouts[t.employeeId]) {
        employeePayouts[t.employeeId] = {name: t.employeeName, amount: 0, count: 0};
      }
      employeePayouts[t.employeeId].amount += t.amount;
      employeePayouts[t.employeeId].count += 1;
    });

    return {
      totalPaidOut,
      availableCash: currentOrg?.mainCash || 0,
      totalPayoutsGiven: currentOrg?.totalPayoutsGiven || 0,
      employeePayouts: Object.values(employeePayouts).sort((a, b) => b.amount - a.amount),
    };
  }, [employeeTransactions, currentOrg]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{currentOrg?.name || 'Dashboard'}</Text>
          <Text style={styles.headerSubtitle}>
            {isToday(selectedDate) ? 'Today' : formatDateISO(selectedDate)}
          </Text>
        </View>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setDatePickerVisible(true)}
          activeOpacity={0.7}>
          <MaterialCommunityIcons name="calendar" size={16} color="#1976D2" />
          <Text style={styles.dateButtonLabel}>
            {isToday(selectedDate) ? 'Today' : formatDateISO(selectedDate)}
          </Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={refresh}
            colors={['#2196F3']}
            tintColor="#2196F3"
          />
        }>
        {/* Period Filter */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              timePeriod === TimePeriod.TODAY && styles.filterButtonActive,
            ]}
            onPress={() => setTimePeriod(TimePeriod.TODAY)}>
            <Text
              style={[
                styles.filterButtonText,
                timePeriod === TimePeriod.TODAY && styles.filterButtonTextActive,
              ]}>
              Today
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              timePeriod === TimePeriod.WEEKLY && styles.filterButtonActive,
            ]}
            onPress={() => setTimePeriod(TimePeriod.WEEKLY)}>
            <Text
              style={[
                styles.filterButtonText,
                timePeriod === TimePeriod.WEEKLY && styles.filterButtonTextActive,
              ]}>
              Weekly
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              timePeriod === TimePeriod.MONTHLY && styles.filterButtonActive,
            ]}
            onPress={() => setTimePeriod(TimePeriod.MONTHLY)}>
            <Text
              style={[
                styles.filterButtonText,
                timePeriod === TimePeriod.MONTHLY && styles.filterButtonTextActive,
              ]}>
              Monthly
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              timePeriod === TimePeriod.YEARLY && styles.filterButtonActive,
            ]}
            onPress={() => setTimePeriod(TimePeriod.YEARLY)}>
            <Text
              style={[
                styles.filterButtonText,
                timePeriod === TimePeriod.YEARLY && styles.filterButtonTextActive,
              ]}>
              Yearly
            </Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>❌ {error}</Text>
            <TouchableOpacity onPress={refresh} style={styles.retryButton}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        )}
        {!error && summary && (
          <>
            <SummaryCard
              title="Total Income"
              value={formatBDT(summary.totalIncome)}
              icon="💰"
              subtitle={`${summary.entryCount} entries`}
              color="success"
            />
            <View style={styles.gridContainer}>
              <View style={styles.gridRow}>
                <View style={styles.gridItem}>
                  <SummaryCard
                    title="Cash"
                    value={formatBDT(summary.totalCash)}
                    icon="💵"
                    color="primary"
                  />
                </View>
                <View style={styles.gridItem}>
                  <SummaryCard
                    title="bKash"
                    value={formatBDT(summary.totalBkash)}
                    iconImage={require('@/assets/Logo/bkash_payment_logo.png')}
                    color="warning"
                  />
                </View>
              </View>
              <View style={styles.gridRow}>
                <View style={styles.gridItem}>
                  <SummaryCard
                    title="Nagad"
                    value={formatBDT(summary.totalNagad)}
                    iconImage={require('@/assets/Logo/Nagad-Logo.wine.png')}
                    color="info"
                  />
                </View>
                <View style={styles.gridItem}>
                  <SummaryCard
                    title="Card"
                    value={formatBDT(summary.totalCard)}
                    icon="💳"
                    color="info"
                  />
                </View>
              </View>
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
              <View style={styles.actionsGrid}>
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonPrimary]}
                  onPress={() => navigation.navigate('AddWorkEntry')}>
                  <Text style={styles.actionButtonIcon}>➕</Text>
                  <Text style={styles.actionButtonTextPrimary}>Add Entry</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonSecondary]}
                  onPress={() => navigation.navigate('WorkEntries')}>
                  <Text style={styles.actionButtonIcon}>📋</Text>
                  <Text style={styles.actionButtonText}>View All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonSecondary]}
                  onPress={() => navigation.navigate('Reports')}>
                  <Text style={styles.actionButtonIcon}>📊</Text>
                  <Text style={styles.actionButtonText}>Reports</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionButton, styles.actionButtonSecondary]}
                  onPress={() => navigation.navigate('Employees')}>
                  <Text style={styles.actionButtonIcon}>👥</Text>
                  <Text style={styles.actionButtonText}>Employees</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Employee Payouts Section */}
            {cashStats.employeePayouts.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>💳 Employee Payouts</Text>
                <View style={styles.payoutsBreakdown}>
                  {cashStats.employeePayouts.slice(0, 5).map((payout, index) => (
                    <View key={`${payout.name}-${index}`} style={styles.payoutRow}>
                      <View>
                        <Text style={styles.payoutEmployeeName}>{payout.name}</Text>
                        <Text style={styles.payoutCount}>
                          {payout.count} transaction{payout.count > 1 ? 's' : ''}
                        </Text>
                      </View>
                      <Text style={styles.payoutAmount}>{formatBDT(payout.amount)}</Text>
                    </View>
                  ))}
                  {cashStats.employeePayouts.length > 5 && (
                    <Text style={styles.morePayouts}>
                      +{cashStats.employeePayouts.length - 5} more employees
                    </Text>
                  )}
                </View>
              </View>
            )}

            {summary.topEmployees.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>🏆 Top Performers</Text>
                <View style={styles.rankCardsContainer}>
                  {summary.topEmployees.map((employee: any, index: number) => (
                    <EmployeeRankCard
                      key={employee.employeeId}
                      rank={index + 1}
                      name={employee.employeeName}
                      totalIncome={employee.totalIncome}
                      serviceCount={employee.serviceCount}
                    />
                  ))}
                </View>
              </View>
            )}
          </>
        )}
        {!error && summary && summary.entryCount === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📭</Text>
            <Text style={styles.emptyStateTitle}>No entries yet</Text>
            <Text style={styles.emptyStateText}>
              Start adding work entries for {isToday(selectedDate) ? 'today' : 'this day'}
            </Text>
            <TouchableOpacity style={styles.emptyStateButton}>
              <Text style={styles.emptyStateButtonText}>➕ Add First Entry</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Date Picker Modal */}
      <DatePickerModal
        visible={datePickerVisible}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        onClose={() => setDatePickerVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#FAFAFA'},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 35,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 7,
    paddingBottom: 16,
  },
  headerTitle: {fontSize: 22, fontWeight: '700', color: '#212121'},
  headerSubtitle: {fontSize: 14, color: '#757575', marginTop: 4},
  dateButton: {
    flexDirection: 'column',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  dateButtonIcon: {
    fontSize: 24,
  },
  dateButtonLabel: {
    fontSize: 11,
    color: '#1976D2',
    fontWeight: '600',
  },
  scrollView: {flex: 1},
  scrollContent: {padding: 16},
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F44336',
  },
  errorText: {fontSize: 16, color: '#F44336', textAlign: 'center', marginBottom: 12},
  retryButton: {
    backgroundColor: '#F44336',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 6,
    alignSelf: 'center',
  },
  retryButtonText: {color: '#FFFFFF', fontSize: 16, fontWeight: '600'},
  gridContainer: {marginTop: 8},
  gridRow: {flexDirection: 'row', marginBottom: 8},
  gridItem: {flex: 1, marginHorizontal: 4},
  section: {marginTop: 24},
  sectionTitle: {fontSize: 20, fontWeight: '700', color: '#212121', marginBottom: 16},
  rankCardsContainer: {gap: 12},
  actionsGrid: {flexDirection: 'row', flexWrap: 'wrap', gap: 12},
  actionButton: {
    width: '48%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 100,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonPrimary: {backgroundColor: '#2196F3'},
  actionButtonSecondary: {backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#E0E0E0'},
  actionButtonIcon: {fontSize: 32, marginBottom: 8},
  actionButtonText: {fontSize: 16, fontWeight: '600', color: '#212121'},
  actionButtonTextPrimary: {fontSize: 16, fontWeight: '600', color: '#FFFFFF'},
  emptyState: {alignItems: 'center', justifyContent: 'center', paddingVertical: 64},
  emptyStateIcon: {fontSize: 64, marginBottom: 16},
  emptyStateTitle: {fontSize: 22, fontWeight: '700', color: '#212121', marginBottom: 8},
  emptyStateText: {fontSize: 16, color: '#757575', textAlign: 'center', marginBottom: 24},
  emptyStateButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyStateButtonText: {color: '#FFFFFF', fontSize: 16, fontWeight: '600'},
  bottomSpacing: {height: 24},
  // Cash Account Styles
  cashSection: {marginBottom: 24},
  cashSectionTitle: {fontSize: 18, fontWeight: '700', color: '#212121', marginBottom: 12},
  cashContainer: {flexDirection: 'row', gap: 12, marginBottom: 16},
  cashCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
  },
  cashCardAvailable: {
    backgroundColor: '#E8F5E9',
    borderLeftColor: '#4CAF50',
  },
  cashCardPaidOut: {
    backgroundColor: '#FFF3E0',
    borderLeftColor: '#FF9800',
  },
  cashLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  cashAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4CAF50',
    marginBottom: 4,
  },
  cashAmountPaidOut: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FF9800',
    marginBottom: 4,
  },
  cashSubtext: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  payoutsBreakdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  payoutsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 12,
  },
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  payoutEmployeeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  payoutCount: {
    fontSize: 12,
    color: '#999',
  },
  payoutAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF9800',
  },
  morePayouts: {
    fontSize: 12,
    color: '#2196F3',
    marginTop: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  // Period Filter Styles
  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  filterButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#666',
    textAlign: 'center',
  },
  filterButtonTextActive: {
    color: '#2196F3',
    fontWeight: '700',
  },
});
