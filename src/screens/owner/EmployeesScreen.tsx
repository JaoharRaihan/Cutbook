/**
 * EmployeesScreen.tsx
 * Employee list and management screen for owners
 */

import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  StatusBar,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Clipboard,
  Alert,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useOrg} from '@/context';
import EmployeeCard from '@/components/EmployeeCard';
import {User, UserRole} from '@/types';
import MaterialIcons from '@react-native-vector-icons/material-icons';

// ============================================================================
// COMPONENT
// ============================================================================

export default function EmployeesScreen({navigation}: any): React.ReactElement {
  const {orgUsers, loading, fetchOrgData, currentOrg} = useOrg();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Filter employees from orgUsers
  const employees = useMemo(() => {
    return orgUsers.filter((user: User) => user.role === UserRole.EMPLOYEE);
  }, [orgUsers]);

  // Filter employees by search query
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees;

    const query = searchQuery.toLowerCase();
    return employees.filter(
      (emp: User) =>
        emp.name.toLowerCase().includes(query) ||
        emp.phone.includes(query) ||
        emp.email?.toLowerCase().includes(query),
    );
  }, [employees, searchQuery]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchOrgData();
    } catch (error) {
      console.error('Error refreshing employees:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleEmployeePress = (employee: User) => {
    navigation.navigate('EmployeeDetail', {employeeId: employee.id});
  };

  const handleAddEmployee = () => {
    navigation.navigate('AddEmployee');
  };

  const handleCopyInviteCode = async () => {
    if (currentOrg?.inviteCode) {
      await Clipboard.setString(currentOrg.inviteCode);
      Alert.alert('Success', 'Invite code copied to clipboard!');
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  const renderInviteCodeFooter = () => (
    <View style={styles.inviteCodeSection}>
      <Text style={styles.inviteCodeLabel}>Organization Invite Code</Text>
      <TouchableOpacity
        style={styles.inviteCodeBox}
        onPress={handleCopyInviteCode}
        activeOpacity={0.7}>
        <Text style={styles.inviteCodeText}>{currentOrg?.inviteCode || 'N/A'}</Text>
        <Text style={styles.inviteCodeHint}>Tap to copy</Text>
      </TouchableOpacity>
      <Text style={styles.inviteCodeDescription}>
        Share this code with employees so they can join your organization
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="people-alt" style={styles.emptyIcon} />
      <Text style={styles.emptyTitle}>No employees yet</Text>
      <Text style={styles.emptyText}>Add your first employee to start tracking their work</Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleAddEmployee}>
        <Text style={styles.emptyButtonText}> Add Employee</Text>
      </TouchableOpacity>
    </View>
  );

  const renderNoResults = () => (
    <View style={styles.emptyState}>
      <MaterialIcons name="saved-search" style={styles.emptyIcon} />
      <Text style={styles.emptyTitle}>No results found</Text>
      <Text style={styles.emptyText}>Try a different search term</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Employees</Text>
        <Text style={styles.headerSubtitle}>
          {employees.length} {employees.length === 1 ? 'employee' : 'employees'}
        </Text>
      </View>

      {/* Initial Loading State */}
      {loading && employees.length === 0 && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196F3" />
          <Text style={styles.loadingText}>Loading employees...</Text>
        </View>
      ) : (
        <>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <MaterialIcons name="search" style={styles.emptyIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search by name, phone, or email..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearButton}>
                  <Text style={styles.clearButtonText}>✕</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Employee List */}
          <FlatList
            data={filteredEmployees}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <EmployeeCard employee={item} onPress={() => handleEmployeePress(item)} />
            )}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={searchQuery.trim() ? renderNoResults() : renderEmpty()}
            ListFooterComponent={
              !searchQuery.trim() && filteredEmployees.length > 0 ? renderInviteCodeFooter : null
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={['#2196F3']}
                tintColor="#2196F3"
              />
            }
          />

          {/* Floating Action Button */}
          {employees.length > 0 && (
            <TouchableOpacity style={styles.fab} onPress={handleAddEmployee}>
              <MaterialIcons name="add" size={44} color="#fff" />
            </TouchableOpacity>
          )}
        </>
      )}
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
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#e8f3ef',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#212121',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#212121',
    padding: 0,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#999',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 32,
  },
  emptyButton: {
    backgroundColor: '#f36021',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f32121',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 32,
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 48,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#757575',
    fontWeight: '500',
  },
  inviteCodeSection: {
    marginTop: 32,
    marginBottom: 16,
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#2196F3',
  },
  inviteCodeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inviteCodeBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#2196F3',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteCodeText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#2196F3',
    letterSpacing: 4,
    marginBottom: 8,
  },
  inviteCodeHint: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '500',
  },
  inviteCodeDescription: {
    fontSize: 13,
    color: '#1976D2',
    lineHeight: 20,
    textAlign: 'center',
  },
});
