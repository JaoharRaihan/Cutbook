import React from 'react';
import {View, Text, StyleSheet, ViewStyle, Image, ImageSourcePropType} from 'react-native';
import Theme from '@/constants/theme';
import {ReactNode} from 'react';
import {useTheme} from '@/context';

// ============================================================================
// TYPES
// ============================================================================

interface SummaryCardProps {
  title: string;
  value: string;
  icon?: ReactNode;
  iconImage?: ImageSourcePropType;
  subtitle?: string;
  color?: 'primary' | 'success' | 'warning' | 'info' | 'error';
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
  const {isDarkMode} = useTheme();

  const cardColors = React.useMemo(() => {
    if (color === 'success') {
      return {
        bg: '#81C784',
        title: '#530b0b',
        value: '#fbfbfb',
        subtitle: '#f7efef',
        border: Theme.colors.neutral[200],
      };
    }

    if (isDarkMode) {
      switch (color) {
        case 'primary': // Blue
          return {
            bg: '#0F2027',
            border: '#203A43',
            title: '#90CAF9',
            value: '#E3F2FD',
            subtitle: '#BBDEFB',
          };
        case 'warning': // Orange/Amber
          return {
            bg: '#2E1A05',
            border: '#5D3C15',
            title: '#FFCC80',
            value: '#FFF3E0',
            subtitle: '#FFE0B2',
          };
        case 'info': // Teal
          return {
            bg: '#002B2B',
            border: '#004D4D',
            title: '#80CBC4',
            value: '#E0F2F1',
            subtitle: '#A7FFEB',
          };
        case 'error': // Red
          return {
            bg: '#2C0D11',
            border: '#5D1F24',
            title: '#EF9A9A',
            value: '#FFEBEE',
            subtitle: '#FFCDD2',
          };
        default:
          return {
            bg: '#1C1C1E',
            border: '#2C2C2E',
            title: '#A1A1AA',
            value: '#FFFFFF',
            subtitle: '#8E8E93',
          };
      }
    } else {
      // Light Mode soft pastel-tinted senior UI colors
      switch (color) {
        case 'primary': // Blue
          return {
            bg: '#E3F2FD',
            border: '#BBDEFB',
            title: '#0D47A1',
            value: '#1565C0',
            subtitle: '#1E88E5',
          };
        case 'warning': // Orange/Amber
          return {
            bg: '#FFF3E0',
            border: '#FFE0B2',
            title: '#E65100',
            value: '#F57C00',
            subtitle: '#FF9800',
          };
        case 'info': // Teal/Cyan
          return {
            bg: '#E0F2F1',
            border: '#B2DFDB',
            title: '#004D40',
            value: '#00796B',
            subtitle: '#009688',
          };
        case 'error': // Red
          return {
            bg: '#FFEBEE',
            border: '#FFCDD2',
            title: '#B71C1C',
            value: '#D32F2F',
            subtitle: '#F44336',
          };
        default:
          return {
            bg: '#FFFFFF',
            border: '#EEEEEE',
            title: '#757575',
            value: '#212121',
            subtitle: '#757575',
          };
      }
    }
  }, [color, isDarkMode]);

  return (
    <View
      style={[
        styles.card,
        {backgroundColor: cardColors.bg, borderColor: cardColors.border},
        style,
      ]}>
      {iconImage ? (
        <Image source={iconImage} style={styles.iconImage} resizeMode="contain" />
      ) : icon ? (
        <View style={styles.iconContainer}>{icon}</View>
      ) : null}

      <Text style={[styles.title, {color: cardColors.title}]}>{title}</Text>
      <Text style={[styles.value, {color: cardColors.value}]}>{value}</Text>

      {subtitle ? (
        <Text style={[styles.subtitle, {color: cardColors.subtitle}]}>{subtitle}</Text>
      ) : null}
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
  },
});

export default SummaryCard;
