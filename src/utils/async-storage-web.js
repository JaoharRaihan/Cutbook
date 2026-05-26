/* eslint-disable no-undef */
// AsyncStorage Web Implementation using localStorage with AES-GCM encryption
// NOTE: This file is only used in web browser environments where localStorage is available
// Sensitive data (tokens, auth data) is automatically encrypted using Web Crypto API
import {encrypt, decrypt, shouldEncrypt} from './crypto-web.js';

const AsyncStorage = {
  getItem: async key => {
    try {
      const value = localStorage.getItem(key);
      if (!value) {
        return null;
      }
      // Decrypt if this is a sensitive key
      if (shouldEncrypt(key)) {
        return await decrypt(value);
      }
      return value;
    } catch (error) {
      console.error('AsyncStorage getItem error:', error);
      return null;
    }
  },

  setItem: async (key, value) => {
    try {
      let storageValue = value;
      // Encrypt if this is a sensitive key
      if (shouldEncrypt(key)) {
        storageValue = await encrypt(value);
      }
      localStorage.setItem(key, storageValue);
    } catch (error) {
      console.error('AsyncStorage setItem error:', error);
    }
  },

  removeItem: async key => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('AsyncStorage removeItem error:', error);
    }
  },

  clear: async () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('AsyncStorage clear error:', error);
    }
  },

  getAllKeys: async () => {
    try {
      return Object.keys(localStorage);
    } catch (error) {
      console.error('AsyncStorage getAllKeys error:', error);
      return [];
    }
  },

  multiGet: async keys => {
    try {
      const results = [];
      for (const key of keys) {
        const value = localStorage.getItem(key);
        let decryptedValue = value;
        if (value && shouldEncrypt(key)) {
          decryptedValue = await decrypt(value);
        }
        results.push([key, decryptedValue]);
      }
      return results;
    } catch (error) {
      console.error('AsyncStorage multiGet error:', error);
      return [];
    }
  },

  multiSet: async keyValuePairs => {
    try {
      for (const [key, value] of keyValuePairs) {
        let storageValue = value;
        if (shouldEncrypt(key)) {
          storageValue = await encrypt(value);
        }
        localStorage.setItem(key, storageValue);
      }
    } catch (error) {
      console.error('AsyncStorage multiSet error:', error);
    }
  },

  multiRemove: async keys => {
    try {
      keys.forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('AsyncStorage multiRemove error:', error);
    }
  },
};

export default AsyncStorage;
