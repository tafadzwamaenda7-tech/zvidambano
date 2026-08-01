/**
 * Auth validation — single source of truth for the input rules used by the
 * login, signup and password-reset flows. Pure functions, no DOM access.
 */

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_RE = /^(\+263|0)[7-8][0-9]{8}$/;

export interface PasswordPolicy {
  minLength: number;
  requireLower: boolean;
  requireUpper: boolean;
  requireNumber: boolean;
  requireSymbol: boolean;
}

export const PASSWORD_POLICY: PasswordPolicy = {
  minLength: 8,
  requireLower: true,
  requireUpper: true,
  requireNumber: true,
  requireSymbol: true,
};

export interface PasswordCheckResult {
  len: boolean;
  lower: boolean;
  upper: boolean;
  num: boolean;
  sym: boolean;
}

export function passwordChecks(pw: string): PasswordCheckResult {
  return {
    len: pw.length >= PASSWORD_POLICY.minLength,
    lower: /[a-z]/.test(pw),
    upper: /[A-Z]/.test(pw),
    num: /[0-9]/.test(pw),
    sym: /[^A-Za-z0-9]/.test(pw),
  };
}

/** 0–5: one point per satisfied rule. */
export function passwordScore(pw: string): number {
  const c = passwordChecks(pw);
  return Number(c.len) + Number(c.lower) + Number(c.upper) + Number(c.num) + Number(c.sym);
}

/** Minimum gate: length rule plus at least two of the remaining rules. */
export function isPasswordStrongEnough(pw: string): boolean {
  const c = passwordChecks(pw);
  const extras = Number(c.lower) + Number(c.upper) + Number(c.num) + Number(c.sym);
  return c.len && extras >= 2;
}

export function strengthLabel(score: number): { text: string; color: string } {
  if (score <= 1) return { text: 'Too weak — add length & variety.', color: '#ef4444' };
  if (score === 2) return { text: 'Weak — try a longer passphrase.', color: '#f97316' };
  if (score === 3) return { text: 'Okay — almost there.', color: '#eab308' };
  if (score === 4) return { text: 'Strong — well done.', color: '#22c55e' };
  return { text: 'Very strong.', color: '#059669' };
}

export function isValidEmail(value: string): boolean {
  return EMAIL_RE.test(value.trim());
}

export function isValidPhone(value: string): boolean {
  return PHONE_RE.test(value.trim());
}

/** Rejects passwords that trivially reuse the user's email local-part or names. */
export function passwordContainsPersonalInfo(pw: string, email: string, names: string[]): boolean {
  const lower = pw.toLowerCase();
  const parts = [email.split('@')[0], ...names].filter(Boolean).map((s) => s.toLowerCase().trim());
  return parts.some((part) => part.length >= 3 && lower.includes(part));
}

export const ACCEPTED_DOC_TYPES = ['pdf', 'jpg', 'jpeg', 'png'];
export const MAX_DOC_SIZE = 5 * 1024 * 1024;

/** Returns an error message string ('' when the document is acceptable). */
export function validateDocument(file: { name: string; size: number }): string {
  const ext = (file.name.split('.').pop() || '').toLowerCase();
  if (!ACCEPTED_DOC_TYPES.includes(ext)) return 'Only PDF, JPG or PNG files are allowed.';
  if (file.size > MAX_DOC_SIZE) return 'File must be 5 MB or smaller.';
  return '';
}

const HIBP_ENDPOINT = 'https://api.pwnedpasswords.com/range/';

/**
 * Checks a password against the Have I Been Pwned breach corpus using
 * k-anonymity: only the first 5 chars of the SHA-1 hash leave the browser.
 * Fails open (returns false) when offline or the service is unreachable.
 */
export async function isPasswordBreached(pw: string): Promise<boolean> {
  if (!pw || typeof crypto === 'undefined' || !crypto.subtle) return false;
  try {
    const digest = await crypto.subtle.digest('SHA-1', new TextEncoder().encode(pw));
    const hex = Array.from(new Uint8Array(digest))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')
      .toUpperCase();
    const prefix = hex.slice(0, 5);
    const suffix = hex.slice(5);
    const res = await fetch(`${HIBP_ENDPOINT}${prefix}`, { headers: { 'Add-Padding': 'true' } });
    if (!res.ok) return false;
    const body = await res.text();
    return body.split('\r\n').some((line) => line.split(':')[0] === suffix);
  } catch {
    return false;
  }
}
