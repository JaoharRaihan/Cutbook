/**
 * Toast.tsx
 * Toast notification system for success/error messages
 */

import React, {useEffect, useRef} from 'react';
import {Text, StyleSheet, Animated, TouchableOpacity} from 'react-native';
import Theme from '@/constants/theme';

// ============================================================================
// TYPES
// ============================================================================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  visible: boolean;
  onHide: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function Toast({
  message,
  type = 'info',
  duration = 3000,
  visible,
  onHide,
}: ToastProps): React.ReactElement | null {
  const translateY = useRef(new Animated.Value(-100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Slide in
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible, duration]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onHide();
    });
  };

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: Theme.colors.success.main,
          icon: '✓',
        };
      case 'error':
        return {
          backgroundColor: Theme.colors.error.main,
          icon: '✕',
        };
      case 'warning':
        return {
          backgroundColor: Theme.colors.warning.main,
          icon: '⚠',
        };
      case 'info':
      default:
        return {
          backgroundColor: Theme.colors.primary[500],
          icon: 'ℹ',
        };
    }
  };

  const toastStyle = getToastStyle();

  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: toastStyle.backgroundColor,
          transform: [{translateY}],
          opacity,
        },
      ]}>
      <TouchableOpacity style={styles.content} onPress={hideToast} activeOpacity={0.9}>
        <Text style={styles.icon}>{toastStyle.icon}</Text>
        <Text style={styles.message} numberOfLines={2}>
          {message}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ============================================================================
// TOAST HOOK (for easy usage)
// ============================================================================

export interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
}

export function useToast() {
  const [toast, setToast] = React.useState<ToastState>({
    visible: false,
    message: '',
    type: 'info',
  });

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({visible: true, message, type});
  };

  const hideToast = () => {
    setToast(prev => ({...prev, visible: false}));
  };

  const ToastComponent = () => (
    <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={hideToast} />
  );

  return {
    showToast,
    hideToast,
    ToastComponent,
  };
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  icon: {
    fontSize: 24,
    color: '#FFFFFF',
    marginRight: 12,
    fontWeight: 'bold',
  },
  message: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 20,
  },
});
