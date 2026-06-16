/**
 * Summary Card Component
 * Reusable card for displaying summary statistics
 */

import React from 'react';
import {View, Text, StyleSheet, ViewStyle, Image, ImageSourcePropType} from 'react-native';
import Theme from '@/constants/theme';
import {ReactNode} from 'react';

// ============================================================================
// TYPES
// ============================================================================

interface SummaryCardProps {
  title: string;
  value: string;
  icon?: ReactNode;
  iconImage?: ImageSourcePropType;
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
  iconImage,
  subtitle,
  color = 'primary',
  style,
}) => {
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
      {iconImage ? (
        <Image source={iconImage} style={styles.iconImage} resizeMode="contain" />
      ) : icon ? (
        <View style={styles.iconContainer}>{icon}</View>
      ) : null}

      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, {color: '#fbfbfb'}]}>{value}</Text>

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
  iconContainer: {
    marginBottom: 8,
  },
  iconImage: {
    width: 40,
    height: 40,
    marginBottom: 8,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    color: '#530b0b',
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
    color: '#f7efef',
  },
});

export default SummaryCard;
