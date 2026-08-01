/**
 * Auth audit logging — best-effort client-side logging of authentication
 * events to public.auth_events (see the add_auth_events_table migration).
 * Failures are swallowed: auditing must never block the auth flow.
 */

import { supabase } from './supabase';

export type AuthEventType =
  | 'login_success'
  | 'login_failure'
  | 'signup_success'
  | 'signup_failure'
  | 'magic_link_sent'
  | 'magic_link_failure'
  | 'password_reset_sent'
  | 'verification_resend';

export interface AuthEventPayload {
  event_type: AuthEventType;
  email?: string;
  user_id?: string | null;
  role?: string;
  metadata?: Record<string, unknown>;
}

export async function logAuthEvent(event: AuthEventPayload): Promise<void> {
  try {
    await supabase.from('auth_events').insert({
      event_type: event.event_type,
      email: event.email || null,
      user_id: event.user_id || null,
      role: event.role || null,
      metadata: event.metadata || {},
    });
  } catch {
    /* never block the auth flow on audit failure */
  }
}
