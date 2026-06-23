/**
 * smsService.ts
 * Service to send SMS via Bangladesh SMS Gateways (e.g. Greenweb, SSL Wireless, MimSMS)
 */

// ============================================================================
// CONFIGURATION
// ============================================================================
// Set your API details here or read from environment variables.
// Greenweb BD is selected by default as it is the most popular cheap gateway in Bangladesh.
export const SMS_GATEWAY_CONFIG = {
  provider: 'alphasms', // 'greenweb' | 'alphasms' | 'generic_http'
  token: '9SJiOP2Vhu2pGPKF8jhbXJ9906VNKumnhJ9EiaUn', // Replace with your actual Greenweb or AlphaSMS token
  senderId: '', // Optional Sender ID (Masking) if approved by BTRC
  enabled: true, // Set to true once you replace YOUR_GREENWEB_API_TOKEN with a real token
};

export interface SMSSendResult {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Sends an SMS to a Bangladeshi phone number using E.164 formatting
 * @param phone - 11-digit phone number (e.g. '01712345678')
 * @param text - Message body
 */
export const sendSMS = async (phone: string, text: string): Promise<SMSSendResult> => {
  try {
    const cleanedPhone = phone.replace(/\D/g, '');

    // Ensure correct BD format (should start with 8801...)
    const recipient = cleanedPhone.startsWith('88') ? cleanedPhone : `88${cleanedPhone}`;

    const isPlaceholder =
      SMS_GATEWAY_CONFIG.token === 'YOUR_GREENWEB_API_TOKEN' ||
      SMS_GATEWAY_CONFIG.token === 'YOUR_ALPHA_SMS_TOKEN' ||
      !SMS_GATEWAY_CONFIG.token;

    if (!SMS_GATEWAY_CONFIG.enabled || isPlaceholder) {
      // DEVELOPMENT FALLBACK / DEBUG LOGGING
      // Keeps the app fully testable for developers and client demos without spending SMS credits.
      console.log(`[SMS DEBUG] To: ${recipient} | Text: "${text}"`);
      return {
        success: true,
        message: 'SMS Simulated successfully (Dev mode)',
      };
    }

    let url = '';
    if (SMS_GATEWAY_CONFIG.provider === 'greenweb') {
      const messageEncoded = encodeURIComponent(text);
      url = `https://api.greenweb.com.bd/api.php?json&token=${SMS_GATEWAY_CONFIG.token}&to=${recipient}&message=${messageEncoded}`;
      if (SMS_GATEWAY_CONFIG.senderId) {
        url += `&id=${SMS_GATEWAY_CONFIG.senderId}`;
      }
    } else if (SMS_GATEWAY_CONFIG.provider === 'alphasms') {
      const messageEncoded = encodeURIComponent(text);
      url = `https://api.sms.net.bd/sendsms?api_key=${SMS_GATEWAY_CONFIG.token}&msg=${messageEncoded}&to=${recipient}`;
      if (SMS_GATEWAY_CONFIG.senderId) {
        url += `&sender_id=${SMS_GATEWAY_CONFIG.senderId}`;
      }
    } else {
      // Placeholder for other custom/generic gateways
      // e.g. SSL Wireless: https://sms.sslwireless.com.bd/api/v3/send-sms
      throw new Error(`SMS Provider ${SMS_GATEWAY_CONFIG.provider} is not configured.`);
    }

    console.log(`[SMS] Sending request to ${SMS_GATEWAY_CONFIG.provider} for: ${recipient}`);
    const response = await fetch(url);
    const data = await response.json();

    if (SMS_GATEWAY_CONFIG.provider === 'greenweb') {
      // Greenweb returns JSON array with status or message details
      // e.g. [{"status":"RESPONSE_STATUS","statusvalue":"SUCCESS","messageid":"XXXXXX"}]
      if (
        response.ok &&
        data &&
        (data.status === 'SUCCESS' || (Array.isArray(data) && data[0]?.statusvalue === 'SUCCESS'))
      ) {
        return {
          success: true,
          message: 'SMS sent successfully via Gateway',
        };
      } else {
        console.warn('[SMS ERROR RESPONSE]:', data);
        throw new Error(JSON.stringify(data) || 'Gateway returned failure status');
      }
    } else if (SMS_GATEWAY_CONFIG.provider === 'alphasms') {
      // sms.net.bd returns {"error": 0, "msg": "..."}
      // If error is 0, it means success.
      if (
        response.ok &&
        data &&
        (data.error === 0 || data.error === '0' || data.status === 'OK' || data.success === true)
      ) {
        return {
          success: true,
          message: data.msg || data.message || 'SMS sent successfully via AlphaSMS',
        };
      } else {
        console.warn('[SMS ERROR RESPONSE]:', data);
        throw new Error(
          data.msg || data.message || JSON.stringify(data) || 'AlphaSMS returned failure status',
        );
      }
    } else {
      throw new Error(`Unsupported provider: ${SMS_GATEWAY_CONFIG.provider}`);
    }
  } catch (error: any) {
    console.error('Error in sendSMS service:', error);
    return {
      success: false,
      error: error.message || 'Failed to dispatch SMS',
    };
  }
};
