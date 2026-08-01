/**
 * Auth error catalog — centralised friendly messages and the suggested
 * recovery action for each failure mode, shared by login and signup.
 */

export interface AuthErrorInfo {
  message: string;
  action?: 'create-account' | 'sign-in';
}

const ACCOUNT_NOT_FOUND_RE = /invalid login credentials|no user found|password.*incorrect|user.*not.*exist|not registered/i;
const ALREADY_REGISTERED_RE = /already registered|already exists/i;
const UNCONFIRMED_RE = /email not confirmed|unconfirmed/i;
const RATE_LIMIT_RE = /rate limit|too many/i;

export function loginError(message: string): AuthErrorInfo {
  const raw = message.trim();
  if (ACCOUNT_NOT_FOUND_RE.test(raw)) {
    return {
      message: "We couldn't find an account with those email and password details. Double-check them, or create a new account below.",
      action: 'create-account',
    };
  }
  if (UNCONFIRMED_RE.test(raw)) {
    return { message: 'Your email address has not been confirmed yet. Check your inbox for the confirmation link.' };
  }
  if (RATE_LIMIT_RE.test(raw)) {
    return { message: 'Too many attempts. Please wait a moment and try again.' };
  }
  return { message: raw || 'Login failed. Please check your details.' };
}

export function signupError(message: string): AuthErrorInfo {
  const raw = message.trim();
  if (ALREADY_REGISTERED_RE.test(raw)) {
    return { message: 'This email is already registered. Please sign in instead.', action: 'sign-in' };
  }
  if (RATE_LIMIT_RE.test(raw)) {
    return { message: 'Sign-up is temporarily unavailable. Please try again in a few minutes.' };
  }
  if (/invalid/i.test(raw) && /email/i.test(raw)) {
    return { message: 'Please enter a valid email address.' };
  }
  return { message: raw || 'Sign-up failed. Please try again.' };
}

export function resetError(message: string): string {
  const raw = message.trim();
  if (RATE_LIMIT_RE.test(raw)) return 'Too many requests. Please wait a moment and try again.';
  if (ACCOUNT_NOT_FOUND_RE.test(raw)) return "We couldn't find an account with that email.";
  return raw || 'Could not send reset link. Please try again.';
}

export function resendError(message: string): string {
  const raw = message.trim();
  if (RATE_LIMIT_RE.test(raw)) return 'Too many requests. Please wait a few minutes and try again.';
  return raw || 'Could not resend the email.';
}

export function magicLinkError(message: string): string {
  const raw = message.trim();
  if (ACCOUNT_NOT_FOUND_RE.test(raw)) return "We couldn't find an account with that email. Try signing up instead.";
  if (RATE_LIMIT_RE.test(raw)) return 'Too many requests. Please wait a few minutes and try again.';
  return raw || 'Could not send the sign-in link. Please try again.';
}
