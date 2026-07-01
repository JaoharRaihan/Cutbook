import React, {useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import EmployeesScreen from './EmployeesScreen';
import ServicesScreen from './ServicesScreen';
import {useTheme, useLanguage} from '@/context';
import {useThemedStyles} from '@/hooks/useThemedStyles';
import {ThemeColors} from '@/constants/theme';

type TeamTabType = 'employees' | 'services';

export default function TeamServicesScreen({navigation}: any): React.ReactElement {
  const {colors, isDarkMode} = useTheme();
  const {language, t} = useLanguage();
  const styles = useThemedStyles(getStyles);

  const [activeTab, setActiveTab] = useState<TeamTabType>('employees');

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'employees' && styles.tabButtonActive]}
          onPress={() => setActiveTab('employees')}>
          <MaterialIcons
            name="people-alt"
            size={20}
            color={activeTab === 'employees' ? colors.primary[500] : colors.text.secondary}
          />
          <Text style={[styles.tabText, activeTab === 'employees' && styles.tabTextActive]}>
            {t.employees.title}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'services' && styles.tabButtonActive]}
          onPress={() => setActiveTab('services')}>
          <MaterialIcons
            name="content-cut"
            size={20}
            color={activeTab === 'services' ? colors.primary[500] : colors.text.secondary}
          />
          <Text style={[styles.tabText, activeTab === 'services' && styles.tabTextActive]}>
            {t.services.title}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === 'employees' ? (
          <EmployeesScreen navigation={navigation} embedded />
        ) : (
          <ServicesScreen navigation={navigation} embedded />
        )}
      </View>
    </SafeAreaView>
  );
}

const getStyles = (colors: ThemeColors, isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.default,
    },
    tabContainer: {
      flexDirection: 'row',
      backgroundColor: colors.background.paper,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
      paddingHorizontal: 12,
      paddingTop: 8,
      paddingBottom: 4,
    },
    tabButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 12,
      gap: 8,
      marginHorizontal: 4,
      backgroundColor: isDarkMode ? colors.neutral[800] : colors.background.default,
    },
    tabButtonActive: {
      backgroundColor: isDarkMode ? colors.primary[900] : colors.primary[50],
    },
    tabText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.secondary,
    },
    tabTextActive: {
      color: colors.primary[600],
    },
    content: {
      flex: 1,
    },
  });
