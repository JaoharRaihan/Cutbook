/**
 * AnimatedButton.tsx
 * Button with press animation feedback
 */

import React, {useRef} from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  ActivityIndicator,
  TouchableOpacityProps,
  ViewStyle,
  TextStyle,
} from 'react-native';
import Theme from '@/constants/theme';
// ============================================================================
// TYPES
// ============================================================================

export interface AnimatedButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  icon?: string;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function AnimatedButton({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  loading = false,
  icon,
  fullWidth = false,
  disabled,
  style,
  textStyle,
  ...touchableProps
}: AnimatedButtonProps): React.ReactElement {
  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  const getVariantStyle = (): ViewStyle => {
    switch (variant) {
      case 'primary':
        return styles.primaryButton;
      case 'secondary':
        return styles.secondaryButton;
      case 'outline':
        return styles.outlineButton;
      case 'danger':
        return styles.dangerButton;
      default:
        return styles.primaryButton;
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'primary':
        return styles.primaryText;
      case 'secondary':
        return styles.secondaryText;
      case 'outline':
        return styles.outlineText;
      case 'danger':
        return styles.dangerText;
      default:
        return styles.primaryText;
    }
  };

  const getSizeStyle = (): ViewStyle => {
    switch (size) {
      case 'small':
        return styles.smallButton;
      case 'large':
        return styles.largeButton;
      default:
        return styles.mediumButton;
    }
  };

  const getTextSizeStyle = (): TextStyle => {
    switch (size) {
      case 'small':
        return styles.smallText;
      case 'large':
        return styles.largeText;
      default:
        return styles.mediumText;
    }
  };

  const getSpinnerColor = (): string => {
    switch (variant) {
      case 'outline':
        return Theme.colors.primary[500];
      case 'secondary':
        return Theme.colors.primary[500];
      default:
        return '#FFFFFF';
    }
  };

  return (
    <Animated.View style={[{transform: [{scale: scaleValue}]}, fullWidth && styles.fullWidth]}>
      <TouchableOpacity
        {...touchableProps}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        style={[
          styles.button,
          getVariantStyle(),
          getSizeStyle(),
          fullWidth && styles.fullWidth,
          (disabled || loading) && styles.disabled,
          style,
        ]}
        activeOpacity={0.8}>
        {loading ? (
          <ActivityIndicator size="small" color={getSpinnerColor()} />
        ) : (
          <>
            {icon && <Text style={styles.icon}>{icon}</Text>}
            <Text style={[styles.text, getTextStyle(), getTextSizeStyle(), textStyle]}>
              {title}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingHorizontal: 24,
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  // Variants
  primaryButton: {
    backgroundColor: Theme.colors.primary[500],
  },
  secondaryButton: {
    backgroundColor: Theme.colors.primary[50],
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Theme.colors.primary[500],
  },
  dangerButton: {
    backgroundColor: '#F44336',
  },
  // Sizes
  smallButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  mediumButton: {
    paddingVertical: 14,
  },
  largeButton: {
    paddingVertical: 18,
    paddingHorizontal: 32,
  },
  // Text
  text: {
    fontWeight: '600',
  },
  primaryText: {
    color: '#FFFFFF',
  },
  secondaryText: {
    color: Theme.colors.primary[500],
  },
  outlineText: {
    color: Theme.colors.primary[500],
  },
  dangerText: {
    color: '#FFFFFF',
  },
  // Text sizes
  smallText: {
    fontSize: 13,
  },
  mediumText: {
    fontSize: 15,
  },
  largeText: {
    fontSize: 17,
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
});
