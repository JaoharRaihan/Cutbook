/**
 * ServiceCard.tsx
 * Reusable service card component for lists
 */

import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Theme from '@/constants/theme';
import {Service, ServiceCategory} from '@/types';
import {formatBDT} from '@/utils/currency';

// ============================================================================
// TYPES
// ============================================================================

interface ServiceCardProps {
  service: Service;
  onPress?: () => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function ServiceCard({service, onPress}: ServiceCardProps): React.ReactElement {
  const getCategoryIcon = (category: ServiceCategory): string => {
    switch (category) {
      case ServiceCategory.HAIRCUT:
        return '✂️';
      case ServiceCategory.SHAVE:
        return '🪒';
      case ServiceCategory.BEARD:
        return '🧔';
      case ServiceCategory.COLOR:
        return '🎨';
      case ServiceCategory.FACIAL:
        return '💆';
      case ServiceCategory.MASSAGE:
        return '💆‍♂️';
      case ServiceCategory.SPA:
        return '🛁';
      case ServiceCategory.OTHER:
        return '✨';
      default:
        return '💈';
    }
  };

  const getCategoryColor = (category: ServiceCategory): string => {
    switch (category) {
      case ServiceCategory.HAIRCUT:
        return Theme.colors.primary[500];
      case ServiceCategory.SHAVE:
        return Theme.colors.info.main;
      case ServiceCategory.BEARD:
        return Theme.colors.secondary[500];
      case ServiceCategory.COLOR:
        return Theme.colors.accent[500];
      case ServiceCategory.FACIAL:
        return Theme.colors.warning.main;
      case ServiceCategory.MASSAGE:
        return Theme.colors.success.main;
      case ServiceCategory.SPA:
        return Theme.colors.primary[700];
      default:
        return Theme.colors.neutral[500];
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7} disabled={!onPress}>
      <View style={styles.content}>
        {/* Icon */}
        <View
          style={[
            styles.iconContainer,
            {backgroundColor: getCategoryColor(service.category) + '20'},
          ]}>
          <Text style={styles.icon}>{getCategoryIcon(service.category)}</Text>
        </View>

        {/* Info */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {service.name}
          </Text>
          {service.defaultPrice !== undefined && (
            <Text style={styles.price}>{formatBDT(service.defaultPrice)}</Text>
          )}
          {service.description && (
            <Text style={styles.description} numberOfLines={2}>
              {service.description}
            </Text>
          )}
        </View>

        {/* Arrow or Badge */}
        {onPress ? (
          <View style={styles.arrow}>
            <Text style={styles.arrowText}>›</Text>
          </View>
        ) : (
          service.isActive !== undefined &&
          !service.isActive && (
            <View style={styles.inactiveBadge}>
              <Text style={styles.inactiveBadgeText}>Inactive</Text>
            </View>
          )
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
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
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
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: Theme.colors.success.main,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    color: Theme.colors.text.secondary,
    lineHeight: 18,
  },
  arrow: {
    marginLeft: 8,
  },
  arrowText: {
    fontSize: 28,
    color: Theme.colors.neutral[400],
    fontWeight: '300',
  },
  inactiveBadge: {
    backgroundColor: Theme.colors.error.light + '30',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  inactiveBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: Theme.colors.error.main,
  },
});
