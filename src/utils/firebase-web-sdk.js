/**
 * Firebase Web SDK wrapper for Cutbook
 * Provides @react-native-firebase compatible API using Firebase Web SDK
 * This replaces the stub implementation for web platform
 */

import {initializeApp, getApps, getApp} from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  addDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';

// Firebase configuration (from environment or default)
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || 'AIzaSyB4k5gA0Ay-qZPW8K8K0K0K0K0K0K0K0K',
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || 'cutbook-app.firebaseapp.com',
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || 'cutbook-app',
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || 'cutbook-app.appspot.com',
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: process.env.REACT_APP_FIREBASE_APP_ID || '1:123456789:web:abcdefghijk',
};

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Auth with persistence
const authInstance = getAuth(app);
setPersistence(authInstance, browserLocalPersistence).catch(() => {
  // Persistence may fail in some contexts (e.g., private browsing)
  console.warn('Firebase persistence unavailable');
});

// Initialize Firestore
const firestoreInstance = getFirestore(app);

/**
 * Auth function - returns wrapped auth instance
 * Compatible with @react-native-firebase/auth API
 */
export function auth() {
  return {
    // Authentication methods
    signInWithEmailAndPassword: (email, password) =>
      signInWithEmailAndPassword(authInstance, email, password),
    createUserWithEmailAndPassword: (email, password) =>
      createUserWithEmailAndPassword(authInstance, email, password),
    signOut: () => signOut(authInstance),
    onAuthStateChanged: callback => onAuthStateChanged(authInstance, callback),
    currentUser: authInstance.currentUser,
    updateProfile: (user, profile) => updateProfile(user, profile),
    sendPasswordResetEmail: email => sendPasswordResetEmail(authInstance, email),
  };
}

/**
 * Firestore function - returns wrapped Firestore instance
 * Compatible with @react-native-firebase/firestore API
 */
export function firestore() {
  return {
    // Collection reference operations
    collection: collectionName => {
      const collRef = collection(firestoreInstance, collectionName);
      return {
        // Document operations
        doc: docId => {
          const docRef = doc(firestoreInstance, collectionName, docId);
          return {
            // Document CRUD
            set: (data, options) => setDoc(docRef, data, options),
            get: () => getDoc(docRef),
            update: data => updateDoc(docRef, data),
            delete: () => deleteDoc(docRef),
            onSnapshot: (callback, errorCallback) => onSnapshot(docRef, callback, errorCallback),
          };
        },
        // Collection operations
        add: data => addDoc(collRef, data),
        get: () => getDocs(collRef),
        onSnapshot: (callback, errorCallback) => onSnapshot(collRef, callback, errorCallback),
        // Query operations
        where: (fieldPath, operator, value) => {
          const q = query(collRef, where(fieldPath, operator, value));
          return {
            get: () => getDocs(q),
            onSnapshot: (callback, errorCallback) => onSnapshot(q, callback, errorCallback),
          };
        },
      };
    },
    // Batch operations
    batch: () => writeBatch(firestoreInstance),
    // Server timestamp
    serverTimestamp: () => serverTimestamp(),
  };
}

/**
 * App instance export for advanced usage
 */
export {app as firebaseApp};

/**
 * Raw Firebase instances for advanced usage
 */
export {authInstance, firestoreInstance};

// Default export
export default {
  auth,
  firestore,
  firebaseApp: app,
};
