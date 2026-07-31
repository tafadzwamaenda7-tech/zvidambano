/**
 * Dashboard State Management
 * Manages shared state across all dashboards with real-time synchronization
 */

import { eventBus } from './event-bus';

interface DashboardState {
  listings: Map<string, any>;
  contracts: Map<string, any>;
  deliveries: Map<string, any>;
  payments: Map<string, any>;
  notifications: any[];
  userStats: {
    totalListings: number;
    activeContracts: number;
    pendingDeliveries: number;
    totalRevenue: number;
  };
}

class StateManager {
  private state: DashboardState = {
    listings: new Map(),
    contracts: new Map(),
    deliveries: new Map(),
    payments: new Map(),
    notifications: [],
    userStats: {
      totalListings: 0,
      activeContracts: 0,
      pendingDeliveries: 0,
      totalRevenue: 0,
    },
  };

  private listeners: Map<string, Set<(state: any) => void>> = new Map();

  constructor() {
    this.setupEventListeners();
  }

  /**
   * Setup listeners for real-time events
   */
  private setupEventListeners() {
    // Listings
    eventBus.subscribe('listing:created', (data) => {
      this.state.listings.set(data.id, data);
      this.state.userStats.totalListings++;
      this.notifyListeners('listings');
    });

    eventBus.subscribe('listing:updated', (data) => {
      this.state.listings.set(data.id, data);
      this.notifyListeners('listings');
    });

    eventBus.subscribe('listing:deleted', (data) => {
      this.state.listings.delete(data.id);
      this.state.userStats.totalListings--;
      this.notifyListeners('listings');
    });

    // Contracts
    eventBus.subscribe('contract:created', (data) => {
      this.state.contracts.set(data.id, data);
      this.state.userStats.activeContracts++;
      this.notifyListeners('contracts');
    });

    eventBus.subscribe('contract:updated', (data) => {
      this.state.contracts.set(data.id, data);
      this.notifyListeners('contracts');
    });

    eventBus.subscribe('contract:status-changed', (data) => {
      const contract = this.state.contracts.get(data.id);
      if (contract) {
        contract.status = data.newStatus;
        this.updateContractStats(data.newStatus);
      }
      this.notifyListeners('contracts');
    });

    // Deliveries
    eventBus.subscribe('delivery:created', (data) => {
      this.state.deliveries.set(data.id, data);
      this.state.userStats.pendingDeliveries++;
      this.notifyListeners('deliveries');
    });

    eventBus.subscribe('delivery:updated', (data) => {
      this.state.deliveries.set(data.id, data);
      this.notifyListeners('deliveries');
    });

    eventBus.subscribe('delivery:status-changed', (data) => {
      const delivery = this.state.deliveries.get(data.id);
      if (delivery) {
        delivery.status = data.newStatus;
        if (data.newStatus === 'COMPLETED') {
          this.state.userStats.pendingDeliveries--;
        }
      }
      this.notifyListeners('deliveries');
    });

    // Payments
    eventBus.subscribe('payment:created', (data) => {
      this.state.payments.set(data.id, data);
      this.notifyListeners('payments');
    });

    eventBus.subscribe('payment:updated', (data) => {
      this.state.payments.set(data.id, data);
      this.notifyListeners('payments');
    });

    eventBus.subscribe('payment:status-changed', (data) => {
      const payment = this.state.payments.get(data.id);
      if (payment) {
        payment.status = data.newStatus;
        if (data.newStatus === 'COMPLETED') {
          this.state.userStats.totalRevenue += payment.amount;
        }
      }
      this.notifyListeners('payments');
    });

    // Notifications
    eventBus.subscribe('notification:new', (data) => {
      this.state.notifications.unshift(data);
      // Keep only last 50 notifications
      if (this.state.notifications.length > 50) {
        this.state.notifications.pop();
      }
      this.notifyListeners('notifications');
    });
  }

  /**
   * Update contract stats based on status changes
   */
  private updateContractStats(status: string) {
    if (status === 'PAID' || status === 'SUCCESSFUL') {
      this.state.userStats.activeContracts--;
    }
  }

  /**
   * Get current state
   */
  getState(): DashboardState {
    return this.state;
  }

  /**
   * Get listings
   */
  getListings(): any[] {
    return Array.from(this.state.listings.values());
  }

  /**
   * Get contracts
   */
  getContracts(): any[] {
    return Array.from(this.state.contracts.values());
  }

  /**
   * Get deliveries
   */
  getDeliveries(): any[] {
    return Array.from(this.state.deliveries.values());
  }

  /**
   * Get payments
   */
  getPayments(): any[] {
    return Array.from(this.state.payments.values());
  }

  /**
   * Get notifications
   */
  getNotifications(): any[] {
    return this.state.notifications;
  }

  /**
   * Get user stats
   */
  getStats(): DashboardState['userStats'] {
    return this.state.userStats;
  }

  /**
   * Manually update listings (for initial load)
   */
  setListings(listings: any[]) {
    this.state.listings.clear();
    listings.forEach((l) => this.state.listings.set(l.id, l));
    this.state.userStats.totalListings = listings.length;
    this.notifyListeners('listings');
  }

  /**
   * Manually update contracts
   */
  setContracts(contracts: any[]) {
    this.state.contracts.clear();
    contracts.forEach((c) => this.state.contracts.set(c.id, c));
    this.state.userStats.activeContracts = contracts.filter(
      (c) => !['PAID', 'SUCCESSFUL', 'CANCELLED'].includes(c.status)
    ).length;
    this.notifyListeners('contracts');
  }

  /**
   * Manually update deliveries
   */
  setDeliveries(deliveries: any[]) {
    this.state.deliveries.clear();
    deliveries.forEach((d) => this.state.deliveries.set(d.id, d));
    this.state.userStats.pendingDeliveries = deliveries.filter(
      (d) => d.status !== 'COMPLETED'
    ).length;
    this.notifyListeners('deliveries');
  }

  /**
   * Manually update payments
   */
  setPayments(payments: any[]) {
    this.state.payments.clear();
    payments.forEach((p) => this.state.payments.set(p.id, p));
    this.state.userStats.totalRevenue = payments
      .filter((p) => p.status === 'COMPLETED')
      .reduce((sum, p) => sum + p.amount, 0);
    this.notifyListeners('payments');
  }

  /**
   * Subscribe to state changes
   */
  subscribe(key: string, callback: (state: any) => void): () => void {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }

    this.listeners.get(key)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(key)?.delete(callback);
    };
  }

  /**
   * Notify all listeners of a state change
   */
  private notifyListeners(key: string) {
    if (this.listeners.has(key)) {
      const state = key === 'listings'
        ? this.getListings()
        : key === 'contracts'
        ? this.getContracts()
        : key === 'deliveries'
        ? this.getDeliveries()
        : key === 'payments'
        ? this.getPayments()
        : key === 'notifications'
        ? this.getNotifications()
        : this.getStats();

      this.listeners.get(key)!.forEach((callback) => {
        try {
          callback(state);
        } catch (error) {
          console.error(`[StateManager] Error in listener for ${key}:`, error);
        }
      });
    }
  }

  /**
   * Clear state
   */
  clear() {
    this.state.listings.clear();
    this.state.contracts.clear();
    this.state.deliveries.clear();
    this.state.payments.clear();
    this.state.notifications = [];
    this.state.userStats = {
      totalListings: 0,
      activeContracts: 0,
      pendingDeliveries: 0,
      totalRevenue: 0,
    };
  }
}

// Global state manager instance
export const stateManager = new StateManager();
