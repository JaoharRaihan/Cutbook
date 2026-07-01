/**
 * EmployeeTransactionsScreen.tsx
 * Employee view for pending payment transactions
 */

import React, {useMemo} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {TransactionStatus} from '@/types';
import {useAuth, useOrg, useTheme, useLanguage} from '@/context';
import {
  createNotification,
  markNotificationForTransactionAsRead,
} from '@/services/notificationService';
import type {NotificationType} from '@/types/notifications';
import {formatBDT} from '@/utils/currency';
import {formatDateISO} from '@/utils/date';
import {useThemedStyles} from '@/hooks/useThemedStyles';
import {ThemeColors} from '@/constants/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';

export default function EmployeeTransactionsScreen(): React.ReactElement {
  const {user} = useAuth();
  const {employeeTransactions, respondToTransaction, loading} = useOrg();
  const {colors, isDarkMode} = useTheme();
  const {language, t} = useLanguage();
  const styles = useThemedStyles(getStyles);

  const [respondingTo, setRespondingTo] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  // Filter transactions for current employee
  const myTransactions = useMemo(() => {
    if (!user?.id) return [];
    return employeeTransactions.filter(txn => txn.employeeId === user.id);
  }, [employeeTransactions, user?.id]);

  // Local copy for optimistic UI so Accept/Reject buttons disappear immediately
  const [localTransactions, setLocalTransactions] = React.useState<any[]>([]);

  const pendingCount = useMemo(() => {
    return localTransactions.filter(txn => txn.status === TransactionStatus.PENDING).length;
  }, [localTransactions]);

  const totalReceived = useMemo(() => {
    return localTransactions
      .filter(txn => txn.status === TransactionStatus.ACCEPTED)
      .reduce((sum, txn) => sum + txn.amount, 0);
  }, [localTransactions]);

  React.useEffect(() => {
    setLocalTransactions(myTransactions);
  }, [myTransactions]);

  const handleRefresh = async () => {
    setRefreshing(true);
    // Just wait a moment since data is already real-time synced
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleRespond = async (transactionId: string, status: TransactionStatus) => {
    const txn = employeeTransactions.find(item => item.id === transactionId);

    // Pre-flight guard: check if already responded via context
    if (txn && txn.status !== TransactionStatus.PENDING) {
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
      // Also fix local state to reflect actual status
      setLocalTransactions(prev =>
        prev.map(item => (item.id === transactionId ? {...item, status: txn.status} : item)),
      );
      return;
    }

    setRespondingTo(transactionId);
    try {
      // Optimistic UI update: hide Accept/Reject immediately
      setLocalTransactions(prev =>
        prev.map(item =>
          item.id === transactionId
            ? {
                ...item,
                status,
                respondedAt: item.respondedAt ?? new Date().toISOString(),
              }
            : item,
        ),
      );

      await respondToTransaction(transactionId, status);

      // Mark corresponding notification as read
      if (user?.id) {
        await markNotificationForTransactionAsRead(transactionId, user.id).catch(() => {});
      }

      if (txn && user?.id) {
        const type: NotificationType =
          status === TransactionStatus.ACCEPTED ? 'PAYMENT_ACCEPTED' : 'PAYMENT_REJECTED';

        await createNotification({
          orgId: txn.orgId,
          recipientId: txn.ownerId,
          senderId: user.id,
          type,
          title: 'Payment update',
          message:
            status === TransactionStatus.ACCEPTED
              ? `${user.name || 'Employee'} accepted your payment request of ${formatBDT(
                  txn.amount,
                )}.`
              : `${user.name || 'Employee'} rejected your payment request of ${formatBDT(
                  txn.amount,
                )}.`,
          relatedRequestId: txn.id,
          isRead: false,
        });
      }

      const alertMsg =
        status === TransactionStatus.ACCEPTED
          ? language === 'en'
            ? 'Payment accepted'
            : language === 'bn'
              ? 'পেমেন্ট গৃহীত হয়েছে'
              : language === 'es'
                ? 'Pago aceptado'
                : 'भुगतान स्वीकार कर लिया गया'
          : language === 'en'
            ? 'Payment rejected'
            : language === 'bn'
              ? 'পেমেন্ট প্রত্যাখ্যাত হয়েছে'
              : language === 'es'
                ? 'Pago rechazado'
                : 'भुगतान अस्वीकार कर दिया गया';

      Alert.alert(t.common.success, alertMsg);
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
          t.common.error,
          err.message ||
            (language === 'en'
              ? 'Failed to respond to transaction'
              : language === 'bn'
                ? 'লেনদেনের প্রতিক্রিয়া জানাতে ব্যর্থ হয়েছে'
                : language === 'es'
                  ? 'Error al responder a la transacción'
                  : 'लेनदेन का उत्तर देने में विफल'),
        );
      }
    } finally {
      setRespondingTo(null);
    }
  };

  const getStatusColor = (status: TransactionStatus): string => {
    switch (status) {
      case TransactionStatus.PENDING:
        return colors.warning.main;
      case TransactionStatus.ACCEPTED:
        return colors.success.main;
      case TransactionStatus.REJECTED:
        return colors.error.main;
      default:
        return colors.text.hint;
    }
  };

  const getStatusLabel = (status: TransactionStatus): string => {
    switch (status) {
      case TransactionStatus.PENDING:
        return language === 'en'
          ? 'Pending'
          : language === 'bn'
            ? 'পেন্ডিং'
            : language === 'es'
              ? 'Pendiente'
              : 'लंबित';
      case TransactionStatus.ACCEPTED:
        return language === 'en'
          ? 'Accepted'
          : language === 'bn'
            ? 'গৃহীত'
            : language === 'es'
              ? 'Aceptado'
              : 'स्वीकृत';
      case TransactionStatus.REJECTED:
        return language === 'en'
          ? 'Rejected'
          : language === 'bn'
            ? 'প্রত্যাখ্যাত'
            : language === 'es'
              ? 'Rechazado'
              : 'अस्वीकृत';
      default:
        return 'Unknown';
    }
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>
            {language === 'en'
              ? 'Loading payments...'
              : language === 'bn'
                ? 'পেমেন্ট লোড হচ্ছে...'
                : language === 'es'
                  ? 'Cargando pagos...'
                  : 'भुगतान लोड हो रहे हैं...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background.paper}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary[500]]}
            tintColor={colors.primary[500]}
          />
        }>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {language === 'en'
              ? 'Payments'
              : language === 'bn'
                ? 'পেমেন্টসমূহ'
                : language === 'es'
                  ? 'Pagos'
                  : 'भुगतान'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {localTransactions.length === 0
              ? language === 'en'
                ? 'No payments yet'
                : language === 'bn'
                  ? 'এখনো কোনো পেমেন্ট নেই'
                  : language === 'es'
                    ? 'Aún no hay pagos'
                    : 'अभी तक कोई भुगतान नहीं'
              : `${localTransactions.length} ${language === 'en' ? (localTransactions.length === 1 ? 'payment' : 'payments') : language === 'bn' ? 'টি পেমেন্ট' : language === 'es' ? (localTransactions.length === 1 ? 'pago' : 'pagos') : 'भुगतान'}`}
          </Text>
        </View>

        {/* ── Dashboard Stats Header ── */}
        {localTransactions.length > 0 && (
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <View style={styles.statIconWrapperSuccess}>
                <MaterialIcons name="monetization-on" size={20} color={colors.success.main} />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>
                  {language === 'en'
                    ? 'Total Received'
                    : language === 'bn'
                      ? 'মোট প্রাপ্তি'
                      : language === 'es'
                        ? 'Total Recibido'
                        : 'कुल प्राप्त'}
                </Text>
                <Text style={styles.statValue}>{formatBDT(totalReceived)}</Text>
              </View>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIconWrapperWarning}>
                <MaterialIcons name="hourglass-empty" size={20} color={colors.warning.main} />
              </View>
              <View style={styles.statTextContainer}>
                <Text style={styles.statLabel}>
                  {language === 'en'
                    ? 'Pending Payouts'
                    : language === 'bn'
                      ? 'অপেক্ষমান অনুরোধ'
                      : language === 'es'
                        ? 'Solicitudes Pendientes'
                        : 'लंबित अनुरोध'}
                </Text>
                <Text style={styles.statValue}>{pendingCount}</Text>
              </View>
            </View>
          </View>
        )}

        {localTransactions.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📭</Text>
            <Text style={styles.emptyStateTitle}>
              {language === 'en'
                ? 'No Payments'
                : language === 'bn'
                  ? 'কোন পেমেন্ট নেই'
                  : language === 'es'
                    ? 'Sin Pagos'
                    : 'कोई भुगतान नहीं'}
            </Text>
            <Text style={styles.emptyStateMessage}>
              {language === 'en'
                ? 'When your owner sends you a payment, it will appear here'
                : language === 'bn'
                  ? 'আপনার মালিক যখন আপনাকে পেমেন্ট পাঠাবেন, তখন তা এখানে প্রদর্শিত হবে'
                  : language === 'es'
                    ? 'Cuando su propietario le envíe un pago, aparecerá aquí'
                    : 'जब आपका मालिक आपको भुगतान भेजेगा, तो वह यहाँ दिखाई देगा'}
            </Text>
          </View>
        ) : (
          <View>
            {localTransactions.map((transaction: any) => {
              const statusColor = getStatusColor(transaction.status);
              const statusBg = statusColor + '15'; // soft background

              return (
                <View key={transaction.id} style={styles.transactionCard}>
                  {/* Card Header with Wallet Icon & Meta Details */}
                  <View style={styles.transactionHeader}>
                    <View style={styles.cardHeaderLeft}>
                      <View style={[styles.cardHeaderIconBg, {backgroundColor: statusBg}]}>
                        <MaterialIcons
                          name="account-balance-wallet"
                          size={20}
                          color={statusColor}
                        />
                      </View>
                      <View style={styles.transactionInfo}>
                        <Text style={styles.senderName}>{transaction.ownerName}</Text>
                        <Text style={styles.transactionDate}>
                          {formatDateISO(transaction.createdAt)}
                        </Text>
                      </View>
                    </View>
                    <View style={[styles.statusBadge, {backgroundColor: statusBg}]}>
                      <Text style={[styles.statusText, {color: statusColor}]}>
                        {getStatusLabel(transaction.status)}
                      </Text>
                    </View>
                  </View>

                  {/* Dashed Divider Line */}
                  <View style={styles.cardDivider} />

                  {/* Payout Amount Section */}
                  <View style={styles.amountContainer}>
                    <Text style={styles.amountLabel}>
                      {language === 'en'
                        ? 'Payout Amount'
                        : language === 'bn'
                          ? 'পে-আউটের পরিমাণ'
                          : language === 'es'
                            ? 'Monto del Pago'
                            : 'पेआउट राशि'}
                    </Text>
                    <Text style={styles.amount}>{formatBDT(transaction.amount)}</Text>
                  </View>

                  {/* Note Section */}
                  {transaction.note !== undefined && transaction.note.trim() !== '' && (
                    <View style={styles.noteContainer}>
                      <Text style={styles.noteLabel}>
                        {language === 'en'
                          ? 'Note'
                          : language === 'bn'
                            ? 'নোট'
                            : language === 'es'
                              ? 'Nota'
                              : 'नोट'}
                      </Text>
                      <Text style={styles.noteText}>{transaction.note}</Text>
                    </View>
                  )}

                  {/* Actions / Info Block */}
                  {transaction.status === TransactionStatus.PENDING && (
                    <View style={styles.actionButtons}>
                      <TouchableOpacity
                        style={[
                          styles.rejectButton,
                          respondingTo === transaction.id && styles.buttonDisabled,
                        ]}
                        onPress={() => handleRespond(transaction.id, TransactionStatus.REJECTED)}
                        disabled={respondingTo === transaction.id}>
                        {respondingTo === transaction.id ? (
                          <ActivityIndicator color={colors.error.main} size="small" />
                        ) : (
                          <>
                            <MaterialIcons name="close" size={16} color={colors.error.main} />
                            <Text style={styles.rejectButtonText}>
                              {language === 'en'
                                ? 'Reject'
                                : language === 'bn'
                                  ? 'প্রত্যাখ্যান'
                                  : language === 'es'
                                    ? 'Rechazar'
                                    : 'अस्वीकार'}
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[
                          styles.acceptButton,
                          respondingTo === transaction.id && styles.buttonDisabled,
                        ]}
                        onPress={() => handleRespond(transaction.id, TransactionStatus.ACCEPTED)}
                        disabled={respondingTo === transaction.id}>
                        {respondingTo === transaction.id ? (
                          <ActivityIndicator color="#FFFFFF" size="small" />
                        ) : (
                          <>
                            <MaterialIcons name="check" size={16} color="#FFFFFF" />
                            <Text style={styles.acceptButtonText}>
                              {language === 'en'
                                ? 'Accept'
                                : language === 'bn'
                                  ? 'গ্রহণ'
                                  : language === 'es'
                                    ? 'Aceptar'
                                    : 'स्वीकार'}
                            </Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}

                  {transaction.status === TransactionStatus.ACCEPTED && (
                    <View style={styles.acceptedInfo}>
                      <MaterialIcons name="check-circle" size={18} color={colors.success.main} />
                      <View>
                        <Text style={styles.acceptedLabel}>
                          {language === 'en'
                            ? 'Payout Accepted'
                            : language === 'bn'
                              ? 'পে-আউট গৃহীত হয়েছে'
                              : language === 'es'
                                ? 'Pago Aceptado'
                                : 'पेआउट स्वीकृत'}
                        </Text>
                        <Text style={styles.acceptedDate}>
                          {transaction.respondedAt ? formatDateISO(transaction.respondedAt) : ''}
                        </Text>
                      </View>
                    </View>
                  )}

                  {transaction.status === TransactionStatus.REJECTED && (
                    <View style={styles.rejectedInfo}>
                      <MaterialIcons name="cancel" size={18} color={colors.error.main} />
                      <View>
                        <Text style={styles.rejectedLabel}>
                          {language === 'en'
                            ? 'Payout Rejected'
                            : language === 'bn'
                              ? 'পে-আউট প্রত্যাখ্যাত হয়েছে'
                              : language === 'es'
                                ? 'Pago Rechazado'
                                : 'पेआउट अस्वीकृत'}
                        </Text>
                        <Text style={styles.rejectedDate}>
                          {transaction.respondedAt ? formatDateISO(transaction.respondedAt) : ''}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
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
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.background.default,
    },
    loadingText: {
      marginTop: 12,
      fontSize: 16,
      color: colors.text.secondary,
    },
    scrollView: {
      flex: 1,
    },
    scrollContent: {
      paddingTop: 16,
      paddingBottom: 24,
    },
    header: {
      paddingHorizontal: 16,
      marginBottom: 16,
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
    // ── Stats Header ──
    statsContainer: {
      flexDirection: 'row',
      gap: 12,
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    statCard: {
      flex: 1,
      backgroundColor: colors.background.paper,
      borderRadius: 12,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    statIconWrapperSuccess: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(76, 175, 80, 0.1)',
    },
    statIconWrapperWarning: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255, 152, 0, 0.1)',
    },
    statTextContainer: {
      flex: 1,
    },
    statLabel: {
      fontSize: 10,
      color: colors.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      fontWeight: '600',
    },
    statValue: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text.primary,
      marginTop: 2,
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: 60,
      paddingHorizontal: 20,
    },
    emptyStateIcon: {
      fontSize: 64,
      marginBottom: 16,
    },
    emptyStateTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.text.primary,
      marginBottom: 8,
    },
    emptyStateMessage: {
      fontSize: 14,
      color: colors.text.secondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    // ── Transaction Card ──
    transactionCard: {
      backgroundColor: colors.background.paper,
      marginHorizontal: 16,
      marginBottom: 12,
      borderRadius: 16,
      padding: 16,
      borderWidth: 1,
      borderColor: colors.border.light,
      shadowColor: '#000',
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: isDarkMode ? 0.2 : 0.05,
      shadowRadius: 4,
      elevation: 2,
    },
    transactionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    cardHeaderLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
      gap: 12,
    },
    cardHeaderIconBg: {
      width: 38,
      height: 38,
      borderRadius: 19,
      alignItems: 'center',
      justifyContent: 'center',
    },
    transactionInfo: {
      flex: 1,
    },
    senderName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text.primary,
    },
    transactionDate: {
      fontSize: 11,
      color: colors.text.hint,
      marginTop: 2,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 8,
    },
    statusText: {
      fontSize: 11,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    cardDivider: {
      borderStyle: 'dashed',
      borderWidth: 0.8,
      borderColor: colors.border.light,
      marginVertical: 14,
    },
    amountContainer: {
      marginBottom: 14,
    },
    amountLabel: {
      fontSize: 11,
      color: colors.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginBottom: 4,
      fontWeight: '600',
    },
    amount: {
      fontSize: 26,
      fontWeight: '700',
      color: colors.primary[500],
    },
    noteContainer: {
      backgroundColor: colors.background.default,
      borderRadius: 10,
      padding: 12,
      marginBottom: 14,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary[300],
      borderWidth: 1,
      borderColor: colors.border.light,
    },
    noteLabel: {
      fontSize: 10,
      color: colors.text.secondary,
      marginBottom: 4,
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    noteText: {
      fontSize: 13,
      color: colors.text.primary,
      lineHeight: 18,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 2,
    },
    rejectButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isDarkMode ? 'rgba(244, 67, 54, 0.06)' : '#FFEBEE',
      borderRadius: 10,
      paddingVertical: 11,
      borderWidth: 1,
      borderColor: colors.error.main,
      gap: 6,
    },
    rejectButtonText: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.error.main,
    },
    acceptButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.success.main,
      borderRadius: 10,
      paddingVertical: 11,
      gap: 6,
    },
    acceptButtonText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    buttonDisabled: {
      opacity: 0.6,
    },
    acceptedInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? 'rgba(76, 175, 80, 0.06)' : '#E8F5E9',
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 12,
      gap: 10,
      borderWidth: 1,
      borderColor: colors.success.main,
    },
    acceptedLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.success.dark,
    },
    acceptedDate: {
      fontSize: 11,
      color: colors.text.secondary,
      marginTop: 2,
    },
    rejectedInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDarkMode ? 'rgba(244, 67, 54, 0.06)' : '#FFEBEE',
      borderRadius: 10,
      paddingVertical: 10,
      paddingHorizontal: 12,
      gap: 10,
      borderWidth: 1,
      borderColor: colors.error.main,
    },
    rejectedLabel: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.error.dark,
    },
    rejectedDate: {
      fontSize: 11,
      color: colors.text.secondary,
      marginTop: 2,
    },
  });
