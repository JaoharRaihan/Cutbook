/**
 * Error Reporting Utility
 * Initializes and manages error tracking with Sentry and Firebase Crashlytics
 */

import * as Sentry from '@sentry/react-native';
import {createLogger} from './logger';

const logger = createLogger('ErrorReporting');
const isDev = __DEV__ || process.env.NODE_ENV === 'development';

// Lazy load Crashlytics only when needed (mobile platforms)
let crashlytics: any = null;

try {
  // Try to import Crashlytics - will fail gracefully on web
  crashlytics = require('@react-native-firebase/crashlytics').default;
} catch {
  // Crashlytics not available on this platform
  crashlytics = null;
}

/**
 * Initialize error reporting services
 * Sets up Sentry for all platforms and Firebase Crashlytics for mobile
 */
export function initializeErrorReporting(): void {
  if (isDev) {
    return; // Skip error reporting in development
  }

  try {
    // Initialize Sentry for cross-platform error tracking
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN || 'https://examplePublicKey@o0.ingest.sentry.io/0',
      environment: process.env.NODE_ENV || 'production',
      tracesSampleRate: 0.1, // Sample 10% of transactions
      attachStacktrace: true,
      beforeSend(event) {
        // Filter out sensitive data
        if (event.request) {
          delete event.request.cookies;
          delete event.request.headers;
        }
        return event;
      },
    });

    // Initialize Firebase Crashlytics for mobile
    if (crashlytics) {
      try {
        crashlytics().setCrashlyticsCollectionEnabled(true);
      } catch {
        logger.debug('Firebase Crashlytics initialization failed');
      }
    }

    logger.debug('Error reporting initialized');
  } catch (error) {
    logger.error('Failed to initialize error reporting', error);
  }
}

/**
 * Set user context for error tracking
 * Call after user authentication
 */
export function setErrorReportingUser(userId: string, userEmail?: string): void {
  try {
    Sentry.setUser({
      id: userId,
      email: userEmail,
    });

    // Also set in Firebase Crashlytics for mobile
    if (crashlytics) {
      try {
        crashlytics().setUserId(userId);
        if (userEmail) {
          crashlytics().setAttribute('email', userEmail);
        }
      } catch {
        logger.debug('Failed to set user in Crashlytics');
      }
    }
  } catch (error) {
    console.error('Failed to set error reporting user:', error);
  }
}

/**
 * Clear user context on logout
 */
export function clearErrorReportingUser(): void {
  try {
    Sentry.setUser(null);

    // Also clear in Firebase Crashlytics
    if (crashlytics) {
      try {
        crashlytics().setUserId('');
      } catch {
        logger.debug('Failed to clear user in Crashlytics');
      }
    }
  } catch (error) {
    logger.error('Failed to clear error reporting user', error);
  }
}

/**
 * Capture a custom error event
 * Use for important business logic errors that should be tracked
 */
export function captureError(error: Error | string, context?: Record<string, any>): void {
  if (isDev) {
    return;
  }

  try {
    if (typeof error === 'string') {
      Sentry.captureMessage(error, 'error', {
        contexts: {custom: context},
      });
    } else {
      Sentry.captureException(error, {
        contexts: {custom: context},
      });
    }

    // Also log to Firebase Crashlytics
    if (crashlytics) {
      try {
        const message = error instanceof Error ? error.message : String(error);
        crashlytics().log(message);
      } catch {
        logger.debug('Failed to log error to Crashlytics');
      }
    }
  } catch (e) {
    logger.debug('Failed to capture error', e);
  }
}

/**
 * Set breadcrumb for error tracking context
 * Breadcrumbs help understand what happened before an error
 */
export function addBreadcrumb(
  message: string,
  level: 'debug' | 'info' | 'warning' | 'error' = 'info',
  data?: Record<string, any>,
): void {
  try {
    Sentry.addBreadcrumb({
      message,
      level,
      data,
      timestamp: Date.now() / 1000,
    });
  } catch (e) {
    logger.debug('Failed to add breadcrumb', e);
  }
}

/**
 * Wrap an async function to automatically capture errors
 */
export function withErrorReporting<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  name: string,
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      addBreadcrumb(`Starting: ${name}`, 'info');
      return await fn(...args);
    } catch (error) {
      addBreadcrumb(`Error in: ${name}`, 'error', {
        error: error instanceof Error ? error.message : String(error),
      });
      captureError(error instanceof Error ? error : new Error(String(error)), {
        function: name,
      });
      throw error;
    }
  };
}
