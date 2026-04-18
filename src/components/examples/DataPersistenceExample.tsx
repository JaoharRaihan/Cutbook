/**
 * DataPersistenceExample.tsx
 * Example component showing how to use storage utilities
 */

import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {
  saveToStorage,
  loadFromStorage,
  loadAllAppData,
  getStorageSize,
  STORAGE_KEYS,
} from '@/utils/storage';
import {usePersistedState, usePersistedArray} from '@/hooks/usePersistedData';
import {useSync} from '@/context/SyncContext';
import AnimatedButton from '@/components/UI/AnimatedButton';
import SyncStatusCard from '@/components/UI/SyncStatusCard';

// ============================================================================
// EXAMPLE USAGE COMPONENT
// ============================================================================

export default function DataPersistenceExample(): React.ReactElement {
  const [storageSize, setStorageSize] = useState(0);
  const {startSync} = useSync();

  // Example 1: Simple persisted state
  const [username, setUsername] = usePersistedState('@example:username', 'Guest');

  // Example 2: Persisted array with CRUD
  const {
    items: todos,
    addItem: addTodo,
    deleteItem: deleteTodo,
  } = usePersistedArray<{id: string; text: string; done: boolean}>('@example:todos', []);

  useEffect(() => {
    updateStorageSize();
  }, []);

  const updateStorageSize = async () => {
    const size = await getStorageSize();
    setStorageSize(size);
  };

  const handleAddTodo = async () => {
    await addTodo({
      id: Date.now().toString(),
      text: `Todo ${todos.length + 1}`,
      done: false,
    });
    updateStorageSize();
  };

  const handleLoadAllData = async () => {
    const data = await loadAllAppData();
    console.log('All app data:', data);
  };

  const handleTestSync = async () => {
    await startSync();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Data Persistence Examples</Text>

      {/* Sync Status */}
      <SyncStatusCard />

      {/* Storage Info */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Storage Info</Text>
        <Text style={styles.info}>Size: {(storageSize / 1024).toFixed(2)} KB</Text>
        <AnimatedButton
          title="Refresh Size"
          onPress={updateStorageSize}
          variant="outline"
          size="small"
          style={styles.button}
        />
      </View>

      {/* Persisted State Example */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Persisted State</Text>
        <Text style={styles.info}>Username: {username}</Text>
        <AnimatedButton
          title="Change Username"
          onPress={() => setUsername(`User ${Date.now()}`)}
          variant="primary"
          size="small"
          style={styles.button}
        />
      </View>

      {/* Persisted Array Example */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Persisted Array</Text>
        <Text style={styles.info}>Todos: {todos.length}</Text>
        {todos.map(todo => (
          <View key={todo.id} style={styles.todoItem}>
            <Text style={styles.todoText}>{todo.text}</Text>
            <AnimatedButton
              title="Delete"
              onPress={() => deleteTodo(todo.id)}
              variant="danger"
              size="small"
            />
          </View>
        ))}
        <AnimatedButton
          title="Add Todo"
          onPress={handleAddTodo}
          variant="primary"
          size="small"
          style={styles.button}
        />
      </View>

      {/* Actions */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Actions</Text>
        <AnimatedButton
          title="Load All Data"
          onPress={handleLoadAllData}
          variant="outline"
          size="small"
          style={styles.button}
        />
        <AnimatedButton
          title="Test Sync"
          onPress={handleTestSync}
          variant="primary"
          size="small"
          style={styles.button}
        />
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
    marginBottom: 12,
  },
  info: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
  },
  button: {
    marginTop: 8,
  },
  todoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  todoText: {
    fontSize: 14,
    color: '#424242',
    flex: 1,
  },
});
