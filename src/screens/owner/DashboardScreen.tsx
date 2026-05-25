/**
 * DashboardScreen.tsx
 * Owner Dashboard - Main view showing daily summary
 */

import React, {useState} from 'react';
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
import {useOrg} from '@/context';
import useDailySummary from '@/hooks/useDailySummary';
import SummaryCard from '@/components/SummaryCard';
import EmployeeRankCard from '@/components/EmployeeRankCard';
import {formatBDT} from '@/utils/currency';
import {formatDateISO, isToday} from '@/utils/date';

export default function DashboardScreen({navigation}: any): React.ReactElement {
  const {currentOrg} = useOrg();
  const [selectedDate] = useState<Date>(new Date());
  const {summary, loading, error, refresh} = useDailySummary(selectedDate);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{currentOrg?.name || 'Dashboard'}</Text>
          <Text style={styles.headerSubtitle}>
            {isToday(selectedDate) ? 'Today' : formatDateISO(selectedDate)}
          </Text>
        </View>
        <TouchableOpacity style={styles.dateButton}>
          <Text style={styles.dateButtonText}>📅</Text>
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
                    icon="📱"
                    color="warning"
                  />
                </View>
              </View>
              <View style={styles.gridRow}>
                <View style={styles.gridItem}>
                  <SummaryCard
                    title="Nagad"
                    value={formatBDT(summary.totalNagad)}
                    icon="💳"
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
                  <Text style={styles.actionButtonIcon}>�</Text>
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
          </>
        )}
        {!error && summary && summary.entryCount === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>��</Text>
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
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: {fontSize: 22, fontWeight: '700', color: '#212121'},
  headerSubtitle: {fontSize: 14, color: '#757575', marginTop: 4},
  dateButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  dateButtonText: {fontSize: 24},
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
});
