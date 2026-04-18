/**
 * SyncContext.tsx
 * Mock sync status management for offline support
 */

import React, {createContext, useContext, useState, useEffect, useCallback, ReactNode} from 'react';
import {saveLastSync, loadLastSync, saveSyncStatus, loadSyncStatus} from '@/utils/storage';

// ============================================================================
// TYPES
// ============================================================================

export type SyncStatus = 'synced' | 'syncing' | 'offline' | 'error';

export interface SyncContextValue {
  syncStatus: SyncStatus;
  lastSyncTime: Date | null;
  isOnline: boolean;
  isSyncing: boolean;

  // Actions
  startSync: () => Promise<void>;
  markAsSynced: () => Promise<void>;
  markAsOffline: () => void;
  markAsError: () => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const SyncContext = createContext<SyncContextValue | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export interface SyncProviderProps {
  children: ReactNode;
}

export function SyncProvider({children}: SyncProviderProps): React.ReactElement {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('offline');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  // Load saved sync state on mount
  useEffect(() => {
    loadSyncState();
  }, []);

  // Mock network status check (in real app, use NetInfo)
  useEffect(() => {
    // Simulate checking network status
    const checkInterval = setInterval(() => {
      // Mock: randomly determine online/offline (90% online)
      const online = Math.random() > 0.1;
      setIsOnline(online);

      if (!online && syncStatus !== 'syncing') {
        setSyncStatus('offline');
      }
    }, 10000); // Check every 10 seconds

    return () => clearInterval(checkInterval);
  }, [syncStatus]);

  const loadSyncState = async () => {
    try {
      const [status, lastSync] = await Promise.all([loadSyncStatus(), loadLastSync()]);

      setSyncStatus(status);
      setLastSyncTime(lastSync);
    } catch (error) {
      console.error('Error loading sync state:', error);
    }
  };

  const startSync = useCallback(async () => {
    if (!isOnline) {
      markAsOffline();
      return;
    }

    setSyncStatus('syncing');
    await saveSyncStatus('syncing');

    try {
      // Mock sync operation (500-2000ms delay)
      const delay = 500 + Math.random() * 1500;
      await new Promise<void>(resolve => setTimeout(resolve, delay));

      // Mock: 95% success rate
      const success = Math.random() > 0.05;

      if (success) {
        await markAsSynced();
      } else {
        markAsError();
      }
    } catch (error) {
      console.error('Sync error:', error);
      markAsError();
    }
  }, [isOnline]);

  const markAsSynced = useCallback(async () => {
    const now = new Date();
    setSyncStatus('synced');
    setLastSyncTime(now);

    await Promise.all([saveSyncStatus('synced'), saveLastSync(now)]);
  }, []);

  const markAsOffline = useCallback(() => {
    setSyncStatus('offline');
    saveSyncStatus('offline');
  }, []);

  const markAsError = useCallback(() => {
    setSyncStatus('error');
    saveSyncStatus('offline'); // Store as offline for next load
  }, []);

  const value: SyncContextValue = {
    syncStatus,
    lastSyncTime,
    isOnline,
    isSyncing: syncStatus === 'syncing',
    startSync,
    markAsSynced,
    markAsOffline,
    markAsError,
  };

  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}

// ============================================================================
// HOOK
// ============================================================================

export function useSync(): SyncContextValue {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within SyncProvider');
  }
  return context;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Format last sync time for display
 */
export function formatLastSync(lastSync: Date | null): string {
  if (!lastSync) {
    return 'Never synced';
  }

  const now = new Date();
  const diffMs = now.getTime() - lastSync.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) {
    return 'Just now';
  } else if (diffMins < 60) {
    return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return lastSync.toLocaleDateString();
  }
}

/**
 * Get sync status color
 */
export function getSyncStatusColor(status: SyncStatus): string {
  switch (status) {
    case 'synced':
      return '#4CAF50'; // Green
    case 'syncing':
      return '#2196F3'; // Blue
    case 'offline':
      return '#FF9800'; // Orange
    case 'error':
      return '#F44336'; // Red
    default:
      return '#757575'; // Gray
  }
}

/**
 * Get sync status icon
 */
export function getSyncStatusIcon(status: SyncStatus): string {
  switch (status) {
    case 'synced':
      return '✓';
    case 'syncing':
      return '↻';
    case 'offline':
      return '⚠';
    case 'error':
      return '✕';
    default:
      return '•';
  }
}

/**
 * Get sync status label
 */
export function getSyncStatusLabel(status: SyncStatus): string {
  switch (status) {
    case 'synced':
      return 'Synced';
    case 'syncing':
      return 'Syncing...';
    case 'offline':
      return 'Offline';
    case 'error':
      return 'Sync Error';
    default:
      return 'Unknown';
  }
}
