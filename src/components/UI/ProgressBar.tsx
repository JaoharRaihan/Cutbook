/**
 * ProgressBar.tsx
 * Progress indicator for multi-step forms or loading progress
 */

import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Animated, ViewStyle} from 'react-native';

// ============================================================================
// TYPES
// ============================================================================

export interface ProgressBarProps {
  progress: number; // 0 to 1
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  borderRadius?: number;
  animated?: boolean;
  style?: ViewStyle;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function ProgressBar({
  progress,
  height = 6,
  backgroundColor = '#E0E0E0',
  progressColor = '#2196F3',
  borderRadius = 3,
  animated = true,
  style,
}: ProgressBarProps): React.ReactElement {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(animatedWidth, {
        toValue: progress,
        duration: 300,
        useNativeDriver: false,
      }).start();
    } else {
      animatedWidth.setValue(progress);
    }
  }, [progress, animated, animatedWidth]);

  const widthInterpolate = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={[styles.container, {height, backgroundColor, borderRadius}, style]}>
      <Animated.View
        style={[
          styles.progress,
          {
            width: widthInterpolate,
            backgroundColor: progressColor,
            borderRadius,
          },
        ]}
      />
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    width: '100%',
  },
  progress: {
    height: '100%',
  },
});
