/**
 * Rate Limiter - Correspondance avec Android RateLimiter.kt
 * Protection contre les abus (brute force)
 */

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

const configs: Record<string, RateLimitConfig> = {
  login: { maxAttempts: 5, windowMs: 60_000 },        // 5 per minute
  otp: { maxAttempts: 3, windowMs: 60_000 },          // 3 per minute
  otp_request: { maxAttempts: 3, windowMs: 120_000 }, // 3 per 2 minutes
};

// Storage for attempts (in-memory, persisted to localStorage)
const STORAGE_KEY = 'yonima_rate_limits';

interface AttemptsMap {
  [key: string]: number[];
}

function getAttempts(): AttemptsMap {
  if (typeof window === 'undefined') return {};
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

function saveAttempts(attempts: AttemptsMap): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(attempts));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Check if an attempt is allowed
 * @param key Unique key (e.g., "otp_request:+221771234567")
 * @param type Type of rate limit (login, otp, otp_request)
 */
export function canAttempt(key: string, type: string = 'login'): boolean {
  const config = configs[type];
  if (!config) return true;

  const now = Date.now();
  const windowStart = now - config.windowMs;

  const attempts = getAttempts();
  const keyAttempts = (attempts[key] || []).filter((t) => t > windowStart);

  // Update storage with cleaned attempts
  attempts[key] = keyAttempts;
  saveAttempts(attempts);

  return keyAttempts.length < config.maxAttempts;
}

/**
 * Record an attempt
 */
export function recordAttempt(key: string): void {
  const attempts = getAttempts();
  const keyAttempts = attempts[key] || [];
  keyAttempts.push(Date.now());
  attempts[key] = keyAttempts;
  saveAttempts(attempts);
}

/**
 * Reset attempts for a key
 */
export function resetAttempts(key: string): void {
  const attempts = getAttempts();
  delete attempts[key];
  saveAttempts(attempts);
}

/**
 * Get wait time in seconds before next attempt is allowed
 */
export function getWaitTimeSeconds(key: string, type: string = 'login'): number {
  if (canAttempt(key, type)) return 0;

  const config = configs[type];
  if (!config) return 0;

  const attempts = getAttempts();
  const keyAttempts = attempts[key] || [];
  const oldestAttempt = Math.min(...keyAttempts);
  const waitUntil = oldestAttempt + config.windowMs;

  return Math.ceil((waitUntil - Date.now()) / 1000);
}

/**
 * Clear all rate limit data
 */
export function clearAllLimits(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}
