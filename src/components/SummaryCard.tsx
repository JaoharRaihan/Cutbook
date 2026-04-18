/**
 * Summary Card Component
 * Reusable card for displaying summary statistics
 */

import React from 'react';
import {View, Text, StyleSheet, ViewStyle} from 'react-native';
import Theme from '@/constants/theme';

// ============================================================================
// TYPES
// ============================================================================

interface SummaryCardProps {
  title: string;
  value: string;
  icon?: string;
  subtitle?: string;
  color?: 'primary' | 'success' | 'warning' | 'info';
  style?: ViewStyle;
}

// ============================================================================
// SUMMARY CARD COMPONENT
// ============================================================================

const SummaryCard: React.FC<SummaryCardProps> = ({
  title,
  value,
  icon,
  subtitle,
  color = 'primary',
  style,
}) => {
  // Get color based on variant
  const getColor = () => {
    switch (color) {
      case 'success':
        return Theme.colors.success.main;
      case 'warning':
        return Theme.colors.warning.main;
      case 'info':
        return Theme.colors.info.main;
      default:
        return Theme.colors.primary[600];
    }
  };

  const getBackgroundColor = () => {
    switch (color) {
      case 'success':
        return Theme.colors.success.light;
      case 'warning':
        return Theme.colors.warning.light;
      case 'info':
        return Theme.colors.info.light;
      default:
        return Theme.colors.primary[50];
    }
  };

  return (
    <View style={[styles.card, {backgroundColor: getBackgroundColor()}, style]}>
      {icon ? <Text style={styles.icon}>{icon}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, {color: getColor()}]}>{value}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[200],
    ...Theme.shadows.sm,
  },
  icon: {
    fontSize: 32,
    marginBottom: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    color: Theme.colors.text.secondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    color: Theme.colors.text.hint,
  },
});

export default SummaryCard;
