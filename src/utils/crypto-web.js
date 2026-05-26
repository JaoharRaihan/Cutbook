/* eslint-disable no-undef */
/**
 * Web Crypto Utility - AES-GCM Encryption/Decryption for localStorage
 * Uses native Web Crypto API for secure encryption of sensitive data
 * Automatically detects and encrypts/decrypts sensitive keys
 */

// Keys that should always be encrypted when stored
const SENSITIVE_KEYS = [
  'auth_token',
  'user_data',
  'firebase_auth',
  'firebase_token',
  'session_token',
  'refresh_token',
  'password',
  'credentials',
  'API_KEY',
];

// Prefix to mark encrypted values
const ENCRYPTED_PREFIX = '__ENCRYPTED__:';

/**
 * Derive a stable encryption key from the app domain
 * This ensures the same key is used across sessions
 */
async function deriveKey() {
  try {
    // Use a combination of domain and a fixed salt
    const data = new TextEncoder().encode(`cutbook-app-${window.location.hostname}`);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const key = await crypto.subtle.importKey('raw', hashBuffer, {name: 'AES-GCM'}, false, [
      'encrypt',
      'decrypt',
    ]);
    return key;
  } catch (error) {
    console.error('Error deriving encryption key:', error);
    return null;
  }
}

/**
 * Encrypt a value using AES-GCM
 */
async function encrypt(value) {
  try {
    if (!value || typeof value !== 'string') {
      return value;
    }

    const key = await deriveKey();
    if (!key) return value;

    // Generate a random IV (initialization vector) for each encryption
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encoded = new TextEncoder().encode(value);

    const encryptedData = await crypto.subtle.encrypt({name: 'AES-GCM', iv}, key, encoded);

    // Combine IV and encrypted data, encode as base64 for storage
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encryptedData), iv.length);

    const base64 = btoa(String.fromCharCode(...combined));
    return ENCRYPTED_PREFIX + base64;
  } catch (error) {
    console.error('Error encrypting value:', error);
    return value; // Fallback to unencrypted if encryption fails
  }
}

/**
 * Decrypt a value encrypted with AES-GCM
 */
async function decrypt(encryptedValue) {
  try {
    if (!encryptedValue || typeof encryptedValue !== 'string') {
      return encryptedValue;
    }

    // Check if value is encrypted
    if (!encryptedValue.startsWith(ENCRYPTED_PREFIX)) {
      return encryptedValue;
    }

    const key = await deriveKey();
    if (!key) return encryptedValue;

    // Remove prefix and decode base64
    const base64 = encryptedValue.substring(ENCRYPTED_PREFIX.length);
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Extract IV (first 12 bytes) and encrypted data
    const iv = bytes.slice(0, 12);
    const encryptedData = bytes.slice(12);

    const decryptedData = await crypto.subtle.decrypt({name: 'AES-GCM', iv}, key, encryptedData);

    return new TextDecoder().decode(decryptedData);
  } catch (error) {
    console.error('Error decrypting value:', error);
    return encryptedValue; // Return encrypted value if decryption fails
  }
}

/**
 * Check if a key should be encrypted based on naming conventions
 */
function shouldEncrypt(key) {
  if (!key) return false;

  // Direct match against sensitive keys
  if (SENSITIVE_KEYS.includes(key)) {
    return true;
  }

  // Pattern matching for sensitive key names
  const lowerKey = key.toLowerCase();
  return (
    lowerKey.includes('token') ||
    lowerKey.includes('auth') ||
    lowerKey.includes('password') ||
    lowerKey.includes('credential') ||
    lowerKey.includes('secret') ||
    lowerKey.includes('key') ||
    lowerKey.includes('firebase')
  );
}

export {encrypt, decrypt, shouldEncrypt, ENCRYPTED_PREFIX};
