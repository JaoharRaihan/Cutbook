/**
 * usePersistedData.ts
 * Custom hook for data persistence with AsyncStorage
 */

import {useState, useEffect, useCallback} from 'react';
import {saveToStorage, loadFromStorage} from '@/utils/storage';

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook to persist state to AsyncStorage
 * Similar to useState but automatically syncs with AsyncStorage
 */
export function usePersistedState<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prev: T) => T)) => Promise<void>, boolean] {
  const [state, setState] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);

  // Load from storage on mount
  useEffect(() => {
    loadFromStorage<T>(key)
      .then(storedValue => {
        if (storedValue !== null) {
          setState(storedValue);
        }
      })
      .catch(error => {
        console.error(`Error loading persisted state (${key}):`, error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [key]);

  // Save to storage when state changes
  const setPersistedState = useCallback(
    async (value: T | ((prev: T) => T)) => {
      try {
        const newValue = value instanceof Function ? value(state) : value;
        setState(newValue);
        await saveToStorage(key, newValue);
      } catch (error) {
        console.error(`Error saving persisted state (${key}):`, error);
      }
    },
    [key, state],
  );

  return [state, setPersistedState, loading];
}

// ============================================================================
// ARRAY OPERATIONS HOOK
// ============================================================================

/**
 * Hook for persisted array with CRUD operations
 */
export function usePersistedArray<T extends {id: string}>(key: string, initialValue: T[] = []) {
  const [items, setItems, loading] = usePersistedState<T[]>(key, initialValue);

  const addItem = useCallback(
    async (item: T) => {
      await setItems(prev => [...prev, item]);
    },
    [setItems],
  );

  const updateItem = useCallback(
    async (id: string, updates: Partial<T>) => {
      await setItems(prev => prev.map(item => (item.id === id ? {...item, ...updates} : item)));
    },
    [setItems],
  );

  const deleteItem = useCallback(
    async (id: string) => {
      await setItems(prev => prev.filter(item => item.id !== id));
    },
    [setItems],
  );

  const findItem = useCallback(
    (id: string): T | undefined => {
      return items.find(item => item.id === id);
    },
    [items],
  );

  const clearItems = useCallback(async () => {
    await setItems([]);
  }, [setItems]);

  return {
    items,
    loading,
    addItem,
    updateItem,
    deleteItem,
    findItem,
    clearItems,
    setItems,
  };
}

// ============================================================================
// OBJECT OPERATIONS HOOK
// ============================================================================

/**
 * Hook for persisted object with update operations
 */
export function usePersistedObject<T extends Record<string, any>>(key: string, initialValue: T) {
  const [data, setData, loading] = usePersistedState<T>(key, initialValue);

  const updateField = useCallback(
    async <K extends keyof T>(field: K, value: T[K]) => {
      await setData(prev => ({...prev, [field]: value}));
    },
    [setData],
  );

  const updateFields = useCallback(
    async (updates: Partial<T>) => {
      await setData(prev => ({...prev, ...updates}));
    },
    [setData],
  );

  const resetData = useCallback(async () => {
    await setData(initialValue);
  }, [setData, initialValue]);

  return {
    data,
    loading,
    updateField,
    updateFields,
    resetData,
    setData,
  };
}

// ============================================================================
// BATCH LOADING HOOK
// ============================================================================

/**
 * Hook to load multiple keys at once
 */
export function usePersistedBatch<T extends Record<string, any>>(
  keys: Record<keyof T, string>,
  initialValues: T,
) {
  const [data, setData] = useState<T>(initialValues);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const entries = Object.entries(keys) as [keyof T, string][];
        const promises = entries.map(([key, storageKey]) =>
          loadFromStorage(storageKey).then(value => [key, value ?? initialValues[key]]),
        );

        const results = await Promise.all(promises);
        const loadedData = Object.fromEntries(results) as T;
        setData(loadedData);
      } catch (error) {
        console.error('Error loading batch data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  const updateKey = useCallback(
    async <K extends keyof T>(key: K, value: T[K]) => {
      setData(prev => ({...prev, [key]: value}));
      await saveToStorage(keys[key], value);
    },
    [keys],
  );

  return {data, loading, updateKey};
}
