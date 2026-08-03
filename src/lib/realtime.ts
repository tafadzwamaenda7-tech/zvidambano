/**
 * Realtime — live channels for real accounts.
 *
 * Only non-demo, signed-in accounts subscribe. Postgres realtime applies RLS,
 * so each subscriber only receives changes to rows they are allowed to SELECT.
 *
 * Three kinds of channel:
 *
 * 1. Table changes (`postgres_changes`) — debounced per burst and handed to the
 *    dashboard as the deduplicated set of tables that changed, so it re-hydrates
 *    only the stores those tables feed.
 * 2. Presence (`presence-<userId>`) — tracks how many devices/tabs this user
 *    has online, which also doubles as a connection-health signal.
 * 3. Broadcast — a per-user channel (`broadcast-<userId>`) that delivers a
 *    force-logout to every other device of the same account, and a shared
 *    channel (`zvida-announce`) that carries admin announcements to everyone.
 */

import { supabase } from './supabase';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { getLiveAccount } from './zvida-live';

const ROLE_TABLES: Record<string, string[]> = {
  farmer: ['contracts', 'deliveries', 'market_orders', 'notifications', 'listings'],
  offtaker: ['contracts', 'deliveries', 'market_orders', 'listings', 'notifications'],
  supplier: ['listings', 'market_orders', 'notifications'],
  driver: ['deliveries', 'contracts', 'notifications'],
  broker: ['listings', 'contracts', 'deliveries', 'payments', 'market_orders', 'notifications'],
  admin: ['listings', 'contracts', 'deliveries', 'payments', 'market_orders', 'notifications'],
  compliance: ['listings', 'contracts', 'deliveries', 'payments', 'market_orders', 'notifications'],
  support: ['notifications'],
};

export interface LiveChannelHandlers {
  /** Called with the deduplicated set of tables changed since the last flush. */
  onTables: (tables: string[]) => void;
  /** Admin announcement received on the shared channel. */
  onAnnounce?: (title: string, body?: string) => void;
  /** Number of devices/tabs this account has online right now. */
  onPresence?: (count: number) => void;
  /** Another device of this account signed out; this device should too. */
  onForceLogout?: () => void;
}

/**
 * Start live subscriptions for the current account. Returns a stop function.
 */
export function startRealtime(h: LiveChannelHandlers): () => void {
  const acc = getLiveAccount();
  if (!acc || acc.isDemo) return () => {};

  const channels: RealtimeChannel[] = [];
  const pending = new Set<string>();
  let timer: number | undefined;

  const flush = () => {
    if (!pending.size) return;
    const touched = [...pending];
    pending.clear();
    h.onTables(touched);
  };

  /* 1. Table changes (debounced) */
  const tables = ROLE_TABLES[acc.role] || [];
  for (const t of tables) {
    const ch = supabase
      .channel(`live-${acc.id}-${t}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: t }, () => {
        pending.add(t);
        window.clearTimeout(timer);
        timer = window.setTimeout(flush, 350);
      })
      .subscribe();
    channels.push(ch);
  }

  /* 2. Presence — this account's devices/tabs online */
  const presence = supabase.channel(`presence-${acc.id}`);
  presence
    .on('presence', { event: 'sync' }, () => {
      h.onPresence?.(Object.keys(presence.presenceState()).length);
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        void presence.track({ user: acc.id, name: acc.name, role: acc.role, online_at: new Date().toISOString() });
      }
    });
  channels.push(presence);

  /* 3a. Broadcast — force logout of this account from every other device */
  const logoutCh = supabase.channel(`broadcast-${acc.id}`);
  logoutCh
    .on('broadcast', { event: 'force-logout' }, (payload) => {
      if ((payload as { user?: string }).user === acc.id) h.onForceLogout?.();
    })
    .subscribe();
  channels.push(logoutCh);

  /* 3b. Broadcast — admin announcements to everyone */
  const announceCh = supabase.channel('zvida-announce');
  announceCh
    .on('broadcast', { event: 'announce' }, (payload) => {
      const a = payload as { title?: string; body?: string };
      if (a.title) h.onAnnounce?.(a.title, a.body);
    })
    .subscribe();
  channels.push(announceCh);

  return () => {
    window.clearTimeout(timer);
    pending.clear();
    channels.forEach((c) => void supabase.removeChannel(c));
  };
}

/**
 * Ask every other device of this account to sign out (sent before this device
 * signs itself out, while the JWT is still valid).
 */
export async function broadcastLogout(userId: string): Promise<void> {
  const acc = getLiveAccount();
  if (!userId || !acc || acc.isDemo) return;
  try {
    const ch = supabase.channel(`broadcast-${userId}`);
    await ch.subscribe();
    await ch.send({ type: 'broadcast', event: 'force-logout', payload: { user: userId } });
    await supabase.removeChannel(ch);
  } catch {
    /* ignore */
  }
}

/**
 * Send an admin announcement to every subscribed dashboard.
 */
export async function broadcastAnnounce(title: string, body?: string): Promise<void> {
  const acc = getLiveAccount();
  if (!acc || acc.isDemo) return;
  try {
    const ch = supabase.channel('zvida-announce');
    await ch.subscribe();
    await ch.send({ type: 'broadcast', event: 'announce', payload: { title, body } });
    await supabase.removeChannel(ch);
  } catch {
    /* ignore */
  }
}

/**
 * Legacy entry point used by main.ts and dashboard-init.ts. Realtime is now
 * started per-dashboard via startRealtime(); this resolves without subscribing
 * so old callers keep working.
 */
export async function initializeRealtimeSubscriptions(): Promise<void> {
  const acc = getLiveAccount();
  if (!acc || acc.isDemo) return;
  startRealtime({ onTables: () => {} });
}
