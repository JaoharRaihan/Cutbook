/**
 * Firebase Crashlytics Web Stub
 * Crashlytics is mobile-only; this provides a web-compatible stub
 */

const noop = () => Promise.resolve();
const noopVoid = () => undefined;

export default {
  setCrashlyticsCollectionEnabled: noop,
  setUserId: noop,
  setAttribute: noop,
  log: noop,
  recordException: noop,
  recordError: noop,
};

export const crashlytics = () => ({
  setCrashlyticsCollectionEnabled: noop,
  setUserId: noop,
  setAttribute: noop,
  log: noop,
  recordException: noop,
  recordError: noop,
});
