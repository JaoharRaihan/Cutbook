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
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useOrg} from '@/context';
import useDailySummary from '@/hooks/useDailySummary';
import SummaryCard from '@/components/SummaryCard';
import EmployeeRankCard from '@/components/EmployeeRankCard';
import DatePickerModal from '@/components/UI/DatePickerModal';
import {formatBDT} from '@/utils/currency';
import {formatDateISO, isToday} from '@/utils/date';
import {TransactionStatus, TimePeriod} from '@/types';
import Theme from '@/constants/theme';

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
          <MaterialCommunityIcons name="calendar" size={16} color="#7eadf8" />
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
              title="Total Revenue "
              value={formatBDT(summary.totalIncome + summary.totalTips)}
              icon={<Text style={{fontSize: 34}}>💰</Text>}
              subtitle={`${summary.entryCount} entries`}
              color="success"
            />
            <View style={styles.gridContainer}>
              <View style={styles.gridRow}>
                <View style={styles.gridItem}>
                  <SummaryCard
                    title="Without Tips"
                    value={formatBDT(summary.totalIncome)}
                    icon={<MaterialIcons name="account-balance-wallet" size={40} color="#000000" />}
                    color="primary"
                  />
                </View>
                <View style={styles.gridItem}>
                  <SummaryCard
                    title="Tips"
                    value={formatBDT(summary.totalTips)}
                    icon={<MaterialIcons name="savings" size={40} color="#000000" />}
                    color="warning"
                  />
                </View>
              </View>
              <View style={styles.gridRow}>
                <View style={styles.gridItem}>
                  <SummaryCard
                    title="Earnings"
                    value={formatBDT(
                      cashStats.employeePayouts.reduce((sum, payout) => sum + payout.amount, 0),
                    )}
                    icon={<MaterialIcons name="payments" size={40} color="#000000" />}
                    color="info"
                  />
                </View>

                {/* paymentSummaryCard (match SummaryCard outer look) */}
                <View style={styles.gridItem}>
                  <View style={styles.paymentSummaryCard}>
                    <Text style={styles.paymentSummaryTitle}>Payment Methods</Text>

                    <View style={styles.paymentRows}>
                      <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Cash</Text>
                        <Text style={styles.paymentValue}>{formatBDT(summary.totalCash)}</Text>
                      </View>

                      <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>bKash</Text>
                        <Text style={styles.paymentValue}>{formatBDT(summary.totalBkash)}</Text>
                      </View>

                      <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Nagad</Text>
                        <Text style={styles.paymentValue}>{formatBDT(summary.totalNagad)}</Text>
                      </View>

                      <View style={styles.paymentRow}>
                        <Text style={styles.paymentLabel}>Card</Text>
                        <Text style={styles.paymentValue}>{formatBDT(summary.totalCard)}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>
            {!error && summary && summary.entryCount === 0 && (
              <View style={styles.emptyState}>
                <TouchableOpacity
                  style={styles.emptyStateButton}
                  onPress={() => navigation.navigate('AddWorkEntry')}>
                  <View style={{alignItems: 'center', justifyContent: 'center'}}>
                    <MaterialIcons name="note-add" size={50} color="#ffffff" />
                    <Text style={styles.emptyStateButtonText}> Create today first entry </Text>
                  </View>
                </TouchableOpacity>
              </View>
            )}
            <View style={styles.bottomSpacing} />
            <Text style={styles.sectionTitle}>⚡ Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonPrimary]}
                onPress={() => navigation.navigate('AddWorkEntry')}>
                <MaterialIcons name="note-add" size={50} color="#f3e7e7" />
                <Text style={styles.actionButtonTextPrimary}>Add WORK Entry</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonSecondary]}
                onPress={() => navigation.navigate('WorkEntries')}>
                <MaterialIcons name="table-view" size={50} color="#000000" />
                <Text style={styles.actionButtonText}>Entry History</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonSecondary]}
                onPress={() => navigation.navigate('Reports')}>
                <MaterialIcons name="bar-chart" size={50} color="#000000" />
                <Text style={styles.actionButtonText}>Summary</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.actionButtonSecondary]}
                onPress={() => navigation.navigate('Employees')}>
                <MaterialIcons name="people" size={50} color="#000000" />
                <Text style={styles.actionButtonText}>Employees</Text>
              </TouchableOpacity>
            </View>

            {/* Employee Payouts Section */}
            {cashStats.employeePayouts.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Employees Received Money</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#e8f3ef',
    borderBottomWidth: 1,
    borderBottomColor: '#EAEAEA',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 4,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1C1C1C',
  },

  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },

  dateButton: {
    flexDirection: 'column',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: '#EAEAEA',
    borderWidth: 1,
    borderColor: '#7eadf8',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },

  dateButtonIcon: {
    fontSize: 22,
  },

  dateButtonLabel: {
    fontSize: 9,
    color: '#7eadf8',
    fontWeight: '600',
  },

  scrollView: {
    flex: 1,
  },

  scrollContent: {
    padding: 16,
  },

  errorContainer: {
    backgroundColor: '#FEE2E2',
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },

  errorText: {
    fontSize: 15,
    color: '#DC2626',
    textAlign: 'center',
    marginBottom: 10,
  },

  retryButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: 'center',
  },

  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },

  gridContainer: {
    marginTop: 8,
  },

  gridRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },

  gridItem: {
    flex: 1,
    marginHorizontal: 4,
  },
  paymentSummaryCard: {
    padding: 16,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: '#4FC3F7',
    backgroundColor: '#4FC3F7',
    ...Theme.shadows.sm,
    marginHorizontal: 0,
  },

  paymentSummaryTitle: {
    fontSize: 10,
    fontWeight: '500',
    color: '#530b0b',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },

  paymentRows: {
    gap: 0,
  },

  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: Theme.colors.neutral[200],
  },

  paymentLabel: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },

  paymentValue: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  section: {
    marginTop: 16,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },

  rankCardsContainer: {
    gap: 12,
  },

  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },

  actionButton: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 95,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },

  actionButtonPrimary: {
    backgroundColor: '#000000',
  },

  actionButtonSecondary: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  actionButtonIcon: {
    fontSize: 30,
    marginBottom: 6,
  },

  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#020202',
  },

  actionButtonTextPrimary: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff',
  },

  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
  },

  emptyStateIcon: {
    fontSize: 60,
    marginBottom: 12,
  },

  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },

  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 20,
  },

  emptyStateButton: {
    backgroundColor: '#000000',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 3},
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },

  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    paddingHorizontal: 10,
  },

  bottomSpacing: {
    height: 24,
    marginTop: -20,
  },

  cashSection: {
    marginBottom: 20,
  },

  cashSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },

  cashContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 14,
  },

  cashCard: {
    flex: 1,
    padding: 14,
    borderRadius: 12,
    borderLeftWidth: 4,
  },

  cashCardAvailable: {
    backgroundColor: '#ECFDF5',
    borderLeftColor: '#10B981',
  },

  cashCardPaidOut: {
    backgroundColor: '#FFF7ED',
    borderLeftColor: '#F97316',
  },

  cashLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 6,
    fontWeight: '600',
  },

  cashAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: '#10B981',
    marginBottom: 4,
  },

  cashAmountPaidOut: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F97316',
    marginBottom: 4,
  },

  cashSubtext: {
    fontSize: 11,
    color: '#9CA3AF',
  },

  payoutsBreakdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  payoutsTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },

  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },

  payoutEmployeeName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },

  payoutCount: {
    fontSize: 11,
    color: '#9CA3AF',
  },

  payoutAmount: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F97316',
  },

  morePayouts: {
    fontSize: 12,
    color: '#2196F3',
    marginTop: 10,
    fontWeight: '600',
    textAlign: 'center',
  },

  filterContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 4,
  },

  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },

  filterButtonActive: {
    backgroundColor: '#e8f3ef',
    borderColor: '#10B981',
  },

  filterButtonText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#10B981',
    textAlign: 'center',
  },

  filterButtonTextActive: {
    color: '#10B981',
    fontWeight: '700',
  },
});
