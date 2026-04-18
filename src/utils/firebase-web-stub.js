// Firebase Web Stub for compatibility
// This is a minimal stub to prevent errors when Firebase native modules are imported
// In production, you should implement proper Firebase Web SDK integration

const emptyFunction = () => Promise.resolve();
const emptyObject = {};

// Auth stub
export const auth = () => ({
  signInWithEmailAndPassword: emptyFunction,
  createUserWithEmailAndPassword: emptyFunction,
  signOut: emptyFunction,
  onAuthStateChanged: () => () => {},
  currentUser: null,
});

// Firestore stub
export const firestore = () => ({
  collection: () => ({
    doc: () => ({
      set: emptyFunction,
      get: emptyFunction,
      update: emptyFunction,
      delete: emptyFunction,
      onSnapshot: () => () => {},
    }),
    add: emptyFunction,
    get: emptyFunction,
    where: () => ({
      get: emptyFunction,
      onSnapshot: () => () => {},
    }),
    onSnapshot: () => () => {},
  }),
});

// Default export
export default emptyFunction;

// Re-export common Firebase functions
export const firebase = {
  auth,
  firestore,
  initializeApp: emptyFunction,
  apps: [],
};
