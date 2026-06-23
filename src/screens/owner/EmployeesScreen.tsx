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
import {useOrg, useTheme, useLanguage} from '@/context';
import EmployeeCard from '@/components/EmployeeCard';
import {User, UserRole} from '@/types';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import {useThemedStyles} from '@/hooks/useThemedStyles';
import {ThemeColors} from '@/constants/theme';

export default function EmployeesScreen({navigation}: any): React.ReactElement {
  const {orgUsers, loading, fetchOrgData, currentOrg} = useOrg();
  const {isDarkMode, colors} = useTheme();
  const {language, t} = useLanguage();
  const styles = useThemedStyles(getStyles);

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Filter employees and owner from orgUsers
  const employees = useMemo(() => {
    return orgUsers.filter(
      (user: User) => user.role === UserRole.EMPLOYEE || user.role === UserRole.OWNER,
    );
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
      Alert.alert(
        t.common.success,
        language === 'en'
          ? 'Invite code copied to clipboard!'
          : language === 'bn'
            ? 'আমন্ত্রণ কোড ক্লিপবোর্ডে কপি করা হয়েছে!'
            : language === 'es'
              ? '¡Código de invitación copiado al portapapeles!'
              : 'आमंत्रण कोड क्लिपबोर्ड पर कॉपी किया गया!',
      );
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  const renderInviteCodeFooter = () => (
    <View style={styles.inviteCodeSection}>
      <Text style={styles.inviteCodeLabel}>
        {language === 'en'
          ? 'Organization Invite Code'
          : language === 'bn'
            ? 'প্রতিষ্ঠানের আমন্ত্রণ কোড'
            : language === 'es'
              ? 'Código de invitación de la organización'
              : 'संगठन आमंत्रण कोड'}
      </Text>
      <TouchableOpacity
        style={styles.inviteCodeBox}
        onPress={handleCopyInviteCode}
        activeOpacity={0.7}>
        <Text style={styles.inviteCodeText}>{currentOrg?.inviteCode || 'N/A'}</Text>
        <Text style={styles.inviteCodeHint}>
          {language === 'en'
            ? 'Tap to copy'
            : language === 'bn'
              ? 'কপি করতে আলতো চাপুন'
              : language === 'es'
                ? 'Presione para copiar'
                : 'कॉपी करने के लिए टैप करें'}
        </Text>
      </TouchableOpacity>
      <Text style={styles.inviteCodeDescription}>
        {language === 'en'
          ? 'Share this code with employees so they can join your organization'
          : language === 'bn'
            ? 'কর্মীদের সাথে এই কোডটি শেয়ার করুন যাতে তারা আপনার প্রতিষ্ঠানে যোগ দিতে পারে'
            : language === 'es'
              ? 'Comparta este código con los empleados para que puedan unirse a su organización'
              : 'कर्मचारियों के साथ यह कोड साझा करें ताकि वे आपके संगठन में शामिल हो सकें'}
      </Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <MaterialIcons
        name="people-alt"
        style={styles.emptyIcon}
        color={colors.text.hint}
        size={40}
      />
      <Text style={styles.emptyTitle}>{t.employees.noEmployees}</Text>
      <Text style={styles.emptyText}>
        {language === 'en'
          ? 'Add your first employee to start tracking their work'
          : language === 'bn'
            ? 'তাদের কাজ ট্র্যাক করা শুরু করতে আপনার প্রথম কর্মী যোগ করুন'
            : language === 'es'
              ? 'Añada su primer empleado para comenzar a rastrear su trabajo'
              : 'उनका काम ट्रैक करना शुरू करने के लिए अपना पहला कर्मचारी जोड़ें'}
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleAddEmployee}>
        <Text style={styles.emptyButtonText}>{t.employees.addEmployee}</Text>
      </TouchableOpacity>
    </View>
  );

  const renderNoResults = () => (
    <View style={styles.emptyState}>
      <MaterialIcons
        name="saved-search"
        style={styles.emptyIcon}
        color={colors.text.hint}
        size={40}
      />
      <Text style={styles.emptyTitle}>{t.empty.noResults}</Text>
      <Text style={styles.emptyText}>
        {language === 'en'
          ? 'Try a different search term'
          : language === 'bn'
            ? 'ভিন্ন অনুসন্ধান শব্দ চেষ্টা করুন'
            : language === 'es'
              ? 'Intente con otro término de búsqueda'
              : 'एक अलग खोज शब्द का प्रयास करें'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background.paper}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.employees.title}</Text>
        <Text style={styles.headerSubtitle}>
          {employees.length}{' '}
          {language === 'en'
            ? employees.length === 1
              ? 'employee'
              : 'employees'
            : language === 'bn'
              ? 'জন কর্মী'
              : language === 'es'
                ? employees.length === 1
                  ? 'empleado'
                  : 'empleados'
                : 'कर्मचारी'}
        </Text>
      </View>

      {/* Initial Loading State */}
      {loading && employees.length === 0 && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>
            {language === 'en'
              ? 'Loading employees...'
              : language === 'bn'
                ? 'কর্মী লোড হচ্ছে...'
                : language === 'es'
                  ? 'Cargando empleados...'
                  : 'कर्मचारी लोड हो रहे हैं...'}
          </Text>
        </View>
      ) : (
        <>
          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBar}>
              <MaterialIcons
                name="search"
                size={20}
                color={colors.text.hint}
                style={styles.searchIcon}
              />
              <TextInput
                style={styles.searchInput}
                placeholder={t.employees.searchEmployees}
                placeholderTextColor={colors.text.hint}
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
                colors={[colors.primary[500]]}
                tintColor={colors.primary[500]}
              />
            }
          />

          {/* Floating Action Button */}
          {employees.length > 0 && (
            <TouchableOpacity style={styles.fab} onPress={handleAddEmployee}>
              <MaterialIcons name="add" size={32} color="#fff" />
            </TouchableOpacity>
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors, isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.default,
    },
    header: {
      paddingHorizontal: 16,
      paddingVertical: 16,
      backgroundColor: isDarkMode ? colors.background.paper : '#e8f3ef',
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: '700',
      color: colors.text.primary,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.text.secondary,
      marginTop: 4,
    },
    searchContainer: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.background.paper,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.default,
      borderRadius: 12,
      paddingHorizontal: 12,
      height: 48,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: colors.text.primary,
      padding: 0,
    },
    clearButton: {
      padding: 4,
    },
    clearButtonText: {
      fontSize: 18,
      color: colors.text.hint,
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
      marginBottom: 8,
    },
    emptyTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: 8,
    },
    emptyText: {
      fontSize: 16,
      color: colors.text.secondary,
      textAlign: 'center',
      marginBottom: 24,
      paddingHorizontal: 32,
    },
    emptyButton: {
      backgroundColor: colors.primary[500],
      paddingVertical: 16,
      paddingHorizontal: 32,
      borderRadius: 12,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: isDarkMode ? 0.3 : 0.2,
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
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary[500],
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 4},
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
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
      color: colors.text.secondary,
      fontWeight: '500',
    },
    inviteCodeSection: {
      marginTop: 32,
      marginBottom: 16,
      backgroundColor: isDarkMode ? colors.neutral[100] : '#E3F2FD',
      borderRadius: 12,
      padding: 20,
      borderWidth: 2,
      borderColor: colors.primary[500],
    },
    inviteCodeLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 12,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    inviteCodeBox: {
      backgroundColor: colors.background.paper,
      borderRadius: 12,
      padding: 20,
      marginBottom: 12,
      borderWidth: 2,
      borderColor: colors.primary[500],
      borderStyle: 'dashed',
      alignItems: 'center',
      justifyContent: 'center',
    },
    inviteCodeText: {
      fontSize: 32,
      fontWeight: '700',
      color: colors.primary[500],
      letterSpacing: 4,
      marginBottom: 8,
    },
    inviteCodeHint: {
      fontSize: 12,
      color: colors.text.hint,
      fontWeight: '500',
    },
    inviteCodeDescription: {
      fontSize: 13,
      color: isDarkMode ? colors.text.secondary : '#1976D2',
      lineHeight: 20,
      textAlign: 'center',
    },
  });
