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
  options?: { email?: boolean; sms?: boolean; phone?: string }
) {
  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    title,
    body,
    type,
  });
  if (error) console.error('[Notifications] In-app failed:', error);

  if (options?.email) {
    const { data: user } = await supabase.from('users').select('email').eq('id', userId).single();
    if (user) {
      await sendEmailNotification(user.email, type, { title, body });
    }
  }

  if (options?.sms && options?.phone) {
    await sendSMSNotification(options.phone, `${title}: ${body}`);
  }
}

export async function getNotifications(userId: string, unreadOnly: boolean = false) {
  let query = supabase.from('notifications').select('*').eq('user_id', userId);
  if (unreadOnly) query = query.eq('read', false);
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function markNotificationRead(id: string) {
  const { data, error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function markAllNotificationsRead(userId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);
  if (error) throw error;
}