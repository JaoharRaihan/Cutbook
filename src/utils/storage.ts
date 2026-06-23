/**
 * storage.ts
 * AsyncStorage wrapper utilities for data persistence
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {Language} from '@/constants/translations';

// ============================================================================
// STORAGE KEYS
// ============================================================================

export const STORAGE_KEYS = {
  // Auth
  AUTH_TOKEN: '@cutbook:auth_token',
  CURRENT_USER: '@cutbook:current_user',

  // Organization
  CURRENT_ORG: '@cutbook:current_org',
  ORG_USERS: '@cutbook:org_users',
  ORG_SERVICES: '@cutbook:org_services',

  // Data
  WORK_ENTRIES: '@cutbook:work_entries',
  DAILY_SUMMARIES: '@cutbook:daily_summaries',

  // Sync
  LAST_SYNC: '@cutbook:last_sync',
  SYNC_STATUS: '@cutbook:sync_status',

  // Settings
  APP_LANGUAGE: '@cutbook:app_language',
  THEME_MODE: '@cutbook:theme_mode',
  NOTIFICATIONS_ENABLED: '@cutbook:notifications_enabled',
} as const;

// ============================================================================
// GENERIC STORAGE OPERATIONS
// ============================================================================

/**
 * Save data to AsyncStorage
 */
export async function saveToStorage<T>(key: string, data: T): Promise<void> {
  try {
    const jsonValue = JSON.stringify(data);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error saving to storage (${key}):`, error);
    throw error;
  }
}

/**
 * Load data from AsyncStorage
 */
export async function loadFromStorage<T>(key: string): Promise<T | null> {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Error loading from storage (${key}):`, error);
    return null;
  }
}

/**
 * Remove data from AsyncStorage
 */
export async function removeFromStorage(key: string): Promise<void> {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from storage (${key}):`, error);
    throw error;
  }
}

/**
 * Clear all app data from AsyncStorage
 */
export async function clearAllStorage(): Promise<void> {
  try {
    const keys = Object.values(STORAGE_KEYS);
    await AsyncStorage.multiRemove(keys);
  } catch (error) {
    console.error('Error clearing storage:', error);
    throw error;
  }
}

/**
 * Check if key exists in storage
 */
export async function hasKey(key: string): Promise<boolean> {
  try {
    const value = await AsyncStorage.getItem(key);
    return value !== null;
  } catch (error) {
    console.error(`Error checking key existence (${key}):`, error);
    return false;
  }
}

// ============================================================================
// AUTH STORAGE
// ============================================================================

export async function saveAuthToken(token: string): Promise<void> {
  return saveToStorage(STORAGE_KEYS.AUTH_TOKEN, token);
}

export async function loadAuthToken(): Promise<string | null> {
  return loadFromStorage<string>(STORAGE_KEYS.AUTH_TOKEN);
}

export async function clearAuthToken(): Promise<void> {
  return removeFromStorage(STORAGE_KEYS.AUTH_TOKEN);
}

export async function saveCurrentUser(user: any): Promise<void> {
  return saveToStorage(STORAGE_KEYS.CURRENT_USER, user);
}

export async function loadCurrentUser(): Promise<any> {
  return loadFromStorage(STORAGE_KEYS.CURRENT_USER);
}

// ============================================================================
// ORGANIZATION STORAGE
// ============================================================================

export async function saveCurrentOrg(org: any): Promise<void> {
  return saveToStorage(STORAGE_KEYS.CURRENT_ORG, org);
}

export async function loadCurrentOrg(): Promise<any> {
  return loadFromStorage(STORAGE_KEYS.CURRENT_ORG);
}

export async function saveOrgUsers(users: any[]): Promise<void> {
  return saveToStorage(STORAGE_KEYS.ORG_USERS, users);
}

export async function loadOrgUsers(): Promise<any[]> {
  const users = await loadFromStorage<any[]>(STORAGE_KEYS.ORG_USERS);
  return users || [];
}

export async function saveOrgServices(services: any[]): Promise<void> {
  return saveToStorage(STORAGE_KEYS.ORG_SERVICES, services);
}

export async function loadOrgServices(): Promise<any[]> {
  const services = await loadFromStorage<any[]>(STORAGE_KEYS.ORG_SERVICES);
  return services || [];
}

// ============================================================================
// DATA STORAGE
// ============================================================================

export async function saveWorkEntries(entries: any[]): Promise<void> {
  return saveToStorage(STORAGE_KEYS.WORK_ENTRIES, entries);
}

export async function loadWorkEntries(): Promise<any[]> {
  const entries = await loadFromStorage<any[]>(STORAGE_KEYS.WORK_ENTRIES);
  return entries || [];
}

export async function saveDailySummaries(summaries: any[]): Promise<void> {
  return saveToStorage(STORAGE_KEYS.DAILY_SUMMARIES, summaries);
}

export async function loadDailySummaries(): Promise<any[]> {
  const summaries = await loadFromStorage<any[]>(STORAGE_KEYS.DAILY_SUMMARIES);
  return summaries || [];
}

// ============================================================================
// SYNC STORAGE
// ============================================================================

export async function saveLastSync(timestamp: Date): Promise<void> {
  return saveToStorage(STORAGE_KEYS.LAST_SYNC, timestamp.toISOString());
}

export async function loadLastSync(): Promise<Date | null> {
  const timestamp = await loadFromStorage<string>(STORAGE_KEYS.LAST_SYNC);
  return timestamp ? new Date(timestamp) : null;
}

export async function saveSyncStatus(status: 'synced' | 'syncing' | 'offline'): Promise<void> {
  return saveToStorage(STORAGE_KEYS.SYNC_STATUS, status);
}

export async function loadSyncStatus(): Promise<'synced' | 'syncing' | 'offline'> {
  const status = await loadFromStorage<'synced' | 'syncing' | 'offline'>(STORAGE_KEYS.SYNC_STATUS);
  return status || 'offline';
}

// ============================================================================
// SETTINGS STORAGE
// ============================================================================

export async function saveAppLanguage(language: Language): Promise<void> {
  return saveToStorage(STORAGE_KEYS.APP_LANGUAGE, language);
}

export async function loadAppLanguage(): Promise<Language> {
  const language = await loadFromStorage<Language>(STORAGE_KEYS.APP_LANGUAGE);
  return language || 'en';
}

export async function saveThemeMode(mode: 'light' | 'dark'): Promise<void> {
  return saveToStorage(STORAGE_KEYS.THEME_MODE, mode);
}

export async function loadThemeMode(): Promise<'light' | 'dark'> {
  const mode = await loadFromStorage<'light' | 'dark'>(STORAGE_KEYS.THEME_MODE);
  return mode || 'light';
}

export async function saveNotificationsEnabled(enabled: boolean): Promise<void> {
  return saveToStorage(STORAGE_KEYS.NOTIFICATIONS_ENABLED, enabled);
}

export async function loadNotificationsEnabled(): Promise<boolean> {
  const enabled = await loadFromStorage<boolean>(STORAGE_KEYS.NOTIFICATIONS_ENABLED);
  return enabled !== null ? enabled : true;
}

// ============================================================================
// BATCH OPERATIONS
// ============================================================================

/**
 * Save all app data in one operation
 */
export async function saveAllAppData(data: {
  user?: any;
  org?: any;
  users?: any[];
  services?: any[];
  workEntries?: any[];
  summaries?: any[];
}): Promise<void> {
  try {
    const promises: Promise<void>[] = [];

    if (data.user) promises.push(saveCurrentUser(data.user));
    if (data.org) promises.push(saveCurrentOrg(data.org));
    if (data.users) promises.push(saveOrgUsers(data.users));
    if (data.services) promises.push(saveOrgServices(data.services));
    if (data.workEntries) promises.push(saveWorkEntries(data.workEntries));
    if (data.summaries) promises.push(saveDailySummaries(data.summaries));

    await Promise.all(promises);
  } catch (error) {
    console.error('Error saving all app data:', error);
    throw error;
  }
}

/**
 * Load all app data in one operation
 */
export async function loadAllAppData(): Promise<{
  user: any;
  org: any;
  users: any[];
  services: any[];
  workEntries: any[];
  summaries: any[];
  lastSync: Date | null;
  syncStatus: 'synced' | 'syncing' | 'offline';
}> {
  try {
    const [user, org, users, services, workEntries, summaries, lastSync, syncStatus] =
      await Promise.all([
        loadCurrentUser(),
        loadCurrentOrg(),
        loadOrgUsers(),
        loadOrgServices(),
        loadWorkEntries(),
        loadDailySummaries(),
        loadLastSync(),
        loadSyncStatus(),
      ]);

    return {
      user,
      org,
      users,
      services,
      workEntries,
      summaries,
      lastSync,
      syncStatus,
    };
  } catch (error) {
    console.error('Error loading all app data:', error);
    throw error;
  }
}

/**
 * Get storage size (for debugging)
 */
export async function getStorageSize(): Promise<number> {
  try {
    const keys = await AsyncStorage.getAllKeys();
    let totalSize = 0;

    for (const key of keys) {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        totalSize += value.length;
      }
    }

    return totalSize;
  } catch (error) {
    console.error('Error calculating storage size:', error);
    return 0;
  }
}

/**
 * Export all data as JSON (for backup/debugging)
 */
export async function exportAllData(): Promise<string> {
  try {
    const data = await loadAllAppData();
    return JSON.stringify(data, null, 2);
  } catch (error) {
    console.error('Error exporting data:', error);
    throw error;
  }
}
