/**
 * EnhancedEmptyState.tsx
 * Beautiful empty states with illustrations and CTAs
 */

import React from 'react';
import {View, Text, StyleSheet, ViewStyle} from 'react-native';
import AnimatedButton from './AnimatedButton';

// ============================================================================
// TYPES
// ============================================================================

export interface EnhancedEmptyStateProps {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  style?: ViewStyle;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function EnhancedEmptyState({
  icon = '📭',
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  style,
}: EnhancedEmptyStateProps): React.ReactElement {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconContainer}>
        <Text style={styles.icon}>{icon}</Text>
      </View>

      <Text style={styles.title}>{title}</Text>

      {description && <Text style={styles.description}>{description}</Text>}

      {actionLabel && onAction && (
        <AnimatedButton
          title={actionLabel}
          onPress={onAction}
          variant="primary"
          style={styles.actionButton}
        />
      )}

      {secondaryActionLabel && onSecondaryAction && (
        <AnimatedButton
          title={secondaryActionLabel}
          onPress={onSecondaryAction}
          variant="outline"
          style={styles.secondaryButton}
        />
      )}
    </View>
  );
}

// ============================================================================
// PREDEFINED EMPTY STATES
// ============================================================================

export function NoEmployeesEmptyState({onAdd}: {onAdd: () => void}): React.ReactElement {
  return (
    <EnhancedEmptyState
      icon="👥"
      title="No Employees Yet"
      description="Add your first employee to start tracking their work and earnings."
      actionLabel="Add Employee"
      onAction={onAdd}
    />
  );
}

export function NoServicesEmptyState({onAdd}: {onAdd: () => void}): React.ReactElement {
  return (
    <EnhancedEmptyState
      icon="✂️"
      title="No Services Added"
      description="Create your service catalog to quickly add work entries."
      actionLabel="Add Service"
      onAction={onAdd}
    />
  );
}

export function NoEntriesEmptyState({onAdd}: {onAdd: () => void}): React.ReactElement {
  return (
    <EnhancedEmptyState
      icon="📋"
      title="No Entries Today"
      description="Start tracking work by adding your first entry of the day."
      actionLabel="Add Work Entry"
      onAction={onAdd}
    />
  );
}

export function NoHistoryEmptyState(): React.ReactElement {
  return (
    <EnhancedEmptyState
      icon="📅"
      title="No History Yet"
      description="Your work history will appear here once entries are created."
    />
  );
}

export function NoSearchResultsEmptyState({
  query,
  onClear,
}: {
  query: string;
  onClear: () => void;
}): React.ReactElement {
  return (
    <EnhancedEmptyState
      icon="🔍"
      title="No Results Found"
      description={`We couldn't find anything matching "${query}".`}
      actionLabel="Clear Search"
      onAction={onClear}
    />
  );
}

export function NetworkErrorState({onRetry}: {onRetry: () => void}): React.ReactElement {
  return (
    <EnhancedEmptyState
      icon="📡"
      title="Connection Error"
      description="Unable to connect to the server. Please check your internet connection."
      actionLabel="Retry"
      onAction={onRetry}
    />
  );
}

export function GenericErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}): React.ReactElement {
  return (
    <EnhancedEmptyState
      icon="⚠️"
      title="Something Went Wrong"
      description={message || 'An unexpected error occurred. Please try again.'}
      actionLabel={onRetry ? 'Try Again' : undefined}
      onAction={onRetry}
    />
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  actionButton: {
    minWidth: 200,
    marginBottom: 12,
  },
  secondaryButton: {
    minWidth: 200,
  },
});
