/**
 * CutBook Theme Configuration
 * Design System: Colors, Typography, Spacing, Shadows
 */

// ============================================================================
// COLORS
// ============================================================================

export const Colors = {
  // Primary - Barber Green / Dark Slate Grey (Dashboard theme)
  primary: {
    50: '#E8F0EE',
    100: '#C9DBD8',
    200: '#A8C4C0',
    300: '#87ADA7',
    400: '#5A8B84',
    500: '#183A37', // Main Primary (Dark Slate Grey)
    600: '#14312E',
    700: '#102725',
    800: '#0C1D1B',
    900: '#071312',
  },

  // Secondary - Burnt Orange (Dashboard pop accents)
  secondary: {
    50: '#FFF8F0',
    100: '#FCE8D3',
    200: '#F8CEAA',
    300: '#F1B07C',
    400: '#EA9352',
    500: '#C44900', // Main Secondary (Burnt Orange)
    600: '#A63E00',
    700: '#873200',
    800: '#692700',
    900: '#4B1C00',
  },

  // Accent - Midnight Violet (Dashboard secondary actions)
  accent: {
    50: '#FDF4F8',
    100: '#F9E2EE',
    200: '#F2BEDB',
    300: '#E48EC0',
    400: '#D262A2',
    500: '#432534', // Main Accent (Midnight Violet)
    600: '#391F2C',
    700: '#2E1924',
    800: '#23131B',
    900: '#190D13',
  },

  // Success - Green
  success: {
    light: '#81C784',
    main: '#4CAF50',
    dark: '#388E3C',
  },

  // Warning - Orange/Amber
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

  // Info - Light Blue / Teal
  info: {
    light: '#4FC3F7',
    main: '#03A9F4',
    dark: '#0288D1',
  },

  // Neutral - Warm sandy wheat gradients (barber salon theme)
  neutral: {
    0: '#FFFFFF',
    50: '#FAF7F2', // Warm off-white
    100: '#F4EDE2', // Warm light beige
    200: '#EFD6AC', // Sandy Wheat (Matches dashboard wheat)
    300: '#DFBE88',
    400: '#CFA665',
    500: '#9E804F',
    600: '#755E39',
    700: '#614E2F',
    800: '#423520',
    900: '#211B10', // Warm black
    1000: '#000000',
  },

  // Text Colors
  text: {
    primary: '#211B10',
    secondary: '#755E39',
    disabled: '#CFA665',
    hint: '#9E804F',
    inverse: '#FFFFFF',
  },

  // Background Colors
  background: {
    default: '#FAF7F2',
    paper: '#FFFFFF',
    dark: '#211B10',
    overlay: 'rgba(33, 27, 16, 0.5)',
  },

  // Border Colors
  border: {
    light: '#EFD6AC', // Sandy Wheat
    main: '#CFA665',
    dark: '#755E39',
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
    haircut: '#183A37',
    shave: '#C44900',
    beard: '#432534',
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

export const LightColors = Colors;

export const DarkColors = {
  ...Colors,
  neutral: {
    0: '#04151F', // Main Ink Black dark mode background
    50: '#0A1E29', // Lighter blue-slate paper
    100: '#102C3C',
    200: '#193C50',
    300: '#234B64',
    400: '#376582',
    500: '#5481A0',
    600: '#7BA1BE',
    700: '#A2C0D6',
    800: '#C9DDEB',
    900: '#ECF4F8',
    1000: '#FFFFFF',
  },
  text: {
    primary: '#FFFFFF',
    secondary: '#A2C0D6',
    disabled: '#5481A0',
    hint: '#376582',
    inverse: '#04151F',
  },
  background: {
    default: '#04151F',
    paper: '#0A1E29',
    dark: '#020B10',
    overlay: 'rgba(4, 21, 31, 0.7)',
  },
  border: {
    light: '#102C3C',
    main: '#193C50',
    dark: '#234B64',
  },
} as const;

export type DeepString<T> = {
  [K in keyof T]: T[K] extends object ? DeepString<T[K]> : string;
};

export type ThemeColors = DeepString<typeof Colors>;

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
