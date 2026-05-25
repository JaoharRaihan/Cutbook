/**
 * LanguageExample.tsx
 * Example component demonstrating i18n usage
 */

import React from 'react';
import {View, Text, ScrollView, StyleSheet} from 'react-native';
import {useLanguage} from '@/context/LanguageContext';
import LanguageToggle, {
  CompactLanguageToggle,
  LanguageListItem,
} from '@/components/UI/LanguageToggle';
import LocalizedText, {CurrencyText, PercentageText, DateText} from '@/components/UI/LocalizedText';
import {
  formatCurrency,
  formatCurrencyShort,
  formatDateWithMonth,
  formatTime,
  formatPercentage,
} from '@/utils/bengaliNumerals';
import AnimatedButton from '@/components/UI/AnimatedButton';

// ============================================================================
// COMPONENT
// ============================================================================

export default function LanguageExample(): React.ReactElement {
  const {language, t} = useLanguage();

  const sampleDate = new Date();
  const sampleAmount = 12345.67;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>i18n Examples</Text>

      {/* Language Toggles */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Language Toggles</Text>

        <Text style={styles.sectionLabel}>Buttons Variant:</Text>
        <LanguageToggle variant="buttons" />

        <Text style={styles.sectionLabel}>Switch Variant:</Text>
        <LanguageToggle variant="switch" />

        <Text style={styles.sectionLabel}>Compact (Header):</Text>
        <CompactLanguageToggle />

        <Text style={styles.sectionLabel}>List Item:</Text>
        <LanguageListItem />
      </View>

      {/* Translation Strings */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Translation Strings</Text>

        <View style={styles.exampleRow}>
          <Text style={styles.label}>Common:</Text>
          <Text style={styles.value}>{t.common.save}</Text>
        </View>

        <View style={styles.exampleRow}>
          <Text style={styles.label}>Auth:</Text>
          <Text style={styles.value}>{t.auth.login}</Text>
        </View>

        <View style={styles.exampleRow}>
          <Text style={styles.label}>Dashboard:</Text>
          <Text style={styles.value}>{t.dashboard.totalIncome}</Text>
        </View>

        <View style={styles.exampleRow}>
          <Text style={styles.label}>Employees:</Text>
          <Text style={styles.value}>{t.employees.addEmployee}</Text>
        </View>
      </View>

      {/* Currency Formatting */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Currency Formatting</Text>

        <View style={styles.exampleRow}>
          <Text style={styles.label}>Full:</Text>
          <CurrencyText amount={sampleAmount} style={styles.value} />
        </View>

        <View style={styles.exampleRow}>
          <Text style={styles.label}>No Symbol:</Text>
          <CurrencyText amount={sampleAmount} showSymbol={false} style={styles.value} />
        </View>

        <View style={styles.exampleRow}>
          <Text style={styles.label}>Short (100K):</Text>
          <CurrencyText amount={123456} short style={styles.value} />
        </View>

        <View style={styles.exampleRow}>
          <Text style={styles.label}>Short (1M):</Text>
          <CurrencyText amount={1234567} short style={styles.value} />
        </View>

        <View style={styles.exampleRow}>
          <Text style={styles.label}>Direct:</Text>
          <Text style={styles.value}>{formatCurrency(sampleAmount, language)}</Text>
        </View>

        <View style={styles.exampleRow}>
          <Text style={styles.label}>Short Direct:</Text>
          <Text style={styles.value}>{formatCurrencyShort(1234567, language)}</Text>
        </View>
      </View>

      {/* Number Formatting */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Number Formatting</Text>

        <View style={styles.exampleRow}>
          <Text style={styles.label}>Simple:</Text>
          <LocalizedText style={styles.value}>12345</LocalizedText>
        </View>

        <View style={styles.exampleRow}>
          <Text style={styles.label}>Percentage:</Text>
          <PercentageText value={15.5} decimals={1} style={styles.value} />
        </View>

        <View style={styles.exampleRow}>
          <Text style={styles.label}>Direct:</Text>
          <Text style={styles.value}>{formatPercentage(25, language)}</Text>
        </View>
      </View>

      {/* Date/Time Formatting */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Date/Time Formatting</Text>

        <View style={styles.exampleRow}>
          <Text style={styles.label}>Short Date:</Text>
          <DateText date={sampleDate} format="short" style={styles.value} />
        </View>

        <View style={styles.exampleRow}>
          <Text style={styles.label}>Long Date:</Text>
          <DateText date={sampleDate} format="long" style={styles.value} />
        </View>

        <View style={styles.exampleRow}>
          <Text style={styles.label}>Time:</Text>
          <DateText date={sampleDate} format="time" style={styles.value} />
        </View>

        <View style={styles.exampleRow}>
          <Text style={styles.label}>Direct:</Text>
          <Text style={styles.value}>{formatDateWithMonth(sampleDate, language)}</Text>
        </View>

        <View style={styles.exampleRow}>
          <Text style={styles.label}>Time Direct:</Text>
          <Text style={styles.value}>{formatTime(sampleDate, language)}</Text>
        </View>
      </View>

      {/* UI Examples */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>UI Examples</Text>

        <AnimatedButton
          title={t.common.save}
          onPress={() => {}}
          variant="primary"
          style={styles.button}
        />

        <AnimatedButton
          title={t.common.cancel}
          onPress={() => {}}
          variant="outline"
          style={styles.button}
        />

        <AnimatedButton
          title={t.common.delete}
          onPress={() => {}}
          variant="danger"
          style={styles.button}
        />
      </View>

      {/* Current Language Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Current Language</Text>
        <Text style={styles.info}>
          Language Code: <Text style={styles.highlight}>{language}</Text>
        </Text>
        <Text style={styles.info}>
          Language Name:{' '}
          <Text style={styles.highlight}>{language === 'en' ? 'English' : 'বাংলা'}</Text>
        </Text>
      </View>
    </ScrollView>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 16,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
    marginTop: 16,
    marginBottom: 8,
  },
  exampleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  label: {
    fontSize: 14,
    color: '#757575',
    flex: 1,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: '#212121',
    flex: 1,
    textAlign: 'right',
  },
  button: {
    marginTop: 8,
  },
  info: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  highlight: {
    fontWeight: '600',
    color: '#2196F3',
  },
});
