/**
 * LoadingOverlay.tsx
 * Full-screen loading overlay for async operations
 */

import React from 'react';
import {Modal, View, ActivityIndicator, Text, StyleSheet} from 'react-native';

// ============================================================================
// TYPES
// ============================================================================

export interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function LoadingOverlay({
  visible,
  message = 'Loading...',
}: LoadingOverlayProps): React.ReactElement {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <ActivityIndicator size="large" color="#2196F3" />
          {message && <Text style={styles.message}>{message}</Text>}
        </View>
      </View>
    </Modal>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    minWidth: 150,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#424242',
    textAlign: 'center',
  },
});
