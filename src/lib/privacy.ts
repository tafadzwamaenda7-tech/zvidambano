/**
 * Data Privacy — GDPR/PDPA compliance
 * Export and delete user data
 */

import { supabase } from './supabase';

// Export all user data (GDPR compliance)
export async function exportUserData(userId: string) {
  const [profile, farms, listings, contracts, deliveries, payments, notifications] = await Promise.all([
    supabase.from('users').select('*').eq('id', userId).single(),
    supabase.from('farms').select('*').eq('owner_id', userId),
    supabase.from('listings').select('*').eq('seller_id', userId),
    supabase.from('contracts').select('*').or(`farmer_id.eq.${userId},offtaker_id.eq.${userId},broker_id.eq.${userId}`),
    supabase.from('deliveries').select('*').eq('driver_id', userId),
    supabase.from('payments').select('*').or(`payer_id.eq.${userId},payee_id.eq.${userId}`),
    supabase.from('notifications').select('*').eq('user_id', userId),
  ]);

  return {
    profile: profile.data,
    farms: farms.data,
    listings: listings.data,
    contracts: contracts.data,
    deliveries: deliveries.data,
    payments: payments.data,
    notifications: notifications.data,
    exportedAt: new Date().toISOString(),
  };
}

// Delete user account and all associated data
export async function deleteAccount(userId: string) {
  // Delete from storage first
  const { data: avatar } = await supabase.storage.from('avatars').list(`${userId}/`);
  if (avatar && avatar.length > 0) {
    await supabase.storage.from('avatars').remove(avatar.map(f => `${userId}/${f.name}`));
  }

  // Delete user (cascades to all related tables)
  const { error } = await supabase.from('users').delete().eq('id', userId);
  if (error) throw error;

  // Delete auth user
  const { error: authError } = await supabase.auth.admin.deleteUser(userId);
  if (authError) throw authError;
}