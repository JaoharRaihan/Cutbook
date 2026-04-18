/**
 * NumericInput.tsx
 * Number input with BDT formatting
 */

import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, StyleSheet, TextInputProps} from 'react-native';

// ============================================================================
// TYPES
// ============================================================================

export interface NumericInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  value: number | string;
  onChangeValue: (value: number) => void;
  label?: string;
  error?: string;
  prefix?: string;
  suffix?: string;
  allowDecimal?: boolean;
  maxValue?: number;
  minValue?: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export default function NumericInput({
  value,
  onChangeValue,
  label,
  error,
  prefix = '৳',
  suffix,
  allowDecimal = false,
  maxValue,
  minValue = 0,
  placeholder = '0',
  editable = true,
  ...rest
}: NumericInputProps): React.ReactElement {
  const [displayValue, setDisplayValue] = useState('');

  useEffect(() => {
    if (value === '' || value === 0) {
      setDisplayValue('');
    } else {
      setDisplayValue(String(value));
    }
  }, [value]);

  const handleChangeText = (text: string) => {
    // Remove non-numeric characters (except decimal point if allowed)
    let cleaned = text.replace(/[^0-9.]/g, '');

    // If decimal not allowed, remove decimal point
    if (!allowDecimal) {
      cleaned = cleaned.replace(/\./g, '');
    }

    // Only allow one decimal point
    if (allowDecimal) {
      const parts = cleaned.split('.');
      if (parts.length > 2) {
        cleaned = parts[0] + '.' + parts.slice(1).join('');
      }
    }

    // Limit decimal places to 2
    if (allowDecimal && cleaned.includes('.')) {
      const [integer, decimal] = cleaned.split('.');
      if (decimal.length > 2) {
        cleaned = `${integer}.${decimal.slice(0, 2)}`;
      }
    }

    setDisplayValue(cleaned);

    // Convert to number and validate
    const numericValue = cleaned === '' ? 0 : parseFloat(cleaned);

    // Apply min/max constraints
    let finalValue = numericValue;
    if (maxValue !== undefined && finalValue > maxValue) {
      finalValue = maxValue;
      setDisplayValue(String(maxValue));
    }
    if (finalValue < minValue) {
      finalValue = minValue;
    }

    onChangeValue(finalValue);
  };

  const handleBlur = () => {
    // Format on blur
    if (displayValue === '') {
      return;
    }

    const numericValue = parseFloat(displayValue);
    if (isNaN(numericValue)) {
      setDisplayValue('');
      onChangeValue(0);
    } else {
      // Format with proper decimal places
      const formatted = allowDecimal ? numericValue.toFixed(2) : String(Math.round(numericValue));
      setDisplayValue(formatted);
    }
  };

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}

      <View style={[styles.inputContainer, error && styles.inputError]}>
        {prefix && <Text style={styles.prefix}>{prefix}</Text>}

        <TextInput
          style={styles.input}
          value={displayValue}
          onChangeText={handleChangeText}
          onBlur={handleBlur}
          placeholder={placeholder}
          placeholderTextColor="#BDBDBD"
          keyboardType={allowDecimal ? 'decimal-pad' : 'number-pad'}
          editable={editable}
          {...rest}
        />

        {suffix && <Text style={styles.suffix}>{suffix}</Text>}
      </View>

      {error && <Text style={styles.errorText}>{error}</Text>}

      {(minValue !== undefined || maxValue !== undefined) && (
        <Text style={styles.hint}>
          {minValue !== undefined && maxValue !== undefined
            ? `Range: ${prefix}${minValue} - ${prefix}${maxValue}`
            : minValue !== undefined
              ? `Minimum: ${prefix}${minValue}`
              : `Maximum: ${prefix}${maxValue}`}
        </Text>
      )}
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
    paddingHorizontal: 16,
  },
  inputError: {
    borderColor: '#F44336',
  },
  prefix: {
    fontSize: 18,
    fontWeight: '600',
    color: '#4CAF50',
    marginRight: 8,
  },
  suffix: {
    fontSize: 14,
    fontWeight: '600',
    color: '#757575',
    marginLeft: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#212121',
  },
  errorText: {
    fontSize: 12,
    color: '#F44336',
    marginTop: 4,
    marginLeft: 4,
  },
  hint: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
    marginLeft: 4,
  },
});
