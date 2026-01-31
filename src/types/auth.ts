// Types Auth - Correspondance exacte avec Android AuthRepository.kt

// OTP Channel (WhatsApp ou SMS)
export type OTPChannel = 'whatsapp' | 'sms';

export const OTP_CHANNEL_MESSAGES: Record<OTPChannel, string> = {
  whatsapp: 'Un code a été envoyé sur votre WhatsApp',
  sms: 'Un code a été envoyé par SMS',
};

// Response from simple-otp Edge Function
export interface OtpRequestResponse {
  success: boolean;
  error?: string;
  messageId?: number;
  phone?: string;
  channel?: OTPChannel;
}

// Response from simple-verify Edge Function
export interface OtpVerifyResponse {
  success: boolean;
  valid?: boolean;
  error?: string;
  expired?: boolean;
  attempts_remaining?: number;
  phone?: string;
  phone_formatted?: string;
  user_id?: string;
  is_new_user?: boolean;
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;
}

// Auth Error Types - Correspondance avec Android AuthErrorType
export type AuthErrorType =
  | 'USER_ALREADY_EXISTS'    // Register with existing number
  | 'USER_NOT_FOUND'         // Login with unknown number
  | 'NO_WHATSAPP'            // Number doesn't have WhatsApp
  | 'RATE_LIMITED'           // Too many attempts
  | 'INVALID_PHONE'          // Invalid format
  | 'CODE_EXPIRED'           // OTP expired
  | 'INVALID_CODE'           // Wrong code
  | 'TOO_MANY_ATTEMPTS'      // Too many verification attempts
  | 'NETWORK_ERROR'          // Network error
  | 'UNKNOWN';               // Other error

// Auth States
export type AuthState =
  | { type: 'initial' }
  | { type: 'loading' }
  | { type: 'authenticated'; userId: string }
  | { type: 'unauthenticated' }
  | { type: 'error'; message: string };

// OTP States
export type OtpState =
  | { type: 'idle' }
  | { type: 'sending' }
  | { type: 'sent'; channel: OTPChannel }
  | { type: 'verifying' }
  | { type: 'success'; userId: string }
  | { type: 'error'; message: string; errorType: AuthErrorType };

// Country Data - Correspondance avec Android CountryData
export interface CountryData {
  id: string;
  name: string;
  iso_code: string;
  dial_code: string;
  flag_emoji: string;
  phone_length: number;
  phone_starts_with: string[] | null;
  phone_regex: string | null;
  phone_pattern: string;  // e.g., "XX XXX XX XX"
  phone_placeholder: string;
  display_order: number;
  is_active: boolean;
}

// Default Senegal country
export const DEFAULT_COUNTRY: CountryData = {
  id: 'default-sn',
  name: 'Sénégal',
  iso_code: 'SN',
  dial_code: '+221',
  flag_emoji: '🇸🇳',
  phone_length: 9,
  phone_starts_with: ['7'],
  phone_regex: null,
  phone_pattern: 'XX XXX XX XX',
  phone_placeholder: '7X XXX XX XX',
  display_order: 1,
  is_active: true,
};
