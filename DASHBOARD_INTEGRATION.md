# Dashboard Integration Guide

This guide shows how to use Supabase backend in the ZVIDA dashboards.

## Quick Start

### 1. Import Required Utilities

```typescript
import { getAuthState, login, register, logout } from '../lib/auth';
import { 
  getListings, 
  getContracts, 
  getDeliveries, 
  createListing 
} from '../lib/api';
import { supabase } from '../lib/supabase';
```

### 2. Check Authentication

```typescript
import { getAuthState } from '../lib/auth';

function initDashboard() {
  const auth = getAuthState();
  
  if (!auth.isAuthenticated) {
    window.location.href = '/login.html';
    return;
  }

  console.log(`Welcome, ${auth.user.email} (${auth.role})`);
}
```

## Common Tasks

### Fetch Listings

```typescript
async function loadListings() {
  try {
    // Get all active listings
    const listings = await getListings({ status: 'active' });
    console.log(`Found ${listings.length} listings`);
    
    // Filter by category
    const grainListings = await getListings({ 
      status: 'active', 
      category: 'GRAIN' 
    });
  } catch (error) {
    console.error('Failed to load listings:', error);
  }
}
```

### Create a Listing

```typescript
async function createNewListing(title: string, quantity: number, price: number) {
  try {
    const auth = getAuthState();
    
    const listing = await createListing({
      seller_id: auth.user.id,
      commodity_id: 'your-commodity-id', // Get from database
      title,
      description: 'Your description',
      quantity,
      unit: 'kg',
      asking_price: price,
      category: 'GRAIN',
      status: 'draft', // Can publish later
    });

    console.log('Created listing:', listing.id);
    return listing;
  } catch (error) {
    console.error('Failed to create listing:', error);
  }
}
```

### Subscribe to Real-time Updates

```typescript
function watchListings(callback: (listing: any) => void) {
  const subscription = supabase
    .from('listings')
    .on('*', (payload) => {
      if (payload.eventType === 'INSERT') {
        console.log('New listing:', payload.new);
        callback(payload.new);
      } else if (payload.eventType === 'UPDATE') {
        console.log('Listing updated:', payload.new);
        callback(payload.new);
      }
    })
    .subscribe();

  return () => subscription.unsubscribe();
}
```

### Get User's Contracts

```typescript
async function loadMyContracts() {
  try {
    const auth = getAuthState();
    
    // Get contracts where user is farmer
    const farmerContracts = await getContracts({
      farmer_id: auth.user.id
    });

    // Get contracts where user is offtaker
    const offtakerContracts = await getContracts({
      offtaker_id: auth.user.id
    });

    return { farmerContracts, offtakerContracts };
  } catch (error) {
    console.error('Failed to load contracts:', error);
  }
}
```

### Update Contract Status

```typescript
async function acceptContract(contractId: string) {
  try {
    const updated = await updateContractStatus(contractId, 'LOADING');
    console.log('Contract status updated to LOADING');
    return updated;
  } catch (error) {
    console.error('Failed to update contract:', error);
  }
}
```

### Search Listings

```typescript
async function searchProducts(query: string) {
  try {
    const results = await searchListings(query);
    console.log(`Found ${results.length} products matching "${query}"`);
    return results;
  } catch (error) {
    console.error('Search failed:', error);
  }
}
```

### Handle Offline Mode

```typescript
import { isOnline, onOnlineStatusChange } from '../lib/pwa';

function setupOfflineHandling() {
  // Check current status
  if (!isOnline()) {
    console.log('App is offline - using cached data');
  }

  // Listen for changes
  const unsubscribe = onOnlineStatusChange((online) => {
    if (online) {
      console.log('Back online - syncing data');
      syncWithServer();
    } else {
      console.log('Offline - data will sync when back online');
    }
  });

  return unsubscribe;
}
```

### Upload Product Photo

```typescript
async function uploadListingPhoto(listingId: string, file: File) {
  try {
    const auth = getAuthState();
    const path = `${auth.user.id}/${listingId}/${file.name}`;

    const { data, error } = await supabase.storage
      .from('listings')
      .upload(path, file, { upsert: true });

    if (error) throw error;

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('listings')
      .getPublicUrl(path);

    console.log('Photo uploaded:', urlData.publicUrl);
    return urlData.publicUrl;
  } catch (error) {
    console.error('Upload failed:', error);
  }
}
```

## Dashboard Example

```typescript
// src/dashboards/farmer.ts
import { initDesignSystem } from '../ui-utils';
import { getAuthState, logout } from '../lib/auth';
import { getListings, getFarms, getContracts } from '../lib/api';
import { onOnlineStatusChange } from '../lib/pwa';

export async function initFarmerDashboard() {
  // Initialize UI
  initDesignSystem();

  // Check auth
  const auth = getAuthState();
  if (!auth.isAuthenticated) {
    window.location.href = '/login.html';
    return;
  }

  // Update header
  const userNameEl = document.getElementById('user-name');
  if (userNameEl) {
    userNameEl.textContent = auth.user?.email || 'Farmer';
  }

  // Load data
  try {
    const [farms, myListings, myContracts] = await Promise.all([
      getFarms(auth.user.id),
      getListings({ seller_id: auth.user.id }),
      getContracts({ farmer_id: auth.user.id }),
    ]);

    console.log(`Loaded ${farms.length} farms, ${myListings.length} listings`);
    console.log(`You have ${myContracts.length} active contracts`);

    // Render data to UI
    renderFarms(farms);
    renderListings(myListings);
    renderContracts(myContracts);
  } catch (error) {
    console.error('Failed to load dashboard:', error);
    showError('Failed to load dashboard data');
  }

  // Monitor offline status
  onOnlineStatusChange((isOnline) => {
    const statusEl = document.getElementById('connection-status');
    if (statusEl) {
      statusEl.textContent = isOnline ? 'Online' : 'Offline';
      statusEl.className = isOnline ? 'status-online' : 'status-offline';
    }
  });

  // Setup logout
  const logoutBtn = document.getElementById('logout-btn');
  logoutBtn?.addEventListener('click', async () => {
    await logout();
    window.location.href = '/login.html';
  });
}

function renderFarms(farms: any[]) {
  const container = document.getElementById('farms-list');
  if (!container) return;

  container.innerHTML = farms.map(f => `
    <div class="farm-card">
      <h3>${f.name}</h3>
      <p>${f.size_hectares} hectares - ${f.location}</p>
    </div>
  `).join('');
}

function renderListings(listings: any[]) {
  // Similar implementation
}

function renderContracts(contracts: any[]) {
  // Similar implementation
}

function showError(message: string) {
  // Show error notification
  console.error(message);
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initFarmerDashboard);
```

## API Reference

### Authentication
- `login(email, password)` - User login
- `register(email, password, name, role)` - User signup
- `logout()` - User logout
- `getAuthState()` - Get current auth state
- `onAuthChange(callback)` - Listen for auth changes

### Listings
- `getListings(filters?)` - Fetch listings
- `getListingById(id)` - Get single listing
- `createListing(data)` - Create new listing
- `updateListing(id, updates)` - Update listing
- `searchListings(query)` - Search listings

### Contracts
- `getContracts(filters?)` - Fetch contracts
- `getContractById(id)` - Get single contract
- `createContract(data)` - Create contract
- `updateContractStatus(id, status)` - Update status

### Deliveries
- `getDeliveries(filters?)` - Fetch deliveries
- `createDelivery(data)` - Create delivery
- `updateDelivery(id, updates)` - Update delivery

### Farms
- `getFarms(userId)` - Get user's farms
- `createFarm(data)` - Create farm
- `updateFarm(id, updates)` - Update farm

### Payments
- `getPayments(filters?)` - Fetch payments
- `createPayment(data)` - Create payment
- `updatePaymentStatus(id, status)` - Update status

## Error Handling

```typescript
try {
  await getListings();
} catch (error) {
  if (error.status === 403) {
    console.log('Access denied - check permissions');
  } else if (error.message.includes('Network')) {
    console.log('Network error - check your connection');
  } else {
    console.log('Unknown error:', error);
  }
}
```

## Performance Tips

1. **Use filters** - Reduce data transfer:
   ```typescript
   // Good - only fetch active listings
   await getListings({ status: 'active' });
   
   // Avoid - fetches all listings
   const all = await getListings();
   const active = all.filter(l => l.status === 'active');
   ```

2. **Cache data locally** - Reduce server requests:
   ```typescript
   let cachedListings = null;
   
   async function getListingsWithCache() {
     if (cachedListings) return cachedListings;
     cachedListings = await getListings();
     return cachedListings;
   }
   ```

3. **Use subscriptions** - Real-time without polling:
   ```typescript
   // Good - efficient real-time
   supabase.from('listings').on('*', callback).subscribe();
   
   // Avoid - wastes resources
   setInterval(() => refreshListings(), 5000);
   ```

## Debugging

Enable debug logging:

```typescript
// In browser console
localStorage.setItem('debug', 'zvida:*');

// Check auth state
import { getAuthState } from './lib/auth';
console.log(getAuthState());

// Check service worker
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs);
});

// Check IndexedDB
indexedDB.databases().then(dbs => {
  console.log('IndexedDB:', dbs);
});
```
