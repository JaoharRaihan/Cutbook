/**
 * NotificationScreen.tsx
 * Employee notification center (payment request/accept/reject)
 */

import React, {useMemo, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from '@react-native-vector-icons/material-icons';
import {useNotifications} from '@/hooks/useNotifications';
import type {AppNotification, NotificationType} from '@/types/notifications';
import {useTheme, useLanguage, useOrg, useAuth} from '@/context';
import {useThemedStyles} from '@/hooks/useThemedStyles';
import {ThemeColors} from '@/constants/theme';
import {TransactionStatus} from '@/types';
import {createNotification} from '@/services/notificationService';
import {sendPayoutResponsePush} from '@/services/fcmService';

export default function NotificationScreen({_navigation}: any): React.ReactElement {
  const {notifications, unreadCount, loading, error, actions} = useNotifications();
  const {respondToTransaction, employeeTransactions} = useOrg();
  const {user} = useAuth();
  const {colors, isDarkMode} = useTheme();
  const {language} = useLanguage();
  const styles = useThemedStyles(getStyles);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  // Optimistic UI map: tracks transactions responded from this screen
  const [respondedTxnMap, setRespondedTxnMap] = useState<Record<string, TransactionStatus>>({});

  const list = useMemo(() => notifications, [notifications]);

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

  const handleMarkAllRead = async () => {
    try {
      await actions.markAllAsRead();
    } catch {
      // ignore
    }
  };

  const handleRespond = async (notification: AppNotification, accepted: boolean) => {
    if (!notification.relatedRequestId || respondingId) return;

    // Pre-flight guard: check if already responded via local map or context
    const alreadyRespondedLocally = respondedTxnMap[notification.relatedRequestId];
    const contextTxn = employeeTransactions?.find(t => t.id === notification.relatedRequestId);
    if (
      alreadyRespondedLocally ||
      (contextTxn && contextTxn.status !== TransactionStatus.PENDING)
    ) {
      const title =
        language === 'en'
          ? 'Already Processed'
          : language === 'bn'
            ? 'ইতিমধ্যে প্রক্রিয়াজাত'
            : 'Ya procesado';
      const msg =
        language === 'en'
          ? 'This request has already been accepted or rejected.'
          : language === 'bn'
            ? 'এই অনুরোধটি ইতিমধ্যে গ্রহণ বা প্রত্যাখ্যান করা হয়েছে।'
            : 'Esta solicitud ya ha sido aceptada o rechazada.';
      Alert.alert(title, msg, [{text: 'OK'}]);
      return;
    }

    const confirmTitle = accepted
      ? language === 'en'
        ? 'Accept Payment'
        : language === 'bn'
          ? 'পেমেন্ট গ্রহণ করুন'
          : language === 'es'
            ? 'Aceptar Pago'
            : 'भुगतान स्वीकार करें'
      : language === 'en'
        ? 'Reject Payment'
        : language === 'bn'
          ? 'পেমেন্ট প্রত্যাখ্যান করুন'
          : language === 'es'
            ? 'Rechazar Pago'
            : 'भुगतान अस्वीकार करें';

    const confirmMsg = accepted
      ? language === 'en'
        ? 'Are you sure you want to accept this payment?'
        : language === 'bn'
          ? 'আপনি কি এই পেমেন্টটি গ্রহণ করতে চান?'
          : language === 'es'
            ? '¿Está seguro de que desea aceptar este pago?'
            : 'क्या आप वाकई यह भुगतान स्वीकार करना चाहते हैं?'
      : language === 'en'
        ? 'Are you sure you want to reject this payment?'
        : language === 'bn'
          ? 'আপনি কি এই পেমেন্টটি প্রত্যাখ্যান করতে চান?'
          : language === 'es'
            ? '¿Está seguro de que desea rechazar este pago?'
            : 'क्या आप वाकई यह भुगतान अस्वीकार करना चाहते हैं?';

    Alert.alert(confirmTitle, confirmMsg, [
      {
        text:
          language === 'en'
            ? 'Cancel'
            : language === 'bn'
              ? 'বাতিল'
              : language === 'es'
                ? 'Cancelar'
                : 'रद्द करें',
        style: 'cancel',
      },
      {
        text: accepted
          ? language === 'en'
            ? 'Accept'
            : language === 'bn'
              ? 'গ্রহণ করুন'
              : 'Aceptar'
          : language === 'en'
            ? 'Reject'
            : language === 'bn'
              ? 'প্রত্যাখ্যান করুন'
              : 'Rechazar',
        style: accepted ? 'default' : 'destructive',
        onPress: async () => {
          setRespondingId(notification.id);
          try {
            const status = accepted ? TransactionStatus.ACCEPTED : TransactionStatus.REJECTED;

            // Optimistic UI: immediately mark as responded so buttons disappear
            setRespondedTxnMap(prev => ({
              ...prev,
              [notification.relatedRequestId!]: status,
            }));

            await respondToTransaction(notification.relatedRequestId, status);

            // Mark in-app notification as read
            if (!notification.isRead) {
              await actions.markRead(notification.id);
            }

            // Send push back to owner
            if (user && notification.senderId) {
              const emoji = accepted ? '✅' : '❌';
              const responseType = accepted ? 'PAYMENT_ACCEPTED' : 'PAYMENT_REJECTED';
              const actionText = accepted
                ? language === 'en'
                  ? 'accepted'
                  : language === 'bn'
                    ? 'গ্রহণ করেছেন'
                    : 'aceptó'
                : language === 'en'
                  ? 'rejected'
                  : language === 'bn'
                    ? 'প্রত্যাখ্যান করেছেন'
                    : 'rechazó';

              // In-app notification back to owner
              await createNotification({
                orgId: notification.orgId,
                recipientId: notification.senderId,
                senderId: user.id,
                type: responseType,
                title: `${emoji} Payment ${accepted ? 'Accepted' : 'Rejected'}`,
                message: `${user.name || 'Employee'} ${actionText} your payment request.`,
                relatedRequestId: notification.relatedRequestId,
                isRead: false,
              }).catch(() => {});

              // Find actual amount from employeeTransactions
              const txn = employeeTransactions.find(
                item => item.id === notification.relatedRequestId,
              );
              const actualAmount = txn ? txn.amount : 0;

              // Device push notification to owner
              await sendPayoutResponsePush({
                ownerId: notification.senderId,
                employeeName: user.name || 'Employee',
                amount: actualAmount,
                accepted,
                transactionId: notification.relatedRequestId,
              }).catch(() => {});
            }

            const successTitle = accepted
              ? language === 'en'
                ? 'Payment Accepted'
                : language === 'bn'
                  ? 'পেমেন্ট গৃহীত হয়েছে'
                  : language === 'es'
                    ? 'Pago Aceptado'
                    : 'भुगतान स्वीकृत'
              : language === 'en'
                ? 'Payment Rejected'
                : language === 'bn'
                  ? 'পেমেন্ট প্রত্যাখ্যাত হয়েছে'
                  : language === 'es'
                    ? 'Pago Rechazado'
                    : 'भुगतान अस्वीकृत';

            const successMsg = accepted
              ? language === 'en'
                ? 'The payment has been accepted successfully.'
                : language === 'bn'
                  ? 'পেমেন্টটি সফলভাবে গৃহীত হয়েছে।'
                  : language === 'es'
                    ? 'El pago ha sido aceptado exitosamente.'
                    : 'भुगतान सफलतापूर्वक स्वीकार किया गया।'
              : language === 'en'
                ? 'The payment has been rejected.'
                : language === 'bn'
                  ? 'পেমেন্টটি প্রত্যাখ্যান করা হয়েছে।'
                  : language === 'es'
                    ? 'El pago ha sido rechazado.'
                    : 'भुगतान अस्वीकार कर दिया गया।';

            Alert.alert(successTitle, successMsg, [{text: 'OK'}]);
          } catch (err: any) {
            if (err.message === 'Transaction already responded to') {
              const title =
                language === 'en'
                  ? 'Already Processed'
                  : language === 'bn'
                    ? 'ইতিমধ্যে প্রক্রিয়াজাত'
                    : 'Ya procesado';
              const msg =
                language === 'en'
                  ? 'This request has already been accepted or rejected.'
                  : language === 'bn'
                    ? 'এই অনুরোধটি ইতিমধ্যে গ্রহণ বা প্রত্যাখ্যান করা হয়েছে।'
                    : 'Esta solicitud ya ha sido aceptada o rechazada.';
              Alert.alert(title, msg, [{text: 'OK'}]);
            } else {
              Alert.alert(
                language === 'en' ? 'Error' : 'ত্রুটি',
                err.message || 'Failed to respond to payment',
              );
            }
          } finally {
            setRespondingId(null);
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background.paper}
      />

      <View style={styles.header}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>
            {language === 'en'
              ? 'Notifications'
              : language === 'bn'
                ? 'বিজ্ঞপ্তি'
                : language === 'es'
                  ? 'Notificaciones'
                  : 'सूचनाएं'}
          </Text>
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
                    : 'सभी को पढ़ा हुआ चिह्नित करें'}
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
            onRefresh={handleMarkAllRead}
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
                  ? 'আপনি সব বিজ্ঞপ্তি দেখেছেন।'
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
              isResponding={respondingId === n.id}
              onPress={async () => {
                try {
                  if (!n.isRead) {
                    await actions.markRead(n.id);
                  }
                } catch {
                  // ignore
                }
              }}
              onAccept={() => handleRespond(n, true)}
              onReject={() => handleRespond(n, false)}
              language={language}
              colors={colors}
              employeeTransactions={employeeTransactions}
              respondedTxnMap={respondedTxnMap}
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
  onAccept,
  onReject,
  styles,
  isResponding,
  language,
  colors,
  employeeTransactions,
  respondedTxnMap,
}: {
  notification: AppNotification;
  renderTitleIcon: (type: NotificationType) => React.ReactElement;
  onPress: () => void;
  onAccept: () => void;
  onReject: () => void;
  styles: any;
  isResponding: boolean;
  language: string;
  colors: any;
  employeeTransactions: any[];
  respondedTxnMap: Record<string, TransactionStatus>;
}) {
  const {type, title, message, createdAt, isRead} = notification;

  // Check optimistic local map first, then fall back to context
  const localStatus = notification.relatedRequestId
    ? respondedTxnMap[notification.relatedRequestId]
    : undefined;
  const relatedTxn = employeeTransactions?.find(t => t.id === notification.relatedRequestId);
  const txnStatus = localStatus || (relatedTxn ? relatedTxn.status : TransactionStatus.PENDING);

  const isPendingRequest = type === 'PAYMENT_REQUEST' && txnStatus === TransactionStatus.PENDING;

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

      {/* Show status if already responded */}
      {type === 'PAYMENT_REQUEST' && txnStatus === TransactionStatus.ACCEPTED && (
        <View style={styles.acceptedInfo}>
          <MaterialIcons name="check-circle" size={16} color={colors.success.main} />
          <Text style={styles.acceptedText}>
            {language === 'en'
              ? 'Accepted'
              : language === 'bn'
                ? 'গৃহীত'
                : language === 'es'
                  ? 'Aceptado'
                  : 'स्वीकृत'}
          </Text>
        </View>
      )}

      {type === 'PAYMENT_REQUEST' && txnStatus === TransactionStatus.REJECTED && (
        <View style={styles.rejectedInfo}>
          <MaterialIcons name="cancel" size={16} color={colors.error.main} />
          <Text style={styles.rejectedText}>
            {language === 'en'
              ? 'Rejected'
              : language === 'bn'
                ? 'প্রত্যাখ্যাত'
                : language === 'es'
                  ? 'Rechazado'
                  : 'অস্বীকৃত'}
          </Text>
        </View>
      )}

      {/* Accept / Reject buttons — only for pending payment requests */}
      {isPendingRequest ? (
        <View style={styles.actionRow}>
          {isResponding ? (
            <ActivityIndicator color={colors.primary[500]} style={{marginTop: 10}} />
          ) : (
            <>
              <TouchableOpacity style={styles.acceptButton} onPress={onAccept} activeOpacity={0.8}>
                <MaterialIcons name="check-circle" size={16} color="#FFFFFF" />
                <Text style={styles.acceptButtonText}>
                  {language === 'en'
                    ? 'Accept'
                    : language === 'bn'
                      ? 'গ্রহণ করুন'
                      : language === 'es'
                        ? 'Aceptar'
                        : 'स्वीकार करें'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.rejectButton} onPress={onReject} activeOpacity={0.8}>
                <MaterialIcons name="cancel" size={16} color="#FFFFFF" />
                <Text style={styles.rejectButtonText}>
                  {language === 'en'
                    ? 'Reject'
                    : language === 'bn'
                      ? 'প্রত্যাখ্যান করুন'
                      : language === 'es'
                        ? 'Rechazar'
                        : 'अस्वीकार करें'}
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      ) : null}
    </TouchableOpacity>
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
      backgroundColor: isDarkMode ? colors.background.paper : '#FFEBEE',
      borderRadius: 12,
      padding: 12,
      borderWidth: 1,
      borderColor: colors.error.main,
      marginBottom: 12,
    },
    errorText: {
      color: colors.error.dark,
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
      backgroundColor: isDarkMode ? colors.neutral[100] : colors.primary[50],
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
      color: colors.text.hint,
    },
    cardMessage: {
      fontSize: 14,
      color: colors.text.primary,
      lineHeight: 20,
    },
    // Action buttons for PAYMENT_REQUEST cards
    actionRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 12,
    },
    acceptButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: colors.success.main,
      paddingVertical: 10,
      borderRadius: 8,
      elevation: 2,
      shadowColor: colors.success.main,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    acceptButtonText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 14,
    },
    rejectButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: colors.error.main,
      paddingVertical: 10,
      borderRadius: 8,
      elevation: 2,
      shadowColor: colors.error.main,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },
    rejectButtonText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 14,
    },
    acceptedInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? colors.neutral[100] : '#E8F5E9',
      borderRadius: 8,
      paddingVertical: 6,
      paddingHorizontal: 10,
      gap: 6,
      marginTop: 10,
      alignSelf: 'flex-start',
    },
    acceptedText: {
      color: colors.success.dark,
      fontWeight: '600',
      fontSize: 13,
    },
    rejectedInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? colors.neutral[100] : '#FFEBEE',
      borderRadius: 8,
      paddingVertical: 6,
      paddingHorizontal: 10,
      gap: 6,
      marginTop: 10,
      alignSelf: 'flex-start',
    },
    rejectedText: {
      color: colors.error.dark,
      fontWeight: '600',
      fontSize: 13,
    },
  });
