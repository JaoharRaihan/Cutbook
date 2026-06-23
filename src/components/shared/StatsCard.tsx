/**
 * StatsCard.tsx
 * Reusable statistics display card
 */

import React from 'react';
import {View, Text, StyleSheet, ViewStyle} from 'react-native';
import Theme from '@/constants/theme';

// ============================================================================
// TYPES
// ============================================================================

export interface StatsCardProps {
  icon: string;
  label: string;
  value: string | number;
  subtext?: string;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'error';
  style?: ViewStyle;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function StatsCard({
  icon,
  label,
  value,
  subtext,
  variant = 'default',
  style,
}: StatsCardProps): React.ReactElement {
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return styles.cardPrimary;
      case 'success':
        return styles.cardSuccess;
      case 'warning':
        return styles.cardWarning;
      case 'error':
        return styles.cardError;
      default:
        return {};
    }
  };

  const getValueColor = () => {
    switch (variant) {
      case 'primary':
        return Theme.colors.primary[500];
      case 'success':
        return Theme.colors.success.main;
      case 'warning':
        return Theme.colors.warning.main;
      case 'error':
        return Theme.colors.error.main;
      default:
        return Theme.colors.text.primary;
    }
  };

  return (
    <View style={[styles.card, getVariantStyle(), style]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, {color: getValueColor()}]}>{value}</Text>
      {subtext && <Text style={styles.subtext}>{subtext}</Text>}
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  card: {
    backgroundColor: Theme.colors.background.paper,
    borderRadius: Theme.borderRadius.card,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border.light,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardPrimary: {
    backgroundColor: Theme.colors.primary[50],
    borderColor: Theme.colors.primary[500],
  },
  cardSuccess: {
    backgroundColor: '#E8F5E9',
    borderColor: Theme.colors.success.main,
  },
  cardWarning: {
    backgroundColor: '#FFF3E0',
    borderColor: Theme.colors.warning.main,
  },
  cardError: {
    backgroundColor: '#FFEBEE',
    borderColor: Theme.colors.error.main,
  },
  icon: {
    fontSize: 40,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtext: {
    fontSize: 12,
    color: Theme.colors.text.hint,
    textAlign: 'center',
  },
});
