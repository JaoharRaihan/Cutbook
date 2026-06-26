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
  Linking,
  Dimensions,
} from 'react-native';
import {useAuth, useOrg, useTheme, useLanguage, getLanguageName} from '@/context';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import {loadNotificationsEnabled, saveNotificationsEnabled} from '@/utils/storage';
import {useThemedStyles} from '@/hooks/useThemedStyles';
import {ThemeColors} from '@/constants/theme';

export const Palette = {
  inkBlack: '#04151f',
  darkSlateGrey: '#183a37',
  wheat: '#efd6ac',
  burntOrange: '#c44900',
  midnightViolet: '#432534',
};

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

// Localized strings for modals since settings-specific details are not in translations.ts
const HELP_DETAILS: Record<
  string,
  {
    callSupportLabel: string;
    officialEmailLabel: string;
    devEmailLabel: string;
    websiteLabel: string;
  }
> = {
  en: {
    callSupportLabel: 'Call Support',
    officialEmailLabel: 'Official Email',
    devEmailLabel: 'Developer Email',
    websiteLabel: 'Official Website',
  },
  bn: {
    callSupportLabel: 'কল সাপোর্ট',
    officialEmailLabel: 'অফিসিয়াল ইমেইল',
    devEmailLabel: 'ডেভেলপার ইমেইল',
    websiteLabel: 'অফিসিয়াল ওয়েবসাইট',
  },
};

const ABOUT_DETAILS: Record<
  string,
  {
    title: string;
    tagline: string;
    p1: string;
    p2: string;
    bullet1: string;
    bullet2: string;
    bullet3: string;
    bullet4: string;
    p3: string;
    p4: string;
    p5: string;
    question: string;
    p6: string;
    p7: string;
    p8: string;
    p9: string;
    p10: string;
    p11: string;
    visionTitle: string;
    visionText: string;
    p12: string;
    p13: string;
    footer: string;
  }
> = {
  en: {
    title: 'About CutBook',
    tagline: 'Our Story & Vision',
    p1: 'A few months ago, while working at Akij iBos, I noticed something that seemed small but kept bothering me.',
    p2: 'Many salon owners were still managing their entire business with notebooks, paper sheets, and manual calculations.',
    bullet1: 'Employee commissions? Written on paper.',
    bullet2: 'Daily earnings? Written on paper.',
    bullet3: 'Service records? Written on paper.',
    bullet4: 'Business reports? Calculated manually.',
    p3: "At first, it was just an observation. But the more salon owners I talked to, the more I realized this wasn't just one shop's problem—it was an industry-wide problem.",
    p4: "That's when the idea of CutBook was born.",
    p5: "I didn't start with a dream of building a billion-dollar company. I started with a simple question:",
    question: '"What if managing a salon could be as easy as using a smartphone?"',
    p6: "Since then, I've spent countless hours designing screens, writing code, fixing bugs, rebuilding features, and learning things I never thought I'd need to learn.",
    p7: 'There were days when everything worked. There were also days when nothing worked. Days when I doubted myself. Days when I wondered whether anyone would even use the product.',
    p8: 'At the same time, I was dealing with career setbacks and trying to find my way forward as a developer.',
    p9: 'But every time I thought about giving up, I remembered the salon owners who still spent hours calculating commissions manually and tracking everything on paper. That reminder kept me going.',
    p10: "Today, CutBook is becoming more than just an app. It's becoming a management platform designed to help business owners track revenue, employee performance, commissions, payouts, services, and daily operations from a single place.",
    p11: 'While CutBook started with salons in mind, I believe the same problems exist across many service-based businesses—from barbershops and beauty salons to tailor shops and other commission-based workplaces.',
    visionTitle: 'My Vision',
    visionText:
      'To help thousands of businesses across Bangladesh move away from paper-based management and run their operations more efficiently with technology that is affordable, simple, and built around their real needs.',
    p12: 'The journey is still at the beginning. More coding. More mistakes. More lessons. More growth.',
    p13: "But one day, when thousands of businesses are running on CutBook, I'll be able to look back and remember that it all started with a simple observation and a decision to solve a real problem.",
    footer: 'This is just the beginning. 🚀',
  },
  bn: {
    title: 'কাটবুক সম্পর্কে',
    tagline: 'আমাদের গল্প ও ভিশন',
    p1: 'কয়েক মাস আগে, আকিজ আইবস-এ (Akij iBos) কাজ করার সময় আমি এমন একটি জিনিস খেয়াল করলাম যা ছোট মনে হলেও আমাকে বারবার ভাবিয়ে তুলছিল।',
    p2: 'অনেক সেলুন মালিক এখনও তাদের পুরো ব্যবসা খাতা-কলম, কাগজের শিট এবং ম্যানুয়াল হিসাব-নিকাশের মাধ্যমে পরিচালনা করছিলেন।',
    bullet1: 'কর্মীদের কমিশন? কাগজে লেখা হচ্ছে।',
    bullet2: 'দৈনিক আয়? কাগজে লেখা হচ্ছে।',
    bullet3: 'সেবার রেকর্ড? কাগজে লেখা হচ্ছে।',
    bullet4: 'ব্যবসায়িক রিপোর্ট? ম্যানুয়ালি হিসাব করা হচ্ছে।',
    p3: 'প্রথমে এটি কেবল একটি সাধারণ পর্যবেক্ষণ ছিল। কিন্তু আমি যত বেশি সেলুন মালিকদের সাথে কথা বললাম, তত বেশি বুঝতে পারলাম যে এটি কেবল একটি দোকানের সমস্যা নয়—এটি পুরো সেক্টর বা ইন্ডাস্ট্রির একটি বড় সমস্যা।',
    p4: "ঠিক তখনই 'কাটবুক' (CutBook) তৈরির আইডিয়া মাথায় আসে।",
    p5: 'আমি কোনো বিলিয়ন ডলার কোম্পানি গড়ার স্বপ্ন নিয়ে যাত্রা শুরু করিনি। আমি শুরু করেছিলাম একটি সাধারণ প্রশ্ন দিয়ে:',
    question: '"একটি স্মার্টফোন ব্যবহারের মতোই যদি সেলুন পরিচালনা করা সহজ হতো, তবে কেমন হতো?"',
    p6: 'তারপর থেকে, আমি স্ক্রিন ডিজাইন করতে, কোড লিখতে, বাগ ফিক্স করতে, ফিচার রি-বিল্ড করতে এবং এমন অনেক বিষয় শিখতে অসংখ্য ঘন্টা ব্যয় করেছি যা আমি কখনও ভাবিনি যে আমাকে শিখতে হবে।',
    p7: 'এমন দিন গেছে যখন সবকিছু ঠিকঠাক কাজ করত। আবার এমন দিনও গেছে যখন কোনো কিছুই কাজ করত না। কিছু দিন নিজেকে নিয়ে সন্দেহ জেগেছে। ভাবতাম, আদৌ কেউ এই প্রোডাক্টটি ব্যবহার করবে কি না।',
    p8: 'একই সাথে, আমি ক্যারিয়ারের নানান প্রতিবন্ধকতা মোকাবেলা করছিলাম এবং একজন ডেভেলপার হিসেবে নিজের পথ তৈরির চেষ্টা করছিলাম।',
    p9: 'কিন্তু প্রতিবার যখনই আমি হাল ছেড়ে দেওয়ার কথা ভাবতাম, তখনই আমার সেই সেলুন মালিকদের কথা মনে পড়ত যারা এখনও ম্যানুয়ালি কমিশন হিসাব করতে এবং কাগজে সবকিছু লিখে রাখতে ঘন্টার পর ঘন্টা সময় ব্যয় করেন। সেই চিন্তাটাই আমাকে পথ চলতে সাহস জুগিয়েছে।',
    p10: 'আজ, কাটবুক কেবল একটি অ্যাপের চেয়েও বেশি কিছু হয়ে উঠছে। এটি একটি ম্যানেজমেন্ট প্ল্যাটফর্মে রূপ নিচ্ছে যা ব্যবসা মালিকদের একই জায়গা থেকে আয়, কর্মীদের পারফরম্যান্স, কমিশন, পে-আউট, সার্ভিস এবং দৈনিক কার্যক্রম ট্র্যাক করতে সাহায্য করবে।',
    p11: 'কাটবুক সেলুনের কথা মাথায় রেখে শুরু হলেও, আমি বিশ্বাস করি একই সমস্যা অন্যান্য অনেক সেবাধর্মী ব্যবসায়ও বিদ্যমান—যেমন বারবারশপ, বিউটি পার্লার থেকে শুরু করে টেইলার্স এবং অন্যান্য কমিশন-ভিত্তিক কর্মক্ষেত্র।',
    visionTitle: 'আমার ভিশন',
    visionText:
      'বাংলাদেশের হাজার হাজার ব্যবসাকে কাগজ-ভিত্তিক হিসাব-নিকাশ থেকে বের করে আনা এবং এমন এক সাশ্রয়ী, সহজ ও তাদের বাস্তব চাহিদার সাথে মানানসই প্রযুক্তির সাহায্যে তাদের ব্যবসায়িক কার্যক্রমকে আরও দক্ষ করে তুলতে সাহায্য করা।',
    p12: 'যাত্রাটি এখনও একেবারেই শুরুতে। আরও কোডিং করতে হবে, আরও ভুল হবে, আরও শিক্ষা ও আরও বৃদ্ধি পাবে।',
    p13: 'তবে একদিন যখন হাজার হাজার ব্যবসা কাটবুকের মাধ্যমে পরিচালিত হবে, তখন আমি ফিরে তাকিয়ে স্মরণ করতে পারব যে এই সব কিছুর শুরু হয়েছিল কেবল একটি সাধারণ পর্যবেক্ষণ এবং একটি বাস্তব সমস্যা সমাধানের সিদ্ধান্ত থেকে।',
    footer: 'এটি তো কেবল শুরু। 🚀',
  },
};

const PRIVACY_DETAILS: Record<string, Array<{title: string; text: string}>> = {
  en: [
    {
      title: '1. Data Collection',
      text: 'We collect salon-related business data (services, employee commissions, transaction values, and daily logs) to calculate reports and payouts. Personal identification is limited to your name, phone number, and optional email for authentication.',
    },
    {
      title: '2. Data Privacy & Security',
      text: 'Your business data is stored securely via Google Firebase servers. We employ industry-standard Firestore authorization rules to ensure only you and your authorized staff can access your salon records.',
    },
    {
      title: '3. Third-Party Sharing',
      text: 'We value your trust. CutBook does not sell, trade, or share your salon financial reports, employee records, or personal information with any third-party marketing services.',
    },
    {
      title: '4. Services & Logging',
      text: 'We use Sentry for crash monitoring and Firebase Cloud Messaging (FCM) to deliver notification alerts for commission and payout updates.',
    },
  ],
  bn: [
    {
      title: '১. তথ্য সংগ্রহ',
      text: 'আমরা রিপোর্ট ও পে-আউট হিসাব করার জন্য সেলুন সম্পর্কিত ব্যবসায়িক তথ্য (সার্ভিস, কর্মী কমিশন, লেনদেনের পরিমাণ এবং দৈনিক লগ) সংগ্রহ করি। ব্যক্তিগত তথ্যের মধ্যে কেবলমাত্র আপনার নাম, ফোন নম্বর এবং অ্যাপে লগইনের জন্য ঐচ্ছিক ইমেইল সংগ্রহ করা হয়।',
    },
    {
      title: '২. তথ্যের গোপনীয়তা ও নিরাপত্তা',
      text: 'আপনার ব্যবসায়িক তথ্য গুগল ফায়ারবেস (Google Firebase) সার্ভারে সুরক্ষিতভাবে সংরক্ষণ করা হয়। শুধুমাত্র আপনি এবং আপনার অনুমোদিত কর্মীরাই যাতে আপনার সেলুনের তথ্য অ্যাক্সেস করতে পারেন, তা নিশ্চিত করতে আমরা ইন্ডাস্ট্রি-স্ট্যান্ডার্ড ফায়ারস্টোর অথরাইজেশন রুলস ব্যবহার করি।',
    },
    {
      title: '৩. তৃতীয় পক্ষের সাথে তথ্য শেয়ারিং',
      text: 'আমরা আপনার বিশ্বাসের মর্যাদা দিই। কাটবুক কোনো তৃতীয় পক্ষের মার্কেটিং সার্ভিসের সাথে আপনার সেলুনের আর্থিক রিপোর্ট, কর্মীদের রেকর্ড বা ব্যক্তিগত তথ্য বিক্রি, লেনদেন বা শেয়ার করে না।',
    },
    {
      title: '৪. সার্ভিস ও লগিং',
      text: 'আমরা অ্যাপ ক্র্যাশ বা ত্রুটি পর্যবেক্ষণের জন্য সেন্ট্রি (Sentry) এবং কমিশন ও পে-আউট আপডেটের নোটিফিকেশন পাঠাতে ফায়ারবেস ক্লাউড মেসেজিং (FCM) ব্যবহার করি।',
    },
  ],
};

const TERMS_DETAILS: Record<string, Array<{title: string; text: string}>> = {
  en: [
    {
      title: '1. License & Usage',
      text: "CutBook grants you a personal, non-transferable license to use the app for managing your commission-based service operations. You agree not to reverse-engineer or attempt to compromise the app's database.",
    },
    {
      title: '2. Salon & User Responsibility',
      text: 'Salon owners are fully responsible for the accuracy of services, commissions percentages, and payouts logged. CutBook acts as a ledger tool and does not manage real-world cash flow or financial transactions directly.',
    },
    {
      title: '3. Account Security',
      text: 'You are responsible for keeping your login credentials confidential. Notify support immediately if you suspect unauthorized access to your salon dashboard.',
    },
    {
      title: '4. Limitation of Liability',
      text: 'To the maximum extent permitted by law, CutBook and its developers are not liable for any direct or indirect loss of business data, revenue, or incorrect manual input errors.',
    },
  ],
  bn: [
    {
      title: '১. লাইসেন্স এবং ব্যবহার',
      text: 'কাটবুক আপনাকে আপনার কমিশন-ভিত্তিক সেবা কার্যক্রম পরিচালনার জন্য অ্যাপটি ব্যবহার করার একটি ব্যক্তিগত এবং অ-হস্তান্তরযোগ্য লাইসেন্স প্রদান করে। আপনি কোনোভাবেই অ্যাপের ডেটাবেস হ্যাক বা রিভার্স-ইঞ্জিনিয়ার করার চেষ্টা না করতে সম্মত হচ্ছেন।',
    },
    {
      title: '২. সেলুন ও ব্যবহারকারীর দায়িত্ব',
      text: 'লগ করা সার্ভিস, কমিশনের হার এবং পে-আউটের নির্ভুলতার জন্য সেলুন মালিক সম্পূর্ণ দায়ী থাকবেন। কাটবুক একটি হিসাব রাখার মাধ্যম বা লেজার টুল হিসেবে কাজ করে এবং এটি সরাসরি বাস্তব জীবনের নগদ অর্থ প্রবাহ বা আর্থিক লেনদেন পরিচালনা করে না।',
    },
    {
      title: '৩. অ্যাকাউন্টের নিরাপত্তা',
      text: 'আপনার লগইন তথ্যের গোপনীয়তা রক্ষা করার দায়িত্ব আপনার। যদি আপনি আপনার সেলুন ড্যাশবোর্ডে কোনো অননুমোদিত অ্যাক্সেস সন্দেহ করেন, তবে অবিলম্বে সাপোর্টে যোগাযোগ করুন।',
    },
    {
      title: '৪. দায়বদ্ধতার সীমাবদ্ধতা',
      text: 'আইน অনুযায়ী সর্বোচ্চ গ্রহণযোগ্য সীমা পর্যন্ত, কাটবুক এবং এর ডেভেলপাররা কোনো প্রত্যক্ষ বা পরোক্ষ ব্যবসায়িক তথ্যের ক্ষতি, রাজস্বের ক্ষতি বা ম্যানুয়ালি ভুল তথ্য ইনপুট দেওয়ার কারণে হওয়া ক্ষতির জন্য দায়ী থাকবে না।',
    },
  ],
};

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
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [aboutModalVisible, setAboutModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [termsModalVisible, setTermsModalVisible] = useState(false);

  const styles = useThemedStyles(getStyles);

  const helpDetail = HELP_DETAILS[language] || HELP_DETAILS.en;
  const aboutDetail = ABOUT_DETAILS[language] || ABOUT_DETAILS.en;
  const privacyDetail = PRIVACY_DETAILS[language] || PRIVACY_DETAILS.en;
  const termsDetail = TERMS_DETAILS[language] || TERMS_DETAILS.en;

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

  // Support link launches
  const dialCall = () => {
    Linking.openURL('tel:01874517426').catch(() => {
      Alert.alert(t.common.error || 'Error', 'Could not open phone dialer');
    });
  };

  const sendEmail = (email: string) => {
    Linking.openURL(`mailto:${email}`).catch(() => {
      Alert.alert(t.common.error || 'Error', 'Could not open mail client');
    });
  };

  const openWebsite = () => {
    Linking.openURL('https://teamcutbook.github.io/').catch(() => {
      Alert.alert(t.common.error || 'Error', 'Could not open website');
    });
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

          <TouchableOpacity style={styles.settingRow} onPress={() => setHelpModalVisible(true)}>
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

          <TouchableOpacity style={styles.settingRow} onPress={() => setAboutModalVisible(true)}>
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

          <TouchableOpacity style={styles.settingRow} onPress={() => setPrivacyModalVisible(true)}>
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

          <TouchableOpacity style={styles.settingRow} onPress={() => setTermsModalVisible(true)}>
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
                            : 'भाषा हिन्दी में সেট কর দি गई है।',
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

      {/* Help & Support Modal */}
      <Modal
        visible={helpModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setHelpModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setHelpModalVisible(false)}>
          <View style={styles.modalContent80} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleRow}>
                <MaterialIcons name="help-outline" size={24} color={Palette.burntOrange} />
                <Text style={styles.modalTitle}>{t.settings.helpSupport}</Text>
              </View>
              <TouchableOpacity onPress={() => setHelpModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}>
              <TouchableOpacity style={styles.supportCard} onPress={dialCall}>
                <View style={[styles.supportIconWrapper, styles.supportIconPhone]}>
                  <MaterialIcons name="phone" size={24} color="#4CAF50" />
                </View>
                <View style={styles.supportCardText}>
                  <Text style={styles.supportCardLabel}>{helpDetail.callSupportLabel}</Text>
                  <Text style={styles.supportCardValue}>01874517426</Text>
                </View>
                <MaterialIcons name="call" size={20} color={colors.text.secondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.supportCard}
                onPress={() => sendEmail('bdcutbook@gmail.com')}>
                <View style={[styles.supportIconWrapper, styles.supportIconOfficialEmail]}>
                  <MaterialIcons name="email" size={24} color="#03A9F4" />
                </View>
                <View style={styles.supportCardText}>
                  <Text style={styles.supportCardLabel}>{helpDetail.officialEmailLabel}</Text>
                  <Text style={styles.supportCardValue}>bdcutbook@gmail.com</Text>
                </View>
                <MaterialIcons name="mail-outline" size={20} color={colors.text.secondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.supportCard}
                onPress={() => sendEmail('jaoharraihan@gmail.com')}>
                <View style={[styles.supportIconWrapper, styles.supportIconDevEmail]}>
                  <MaterialIcons name="contact-mail" size={24} color="#9C27B0" />
                </View>
                <View style={styles.supportCardText}>
                  <Text style={styles.supportCardLabel}>{helpDetail.devEmailLabel}</Text>
                  <Text style={styles.supportCardValue}>jaoharraihan@gmail.com</Text>
                </View>
                <MaterialIcons name="mail-outline" size={20} color={colors.text.secondary} />
              </TouchableOpacity>

              <TouchableOpacity style={styles.supportCard} onPress={openWebsite}>
                <View style={[styles.supportIconWrapper, styles.supportIconWebsite]}>
                  <MaterialIcons name="public" size={24} color="#FF9800" />
                </View>
                <View style={styles.supportCardText}>
                  <Text style={styles.supportCardLabel}>{helpDetail.websiteLabel}</Text>
                  <Text style={styles.supportCardValue}>https://teamcutbook.github.io/</Text>
                </View>
                <MaterialIcons name="open-in-new" size={20} color={colors.text.secondary} />
              </TouchableOpacity>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* About Modal */}
      <Modal
        visible={aboutModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setAboutModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setAboutModalVisible(false)}>
          <View style={styles.modalContent85} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleRow}>
                <MaterialIcons name="info" size={24} color={Palette.burntOrange} />
                <Text style={styles.modalTitle}>{aboutDetail.title}</Text>
              </View>
              <TouchableOpacity onPress={() => setAboutModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}>
              <View style={styles.aboutHeader}>
                <Text style={styles.aboutTagline}>{aboutDetail.tagline}</Text>
              </View>

              {language === 'bn' ? (
                <Text style={styles.aboutParagraph}>
                  কয়েক মাস আগে, <Text style={styles.aboutHighlight}>আকিজ আইবস-এ (Akij iBos)</Text>{' '}
                  কাজ করার সময় আমি এমন একটি জিনিস খেয়াল করলাম যা ছোট মনে হলেও আমাকে বারবার ভাবিয়ে
                  তুলছিল।
                </Text>
              ) : (
                <Text style={styles.aboutParagraph}>
                  A few months ago, while working at{' '}
                  <Text style={styles.aboutHighlight}>Akij iBos</Text>, I noticed something that
                  seemed small but kept bothering me.
                </Text>
              )}

              <Text style={styles.aboutParagraph}>{aboutDetail.p2}</Text>

              <View style={styles.quoteCard}>
                <Text style={styles.quoteText}>• {aboutDetail.bullet1}</Text>
                <Text style={styles.quoteText}>• {aboutDetail.bullet2}</Text>
                <Text style={styles.quoteText}>• {aboutDetail.bullet3}</Text>
                <Text style={styles.quoteText}>• {aboutDetail.bullet4}</Text>
              </View>

              <Text style={styles.aboutParagraph}>{aboutDetail.p3}</Text>

              {language === 'bn' ? (
                <Text style={styles.aboutParagraph}>
                  ঠিক তখনই \'কাটবুক\' <Text style={styles.aboutHighlight}>(CutBook)</Text> তৈরির
                  আইডিয়া মাথায় আসে।
                </Text>
              ) : (
                <Text style={styles.aboutParagraph}>
                  That's when the idea of <Text style={styles.aboutHighlight}>CutBook</Text> was
                  born.
                </Text>
              )}

              <Text style={styles.aboutParagraph}>{aboutDetail.p5}</Text>

              <View style={styles.questionCard}>
                <Text style={styles.questionText}>{aboutDetail.question}</Text>
              </View>

              <Text style={styles.aboutParagraph}>{aboutDetail.p6}</Text>

              <Text style={styles.aboutParagraph}>{aboutDetail.p7}</Text>

              <Text style={styles.aboutParagraph}>{aboutDetail.p8}</Text>

              <Text style={styles.aboutParagraph}>{aboutDetail.p9}</Text>

              <Text style={styles.aboutParagraph}>{aboutDetail.p10}</Text>

              <Text style={styles.aboutParagraph}>{aboutDetail.p11}</Text>

              <View style={styles.visionCard}>
                <Text style={styles.visionTitle}>{aboutDetail.visionTitle}</Text>
                <Text style={styles.visionText}>{aboutDetail.visionText}</Text>
              </View>

              <Text style={styles.aboutParagraph}>{aboutDetail.p12}</Text>

              <Text style={styles.aboutParagraph}>{aboutDetail.p13}</Text>

              <Text style={styles.aboutFooter}>{aboutDetail.footer}</Text>
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Privacy Policy Modal */}
      <Modal
        visible={privacyModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setPrivacyModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setPrivacyModalVisible(false)}>
          <View style={styles.modalContent80} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleRow}>
                <MaterialIcons name="security" size={24} color={Palette.burntOrange} />
                <Text style={styles.modalTitle}>{t.settings.privacyPolicy}</Text>
              </View>
              <TouchableOpacity onPress={() => setPrivacyModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}>
              {privacyDetail.map((section, idx) => (
                <React.Fragment key={idx}>
                  <Text style={styles.legalSectionTitle}>{section.title}</Text>
                  <Text style={styles.legalText}>{section.text}</Text>
                </React.Fragment>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Terms of Service Modal */}
      <Modal
        visible={termsModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setTermsModalVisible(false)}>
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setTermsModalVisible(false)}>
          <View style={styles.modalContent80} onStartShouldSetResponder={() => true}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleRow}>
                <MaterialIcons name="description" size={24} color={Palette.burntOrange} />
                <Text style={styles.modalTitle}>{t.settings.termsOfService}</Text>
              </View>
              <TouchableOpacity onPress={() => setTermsModalVisible(false)}>
                <MaterialIcons name="close" size={24} color={colors.text.primary} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScrollView}
              contentContainerStyle={styles.modalScrollContent}
              showsVerticalScrollIndicator={false}>
              {termsDetail.map((section, idx) => (
                <React.Fragment key={idx}>
                  <Text style={styles.legalSectionTitle}>{section.title}</Text>
                  <Text style={styles.legalText}>{section.text}</Text>
                </React.Fragment>
              ))}
            </ScrollView>
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
      maxHeight: SCREEN_HEIGHT * 0.7,
    },
    modalContent80: {
      backgroundColor: colors.background.paper,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 24,
      maxHeight: SCREEN_HEIGHT * 0.8,
    },
    modalContent85: {
      backgroundColor: colors.background.paper,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 24,
      maxHeight: SCREEN_HEIGHT * 0.85,
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

    modalHeaderTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    modalScrollView: {
      flexGrow: 1,
      flexShrink: 1,
    },
    supportIconPhone: {
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
    },
    supportIconOfficialEmail: {
      backgroundColor: 'rgba(3, 169, 244, 0.1)',
    },
    supportIconDevEmail: {
      backgroundColor: 'rgba(156, 39, 176, 0.1)',
    },
    supportIconWebsite: {
      backgroundColor: 'rgba(255, 152, 0, 0.1)',
    },
    modalScrollContent: {
      paddingBottom: 24,
    },
    // Help modal cards
    supportCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.background.default,
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    supportIconWrapper: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 14,
    },
    supportCardText: {
      flex: 1,
    },
    supportCardLabel: {
      fontSize: 12,
      color: colors.text.secondary,
      marginBottom: 2,
    },
    supportCardValue: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text.primary,
    },
    // About modal story
    aboutHeader: {
      alignItems: 'center',
      marginBottom: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
      paddingBottom: 10,
    },
    aboutTagline: {
      fontSize: 16,
      fontWeight: '700',
      color: Palette.burntOrange,
    },
    aboutParagraph: {
      fontSize: 14,
      lineHeight: 22,
      color: colors.text.primary,
      marginBottom: 14,
    },
    aboutHighlight: {
      fontWeight: '700',
      color: Palette.burntOrange,
    },
    quoteCard: {
      backgroundColor: isDarkMode ? Palette.midnightViolet : '#FFF8F0',
      borderLeftWidth: 4,
      borderLeftColor: Palette.burntOrange,
      padding: 14,
      borderRadius: 8,
      marginBottom: 16,
      gap: 4,
    },
    quoteText: {
      fontSize: 13,
      color: colors.text.secondary,
      lineHeight: 18,
    },
    questionCard: {
      backgroundColor: isDarkMode ? Palette.inkBlack : colors.background.default,
      padding: 16,
      borderRadius: 10,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: Palette.wheat,
      marginBottom: 16,
    },
    questionText: {
      fontSize: 15,
      fontWeight: '600',
      fontStyle: 'italic',
      color: colors.text.primary,
      textAlign: 'center',
    },
    visionCard: {
      backgroundColor: Palette.darkSlateGrey,
      padding: 16,
      borderRadius: 10,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: Palette.wheat,
    },
    visionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: 6,
    },
    visionText: {
      fontSize: 14,
      lineHeight: 20,
      color: Palette.wheat,
    },
    aboutFooter: {
      fontSize: 16,
      fontWeight: '700',
      color: Palette.burntOrange,
      textAlign: 'center',
      marginTop: 10,
      marginBottom: 20,
    },
    // Legal styling
    legalSectionTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text.primary,
      marginTop: 16,
      marginBottom: 6,
    },
    legalText: {
      fontSize: 13,
      lineHeight: 18,
      color: colors.text.secondary,
      marginBottom: 10,
    },
  });
