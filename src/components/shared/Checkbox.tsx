/**
 * Checkbox.tsx
 * Boolean toggle checkbox component
 */

import React from 'react';
import {View, Text, TouchableOpacity, ViewStyle, StyleSheet} from 'react-native';

// ============================================================================
// TYPES
// ============================================================================

export interface CheckboxProps {
  checked: boolean;
  onToggle: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
  error?: string;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  style?: ViewStyle;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function Checkbox({
  checked,
  onToggle,
  label,
  description,
  disabled = false,
  error,
  size = 'medium',
  color = '#2196F3',
  style,
}: CheckboxProps): React.ReactElement {
  const handlePress = () => {
    if (!disabled) {
      onToggle(!checked);
    }
  };

  const getBoxSize = () => {
    switch (size) {
      case 'small':
        return 18;
      case 'large':
        return 26;
      default:
        return 22;
    }
  };

  const getCheckmarkSize = () => {
    switch (size) {
      case 'small':
        return 14;
      case 'large':
        return 20;
      default:
        return 16;
    }
  };

  const boxSize = getBoxSize();
  const checkmarkSize = getCheckmarkSize();

  return (
    <View style={[styles.container, style]}>
      <TouchableOpacity
        style={styles.checkboxRow}
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}>
        <View
          style={[
            styles.checkboxBox,
            {
              width: boxSize,
              height: boxSize,
              borderColor: error ? '#F44336' : checked ? color : '#BDBDBD',
              backgroundColor: checked ? color : '#FFFFFF',
            },
            disabled && styles.checkboxDisabled,
          ]}>
          {checked && <Text style={[styles.checkmark, {fontSize: checkmarkSize}]}>✓</Text>}
        </View>

        {(label || description) && (
          <View style={styles.labelContainer}>
            {label && (
              <Text
                style={[
                  styles.label,
                  size === 'small' && styles.labelSmall,
                  size === 'large' && styles.labelLarge,
                  disabled && styles.labelDisabled,
                  error && styles.labelError,
                ]}>
                {label}
              </Text>
            )}

            {description && (
              <Text style={[styles.description, disabled && styles.descriptionDisabled]}>
                {description}
              </Text>
            )}
          </View>
        )}
      </TouchableOpacity>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkboxBox: {
    borderRadius: 6,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxDisabled: {
    opacity: 0.5,
  },
  checkmark: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  labelContainer: {
    flex: 1,
    marginLeft: 12,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#424242',
  },
  labelSmall: {
    fontSize: 13,
  },
  labelLarge: {
    fontSize: 17,
  },
  labelDisabled: {
    color: '#9E9E9E',
  },
  labelError: {
    color: '#F44336',
  },
  description: {
    fontSize: 13,
    color: '#757575',
    marginTop: 4,
    lineHeight: 18,
  },
  descriptionDisabled: {
    color: '#BDBDBD',
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
    marginLeft: 34,
  },
});
