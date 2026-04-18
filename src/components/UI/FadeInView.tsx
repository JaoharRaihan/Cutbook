/**
 * FadeInView.tsx
 * Animated fade-in wrapper for screen transitions
 */

import React, {useEffect, useRef} from 'react';
import {Animated, ViewStyle} from 'react-native';

// ============================================================================
// TYPES
// ============================================================================

export interface FadeInViewProps {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  style?: ViewStyle;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function FadeInView({
  children,
  duration = 500,
  delay = 0,
  style,
}: FadeInViewProps): React.ReactElement {
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim, duration, delay]);

  return <Animated.View style={[{opacity: fadeAnim}, style]}>{children}</Animated.View>;
}
