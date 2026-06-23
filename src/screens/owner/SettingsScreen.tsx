/**
 * SettingsScreen.tsx
 * Owner settings and configuration screen
 */

import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Switch,
  Alert,
  Modal,
} from 'react-native';
import {useAuth, useOrg, useTheme, useLanguage, getLanguageName} from '@/context';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import {loadNotificationsEnabled, saveNotificationsEnabled} from '@/utils/storage';
import {useThemedStyles} from '@/hooks/useThemedStyles';
import {ThemeColors} from '@/constants/theme';

// ============================================================================
// COMPONENT
// ============================================================================

export default function SettingsScreen({navigation}: any): React.ReactElement {
  const {user, logout} = useAuth();
  const {currentOrg} = useOrg();
  const {isDarkMode, toggleDarkMode, colors} = useTheme();
  const {language, setLanguage, t} = useLanguage();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const styles = useThemedStyles(getStyles);

  // Load preferences on mount
  useEffect(() => {
    const loadPrefs = async () => {
      const enabled = await loadNotificationsEnabled();
      setNotificationsEnabled(enabled);
    };
    loadPrefs();
  }, []);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleOrganizationSettings = () => {
    navigation.navigate('OrganizationSettings');
  };

  const handleLanguageSelect = () => {
    setLanguageModalVisible(true);
  };

  const handleNotificationsToggle = async () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    await saveNotificationsEnabled(newValue);

    Alert.alert(
      newValue ? t.settings.notifications : t.settings.notificationsDisabled,
      newValue ? t.settings.notificationsDesc : t.settings.notificationsDisabled,
      [{text: t.common.done}],
    );
  };

  const handleDarkModeToggle = async () => {
    await toggleDarkMode();
    Alert.alert(t.settings.theme, !isDarkMode ? t.settings.darkMode : t.settings.lightMode, [
      {text: t.common.done},
    ]);
  };

  const handleAbout = () => {
    Alert.alert(
      language === 'en'
        ? 'About CutBook'
        : language === 'bn'
          ? 'CutBook সম্পর্কে'
          : language === 'es'
            ? 'Acerca de CutBook'
            : 'कटबुक के बारे में',
      `CutBook v1.0.0\n\n${language === 'en' ? 'Professional Salon Management' : language === 'bn' ? 'পেশাদার সেলুন ম্যানেজমেন্ট' : language === 'es' ? 'Gestión Profesional de Salones' : 'पेशेवर सैलून प्रबंधन'}\n\n${t.settings.aboutDesc}\n\n© 2026 CutBook. ${language === 'en' ? 'All rights reserved.' : language === 'bn' ? 'সর্বস্বত্ব সংরক্ষিত।' : language === 'es' ? 'Todos los derechos reservados.' : 'सर्वाधिकार सुरक्षित।'}`,
      [{text: t.common.done}],
    );
  };

  const handleHelp = () => {
    Alert.alert(
      t.settings.helpSupport,
      `📧 Email: support@cutbook.app\n📱 Phone: +880 1234-567890\n🌐 Website: www.cutbook.app`,
      [{text: t.common.done}],
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      t.settings.privacyPolicy,
      language === 'en'
        ? 'Your privacy is important to us.\n\nWe collect only the data necessary to provide our services. Your information is never sold to third parties.'
        : language === 'bn'
          ? 'আপনার গোপনীয়তা আমাদের কাছে গুরুত্বপূর্ণ।\n\nআমরা কেবল আমাদের পরিষেবা প্রদানের জন্য প্রয়োজনীয় তথ্য সংগ্রহ করি। আপনার তথ্য কখনই তৃতীয় পক্ষের কাছে বিক্রি করা হয় না।'
          : language === 'es'
            ? 'Su privacidad es importante para nosotros.\n\nSolo recopilamos los datos necesarios para proporcionar nuestros servicios. Su información nunca se vende a terceros.'
            : 'आपकी गोपनीयता हमारे लिए महत्वपूर्ण है।\n\nहम केवल अपनी सेवाएं प्रदान करने के लिए आवश्यक डेटा एकत्र करते हैं। आपकी जानकारी कभी भी तीसरे पक्ष को नहीं बेची जाती है।',
      [{text: t.common.done}],
    );
  };

  const handleTerms = () => {
    Alert.alert(
      t.settings.termsOfService,
      language === 'en'
        ? 'By using CutBook, you agree to:\n\n• Use the service responsibly\n• Maintain accurate records\n• Protect your account credentials\n• Comply with local regulations'
        : language === 'bn'
          ? 'CutBook ব্যবহার করে, আপনি সম্মত হন:\n\n• দায়িত্বের সাথে পরিষেবা ব্যবহার করবেন\n• সঠিক রেকর্ড বজায় রাখবেন\n• আপনার অ্যাকাউন্টের শংসাপত্রগুলি রক্ষা করবেন\n• স্থানীয় নিয়মকানুন মেনে চলবেন'
          : language === 'es'
            ? 'Al usar CutBook, usted acepta:\n\n• Usar el servicio de manera responsable\n• Mantener registros precisos\n• Proteger sus credenciales de cuenta\n• Cumplir con las regulaciones locales'
            : 'कटबुक का उपयोग करके, आप सहमत हैं:\n\n• जिम्मेदारी से सेवा का उपयोग करें\n• सटीक रिकॉर्ड बनाए रखें\n• अपने खाते के क्रेडेंशियल सुरक्षित रखें\n• स्थानीय नियमों का पालन करें',
      [{text: t.common.done}],
    );
  };

  const handleLogout = () => {
    Alert.alert(
      t.auth.logout,
      language === 'en'
        ? 'Are you sure you want to logout?'
        : language === 'bn'
          ? 'আপনি কি নিশ্চিত যে আপনি লগআউট করতে চান?'
          : language === 'es'
            ? '¿Está seguro de que desea cerrar sesión?'
            : 'क्या आप वाकई लॉग आउट करना चाहते हैं?',
      [
        {text: t.common.cancel, style: 'cancel'},
        {
          text: t.auth.logout,
          style: 'destructive',
          onPress: async () => {
            await logout();
          },
        },
      ],
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background.paper}
      />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t.settings.title}</Text>
        <Text style={styles.headerSubtitle}>{t.settings.aboutDesc}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleContainer}>
            <MaterialIcons name="person" size={22} color={colors.text.primary} />
            <Text style={styles.sectionTitle}>{t.profile.title}</Text>
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
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>{t.employees.owner}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Organization Section */}
        <View style={styles.section}>
          <View style={styles.titleicon}>
            <MaterialIcons name="domain" size={24} color={colors.text.primary} />
            <Text style={styles.sectionTitle}>
              {language === 'en'
                ? 'Organization'
                : language === 'bn'
                  ? 'প্রতিষ্ঠান'
                  : language === 'es'
                    ? 'Organización'
                    : 'संगठन'}
            </Text>
          </View>

          <TouchableOpacity style={styles.settingRow} onPress={handleOrganizationSettings}>
            <View style={styles.settingLeft}>
              <MaterialIcons
                name="build"
                size={22}
                color={colors.text.secondary}
                style={styles.settingIcon}
              />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{t.settings.organizationSettings}</Text>
                <Text style={styles.settingSubtitle}>{currentOrg?.name}</Text>
              </View>
            </View>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.organization.orgName}</Text>
              <Text style={styles.infoValue}>{currentOrg?.name}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.organization.currency}</Text>
              <Text style={styles.infoValue}>{currentOrg?.currency || 'BDT'}</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.organization.timezone}</Text>
              <Text style={styles.infoValue}>{currentOrg?.timezone || 'Asia/Dhaka'}</Text>
            </View>
          </View>
        </View>

        {/* App Preferences Section */}
        <View style={styles.section}>
          <View style={styles.titleicon}>
            <MaterialIcons name="construction" size={22} color={colors.text.primary} />
            <Text style={styles.sectionTitle}>{t.settings.preferences}</Text>
          </View>

          <TouchableOpacity style={styles.settingRow} onPress={handleLanguageSelect}>
            <View style={styles.settingLeft}>
              <MaterialIcons
                name="language"
                size={22}
                color={colors.text.secondary}
                style={styles.settingIcon}
              />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{t.settings.language}</Text>
                <Text style={styles.settingSubtitle}>{getLanguageName(language)}</Text>
              </View>
            </View>
            <View style={styles.languageButton}>
              <Text style={styles.languageButtonText}>{language.toUpperCase()}</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <MaterialIcons
                name="notifications"
                size={22}
                color={colors.text.secondary}
                style={styles.settingIcon}
              />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{t.settings.notifications}</Text>
                <Text style={styles.settingSubtitle}>
                  {notificationsEnabled
                    ? t.settings.notificationsDesc
                    : t.settings.notificationsDisabled}
                </Text>
              </View>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              trackColor={{false: colors.border.main, true: colors.success.light}}
              thumbColor={notificationsEnabled ? colors.success.main : colors.neutral[400]}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <MaterialIcons
                name="brightness-6"
                size={22}
                color={colors.text.secondary}
                style={styles.settingIcon}
              />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{t.settings.theme}</Text>
                <Text style={styles.settingSubtitle}>
                  {isDarkMode ? t.settings.dark : t.settings.light}
                </Text>
              </View>
            </View>
            <Switch
              value={isDarkMode}
              onValueChange={handleDarkModeToggle}
              trackColor={{false: colors.border.main, true: colors.primary[300]}}
              thumbColor={isDarkMode ? colors.primary[500] : colors.neutral[400]}
            />
          </View>
        </View>

        {/* Help & Support Section */}
        <View style={styles.section}>
          <View style={styles.titleicon}>
            <MaterialIcons name="help-outline" size={22} color={colors.text.primary} />
            <Text style={styles.sectionTitle}>{t.settings.helpSupport}</Text>
          </View>

          <TouchableOpacity style={styles.settingRow} onPress={handleHelp}>
            <View style={styles.settingLeft}>
              <MaterialIcons
                name="contact-support"
                size={22}
                color={colors.text.secondary}
                style={styles.settingIcon}
              />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{t.settings.helpCenter}</Text>
                <Text style={styles.settingSubtitle}>{t.settings.helpCenterDesc}</Text>
              </View>
            </View>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRow} onPress={handleAbout}>
            <View style={styles.settingLeft}>
              <MaterialIcons
                name="info"
                size={22}
                color={colors.text.secondary}
                style={styles.settingIcon}
              />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{t.settings.about}</Text>
                <Text style={styles.settingSubtitle}>{t.settings.version} 1.0.0</Text>
              </View>
            </View>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Legal Section */}
        <View style={styles.section}>
          <View style={styles.titleicon}>
            <MaterialIcons name="gavel" size={22} color={colors.text.primary} />
            <Text style={styles.sectionTitle}>{t.settings.legal}</Text>
          </View>

          <TouchableOpacity style={styles.settingRow} onPress={handlePrivacy}>
            <View style={styles.settingLeft}>
              <MaterialIcons
                name="security"
                size={22}
                color={colors.text.secondary}
                style={styles.settingIcon}
              />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{t.settings.privacyPolicy}</Text>
                <Text style={styles.settingSubtitle}>{t.settings.privacyPolicyDesc}</Text>
              </View>
            </View>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.settingRow} onPress={handleTerms}>
            <View style={styles.settingLeft}>
              <MaterialIcons
                name="description"
                size={22}
                color={colors.text.secondary}
                style={styles.settingIcon}
              />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingTitle}>{t.settings.termsOfService}</Text>
                <Text style={styles.settingSubtitle}>{t.settings.termsOfServiceDesc}</Text>
              </View>
            </View>
            <Text style={styles.settingArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <MaterialIcons
              name="exit-to-app"
              size={22}
              color="#FFFFFF"
              style={styles.logoutButtonIcon}
            />
            <Text style={styles.logoutButtonText}>{t.auth.logout}</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>CutBook v1.0.0</Text>
          <Text style={styles.footerSubtext}>Professional Salon Management</Text>
          <Text style={styles.footerCopyright}>© 2026 CutBook</Text>
        </View>
      </ScrollView>

      {/* Language Selector Modal */}
      <Modal
        visible={languageModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setLanguageModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLanguageModalVisible(false)}>
          <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t.settings.selectLanguage}</Text>
              <TouchableOpacity onPress={() => setLanguageModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.languageList}>
              {(['en', 'bn', 'es', 'hi'] as const).map(lang => (
                <TouchableOpacity
                  key={lang}
                  style={[styles.languageOption, language === lang && styles.languageOptionActive]}
                  onPress={async () => {
                    await setLanguage(lang);
                    setLanguageModalVisible(false);
                    Alert.alert(
                      lang === 'en'
                        ? 'Language Changed'
                        : lang === 'bn'
                          ? 'ভাষা পরিবর্তন'
                          : lang === 'es'
                            ? 'Idioma Cambiado'
                            : 'भाषा परिवर्तित',
                      lang === 'en'
                        ? 'Language set to English.'
                        : lang === 'bn'
                          ? 'ভাষা বাংলায় সেট করা হয়েছে।'
                          : lang === 'es'
                            ? 'Idioma configurado a Español.'
                            : 'भाषा हिन्दी में सेट कर दी गई है।',
                      [{text: t.common.done}],
                    );
                  }}>
                  <Text
                    style={[
                      styles.languageOptionText,
                      language === lang && styles.languageOptionTextActive,
                    ]}>
                    {getLanguageName(lang)}
                  </Text>
                  {language === lang && (
                    <MaterialIcons name="check" size={20} color={colors.primary[500]} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const getStyles = (colors: ThemeColors, isDarkMode: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background.default,
    },
    header: {
      backgroundColor: isDarkMode ? colors.background.paper : '#e8f3ef',
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 20,
      borderBottomWidth: isDarkMode ? 1 : 0,
      borderBottomColor: colors.border.light,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 14,
      color: colors.text.secondary,
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
      gap: 8,
      paddingBottom: 10,
    },
    titleicon: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      paddingBottom: 10,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text.primary,
    },
    profileCard: {
      backgroundColor: colors.background.paper,
      borderRadius: 16,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border.light,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: isDarkMode ? 0.2 : 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.primary[500],
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
      color: colors.text.primary,
      marginBottom: 4,
    },
    profilePhone: {
      fontSize: 14,
      color: colors.text.secondary,
      marginBottom: 4,
    },
    roleBadge: {
      backgroundColor: isDarkMode ? colors.neutral[200] : '#edd7d5',
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: isDarkMode ? colors.neutral[400] : '#f32121',
    },
    roleBadgeText: {
      fontSize: 12,
      fontWeight: '600',
      color: isDarkMode ? colors.text.primary : '#f3212f',
    },
    settingRow: {
      backgroundColor: colors.background.paper,
      borderRadius: 12,
      padding: 16,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    settingLeft: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    settingIcon: {
      marginRight: 12,
    },
    settingTextContainer: {
      flex: 1,
    },
    settingTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 2,
    },
    settingSubtitle: {
      fontSize: 13,
      color: colors.text.secondary,
    },
    settingArrow: {
      fontSize: 20,
      color: colors.text.hint,
      marginLeft: 8,
    },
    divider: {
      height: 12,
    },
    infoCard: {
      backgroundColor: colors.background.paper,
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 8,
    },
    infoLabel: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    infoValue: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.primary,
    },
    infoDivider: {
      height: 1,
      backgroundColor: colors.border.light,
    },
    languageButton: {
      backgroundColor: isDarkMode ? colors.neutral[200] : '#E3F2FD',
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border.main,
    },
    languageButtonText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text.primary,
    },
    logoutButton: {
      backgroundColor: colors.error.main,
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
      marginRight: 8,
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
      fontSize: 14,
      color: colors.text.hint,
      marginBottom: 4,
    },
    footerSubtext: {
      fontSize: 12,
      color: colors.text.hint,
      marginBottom: 4,
    },
    footerCopyright: {
      fontSize: 11,
      color: colors.text.hint,
    },

    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.background.paper,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 24,
      maxHeight: '70%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 20,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
      paddingBottom: 12,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text.primary,
    },
    languageList: {
      gap: 8,
    },
    languageOption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderRadius: 12,
      backgroundColor: colors.background.default,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    languageOptionActive: {
      borderColor: colors.primary[500],
      backgroundColor: isDarkMode ? colors.neutral[100] : colors.primary[50],
    },
    languageOptionText: {
      fontSize: 16,
      color: colors.text.primary,
      fontWeight: '500',
    },
    languageOptionTextActive: {
      color: colors.primary[500],
      fontWeight: '700',
    },
  });
