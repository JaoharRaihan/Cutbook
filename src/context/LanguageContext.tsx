/**
 * LanguageContext.tsx
 * Language management for English/Bengali support
 */

import React, {createContext, useContext, useState, useEffect, useCallback, ReactNode} from 'react';
import {translations, Language, Translations} from '@/constants/translations';
import {saveAppLanguage, loadAppLanguage} from '@/utils/storage';
import {createLogger} from '@/utils/logger';

const logger = createLogger('LanguageContext');

// ============================================================================
// TYPES
// ============================================================================

export interface LanguageContextValue {
  language: Language;
  t: Translations;
  setLanguage: (lang: Language) => Promise<void>;
  isLoading: boolean;
}

// ============================================================================
// CONTEXT
// ============================================================================

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

// ============================================================================
// PROVIDER
// ============================================================================

export interface LanguageProviderProps {
  children: ReactNode;
  defaultLanguage?: Language;
}

export function LanguageProvider({
  children,
  defaultLanguage = 'en',
}: LanguageProviderProps): React.ReactElement {
  const [language, setLanguageState] = useState<Language>(defaultLanguage);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved language on mount
  useEffect(() => {
    loadSavedLanguage();
  }, []);

  const loadSavedLanguage = async () => {
    try {
      const savedLang = await loadAppLanguage();
      if (savedLang) {
        setLanguageState(savedLang);
      }
    } catch (error) {
      logger.error('Error loading language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = useCallback(async (lang: Language) => {
    try {
      setLanguageState(lang);
      await saveAppLanguage(lang);
    } catch (error) {
      logger.error('Error saving language:', error);
    }
  }, []);

  const t = translations[language];

  const value: LanguageContextValue = {
    language,
    t,
    setLanguage,
    isLoading,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

// ============================================================================
// HOOK
// ============================================================================

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get language name for display
 */
export function getLanguageName(lang: Language): string {
  return lang === 'en' ? 'English' : 'বাংলা';
}

/**
 * Get opposite language (for toggle)
 */
export function getOppositeLanguage(lang: Language): Language {
  return lang === 'en' ? 'bn' : 'en';
}

/**
 * Check if language is RTL (for future support)
 */
export function isRTL(_lang: Language): boolean {
  // Bengali is LTR, but function ready for future RTL languages
  return false;
}
