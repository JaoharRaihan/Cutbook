/**
 * ServiceCard.tsx
 * Reusable service card component for lists
 */

import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import Theme from '@/constants/theme';
import {Service, ServiceCategory} from '@/types';
import {formatBDT} from '@/utils/currency';

interface ServiceCardProps {
  service: Service;
  onPress?: () => void;
}

export default function ServiceCard({service, onPress}: ServiceCardProps): React.ReactElement {
  const getCategoryIcon = (category: ServiceCategory): string => {
    switch (category) {
      case ServiceCategory.HAIRCUT:
        return 'content-cut';
      case ServiceCategory.SHAVE:
        return 'cleaning-services';
      case ServiceCategory.BEARD:
        return 'face';
      case ServiceCategory.COLOR:
        return 'palette';
      case ServiceCategory.FACIAL:
        return 'spa';
      case ServiceCategory.MASSAGE:
        return 'self-improvement';
      case ServiceCategory.SPA:
        return 'bathtub';
      case ServiceCategory.OTHER:
        return 'auto-awesome';
      default:
        return 'storefront';
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
        {/* ICON */}
        <View
          style={[
            styles.iconContainer,
            {backgroundColor: getCategoryColor(service.category) + '20'},
          ]}>
          <MaterialIcons
            name={getCategoryIcon(service.category)}
            size={24}
            color={getCategoryColor(service.category)}
          />
        </View>

        {/* INFO */}
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

        {/* RIGHT SIDE */}
        {onPress ? (
          <View style={styles.arrow}>
            <MaterialIcons name="chevron-right" size={24} color={Theme.colors.neutral[400]} />
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
