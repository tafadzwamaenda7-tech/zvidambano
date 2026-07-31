/**
 * Real-time Event Bus for Cross-Dashboard Communication
 * Handles subscriptions, state changes, and notifications
 */

type EventCallback = (data: any) => void;

interface EventListener {
  callback: EventCallback;
  unsubscribe: () => void;
}

type EventType =
  | 'listing:created'
  | 'listing:updated'
  | 'listing:deleted'
  | 'contract:created'
  | 'contract:updated'
  | 'contract:status-changed'
  | 'delivery:created'
  | 'delivery:updated'
  | 'delivery:status-changed'
  | 'payment:created'
  | 'payment:updated'
  | 'payment:status-changed'
  | 'notification:new'
  | 'user:updated'
  | 'auth:changed';

class EventBus {
  private listeners: Map<EventType, Set<EventCallback>> = new Map();

  /**
   * Subscribe to an event
   */
  subscribe(eventType: EventType, callback: EventCallback): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }

    this.listeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  /**
   * Emit an event to all listeners
   */
  emit(eventType: EventType, data: any): void {
    if (this.listeners.has(eventType)) {
      this.listeners.get(eventType)!.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`[EventBus] Error in listener for ${eventType}:`, error);
        }
      });
    }
  }

  /**
   * Subscribe to an event once only
   */
  once(eventType: EventType, callback: EventCallback): () => void {
    const wrapper = (data: any) => {
      callback(data);
      unsubscribe();
    };

    const unsubscribe = this.subscribe(eventType, wrapper);
    return unsubscribe;
  }

  /**
   * Clear all listeners for an event type
   */
  clear(eventType?: EventType): void {
    if (eventType) {
      this.listeners.delete(eventType);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get listener count
   */
  getListenerCount(eventType: EventType): number {
    return this.listeners.get(eventType)?.size ?? 0;
  }
}

// Global event bus instance
export const eventBus = new EventBus();

/**
 * Helper to emit common events
 */
export const Events = {
  // Listings
  listingCreated: (data: any) => eventBus.emit('listing:created', data),
  listingUpdated: (data: any) => eventBus.emit('listing:updated', data),
  listingDeleted: (data: any) => eventBus.emit('listing:deleted', data),

  // Contracts
  contractCreated: (data: any) => eventBus.emit('contract:created', data),
  contractUpdated: (data: any) => eventBus.emit('contract:updated', data),
  contractStatusChanged: (data: any) => eventBus.emit('contract:status-changed', data),

  // Deliveries
  deliveryCreated: (data: any) => eventBus.emit('delivery:created', data),
  deliveryUpdated: (data: any) => eventBus.emit('delivery:updated', data),
  deliveryStatusChanged: (data: any) => eventBus.emit('delivery:status-changed', data),

  // Payments
  paymentCreated: (data: any) => eventBus.emit('payment:created', data),
  paymentUpdated: (data: any) => eventBus.emit('payment:updated', data),
  paymentStatusChanged: (data: any) => eventBus.emit('payment:status-changed', data),

  // Notifications
  notificationNew: (data: any) => eventBus.emit('notification:new', data),

  // User
  userUpdated: (data: any) => eventBus.emit('user:updated', data),
  authChanged: (data: any) => eventBus.emit('auth:changed', data),
};
