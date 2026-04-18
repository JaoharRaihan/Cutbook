/**
 * TestingDashboard.tsx
 * Testing & QA dashboard for manual testing
 */

import React, {useState, useEffect} from 'react';
import {View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert} from 'react-native';
import {
  validateMockDataIntegrity,
  clearAllMockData,
  seedTestData,
  validatePhoneFormat,
  validateEmailFormat,
  validatePrice,
  validateCommission,
  testCommissionCalculation,
  testCurrencyFormatting,
  EdgeCaseData,
  measurePerformance,
  generateLargeDataset,
  delay,
  logTestResults,
  assert,
} from '@/utils/testing';

// ============================================================================
// COMPONENT
// ============================================================================

export default function TestingDashboard(): React.ReactElement {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  // Add test result
  const addResult = (result: string) => {
    setTestResults(prev => [...prev, result]);
  };

  // Clear results
  const clearResults = () => {
    setTestResults([]);
  };

  // ============================================================================
  // TEST SUITES
  // ============================================================================

  /**
   * Test 1: AsyncStorage Data Integrity
   */
  const testDataIntegrity = async () => {
    addResult('\n🧪 Testing AsyncStorage Data Integrity...');
    const result = await validateMockDataIntegrity();

    if (result.valid) {
      addResult('✅ All required data present');
    } else {
      addResult(`❌ Missing: ${result.missing.join(', ')}`);
      addResult(`❌ Errors: ${result.errors.join(', ')}`);
    }
  };

  /**
   * Test 2: Validation Functions
   */
  const testValidations = () => {
    addResult('\n🧪 Testing Validation Functions...');

    let passed = 0;
    let failed = 0;

    // Phone validation
    EdgeCaseData.phoneNumbers.forEach(phone => {
      const valid = validatePhoneFormat(phone);
      const expected = phone === '+8801712345678' || phone === '+8809876543210';
      if (valid === expected) {
        passed++;
        addResult(`✅ Phone: ${phone} → ${valid}`);
      } else {
        failed++;
        addResult(`❌ Phone: ${phone} → ${valid} (expected ${expected})`);
      }
    });

    // Email validation
    EdgeCaseData.emails.forEach(email => {
      const valid = validateEmailFormat(email);
      const expected = email.includes('@') && email.includes('.');
      if (valid === expected) {
        passed++;
        addResult(`✅ Email: ${email} → ${valid}`);
      } else {
        failed++;
        addResult(`❌ Email: ${email} → ${valid} (expected ${expected})`);
      }
    });

    // Price validation
    EdgeCaseData.edgeNumbers.forEach(num => {
      const valid = validatePrice(num);
      const expected = !isNaN(num) && num >= 0 && isFinite(num);
      if (valid === expected) {
        passed++;
        addResult(`✅ Price: ${num} → ${valid}`);
      } else {
        failed++;
        addResult(`❌ Price: ${num} → ${valid} (expected ${expected})`);
      }
    });

    addResult(`\n📊 Validation Tests: ${passed} passed, ${failed} failed`);
  };

  /**
   * Test 3: Commission Calculations
   */
  const testCommissions = () => {
    addResult('\n🧪 Testing Commission Calculations...');

    const testCases = [
      {price: 100, percentage: 10},
      {price: 500, percentage: 20},
      {price: 1000, percentage: 15.5},
      {price: 0, percentage: 10},
      {price: 100, percentage: 0},
      {price: 100, percentage: 100},
    ];

    let passed = 0;
    let failed = 0;

    testCases.forEach(({price, percentage}) => {
      const result = testCommissionCalculation(price, percentage);
      if (result.valid) {
        passed++;
        addResult(`✅ Price: ৳${price}, ${percentage}% → Commission: ৳${result.commission}`);
      } else {
        failed++;
        addResult(`❌ Price: ৳${price}, ${percentage}% → Invalid calculation`);
      }
    });

    addResult(`\n📊 Commission Tests: ${passed} passed, ${failed} failed`);
  };

  /**
   * Test 4: Currency Formatting
   */
  const testCurrency = () => {
    addResult('\n🧪 Testing Currency Formatting...');

    const amounts = [0, 100, 1234.56, 100000, 1000000, 10000000];
    let passed = 0;
    let failed = 0;

    amounts.forEach(amount => {
      const result = testCurrencyFormatting(amount);
      if (result.valid) {
        passed++;
        addResult(`✅ ${amount} → ${result.formatted} (${result.short})`);
        addResult(`   Bengali: ${result.bengali}`);
      } else {
        failed++;
        addResult(`❌ ${amount} → Invalid formatting`);
      }
    });

    addResult(`\n📊 Currency Tests: ${passed} passed, ${failed} failed`);
  };

  /**
   * Test 5: Performance Tests
   */
  const testPerformance = async () => {
    addResult('\n🧪 Testing Performance...');

    // Test large list generation
    await measurePerformance(async () => {
      const data = generateLargeDataset(1000);
      addResult(`✅ Generated 1000 items: ${data.length} items`);
    }, 'Large Dataset Generation');

    // Test async delay
    await measurePerformance(async () => {
      await delay(100);
      addResult('✅ Delay function works');
    }, '100ms Delay');

    addResult('📊 Performance tests complete');
  };

  /**
   * Test 6: Edge Case Names
   */
  const testEdgeCaseNames = () => {
    addResult('\n🧪 Testing Edge Case Names...');

    EdgeCaseData.longNames.forEach(name => {
      const length = name.length;
      const willOverflow = length > 30;
      addResult(
        `${willOverflow ? '⚠️' : '✅'} Name length: ${length} chars${
          willOverflow ? ' (may overflow)' : ''
        }`,
      );
    });

    EdgeCaseData.specialCharacters.forEach(name => {
      addResult(`✅ Special char: "${name}"`);
    });
  };

  /**
   * Run All Tests
   */
  const runAllTests = async () => {
    setIsRunning(true);
    clearResults();

    addResult('🚀 Starting Test Suite...');
    addResult('=' + '='.repeat(50));

    try {
      await testDataIntegrity();
      testValidations();
      testCommissions();
      testCurrency();
      await testPerformance();
      testEdgeCaseNames();

      addResult('\n' + '=' + '='.repeat(50));
      addResult('✅ All tests complete!');
    } catch (error) {
      addResult(`\n❌ Test error: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  // ============================================================================
  // DATA MANAGEMENT
  // ============================================================================

  const handleClearData = () => {
    Alert.alert('Clear All Data', 'This will delete all mock data from AsyncStorage. Continue?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearAllMockData();
          addResult('🗑️ All data cleared');
        },
      },
    ]);
  };

  const handleSeedData = async () => {
    await seedTestData();
    addResult('🌱 Test data seeded');
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🧪 Testing Dashboard</Text>
        <Text style={styles.subtitle}>Manual QA & Edge Case Testing</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={runAllTests}
          disabled={isRunning}>
          <Text style={styles.buttonText}>{isRunning ? '⏳ Running...' : '▶️ Run All Tests'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={clearResults}>
          <Text style={styles.buttonTextSecondary}>🗑️ Clear Results</Text>
        </TouchableOpacity>
      </View>

      {/* Individual Test Buttons */}
      <View style={styles.testButtons}>
        <TouchableOpacity style={styles.testButton} onPress={testDataIntegrity}>
          <Text style={styles.testButtonText}>Data Integrity</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.testButton} onPress={testValidations}>
          <Text style={styles.testButtonText}>Validations</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.testButton} onPress={testCommissions}>
          <Text style={styles.testButtonText}>Commissions</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.testButton} onPress={testCurrency}>
          <Text style={styles.testButtonText}>Currency</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.testButton} onPress={testPerformance}>
          <Text style={styles.testButtonText}>Performance</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.testButton} onPress={testEdgeCaseNames}>
          <Text style={styles.testButtonText}>Edge Cases</Text>
        </TouchableOpacity>
      </View>

      {/* Data Management */}
      <View style={styles.dataActions}>
        <TouchableOpacity style={[styles.button, styles.successButton]} onPress={handleSeedData}>
          <Text style={styles.buttonText}>🌱 Seed Test Data</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.dangerButton]} onPress={handleClearData}>
          <Text style={styles.buttonText}>🗑️ Clear All Data</Text>
        </TouchableOpacity>
      </View>

      {/* Results Console */}
      <View style={styles.console}>
        <Text style={styles.consoleTitle}>Test Results:</Text>
        <ScrollView style={styles.consoleScroll}>
          {testResults.length === 0 ? (
            <Text style={styles.consoleEmpty}>
              No tests run yet. Press "Run All Tests" to start.
            </Text>
          ) : (
            testResults.map((result, index) => (
              <Text key={index} style={styles.consoleText}>
                {result}
              </Text>
            ))
          )}
        </ScrollView>
      </View>
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#212121',
  },
  subtitle: {
    fontSize: 14,
    color: '#757575',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#2196F3',
  },
  secondaryButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  successButton: {
    backgroundColor: '#4CAF50',
  },
  dangerButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  buttonTextSecondary: {
    fontSize: 15,
    fontWeight: '600',
    color: '#757575',
  },
  testButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 8,
  },
  testButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  testButtonText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2196F3',
  },
  dataActions: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  console: {
    flex: 1,
    margin: 16,
    backgroundColor: '#1E1E1E',
    borderRadius: 8,
    overflow: 'hidden',
  },
  consoleTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  consoleScroll: {
    flex: 1,
    padding: 12,
  },
  consoleEmpty: {
    fontSize: 14,
    color: '#757575',
    fontStyle: 'italic',
  },
  consoleText: {
    fontSize: 13,
    color: '#E0E0E0',
    fontFamily: 'Courier',
    marginBottom: 4,
  },
});
