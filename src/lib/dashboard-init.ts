/**
 * Dashboard Initialization & Setup
 * Wires everything together: auth, real-time, state management, and services
 */

import { initializeAuth, getAuthState } from './auth';
import { initializeRealtimeSubscriptions } from './realtime';
import { stateManager } from './state-manager';
import { eventBus } from './event-bus';
import {
  FarmerService,
  OfftakerService,
  DriverService,
  BrokerService,
  SupplierService,
} from './services';
import { registerServiceWorker } from './pwa';

export type DashboardType = 'farmer' | 'offtaker' | 'driver' | 'broker' | 'supplier' | 'zvida';

/**
 * Initialize dashboard with full backend setup
 */
export async function initializeDashboard(dashboardType: DashboardType) {
  console.log(`[Dashboard] Initializing ${dashboardType} dashboard...`);

  try {
    // Step 1: Initialize authentication
    console.log('[Dashboard] Initializing authentication...');
    await initializeAuth();

    const auth = getAuthState();
    if (!auth.isAuthenticated) {
      console.error('[Dashboard] User not authenticated');
      window.location.href = '/login.html';
      return;
    }

    console.log(`[Dashboard] User authenticated: ${auth.user.email} (${auth.role})`);

    // Step 2: Register service worker for PWA
    console.log('[Dashboard] Registering service worker...');
    registerServiceWorker({
      onSuccess: () => console.log('[Dashboard] Service worker ready'),
      onError: (error) => console.warn('[Dashboard] Service worker error:', error),
    });

    // Step 3: Initialize real-time subscriptions
    console.log('[Dashboard] Initializing real-time subscriptions...');
    await initializeRealtimeSubscriptions();

    // Step 4: Load initial data based on user role
    const role = auth.role || 'supplier';
    console.log(`[Dashboard] Loading data for role: ${role}`);
    await loadDashboardData(dashboardType, role);

    // Step 5: Setup cross-dashboard communication listeners
    setupCrossDashboardListeners(dashboardType);

    console.log(`[Dashboard] ${dashboardType} dashboard initialized successfully`);
    return {
      auth,
      stateManager,
      eventBus,
    };
  } catch (error) {
    console.error('[Dashboard] Initialization error:', error);
    throw error;
  }
}

/**
 * Load dashboard data based on type and role
 */
async function loadDashboardData(dashboardType: DashboardType, role: string) {
  try {
    switch (dashboardType) {
      case 'farmer':
        console.log('[Dashboard] Loading farmer data...');
        await Promise.all([
          FarmerService.getMyListings(),
          FarmerService.getMyContracts(),
          FarmerService.getMyPayments(),
        ]);
        break;

      case 'offtaker':
        console.log('[Dashboard] Loading offtaker data...');
        await Promise.all([
          OfftakerService.getAvailableListings(),
          OfftakerService.getMyContracts(),
          OfftakerService.getMyPayments(),
        ]);
        break;

      case 'driver':
        console.log('[Dashboard] Loading driver data...');
        await DriverService.getMyDeliveries();
        break;

      case 'broker':
      case 'zvida':
        console.log('[Dashboard] Loading broker/admin data...');
        await Promise.all([
          BrokerService.getAllContracts(),
          BrokerService.getAllDeliveries(),
        ]);
        break;

      case 'supplier':
        console.log('[Dashboard] Loading supplier data...');
        await SupplierService.getMyListings();
        break;
    }

    console.log('[Dashboard] Data loaded successfully');
  } catch (error) {
    console.error('[Dashboard] Error loading data:', error);
    throw error;
  }
}

/**
 * Setup listeners for cross-dashboard real-time updates
 */
function setupCrossDashboardListeners(dashboardType: DashboardType) {
  console.log(`[Dashboard] Setting up cross-dashboard listeners for ${dashboardType}`);

  // All dashboards listen to important status changes
  eventBus.subscribe('contract:status-changed', (data) => {
    console.log(`[Dashboard] Contract status changed: ${data.oldStatus} → ${data.newStatus}`);
    updateUIElement('contract-status-' + data.id, data.newStatus);
  });

  eventBus.subscribe('delivery:status-changed', (data) => {
    console.log(`[Dashboard] Delivery status changed: ${data.oldStatus} → ${data.newStatus}`);
    updateUIElement('delivery-status-' + data.id, data.newStatus);
  });

  eventBus.subscribe('payment:status-changed', (data) => {
    console.log(`[Dashboard] Payment status changed: ${data.oldStatus} → ${data.newStatus}`);
    updateUIElement('payment-status-' + data.id, data.newStatus);
  });

  // Role-specific listeners
  switch (dashboardType) {
    case 'farmer':
      eventBus.subscribe('listing:updated', (data) => {
        console.log('[Farmer Dashboard] Listing updated:', data.title);
        updateListingUI(data);
      });

      eventBus.subscribe('contract:status-changed', (data) => {
        if (data.contract.farmer_id) {
          updateContractUI(data.contract);
        }
      });

      stateManager.subscribe('listings', (listings) => {
        updateFarmerStats();
      });

      stateManager.subscribe('contracts', (contracts) => {
        updateFarmerStats();
      });
      break;

    case 'offtaker':
      eventBus.subscribe('listing:created', (data) => {
        console.log('[Offtaker Dashboard] New listing available:', data.title);
        addNewListingToUI(data);
      });

      eventBus.subscribe('delivery:status-changed', (data) => {
        if (data.newStatus === 'IN_TRANSIT') {
          notifyDeliveryStarted(data.delivery);
        } else if (data.newStatus === 'COMPLETED') {
          notifyDeliveryCompleted(data.delivery);
        }
      });

      stateManager.subscribe('listings', (listings) => {
        updateOfftakerStats();
      });

      stateManager.subscribe('contracts', (contracts) => {
        updateOfftakerStats();
      });
      break;

    case 'driver':
      eventBus.subscribe('delivery:created', (data) => {
        console.log('[Driver Dashboard] New delivery assigned:', data.id);
        addNewDeliveryToUI(data);
      });

      eventBus.subscribe('delivery:updated', (data) => {
        updateDeliveryUI(data);
      });

      stateManager.subscribe('deliveries', (deliveries) => {
        updateDriverStats();
      });
      break;

    case 'broker':
    case 'zvida':
      eventBus.subscribe('contract:status-changed', (data) => {
        console.log('[Broker Dashboard] Contract requires attention:', data.newStatus);
        updateBrokerAlerts(data);
      });

      eventBus.subscribe('delivery:status-changed', (data) => {
        updateBrokerDeliveryUI(data);
      });

      eventBus.subscribe('payment:status-changed', (data) => {
        updateBrokerPaymentUI(data);
      });

      stateManager.subscribe('contracts', (contracts) => {
        updateBrokerStats();
      });

      stateManager.subscribe('deliveries', (deliveries) => {
        updateBrokerStats();
      });
      break;

    case 'supplier':
      eventBus.subscribe('listing:updated', (data) => {
        console.log('[Supplier Dashboard] Listing status changed:', data.status);
        updateSupplierListingUI(data);
      });

      stateManager.subscribe('listings', (listings) => {
        updateSupplierStats();
      });
      break;
  }
}

/**
 * UI Update Helper Functions
 * These are called when real-time events occur
 */

function updateUIElement(elementId: string, content: string) {
  const el = document.getElementById(elementId);
  if (el) {
    el.textContent = content;
    el.classList.add('updated');
    setTimeout(() => el.classList.remove('updated'), 1000);
  }
}

function updateListingUI(listing: any) {
  const el = document.getElementById(`listing-${listing.id}`);
  if (el) {
    el.querySelector('.status')!.textContent = listing.status;
    el.querySelector('.price')!.textContent = `$${listing.asking_price}`;
  }
}

function updateContractUI(contract: any) {
  const el = document.getElementById(`contract-${contract.id}`);
  if (el) {
    el.querySelector('.status')!.textContent = contract.status;
  }
}

function updateDeliveryUI(delivery: any) {
  const el = document.getElementById(`delivery-${delivery.id}`);
  if (el) {
    el.querySelector('.status')!.textContent = delivery.status;
    if (delivery.first_weight) {
      el.querySelector('.weight')!.textContent = `${delivery.first_weight}kg`;
    }
  }
}

function addNewListingToUI(listing: any) {
  const container = document.getElementById('listings-container');
  if (!container) return;

  const listingEl = document.createElement('div');
  listingEl.id = `listing-${listing.id}`;
  listingEl.className = 'listing-card new';
  listingEl.innerHTML = `
    <h3>${listing.title}</h3>
    <p class="status">${listing.status}</p>
    <p class="price">$${listing.asking_price}</p>
  `;
  container.insertBefore(listingEl, container.firstChild);
}

function addNewDeliveryToUI(delivery: any) {
  const container = document.getElementById('deliveries-container');
  if (!container) return;

  const deliveryEl = document.createElement('div');
  deliveryEl.id = `delivery-${delivery.id}`;
  deliveryEl.className = 'delivery-card new';
  deliveryEl.innerHTML = `
    <p>Delivery: ${delivery.id.substring(0, 8)}</p>
    <p class="status">${delivery.status}</p>
    <p class="origin">${delivery.origin} → ${delivery.destination}</p>
  `;
  container.insertBefore(deliveryEl, container.firstChild);
}

function notifyDeliveryStarted(delivery: any) {
  console.log('[Driver] Delivery started:', delivery.id);
  showNotification('Delivery started', `Delivery to ${delivery.destination} is in transit`);
}

function notifyDeliveryCompleted(delivery: any) {
  console.log('[Driver] Delivery completed:', delivery.id);
  showNotification('Delivery completed', `Delivery to ${delivery.destination} completed`);
}

function updateBrokerAlerts(data: any) {
  const container = document.getElementById('alerts-container');
  if (!container) return;

  const alert = document.createElement('div');
  alert.className = 'alert-item';
  alert.innerHTML = `
    <p>Contract ${data.id.substring(0, 8)} status: ${data.newStatus}</p>
    <button onclick="this.parentElement.remove()">Dismiss</button>
  `;
  container.appendChild(alert);
}

function updateBrokerDeliveryUI(data: any) {
  updateDeliveryUI(data.delivery);
}

function updateBrokerPaymentUI(data: any) {
  const el = document.getElementById(`payment-${data.id}`);
  if (el) {
    el.querySelector('.status')!.textContent = data.newStatus;
  }
}

function updateSupplierListingUI(listing: any) {
  updateListingUI(listing);
}

function updateFarmerStats() {
  FarmerService.getDashboardStats().then((stats) => {
    updateStatsUI(stats);
  });
}

function updateOfftakerStats() {
  OfftakerService.getDashboardStats().then((stats) => {
    updateStatsUI(stats);
  });
}

function updateDriverStats() {
  DriverService.getDashboardStats().then((stats) => {
    updateStatsUI(stats);
  });
}

function updateBrokerStats() {
  BrokerService.getDashboardStats().then((stats) => {
    updateStatsUI(stats);
  });
}

function updateSupplierStats() {
  SupplierService.getDashboardStats().then((stats) => {
    updateStatsUI(stats);
  });
}

function updateStatsUI(stats: any) {
  Object.entries(stats).forEach(([key, value]) => {
    const el = document.getElementById(`stat-${key}`);
    if (el) {
      el.textContent = String(value);
    }
  });
}

function showNotification(title: string, message: string) {
  const container = document.getElementById('notifications-container');
  if (!container) return;

  const notification = document.createElement('div');
  notification.className = 'notification-item';
  notification.innerHTML = `
    <h4>${title}</h4>
    <p>${message}</p>
  `;
  container.appendChild(notification);

  setTimeout(() => notification.remove(), 5000);
}

/**
 * Cleanup function
 */
export function cleanupDashboard() {
  stateManager.clear();
  eventBus.clear();
  console.log('[Dashboard] Cleaned up');
}
