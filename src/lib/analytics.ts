/**
 * Analytics — Monitoring and performance tracking
 * Logs API calls for monitoring and performance analysis
 */

import { supabase } from './supabase';

// Log API calls for monitoring
export async function logApiCall(endpoint: string, duration: number, success: boolean) {
  if ((import.meta as any).env?.PROD) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('api_logs').insert({
        endpoint,
        duration_ms: duration,
        success,
        user_id: user?.id,
      });
    } catch (e) {
      // Silently fail — don't let analytics break the app
      console.error('[Analytics] Failed to log API call:', e);
    }
  }
}

// Wrap API calls with logging
export async function trackedApiCall<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    await logApiCall(name, Date.now() - start, true);
    return result;
  } catch (error) {
    await logApiCall(name, Date.now() - start, false);
    throw error;
  }
}

// Track user events
export async function trackEvent(event: string, properties?: Record<string, any>) {
  if ((import.meta as any).env?.PROD) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase.from('user_events').insert({
        event,
        properties,
        user_id: user?.id,
      });
    } catch (e) {
      console.error('[Analytics] Failed to track event:', e);
    }
  } else {
    console.log('[Analytics] Event:', event, properties);
  }
}