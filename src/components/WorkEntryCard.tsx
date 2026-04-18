/**
 * WorkEntryCard.tsx
 * Reusable card component for displaying work entry items
 */

import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {WorkEntry, PaymentMethod} from '@/types';
import {formatBDT} from '@/utils';

// ============================================================================
// TYPES
// ============================================================================

interface WorkEntryCardProps {
  entry: WorkEntry;
  employeeName?: string;
  onPress?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function WorkEntryCard({
  entry,
  employeeName,
  onPress,
}: WorkEntryCardProps): React.ReactElement {
  const getPaymentMethodColor = (method: PaymentMethod): string => {
    switch (method) {
      case PaymentMethod.CASH:
        return '#4CAF50';
      case PaymentMethod.BKASH:
        return '#E91E63';
      case PaymentMethod.CARD:
        return '#2196F3';
      case PaymentMethod.NAGAD:
        return '#FF9800';
      default:
        return '#757575';
    }
  };

  const getPaymentMethodLabel = (method: PaymentMethod): string => {
    switch (method) {
      case PaymentMethod.CASH:
        return 'Cash';
      case PaymentMethod.BKASH:
        return 'bKash';
      case PaymentMethod.CARD:
        return 'Card';
      case PaymentMethod.NAGAD:
        return 'Nagad';
      default:
        return method;
    }
  };

  const formatTime = (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  const totalAmount = entry.price + (entry.tip || 0);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7} disabled={!onPress}>
      <View style={styles.header}>
        <View style={styles.serviceInfo}>
          <Text style={styles.serviceName} numberOfLines={1}>
            {entry.serviceName}
          </Text>
          <Text style={styles.time}>{formatTime(entry.createdAt)}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{formatBDT(totalAmount)}</Text>
          {entry.tip && entry.tip > 0 && (
            <Text style={styles.tipBadge}>+{formatBDT(entry.tip)} tip</Text>
          )}
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.employeeContainer}>
          <View style={styles.employeeAvatar}>
            <Text style={styles.employeeInitial}>
              {employeeName ? employeeName.charAt(0).toUpperCase() : '?'}
            </Text>
          </View>
          <Text style={styles.employeeName} numberOfLines={1}>
            {employeeName || 'Unknown'}
          </Text>
        </View>

        <View
          style={[
            styles.paymentBadge,
            {backgroundColor: getPaymentMethodColor(entry.paymentMethod)},
          ]}>
          <Text style={styles.paymentText}>{getPaymentMethodLabel(entry.paymentMethod)}</Text>
        </View>
      </View>

      {entry.edited && (
        <View style={styles.editedBadge}>
          <Text style={styles.editedText}>✏️ Edited</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  serviceInfo: {
    flex: 1,
    marginRight: 12,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 4,
  },
  time: {
    fontSize: 13,
    color: '#757575',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4CAF50',
  },
  tipBadge: {
    fontSize: 11,
    color: '#FF9800',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  employeeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  employeeAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  employeeInitial: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  employeeName: {
    fontSize: 14,
    color: '#212121',
    flex: 1,
  },
  paymentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  editedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  editedText: {
    fontSize: 10,
    color: '#F57C00',
  },
});
