/**
 * Security utilities for input validation and sanitization
 */

/**
 * Sanitize HTML to prevent XSS attacks
 * Removes potentially dangerous HTML tags and attributes
 */
export const sanitizeHTML = (input: string): string => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Validate and sanitize text input
 * Removes control characters and limits length
 */
export const sanitizeTextInput = (input: string, maxLength: number = 500): string => {
  if (typeof input !== 'string') {
    return '';
  }

  return input
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim()
    .slice(0, maxLength);
};

/**
 * Validate numeric input and ensure it's within bounds
 */
export const validateNumber = (
  value: number | string,
  min: number,
  max: number,
  defaultValue: number
): number => {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num) || !isFinite(num)) {
    return defaultValue;
  }

  return Math.max(min, Math.min(max, num));
};

/**
 * Validate room name
 */
export const validateRoomName = (name: string): string => {
  return sanitizeTextInput(name, 100).replace(/[<>]/g, '');
};

/**
 * Validate chat message
 */
export const validateChatMessage = (message: string): string => {
  return sanitizeTextInput(message, 500);
};

/**
 * Validate and sanitize URL
 */
export const sanitizeURL = (url: string): string => {
  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return '';
    }
    return urlObj.toString();
  } catch {
    return '';
  }
};

/**
 * Rate limiting helper for client-side actions
 */
export class RateLimiter {
  private timestamps: Map<string, number[]> = new Map();

  constructor(private maxAttempts: number, private windowMs: number) {}

  isAllowed(key: string): boolean {
    const now = Date.now();
    const attempts = this.timestamps.get(key) || [];

    const recentAttempts = attempts.filter(
      (timestamp) => now - timestamp < this.windowMs
    );

    if (recentAttempts.length >= this.maxAttempts) {
      return false;
    }

    recentAttempts.push(now);
    this.timestamps.set(key, recentAttempts);

    return true;
  }

  reset(key: string): void {
    this.timestamps.delete(key);
  }
}

/**
 * Content Security Policy helpers
 */
export const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"],
  'style-src': ["'self'", "'unsafe-inline'"],
  'img-src': ["'self'", 'data:', 'https:', 'blob:'],
  'font-src': ["'self'", 'data:'],
  'connect-src': ["'self'", 'https://*.supabase.co', 'wss://*.supabase.co'],
  'media-src': ["'self'", 'https:'],
  'object-src': ["'none'"],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
};
