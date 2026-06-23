/**
 * FilterChips.tsx
 * Horizontal scrollable filter chips
 */

import React from 'react';
import {Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';
import Theme from '@/constants/theme';

// ============================================================================
// TYPES
// ============================================================================

export interface FilterChip {
  id: string;
  label: string;
  icon?: string;
}

export interface FilterChipsProps {
  chips: FilterChip[];
  selectedId: string;
  onSelect: (id: string) => void;
  style?: any;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function FilterChips({
  chips,
  selectedId,
  onSelect,
  style,
}: FilterChipsProps): React.ReactElement {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={[styles.container, style]}
      contentContainerStyle={styles.contentContainer}>
      {chips.map(chip => {
        const isSelected = chip.id === selectedId;

        return (
          <TouchableOpacity
            key={chip.id}
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => onSelect(chip.id)}>
            {chip.icon && <Text style={styles.chipIcon}>{chip.icon}</Text>}
            <Text style={[styles.chipText, isSelected && styles.chipTextSelected]}>
              {chip.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flexGrow: 0,
  },
  contentContainer: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    backgroundColor: Theme.colors.neutral[100],
    borderRadius: Theme.borderRadius.chip,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border.light,
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: Theme.colors.primary[50],
    borderColor: Theme.colors.primary[500],
  },
  chipIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: Theme.colors.text.secondary,
  },
  chipTextSelected: {
    color: Theme.colors.primary[500],
    fontWeight: '600',
  },
});
