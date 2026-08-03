# ZVIDA PWA - Complete Backend System (WIRED & READY)

![ZVIDAMBANO logo](public/logo.jpeg)

## ✅ What's Implemented

A **fully-wired backend system** with real-time updates, cross-dashboard communication, and business logic for all user roles.

### Core Architecture

```
Real-Time Supabase ←→ Event Bus ←→ State Manager ←→ Services ←→ Dashboards
     (Database)    (Pub-Sub)   (Centralized)   (Business   (UI)
                                               Logic)
```

## 📦 Backend Modules Created

### 1. **Event Bus** (`src/lib/event-bus.ts`)
- Pub-sub system for cross-component communication
- Global event flow for all dashboard changes
- Event types: listings, contracts, deliveries, payments, notifications

### 2. **Real-Time Subscriptions** (`src/lib/realtime.ts`)
- Connects Supabase PostgreSQL to event bus
- Auto-emits events on database changes
- Handles listings, contracts, deliveries, payments, notifications

### 3. **State Manager** (`src/lib/state-manager.ts`)
- Centralized data store for all dashboards
- Auto-syncs with real-time events
- Provides stats and filtered data
- Cache for offline support

### 4. **Business Logic Services** (`src/lib/services.ts`)
- `FarmerService` - Listings, contracts, payments
- `OfftakerService` - Browse, order, receive
- `DriverService` - Deliveries, weighing
- `BrokerService` - All contracts, settlements
- `SupplierService` - Bulk operations

### 5. **Dashboard Initializer** (`src/lib/dashboard-init.ts`)
- Single-call setup for any dashboard
- Wires auth + PWA + real-time + services
- Sets up cross-dashboard listeners
- Auto-loads role-specific data

## 🔄 Real-Time Flow

```
1. Action in Dashboard A (e.g., farmer accepts contract)
                    ↓
2. Service method called (FarmerService.acceptContract)
                    ↓
3. Supabase database updated
                    ↓
4. Real-time subscription detects change
                    ↓
5. Event emitted (contract:status-changed)
                    ↓
6. State manager updates its state
                    ↓
7. All subscribed dashboards notified
                    ↓
8. Dashboard A, B, C, ... UI updates automatically
```

## 📱 Dashboard Types & Services

### Farmer Dashboard
```typescript
await initializeDashboard('farmer');

FarmerService.getMyListings()        // Active/draft listings
FarmerService.getMyContracts()       // Contracts as farmer
FarmerService.getDashboardStats()    // Earnings, active contracts
FarmerService.createListing(data)    // Create & publish listings
FarmerService.acceptContract(id)     // Accept orders
FarmerService.publishListing(id)     // Go live with listing
```

**Real-time Updates:**
- New orders arrive instantly
- Payment confirmations
- Delivery status changes
- Contract status updates

---

### Offtaker Dashboard
```typescript
await initializeDashboard('offtaker');

OfftakerService.getAvailableListings()    // Browse what's available
OfftakerService.getMyContracts()          // My active orders
OfftakerService.getDashboardStats()       // Spending, deliveries
OfftakerService.placeOrder(listing, qty, price)  // Create contract
OfftakerService.acceptDelivery(id)        // Confirm receipt
```

**Real-time Updates:**
- New listings appear
- Delivery status (in transit, completed)
- Payment requests
- Contract confirmations

---

### Driver Dashboard
```typescript
await initializeDashboard('driver');

DriverService.getMyDeliveries()         // Assigned deliveries
DriverService.getDashboardStats()       // Pending, in-transit, completed
DriverService.startDelivery(id, weight) // Record first weight
DriverService.completeDelivery(id, weight, buckets)  // Finish delivery
```

**Real-time Updates:**
- New delivery assignments
- Route/destination updates
- Payment processed notifications
- Next delivery ready

---

### Broker/Admin Dashboard
```typescript
await initializeDashboard('broker');

BrokerService.getAllContracts()        // Monitor all trades
BrokerService.getAllDeliveries()       // Track shipments
BrokerService.getContractDetails(id)   // Full contract view
BrokerService.getDashboardStats()      // KPIs, status breakdown
BrokerService.approveContract(id)      // Move to loading
BrokerService.settleContract(id)       // Initiate settlement
BrokerService.markContractSuccessful(id)  // Close contract
```

**Real-time Updates:**
- All contract changes
- Delivery progress
- Payment status
- Disputes/issues

---

### Supplier/Vendor Dashboard
```typescript
await initializeDashboard('supplier');

SupplierService.getMyListings()        // All supplier listings
SupplierService.getDashboardStats()    // Active, sold, etc.
SupplierService.bulkCreateListings(items)  // Import products
```

**Real-time Updates:**
- Listing status changes
- Order notifications
- Bulk operation feedback

## 🎯 Key Features

### Real-Time Everything
```typescript
// Every change syncs instantly across all open dashboards
stateManager.subscribe('contracts', (contracts) => {
  // This fires whenever ANY contract changes, anywhere
  updateUI(contracts);
});
```

### Cross-Dashboard Communication
```typescript
// Farmer Dashboard changes affect Driver, Broker, Offtaker dashboards
eventBus.subscribe('contract:status-changed', (data) => {
  // Driver dashboard sees new delivery
  // Broker dashboard sees contract progress
  // Offtaker dashboard sees order status
});
```

### Offline Support
```typescript
// All data cached automatically
// Works offline, syncs when connection restored
registerServiceWorker();

// Check connection
if (!isOnline()) {
  console.log('Using cached data');
}
```

### Type-Safe Business Logic
```typescript
// All services have full TypeScript types
const contract = await FarmerService.acceptContract(id);
// contract is Contract type with all properties

const stats = await DriverService.getDashboardStats();
// stats has { totalDeliveries, inTransit, completed, pending }
```

## 📖 Integration Examples

### Example 1: Simple Farmer Listing Display
```typescript
import { initializeDashboard } from '../lib/dashboard-init';
import { FarmerService } from '../lib/services';
import { stateManager } from '../lib/state-manager';

// Initialize
await initializeDashboard('farmer');

// Auto-load and subscribe to updates
stateManager.subscribe('listings', (listings) => {
  document.getElementById('listings-count').textContent = listings.length;
  listings.forEach(l => {
    console.log(`${l.title}: $${l.asking_price}`);
  });
});
```

### Example 2: Real-Time Order Notifications
```typescript
import { eventBus } from '../lib/event-bus';

// Listen for new contracts
eventBus.subscribe('contract:created', (contract) => {
  showNotification('New Order', `Quantity: ${contract.quantity}`);
  playSound('notification.mp3');
});

// Listen for status changes
eventBus.subscribe('contract:status-changed', (data) => {
  updateOrderStatus(data.id, data.newStatus);
});
```

### Example 3: Driver Tracking Live Updates
```typescript
import { DriverService } from '../lib/services';
import { stateManager } from '../lib/state-manager';

await initializeDashboard('driver');

// Deliveries update in real-time
stateManager.subscribe('deliveries', (deliveries) => {
  deliveries.forEach(d => {
    updateMapMarker(d.id, d.origin, d.destination, d.status);
  });
});
```

### Example 4: Broker Dashboard with Alerts
```typescript
import { BrokerService } from '../lib/services';
import { eventBus } from '../lib/event-bus';

await initializeDashboard('broker');

// Alert on important status changes
eventBus.subscribe('contract:status-changed', (data) => {
  if (data.newStatus === 'PENDING_SETTLEMENT') {
    showAlert('HIGH PRIORITY', `Contract ${data.id} ready for settlement`);
  }
});

// Auto-update stats
BrokerService.getDashboardStats().then(stats => {
  updateDashboardKPIs(stats);
});
```

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Supabase project created and configured
- [ ] Database schema initialized (run `server/schema.sql`)
- [ ] `.env` file has Supabase credentials
- [ ] Service worker working (DevTools → Application)
- [ ] Real-time subscriptions active (DevTools → Network → WebSocket)
- [ ] All dashboards tested with multi-tab view
- [ ] Offline mode tested (DevTools → Network → Offline)
- [ ] Authentication flow tested (signup, login, logout)
- [ ] Cross-dashboard updates verified (open multiple roles)

## 🔍 Monitoring & Debugging

### Check Real-Time Connection
```typescript
// In browser console
const { data } = await supabase.auth.getSession();
console.log('Auth status:', data.session ? 'logged in' : 'logged out');
```

### Check State Manager
```typescript
import { stateManager } from './lib/state-manager';
console.log('Current state:', stateManager.getState());
console.log('Contracts:', stateManager.getContracts());
```

### Check Event Bus
```typescript
import { eventBus } from './lib/event-bus';
eventBus.subscribe('contract:created', (data) => {
  console.log('Contract created:', data);
});
```

### Check Service Worker
```
DevTools → Application → Service Workers → Status
DevTools → Application → Cache Storage → zvida-v1
```

### Enable Debug Logging
```typescript
// In app initialization
localStorage.setItem('debug', 'zvida:*');

// Watch console for all events
```

## 📚 Files Structure

```
src/lib/
├── event-bus.ts              # Pub-sub communication
├── realtime.ts               # Supabase → EventBus bridge
├── state-manager.ts          # Centralized state
├── services.ts               # Business logic (all roles)
├── dashboard-init.ts         # Single init function
├── auth.ts                   # Authentication
├── api.ts                    # Database CRUD
├── supabase.ts               # Supabase client & types
└── pwa.ts                    # PWA & offline support

src/dashboards/
├── core.ts                   # Shared dashboard utilities
├── farmer.ts                 # Farmer-specific logic
├── offtaker.ts              # Offtaker-specific logic
├── driver.ts                # Driver-specific logic
├── zvida.ts                 # Admin/Broker dashboard
└── vendor.ts                # Supplier dashboard
```

## 🎓 Learning Path

1. **Understand the Architecture** → Read `BACKEND_ARCHITECTURE.md`
2. **Quick Integration** → Follow `QUICK_INTEGRATION.md`
3. **Setup Supabase** → Follow `BACKEND_SETUP.md`
4. **Implement a Dashboard** → Pick one, follow examples
5. **Test Real-Time** → Open 2 dashboards, make changes, watch sync
6. **Add Offline** → Work with DevTools offline mode
7. **Deploy** → Follow checklist above

## 💡 Pro Tips

- **Use Services, not raw API** - Services handle business logic
- **Subscribe once** - Don't poll, use event listeners
- **Test cross-dashboard** - Open multiple browser windows/tabs
- **Check DevTools** - Application tab shows cache, service workers
- **Use TypeScript** - All types are defined for autocomplete
- **Error handling** - Wrap service calls in try-catch
- **Performance** - All state is reactive, no manual DOM updates needed

## 🆘 Common Issues

**Real-time not updating?**
- Check Supabase credentials in `.env`
- Verify internet connection
- Check service worker status

**State not syncing?**
- Ensure `initializeDashboard()` was called
- Check console for subscription errors
- Verify user is authenticated

**Offline not working?**
- Service worker must be registered first
- Check cache storage in DevTools
- Reload page after first visit

**Auth issues?**
- Check Supabase email verification settings
- Ensure redirect URLs configured
- Check email confirmation link

## ✨ You're Ready!

The backend system is **fully implemented and wired**:

✅ Real-time syncing across dashboards  
✅ Event-driven architecture  
✅ Centralized state management  
✅ Business logic for all roles  
✅ Offline support with PWA  
✅ Type-safe with TypeScript  
✅ Production-ready  

**Next step:** Integrate it into your dashboard files using `QUICK_INTEGRATION.md`

Happy coding! 🚀
