import React, {useState, useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  StatusBar,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useOrg, useTheme, useLanguage} from '@/context';
import ServiceCard from '@/components/ServiceCard';
import {Service} from '@/types';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import {useThemedStyles} from '@/hooks/useThemedStyles';
import {ThemeColors} from '@/constants/theme';

export default function ServicesScreen({navigation, embedded = false}: any): React.ReactElement {
  const {orgServices, loading, fetchOrgData} = useOrg();
  const {isDarkMode, colors} = useTheme();
  const {language, t} = useLanguage();
  const styles = useThemedStyles(getStyles);

  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Filter services by search query
  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) return orgServices;

    const query = searchQuery.toLowerCase();
    return orgServices.filter(
      (service: Service) =>
        service.name.toLowerCase().includes(query) ||
        service.description?.toLowerCase().includes(query) ||
        service.category.toLowerCase().includes(query),
    );
  }, [orgServices, searchQuery]);

  // Group services by category
  const sections = useMemo(() => {
    const grouped: {[key: string]: Service[]} = {};

    filteredServices.forEach((service: Service) => {
      const category = service.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(service);
    });

    return Object.keys(grouped).map(category => ({
      title: category,
      data: grouped[category],
    }));
  }, [filteredServices]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchOrgData();
    } catch (error) {
      console.error('Error refreshing services:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleServicePress = (service: Service) => {
    navigation.navigate('EditService', {serviceId: service.id});
  };

  const handleAddService = () => {
    navigation.navigate('AddService');
  };

  const getCategoryName = (category: string) => {
    const key = category.toLowerCase() as keyof typeof t.services;
    if (t.services[key]) {
      return t.services[key];
    }
    return category;
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  const renderSectionHeader = ({section}: any) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{getCategoryName(section.title)}</Text>
      <Text style={styles.sectionCount}>{section.data.length}</Text>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <MaterialIcons
        name="assignment-add"
        style={styles.emptyIcon}
        color={colors.text.hint}
        size={40}
      />
      <Text style={styles.emptyTitle}>{t.services.noServices}</Text>
      <Text style={styles.emptyText}>
        {language === 'en'
          ? 'Add your first service to start managing your salon offerings'
          : language === 'bn'
            ? 'আপনার সেলুন অফারগুলি পরিচালনা করতে আপনার প্রথম সেবা যোগ করুন'
            : language === 'es'
              ? 'Añada su primer servicio para comenzar a gestionar sus ofertas de salón'
              : 'सैलून सेवाओं को प्रबंधित करने के लिए अपनी पहली सेवा जोड़ें'}
      </Text>
      <TouchableOpacity style={styles.emptyButton} onPress={handleAddService}>
        <Text style={styles.emptyButtonText}>{t.services.addService}</Text>
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

      {!embedded && (
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t.services.title}</Text>
          <Text style={styles.headerSubtitle}>
            {orgServices.length}{' '}
            {language === 'en'
              ? orgServices.length === 1
                ? 'service'
                : 'services'
              : language === 'bn'
                ? 'টি সেবা'
                : language === 'es'
                  ? orgServices.length === 1
                    ? 'servicio'
                    : 'servicios'
                  : 'सेवाएं'}
          </Text>
        </View>
      )}

      {/* Initial Loading State */}
      {loading && orgServices.length === 0 && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>
            {language === 'en'
              ? 'Loading services...'
              : language === 'bn'
                ? 'সেবা লোড হচ্ছে...'
                : language === 'es'
                  ? 'Cargando servicios...'
                  : 'सेवाएं लोड हो रही हैं...'}
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
                placeholder={t.services.searchServices}
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

          {/* Service List */}
          <SectionList
            sections={sections}
            keyExtractor={item => item.id}
            renderItem={({item}) => (
              <ServiceCard service={item} onPress={() => handleServicePress(item)} />
            )}
            renderSectionHeader={renderSectionHeader}
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={searchQuery.trim() ? renderNoResults() : renderEmpty()}
            stickySectionHeadersEnabled={true}
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
          {orgServices.length > 0 && (
            <TouchableOpacity style={styles.fab} onPress={handleAddService}>
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
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: isDarkMode ? colors.neutral[100] : '#E3F2FD',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      marginBottom: 12,
      marginTop: 8,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text.primary,
      textTransform: 'capitalize',
    },
    sectionCount: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.primary,
      backgroundColor: colors.background.paper,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    emptyState: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 64,
    },
    emptyIcon: {
      marginBottom: 10,
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
  });
