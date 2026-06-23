/**
 * Firebase Cloud Messaging Configuration
 *
 * HOW TO GET YOUR FCM SERVER KEY:
 * 1. Go to https://console.firebase.google.com
 * 2. Select your project
 * 3. Project Settings (gear icon) → Service Accounts
 * 4. Click "Generate new private key" → download the JSON file
 * 5. Use the FCM v1 API with OAuth2 access token, OR:
 *    Go to Project Settings → Cloud Messaging → Server Key (Legacy)
 *    and paste it below as FCM_SERVER_KEY.
 *
 * HOW TO GET YOUR FCM PROJECT ID:
 * Firebase Console → Project Settings → General → Project ID
 */

// ============================================================================
// ⚠️  FILL IN YOUR VALUES BELOW
// ============================================================================

/** Firebase Project ID (e.g. "cutbook-12345") */
export const FCM_PROJECT_ID = 'cutbook-15e20';

/**
 * FCM Server Key (Legacy) — available in Firebase Console →
 * Project Settings → Cloud Messaging → Server Key
 * Keep this secret — do not commit to public repos.
 */
export const FCM_SERVER_KEY = 'YOUR_FCM_SERVER_KEY_HERE';

// ============================================================================
// FCM API URLS
// ============================================================================

/** FCM Legacy HTTP API endpoint (works without OAuth) */
export const FCM_LEGACY_API_URL = 'https://fcm.googleapis.com/fcm/send';
