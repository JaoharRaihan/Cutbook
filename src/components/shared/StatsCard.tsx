/**
 * StatsCard.tsx
 * Reusable statistics display card
 */

import React from 'react';
import {View, Text, StyleSheet, ViewStyle} from 'react-native';

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
        return '#2196F3';
      case 'success':
        return '#4CAF50';
      case 'warning':
        return '#FF9800';
      case 'error':
        return '#F44336';
      default:
        return '#212121';
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
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardPrimary: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  cardSuccess: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  cardWarning: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
  },
  cardError: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
  },
  icon: {
    fontSize: 40,
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#757575',
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
    color: '#757575',
    textAlign: 'center',
  },
});
