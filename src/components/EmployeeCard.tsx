/**
 * EmployeeCard.tsx
 * Reusable employee card component for lists
 */

import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Theme from '@/constants/theme';
import {User, UserStatus, CommissionMode} from '@/types';

// ============================================================================
// TYPES
// ============================================================================

interface EmployeeCardProps {
  employee: User;
  orgDefaultMode?: CommissionMode;
  onPress?: () => void;
}

// ============================================================================
// HELPERS
// ============================================================================

function getModeBadge(employee: User, orgDefaultMode?: CommissionMode) {
  const effectiveMode = employee.commissionMode ?? orgDefaultMode ?? CommissionMode.PERCENTAGE;
  switch (effectiveMode) {
    case CommissionMode.SALARY:
      return {
        label: `৳${employee.monthlySalary || 0}/mo`,
        color: '#432534',
        bg: '#FDF4F8',
        icon: '💜',
      };
    case CommissionMode.FIXED:
      return {
        label: `৳${employee.commissionPercentage || 0} fixed`,
        color: '#C44900',
        bg: '#FFF8F0',
        icon: '💰',
      };
    default: // PERCENTAGE
      return {
        label: `${employee.commissionPercentage || 0}%`,
        color: '#183A37',
        bg: '#E8F0EE',
        icon: '📊',
      };
  }
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function EmployeeCard({
  employee,
  orgDefaultMode,
  onPress,
}: EmployeeCardProps): React.ReactElement {
  const getStatusColor = (status: UserStatus): string => {
    switch (status) {
      case UserStatus.ACTIVE:
        return Theme.colors.success.main;
      case UserStatus.BLOCKED:
        return Theme.colors.error.main;
      case UserStatus.PENDING:
        return Theme.colors.warning.main;
      default:
        return Theme.colors.neutral[500];
    }
  };

  const getStatusLabel = (status: UserStatus): string => {
    switch (status) {
      case UserStatus.ACTIVE:
        return 'Active';
      case UserStatus.BLOCKED:
        return 'Blocked';
      case UserStatus.PENDING:
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const modeBadge = getModeBadge(employee, orgDefaultMode);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7} disabled={!onPress}>
      <View style={styles.content}>
        {/* Avatar */}
        <View style={[styles.avatar, {backgroundColor: modeBadge.bg}]}>
          <Text style={[styles.avatarText, {color: modeBadge.color}]}>
            {employee.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>
              {employee.name} {employee.role === 'owner' ? '(Owner)' : ''}
            </Text>
            <View
              style={[
                styles.statusBadge,
                {backgroundColor: getStatusColor(employee.status) + '20'},
              ]}>
              <View
                style={[styles.statusDot, {backgroundColor: getStatusColor(employee.status)}]}
              />
              <Text style={[styles.statusText, {color: getStatusColor(employee.status)}]}>
                {getStatusLabel(employee.status)}
              </Text>
            </View>
          </View>

          <Text style={styles.phone} numberOfLines={1}>
            {employee.phone}
          </Text>

          {/* Commission / Salary badge */}
          <View style={[styles.modeBadgeWrap, {backgroundColor: modeBadge.bg}]}>
            <Text style={[styles.modeBadgeText, {color: modeBadge.color}]}>
              {modeBadge.icon} {modeBadge.label}
            </Text>
          </View>
        </View>

        {/* Arrow */}
        {onPress && (
          <View style={styles.arrow}>
            <Text style={styles.arrowText}>›</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Theme.colors.neutral[200],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: Theme.colors.primary[700],
  },
  info: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    color: Theme.colors.text.primary,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  phone: {
    fontSize: 14,
    color: Theme.colors.text.secondary,
    marginBottom: 4,
  },
  email: {
    fontSize: 12,
    color: Theme.colors.text.secondary,
    marginBottom: 4,
  },
  modeBadgeWrap: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  modeBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  arrow: {
    marginLeft: 8,
  },
  arrowText: {
    fontSize: 28,
    color: Theme.colors.neutral[400],
    fontWeight: '300',
  },
});
