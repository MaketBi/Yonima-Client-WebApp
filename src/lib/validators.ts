/**
 * Input Validators - Correspondance avec Android InputValidator.kt
 * Validation et sanitization des entrées utilisateur
 */

export const ErrorMessages = {
  INVALID_PHONE: 'Format de numéro invalide',
  INVALID_OTP: 'Le code doit contenir 6 chiffres',
  INVALID_NAME: 'Le nom doit contenir entre 2 et 50 caractères',
} as const;

/**
 * Sanitize phone number - remove all non-digit characters except +
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, '');
}

/**
 * Validate international phone number format
 */
export function isValidPhone(phone: string): boolean {
  const sanitized = sanitizePhone(phone);
  return /^\+[0-9]{10,15}$/.test(sanitized);
}

/**
 * Validate Senegal phone number format
 */
export function isValidSenegalPhone(phone: string): boolean {
  const sanitized = sanitizePhone(phone);
  return /^(\+221|221)?7[0-9]{8}$/.test(sanitized);
}

/**
 * Sanitize OTP code - keep only digits, max 6
 */
export function sanitizeOTP(code: string): string {
  return code.replace(/\D/g, '').slice(0, 6);
}

/**
 * Validate OTP code format (6 digits)
 */
export function isValidOTP(code: string): boolean {
  const sanitized = sanitizeOTP(code);
  return sanitized.length === 6;
}

/**
 * Sanitize name - keep only letters, spaces, hyphens, apostrophes
 */
export function sanitizeName(name: string): string {
  return name
    .replace(/[^\p{L}\p{N}\s\-']/gu, '')
    .trim();
}

/**
 * Validate name (2-50 characters)
 */
export function isValidName(name: string): boolean {
  const sanitized = sanitizeName(name);
  return sanitized.length >= 2 && sanitized.length <= 50;
}

/**
 * Normalize phone number with + prefix
 */
export function normalizePhone(phone: string): string {
  const sanitized = sanitizePhone(phone);
  return sanitized.startsWith('+') ? sanitized : `+${sanitized}`;
}

/**
 * Format phone number for display based on pattern
 * @param phone Raw phone number (digits only, without country code)
 * @param pattern Pattern like "XX XXX XX XX"
 */
export function formatPhoneDisplay(phone: string, pattern: string): string {
  const digits = phone.replace(/\D/g, '');
  let result = '';
  let digitIndex = 0;

  for (const char of pattern) {
    if (digitIndex >= digits.length) break;
    if (char === 'X') {
      result += digits[digitIndex];
      digitIndex++;
    } else {
      result += char;
    }
  }

  return result;
}

/**
 * Check if phone is complete based on expected length
 */
export function isPhoneComplete(phone: string, expectedLength: number): boolean {
  const digits = phone.replace(/\D/g, '');
  return digits.length === expectedLength;
}
