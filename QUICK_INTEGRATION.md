# Quick Integration Guide - Dashboard Files

This guide shows how to integrate the backend system into each dashboard HTML file.

## Farmer Dashboard Integration

**File:** `farmer-dashboard.html`

```typescript
// src/dashboards/farmer.ts
import { initDesignSystem } from '../ui-utils';
import { initializeDashboard } from '../lib/dashboard-init';
import { FarmerService } from '../lib/services';
import { stateManager } from '../lib/state-manager';
import { eventBus } from '../lib/event-bus';
import { getAuthState } from '../lib/auth';

export async function initFarmerDashboard() {
  // Initialize everything: auth, PWA, real-time, services
  await initializeDashboard('farmer');
  
  const auth = getAuthState();
  console.log(`Farmer: ${auth.user.email}`);

  // Setup UI
  initDesignSystem();
  document.getElementById('user-name')!.textContent = auth.user.email;

  // Subscribe to listing changes
  stateManager.subscribe('listings', (listings) => {
    renderListings(listings);
    updateStats(listings.length, 'totalListings');
  });

  // Subscribe to contract changes
  stateManager.subscribe('contracts', (contracts) => {
    renderContracts(contracts);
    updateStats(contracts.length, 'totalContracts');
  });

  // Listen for contract status changes
  eventBus.subscribe('contract:status-changed', (data) => {
    showNotification(
      'Contract Updated',
      `Contract ${data.id.substring(0, 8)} is now ${data.newStatus}`
    );
  });

  // Listen for payment confirmations
  eventBus.subscribe('payment:status-changed', (data) => {
    if (data.newStatus === 'COMPLETED') {
      showNotification(
        'Payment Received',
        `$${data.payment.amount} received for contract`
      );
    }
  });

  // Create listing handler
  document.getElementById('create-listing-btn')?.addEventListener('click', async () => {
    const data = {
      commodity_id: 'xxx', // Get from select
      title: (document.getElementById('listing-title') as HTMLInputElement).value,
      quantity: parseFloat((document.getElementById('quantity') as HTMLInputElement).value),
      unit: 'kg',
      asking_price: parseFloat((document.getElementById('price') as HTMLInputElement).value),
      category: 'GRAIN',
    };

    try {
      await FarmerService.createListing(data);
      showNotification('Success', 'Listing created');
      (document.getElementById('listing-form') as HTMLFormElement).reset();
    } catch (error) {
      showNotification('Error', 'Failed to create listing');
    }
  });

  // Publish listing handler
  document.querySelectorAll('[data-publish-btn]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const listingId = (e.target as HTMLElement).dataset.listingId;
      try {
        await FarmerService.publishListing(listingId);
        showNotification('Success', 'Listing published');
      } catch (error) {
        showNotification('Error', 'Failed to publish');
      }
    });
  });

  // Accept contract handler
  document.querySelectorAll('[data-accept-btn]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const contractId = (e.target as HTMLElement).dataset.contractId;
      try {
        await FarmerService.acceptContract(contractId);
        showNotification('Success', 'Contract accepted');
      } catch (error) {
        showNotification('Error', 'Failed to accept');
      }
    });
  });

  // Load initial stats
  const stats = await FarmerService.getDashboardStats();
  updateStats(stats.activeListings, 'activeListings');
  updateStats(stats.activeContracts, 'activeContracts');
  updateStats(stats.totalEarned, 'totalEarned');
}

function renderListings(listings: any[]) {
  const container = document.getElementById('listings-list');
  if (!container) return;

  container.innerHTML = listings.map((l) => `
    <div class="listing-item" id="listing-${l.id}">
      <h4>${l.title}</h4>
      <p>Quantity: ${l.quantity} ${l.unit}</p>
      <p>Price: $${l.asking_price}</p>
      <p><span class="status">${l.status}</span></p>
      ${l.status === 'draft' ? `
        <button data-publish-btn data-listing-id="${l.id}" class="btn btn-primary">Publish</button>
      ` : ''}
    </div>
  `).join('');
}

function renderContracts(contracts: any[]) {
  const container = document.getElementById('contracts-list');
  if (!container) return;

  container.innerHTML = contracts.map((c) => `
    <div class="contract-item" id="contract-${c.id}">
      <p>Contract: ${c.contract_number}</p>
      <p>Quantity: ${c.quantity} ${c.unit}</p>
      <p>Price: $${c.farmer_price}</p>
      <p><span class="status">${c.status}</span></p>
      ${c.status === 'PENDING' ? `
        <button data-accept-btn data-contract-id="${c.id}" class="btn btn-success">Accept</button>
      ` : ''}
    </div>
  `).join('');
}

function updateStats(value: number, key: string) {
  const el = document.getElementById(`stat-${key}`);
  if (el) el.textContent = String(value);
}

function showNotification(title: string, message: string) {
  const container = document.getElementById('notifications');
  if (!container) return;

  const div = document.createElement('div');
  div.className = 'notification';
  div.innerHTML = `<h4>${title}</h4><p>${message}</p>`;
  container.appendChild(div);
  setTimeout(() => div.remove(), 4000);
}

// Initialize on load
document.addEventListener('DOMContentLoaded', initFarmerDashboard);
```

---

## Offtaker Dashboard Integration

**File:** `offtaker-dashboard.html`

```typescript
// src/dashboards/offtaker.ts
import { initDesignSystem } from '../ui-utils';
import { initializeDashboard } from '../lib/dashboard-init';
import { OfftakerService } from '../lib/services';
import { stateManager } from '../lib/state-manager';
import { eventBus } from '../lib/event-bus';
import { getAuthState } from '../lib/auth';

export async function initOfftakerDashboard() {
  await initializeDashboard('offtaker');

  const auth = getAuthState();
  console.log(`Offtaker: ${auth.user.email}`);

  initDesignSystem();
  document.getElementById('user-name')!.textContent = auth.user.email;

  // Show available listings
  stateManager.subscribe('listings', (listings) => {
    renderAvailableListings(listings);
    updateStats(listings.length, 'availableListings');
  });

  // Show my contracts
  stateManager.subscribe('contracts', (contracts) => {
    renderMyContracts(contracts);
    updateStats(contracts.length, 'myContracts');
  });

  // Listen for new listings
  eventBus.subscribe('listing:created', (listing) => {
    showNotification('New Listing', `${listing.title} is now available`);
  });

  // Listen for delivery updates
  eventBus.subscribe('delivery:status-changed', (data) => {
    if (data.newStatus === 'IN_TRANSIT') {
      showNotification('Delivery Started', 'Your delivery is on the way');
    } else if (data.newStatus === 'COMPLETED') {
      showNotification('Delivery Completed', 'Your order has arrived');
    }
  });

  // Place order handler
  document.getElementById('place-order-btn')?.addEventListener('click', async () => {
    const listingId = (document.getElementById('listing-select') as HTMLSelectElement).value;
    const quantity = parseFloat((document.getElementById('order-quantity') as HTMLInputElement).value);
    const price = parseFloat((document.getElementById('order-price') as HTMLInputElement).value);

    try {
      await OfftakerService.placeOrder(listingId, quantity, price);
      showNotification('Success', 'Order placed successfully');
      (document.getElementById('order-form') as HTMLFormElement).reset();
    } catch (error) {
      showNotification('Error', 'Failed to place order');
    }
  });

  // Load initial stats
  const stats = await OfftakerService.getDashboardStats();
  updateStats(stats.availableListings, 'availableListings');
  updateStats(stats.activeContracts, 'activeContracts');
  updateStats(stats.totalSpent, 'totalSpent');
}

function renderAvailableListings(listings: any[]) {
  const container = document.getElementById('available-listings');
  if (!container) return;

  container.innerHTML = listings.map((l) => `
    <div class="listing-card">
      <h4>${l.title}</h4>
      <p>Quantity: ${l.quantity} ${l.unit}</p>
      <p>Price: $${l.asking_price}</p>
      <p>From: ${l.origin}</p>
      <button onclick="selectListing('${l.id}', ${l.asking_price})" class="btn">Select</button>
    </div>
  `).join('');
}

function renderMyContracts(contracts: any[]) {
  const container = document.getElementById('my-contracts');
  if (!container) return;

  container.innerHTML = contracts.map((c) => `
    <div class="contract-card" id="contract-${c.id}">
      <p>Order: ${c.contract_number}</p>
      <p>Quantity: ${c.quantity} ${c.unit}</p>
      <p>Total: $${c.offtaker_price * c.quantity}</p>
      <p><span class="status">${c.status}</span></p>
    </div>
  `).join('');
}

function updateStats(value: number, key: string) {
  const el = document.getElementById(`stat-${key}`);
  if (el) el.textContent = String(value);
}

function selectListing(listingId: string, price: number) {
  (document.getElementById('listing-select') as HTMLSelectElement).value = listingId;
  (document.getElementById('order-price') as HTMLInputElement).value = String(price);
}

function showNotification(title: string, message: string) {
  const container = document.getElementById('notifications');
  if (!container) return;

  const div = document.createElement('div');
  div.className = 'notification';
  div.innerHTML = `<h4>${title}</h4><p>${message}</p>`;
  container.appendChild(div);
  setTimeout(() => div.remove(), 4000);
}

document.addEventListener('DOMContentLoaded', initOfftakerDashboard);
```

---

## Driver Dashboard Integration

**File:** `driver-dashboard.html`

```typescript
// src/dashboards/driver.ts
import { initDesignSystem } from '../ui-utils';
import { initializeDashboard } from '../lib/dashboard-init';
import { DriverService } from '../lib/services';
import { stateManager } from '../lib/state-manager';
import { eventBus } from '../lib/event-bus';
import { getAuthState } from '../lib/auth';

export async function initDriverDashboard() {
  await initializeDashboard('driver');

  const auth = getAuthState();
  console.log(`Driver: ${auth.user.email}`);

  initDesignSystem();
  document.getElementById('user-name')!.textContent = auth.user.email;

  // Show my deliveries
  stateManager.subscribe('deliveries', (deliveries) => {
    renderDeliveries(deliveries);
    updateStats(deliveries.filter((d: any) => d.status === 'PENDING').length, 'pendingDeliveries');
    updateStats(deliveries.filter((d: any) => d.status === 'IN_TRANSIT').length, 'inTransit');
    updateStats(deliveries.filter((d: any) => d.status === 'COMPLETED').length, 'completed');
  });

  // Listen for new delivery assignments
  eventBus.subscribe('delivery:created', (delivery) => {
    showNotification('New Delivery', `${delivery.origin} → ${delivery.destination}`);
  });

  // Listen for delivery updates
  eventBus.subscribe('delivery:updated', (delivery) => {
    updateDeliveryUI(delivery);
  });

  // Start delivery handler
  document.querySelectorAll('[data-start-btn]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const deliveryId = (e.target as HTMLElement).dataset.deliveryId;
      const weight = parseFloat(
        (document.getElementById(`first-weight-${deliveryId}`) as HTMLInputElement).value
      );

      try {
        await DriverService.startDelivery(deliveryId, weight);
        showNotification('Delivery Started', 'Weight recorded at origin');
      } catch (error) {
        showNotification('Error', 'Failed to start delivery');
      }
    });
  });

  // Complete delivery handler
  document.querySelectorAll('[data-complete-btn]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const deliveryId = (e.target as HTMLElement).dataset.deliveryId;
      const weight = parseFloat(
        (document.getElementById(`second-weight-${deliveryId}`) as HTMLInputElement).value
      );
      const buckets = parseInt(
        (document.getElementById(`bucket-count-${deliveryId}`) as HTMLInputElement).value
      );

      try {
        await DriverService.completeDelivery(deliveryId, weight, buckets);
        showNotification('Delivery Completed', 'Payment will be processed');
      } catch (error) {
        showNotification('Error', 'Failed to complete delivery');
      }
    });
  });

  // Load initial data
  const stats = await DriverService.getDashboardStats();
  updateStats(stats.totalDeliveries, 'totalDeliveries');
  updateStats(stats.pending, 'pendingDeliveries');
}

function renderDeliveries(deliveries: any[]) {
  const container = document.getElementById('deliveries-list');
  if (!container) return;

  container.innerHTML = deliveries.map((d) => `
    <div class="delivery-item" id="delivery-${d.id}">
      <p><strong>${d.origin} → ${d.destination}</strong></p>
      <p>Status: <span class="status">${d.status}</span></p>
      <p>Vehicle: ${d.vehicle_reg}</p>
      
      ${d.status === 'PENDING' ? `
        <div>
          <input type="number" id="first-weight-${d.id}" placeholder="First weight (kg)" />
          <button data-start-btn data-delivery-id="${d.id}" class="btn btn-primary">Start Delivery</button>
        </div>
      ` : d.status === 'IN_TRANSIT' ? `
        <div>
          <input type="number" id="second-weight-${d.id}" placeholder="Second weight (kg)" />
          <input type="number" id="bucket-count-${d.id}" placeholder="Number of buckets" />
          <button data-complete-btn data-delivery-id="${d.id}" class="btn btn-success">Complete</button>
        </div>
      ` : ''}
    </div>
  `).join('');
}

function updateDeliveryUI(delivery: any) {
  const el = document.getElementById(`delivery-${delivery.id}`);
  if (el) {
    el.querySelector('.status')!.textContent = delivery.status;
  }
}

function updateStats(value: number, key: string) {
  const el = document.getElementById(`stat-${key}`);
  if (el) el.textContent = String(value);
}

function showNotification(title: string, message: string) {
  const container = document.getElementById('notifications');
  if (!container) return;

  const div = document.createElement('div');
  div.className = 'notification';
  div.innerHTML = `<h4>${title}</h4><p>${message}</p>`;
  container.appendChild(div);
  setTimeout(() => div.remove(), 4000);
}

document.addEventListener('DOMContentLoaded', initDriverDashboard);
```

---

## Broker/Compliance Dashboard Integration

**File:** `zvida-dashboard.html`

```typescript
// src/dashboards/zvida.ts
import { initDesignSystem } from '../ui-utils';
import { initializeDashboard } from '../lib/dashboard-init';
import { BrokerService } from '../lib/services';
import { stateManager } from '../lib/state-manager';
import { eventBus } from '../lib/event-bus';
import { getAuthState } from '../lib/auth';

export async function initBrokerDashboard() {
  await initializeDashboard('broker');

  const auth = getAuthState();
  console.log(`Broker/Admin: ${auth.user.email}`);

  initDesignSystem();

  // Show all contracts
  stateManager.subscribe('contracts', (contracts) => {
    renderAllContracts(contracts);
    updateStats(contracts.length, 'totalContracts');
    updateStats(contracts.filter((c: any) => c.status === 'PENDING').length, 'pending');
    updateStats(contracts.filter((c: any) => c.status === 'SUCCESSFUL').length, 'completed');
  });

  // Show all deliveries
  stateManager.subscribe('deliveries', (deliveries) => {
    renderDeliveries(deliveries);
    updateStats(deliveries.length, 'totalDeliveries');
  });

  // Listen for contracts needing action
  eventBus.subscribe('contract:status-changed', (data) => {
    if (['PENDING', 'FIRST_WEIGHT', 'PENDING_SETTLEMENT'].includes(data.newStatus)) {
      showAlert('Contract Requires Action', `${data.id}: ${data.newStatus}`);
    }
  });

  // Approve contract handler
  document.querySelectorAll('[data-approve-btn]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const contractId = (e.target as HTMLElement).dataset.contractId;
      try {
        await BrokerService.approveContract(contractId);
        showNotification('Approved', 'Contract approved for loading');
      } catch (error) {
        showNotification('Error', 'Failed to approve');
      }
    });
  });

  // Settle contract handler
  document.querySelectorAll('[data-settle-btn]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const contractId = (e.target as HTMLElement).dataset.contractId;
      try {
        await BrokerService.settleContract(contractId);
        showNotification('Settled', 'Settlement initiated');
      } catch (error) {
        showNotification('Error', 'Failed to settle');
      }
    });
  });

  // Mark successful handler
  document.querySelectorAll('[data-success-btn]').forEach((btn) => {
    btn.addEventListener('click', async (e) => {
      const contractId = (e.target as HTMLElement).dataset.contractId;
      try {
        await BrokerService.markContractSuccessful(contractId);
        showNotification('Success', 'Contract marked successful');
      } catch (error) {
        showNotification('Error', 'Failed to mark successful');
      }
    });
  });

  // Load initial stats
  const stats = await BrokerService.getDashboardStats();
  updateStats(stats.totalContracts, 'totalContracts');
  updateStats(stats.totalDeliveries, 'totalDeliveries');
}

function renderAllContracts(contracts: any[]) {
  const container = document.getElementById('contracts-list');
  if (!container) return;

  container.innerHTML = contracts.map((c) => `
    <div class="contract-card" id="contract-${c.id}">
      <p><strong>${c.contract_number}</strong></p>
      <p>Quantity: ${c.quantity} ${c.unit}</p>
      <p>Status: <span class="status">${c.status}</span></p>
      
      ${c.status === 'PENDING' ? `
        <button data-approve-btn data-contract-id="${c.id}" class="btn btn-info">Approve</button>
      ` : c.status === 'SECOND_WEIGHT' ? `
        <button data-settle-btn data-contract-id="${c.id}" class="btn btn-warning">Settle</button>
      ` : c.status === 'PENDING_SETTLEMENT' ? `
        <button data-success-btn data-contract-id="${c.id}" class="btn btn-success">Mark Success</button>
      ` : ''}
    </div>
  `).join('');
}

function renderDeliveries(deliveries: any[]) {
  const container = document.getElementById('deliveries-list');
  if (!container) return;

  container.innerHTML = deliveries.map((d) => `
    <div class="delivery-card">
      <p>${d.origin} → ${d.destination}</p>
      <p>Status: ${d.status}</p>
      <p>Vehicle: ${d.vehicle_reg}</p>
    </div>
  `).join('');
}

function updateStats(value: number, key: string) {
  const el = document.getElementById(`stat-${key}`);
  if (el) el.textContent = String(value);
}

function showNotification(title: string, message: string) {
  const container = document.getElementById('notifications');
  if (!container) return;

  const div = document.createElement('div');
  div.className = 'notification';
  div.innerHTML = `<h4>${title}</h4><p>${message}</p>`;
  container.appendChild(div);
  setTimeout(() => div.remove(), 4000);
}

function showAlert(title: string, message: string) {
  const container = document.getElementById('alerts');
  if (!container) return;

  const div = document.createElement('div');
  div.className = 'alert alert-warning';
  div.innerHTML = `<h4>${title}</h4><p>${message}</p>`;
  container.appendChild(div);
}

document.addEventListener('DOMContentLoaded', initBrokerDashboard);
```

---

## Vendor/Supplier Dashboard Integration

**File:** `vendor-dashboard.html`

```typescript
// src/dashboards/supplier.ts
import { initDesignSystem } from '../ui-utils';
import { initializeDashboard } from '../lib/dashboard-init';
import { SupplierService } from '../lib/services';
import { stateManager } from '../lib/state-manager';
import { eventBus } from '../lib/event-bus';

export async function initSupplierDashboard() {
  await initializeDashboard('supplier');

  initDesignSystem();

  // Show my listings
  stateManager.subscribe('listings', (listings) => {
    renderListings(listings);
    updateStats(listings.filter((l: any) => l.status === 'active').length, 'activeListings');
    updateStats(listings.filter((l: any) => l.status === 'draft').length, 'draftListings');
  });

  // Listen for listing updates
  eventBus.subscribe('listing:updated', (listing) => {
    updateListingUI(listing);
  });

  // Bulk import handler
  document.getElementById('bulk-import-btn')?.addEventListener('click', async () => {
    const items = [
      { title: 'Item 1', quantity: 100, asking_price: 365, category: 'GRAIN' },
      // Parse from CSV or form...
    ];

    try {
      await SupplierService.bulkCreateListings(items);
      showNotification('Success', 'Items imported');
    } catch (error) {
      showNotification('Error', 'Import failed');
    }
  });

  // Load initial stats
  const stats = await SupplierService.getDashboardStats();
  updateStats(stats.totalListings, 'totalListings');
  updateStats(stats.activeListings, 'activeListings');
}

function renderListings(listings: any[]) {
  const container = document.getElementById('listings');
  if (!container) return;

  container.innerHTML = listings.map((l) => `
    <div class="listing-item" id="listing-${l.id}">
      <p>${l.title}</p>
      <p>Qty: ${l.quantity} | Price: $${l.asking_price}</p>
      <p><span class="badge">${l.status}</span></p>
    </div>
  `).join('');
}

function updateListingUI(listing: any) {
  const el = document.getElementById(`listing-${listing.id}`);
  if (el) {
    el.querySelector('.badge')!.textContent = listing.status;
  }
}

function updateStats(value: number, key: string) {
  const el = document.getElementById(`stat-${key}`);
  if (el) el.textContent = String(value);
}

function showNotification(title: string, message: string) {
  alert(`${title}: ${message}`);
}

document.addEventListener('DOMContentLoaded', initSupplierDashboard);
```

---

## Summary

Each dashboard needs:

1. **Import the initialization:**
   ```typescript
   import { initializeDashboard } from '../lib/dashboard-init';
   ```

2. **Call init once:**
   ```typescript
   await initializeDashboard('farmer'); // or 'offtaker', 'driver', etc.
   ```

3. **Subscribe to state changes:**
   ```typescript
   stateManager.subscribe('listings', (listings) => {
     renderListings(listings);
   });
   ```

4. **Listen to events:**
   ```typescript
   eventBus.subscribe('contract:status-changed', (data) => {
     showNotification(...);
   });
   ```

5. **Use services for actions:**
   ```typescript
   await FarmerService.acceptContract(id);
   ```

That's it! Real-time updates, cross-dashboard sync, and offline support are all handled automatically.
