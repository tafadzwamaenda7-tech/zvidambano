/**
 * Real-Time Subscriptions Manager
 * Subscribes to Supabase changes and emits events through the event bus
 */

import { supabase } from './supabase';
import { eventBus, Events } from './event-bus';
import { getCurrentUser } from './supabase';

let subscriptions: { [key: string]: any } = {};

/**
 * Subscribe to listing changes using RealtimeChannel
 */
export async function subscribeToListings() {
  if (subscriptions['listings']) return;

  console.log('[Realtime] Subscribing to listings...');

  const channel = supabase.channel('listings:all').on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'listings',
    },
    (payload: any) => {
      console.log('[Realtime] Listing event:', payload.eventType, payload.new);

      if (payload.eventType === 'INSERT') {
        Events.listingCreated(payload.new);
      } else if (payload.eventType === 'UPDATE') {
        Events.listingUpdated(payload.new);
      } else if (payload.eventType === 'DELETE') {
        Events.listingDeleted(payload.old);
      }
    }
  );

  await channel.subscribe();
  subscriptions['listings'] = channel;
}

/**
 * Subscribe to contract changes using RealtimeChannel
 */
export async function subscribeToContracts() {
  if (subscriptions['contracts']) return;

  console.log('[Realtime] Subscribing to contracts...');

  const channel = supabase.channel('contracts:all').on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'contracts',
    },
    (payload: any) => {
      console.log('[Realtime] Contract event:', payload.eventType, payload.new);

      if (payload.eventType === 'INSERT') {
        Events.contractCreated(payload.new);
      } else if (payload.eventType === 'UPDATE') {
        const contract = payload.new;
        Events.contractUpdated(contract);

        // Also emit specific status change event
        if (payload.old?.status !== contract.status) {
          Events.contractStatusChanged({
            id: contract.id,
            oldStatus: payload.old?.status,
            newStatus: contract.status,
            contract,
          });
        }
      }
    }
  );

  await channel.subscribe();
  subscriptions['contracts'] = channel;
}

/**
 * Subscribe to delivery changes using RealtimeChannel
 */
export async function subscribeToDeliveries() {
  if (subscriptions['deliveries']) return;

  console.log('[Realtime] Subscribing to deliveries...');

  const channel = supabase.channel('deliveries:all').on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'deliveries',
    },
    (payload: any) => {
      console.log('[Realtime] Delivery event:', payload.eventType, payload.new);

      if (payload.eventType === 'INSERT') {
        Events.deliveryCreated(payload.new);
      } else if (payload.eventType === 'UPDATE') {
        const delivery = payload.new;
        Events.deliveryUpdated(delivery);

        if (payload.old?.status !== delivery.status) {
          Events.deliveryStatusChanged({
            id: delivery.id,
            oldStatus: payload.old?.status,
            newStatus: delivery.status,
            delivery,
          });
        }
      }
    }
  );

  await channel.subscribe();
  subscriptions['deliveries'] = channel;
}

/**
 * Subscribe to payment changes using RealtimeChannel
 */
export async function subscribeToPayments() {
  if (subscriptions['payments']) return;

  console.log('[Realtime] Subscribing to payments...');

  const channel = supabase.channel('payments:all').on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'payments',
    },
    (payload: any) => {
      console.log('[Realtime] Payment event:', payload.eventType, payload.new);

      if (payload.eventType === 'INSERT') {
        Events.paymentCreated(payload.new);
      } else if (payload.eventType === 'UPDATE') {
        const payment = payload.new;
        Events.paymentUpdated(payment);

        if (payload.old?.status !== payment.status) {
          Events.paymentStatusChanged({
            id: payment.id,
            oldStatus: payload.old?.status,
            newStatus: payment.status,
            payment,
          });
        }
      }
    }
  );

  await channel.subscribe();
  subscriptions['payments'] = channel;
}

/**
 * Subscribe to notifications for current user using RealtimeChannel
 */
export async function subscribeToNotifications() {
  if (subscriptions['notifications']) return;

  const user = await getCurrentUser();
  if (!user) return;

  console.log('[Realtime] Subscribing to notifications...');

  const channel = supabase.channel(`notifications:${user.id}`).on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'notifications',
      filter: `user_id=eq.${user.id}`,
    },
    (payload: any) => {
      console.log('[Realtime] New notification:', payload.new);
      Events.notificationNew(payload.new);
    }
  );

  await channel.subscribe();
  subscriptions['notifications'] = channel;
}

/**
 * Initialize all real-time subscriptions
 */
export async function initializeRealtimeSubscriptions() {
  try {
    console.log('[Realtime] Initializing all subscriptions...');

    await Promise.all([
      subscribeToListings(),
      subscribeToContracts(),
      subscribeToDeliveries(),
      subscribeToPayments(),
      subscribeToNotifications(),
    ]);

    console.log('[Realtime] All subscriptions initialized');
  } catch (error) {
    console.error('[Realtime] Error initializing subscriptions:', error);
  }
}

/**
 * Unsubscribe from a specific channel
 */
export function unsubscribe(channel: string) {
  if (subscriptions[channel]) {
    subscriptions[channel].unsubscribe();
    delete subscriptions[channel];
    console.log(`[Realtime] Unsubscribed from ${channel}`);
  }
}

/**
 * Unsubscribe from all channels
 */
export function unsubscribeAll() {
  Object.keys(subscriptions).forEach((key) => {
    subscriptions[key].unsubscribe();
  });
  subscriptions = {};
  console.log('[Realtime] Unsubscribed from all channels');
}
