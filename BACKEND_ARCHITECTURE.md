# Backend Architecture & Real-Time Integration

![ZVIDAMBANO logo](public/logo.jpeg)

This document explains the complete backend system with real-time updates, cross-dashboard communication, and business logic.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Supabase Backend                          │
│  (PostgreSQL + Auth + Realtime + Storage)                  │
└──────────────────┬──────────────────────────────────────────┘
                   │
       ┌───────────┴───────────┐
       ▼                       ▼
  ┌─────────────┐      ┌──────────────┐
  │  Realtime   │      │    Auth      │
  │ Subscriptions       │  Management │
  └──────┬──────┘      └──────┬───────┘
         │                    │
         └─────────┬──────────┘
                   ▼
         ┌─────────────────────┐
         │   Event Bus         │
         │ (Cross-Dashboard    │
         │  Communication)     │
         └────────┬────────────┘
                  │
         ┌────────┴────────────────────────────────────────┐
         │                                                 │
         ▼                                                 ▼
    ┌────────────────┐                          ┌─────────────────┐
    │ State Manager  │                          │  Dashboard      │
    │ (Global State) │                          │  Services       │
    └────────────────┘                          │  (Business      │
         │                                      │   Logic)        │
         └──────────────────────────────────────┴─────────────────┘
                          │
         ┌────────────────┴─────────────────────┐
         │                                      │
    ┌────▼─────┐  ┌───────────┐  ┌──────────┐
    │  Farmer   │  │ Offtaker  │  │  Driver  │
    │ Dashboard │  │ Dashboard │  │Dashboard │
    └──────────┘  └───────────┘  └──────────┘
```

## Core Modules

### 1. Event Bus (`src/lib/event-bus.ts`)

Manages cross-component communication with a pub-sub pattern.

```typescript
import { eventBus, Events } from './lib/event-bus';

// Subscribe to events
const unsubscribe = eventBus.subscribe('contract:status-changed', (data) => {
  console.log('Contract status changed:', data);
});

// Emit events
Events.contractStatusChanged({ id: '123', newStatus: 'LOADING' });

// Unsubscribe
unsubscribe();
```

**Available Events:**
- `listing:created`, `listing:updated`, `listing:deleted`
- `contract:created`, `contract:updated`, `contract:status-changed`
- `delivery:created`, `delivery:updated`, `delivery:status-changed`
- `payment:created`, `payment:updated`, `payment:status-changed`
- `notification:new`
- `user:updated`, `auth:changed`

### 2. Realtime Subscriptions (`src/lib/realtime.ts`)

Connects Supabase realtime to the event bus.

```typescript
import { 
  initializeRealtimeSubscriptions,
  subscribeToListings,
  subscribeToContracts
} from './lib/realtime';

// Subscribe to all changes
await initializeRealtimeSubscriptions();

// Or subscribe selectively
await subscribeToListings();
await subscribeToContracts();
```

**What it does:**
- Listens to Supabase database changes
- Emits events through the event bus
- Automatically triggers state updates

### 3. State Manager (`src/lib/state-manager.ts`)

Centralized state management with automatic sync to real-time events.

```typescript
import { stateManager } from './lib/state-manager';

// Get current data
const listings = stateManager.getListings();
const contracts = stateManager.getContracts();
const stats = stateManager.getStats();

// Subscribe to state changes
const unsubscribe = stateManager.subscribe('listings', (listings) => {
  console.log('Listings updated:', listings);
  // Update UI here
});

// Manually update state (for initial load)
stateManager.setListings(fetchedListings);
stateManager.setContracts(fetchedContracts);
```

### 4. Business Logic Services (`src/lib/services.ts`)

Role-specific business logic for each dashboard type.

#### Farmer Service
```typescript
import { FarmerService } from './lib/services';

// Get farmer's listings
const myListings = await FarmerService.getMyListings();

// Get contracts
const myContracts = await FarmerService.getMyContracts();

// Get payments received
const myPayments = await FarmerService.getMyPayments();

// Get dashboard stats
const stats = await FarmerService.getDashboardStats();
// Returns: { activeListings, totalListings, activeContracts, 
//            completedContracts, totalContracts, totalEarned, pendingPayments }

// Accept a contract
await FarmerService.acceptContract(contractId);

// Create a draft listing
const listing = await FarmerService.createListing({
  commodity_id: 'uuid',
  title: 'Fresh Maize',
  quantity: 100,
  unit: 'kg',
  asking_price: 365,
  category: 'GRAIN'
});

// Publish a listing
await FarmerService.publishListing(listingId);
```

#### Offtaker Service
```typescript
import { OfftakerService } from './lib/services';

// Get available listings
const listings = await OfftakerService.getAvailableListings();

// Get my contracts
const contracts = await OfftakerService.getMyContracts();

// Get dashboard stats
const stats = await OfftakerService.getDashboardStats();
// Returns: { availableListings, activeContracts, completedContracts,
//            totalContracts, totalSpent, pendingPayments }

// Place an order
const contract = await OfftakerService.placeOrder(
  listingId,
  quantity,    // 50 kg
  pricePerUnit // 370 per unit
);

// Accept delivery
await OfftakerService.acceptDelivery(deliveryId);
```

#### Driver Service
```typescript
import { DriverService } from './lib/services';

// Get my deliveries
const deliveries = await DriverService.getMyDeliveries();

// Get dashboard stats
const stats = await DriverService.getDashboardStats();
// Returns: { totalDeliveries, inTransit, completed, pending }

// Start delivery
await DriverService.startDelivery(deliveryId, firstWeight);

// Complete delivery
await DriverService.completeDelivery(deliveryId, secondWeight, bucketCount);
```

#### Broker Service
```typescript
import { BrokerService } from './lib/services';

// Get all contracts
const contracts = await BrokerService.getAllContracts();

// Get all deliveries
const deliveries = await BrokerService.getAllDeliveries();

// Get contract details
const details = await BrokerService.getContractDetails(contractId);
// Returns: { contract, deliveries, payments }

// Get dashboard stats
const stats = await BrokerService.getDashboardStats();

// Approve contract
await BrokerService.approveContract(contractId);

// Settle contract
await BrokerService.settleContract(contractId);

// Mark successful
await BrokerService.markContractSuccessful(contractId);
```

#### Supplier Service
```typescript
import { SupplierService } from './lib/services';

// Get my listings
const listings = await SupplierService.getMyListings();

// Get dashboard stats
const stats = await SupplierService.getDashboardStats();
// Returns: { totalListings, activeListings, draftListings, soldListings }

// Bulk create listings
const items = [
  { title: 'Maize', quantity: 100, asking_price: 365 },
  { title: 'Wheat', quantity: 50, asking_price: 520 }
];
await SupplierService.bulkCreateListings(items);
```

### 5. Dashboard Initialization (`src/lib/dashboard-init.ts`)

Sets up everything automatically with one call.

```typescript
import { initializeDashboard } from './lib/dashboard-init';

// Initialize your dashboard
await initializeDashboard('farmer');

// Available types: 'farmer' | 'offtaker' | 'driver' | 'broker' | 'supplier' | 'zvida'
```

**What it does:**
1. Initializes authentication
2. Registers service worker
3. Starts real-time subscriptions
4. Loads initial data
5. Sets up cross-dashboard listeners
6. Starts real-time UI updates

## Usage Examples

### Farmer Dashboard

```typescript
import { initializeDashboard } from '../lib/dashboard-init';
import { FarmerService } from '../lib/services';
import { stateManager } from '../lib/state-manager';
import { eventBus } from '../lib/event-bus';

export async function initFarmerDashboard() {
  // Initialize everything
  const { auth, stateManager, eventBus } = await initializeDashboard('farmer');

  // Listen to real-time listing updates
  stateManager.subscribe('listings', (listings) => {
    renderListings(listings);
    updateListingStats(listings.length);
  });

  // Listen to contract status changes
  eventBus.subscribe('contract:status-changed', (data) => {
    console.log('My contract status changed:', data);
    showNotification(`Contract ${data.id} is now ${data.newStatus}`);
  });

  // Listen to payment notifications
  eventBus.subscribe('payment:status-changed', (data) => {
    if (data.newStatus === 'COMPLETED') {
      showNotification(`Payment received: $${data.payment.amount}`);
    }
  });

  // Get dashboard stats (automatically updates in real-time)
  const stats = await FarmerService.getDashboardStats();
  updateStats(stats);

  // Handle create listing
  document.getElementById('create-listing-btn')?.addEventListener('click', async () => {
    const listing = await FarmerService.createListing({
      commodity_id: 'xxx',
      title: 'Fresh Produce',
      quantity: 100,
      unit: 'kg',
      asking_price: 365,
      category: 'GRAIN'
    });
    console.log('Listing created:', listing);
  });
}
```

### Offtaker Dashboard

```typescript
import { initializeDashboard } from '../lib/dashboard-init';
import { OfftakerService } from '../lib/services';
import { stateManager } from '../lib/state-manager';
import { eventBus } from '../lib/event-bus';

export async function initOfftakerDashboard() {
  const { auth } = await initializeDashboard('offtaker');

  // Show available listings
  stateManager.subscribe('listings', (listings) => {
    renderAvailableListings(listings);
  });

  // Listen for new listings
  eventBus.subscribe('listing:created', (listing) => {
    console.log('New listing available:', listing.title);
    showNotification('New listing', listing.title);
  });

  // Listen for delivery updates
  eventBus.subscribe('delivery:status-changed', (data) => {
    if (data.newStatus === 'IN_TRANSIT') {
      showNotification('Delivery in transit', `Your delivery is on the way`);
    }
  });

  // Handle place order
  document.getElementById('place-order-btn')?.addEventListener('click', async () => {
    const contract = await OfftakerService.placeOrder(
      listingId,
      quantity,
      pricePerUnit
    );
    showNotification('Order placed', 'Awaiting confirmation');
  });
}
```

### Driver Dashboard

```typescript
import { initializeDashboard } from '../lib/dashboard-init';
import { DriverService } from '../lib/services';
import { stateManager } from '../lib/state-manager';
import { eventBus } from '../lib/event-bus';

export async function initDriverDashboard() {
  const { auth } = await initializeDashboard('driver');

  // Show my deliveries
  stateManager.subscribe('deliveries', (deliveries) => {
    renderDeliveries(deliveries);
    updateStats({
      total: deliveries.length,
      pending: deliveries.filter(d => d.status === 'PENDING').length,
      inTransit: deliveries.filter(d => d.status === 'IN_TRANSIT').length,
      completed: deliveries.filter(d => d.status === 'COMPLETED').length
    });
  });

  // Listen for new delivery assignments
  eventBus.subscribe('delivery:created', (delivery) => {
    showNotification('New delivery', `${delivery.origin} → ${delivery.destination}`);
  });

  // Handle start delivery
  document.getElementById('start-delivery-btn')?.addEventListener('click', async () => {
    const weight = parseFloat(document.getElementById('first-weight').value);
    await DriverService.startDelivery(deliveryId, weight);
    showNotification('Delivery started', 'Weight recorded');
  });

  // Handle complete delivery
  document.getElementById('complete-delivery-btn')?.addEventListener('click', async () => {
    const weight = parseFloat(document.getElementById('second-weight').value);
    const buckets = parseInt(document.getElementById('bucket-count').value);
    await DriverService.completeDelivery(deliveryId, weight, buckets);
    showNotification('Delivery completed', 'Payment will be processed');
  });
}
```

### Broker/Admin Dashboard

```typescript
import { initializeDashboard } from '../lib/dashboard-init';
import { BrokerService } from '../lib/services';
import { stateManager } from '../lib/state-manager';
import { eventBus } from '../lib/event-bus';

export async function initBrokerDashboard() {
  const { auth } = await initializeDashboard('broker');

  // Show all contracts
  stateManager.subscribe('contracts', (contracts) => {
    renderContracts(contracts);
    updateStats({
      pending: contracts.filter(c => c.status === 'PENDING').length,
      loading: contracts.filter(c => c.status === 'LOADING').length,
      inTransit: contracts.filter(c => c.status === 'IN_TRANSIT').length,
      completed: contracts.filter(c => c.status === 'SUCCESSFUL').length
    });
  });

  // Show all deliveries
  stateManager.subscribe('deliveries', (deliveries) => {
    renderDeliveries(deliveries);
  });

  // Listen for contracts needing action
  eventBus.subscribe('contract:status-changed', (data) => {
    if (data.newStatus === 'FIRST_WEIGHT') {
      showAlert('Contract requires approval', data.contract.contract_number);
    }
  });

  // Handle approve contract
  document.getElementById('approve-btn')?.addEventListener('click', async () => {
    await BrokerService.approveContract(contractId);
    showNotification('Contract approved', 'Waiting for first weighing');
  });

  // Handle settle
  document.getElementById('settle-btn')?.addEventListener('click', async () => {
    await BrokerService.settleContract(contractId);
    showNotification('Contract settled', 'Payment processing');
  });

  // Handle mark successful
  document.getElementById('success-btn')?.addEventListener('click', async () => {
    await BrokerService.markContractSuccessful(contractId);
    showNotification('Contract successful', 'All parties notified');
  });
}
```

## Real-Time Flow

When a status changes in the database:

```
1. Database changes (Supabase)
   ↓
2. Realtime subscription detects change
   ↓
3. Event emitted through eventBus
   ↓
4. State manager updates its state
   ↓
5. All subscribers to state notified
   ↓
6. Dashboard UI components re-render
   ↓
7. Cross-dashboard events propagate to other open dashboards
```

## Error Handling

```typescript
try {
  await FarmerService.acceptContract(contractId);
} catch (error) {
  if (error.status === 403) {
    showError('Permission denied');
  } else if (error.message.includes('Network')) {
    showError('Network error - will retry when online');
  } else {
    showError(error.message);
  }
}
```

## Offline Support

```typescript
import { isOnline, onOnlineStatusChange } from './lib/pwa';

// Check status
if (!isOnline()) {
  console.log('Using cached data');
}

// Listen for changes
onOnlineStatusChange((isOnline) => {
  if (isOnline) {
    // Sync pending changes
    syncWithServer();
  }
});
```

## Best Practices

1. **Use Services** - Don't call API directly, use service classes
2. **Subscribe Once** - Use event listeners, not polling
3. **Check Auth** - Always verify authentication before showing data
4. **Handle Offline** - Test with DevTools offline mode
5. **Unsubscribe** - Clean up listeners when dashboard closes
6. **Error Handling** - Wrap async calls in try-catch

## API Reference

### Event Bus
- `eventBus.subscribe(event, callback)` - Returns unsubscribe function
- `eventBus.once(event, callback)` - Subscribe once
- `eventBus.emit(event, data)` - Emit event
- `eventBus.clear(event?)` - Clear listeners

### State Manager
- `stateManager.getListings()` - Get array of listings
- `stateManager.getContracts()` - Get array of contracts
- `stateManager.getDeliveries()` - Get array of deliveries
- `stateManager.getPayments()` - Get array of payments
- `stateManager.getStats()` - Get user stats
- `stateManager.subscribe(key, callback)` - Subscribe to changes

### Services
- `FarmerService.getMyListings()`
- `FarmerService.getMyContracts()`
- `FarmerService.getDashboardStats()`
- `OfftakerService.getAvailableListings()`
- `OfftakerService.placeOrder()`
- `DriverService.getMyDeliveries()`
- `DriverService.startDelivery()`
- `BrokerService.getAllContracts()`
- `BrokerService.approveContract()`

## Troubleshooting

**Real-time not working?**
- Check Supabase connection: `supabase.auth.getSession()`
- Check subscriptions: Open DevTools → Network → filter "realtime"

**State not updating?**
- Check eventBus listeners: `eventBus.getListenerCount('contract:created')`
- Check state: `stateManager.getState()`

**Offline mode issues?**
- Check service worker: DevTools → Application → Service Workers
- Check cache: DevTools → Application → Cache Storage

**Auth issues?**
- Check auth state: `getAuthState()`
- Check Supabase: Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY set
