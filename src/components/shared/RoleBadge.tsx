/**
 * RoleBadge.tsx
 * User role badge (Owner/Employee)
 */

import React from 'react';
import {View, Text, StyleSheet, ViewStyle} from 'react-native';
import {UserRole} from '@/types';

// ============================================================================
// TYPES
// ============================================================================

export interface RoleBadgeProps {
  role: UserRole;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function RoleBadge({
  role,
  size = 'medium',
  style,
}: RoleBadgeProps): React.ReactElement {
  const getRoleConfig = () => {
    switch (role) {
      case UserRole.OWNER:
        return {
          label: 'Owner',
          icon: '👑',
          backgroundColor: '#E3F2FD',
          textColor: '#2196F3',
          borderColor: '#2196F3',
        };
      case UserRole.EMPLOYEE:
        return {
          label: 'Employee',
          icon: '👤',
          backgroundColor: '#F3E5F5',
          textColor: '#9C27B0',
          borderColor: '#9C27B0',
        };
      default:
        return {
          label: role,
          icon: '❓',
          backgroundColor: '#F5F5F5',
          textColor: '#757575',
          borderColor: '#E0E0E0',
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

  const config = getRoleConfig();
  const sizeStyles = getSizeStyles();

  return (
    <View
      style={[
        styles.container,
        sizeStyles.container,
        {
          backgroundColor: config.backgroundColor,
          borderColor: config.borderColor,
        },
        style,
      ]}>
      <Text style={[styles.icon, sizeStyles.icon]}>{config.icon}</Text>
      <Text style={[styles.text, sizeStyles.text, {color: config.textColor}]}>{config.label}</Text>
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
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
  },
  containerSmall: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  containerLarge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
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
  },
  textSmall: {
    fontSize: 10,
  },
  textLarge: {
    fontSize: 14,
  },
});
