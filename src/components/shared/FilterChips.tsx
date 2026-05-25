/**
 * FilterChips.tsx
 * Horizontal scrollable filter chips
 */

import React from 'react';
import {Text, StyleSheet, ScrollView, TouchableOpacity} from 'react-native';

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
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
  },
  chipSelected: {
    backgroundColor: '#E3F2FD',
    borderColor: '#2196F3',
  },
  chipIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#616161',
  },
  chipTextSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
});
