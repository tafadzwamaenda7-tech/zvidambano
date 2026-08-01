/**
 * Enhanced WebSocket/Realtime — Live updates via Supabase Realtime
 * Extends the existing realtime.ts with more features:
 * - Live chat
 * - Presence (online/offline status)
 * - Broadcast (typing indicators)
 * - Dashboard-specific subscriptions
 * - Connection status monitoring
 */

import { supabase } from './supabase';
import { logger } from './logger';

// ============================================================
// CONNECTION STATUS
// ============================================================

export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting' | 'error';

const statusListeners: ((status: ConnectionStatus) => void)[] = [];
let currentStatus: ConnectionStatus = 'disconnected';

export function onConnectionStatusChange(callback: (status: ConnectionStatus) => void) {
  statusListeners.push(callback);
  callback(currentStatus); // Send current status immediately
  return () => {
    const idx = statusListeners.indexOf(callback);
    if (idx > -1) statusListeners.splice(idx, 1);
  };
}

function updateStatus(status: ConnectionStatus) {
  currentStatus = status;
  logger.info(`[WebSocket] Status: ${status}`);
  statusListeners.forEach(cb => cb(status));
}

// ============================================================
// LIVE CHAT — Real-time messaging
// ============================================================

export function subscribeToChat(
  userId: string,
  otherUserId: string,
  onMessage: (message: any) => void
) {
  const channel = supabase
    .channel(`chat:${userId}:${otherUserId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `or=(and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId}))`,
      },
      (payload: any) => {
        onMessage(payload.new);
      }
    );

  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') updateStatus('connected');
    else if (status === 'CHANNEL_ERROR') updateStatus('error');
    else if (status === 'TIMED_OUT') updateStatus('reconnecting');
    else if (status === 'CLOSED') updateStatus('disconnected');
  });

  return channel;
}

// ============================================================
// PRESENCE — Online/offline status
// ============================================================

export function joinPresence(userId: string, userInfo?: { name?: string; role?: string }) {
  const channel = supabase.channel('presence-all', {
    config: { presence: { key: userId } },
  });

  channel
    .on('presence' as any, { event: 'sync' }, () => {
      const state = channel.presenceState();
      logger.debug(`[WebSocket] Presence sync: ${Object.keys(state).length} users online`);
    })
    .on('presence' as any, { event: 'join' }, ({ key }: any) => {
      logger.info('[WebSocket] User joined:', key);
    })
    .on('presence' as any, { event: 'leave' }, ({ key }: any) => {
      logger.info('[WebSocket] User left:', key);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          user_id: userId,
          online_at: new Date().toISOString(),
          ...userInfo,
        });
        updateStatus('connected');
      }
    });

  return channel;
}

export function getOnlineUsers(): Promise<Record<string, any>> {
  return new Promise((resolve) => {
    const channel = supabase.channel('presence-all');
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        const state = channel.presenceState();
        resolve(state);
      }
    });
  });
}

// ============================================================
// BROADCAST — Typing indicators & real-time events
// ============================================================

export function createTypingIndicator(chatId: string, userId: string) {
  const channel = supabase.channel(`typing:${chatId}`);

  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') updateStatus('connected');
  });

  return {
    // Send typing event
    async typing() {
      await channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: { user_id: userId, timestamp: Date.now() },
      });
    },

    // Send stopped typing event
    async stoppedTyping() {
      await channel.send({
        type: 'broadcast',
        event: 'stopped_typing',
        payload: { user_id: userId },
      });
    },

    // Listen for typing events from others
    onTyping(callback: (userId: string) => void) {
      channel.on('broadcast', { event: 'typing' }, (payload: any) => {
        if (payload.payload.user_id !== userId) {
          callback(payload.payload.user_id);
        }
      });
    },

    // Listen for stopped typing events
    onStoppedTyping(callback: (userId: string) => void) {
      channel.on('broadcast', { event: 'stopped_typing' }, (payload: any) => {
        if (payload.payload.user_id !== userId) {
          callback(payload.payload.user_id);
        }
      });
    },

    // Unsubscribe
    unsubscribe() {
      channel.unsubscribe();
    },
  };
}

// ============================================================
// DASHBOARD-SPECIFIC SUBSCRIPTIONS
// ============================================================

// Farmer dashboard — subscribe to all farmer-related updates
export function subscribeFarmerDashboard(
  farmerId: string,
  callbacks: {
    onContractUpdate?: (contract: any) => void;
    onDeliveryUpdate?: (delivery: any) => void;
    onPaymentUpdate?: (payment: any) => void;
    onNotification?: (notification: any) => void;
    onListingUpdate?: (listing: any) => void;
    onSettlementUpdate?: (settlement: any) => void;
  }
) {
  const channels: any[] = [];

  // Contracts
  if (callbacks.onContractUpdate) {
    const ch = supabase
      .channel(`farmer-contracts:${farmerId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'contracts',
        filter: `farmer_id=eq.${farmerId}`,
      }, (payload: any) => callbacks.onContractUpdate?.(payload.new || payload.old))
      .subscribe();
    channels.push(ch);
  }

  // Deliveries (via contracts)
  if (callbacks.onDeliveryUpdate) {
    const ch = supabase
      .channel(`farmer-deliveries:${farmerId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'deliveries',
      }, (payload: any) => callbacks.onDeliveryUpdate?.(payload.new || payload.old))
      .subscribe();
    channels.push(ch);
  }

  // Payments
  if (callbacks.onPaymentUpdate) {
    const ch = supabase
      .channel(`farmer-payments:${farmerId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'payments',
      }, (payload: any) => callbacks.onPaymentUpdate?.(payload.new || payload.old))
      .subscribe();
    channels.push(ch);
  }

  // Notifications
  if (callbacks.onNotification) {
    const ch = supabase
      .channel(`farmer-notifications:${farmerId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${farmerId}`,
      }, (payload: any) => callbacks.onNotification?.(payload.new))
      .subscribe();
    channels.push(ch);
  }

  // Listings
  if (callbacks.onListingUpdate) {
    const ch = supabase
      .channel(`farmer-listings:${farmerId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'listings',
        filter: `seller_id=eq.${farmerId}`,
      }, (payload: any) => callbacks.onListingUpdate?.(payload.new || payload.old))
      .subscribe();
    channels.push(ch);
  }

  // Settlements
  if (callbacks.onSettlementUpdate) {
    const ch = supabase
      .channel(`farmer-settlements:${farmerId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'farmer_settlements',
        filter: `farmer_id=eq.${farmerId}`,
      }, (payload: any) => callbacks.onSettlementUpdate?.(payload.new || payload.old))
      .subscribe();
    channels.push(ch);
  }

  // Update status
  if (channels.length > 0) updateStatus('connected');

  return {
    unsubscribe: () => channels.forEach(ch => ch.unsubscribe()),
    channels,
  };
}

// Offtaker dashboard — subscribe to offtaker-related updates
export function subscribeOfftakerDashboard(
  offtakerId: string,
  callbacks: {
    onContractUpdate?: (contract: any) => void;
    onDeliveryUpdate?: (delivery: any) => void;
    onInvoiceUpdate?: (invoice: any) => void;
    onNotification?: (notification: any) => void;
    onPaymentUpdate?: (payment: any) => void;
  }
) {
  const channels: any[] = [];

  if (callbacks.onContractUpdate) {
    const ch = supabase
      .channel(`offtaker-contracts:${offtakerId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'contracts',
        filter: `offtaker_id=eq.${offtakerId}`,
      }, (payload: any) => callbacks.onContractUpdate?.(payload.new || payload.old))
      .subscribe();
    channels.push(ch);
  }

  if (callbacks.onDeliveryUpdate) {
    const ch = supabase
      .channel(`offtaker-deliveries:${offtakerId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'deliveries',
      }, (payload: any) => callbacks.onDeliveryUpdate?.(payload.new || payload.old))
      .subscribe();
    channels.push(ch);
  }

  if (callbacks.onInvoiceUpdate) {
    const ch = supabase
      .channel(`offtaker-invoices:${offtakerId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'offtaker_invoices',
        filter: `offtaker_id=eq.${offtakerId}`,
      }, (payload: any) => callbacks.onInvoiceUpdate?.(payload.new || payload.old))
      .subscribe();
    channels.push(ch);
  }

  if (callbacks.onNotification) {
    const ch = supabase
      .channel(`offtaker-notifications:${offtakerId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${offtakerId}`,
      }, (payload: any) => callbacks.onNotification?.(payload.new))
      .subscribe();
    channels.push(ch);
  }

  if (callbacks.onPaymentUpdate) {
    const ch = supabase
      .channel(`offtaker-payments:${offtakerId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'payments',
      }, (payload: any) => callbacks.onPaymentUpdate?.(payload.new || payload.old))
      .subscribe();
    channels.push(ch);
  }

  if (channels.length > 0) updateStatus('connected');

  return {
    unsubscribe: () => channels.forEach(ch => ch.unsubscribe()),
    channels,
  };
}

// Driver dashboard — subscribe to driver-related updates
export function subscribeDriverDashboard(
  driverId: string,
  callbacks: {
    onDeliveryUpdate?: (delivery: any) => void;
    onNotification?: (notification: any) => void;
  }
) {
  const channels: any[] = [];

  if (callbacks.onDeliveryUpdate) {
    const ch = supabase
      .channel(`driver-deliveries:${driverId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'deliveries',
        filter: `driver_id=eq.${driverId}`,
      }, (payload: any) => callbacks.onDeliveryUpdate?.(payload.new || payload.old))
      .subscribe();
    channels.push(ch);
  }

  if (callbacks.onNotification) {
    const ch = supabase
      .channel(`driver-notifications:${driverId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${driverId}`,
      }, (payload: any) => callbacks.onNotification?.(payload.new))
      .subscribe();
    channels.push(ch);
  }

  if (channels.length > 0) updateStatus('connected');

  return {
    unsubscribe: () => channels.forEach(ch => ch.unsubscribe()),
    channels,
  };
}

// ZVIDA broker dashboard — subscribe to all updates
export function subscribeBrokerDashboard(
  brokerId: string,
  callbacks: {
    onContractUpdate?: (contract: any) => void;
    onDeliveryUpdate?: (delivery: any) => void;
    onPaymentUpdate?: (payment: any) => void;
    onCommissionUpdate?: (commission: any) => void;
    onNotification?: (notification: any) => void;
    onListingUpdate?: (listing: any) => void;
    onDisputeUpdate?: (dispute: any) => void;
  }
) {
  const channels: any[] = [];

  if (callbacks.onContractUpdate) {
    const ch = supabase
      .channel(`broker-contracts:${brokerId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'contracts',
        filter: `broker_id=eq.${brokerId}`,
      }, (payload: any) => callbacks.onContractUpdate?.(payload.new || payload.old))
      .subscribe();
    channels.push(ch);
  }

  if (callbacks.onDeliveryUpdate) {
    const ch = supabase
      .channel(`broker-deliveries:${brokerId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'deliveries',
      }, (payload: any) => callbacks.onDeliveryUpdate?.(payload.new || payload.old))
      .subscribe();
    channels.push(ch);
  }

  if (callbacks.onPaymentUpdate) {
    const ch = supabase
      .channel(`broker-payments:${brokerId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'payments',
      }, (payload: any) => callbacks.onPaymentUpdate?.(payload.new || payload.old))
      .subscribe();
    channels.push(ch);
  }

  if (callbacks.onCommissionUpdate) {
    const ch = supabase
      .channel(`broker-commissions:${brokerId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'broker_commission_ledger',
        filter: `broker_id=eq.${brokerId}`,
      }, (payload: any) => callbacks.onCommissionUpdate?.(payload.new || payload.old))
      .subscribe();
    channels.push(ch);
  }

  if (callbacks.onNotification) {
    const ch = supabase
      .channel(`broker-notifications:${brokerId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${brokerId}`,
      }, (payload: any) => callbacks.onNotification?.(payload.new))
      .subscribe();
    channels.push(ch);
  }

  if (callbacks.onListingUpdate) {
    const ch = supabase
      .channel(`broker-listings:${brokerId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'listings',
      }, (payload: any) => callbacks.onListingUpdate?.(payload.new || payload.old))
      .subscribe();
    channels.push(ch);
  }

  if (callbacks.onDisputeUpdate) {
    const ch = supabase
      .channel(`broker-disputes:${brokerId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'disputes',
      }, (payload: any) => callbacks.onDisputeUpdate?.(payload.new || payload.old))
      .subscribe();
    channels.push(ch);
  }

  if (channels.length > 0) updateStatus('connected');

  return {
    unsubscribe: () => channels.forEach(ch => ch.unsubscribe()),
    channels,
  };
}

// ============================================================
// GLOBAL SUBSCRIPTIONS — For admin/overview dashboards
// ============================================================

export function subscribeToAllChanges(callbacks: {
  onAnyChange?: (table: string, event: string, record: any) => void;
}) {
  const tables = [
    'listings', 'contracts', 'deliveries', 'payments',
    'notifications', 'disputes', 'quality_scans', 'price_board',
  ];

  const channels: any[] = [];

  for (const table of tables) {
    const ch = supabase
      .channel(`global-${table}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: table,
      }, (payload: any) => {
        callbacks.onAnyChange?.(table, payload.eventType, payload.new || payload.old);
      })
      .subscribe();
    channels.push(ch);
  }

  updateStatus('connected');

  return {
    unsubscribe: () => channels.forEach(ch => ch.unsubscribe()),
    channels,
  };
}

// ============================================================
// UNSUBSCRIBE ALL
// ============================================================

export function unsubscribeAllChannels() {
  supabase.getChannels().forEach(channel => {
    supabase.removeChannel(channel);
  });
  updateStatus('disconnected');
  logger.info('[WebSocket] All channels unsubscribed');
}

// ============================================================
// RECONNECT — Auto-reconnect on disconnect
// ============================================================

export function setupAutoReconnect() {
  supabase.channel('reconnect-monitor').subscribe((status) => {
    if (status === 'SUBSCRIBED') {
      updateStatus('connected');
    } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
      updateStatus('reconnecting');
      // Supabase auto-reconnects, but we track the status
    } else if (status === 'CLOSED') {
      updateStatus('disconnected');
    }
  });
}