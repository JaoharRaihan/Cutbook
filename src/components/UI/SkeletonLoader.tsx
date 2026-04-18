/**
 * SkeletonLoader.tsx
 * Skeleton loading placeholders for better perceived performance
 */

import React, {useEffect, useRef} from 'react';
import {View, StyleSheet, Animated, ViewStyle} from 'react-native';

// ============================================================================
// TYPES
// ============================================================================

export interface SkeletonLoaderProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: ViewStyle;
}

export interface SkeletonCardProps {
  style?: ViewStyle;
}

export interface SkeletonListProps {
  count?: number;
  style?: ViewStyle;
}

// ============================================================================
// BASE SKELETON COMPONENT
// ============================================================================

export function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
}: SkeletonLoaderProps): React.ReactElement {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const widthStyle = typeof width === 'number' ? {width} : {width: width as any};

  return (
    <Animated.View
      style={[styles.skeleton, {height, borderRadius}, widthStyle, {opacity}, style]}
    />
  );
}

// ============================================================================
// SKELETON CARD (for work entries, employee cards, etc.)
// ============================================================================

export function SkeletonCard({style}: SkeletonCardProps): React.ReactElement {
  return (
    <View style={[styles.card, style]}>
      <View style={styles.cardHeader}>
        <SkeletonLoader width={50} height={50} borderRadius={25} />
        <View style={styles.cardHeaderText}>
          <SkeletonLoader width="70%" height={16} />
          <SkeletonLoader width="50%" height={14} style={styles.spacingTop} />
        </View>
      </View>
      <View style={styles.cardBody}>
        <SkeletonLoader width="100%" height={12} />
        <SkeletonLoader width="80%" height={12} style={styles.spacingTop} />
      </View>
      <View style={styles.cardFooter}>
        <SkeletonLoader width={80} height={24} borderRadius={12} />
        <SkeletonLoader width={100} height={24} borderRadius={12} />
      </View>
    </View>
  );
}

// ============================================================================
// SKELETON LIST (multiple cards)
// ============================================================================

export function SkeletonList({count = 5, style}: SkeletonListProps): React.ReactElement {
  return (
    <View style={style}>
      {Array.from({length: count}).map((_, index) => (
        <SkeletonCard key={index} style={styles.listItem} />
      ))}
    </View>
  );
}

// ============================================================================
// SKELETON STAT CARD (for dashboard)
// ============================================================================

export function SkeletonStatCard({style}: SkeletonCardProps): React.ReactElement {
  return (
    <View style={[styles.statCard, style]}>
      <SkeletonLoader width={40} height={40} borderRadius={20} />
      <SkeletonLoader width="60%" height={14} style={styles.spacingTop} />
      <SkeletonLoader width="80%" height={24} style={styles.spacingTop} />
      <SkeletonLoader width="50%" height={12} style={styles.spacingTop} />
    </View>
  );
}

// ============================================================================
// SKELETON DASHBOARD (full dashboard loading state)
// ============================================================================

export function SkeletonDashboard(): React.ReactElement {
  return (
    <View style={styles.dashboard}>
      {/* Header */}
      <View style={styles.dashboardHeader}>
        <SkeletonLoader width="40%" height={24} />
        <SkeletonLoader width={120} height={36} borderRadius={18} />
      </View>

      {/* Stat Cards */}
      <View style={styles.statsGrid}>
        <SkeletonStatCard style={styles.gridItem} />
        <SkeletonStatCard style={styles.gridItem} />
        <SkeletonStatCard style={styles.gridItem} />
        <SkeletonStatCard style={styles.gridItem} />
      </View>

      {/* Section Title */}
      <SkeletonLoader width="50%" height={20} style={styles.sectionTitle} />

      {/* List */}
      <SkeletonList count={3} />
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: '#E0E0E0',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardHeaderText: {
    flex: 1,
    marginLeft: 12,
  },
  cardBody: {
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spacingTop: {
    marginTop: 8,
  },
  listItem: {
    marginBottom: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dashboard: {
    padding: 16,
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  gridItem: {
    width: '48%',
    marginBottom: 12,
  },
  sectionTitle: {
    marginBottom: 16,
  },
});

export default SkeletonLoader;
