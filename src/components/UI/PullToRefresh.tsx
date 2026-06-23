/**
 * PullToRefresh.tsx
 * Enhanced ScrollView with pull-to-refresh functionality
 */

import React from 'react';
import {ScrollView, RefreshControl, ScrollViewProps} from 'react-native';
import Theme from '@/constants/theme';

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
          colors={[Theme.colors.primary[500]]} // Android
          tintColor={Theme.colors.primary[500]} // iOS
          title="Pull to refresh"
          titleColor={Theme.colors.text.secondary}
        />
      }>
      {children}
    </ScrollView>
  );
}
