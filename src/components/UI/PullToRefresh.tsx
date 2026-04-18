/**
 * PullToRefresh.tsx
 * Enhanced ScrollView with pull-to-refresh functionality
 */

import React from 'react';
import {ScrollView, RefreshControl, StyleSheet, ScrollViewProps} from 'react-native';

// ============================================================================
// TYPES
// ============================================================================

export interface PullToRefreshProps extends ScrollViewProps {
  onRefresh: () => Promise<void>;
  refreshing: boolean;
  children: React.ReactNode;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function PullToRefresh({
  onRefresh,
  refreshing,
  children,
  ...scrollViewProps
}: PullToRefreshProps): React.ReactElement {
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <ScrollView
      {...scrollViewProps}
      refreshControl={
        <RefreshControl
          refreshing={refreshing || isRefreshing}
          onRefresh={handleRefresh}
          colors={['#2196F3']} // Android
          tintColor="#2196F3" // iOS
          title="Pull to refresh"
          titleColor="#757575"
        />
      }>
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // Add any additional styles if needed
});
