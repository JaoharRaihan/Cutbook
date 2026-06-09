/**
 * SettingsScreen.tsx
 * Owner settings and configuration screen
 */

import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Alert,
} from 'react-native';
import {useAuth, useOrg, useTheme} from '@/context';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from '@react-native-vector-icons/material-icons';

// ============================================================================
// COMPONENT
// ============================================================================

export default function SettingsScreen({navigation}: any): React.ReactElement {
  const {user, logout} = useAuth();
  const {currentOrg} = useOrg();
  const {isDarkMode, toggleDarkMode} = useTheme();
  const [language, setLanguage] = useState<'en' | 'bn'>('en');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleOrganizationSettings = () => {
    navigation.navigate('OrganizationSettings');
  };

  const handleLanguageToggle = () => {
    const newLanguage = language === 'en' ? 'bn' : 'en';
    setLanguage(newLanguage);
    Alert.alert(
      'Language Changed',
      `Language set to ${newLanguage === 'en' ? 'English' : 'Bengali'}.\n\nNote: This is a UI-only demo. Full translation coming soon!`,
      [{text: 'OK'}],
    );
  };

  const handleNotificationsToggle = () => {
    setNotificationsEnabled(!notificationsEnabled);
    Alert.alert(
      notificationsEnabled ? 'Notifications Disabled' : 'Notifications Enabled',
      notificationsEnabled
        ? 'You will no longer receive notifications'
        : 'You will now receive notifications',
      [{text: 'OK'}],
    );
  };

  const handleDarkModeToggle = async () => {
    await toggleDarkMode();
    Alert.alert('Theme Changed', `Dark mode ${!isDarkMode ? 'enabled' : 'disabled'}`, [
      {text: 'OK'},
    ]);
  };

  const handleAbout = () => {
    Alert.alert(
      'About CutBook',
      'CutBook v1.0.0\n\nProfessional Salon Management\n\nA comprehensive solution for managing your salon business, tracking work entries, and monitoring performance.\n\n© 2025 CutBook. All rights reserved.',
      [{text: 'OK'}],
    );
  };

  const handleHelp = () => {
    Alert.alert(
      'Help & Support',
      "Need help?\n\n📧 Email: support@cutbook.app\n📱 Phone: +880 1234-567890\n🌐 Website: www.cutbook.app\n\nWe're here to help you!",
      [{text: 'OK'}],
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      'Privacy Policy',
      'Your privacy is important to us.\n\nWe collect only the data necessary to provide our services. Your information is never sold to third parties.\n\nFor full details, visit: www.cutbook.app/privacy',
      [{text: 'OK'}],
    );
  };

  const handleTerms = () => {
    Alert.alert(
      'Terms of Service',
      'By using CutBook, you agree to:\n\n• Use the service responsibly\n• Maintain accurate records\n• Protect your account credentials\n• Comply with local regulations\n\nFor full terms, visit: www.cutbook.app/terms',
      [{text: 'OK'}],
    );
  };

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

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#2196F3" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile and Settings</Text>
        <Text style={styles.headerSubtitle}>Manage your preferences and organization</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <MaterialIcons name="person" size={22} color="#333" />
            <Text style={styles.sectionTitle}>Profile</Text>
          </View>

          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user?.name || 'Owner'}</Text>
              <Text style={styles.profilePhone}>{user?.phone}</Text>
              {/* {user?.email && <Text style={styles.profileEmail}>{user.email}</Text>} */}
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>Owner</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Organization Section */}
        <View style={styles.section}>
          <View style={styles.titleicon}>
            <MaterialIcons name="domain" size={34} />
            <Text style={styles.sectionTitle}> Organization</Text>
          </View>

          <TouchableOpacity style={styles.settingRow} onPress={handleOrganizationSettings}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="build" style={styles.settingIcon} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Organization Settings</Text>
                <Text style={styles.settingSubtitle}>{currentOrg?.name}</Text>
              </View>
            </View>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Organization Name</Text>
              <Text style={styles.infoValue}>{currentOrg?.name}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Currency</Text>
              <Text style={styles.infoValue}>{currentOrg?.currency || 'BDT'}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Timezone</Text>
              <Text style={styles.infoValue}>{currentOrg?.timezone || 'Asia/Dhaka'}</Text>
            </View>
          </View>
        </View>

        {/* App Preferences Section */}
        <View style={styles.section}>
          <View style={styles.titleicon}>
            <MaterialIcons name="construction" size={25} />
            <Text style={styles.sectionTitle}>Preferences</Text>
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="language" style={styles.settingIcon} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Language</Text>
                <Text style={styles.settingSubtitle}>
                  {language === 'en' ? 'English' : 'Bengali (বাংলা)'}
                </Text>
              </View>
            </View>
            <TouchableOpacity style={styles.languageButton} onPress={handleLanguageToggle}>
              <Text style={styles.languageButtonText}>{language === 'en' ? 'EN' : 'বাং'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="notifications-on" style={styles.settingIcon} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Notifications</Text>
                <Text style={styles.settingSubtitle}>
                  {notificationsEnabled ? 'Receive app notifications' : 'Notifications disabled'}
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              trackColor={{false: '#E0E0E0', true: '#81C784'}}
              thumbColor={notificationsEnabled ? '#4CAF50' : '#F5F5F5'}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="sunny-snowing" style={styles.settingIcon} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Dark Mode</Text>
                <Text style={styles.settingSubtitle}>
                  {isDarkMode ? 'Dark mode enabled' : 'Light mode enabled'}
                </Text>
              </View>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={handleDarkModeToggle}
              trackColor={{false: '#E0E0E0', true: '#5C6BC0'}}
              thumbColor={isDarkMode ? '#7986CB' : '#F5F5F5'}
            />
          </View>
        </View>

        {/* Help & Support Section */}
        <View style={styles.section}>
          <View style={styles.titleicon}>
            <MaterialIcons name="report-problem" size={25} />
            <Text style={styles.sectionTitle}> Help & Support</Text>
          </View>

          <TouchableOpacity style={styles.settingRow} onPress={handleHelp}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="query-stats" style={styles.settingIcon} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Help Center</Text>
                <Text style={styles.settingSubtitle}>Get help and contact support</Text>
              </View>
            </View>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRow} onPress={handleAbout}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="app-shortcut" style={styles.settingIcon} size={25} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>About CutBook</Text>
                <Text style={styles.settingSubtitle}>Version 1.0.0</Text>
              </View>
            </View>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <View style={styles.titleicon}>
            <MaterialIcons name="sticky-note-2" size={25} />
            <Text style={styles.sectionTitle}>Legal</Text>
          </View>

          <TouchableOpacity style={styles.settingRow} onPress={handlePrivacy}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="lock" size={25} style={styles.settingIcon} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Privacy Policy</Text>
                <Text style={styles.settingSubtitle}>How we handle your data</Text>
              </View>
            </View>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRow} onPress={handleTerms}>
            <View style={styles.settingLeft}>
              <MaterialIcons name="note-alt" style={styles.settingIcon} />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>Terms of Service</Text>
                <Text style={styles.settingSubtitle}>User agreement</Text>
              </View>
            </View>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialIcons name="mobile-off" size={25} style={styles.logoutButtonIcon} />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>CutBook v1.0.0</Text>
          <Text style={styles.footerSubtext}>Professional Salon Management</Text>
          <Text style={styles.footerCopyright}>© 2026 CutBook</Text>
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
  header: {
    backgroundColor: '#e8f3ef',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#0a0909',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#010101',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 10,
  },
  titleicon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  roleBadge: {
    backgroundColor: '#edd7d5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#f32121',
  },
  roleBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#f3212f',
  },
  settingRow: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  settingLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: '#757575',
  },
  settingArrow: {
    fontSize: 20,
    color: '#BDBDBD',
    marginLeft: 8,
  },
  divider: {
    height: 12,
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
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
  languageButton: {
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000000',
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#060606',
  },
  logoutButton: {
    backgroundColor: '#F44336',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  logoutButtonIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  logoutButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#090909',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 14,
    color: '#000000',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#080808',
    marginBottom: 4,
  },
  footerCopyright: {
    fontSize: 11,
    color: '#050505',
  },
});
