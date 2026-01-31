'use server';

import { createServerClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import type {
  OtpRequestResponse,
  OtpVerifyResponse,
  AuthErrorType,
  CountryData,
} from '@/types/auth';

/**
 * Parse OTP request errors - Correspondance avec Android parseOtpError()
 */
function parseOtpError(error: string): { message: string; errorType: AuthErrorType } {
  const errorLower = error.toLowerCase();

  // User already exists (for register action)
  if (errorLower.includes('déjà un compte') || errorLower.includes('already exists')) {
    return {
      message: 'Ce numéro a déjà un compte. Connectez-vous.',
      errorType: 'USER_ALREADY_EXISTS',
    };
  }

  // User not found (for login action)
  if (
    errorLower.includes('aucun compte') ||
    errorLower.includes('not found') ||
    errorLower.includes('inscrivez-vous')
  ) {
    return {
      message: "Aucun compte trouvé. Inscrivez-vous d'abord.",
      errorType: 'USER_NOT_FOUND',
    };
  }

  // No WhatsApp on this number
  if (
    errorLower.includes('jid does not exist') ||
    errorLower.includes('not exist on whatsapp') ||
    errorLower.includes('whatsapp')
  ) {
    return {
      message: "Ce numéro n'a pas WhatsApp. Utilisez un autre numéro.",
      errorType: 'NO_WHATSAPP',
    };
  }

  // Rate limited
  if (errorLower.includes('trop de tentatives') || errorLower.includes('rate')) {
    return {
      message: 'Trop de tentatives. Réessayez dans 1 minute.',
      errorType: 'RATE_LIMITED',
    };
  }

  // Invalid phone format
  if (errorLower.includes('invalide') || errorLower.includes('invalid')) {
    return {
      message: 'Format de numéro invalide.',
      errorType: 'INVALID_PHONE',
    };
  }

  return { message: error, errorType: 'UNKNOWN' };
}

/**
 * Parse verify errors - Correspondance avec Android parseVerifyError()
 */
function parseVerifyError(
  error: string | undefined,
  expired: boolean | undefined
): { message: string; errorType: AuthErrorType } {
  if (expired || error?.toLowerCase().includes('expiré') || error?.toLowerCase().includes('expire')) {
    return {
      message: 'Code expiré. Demandez un nouveau code.',
      errorType: 'CODE_EXPIRED',
    };
  }

  if (
    error?.toLowerCase().includes('invalide') ||
    error?.toLowerCase().includes('invalid') ||
    error?.toLowerCase().includes('incorrect')
  ) {
    return {
      message: 'Code incorrect. Vérifiez et réessayez.',
      errorType: 'INVALID_CODE',
    };
  }

  if (error?.toLowerCase().includes('tentatives')) {
    return {
      message: 'Trop de tentatives. Demandez un nouveau code.',
      errorType: 'TOO_MANY_ATTEMPTS',
    };
  }

  if (error?.toLowerCase().includes('aucun code')) {
    return {
      message: 'Aucun code en attente. Demandez un nouveau code.',
      errorType: 'CODE_EXPIRED',
    };
  }

  return { message: error || 'Erreur de vérification', errorType: 'UNKNOWN' };
}

/**
 * Request OTP code - Correspondance avec Android requestOtp()
 * @param phone Phone number with country code (e.g., +221771234567)
 * @param action 'login' or 'register'
 * @param fullName Full name (required for register)
 */
export async function requestOtp(
  phone: string,
  action: 'login' | 'register',
  fullName?: string
): Promise<{
  success: boolean;
  channel?: 'whatsapp' | 'sms';
  error?: string;
  errorType?: AuthErrorType;
}> {
  try {
    // Normalize phone number
    const normalizedPhone = phone.startsWith('+') ? phone : `+${phone}`;

    // Request body for Edge Function
    const requestBody: Record<string, string> = {
      phone: normalizedPhone,
      app_type: 'client', // IMPORTANT: Always "client" for client app
      action,
    };

    // Add full_name for registration
    if (action === 'register' && fullName) {
      requestBody.full_name = fullName;
    }

    // Call the Edge Function
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/simple-otp`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    const result: OtpRequestResponse = await response.json();

    if (result.success) {
      return {
        success: true,
        channel: result.channel || 'whatsapp',
      };
    } else {
      const { message, errorType } = parseOtpError(result.error || 'Erreur inconnue');
      return {
        success: false,
        error: message,
        errorType,
      };
    }
  } catch (error) {
    console.error('OTP Request Error:', error);
    return {
      success: false,
      error: 'Erreur réseau. Vérifiez votre connexion.',
      errorType: 'NETWORK_ERROR',
    };
  }
}

/**
 * Verify OTP code - Correspondance avec Android verifyOtp()
 * @param phone Phone number with country code
 * @param code 6-digit OTP code
 */
export async function verifyOtp(
  phone: string,
  code: string
): Promise<{
  success: boolean;
  userId?: string;
  isNewUser?: boolean;
  error?: string;
  errorType?: AuthErrorType;
}> {
  try {
    // Normalize phone number
    const normalizedPhone = phone.startsWith('+') ? phone : `+${phone}`;

    // Call the Edge Function
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/simple-verify`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          phone: normalizedPhone,
          code,
        }),
      }
    );

    const result: OtpVerifyResponse = await response.json();

    if (result.success && result.access_token) {
      // Set auth cookies for Supabase SSR
      const cookieStore = await cookies();

      // Set the session cookies that Supabase SSR expects
      const maxAge = result.expires_in || 3600;

      cookieStore.set('sb-access-token', result.access_token, {
        path: '/',
        maxAge,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      });

      if (result.refresh_token) {
        cookieStore.set('sb-refresh-token', result.refresh_token, {
          path: '/',
          maxAge: 60 * 60 * 24 * 30, // 30 days
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'lax',
        });
      }

      return {
        success: true,
        userId: result.user_id,
        isNewUser: result.is_new_user,
      };
    } else {
      const { message, errorType } = parseVerifyError(result.error, result.expired);
      return {
        success: false,
        error: message,
        errorType,
      };
    }
  } catch (error) {
    console.error('Verify OTP Error:', error);
    return {
      success: false,
      error: 'Erreur réseau. Vérifiez votre connexion.',
      errorType: 'NETWORK_ERROR',
    };
  }
}

/**
 * Sign out - Clear session
 */
export async function signOut(): Promise<void> {
  const supabase = await createServerClient();
  await supabase.auth.signOut();

  // Clear cookies
  const cookieStore = await cookies();
  cookieStore.delete('sb-access-token');
  cookieStore.delete('sb-refresh-token');
}

/**
 * Get countries list from database
 */
export async function getCountries(): Promise<CountryData[]> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching countries:', error);
      return [];
    }

    return data as CountryData[];
  } catch (error) {
    console.error('Error fetching countries:', error);
    return [];
  }
}

/**
 * Get current user from session
 */
export async function getCurrentUser() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  // Fetch user profile
  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return profile;
}
