/**
 * EmployeeDetailScreen.tsx
 * View and manage employee details
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
} from 'react-native';
import {User, UserStatus, UserRole} from '@/types';
import {formatBDT} from '@/utils/currency';
import {formatDateISO} from '@/utils/date';

// ============================================================================
// COMPONENT
// ============================================================================

export default function EmployeeDetailScreen({route, navigation}: any): React.ReactElement {
  const {employeeId} = route.params;

  // Mock employee data - would normally fetch from context/API
  const employee: User = useMemo(() => {
    return {
      id: employeeId,
      name: 'Karim Rahman',
      phone: '+8801812345678',
      email: 'karim@elite.com',
      role: UserRole.EMPLOYEE,
      orgId: 'org_elite_001',
      commissionPercentage: 35,
      status: UserStatus.ACTIVE,
      createdAt: new Date('2024-01-20'),
      updatedAt: new Date('2024-10-15'),
    };
  }, [employeeId]);

  const [loading, setLoading] = useState(false);

  // Mock statistics
  const stats = {
    totalServices: 156,
    totalIncome: 45600,
    thisMonthServices: 23,
    thisMonthIncome: 6890,
    averagePerService: 292,
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleEdit = () => {
    // TODO: Navigate to edit screen
    Alert.alert('Edit Employee', 'Edit functionality coming soon!');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Employee',
      `Are you sure you want to delete ${employee.name}? This action cannot be undone.`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              Alert.alert('Success', 'Employee deleted successfully', [
                {text: 'OK', onPress: () => navigation.goBack()},
              ]);
            }, 500);
          },
        },
      ],
    );
  };

  const handleToggleStatus = () => {
    const newStatus =
      employee.status === UserStatus.ACTIVE ? UserStatus.BLOCKED : UserStatus.ACTIVE;
    const action = newStatus === UserStatus.BLOCKED ? 'block' : 'activate';

    Alert.alert(
      `${action === 'block' ? 'Block' : 'Activate'} Employee`,
      `Are you sure you want to ${action} ${employee.name}?`,
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: action === 'block' ? 'Block' : 'Activate',
          style: action === 'block' ? 'destructive' : 'default',
          onPress: () => {
            Alert.alert('Success', `Employee ${action}d successfully`);
          },
        },
      ],
    );
  };

  const getStatusColor = (status: UserStatus): string => {
    switch (status) {
      case UserStatus.ACTIVE:
        return '#4CAF50';
      case UserStatus.BLOCKED:
        return '#F44336';
      case UserStatus.PENDING:
        return '#FF9800';
      default:
        return '#9E9E9E';
    }
  };

  const getStatusLabel = (status: UserStatus): string => {
    switch (status) {
      case UserStatus.ACTIVE:
        return 'Active';
      case UserStatus.BLOCKED:
        return 'Blocked';
      case UserStatus.PENDING:
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        {/* Employee Info Card */}
        <View style={styles.infoCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{employee.name.charAt(0).toUpperCase()}</Text>
          </View>

          <Text style={styles.name}>{employee.name}</Text>

          <View
            style={[styles.statusBadge, {backgroundColor: getStatusColor(employee.status) + '20'}]}>
            <View style={[styles.statusDot, {backgroundColor: getStatusColor(employee.status)}]} />
            <Text style={[styles.statusText, {color: getStatusColor(employee.status)}]}>
              {getStatusLabel(employee.status)}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📱</Text>
            <Text style={styles.infoText}>{employee.phone}</Text>
          </View>

          {employee.email && (
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>✉️</Text>
              <Text style={styles.infoText}>{employee.email}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>💰</Text>
            <Text style={styles.infoText}>Commission: {employee.commissionPercentage}%</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📅</Text>
            <Text style={styles.infoText}>Member since {formatDateISO(employee.createdAt)}</Text>
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📊 Performance Statistics</Text>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.totalServices}</Text>
              <Text style={styles.statLabel}>Total Services</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>{formatBDT(stats.totalIncome)}</Text>
              <Text style={styles.statLabel}>Total Income</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.thisMonthServices}</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>{formatBDT(stats.thisMonthIncome)}</Text>
              <Text style={styles.statLabel}>Month Income</Text>
            </View>
          </View>

          <View style={styles.averageCard}>
            <Text style={styles.averageLabel}>Average per Service</Text>
            <Text style={styles.averageValue}>{formatBDT(stats.averagePerService)}</Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Actions</Text>

          <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={handleEdit}>
            <Text style={styles.actionButtonIcon}>✏️</Text>
            <Text style={styles.actionButtonText}>Edit Employee</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.statusButton]}
            onPress={handleToggleStatus}>
            <Text style={styles.actionButtonIcon}>
              {employee.status === UserStatus.ACTIVE ? '🚫' : '✅'}
            </Text>
            <Text style={styles.actionButtonText}>
              {employee.status === UserStatus.ACTIVE ? 'Block Employee' : 'Activate Employee'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
            disabled={loading}>
            <Text style={styles.actionButtonIcon}>🗑️</Text>
            <Text style={[styles.actionButtonText, styles.deleteText]}>
              {loading ? 'Deleting...' : 'Delete Employee'}
            </Text>
          </TouchableOpacity>
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
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: '#1976D2',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingVertical: 8,
    gap: 12,
  },
  infoIcon: {
    fontSize: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#757575',
    flex: 1,
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
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#2196F3',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
  },
  averageCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  averageLabel: {
    fontSize: 14,
    color: '#2E7D32',
    marginBottom: 4,
  },
  averageValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2E7D32',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    gap: 12,
  },
  editButton: {
    borderWidth: 1,
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  statusButton: {
    borderWidth: 1,
    borderColor: '#FF9800',
    backgroundColor: '#FFF3E0',
  },
  deleteButton: {
    borderWidth: 1,
    borderColor: '#F44336',
    backgroundColor: '#FFEBEE',
  },
  actionButtonIcon: {
    fontSize: 24,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    flex: 1,
  },
  deleteText: {
    color: '#F44336',
  },
});
