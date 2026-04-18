/**
 * SyncIndicator.tsx
 * Visual indicator for sync status in header
 */

import React, {useEffect, useRef} from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Animated, ActivityIndicator} from 'react-native';
import {
  useSync,
  formatLastSync,
  getSyncStatusColor,
  getSyncStatusIcon,
  getSyncStatusLabel,
} from '@/context/SyncContext';

// ============================================================================
// TYPES
// ============================================================================

export interface SyncIndicatorProps {
  showLabel?: boolean;
  showLastSync?: boolean;
  onPress?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function SyncIndicator({
  showLabel = false,
  showLastSync = false,
  onPress,
}: SyncIndicatorProps): React.ReactElement {
  const {syncStatus, lastSyncTime, isSyncing, startSync} = useSync();
  const rotateValue = useRef(new Animated.Value(0)).current;

  // Rotate animation for syncing state
  useEffect(() => {
    if (isSyncing) {
      Animated.loop(
        Animated.timing(rotateValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ).start();
    } else {
      rotateValue.setValue(0);
    }
  }, [isSyncing, rotateValue]);

  const rotate = rotateValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else if (!isSyncing) {
      startSync();
    }
  };

  const statusColor = getSyncStatusColor(syncStatus);
  const statusIcon = getSyncStatusIcon(syncStatus);
  const statusLabel = getSyncStatusLabel(syncStatus);
  const lastSyncText = formatLastSync(lastSyncTime);

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
      disabled={isSyncing}>
      <View style={styles.content}>
        {/* Status Dot */}
        <View style={[styles.dot, {backgroundColor: statusColor}]} />

        {/* Icon or Spinner */}
        {isSyncing ? (
          <ActivityIndicator size="small" color={statusColor} />
        ) : (
          <Animated.Text
            style={[styles.icon, {color: statusColor}, isSyncing && {transform: [{rotate}]}]}>
            {statusIcon}
          </Animated.Text>
        )}

        {/* Label */}
        {showLabel && (
          <View style={styles.textContainer}>
            <Text style={[styles.label, {color: statusColor}]}>{statusLabel}</Text>
            {showLastSync && <Text style={styles.lastSync}>{lastSyncText}</Text>}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ============================================================================
// COMPACT VERSION (for headers)
// ============================================================================

export function CompactSyncIndicator(): React.ReactElement {
  return <SyncIndicator showLabel={false} showLastSync={false} />;
}

// ============================================================================
// EXPANDED VERSION (for settings/profile)
// ============================================================================

export function ExpandedSyncIndicator(): React.ReactElement {
  return <SyncIndicator showLabel={true} showLastSync={true} />;
}

// ============================================================================
// SYNC BADGE (just the colored dot)
// ============================================================================

export function SyncBadge(): React.ReactElement {
  const {syncStatus} = useSync();
  const statusColor = getSyncStatusColor(syncStatus);

  return (
    <View style={styles.badge}>
      <View style={[styles.badgeDot, {backgroundColor: statusColor}]} />
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  icon: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  textContainer: {
    marginLeft: 6,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
  lastSync: {
    fontSize: 11,
    color: '#757575',
    marginTop: 2,
  },
  badge: {
    width: 12,
    height: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
