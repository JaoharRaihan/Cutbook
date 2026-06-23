/**
 * ThemeContext.tsx
 * Dark mode theme management
 */

import React, {createContext, useContext, useState, useEffect, useCallback, ReactNode} from 'react';
import {saveThemeMode, loadThemeMode} from '@/utils/storage';
import {createLogger} from '@/utils/logger';
import {LightColors, DarkColors, ThemeColors} from '@/constants/theme';

const logger = createLogger('ThemeContext');

// ============================================================================
// TYPES
// ============================================================================

export type ThemeMode = 'light' | 'dark';

export interface ThemeContextValue {
  isDarkMode: boolean;
  themeMode: ThemeMode;
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleDarkMode: () => Promise<void>;
  isLoading: boolean;
}

// ============================================================================
// CONTEXT
// ============================================================================

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
}

export function ThemeProvider({
  children,
  defaultTheme = 'light',
}: ThemeProviderProps): React.ReactElement {
  const [themeMode, setThemeModeState] = useState<ThemeMode>(defaultTheme);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme on mount
  useEffect(() => {
    loadSavedTheme();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await loadThemeMode();
      if (savedTheme) {
        setThemeModeState(savedTheme);
      }
    } catch (error) {
      logger.error('Error loading theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await saveThemeMode(mode);
      logger.debug(`Theme changed to ${mode}`);
    } catch (error) {
      logger.error('Error saving theme:', error);
    }
  }, []);

  const toggleDarkMode = useCallback(async () => {
    const newMode = themeMode === 'light' ? 'dark' : 'light';
    await setThemeMode(newMode);
  }, [themeMode, setThemeMode]);

  const colors = themeMode === 'dark' ? DarkColors : LightColors;

  const value: ThemeContextValue = {
    isDarkMode: themeMode === 'dark',
    themeMode,
    colors,
    setThemeMode,
    toggleDarkMode,
    isLoading,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

// ============================================================================
// HOOK
// ============================================================================

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
