/**
 * SlideInView.tsx
 * Animated slide-in wrapper for list items and cards
 */

import React, {useEffect, useRef} from 'react';
import {Animated, ViewStyle} from 'react-native';

// ============================================================================
// TYPES
// ============================================================================

export interface SlideInViewProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  distance?: number;
  style?: ViewStyle;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function SlideInView({
  children,
  duration = 400,
  delay = 0,
  direction = 'up',
  distance = 50,
  style,
}: SlideInViewProps): React.ReactElement {
  const translateValue = useRef(new Animated.Value(distance)).current;
  const opacityValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(translateValue, {
        toValue: 0,
        duration,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(opacityValue, {
        toValue: 1,
        duration,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [translateValue, opacityValue, duration, delay, distance]);

  const getTransform = () => {
    switch (direction) {
      case 'left':
        return [{translateX: translateValue}];
      case 'right':
        return [{translateX: Animated.multiply(translateValue, -1)}];
      case 'up':
        return [{translateY: translateValue}];
      case 'down':
        return [{translateY: Animated.multiply(translateValue, -1)}];
      default:
        return [{translateY: translateValue}];
    }
  };

  return (
    <Animated.View
      style={[
        {
          opacity: opacityValue,
          transform: getTransform(),
        },
        style,
      ]}>
      {children}
    </Animated.View>
  );
}
