/**
 * Logger utility for consistent logging across the app
 * Environment-based filtering with development and production modes
 * Integrates with Sentry for error tracking in production
 */

import * as Sentry from '@sentry/react-native';

declare const process: any;

// Determine if we're in development mode
const isDev = __DEV__ || process.env.NODE_ENV === 'development';

interface LoggerConfig {
  name: string;
}

/**
 * Logger class for structured logging
 * - Development: All logs are printed to console
 * - Production: Only error and warn logs are printed
 *   Error logs are also sent to Sentry for tracking
 */
export class Logger {
  private name: string;

  constructor(config: LoggerConfig) {
    this.name = config.name;
  }

  /**
   * Debug log - only shown in development
   */
  debug(message: string, data?: any): void {
    if (isDev) {
      console.log(`[${this.name}] ${message}`, data || '');
    }
  }

  /**
   * Info log - only shown in development
   */
  info(message: string, data?: any): void {
    if (isDev) {
      console.log(`[${this.name}] ${message}`, data || '');
    }
  }

  /**
   * Warning log - shown in both development and production
   */
  warn(message: string, data?: any): void {
    console.warn(`[${this.name}] ${message}`, data || '');

    // Send warning to Sentry in production
    if (!isDev) {
      Sentry.captureMessage(message, {
        level: 'warning',
        contexts: {
          module: {name: this.name},
          extra: {data},
        },
      });
    }
  }

  /**
   * Error log - shown in both development and production
   * Automatically sent to Sentry/Crashlytics in production for error tracking
   */
  error(message: string, error?: any): void {
    console.error(`[${this.name}] ${message}`, error || '');

    // Send error to Sentry in production
    if (!isDev) {
      try {
        const errorObj = error instanceof Error ? error : new Error(message);
        Sentry.captureException(errorObj, {
          tags: {module: this.name, type: 'context_error'},
          contexts: {
            module: {name: this.name},
          },
        });
      } catch (e) {
        console.error('Failed to capture error in Sentry:', e);
      }
    }
  }
}

/**
 * Create a logger instance
 */
export function createLogger(name: string): Logger {
  return new Logger({name});
}
