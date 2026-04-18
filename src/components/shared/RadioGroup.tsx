/**
 * RadioGroup.tsx
 * Single selection radio button group
 */

import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, ViewStyle} from 'react-native';

// ============================================================================
// TYPES
// ============================================================================

export interface RadioOption {
  id: string;
  label: string;
  icon?: string;
  description?: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  options: RadioOption[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  label?: string;
  error?: string;
  orientation?: 'vertical' | 'horizontal';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function RadioGroup({
  options,
  selectedId,
  onSelect,
  label,
  error,
  orientation = 'vertical',
  size = 'medium',
  style,
}: RadioGroupProps): React.ReactElement {
  const handlePress = (option: RadioOption) => {
    if (!option.disabled) {
      onSelect(option.id);
    }
  };

  const renderRadioButton = (isSelected: boolean, disabled: boolean) => {
    const outerSize = size === 'small' ? 18 : size === 'medium' ? 22 : 26;
    const innerSize = size === 'small' ? 8 : size === 'medium' ? 10 : 12;

    return (
      <View
        style={[
          styles.radioOuter,
          {width: outerSize, height: outerSize},
          isSelected && styles.radioOuterSelected,
          disabled && styles.radioOuterDisabled,
        ]}>
        {isSelected && (
          <View
            style={[
              styles.radioInner,
              {width: innerSize, height: innerSize},
              disabled && styles.radioInnerDisabled,
            ]}
          />
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View
        style={[styles.optionsContainer, orientation === 'horizontal' && styles.optionsHorizontal]}>
        {options.map(option => {
          const isSelected = option.id === selectedId;

          return (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.option,
                orientation === 'horizontal' && styles.optionHorizontal,
                isSelected && styles.optionSelected,
                option.disabled && styles.optionDisabled,
              ]}
              onPress={() => handlePress(option)}
              disabled={option.disabled}
              activeOpacity={0.7}>
              {renderRadioButton(isSelected, !!option.disabled)}

              <View style={styles.optionContent}>
                <View style={styles.optionHeader}>
                  {option.icon && <Text style={styles.optionIcon}>{option.icon}</Text>}
                  <Text
                    style={[
                      styles.optionLabel,
                      size === 'small' && styles.optionLabelSmall,
                      size === 'large' && styles.optionLabelLarge,
                      isSelected && styles.optionLabelSelected,
                      option.disabled && styles.optionLabelDisabled,
                    ]}>
                    {option.label}
                  </Text>
                </View>

                {option.description && (
                  <Text
                    style={[
                      styles.optionDescription,
                      option.disabled && styles.optionDescriptionDisabled,
                    ]}>
                    {option.description}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

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
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 12,
  },
  optionsContainer: {
    gap: 8,
  },
  optionsHorizontal: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16,
  },
  optionHorizontal: {
    flex: 1,
    minWidth: '45%',
  },
  optionSelected: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  optionDisabled: {
    backgroundColor: '#F5F5F5',
    opacity: 0.6,
  },
  optionContent: {
    flex: 1,
    marginLeft: 12,
  },
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  optionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#424242',
  },
  optionLabelSmall: {
    fontSize: 13,
  },
  optionLabelLarge: {
    fontSize: 17,
  },
  optionLabelSelected: {
    color: '#2196F3',
  },
  optionLabelDisabled: {
    color: '#9E9E9E',
  },
  optionDescription: {
    fontSize: 13,
    color: '#757575',
    marginTop: 4,
  },
  optionDescriptionDisabled: {
    color: '#BDBDBD',
  },
  radioOuter: {
    borderRadius: 100,
    borderWidth: 2,
    borderColor: '#BDBDBD',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  radioOuterSelected: {
    borderColor: '#2196F3',
  },
  radioOuterDisabled: {
    borderColor: '#E0E0E0',
  },
  radioInner: {
    borderRadius: 100,
    backgroundColor: '#2196F3',
  },
  radioInnerDisabled: {
    backgroundColor: '#BDBDBD',
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 8,
    marginLeft: 4,
  },
});
