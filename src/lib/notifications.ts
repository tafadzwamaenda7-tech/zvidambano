/**
 * Notifications — Email, SMS, and in-app notifications
 */

import { supabase } from './supabase';

export async function sendEmailNotification(to: string, type: string, data?: any) {
  const { error } = await supabase.functions.invoke('send-email', {
    body: { to, type, ...data },
  });
  if (error) console.error('[Notifications] Email failed:', error);
}

export async function sendSMSNotification(to: string, message: string) {
  const { error } = await supabase.functions.invoke('send-sms', {
    body: { to, message },
  });
  if (error) console.error('[Notifications] SMS failed:', error);
}

export async function notifyUser(
  userId: string,
  title: string,
  body: string,
  type: string = 'info',
  options?: { email?: boolean; sms?: boolean; phone?: string; url?: string }
) {
  try {
    await supabase.from('notifications').insert({ user_id: userId, title, body, type });
  } catch (err) {
    console.error('[Notifications] In-app failed:', err);
  }

  if (options?.email) {
    const { data: user } = await supabase.from('users').select('email').eq('id', userId).single();
    if (user) {
      await sendEmailNotification(user.email, type, { title, body });
    }
  }

  if (options?.sms && options?.phone) {
    await sendSMSNotification(options.phone, `${title}: ${body}`);
  }

  // Web push (fire-and-forget): only attempted when a signed-in session exists.
  void sendPushNotification(userId, title, body, options?.url);
}

/** Deliver a push to the user's registered browser subscriptions. */
export async function sendPushNotification(userId: string, title: string, body?: string, url?: string) {
  try {
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;
    const { error } = await supabase.functions.invoke('send-push', {
      body: { userId, title, body: body || '', url: url || '/' },
    });
    if (error) console.error('[Notifications] Push failed:', error);
  } catch (err) {
    console.error('[Notifications] Push failed:', err);
  }
}
