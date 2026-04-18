/**
 * Employee Rank Card Component
 * Displays top performing employee information
 */

import React from 'react';
import {View, Text, StyleSheet, ViewStyle} from 'react-native';
import Theme from '@/constants/theme';
import {formatBDT} from '@/utils/currency';

// ============================================================================
// TYPES
// ============================================================================

interface EmployeeRankCardProps {
  rank: number;
  name: string;
  totalIncome: number;
  serviceCount: number;
  style?: ViewStyle;
}

// ============================================================================
// EMPLOYEE RANK CARD COMPONENT
// ============================================================================

const EmployeeRankCard: React.FC<EmployeeRankCardProps> = ({
  rank,
  name,
  totalIncome,
  serviceCount,
  style,
}) => {
  // Get medal emoji based on rank
  const getMedal = () => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  // Get rank color
  const getRankColor = () => {
    switch (rank) {
      case 1:
        return '#FFD700'; // Gold
      case 2:
        return '#C0C0C0'; // Silver
      case 3:
        return '#CD7F32'; // Bronze
      default:
        return Theme.colors.neutral[400];
    }
  };

  return (
    <View style={[styles.card, style]}>
      <View style={styles.header}>
        <View style={[styles.rankBadge, {backgroundColor: getRankColor()}]}>
          <Text style={styles.rankText}>{getMedal()}</Text>
        </View>
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.serviceCount}>{serviceCount} services</Text>
        </View>
      </View>
      <View style={styles.incomeContainer}>
        <Text style={styles.income}>{formatBDT(totalIncome)}</Text>
      </View>
    </View>
  );
};

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: Theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[200],
    ...Theme.shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  rankBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 24,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text.primary,
    marginBottom: 4,
  },
  serviceCount: {
    fontSize: 13,
    color: Theme.colors.text.secondary,
  },
  incomeContainer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Theme.colors.neutral[200],
  },
  income: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.success.dark,
  },
});

export default EmployeeRankCard;
