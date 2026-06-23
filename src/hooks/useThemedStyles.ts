import {useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {useTheme} from '@/context';
import {ThemeColors} from '@/constants/theme';

/**
 * A custom hook to dynamically generate themed stylesheets in functional components.
 * Rebuilds the stylesheet only when the active theme colors change.
 *
 * @param stylesFactory A function that returns a stylesheet definition using the provided colors.
 */
export function useThemedStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  stylesFactory: (colors: ThemeColors, isDarkMode: boolean) => T,
): T {
  const {colors, isDarkMode} = useTheme();
  return useMemo(() => stylesFactory(colors, isDarkMode), [colors, isDarkMode, stylesFactory]);
}

export default useThemedStyles;
