# ZVIDAMBANO — Supabase Backend Guide

## Overview

With Supabase, your backend is fully managed — no Express server needed. Here's how every backend concern is handled:

| Backend Concern | Supabase Solution | Status |
|----------------|-------------------|--------|
| **WebSockets / Realtime** | Supabase Realtime (built-in) | ✅ Already set up in `src/lib/realtime.ts` |
| **REST API** | Supabase Auto-generated REST API (PostgREST) | ✅ Built-in, no code needed |
| **Authentication** | Supabase Auth (JWT, OAuth, magic links) | ✅ Already set up in `src/lib/supabase.ts` |
| **Database** | Supabase PostgreSQL | ✅ Schema in `supabase-schema.sql` |
| **File Uploads** | Supabase Storage | ✅ Built-in, just need buckets |
| **Server-side Logic** | Supabase Edge Functions (Deno) | ✅ Created in `supabase/functions/` |
| **Scheduled Tasks** | pg_cron extension | ✅ Add to SQL schema |
| **Full-text Search** | PostgreSQL `ilike` / `tsvector` | ✅ Built-in |
| **Row-level Security** | PostgreSQL RLS Policies | ✅ In schema |

---

## 1. WebSockets / Realtime

Supabase has **built-in WebSocket support** via Realtime. No separate WebSocket server is needed.

### How It Works

Supabase uses Phoenix Channels under the hood. When you call `supabase.channel()`, it opens a WebSocket connection to the Supabase Realtime server. Any database change (INSERT, UPDATE, DELETE) is instantly pushed to all connected clients.

### Your Existing Setup (`src/lib/realtime.ts`)

Your project already has full realtime subscriptions:

```typescript
// Subscribe to listing changes (INSERT, UPDATE, DELETE)
const channel = supabase.channel('listings:all').on(
  'postgres_changes',
  { event: '*', schema: 'public', table: 'listings' },
  (payload) => {
    if (payload.eventType === 'INSERT') {
      console.log('New listing:', payload.new);
    }
  }
);
await channel.subscribe();
```

### What's Already Subscribed

| Channel | Table | Events | Purpose |
|---------|-------|--------|---------|
| `listings:all` | listings | INSERT, UPDATE, DELETE | Live marketplace updates |
| `contracts:all` | contracts | INSERT, UPDATE | Contract status changes |
| `deliveries:all` | deliveries | INSERT, UPDATE | Delivery tracking + GPS |
| `payments:all` | payments | INSERT, UPDATE | Payment status updates |
| `notifications:{userId}` | notifications | INSERT | Personal notifications |

### Live GPS Tracking Example

```typescript
// In driver dashboard — track GPS location
import { supabase } from './lib/supabase';

// Update GPS coordinates every 30 seconds
setInterval(async () => {
  navigator.geolocation.getCurrentPosition(async (pos) => {
    await supabase
      .from('deliveries')
      .update({
        gps_lat: pos.coords.latitude,
        gps_lng: pos.coords.longitude,
      })
      .eq('id', deliveryId);
  });
}, 30000);

// In offtaker dashboard — watch GPS changes in real-time
const channel = supabase.channel(`delivery:${deliveryId}`).on(
  'postgres_changes',
  {
    event: 'UPDATE',
    schema: 'public',
    table: 'deliveries',
    filter: `id=eq.${deliveryId}`,
  },
  (payload) => {
    const { gps_lat, gps_lng } = payload.new;
    updateMapMarker(gps_lat, gps_lng);
  }
);
await channel.subscribe();
```

### Real-time Chat Example

```typescript
// Send a message
await supabase.from('messages').insert({
  sender_id: currentUser.id,
  receiver_id: recipientId,
  body: 'Hello!',
});

// Listen for new messages in real-time
const channel = supabase.channel(`chat:${otherUserId}`).on(
  'postgres_changes',
  {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `or=(sender_id.eq.${currentUser.id},receiver_id.eq.${currentUser.id})`,
  },
  (payload) => {
    displayMessage(payload.new);
  }
);
await channel.subscribe();
```

---

## 2. Supabase Edge Functions (Server-side Logic)

Edge Functions replace your Express server routes. They run on Deno (serverless) and are deployed to Supabase's edge network.

### Created Edge Functions

| Function | Path | Purpose |
|----------|------|---------|
| `create-contract` | `supabase/functions/create-contract/index.ts` | Creates contract + notifications + updates listing |
| `update-delivery-status` | `supabase/functions/update-delivery-status/index.ts` | Updates delivery + GPS + weight data + notifications |
| `generate-settlement` | `supabase/functions/generate-settlement/index.ts` | Generates farmer settlement + offtaker invoice + broker commission |

### How to Deploy Edge Functions

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Deploy a function
supabase functions deploy create-contract

# Deploy all functions
supabase functions deploy create-contract
supabase functions deploy update-delivery-status
supabase functions deploy generate-settlement
```

### How to Call Edge Functions from Frontend

```typescript
import { supabase } from './lib/supabase';

// Call create-contract Edge Function
const { data, error } = await supabase.functions.invoke('create-contract', {
  body: {
    farmer_id: user.id,
    offtaker_id: '...',
    broker_id: '...',
    commodity_id: '...',
    quantity: 5000,
    unit: 'kg',
    farmer_price: 420,
    offtaker_price: 450,
    broker_commission: 30,
  },
});

// Call update-delivery-status Edge Function
const { data, error } = await supabase.functions.invoke('update-delivery-status', {
  body: {
    delivery_id: '...',
    status: 'IN_TRANSIT',
    gps_lat: -17.8318,
    gps_lng: 31.0524,
  },
});

// Call generate-settlement Edge Function
const { data, error } = await supabase.functions.invoke('generate-settlement', {
  body: {
    contract_id: '...',
  },
});
```

### How to Test Edge Functions Locally

```bash
# Start local Supabase
supabase start

# Serve functions locally
supabase functions serve

# Test with curl
curl -X POST http://localhost:54321/functions/v1/create-contract \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"farmer_id":"...","offtaker_id":"...","quantity":5000}'
```

---

## 3. Supabase Storage (File Uploads)

Supabase provides built-in file storage for uploads like listing photos, weighbridge tickets, and documents.

### Create Storage Buckets

Run this SQL in the Supabase SQL Editor:

```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('listing-photos', 'listing-photos', true),
  ('weighbridge-tickets', 'weighbridge-tickets', false),
  ('quality-scan-photos', 'quality-scan-photos', false),
  ('documents', 'documents', false),
  ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Anyone can read listing photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'listing-photos');

CREATE POLICY "Authenticated users can upload listing photos" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'listing-photos');

CREATE POLICY "Anyone can read avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload avatars" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'avatars');

CREATE POLICY "Users can read weighbridge tickets" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'weighbridge-tickets');

CREATE POLICY "Drivers can upload weighbridge tickets" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'weighbridge-tickets');

CREATE POLICY "Users can read documents" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'documents');

CREATE POLICY "Users can upload documents" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'documents');
```

### Upload Files from Frontend

```typescript
import { supabase } from './lib/supabase';

// Upload listing photo
const file = fileInput.files[0];
const fileExt = file.name.split('.').pop();
const fileName = `${user.id}-${Date.now()}.${fileExt}`;

const { data, error } = await supabase.storage
  .from('listing-photos')
  .upload(fileName, file);

if (error) throw error;

// Get public URL
const { data: urlData } = supabase.storage
  .from('listing-photos')
  .getPublicUrl(fileName);

// Save URL to database
await supabase.from('listings').update({
  photo_url: urlData.publicUrl,
}).eq('id', listingId);

// Upload weighbridge ticket (private bucket)
const { data: ticketData, error: ticketError } = await supabase.storage
  .from('weighbridge-tickets')
  .upload(`ticket-${deliveryId}-${Date.now()}.jpg`, file);

// Create signed URL for private file (expires in 1 hour)
const { data: signedUrl } = await supabase.storage
  .from('weighbridge-tickets')
  .createSignedUrl(ticketData.path, 3600);
```

---

## 4. Supabase Auth (Authentication)

Your project already has auth set up in `src/lib/supabase.ts` and `src/lib/auth.ts`.

### Features

- **Email/Password** — `signUp()`, `signIn()`
- **Session Management** — JWT tokens, auto-refresh, persistent sessions
- **OAuth** — Google, Facebook, Apple, etc.
- **Magic Links** — Passwordless email login
- **Phone Auth** — SMS OTP
- **Row-Level Security** — Users can only access their own data

### Auth Examples

```typescript
import { supabase, signUp, signIn, signOut, getCurrentUser, onAuthChange } from './lib/supabase';

// Register a new farmer
await signUp('farmer@example.com', 'password123', {
  full_name: 'John Doe',
  role: 'farmer',
  phone: '+263771234567',
});

// Login
await signIn('farmer@example.com', 'password123');

// Get current user
const user = await getCurrentUser();

// Listen for auth state changes
onAuthChange((session) => {
  if (session) {
    console.log('User logged in:', session.user);
  } else {
    console.log('User logged out');
  }
});

// OAuth login (Google)
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: window.location.origin + '/dashboard',
  },
});

// Magic link (passwordless)
const { data, error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com',
  options: {
    emailRedirectTo: window.location.origin + '/dashboard',
  },
});

// Reset password
const { data, error } = await supabase.auth.resetPasswordForEmail('user@example.com');
```

---

## 5. Auto-generated REST API

Supabase automatically generates a REST API for every table. No need to write route files!

### Examples

```typescript
import { supabase } from './lib/supabase';

// GET all listings (with filters)
const { data, error } = await supabase
  .from('listings')
  .select(`
    *,
    seller:users(full_name, phone),
    commodity:commodities(name, category)
  `)
  .eq('status', 'active')
  .eq('category', 'GRAIN')
  .order('created_at', { ascending: false })
  .limit(20);

// GET single listing by ID
const { data, error } = await supabase
  .from('listings')
  .select('*')
  .eq('id', listingId)
  .single();

// POST (create)
const { data, error } = await supabase
  .from('listings')
  .insert({
    seller_id: user.id,
    title: 'Premium Wheat',
    quantity: 5000,
    unit: 'kg',
    asking_price: 450,
  })
  .select()
  .single();

// PATCH (update)
const { data, error } = await supabase
  .from('listings')
  .update({ status: 'sold', asking_price: 400 })
  .eq('id', listingId)
  .select()
  .single();

// DELETE
const { error } = await supabase
  .from('listings')
  .delete()
  .eq('id', listingId);

// Full-text search
const { data, error } = await supabase
  .from('listings')
  .select('*')
  .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
  .eq('status', 'active')
  .limit(20);
```

---

## 6. Scheduled Tasks (pg_cron)

Run scheduled tasks using PostgreSQL's `pg_cron` extension.

### Setup

Run this SQL in the Supabase SQL Editor:

```sql
-- Enable pg_cron extension
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Example: Expire listings older than 30 days
SELECT cron.schedule(
  'expire-old-listings',
  '0 2 * * *',  -- Run at 2 AM daily
  $$
    UPDATE listings
    SET status = 'expired'
    WHERE status = 'active'
    AND created_at < now() - interval '30 days';
  $$
);

-- Example: Send weekly summary notifications every Monday
SELECT cron.schedule(
  'weekly-summary',
  '0 9 * * 1',  -- Every Monday at 9 AM
  $$
    INSERT INTO notifications (user_id, title, body, type)
    SELECT id, 'Weekly Summary', 'Check your dashboard for weekly updates.', 'info'
    FROM users WHERE role IN ('farmer', 'offtaker', 'broker');
  $$
);
```

---

## 7. Database Triggers

Triggers run automatically when data changes — no Express middleware needed.

### Examples (Already in Schema)

```sql
-- Auto-update updated_at on every row update
CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON public.listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-generate contract number
CREATE DEFAULT generate_contract_number() ON public.contracts;
```

### Custom Trigger Example: Auto-create delivery when contract is LOADING

```sql
CREATE OR REPLACE FUNCTION auto_create_delivery()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'LOADING' AND OLD.status != 'LOADING' THEN
    INSERT INTO deliveries (contract_id, status)
    VALUES (NEW.id, 'PENDING');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_create_delivery
  AFTER UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION auto_create_delivery();
```

---

## 8. Complete Architecture Comparison

### Before (Express + SQLite)

```
Frontend (Vite) → Express API (server/) → SQLite (zvida.db)
                   18 route files
                   Manual SQL queries
                   No auth middleware
                   No realtime
```

### After (Supabase)

```
Frontend (Vite) → Supabase Auto REST API → PostgreSQL
                 Supabase Realtime (WebSockets) → Live updates
                 Supabase Auth → JWT tokens + RLS
                 Supabase Storage → File uploads
                 Supabase Edge Functions → Server-side logic
                 pg_cron → Scheduled tasks
                 Database Triggers → Auto business logic
```

### What You Don't Need Anymore

| Express Server File | Supabase Replacement |
|---------------------|---------------------|
| `server/index.js` | Not needed — Supabase is the server |
| `server/db.js` | `supabase-schema.sql` — run in SQL Editor |
| `server/seed.js` | Seed data in `supabase-schema.sql` |
| `server/routes/auth.js` | Supabase Auth (built-in) |
| `server/routes/listings.js` | `supabase.from('listings')` — auto REST API |
| `server/routes/contracts.js` | `supabase.from('contracts')` + Edge Function |
| `server/routes/deliveries.js` | `supabase.from('deliveries')` + Edge Function |
| `server/routes/payments.js` | `supabase.from('payments')` — auto REST API |
| `server/routes/disputes.js` | `supabase.from('disputes')` — auto REST API |
| `server/routes/quality.js` | `supabase.from('quality_scans')` — auto REST API |
| `server/routes/settlements.js` | `supabase.from('farmer_settlements')` + Edge Function |
| `server/routes/commissions.js` | `supabase.from('broker_commission_ledger')` — auto REST API |
| `server/routes/messages.js` | `supabase.from('messages')` + Realtime |
| `server/routes/notifications.js` | `supabase.from('notifications')` + Realtime |
| `server/routes/prices.js` | `supabase.from('price_board')` — auto REST API |
| `server/routes/farms.js` | `supabase.from('farms')` — auto REST API |
| `server/routes/input-orders.js` | `supabase.from('input_orders')` — auto REST API |
| `server/routes/financing.js` | `supabase.from('financing_applications')` — auto REST API |
| `server/routes/equipment.js` | `supabase.from('equipment_listings')` — auto REST API |
| `server/routes/documents.js` | `supabase.from('documents')` + Storage |
| `server/routes/search.js` | `supabase.from(table).ilike()` — built-in search |

---

## 9. Setup Checklist

1. ✅ Create Supabase project at https://supabase.com
2. ✅ Run `supabase-schema.sql` in SQL Editor
3. ✅ Update `.env` with Supabase URL + anon key
4. ✅ Deploy Edge Functions: `supabase functions deploy <name>`
5. ✅ Create Storage buckets (SQL above)
6. ✅ Set up pg_cron scheduled tasks (SQL above)
7. ✅ Wire up dashboards to use `src/lib/api.ts` functions
8. ✅ Start dev server: `npm run dev`

---

## 10. File Summary

| File | Purpose |
|------|---------|
| `supabase-schema.sql` | Complete database schema (19 tables, RLS, triggers, seed data) |
| `.env` | Supabase URL + anon key |
| `src/lib/supabase.ts` | Supabase client + types + auth helpers |
| `src/lib/api.ts` | API functions (listings, contracts, deliveries, farms, payments, search) |
| `src/lib/auth.ts` | Auth context |
| `src/lib/realtime.ts` | WebSocket subscriptions (listings, contracts, deliveries, payments, notifications) |
| `src/lib/services.ts` | Business logic services |
| `supabase/functions/create-contract/` | Edge Function: create contract + notifications |
| `supabase/functions/update-delivery-status/` | Edge Function: update delivery + GPS + notifications |
| `supabase/functions/generate-settlement/` | Edge Function: generate settlements + invoices + commissions |