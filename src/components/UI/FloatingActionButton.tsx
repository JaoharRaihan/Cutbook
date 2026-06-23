/**
 * FloatingActionButton.tsx
 * FAB for primary actions (Add Employee, Add Service, etc.)
 */

import React, {useRef} from 'react';
import {TouchableOpacity, Text, StyleSheet, Animated, ViewStyle} from 'react-native';

import Theme from '@/constants/theme';

// ============================================================================
// TYPES
// ============================================================================

export interface FloatingActionButtonProps {
  icon?: string;
  label?: string;
  onPress: () => void;
  position?: 'bottom-right' | 'bottom-center' | 'bottom-left';
  style?: ViewStyle;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function FloatingActionButton({
  icon = '+',
  label,
  onPress,
  position = 'bottom-right',
  style,
}: FloatingActionButtonProps): React.ReactElement {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const getPositionStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      position: 'absolute',
      bottom: 24,
    };

    switch (position) {
      case 'bottom-right':
        return {...baseStyle, right: 24};
      case 'bottom-center':
        return {...baseStyle, alignSelf: 'center'};
      case 'bottom-left':
        return {...baseStyle, left: 24};
      default:
        return {...baseStyle, right: 24};
    }
  };

  return (
    <Animated.View style={[getPositionStyle(), {transform: [{scale: scaleValue}]}, style]}>
      <TouchableOpacity
        style={[styles.fab, label ? styles.fabWithLabel : styles.fabCircle]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}>
        <Text style={styles.icon}>{icon}</Text>
        {label && <Text style={styles.label}>{label}</Text>}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  fab: {
    backgroundColor: Theme.colors.primary[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  fabWithLabel: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 30,
  },
  icon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});
