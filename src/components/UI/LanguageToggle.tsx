/**
 * LanguageToggle.tsx
 * Language switcher component for English/Bengali
 */

import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import {useLanguage} from '@/context/LanguageContext';
import {Language} from '@/constants/translations';

// ============================================================================
// TYPES
// ============================================================================

export interface LanguageToggleProps {
  variant?: 'switch' | 'buttons' | 'dropdown';
  showLabel?: boolean;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function LanguageToggle({
  variant = 'switch',
  showLabel = true,
}: LanguageToggleProps): React.ReactElement {
  const {language, setLanguage, t} = useLanguage();

  const handleToggle = async (lang: Language) => {
    await setLanguage(lang);
  };

  if (variant === 'buttons') {
    return (
      <View style={styles.buttonsContainer}>
        {showLabel && <Text style={styles.label}>{t.settings.language}</Text>}
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.button, styles.leftButton, language === 'en' && styles.activeButton]}
            onPress={() => handleToggle('en')}
            activeOpacity={0.7}>
            <Text style={[styles.buttonText, language === 'en' && styles.activeButtonText]}>
              English
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.rightButton, language === 'bn' && styles.activeButton]}
            onPress={() => handleToggle('bn')}
            activeOpacity={0.7}>
            <Text style={[styles.buttonText, language === 'bn' && styles.activeButtonText]}>
              বাংলা
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Default: switch variant
  return (
    <View style={styles.switchContainer}>
      {showLabel && <Text style={styles.label}>{t.settings.language}</Text>}
      <TouchableOpacity
        style={[styles.switch, language === 'bn' && styles.switchActive]}
        onPress={() => handleToggle(language === 'en' ? 'bn' : 'en')}
        activeOpacity={0.9}>
        <View style={[styles.switchThumb, language === 'bn' && styles.switchThumbActive]}>
          <Text style={styles.switchText}>{language === 'en' ? 'EN' : 'বাং'}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

// ============================================================================
// COMPACT VERSION (for headers)
// ============================================================================

export function CompactLanguageToggle(): React.ReactElement {
  const {language, setLanguage} = useLanguage();

  return (
    <TouchableOpacity
      style={styles.compactButton}
      onPress={() => setLanguage(language === 'en' ? 'bn' : 'en')}
      activeOpacity={0.7}>
      <Text style={styles.compactText}>{language === 'en' ? '🇬🇧' : '🇧🇩'}</Text>
      <Text style={styles.compactLabel}>{language === 'en' ? 'EN' : 'বাং'}</Text>
    </TouchableOpacity>
  );
}

// ============================================================================
// LIST ITEM VERSION (for settings)
// ============================================================================

export function LanguageListItem(): React.ReactElement {
  const {language, setLanguage, t} = useLanguage();

  return (
    <View style={styles.listItem}>
      <View style={styles.listItemLeft}>
        <Text style={styles.listItemIcon}>🌐</Text>
        <Text style={styles.listItemLabel}>{t.settings.language}</Text>
      </View>

      <TouchableOpacity
        style={styles.listItemRight}
        onPress={() => setLanguage(language === 'en' ? 'bn' : 'en')}
        activeOpacity={0.7}>
        <Text style={styles.listItemValue}>{language === 'en' ? 'English' : 'বাংলা'}</Text>
        <Text style={styles.listItemArrow}>›</Text>
      </TouchableOpacity>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  // Buttons variant
  buttonsContainer: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  leftButton: {
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  rightButton: {
    // No extra styles needed
  },
  activeButton: {
    backgroundColor: '#2196F3',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#757575',
  },
  activeButtonText: {
    color: '#FFFFFF',
  },

  // Switch variant
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  switch: {
    width: 70,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0E0E0',
    padding: 2,
    justifyContent: 'center',
  },
  switchActive: {
    backgroundColor: '#2196F3',
  },
  switchThumb: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  switchThumbActive: {
    alignSelf: 'flex-end',
  },
  switchText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#424242',
  },

  // Compact variant
  compactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  compactText: {
    fontSize: 18,
    marginRight: 6,
  },
  compactLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#424242',
  },

  // List item variant
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 4,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  listItemIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  listItemLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  listItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  listItemValue: {
    fontSize: 15,
    color: '#2196F3',
    fontWeight: '600',
    marginRight: 8,
  },
  listItemArrow: {
    fontSize: 24,
    color: '#BDBDBD',
    fontWeight: '300',
  },
});
