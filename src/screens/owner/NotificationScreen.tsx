import React, {useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import {useNotifications} from '@/hooks/useNotifications';
import {useTheme, useLanguage} from '@/context';
import type {AppNotification, NotificationType} from '@/types/notifications';
import {useThemedStyles} from '@/hooks/useThemedStyles';
import {ThemeColors} from '@/constants/theme';

export default function NotificationScreen({navigation}: any): React.ReactElement {
  const {notifications, unreadCount, loading, error, actions} = useNotifications();
  const {isDarkMode, colors} = useTheme();
  const {language, t} = useLanguage();
  const styles = useThemedStyles(getStyles);

  const renderTitleIcon = (type: NotificationType) => {
    switch (type) {
      case 'PAYMENT_REQUEST':
        return <MaterialIcons name="request-page" size={22} color={colors.primary[500]} />;
      case 'PAYMENT_ACCEPTED':
        return <MaterialIcons name="check-circle" size={22} color={colors.success.main} />;
      case 'PAYMENT_REJECTED':
        return <MaterialIcons name="cancel" size={22} color={colors.error.main} />;
      default:
        return <MaterialIcons name="notifications" size={22} color={colors.primary[500]} />;
    }
  };

  const list = useMemo(() => notifications, [notifications]);

  const handleMarkAllRead = async () => {
    try {
      await actions.markAllAsRead();
    } catch {
      // swallow; UI can show error via hook if needed
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background.paper}
      />

      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>{t.settings.notifications}</Text>
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          ) : null}
        </View>
        {unreadCount > 0 ? (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markAll}>
              {language === 'en'
                ? 'Mark all as read'
                : language === 'bn'
                  ? 'সব পঠিত হিসেবে চিহ্নিত করুন'
                  : language === 'es'
                    ? 'Marcar todo como leído'
                    : 'सभी को पढ़े गए के रूप में चिह्नित करें'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={() => actions.markAllAsRead()}
            colors={[colors.primary[500]]}
            tintColor={colors.primary[500]}
          />
        }
        showsVerticalScrollIndicator={false}>
        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {list.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="notifications-none" size={54} color={colors.text.hint} />
            <Text style={styles.emptyTitle}>
              {language === 'en'
                ? 'No notifications'
                : language === 'bn'
                  ? 'কোন বিজ্ঞপ্তি নেই'
                  : language === 'es'
                    ? 'Sin notificaciones'
                    : 'कोई सूचना नहीं'}
            </Text>
            <Text style={styles.emptyText}>
              {language === 'en'
                ? "You're all caught up."
                : language === 'bn'
                  ? 'আপনার সব কাজ সম্পন্ন হয়েছে।'
                  : language === 'es'
                    ? 'Está al día.'
                    : 'आप पूरी तरह से अपडेट हैं।'}
            </Text>
          </View>
        ) : (
          list.map(n => (
            <NotificationCard
              key={n.id}
              notification={n}
              renderTitleIcon={renderTitleIcon}
              styles={styles}
              onPress={async () => {
                try {
                  if (!n.isRead) {
                    await actions.markRead(n.id);
                  }
                  if (
                    (n.type === 'PAYMENT_ACCEPTED' || n.type === 'PAYMENT_REJECTED') &&
                    n.senderId
                  ) {
                    navigation.navigate('Employees', {
                      screen: 'EmployeeDetail',
                      params: {employeeId: n.senderId},
                    });
                  }
                } catch {
                  // ignore
                }
              }}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function NotificationCard({
  notification,
  renderTitleIcon,
  onPress,
  styles,
}: {
  notification: AppNotification;
  renderTitleIcon: (type: NotificationType) => React.ReactElement;
  onPress: () => void;
  styles: any;
}) {
  const {type, title, message, createdAt, isRead} = notification;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[styles.card, !isRead && styles.cardUnread]}>
      <View style={styles.cardHeader}>
        {renderTitleIcon(type)}
        <View style={styles.cardHeaderText}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardTime}>
            {createdAt instanceof Date
              ? createdAt.toLocaleString()
              : createdAt
                ? new Date(createdAt as any).toLocaleString()
                : ''}
          </Text>
        </View>
      </View>
      <Text style={styles.cardMessage}>{message}</Text>
    </TouchableOpacity>
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
      paddingTop: 16,
      paddingBottom: 10,
      backgroundColor: colors.background.paper,
      borderBottomWidth: 1,
      borderBottomColor: colors.border.light,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: colors.text.primary,
    },
    badge: {
      backgroundColor: colors.primary[500],
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
    },
    badgeText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 13,
    },
    markAll: {
      marginTop: 8,
      color: colors.primary[500],
      fontWeight: '600',
    },
    scroll: {
      flex: 1,
    },
    scrollContent: {
      padding: 16,
      paddingBottom: 24,
    },
    errorBox: {
      backgroundColor: isDarkMode ? 'rgba(244, 67, 54, 0.1)' : '#FFEBEE',
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.error.main,
      marginBottom: 12,
    },
    errorText: {
      color: colors.error.main,
      fontWeight: '600',
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 60,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text.primary,
      marginTop: 10,
    },
    emptyText: {
      fontSize: 14,
      color: colors.text.secondary,
      marginTop: 6,
    },
    card: {
      backgroundColor: colors.background.paper,
      borderRadius: 12,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border.light,
      marginBottom: 12,
    },
    cardUnread: {
      borderColor: colors.primary[500],
      backgroundColor: isDarkMode ? colors.neutral[100] : '#E3F2FD',
    },
    cardHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      marginBottom: 8,
    },
    cardHeaderText: {
      flex: 1,
    },
    cardTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text.primary,
      marginBottom: 2,
    },
    cardTime: {
      fontSize: 12,
      color: colors.text.secondary,
    },
    cardMessage: {
      fontSize: 14,
      color: colors.text.primary,
      lineHeight: 20,
    },
  });
