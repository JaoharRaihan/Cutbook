/**
 * CutBook Theme Configuration
 * Design System: Colors, Typography, Spacing, Shadows
 */

// ============================================================================
// COLORS
// ============================================================================

export const Colors = {
  // Primary - Professional Blue
  primary: {
    50: '#E3F2FD',
    100: '#BBDEFB',
    200: '#90CAF9',
    300: '#64B5F6',
    400: '#42A5F5',
    500: '#2196F3', // Main primary
    600: '#1E88E5',
    700: '#1976D2',
    800: '#1565C0',
    900: '#0D47A1',
  },

  // Secondary - Elegant Purple
  secondary: {
    50: '#F3E5F5',
    100: '#E1BEE7',
    200: '#CE93D8',
    300: '#BA68C8',
    400: '#AB47BC',
    500: '#9C27B0', // Main secondary
    600: '#8E24AA',
    700: '#7B1FA2',
    800: '#6A1B9A',
    900: '#4A148C',
  },

  // Accent - Modern Teal
  accent: {
    50: '#E0F2F1',
    100: '#B2DFDB',
    200: '#80CBC4',
    300: '#4DB6AC',
    400: '#26A69A',
    500: '#009688', // Main accent
    600: '#00897B',
    700: '#00796B',
    800: '#00695C',
    900: '#004D40',
  },

  // Success - Green
  success: {
    light: '#81C784',
    main: '#4CAF50',
    dark: '#388E3C',
  },

  // Warning - Orange
  warning: {
    light: '#FFB74D',
    main: '#FF9800',
    dark: '#F57C00',
  },

  // Error - Red
  error: {
    light: '#E57373',
    main: '#F44336',
    dark: '#D32F2F',
  },

  // Info - Light Blue
  info: {
    light: '#4FC3F7',
    main: '#03A9F4',
    dark: '#0288D1',
  },

  // Neutral/Gray Scale
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#EEEEEE',
    300: '#E0E0E0',
    400: '#BDBDBD',
    500: '#9E9E9E',
    600: '#757575',
    700: '#616161',
    800: '#424242',
    900: '#212121',
    1000: '#000000',
  },

  // Text Colors
  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#BDBDBD',
    hint: '#9E9E9E',
    inverse: '#FFFFFF',
  },

  // Background Colors
  background: {
    default: '#FAFAFA',
    paper: '#FFFFFF',
    dark: '#212121',
    overlay: 'rgba(0, 0, 0, 0.5)',
  },

  // Border Colors
  border: {
    light: '#E0E0E0',
    main: '#BDBDBD',
    dark: '#757575',
  },

  // Payment Method Colors
  payment: {
    cash: '#4CAF50',
    bkash: '#E2136E',
    nagad: '#F37021',
    card: '#2196F3',
    other: '#9E9E9E',
  },

  // Status Colors
  status: {
    active: '#4CAF50',
    blocked: '#F44336',
    pending: '#FF9800',
  },

  // Service Category Colors
  category: {
    haircut: '#2196F3',
    shave: '#00BCD4',
    beard: '#795548',
    color: '#E91E63',
    facial: '#FF9800',
    massage: '#9C27B0',
    spa: '#4CAF50',
    other: '#9E9E9E',
  },
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const Typography = {
  // Font Families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    semiBold: 'System',
    light: 'System',
  },

  // Font Sizes
  fontSize: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 28,
    '4xl': 32,
    '5xl': 36,
    '6xl': 40,
  },

  // Font Weights
  fontWeight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
  },

  // Line Heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
    loose: 2,
  },

  // Letter Spacing
  letterSpacing: {
    tighter: -0.5,
    tight: -0.25,
    normal: 0,
    wide: 0.25,
    wider: 0.5,
    widest: 1,
  },

  // Text Styles (Predefined combinations)
  styles: {
    h1: {
      fontSize: 32,
      fontWeight: '700' as const,
      lineHeight: 1.2,
      letterSpacing: -0.5,
    },
    h2: {
      fontSize: 28,
      fontWeight: '700' as const,
      lineHeight: 1.3,
      letterSpacing: -0.25,
    },
    h3: {
      fontSize: 24,
      fontWeight: '600' as const,
      lineHeight: 1.4,
      letterSpacing: 0,
    },
    h4: {
      fontSize: 20,
      fontWeight: '600' as const,
      lineHeight: 1.4,
      letterSpacing: 0,
    },
    h5: {
      fontSize: 18,
      fontWeight: '600' as const,
      lineHeight: 1.5,
      letterSpacing: 0,
    },
    h6: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 1.5,
      letterSpacing: 0,
    },
    body1: {
      fontSize: 16,
      fontWeight: '400' as const,
      lineHeight: 1.5,
      letterSpacing: 0,
    },
    body2: {
      fontSize: 14,
      fontWeight: '400' as const,
      lineHeight: 1.5,
      letterSpacing: 0,
    },
    button: {
      fontSize: 16,
      fontWeight: '600' as const,
      lineHeight: 1.5,
      letterSpacing: 0.25,
      textTransform: 'uppercase' as const,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      lineHeight: 1.5,
      letterSpacing: 0,
    },
    overline: {
      fontSize: 10,
      fontWeight: '600' as const,
      lineHeight: 1.5,
      letterSpacing: 1,
      textTransform: 'uppercase' as const,
    },
  },
} as const;

// ============================================================================
// SPACING
// ============================================================================

// Base spacing unit: 4px
const BASE_SPACING = 4;

export const Spacing = {
  base: BASE_SPACING,
  xs: BASE_SPACING * 1, // 4px
  sm: BASE_SPACING * 2, // 8px
  md: BASE_SPACING * 3, // 12px
  lg: BASE_SPACING * 4, // 16px
  xl: BASE_SPACING * 5, // 20px
  '2xl': BASE_SPACING * 6, // 24px
  '3xl': BASE_SPACING * 8, // 32px
  '4xl': BASE_SPACING * 10, // 40px
  '5xl': BASE_SPACING * 12, // 48px
  '6xl': BASE_SPACING * 16, // 64px

  // Named spacing for common use cases
  screenPadding: BASE_SPACING * 4, // 16px
  cardPadding: BASE_SPACING * 4, // 16px
  sectionGap: BASE_SPACING * 6, // 24px
  elementGap: BASE_SPACING * 3, // 12px
  buttonPadding: BASE_SPACING * 4, // 16px
  inputPadding: BASE_SPACING * 3, // 12px
} as const;

// ============================================================================
// BORDER RADIUS
// ============================================================================

export const BorderRadius = {
  none: 0,
  xs: 2,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  '3xl': 24,
  full: 9999,

  // Named radius for common use cases
  button: 8,
  card: 12,
  input: 8,
  modal: 16,
  chip: 16,
} as const;

// ============================================================================
// SHADOWS
// ============================================================================

export const Shadows = {
  none: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 0},
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.18,
    shadowRadius: 1.0,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 4},
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 6},
    shadowOpacity: 0.37,
    shadowRadius: 7.49,
    elevation: 12,
  },
  '2xl': {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 10},
    shadowOpacity: 0.51,
    shadowRadius: 13.16,
    elevation: 20,
  },
} as const;

// ============================================================================
// ICON SIZES
// ============================================================================

export const IconSize = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
  '2xl': 40,
  '3xl': 48,
  '4xl': 64,
} as const;

// ============================================================================
// OPACITY
// ============================================================================

export const Opacity = {
  disabled: 0.38,
  hover: 0.08,
  selected: 0.12,
  focus: 0.24,
  divider: 0.12,
} as const;

// ============================================================================
// Z-INDEX
// ============================================================================

export const ZIndex = {
  appBar: 1100,
  drawer: 1200,
  modal: 1300,
  snackbar: 1400,
  tooltip: 1500,
} as const;

// ============================================================================
// ANIMATION
// ============================================================================

export const Animation = {
  duration: {
    shortest: 150,
    shorter: 200,
    short: 250,
    standard: 300,
    complex: 375,
    enteringScreen: 225,
    leavingScreen: 195,
  },
  easing: {
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  },
} as const;

// ============================================================================
// THEME OBJECT (Main Export)
// ============================================================================

export const Theme = {
  colors: Colors,
  typography: Typography,
  spacing: Spacing,
  borderRadius: BorderRadius,
  shadows: Shadows,
  iconSize: IconSize,
  opacity: Opacity,
  zIndex: ZIndex,
  animation: Animation,
} as const;

// Export type for TypeScript
export type ThemeType = typeof Theme;

export default Theme;
