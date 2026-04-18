/**
 * OfflineIndicator.tsx
 * Banner to show when app is offline
 */

import React, {useEffect, useRef} from 'react';
import {View, Text, StyleSheet, Animated} from 'react-native';
import {useSync} from '@/context/SyncContext';

// ============================================================================
// COMPONENT
// ============================================================================

export default function OfflineIndicator(): React.ReactElement | null {
  const {isOnline} = useSync();
  const translateY = useRef(new Animated.Value(-50)).current;

  useEffect(() => {
    if (!isOnline) {
      // Slide down
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      // Slide up
      Animated.spring(translateY, {
        toValue: -50,
        useNativeDriver: true,
      }).start();
    }
  }, [isOnline, translateY]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{translateY}],
        },
      ]}>
      <View style={styles.content}>
        <Text style={styles.icon}>📡</Text>
        <Text style={styles.text}>You're offline</Text>
      </View>
    </Animated.View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: '#FF9800',
    paddingTop: 50, // Account for status bar
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    fontSize: 16,
    marginRight: 8,
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
