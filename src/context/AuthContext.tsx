/**
 * AuthContext - Authentication State Management
 * Handles user authentication using Firebase Auth and Firestore
 */

import React, {createContext, useContext, useState, useEffect, useCallback} from 'react';
import {Alert} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {FirebaseAuthTypes} from '@react-native-firebase/auth';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import functions from '@react-native-firebase/functions';
import messaging from '@react-native-firebase/messaging';
import type {User, AuthCredentials, RegistrationData} from '@/types';
import {UserRole, UserStatus} from '@/types';
import {STORAGE_KEYS, ERROR_MESSAGES, SUCCESS_MESSAGES} from '@/constants';
import {createLogger} from '@/utils/logger';
import {setErrorReportingUser, clearErrorReportingUser} from '@/utils/error-reporting';
import {saveFCMToken, clearFCMToken} from '@/services/fcmService';
import * as smsService from '@/services/smsService';
import {useLanguage} from './LanguageContext';

const logger = createLogger('AuthContext');

// ============================================================================
// CONFIGURATION FOR FREE PLAN FALLBACK
// ============================================================================
// If you do not have a credit card for the Firebase Blaze plan, you can host
// a free serverless function on Netlify/Vercel (which are 100% free) and put its URL here.
// Set enabled: true to use the free external API instead of Firebase Cloud Functions.
export const FREE_PLAN_RESET_CONFIG = {
  enabled: false, // Set to false to use standard Firebase Cloud Functions
  apiUrl: 'https://cutbook.vercel.app/api/reset-password', // Change this to your Vercel or Netlify site URL once deployed
};

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Clean phone number to 11 digits format (e.g. 01712345678)
 * @param phone - Phone number string
 * @returns 11-digit normalized string
 */
export const normalizePhone = (phone: string): string => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 13 && cleaned.startsWith('8801')) {
    return cleaned.slice(2);
  }
  if (cleaned.length === 10 && cleaned.startsWith('1')) {
    return '0' + cleaned;
  }
  return cleaned;
};

/**
 * Get all possible formats of a phone number for DB query compatibility
 * @param phone - Phone number string
 * @returns Array of possible formats
 */
export const getPhoneFormats = (phone: string): string[] => {
  const normalized = normalizePhone(phone);
  if (!normalized) return [];
  return [normalized, `88${normalized}`, `+88${normalized}`];
};

/**
 * Convert phone number to valid Firebase email format
 * Firebase doesn't accept emails starting with '+'
 * @param phone - Phone number (e.g., '+8801712345678' or '8801712345678')
 * @returns Valid email for Firebase Auth (e.g., 'auth_8801712345678@cutbook.app')
 */
const phoneToFirebaseEmail = (phone: string): string => {
  const normalized = normalizePhone(phone);
  return `auth_${normalized}@cutbook.app`;
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
  sendPhoneOTP: (phone: string) => Promise<any>;
  verifyPhoneOTPAndLink: (code: string, registrationData: RegistrationData) => Promise<void>;
  verifyPhoneOTPForReset: (phone: string, code: string) => Promise<void>;
  updatePasswordAfterReset: (phone: string, newPassword: string) => Promise<void>;
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
  const {language} = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch user profile from Firestore
  const fetchUserProfile = useCallback(async (uid: string) => {
    try {
      logger.debug('Fetching user profile for:', uid);
      const userDoc = await firestore().collection('users').doc(uid).get();

      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        // Ensure ID matches
        userData.id = uid;

        // Ensure role is properly set (should never be undefined)
        if (!userData.role || !Object.values(UserRole).includes(userData.role)) {
          logger.warn(`Invalid or missing role for user: ${uid}. Setting to EMPLOYEE`);
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
        // Set user context for error reporting
        setErrorReportingUser(userData.id, userData.email);
        logger.debug('User profile loaded:', userData.name);

        // Save FCM token for this user so they can receive push notifications
        try {
          const fcmToken = await messaging().getToken();
          if (fcmToken) {
            await saveFCMToken(uid, fcmToken);
            logger.debug('FCM token saved on login');
          }
        } catch (fcmErr) {
          logger.warn('Could not save FCM token (non-fatal):', fcmErr);
        }
      } else {
        logger.warn('User document does not exist for uid:', uid);
        // Fallback or handle incomplete registration?
      }
    } catch (err) {
      logger.error('Error fetching user profile:', err);
    }
  }, []);

  // ============================================================================
  // INITIALIZATION - Listen to Firebase Auth State
  // ============================================================================

  const handleAuthStateChange = useCallback(
    async (firebaseUser: FirebaseAuthTypes.User | null) => {
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
          clearErrorReportingUser();
          await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
          await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
        }
      } catch (err) {
        logger.error('Error handling auth state change:', err);
      } finally {
        setInitializing(false);
      }
    },
    [fetchUserProfile],
  );

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(handleAuthStateChange);
    return () => unsubscribe();
  }, [handleAuthStateChange]);

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

      logger.debug('Login attempt with credentials');

      // Convert phone to valid Firebase email format
      let emailToUse = credentials.email;

      if (!emailToUse && credentials.phone) {
        // Query Firestore users collection by phone formats to get the actual email
        const formats = getPhoneFormats(credentials.phone);
        const userCheckSnap = await firestore()
          .collection('users')
          .where('phone', 'in', formats)
          .get();

        if (!userCheckSnap.empty) {
          const normalized = normalizePhone(credentials.phone);
          const standardDoc = userCheckSnap.docs.find(d => d.data().phone === normalized);
          const matchedDoc = standardDoc || userCheckSnap.docs[0];
          emailToUse = matchedDoc.data().email;
        } else {
          emailToUse = phoneToFirebaseEmail(credentials.phone);
        }
      }

      if (!emailToUse) {
        throw new Error('Email or Phone required');
      }

      logger.debug('Attempting Firebase authentication');
      await auth().signInWithEmailAndPassword(emailToUse, trimmedPassword);

      // onAuthStateChanged will handle the rest
      setSuccessMessage(SUCCESS_MESSAGES.loginSuccess);
      logger.debug('Login successful');
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
      logger.error(`Login error: ${err.code}`, errorMessage);
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

      logger.debug('Register attempt with new user data');

      // Convert phone to valid Firebase email format if email not provided
      const email = data.email || phoneToFirebaseEmail(data.phone);
      const cleanedPhone = normalizePhone(data.phone);

      // check if phone is already used in Firestore (since Auth doesn't check custom fields)
      const phoneCheckSnap = await firestore()
        .collection('users')
        .where('phone', 'in', getPhoneFormats(data.phone))
        .get();
      if (!phoneCheckSnap.empty) {
        throw new Error(ERROR_MESSAGES.phoneExists);
      }

      // Create Authentication User
      logger.debug('Creating Firebase auth user');
      const userCredential = await auth().createUserWithEmailAndPassword(email, trimmedPassword);
      const uid = userCredential.user.uid;

      // Prepare User Model with correct role assignment
      const newUser: User = {
        id: uid,
        orgId: '',
        role: data.role || UserRole.EMPLOYEE, // Ensure role is set, default to EMPLOYEE if missing
        name: data.name,
        phone: cleanedPhone,
        email: email,
        status: UserStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Set commission for employees
      if (newUser.role === UserRole.EMPLOYEE) {
        newUser.commissionPercentage = 10;
      }

      logger.debug('Creating user Firestore document');

      // Create Firestore Document
      await firestore().collection('users').doc(uid).set(newUser);

      // Update Auth profile
      await userCredential.user.updateProfile({
        displayName: data.name,
      });

      setSuccessMessage(SUCCESS_MESSAGES.registrationSuccess);
      logger.debug('Registration successful');
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
      logger.error('Registration error:', errorMessage);
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
      // Clear FCM token before signing out so this device stops receiving pushes
      const currentUser = await auth().currentUser;
      if (currentUser?.uid) {
        await clearFCMToken(currentUser.uid).catch(() => {});
      }
      await auth().signOut();
      // onAuthStateChanged handles state clearing
      logger.debug('Logout successful');
    } catch (err) {
      logger.error('Error during logout:', err);
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

        logger.debug('User updated');
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
      logger.debug('Password reset email sent');
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
      logger.error('Password reset error:', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const sendPhoneOTP = useCallback(
    async (phone: string) => {
      setLoading(true);
      setError(null);
      try {
        const cleanedPhone = normalizePhone(phone);
        // Google Play / Test number bypass
        const isTestNumber =
          cleanedPhone === '01700000000' ||
          cleanedPhone === '01800000000' ||
          cleanedPhone === '01712345678';
        const code = isTestNumber
          ? '123456'
          : Math.floor(100000 + Math.random() * 900000).toString();

        const now = new Date();
        const expiresAt = new Date(now.getTime() + 5 * 60 * 1000).toISOString(); // 5 mins expiration

        logger.debug('Saving custom OTP in Firestore');
        await firestore().collection('otps').add({
          phone: cleanedPhone,
          code,
          createdAt: firestore.FieldValue.serverTimestamp(),
          expiresAt,
          verified: false,
        });

        const messageText =
          language === 'bn'
            ? `আপনার কাটবুক ওটিপি কোড হলো: ${code}। কোডটি ৫ মিনিটের জন্য কার্যকর থাকবে।`
            : `Your Cutbook verification code is: ${code}. Valid for 5 minutes.`;

        const isSimulation =
          !smsService.SMS_GATEWAY_CONFIG.enabled ||
          smsService.SMS_GATEWAY_CONFIG.token === 'YOUR_GREENWEB_API_TOKEN' ||
          smsService.SMS_GATEWAY_CONFIG.token === 'YOUR_ALPHA_SMS_TOKEN' ||
          !smsService.SMS_GATEWAY_CONFIG.token;

        if (!isTestNumber && !isSimulation) {
          logger.debug('Sending custom OTP via Bangladesh SMS Gateway API');
          const smsRes = await smsService.sendSMS(cleanedPhone, messageText);
          if (!smsRes.success) {
            throw new Error(smsRes.error || 'Failed to dispatch SMS through gateway');
          }
        } else {
          logger.debug('Skipping SMS dispatch (Simulation mode or Test Number)');
        }

        // Display dialog to client for testability/transparency
        if (isSimulation) {
          Alert.alert(
            'OTP Sent',
            `Verification code sent to +88${cleanedPhone}\n\n(For testing, code is: ${code})`,
          );
        } else {
          Alert.alert('OTP Sent', `Verification code sent to +88${cleanedPhone}`);
        }

        return true;
      } catch (err: any) {
        logger.error('Error sending custom phone OTP:', err);
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [language],
  );

  const verifyPhoneOTPAndLink = useCallback(
    async (code: string, registrationData: RegistrationData) => {
      setLoading(true);
      setError(null);
      try {
        const cleanedPhone = normalizePhone(registrationData.phone);
        const now = new Date().toISOString();

        logger.debug('Verifying custom OTP code in Firestore:', code);
        const snapshot = await firestore()
          .collection('otps')
          .where('phone', '==', cleanedPhone)
          .where('code', '==', code)
          .where('verified', '==', false)
          .get();

        if (snapshot.empty) {
          throw new Error('Invalid verification code');
        }

        let isValid = false;
        let matchingDocId = '';

        for (const doc of snapshot.docs) {
          const data = doc.data();
          if (data.expiresAt && data.expiresAt > now) {
            isValid = true;
            matchingDocId = doc.id;
            break;
          }
        }

        if (!isValid) {
          throw new Error('Verification code has expired');
        }

        // Mark code as verified
        await firestore().collection('otps').doc(matchingDocId).update({
          verified: true,
          verifiedAt: firestore.FieldValue.serverTimestamp(),
        });

        // OTP is verified! Now create Firebase Auth account
        const email = registrationData.email || `auth_${cleanedPhone}@cutbook.app`;
        const trimmedPassword = registrationData.password.trim();

        logger.debug('Creating Firebase Auth user via Email/Password');
        const userCredential = await auth().createUserWithEmailAndPassword(email, trimmedPassword);
        const uid = userCredential.user.uid;

        // Prepare User Model
        const newUser: User = {
          id: uid,
          orgId: '',
          role: registrationData.role || UserRole.EMPLOYEE,
          name: registrationData.name,
          phone: cleanedPhone,
          email: email,
          status: UserStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        if (newUser.role === UserRole.EMPLOYEE) {
          newUser.commissionPercentage = 10;
        }

        logger.debug('Creating user Firestore document');
        await firestore().collection('users').doc(uid).set(newUser);

        // Update display name
        await userCredential.user.updateProfile({
          displayName: registrationData.name,
        });

        // Load user profile
        await fetchUserProfile(uid);
        setSuccessMessage('Registration completed successfully!');
      } catch (err: any) {
        logger.error('Error verifying custom OTP and registering:', err);
        setError(err.message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchUserProfile],
  );

  const verifyPhoneOTPForReset = useCallback(async (phone: string, code: string) => {
    setLoading(true);
    setError(null);
    try {
      const cleanedPhone = normalizePhone(phone);
      const now = new Date().toISOString();

      logger.debug('Verifying reset OTP code in Firestore:', code);
      const snapshot = await firestore()
        .collection('otps')
        .where('phone', '==', cleanedPhone)
        .where('code', '==', code)
        .where('verified', '==', false)
        .get();

      if (snapshot.empty) {
        throw new Error('Invalid verification code');
      }

      let isValid = false;
      let matchingDocId = '';

      for (const doc of snapshot.docs) {
        const data = doc.data();
        if (data.expiresAt && data.expiresAt > now) {
          isValid = true;
          matchingDocId = doc.id;
          break;
        }
      }

      if (!isValid) {
        throw new Error('Verification code has expired');
      }

      // Mark code as verified
      await firestore().collection('otps').doc(matchingDocId).update({
        verified: true,
        verifiedAt: firestore.FieldValue.serverTimestamp(),
      });

      setSuccessMessage('Phone verified successfully.');
    } catch (err: any) {
      logger.error('Error verifying custom OTP for reset:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePasswordAfterReset = useCallback(async (phone: string, newPassword: string) => {
    setLoading(true);
    setError(null);
    try {
      const cleanedPhone = normalizePhone(phone);

      if (FREE_PLAN_RESET_CONFIG.enabled) {
        logger.debug('Calling external reset-password API for:', cleanedPhone);
        const response = await fetch(FREE_PLAN_RESET_CONFIG.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: cleanedPhone,
            newPassword: newPassword.trim(),
          }),
        });

        const resData = (await response.json().catch(() => ({}))) as any;
        if (!response.ok || !resData.success) {
          throw new Error(resData.error || 'Failed to reset password via external API.');
        }
      } else {
        logger.debug('Calling resetPassword Cloud Function for:', cleanedPhone);

        // Call the Firebase Cloud Function — it uses the Admin SDK to update
        // the Firebase Auth password after confirming a verified OTP exists.
        const resetFn = functions().httpsCallable('resetPassword');
        await resetFn({phone: cleanedPhone, newPassword: newPassword.trim()});
      }

      setSuccessMessage('Password reset successfully!');
    } catch (err: any) {
      logger.error('Error in updatePasswordAfterReset:', err);
      // Firebase Functions errors surface as err.message from the function
      let message = err?.details?.message || err?.message || 'Failed to reset password.';
      if (
        !FREE_PLAN_RESET_CONFIG.enabled &&
        (err.code === 'functions/not-found' ||
          err.code === 'not-found' ||
          message === 'NOT_FOUND' ||
          message.includes('not-found'))
      ) {
        message =
          'The password reset service was not found on Firebase. Please ensure you have deployed Cloud Functions to your project by running: cd functions && npm run build && firebase deploy --only functions';
      }
      setError(message);
      throw new Error(message);
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
    sendPhoneOTP,
    verifyPhoneOTPAndLink,
    verifyPhoneOTPForReset,
    updatePasswordAfterReset,
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
