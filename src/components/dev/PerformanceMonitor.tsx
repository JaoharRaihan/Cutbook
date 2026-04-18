/**
 * PerformanceMonitor.tsx
 * Monitor app performance and render times
 */

import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';

// ============================================================================
// TYPES
// ============================================================================

interface PerformanceMetrics {
  renderCount: number;
  lastRenderTime: number;
  averageRenderTime: number;
  totalRenderTime: number;
  fps: number;
}

interface Props {
  componentName: string;
  showOverlay?: boolean;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function PerformanceMonitor({
  componentName,
  showOverlay = false,
}: Props): React.ReactElement | null {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderCount: 0,
    lastRenderTime: 0,
    averageRenderTime: 0,
    totalRenderTime: 0,
    fps: 60,
  });
  const [isVisible, setIsVisible] = useState(showOverlay);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const renderStart = Date.now();

    return () => {
      const renderEnd = Date.now();
      const renderTime = renderEnd - renderStart;

      setMetrics(prev => {
        const newRenderCount = prev.renderCount + 1;
        const newTotalTime = prev.totalRenderTime + renderTime;
        const newAverage = newTotalTime / newRenderCount;

        // Estimate FPS (simplified)
        const fps = renderTime > 0 ? Math.min(60, 1000 / renderTime) : 60;

        return {
          renderCount: newRenderCount,
          lastRenderTime: renderTime,
          averageRenderTime: newAverage,
          totalRenderTime: newTotalTime,
          fps: Math.round(fps),
        };
      });
    };
  });

  // Log to console in dev mode
  useEffect(() => {
    if (__DEV__ && metrics.renderCount > 0) {
      console.log(
        `[Performance] ${componentName} - Render #${metrics.renderCount}: ${metrics.lastRenderTime}ms (avg: ${metrics.averageRenderTime.toFixed(2)}ms)`,
      );
    }
  }, [componentName, metrics.renderCount, metrics.lastRenderTime, metrics.averageRenderTime]);

  if (!isVisible || !__DEV__) {
    return null;
  }

  const getPerformanceColor = (time: number): string => {
    if (time < 16) return '#4CAF50'; // Good (<16ms = 60fps)
    if (time < 32) return '#FF9800'; // OK (<32ms = 30fps)
    return '#F44336'; // Bad (>32ms)
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeButton} onPress={() => setIsVisible(false)}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        <Text style={styles.title}>⚡ {componentName}</Text>

        <View style={styles.metricRow}>
          <Text style={styles.label}>Renders:</Text>
          <Text style={styles.value}>{metrics.renderCount}</Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.label}>Last:</Text>
          <Text style={[styles.value, {color: getPerformanceColor(metrics.lastRenderTime)}]}>
            {metrics.lastRenderTime}ms
          </Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.label}>Average:</Text>
          <Text style={[styles.value, {color: getPerformanceColor(metrics.averageRenderTime)}]}>
            {metrics.averageRenderTime.toFixed(2)}ms
          </Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.label}>FPS:</Text>
          <Text style={[styles.value, {color: metrics.fps >= 55 ? '#4CAF50' : '#F44336'}]}>
            ~{metrics.fps}
          </Text>
        </View>

        <View style={styles.metricRow}>
          <Text style={styles.label}>Uptime:</Text>
          <Text style={styles.value}>{Math.round((Date.now() - startTime) / 1000)}s</Text>
        </View>
      </View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 50,
    right: 10,
    zIndex: 9999,
  },
  container: {
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    borderRadius: 8,
    padding: 12,
    minWidth: 180,
  },
  closeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    padding: 4,
  },
  closeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    color: '#BDBDBD',
  },
  value: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
