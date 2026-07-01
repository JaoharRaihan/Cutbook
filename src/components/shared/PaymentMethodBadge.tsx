/**
 * PaymentMethodBadge.tsx
 * Color-coded payment method badge with icon
 */

import React from 'react';
import {View, Text, StyleSheet, ViewStyle} from 'react-native';
import {PaymentMethod} from '@/types';
import Theme from '@/constants/theme';
import MaterialIcons from '@react-native-vector-icons/material-icons';

// ============================================================================
// TYPES
// ============================================================================

export interface PaymentMethodBadgeProps {
  method: PaymentMethod;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function PaymentMethodBadge({
  method,
  size = 'medium',
  style,
}: PaymentMethodBadgeProps): React.ReactElement {
  const getMethodConfig = () => {
    switch (method) {
      case PaymentMethod.CASH:
        return {
          label: 'Cash',
          iconName: 'payments',
          color: Theme.colors.payment.cash,
        };
      case PaymentMethod.BKASH:
        return {
          label: 'bKash',
          iconName: 'smartphone',
          color: Theme.colors.payment.bkash,
        };
      case PaymentMethod.CARD:
        return {
          label: 'Card',
          iconName: 'credit-card',
          color: Theme.colors.payment.card,
        };
      case PaymentMethod.NAGAD:
        return {
          label: 'Nagad',
          iconName: 'smartphone',
          color: Theme.colors.payment.nagad,
        };
      case PaymentMethod.BANGLA_QR:
        return {
          label: 'Bangla QR',
          iconName: 'qr-code',
          color: Theme.colors.payment.bangla_qr || '#006A4E',
        };
      case PaymentMethod.ROCKET:
        return {
          label: 'Rocket',
          iconName: 'rocket',
          color: Theme.colors.payment.rocket || '#8C2D8B',
        };
      default:
        return {
          label: method,
          iconName: 'payment',
          color: Theme.colors.payment.other,
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.containerSmall,
          icon: styles.iconSmall,
          text: styles.textSmall,
        };
      case 'large':
        return {
          container: styles.containerLarge,
          icon: styles.iconLarge,
          text: styles.textLarge,
        };
      default:
        return {
          container: {},
          icon: {},
          text: {},
        };
    }
  };

  const config = getMethodConfig();
  const sizeStyles = getSizeStyles();

  return (
    <View style={[styles.container, sizeStyles.container, {backgroundColor: config.color}, style]}>
      <MaterialIcons
        name={config.iconName as any}
        size={size === 'small' ? 12 : size === 'large' ? 18 : 14}
        color="#FFFFFF"
        style={{marginRight: 2}}
      />
      <Text style={[styles.text, sizeStyles.text]}>{config.label}</Text>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  containerSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  containerLarge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
  },
  icon: {
    fontSize: 14,
  },
  iconSmall: {
    fontSize: 12,
  },
  iconLarge: {
    fontSize: 18,
  },
  text: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  textSmall: {
    fontSize: 10,
  },
  textLarge: {
    fontSize: 14,
  },
});
