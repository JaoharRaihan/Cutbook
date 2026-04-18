/**
 * SyncStatusCard.tsx
 * Detailed sync status card for settings/profile screens
 */

import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {
  useSync,
  formatLastSync,
  getSyncStatusColor,
  getSyncStatusIcon,
  getSyncStatusLabel,
} from '@/context/SyncContext';
import AnimatedButton from './AnimatedButton';

// ============================================================================
// COMPONENT
// ============================================================================

export default function SyncStatusCard(): React.ReactElement {
  const {syncStatus, lastSyncTime, isOnline, isSyncing, startSync} = useSync();

  const statusColor = getSyncStatusColor(syncStatus);
  const statusIcon = getSyncStatusIcon(syncStatus);
  const statusLabel = getSyncStatusLabel(syncStatus);
  const lastSyncText = formatLastSync(lastSyncTime);

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Sync Status</Text>
        <View style={styles.onlineBadge}>
          <View style={[styles.onlineDot, {backgroundColor: isOnline ? '#4CAF50' : '#FF9800'}]} />
          <Text style={styles.onlineText}>{isOnline ? 'Online' : 'Offline'}</Text>
        </View>
      </View>

      {/* Status Display */}
      <View style={styles.statusRow}>
        <View style={styles.statusInfo}>
          <Text style={[styles.statusIcon, {color: statusColor}]}>{statusIcon}</Text>
          <View style={styles.statusText}>
            <Text style={[styles.statusLabel, {color: statusColor}]}>{statusLabel}</Text>
            <Text style={styles.lastSyncText}>{lastSyncText}</Text>
          </View>
        </View>

        {/* Sync Button */}
        <AnimatedButton
          title={isSyncing ? 'Syncing...' : 'Sync Now'}
          onPress={startSync}
          variant="outline"
          size="small"
          loading={isSyncing}
          disabled={!isOnline || isSyncing}
          style={styles.syncButton}
        />
      </View>

      {/* Info Text */}
      {syncStatus === 'offline' && (
        <View style={styles.infoBox}>
          <Text style={styles.infoIcon}>ℹ️</Text>
          <Text style={styles.infoText}>
            Your data is saved locally and will sync when you're back online.
          </Text>
        </View>
      )}

      {syncStatus === 'error' && (
        <View style={[styles.infoBox, styles.errorBox]}>
          <Text style={styles.infoIcon}>⚠️</Text>
          <Text style={styles.infoText}>
            Failed to sync. Please check your connection and try again.
          </Text>
        </View>
      )}

      {syncStatus === 'synced' && lastSyncTime && (
        <View style={[styles.infoBox, styles.successBox]}>
          <Text style={styles.infoIcon}>✓</Text>
          <Text style={styles.infoText}>All your data is backed up and up to date.</Text>
        </View>
      )}
    </View>
  );
}

// ============================================================================
// MINIMAL VERSION (for dashboard)
// ============================================================================

export function MinimalSyncStatus(): React.ReactElement {
  const {syncStatus, lastSyncTime, startSync, isSyncing} = useSync();

  const statusColor = getSyncStatusColor(syncStatus);
  const lastSyncText = formatLastSync(lastSyncTime);

  return (
    <TouchableOpacity
      style={styles.minimalCard}
      onPress={startSync}
      disabled={isSyncing}
      activeOpacity={0.7}>
      <View style={styles.minimalContent}>
        <View style={[styles.minimalDot, {backgroundColor: statusColor}]} />
        <Text style={styles.minimalText}>
          {isSyncing ? 'Syncing...' : `Synced ${lastSyncText}`}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  onlineText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#424242',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statusIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  statusText: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  lastSyncText: {
    fontSize: 13,
    color: '#757575',
    marginTop: 2,
  },
  syncButton: {
    marginLeft: 12,
    minWidth: 100,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    padding: 12,
    alignItems: 'flex-start',
  },
  successBox: {
    backgroundColor: '#E8F5E9',
  },
  errorBox: {
    backgroundColor: '#FFEBEE',
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#424242',
    lineHeight: 18,
  },
  // Minimal version
  minimalCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    padding: 8,
  },
  minimalContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  minimalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  minimalText: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '500',
  },
});
