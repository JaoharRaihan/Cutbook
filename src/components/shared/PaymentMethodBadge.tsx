/**
 * PaymentMethodBadge.tsx
 * Color-coded payment method badge with icon
 */

import React from 'react';
import {View, Text, StyleSheet, ViewStyle} from 'react-native';
import {PaymentMethod} from '@/types';

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
          icon: '💵',
          color: '#4CAF50',
        };
      case PaymentMethod.BKASH:
        return {
          label: 'bKash',
          icon: '📱',
          color: '#E91E63',
        };
      case PaymentMethod.CARD:
        return {
          label: 'Card',
          icon: '💳',
          color: '#2196F3',
        };
      case PaymentMethod.NAGAD:
        return {
          label: 'Nagad',
          icon: '📱',
          color: '#FF9800',
        };
      default:
        return {
          label: method,
          icon: '💰',
          color: '#757575',
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
      <Text style={[styles.icon, sizeStyles.icon]}>{config.icon}</Text>
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
