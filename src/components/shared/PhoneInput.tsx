/**
 * PhoneInput.tsx
 * Phone number input with country code selector
 */

import React, {useState} from 'react';
import {View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, FlatList} from 'react-native';

// ============================================================================
// TYPES
// ============================================================================

interface CountryCode {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

export interface PhoneInputProps {
  value: string;
  onChangeText: (value: string) => void;
  label?: string;
  error?: string;
  placeholder?: string;
  editable?: boolean;
}

// ============================================================================
// DATA
// ============================================================================

const COUNTRY_CODES: CountryCode[] = [
  {code: 'BD', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩'},
  {code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳'},
  {code: 'PK', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰'},
  {code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸'},
  {code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧'},
];

// ============================================================================
// COMPONENT
// ============================================================================

export default function PhoneInput({
  value,
  onChangeText,
  label = 'Phone Number',
  error,
  placeholder = '1712345678',
  editable = true,
}: PhoneInputProps): React.ReactElement {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState<CountryCode>(COUNTRY_CODES[0]);

  const handleCountrySelect = (country: CountryCode) => {
    setSelectedCountry(country);
    setModalVisible(false);
  };

  const renderCountryItem = ({item}: {item: CountryCode}) => (
    <TouchableOpacity style={styles.countryItem} onPress={() => handleCountrySelect(item)}>
      <Text style={styles.countryFlag}>{item.flag}</Text>
      <View style={styles.countryInfo}>
        <Text style={styles.countryName}>{item.name}</Text>
        <Text style={styles.countryDialCode}>{item.dialCode}</Text>
      </View>
      {selectedCountry.code === item.code && <Text style={styles.checkmark}>✓</Text>}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={[styles.inputContainer, error && styles.inputError]}>
        <TouchableOpacity
          style={styles.countrySelector}
          onPress={() => setModalVisible(true)}
          disabled={!editable}>
          <Text style={styles.flag}>{selectedCountry.flag}</Text>
          <Text style={styles.dialCode}>{selectedCountry.dialCode}</Text>
          <Text style={styles.arrow}>▼</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#BDBDBD"
          keyboardType="phone-pad"
          maxLength={15}
          editable={editable}
        />
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Country</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={COUNTRY_CODES}
              renderItem={renderCountryItem}
              keyExtractor={item => item.code}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  inputError: {
    borderColor: '#F44336',
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 16,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    gap: 6,
  },
  flag: {
    fontSize: 20,
  },
  dialCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  arrow: {
    fontSize: 10,
    color: '#757575',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    color: '#212121',
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#212121',
  },
  modalClose: {
    fontSize: 24,
    color: '#757575',
    paddingHorizontal: 8,
  },
  countryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  countryFlag: {
    fontSize: 28,
    marginRight: 16,
  },
  countryInfo: {
    flex: 1,
  },
  countryName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
    marginBottom: 2,
  },
  countryDialCode: {
    fontSize: 14,
    color: '#757575',
  },
  checkmark: {
    fontSize: 20,
    color: '#4CAF50',
    fontWeight: '700',
  },
});
