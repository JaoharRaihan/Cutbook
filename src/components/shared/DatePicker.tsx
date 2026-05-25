/**
 * DatePicker.tsx
 * Reusable date picker component with range selection
 */

import React, {useState} from 'react';
import {View, Text, StyleSheet, TouchableOpacity, Modal, ScrollView} from 'react-native';

// ============================================================================
// TYPES
// ============================================================================

export interface DatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  mode?: 'single' | 'range';
  startDate?: Date;
  endDate?: Date;
  onRangeChange?: (start: Date, end: Date) => void;
  label?: string;
  minDate?: Date;
  maxDate?: Date;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function DatePicker({
  selectedDate,
  onDateChange,
  mode = 'single',
  startDate,
  endDate,
  onRangeChange,
  label = 'Select Date',
  _minDate,
  _maxDate,
}: DatePickerProps & {_minDate?: Date; _maxDate?: Date}): React.ReactElement {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempStartDate, setTempStartDate] = useState(startDate || new Date());
  const [tempEndDate, setTempEndDate] = useState(endDate || new Date());

  // ============================================================================
  // HELPERS
  // ============================================================================

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const generateDays = (month: Date): Date[] => {
    const days: Date[] = [];
    const year = month.getFullYear();
    const monthNum = month.getMonth();
    const daysInMonth = new Date(year, monthNum + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, monthNum, day));
    }
    return days;
  };

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleDateSelect = (date: Date) => {
    if (mode === 'single') {
      onDateChange(date);
      setModalVisible(false);
    } else if (mode === 'range') {
      // Range selection logic
      if (!tempStartDate || (tempStartDate && tempEndDate)) {
        setTempStartDate(date);
        setTempEndDate(date);
      } else {
        if (date < tempStartDate) {
          setTempEndDate(tempStartDate);
          setTempStartDate(date);
        } else {
          setTempEndDate(date);
        }
      }
    }
  };

  const handleRangeConfirm = () => {
    if (onRangeChange && tempStartDate && tempEndDate) {
      onRangeChange(tempStartDate, tempEndDate);
    }
    setModalVisible(false);
  };

  const isDateInRange = (date: Date): boolean => {
    if (mode !== 'range' || !tempStartDate || !tempEndDate) return false;
    return date >= tempStartDate && date <= tempEndDate;
  };

  const isDateSelected = (date: Date): boolean => {
    if (mode === 'single') {
      return date.toDateString() === selectedDate.toDateString();
    }
    return (
      date.toDateString() === tempStartDate?.toDateString() ||
      date.toDateString() === tempEndDate?.toDateString()
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  const currentMonth = new Date();
  const days = generateDays(currentMonth);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.selector} onPress={() => setModalVisible(true)}>
        <View style={styles.selectorLeft}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>
            {mode === 'single'
              ? formatDate(selectedDate)
              : `${formatDate(tempStartDate)} - ${formatDate(tempEndDate)}`}
          </Text>
        </View>
        <Text style={styles.icon}>📅</Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {mode === 'single' ? 'Select Date' : 'Select Date Range'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.calendar}>
                <Text style={styles.monthTitle}>
                  {currentMonth.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>

                {/* Weekday headers */}
                <View style={styles.weekRow}>
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <Text key={day} style={styles.weekday}>
                      {day}
                    </Text>
                  ))}
                </View>

                {/* Days grid */}
                <View style={styles.daysGrid}>
                  {days.map(date => {
                    const isSelected = isDateSelected(date);
                    const inRange = isDateInRange(date);

                    return (
                      <TouchableOpacity
                        key={date.toISOString()}
                        style={[
                          styles.dayCell,
                          isSelected && styles.daySelected,
                          inRange && !isSelected && styles.dayInRange,
                        ]}
                        onPress={() => handleDateSelect(date)}>
                        <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>
                          {date.getDate()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </ScrollView>

            {mode === 'range' && (
              <TouchableOpacity style={styles.confirmButton} onPress={handleRangeConfirm}>
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
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
  selector: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectorLeft: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: '#757575',
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  icon: {
    fontSize: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
  },
  modalClose: {
    fontSize: 24,
    color: '#757575',
    paddingHorizontal: 8,
  },
  calendar: {
    padding: 20,
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 16,
    textAlign: 'center',
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  weekday: {
    width: 40,
    fontSize: 12,
    fontWeight: '600',
    color: '#757575',
    textAlign: 'center',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  dayCell: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 4,
    borderRadius: 20,
  },
  daySelected: {
    backgroundColor: '#2196F3',
  },
  dayInRange: {
    backgroundColor: '#E3F2FD',
  },
  dayText: {
    fontSize: 14,
    color: '#212121',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  confirmButton: {
    backgroundColor: '#2196F3',
    borderRadius: 12,
    paddingVertical: 16,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
