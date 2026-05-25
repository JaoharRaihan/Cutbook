/**
 * AuthContext - Authentication State Management
 * Handles user authentication using Firebase Auth and Firestore
 */

import React, {createContext, useContext, useState, useEffect, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import type {User, AuthCredentials, RegistrationData} from '@/types';
import {UserRole, UserStatus} from '@/types';
import {STORAGE_KEYS, ERROR_MESSAGES, SUCCESS_MESSAGES} from '@/constants';

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Convert phone number to valid Firebase email format
 * Firebase doesn't accept emails starting with '+'
 * @param phone - Phone number (e.g., '+8801712345678' or '8801712345678')
 * @returns Valid email for Firebase Auth (e.g., 'auth_8801712345678@cutbook.app')
 */
const phoneToFirebaseEmail = (phone: string): string => {
  // Remove + and any non-digit characters except the country code
  const digitsOnly = phone.replace(/\D/g, '');
  return `auth_${digitsOnly}@cutbook.app`;
};

// ============================================================================
// TYPES
// ============================================================================

interface AuthContextValue {
  // State
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  initializing: boolean;
  error: string | null;
  successMessage: string | null;

  // Methods
  login: (credentials: AuthCredentials) => Promise<void>;
  register: (data: RegistrationData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
  clearSuccess: () => void;
}

// ============================================================================
// CONTEXT
// ============================================================================

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({children}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // ============================================================================
  // INITIALIZATION - Listen to Firebase Auth State
  // ============================================================================

  const handleAuthStateChange = useCallback(async (firebaseUser: FirebaseAuthTypes.User | null) => {
    try {
      if (firebaseUser) {
        // User is signed in
        const idToken = await firebaseUser.getIdToken();
        setToken(idToken);
        await fetchUserProfile(firebaseUser.uid);
      } else {
        // User is signed out
        setUser(null);
        setToken(null);
        await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      }
    } catch (err) {
      console.error('❌ Error handling auth state change:', err);
    } finally {
      setInitializing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(handleAuthStateChange);
    return () => unsubscribe();
  }, [handleAuthStateChange]);

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid: string) => {
    try {
      console.log('Fetching user profile for:', uid);
      const userDoc = await firestore().collection('users').doc(uid).get();

      if (userDoc.exists) {
        const userData = userDoc.data() as User;
        // Ensure ID matches
        userData.id = uid;

        // Ensure role is properly set (should never be undefined)
        if (!userData.role || !Object.values(UserRole).includes(userData.role)) {
          console.warn('⚠️ Invalid or missing role for user:', uid, 'Setting to EMPLOYEE');
          userData.role = UserRole.EMPLOYEE;
        }

        // Handle date conversions if necessary (Firestore timestamps)
        if (
          userData.createdAt &&
          typeof userData.createdAt === 'object' &&
          'toDate' in userData.createdAt
        ) {
          userData.createdAt = (userData.createdAt as any).toDate();
        }
        if (
          userData.updatedAt &&
          typeof userData.updatedAt === 'object' &&
          'toDate' in userData.updatedAt
        ) {
          userData.updatedAt = (userData.updatedAt as any).toDate();
        }

        setUser(userData);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
        console.log('✅ User profile loaded:', userData.name, 'Role:', userData.role);
      } else {
        console.warn('⚠️ User document does not exist for uid:', uid);
        // Fallback or handle incomplete registration?
      }
    } catch (err) {
      console.error('❌ Error fetching user profile:', err);
    }
  };

  // ============================================================================
  // LOGIN
  // ============================================================================

  const login = useCallback(async (credentials: AuthCredentials) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Trim password
      const trimmedPassword = credentials.password.trim();

      console.log('🔍 LOGIN - Credentials received:', {
        phone: credentials.phone,
        email: credentials.email,
        passwordLength: trimmedPassword.length,
      });

      // Convert phone to valid Firebase email format
      let emailToUse = credentials.email;

      if (!emailToUse && credentials.phone) {
        emailToUse = phoneToFirebaseEmail(credentials.phone);
      }

      if (!emailToUse) {
        throw new Error('Email or Phone required');
      }

      console.log(
        '📧 LOGIN - Using Firebase email:',
        emailToUse,
        'with password length:',
        trimmedPassword.length,
      );
      await auth().signInWithEmailAndPassword(emailToUse, trimmedPassword);

      // onAuthStateChanged will handle the rest
      setSuccessMessage(SUCCESS_MESSAGES.loginSuccess);
      console.log('✅ Login successful via Firebase');
    } catch (err: any) {
      let errorMessage: string = ERROR_MESSAGES.somethingWentWrong;

      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/invalid-credential'
      ) {
        errorMessage = ERROR_MESSAGES.invalidCredentials;
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (err.code === 'auth/user-disabled') {
        errorMessage = ERROR_MESSAGES.userBlocked;
      } else {
        errorMessage = err.message;
      }

      setError(errorMessage);
      console.error('❌ Login error:', err.code, errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // REGISTER
  // ============================================================================

  const register = useCallback(async (data: RegistrationData) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Trim password
      const trimmedPassword = data.password.trim();

      console.log('📝 REGISTER - User data received:', {
        phone: data.phone,
        email: data.email,
        name: data.name,
        role: data.role,
        passwordLength: trimmedPassword.length,
      });

      // Convert phone to valid Firebase email format if email not provided
      const email = data.email || phoneToFirebaseEmail(data.phone);

      // check if phone is already used in Firestore (since Auth doesn't check custom fields)
      const phoneCheckSnap = await firestore()
        .collection('users')
        .where('phone', '==', data.phone)
        .get();
      if (!phoneCheckSnap.empty) {
        throw new Error(ERROR_MESSAGES.phoneExists);
      }

      // Create Authentication User
      console.log(
        '📧 REGISTER - Creating Firebase auth with email:',
        email,
        'password length:',
        trimmedPassword.length,
      );
      const userCredential = await auth().createUserWithEmailAndPassword(email, trimmedPassword);
      const uid = userCredential.user.uid;

      // Prepare User Model with correct role assignment
      const newUser: User = {
        id: uid,
        orgId: '',
        role: data.role || UserRole.EMPLOYEE, // Ensure role is set, default to EMPLOYEE if missing
        name: data.name,
        phone: data.phone,
        email: email,
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Set commission for employees
      if (newUser.role === UserRole.EMPLOYEE) {
        newUser.commissionPercentage = 10;
      }

      console.log('📋 Creating user document with role:', newUser.role);

      // Create Firestore Document
      await firestore().collection('users').doc(uid).set(newUser);

      // Update Auth profile
      await userCredential.user.updateProfile({
        displayName: data.name,
      });

      setSuccessMessage(SUCCESS_MESSAGES.registrationSuccess);
      console.log('✅ Registration successful for:', uid, 'with role:', newUser.role);
    } catch (err: any) {
      let errorMessage: string = ERROR_MESSAGES.somethingWentWrong;

      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'Email is already in use.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak.';
      } else {
        errorMessage = err.message;
      }

      setError(errorMessage);
      console.error('❌ Registration error:', err.code, errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // LOGOUT
  // ============================================================================

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await auth().signOut();
      // onAuthStateChanged handles state clearing
      console.log('✅ Logout successful');
    } catch (err) {
      console.error('Error during logout:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // UPDATE USER
  // ============================================================================

  const updateUser = useCallback(
    async (data: Partial<User>) => {
      if (!user) {
        throw new Error('No user logged in');
      }

      setLoading(true);
      setError(null);

      try {
        const updatedData = {
          ...data,
          updatedAt: new Date(),
        };

        await firestore().collection('users').doc(user.id).update(updatedData);

        const updatedUser = {...user, ...updatedData};
        setUser(updatedUser);
        await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(updatedUser));

        console.log('✅ User updated:', user.id);
      } catch (err: any) {
        const errorMessage = err.message || ERROR_MESSAGES.somethingWentWrong;
        setError(errorMessage);
        throw new Error(errorMessage);
      } finally {
        setLoading(false);
      }
    },
    [user],
  );

  // ============================================================================
  // PASSWORD RESET
  // ============================================================================

  const resetPassword = useCallback(async (email: string) => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      await auth().sendPasswordResetEmail(email);
      setSuccessMessage('Password reset email sent! Check your inbox.');
      console.log('✅ Password reset email sent to:', email);
    } catch (err: any) {
      let errorMessage: string = ERROR_MESSAGES.somethingWentWrong;

      if (err.code === 'auth/user-not-found') {
        errorMessage = 'No user found with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else {
        errorMessage = err.message;
      }

      setError(errorMessage);
      console.error('❌ Password reset error:', err.code, errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================================
  // CLEAR ERROR & SUCCESS
  // ============================================================================

  const clearError = useCallback(() => setError(null), []);
  const clearSuccess = useCallback(() => setSuccessMessage(null), []);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: AuthContextValue = {
    user,
    token,
    isAuthenticated: !!user, // simplified
    loading,
    initializing,
    error,
    successMessage,
    login,
    register,
    logout,
    updateUser,
    resetPassword,
    clearError,
    clearSuccess,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ============================================================================
// HOOK
// ============================================================================

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
