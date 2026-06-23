/**
 * DatePickerModal.tsx
 * Cross-platform date picker component for selecting dates
 */

import React, {useState} from 'react';
import Theme from '@/constants/theme';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ScrollView,
} from 'react-native';

interface DatePickerModalProps {
  visible: boolean;
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onClose: () => void;
  minDate?: Date;
  maxDate?: Date;
}

export default function DatePickerModal({
  visible,
  selectedDate,
  onDateChange,
  onClose,
  minDate,
  maxDate,
}: DatePickerModalProps): React.ReactElement {
  const [displayMonth, setDisplayMonth] = useState<number>(selectedDate.getMonth());
  const [displayYear, setDisplayYear] = useState<number>(selectedDate.getFullYear());

  const currentDate = new Date();
  const min = minDate || new Date(currentDate.getFullYear() - 5, 0, 1);
  const max = maxDate || new Date(currentDate.getFullYear() + 1, 11, 31);

  // Get days in month
  const getDaysInMonth = (month: number, year: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Generate calendar days
  const getCalendarDays = (): (number | null)[] => {
    const firstDay = new Date(displayYear, displayMonth, 1).getDay();
    const daysInMonth = getDaysInMonth(displayMonth, displayYear);
    const days: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  };

  const isDateDisabled = (day: number): boolean => {
    const testDate = new Date(displayYear, displayMonth, day);
    return testDate < min || testDate > max;
  };

  const isDateSelected = (day: number): boolean => {
    return (
      day === selectedDate.getDate() &&
      displayMonth === selectedDate.getMonth() &&
      displayYear === selectedDate.getFullYear()
    );
  };

  const isDateToday = (day: number): boolean => {
    return (
      day === currentDate.getDate() &&
      displayMonth === currentDate.getMonth() &&
      displayYear === currentDate.getFullYear()
    );
  };

  const handleDayPress = (day: number): void => {
    const newDate = new Date(displayYear, displayMonth, day);
    onDateChange(newDate);
    onClose();
  };

  const handlePrevMonth = (): void => {
    if (displayMonth === 0) {
      setDisplayMonth(11);
      setDisplayYear(displayYear - 1);
    } else {
      setDisplayMonth(displayMonth - 1);
    }
  };

  const handleNextMonth = (): void => {
    if (displayMonth === 11) {
      setDisplayMonth(0);
      setDisplayYear(displayYear + 1);
    } else {
      setDisplayMonth(displayMonth + 1);
    }
  };

  const monthName = new Date(displayYear, displayMonth).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const calendarDays = getCalendarDays();
  const weeks: (number | null)[][] = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <SafeAreaView style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Select Date</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Month Navigation */}
          <View style={styles.monthNavigation}>
            <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
              <Text style={styles.navButtonText}>‹</Text>
            </TouchableOpacity>

            <Text style={styles.monthYear}>{monthName}</Text>

            <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
              <Text style={styles.navButtonText}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Calendar */}
          <View style={styles.calendarContainer}>
            {/* Week day headers */}
            <View style={styles.weekDaysRow}>
              {weekDays.map((day: string) => (
                <View key={day} style={styles.weekDayCell}>
                  <Text style={styles.weekDayText}>{day}</Text>
                </View>
              ))}
            </View>

            {/* Calendar days */}
            <ScrollView style={styles.daysContainer} scrollEnabled={weeks.length > 6}>
              {weeks.map((week: (number | null)[], weekIndex: number) => (
                <View key={`week_${weekIndex}`} style={styles.weekRow}>
                  {week.map((day: number | null, dayIndex: number) => (
                    <View key={`day_${dayIndex}`} style={styles.dayCell}>
                      {day ? (
                        <TouchableOpacity
                          onPress={() => handleDayPress(day)}
                          disabled={isDateDisabled(day)}
                          style={[
                            styles.dayButton,
                            isDateSelected(day) && styles.dayButtonSelected,
                            isDateToday(day) && styles.dayButtonToday,
                            isDateDisabled(day) && styles.dayButtonDisabled,
                          ]}>
                          <Text
                            style={[
                              styles.dayText,
                              isDateSelected(day) && styles.dayTextSelected,
                              isDateDisabled(day) && styles.dayTextDisabled,
                            ]}>
                            {day}
                          </Text>
                        </TouchableOpacity>
                      ) : (
                        <View style={styles.dayButton} />
                      )}
                    </View>
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={onClose} style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                const today = new Date();
                onDateChange(today);
                onClose();
              }}
              style={styles.todayButton}>
              <Text style={styles.todayButtonText}>Today</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  closeButton: {
    fontSize: 24,
    color: '#757575',
  },
  monthNavigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  navButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 24,
    color: Theme.colors.primary[500],
    fontWeight: '600',
  },
  monthYear: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  calendarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  weekDaysRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDayCell: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#757575',
  },
  daysContainer: {
    maxHeight: 300,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayCell: {
    flex: 1,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayButtonSelected: {
    backgroundColor: Theme.colors.primary[500],
  },
  dayButtonToday: {
    borderWidth: 2,
    borderColor: Theme.colors.primary[500],
  },
  dayButtonDisabled: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 14,
    color: '#212121',
    fontWeight: '500',
  },
  dayTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  dayTextDisabled: {
    color: '#BDBDBD',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  todayButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: Theme.colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  todayButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
