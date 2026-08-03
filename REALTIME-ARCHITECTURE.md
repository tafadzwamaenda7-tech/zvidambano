# ZVIDA Realtime & Trigger Architecture

How live updates flow from Postgres to the browser dashboards, and the
documented contract between the database (publication, triggers, notifications)
and the client (`src/lib/realtime.ts`, `src/dashboards/core.ts`).

---

## 1. Overview

A signed-in, non-demo account ("real account") gets live updates over
websockets. The chain is:

```
Postgres change (INSERT/UPDATE/DELETE on a published table)
        │
        ▼
Realtime publication (supabase_realtime) ── RLS-filtered ──► websocket event
        │                                                          │
        └── notify_* triggers ──► INSERT INTO notifications          │
                                        │                           ▼
                                        └────────────────► client: refreshBell()
                                              +  client: hydrateTables(table names)
```

Rules enforced in code:

- Only real accounts subscribe (`getLiveAccount()` must exist and
  `isDemo` must be false). Demo accounts never open websocket channels.
- Postgres Realtime applies RLS on the subscriber's JWT, so each client only
  receives changes to rows it is allowed to `SELECT`. This is the security
  boundary — the client never filters server-side events by identity itself.
- Table events are **debounced** (350 ms) and delivered as a deduplicated set
  of changed table names, so the dashboard refetches only the stores those
  tables feed — never a full page/global refresh.

---

## 2. Database side

### 2.1 Publication

All live tables belong to the `supabase_realtime` publication. There are **9
published tables**:

| Table           | Feeds (client store)      | Notify trigger fan-out? |
| --------------- | ------------------------- | ----------------------- |
| `listings`      | marketplace catalog       | `notify_new_listing`    |
| `market_orders` | orders store              | `notify_market_order_change` |
| `contracts`     | freight/loads store       | `notify_contract_status_change` |
| `deliveries`    | freight/loads store       | `notify_delivery_status_change` |
| `rfqs`          | RFQ store                 | —                       |
| `notifications` | bell badge (async fetch)  | — (is the fan-out target) |
| `payments`      | broker/offtaker views     | `notify_payment_status_change` |
| `messages`      | chat (async fetch)        | —                       |
| `price_board`   | market prices             | —                       |

To publish a new table:

```sql
alter publication supabase_realtime add table public.<table>;
alter table public.<table> replica identity full;
```

### 2.2 REPLICA IDENTITY FULL

All 9 published tables are set to `replica identity full`
(`pg_class.relreplident = 'f'`, verified in the live DB). This makes Postgres
include the full **old row** in the change payload, so `DELETE` and `UPDATE`
websocket events carry the row's prior values. Without it, those events ship
only primary keys and the client cannot reconstruct what changed.

The setting is mirrored in `supabase-schema.sql`:

```sql
alter table public.<table> replica identity full;
```

### 2.3 Notification triggers → fan-out

Several tables have `AFTER ... INSERT OR UPDATE` triggers
(`supabase-triggers.sql`) that `INSERT INTO notifications (...)`. Because
`notifications` is itself a published table, that insert is pushed to every
subscribed client, whose `refreshBell()` then refetches the unread count. This
is the single mechanism that makes "status changed → bell badge updates"
work without the client polling.

Current notify triggers:

| Function                      | On table        |
| ----------------------------- | --------------- |
| `notify_contract_status_change` | `contracts`   |
| `notify_delivery_status_change` | `deliveries` |
| `notify_payment_status_change`  | `payments`    |
| `notify_new_listing`           | `listings`     |
| `notify_dispute_created`       | `disputes`     |
| `notify_quality_scan`          | `quality_scans` |
| `notify_input_order_change`    | `input_orders` |
| `notify_market_order_change`   | `market_orders` |

Notes:

- These triggers insert into `notifications` using `security definer` /
  `set search_path` so they can write the notification row regardless of the
  changing user's RLS grants.
- `disputes`, `quality_scans`, and `input_orders` are **not** published tables
  themselves; their fan-out happens only via the notification insert. The
  dashboard still catches the resulting `notifications` event.

---

## 3. Client side

### 3.1 `src/lib/realtime.ts` — channel factory

`startRealtime(handlers)` opens three kinds of channel for the current real
account and returns a stop function (`beforeunload` calls it).

`ROLE_TABLES` decides which `postgres_changes` subscriptions a role gets:

```ts
farmer:  ['contracts', 'deliveries', 'market_orders', 'notifications', 'listings']
offtaker:['contracts', 'deliveries', 'market_orders', 'listings', 'notifications']
supplier:['listings', 'market_orders', 'notifications']
driver:  ['deliveries', 'contracts', 'notifications']
broker/admin/compliance: ['listings','contracts','deliveries','payments','market_orders','notifications']
support: ['notifications']
```

Channel types:

1. **Table changes** — one channel per table
   (`live-<userId>-<table>`), subscribed to `postgres_changes` with
   `{ event: '*', schema: 'public', table }`. Each event adds the table name
   to a `Set`, and a 350 ms timer flushes the deduplicated list to
   `handlers.onTables(tables)`.
2. **Presence** — channel `presence-<userId>`, `presence.track()` on
   subscribe; `sync` events call `handlers.onPresence(count)`. Also serves as
   a connection-health signal (surfaces "N devices online" on the live badge).
3. **Broadcast** — two channels:
   - `broadcast-<userId>`: carries `force-logout` events from other devices of
     the same account → `handlers.onForceLogout()`.
   - `zvida-announce`: shared channel for admin announcements →
     `handlers.onAnnounce(title, body)`.

Helpers:

- `broadcastLogout(userId)` — sends a `force-logout` broadcast **before** this
  device signs itself out (JWT still valid). Called from
  `signOutAndRedirect()` in `src/lib/auth-ui.ts`.
- `broadcastAnnounce(title, body?)` — sends an admin announcement to every
  subscribed dashboard.
- `initializeRealtimeSubscriptions()` — legacy no-op wrapper retained so old
  callers (`main.ts`, `dashboard-init.ts`) keep working; per-dashboard realtime
  is started via `startRealtime()` instead.

### 3.2 `src/dashboards/core.ts` — granular refetch

`TABLE_REFRESH` maps a changed table name to the store refetcher:

```ts
listings:      refreshLiveCatalog   // fetchProducts → marketStore.cat
market_orders: refreshLiveOrders    // fetchOrders   → marketStore.orders
contracts:     refreshLiveLoads     // fetchLoads    → freightStore.loads
deliveries:    refreshLiveLoads     // fetchLoads    → freightStore.loads
rfqs:          refreshLiveRfqs      // fetchOpenRfqs / fetchMyRfqs
notifications / payments / messages: async no-op   // bell + views fetch on demand
```

`hydrateTables(tables)` dedupes, runs the matching refetchers (awaiting each),
then calls `refresh()` once to re-render. The dashboard wires it up:

```ts
const stopLive = startRealtime({
  onTables:   (tables) => { void hydrateTables(tables); void refreshBell(); },
  onAnnounce: (title, body) => toast(...),
  onPresence: (count) => { /* live badge tooltip */ },
  onForceLogout: () => void signOutAndRedirect(),
});
window.addEventListener('beforeunload', stopLive);
```

`refreshBell()` refetches the unread-notification count via
`fetchUnreadNotifications()` and updates the badge.

### 3.3 `src/lib/zvida-live.ts` — data layer

- `syncAll()` — initial hydration of every store (catalog, orders, loads,
  RFQs, notifications).
- Per-store fetchers used by `TABLE_REFRESH`: `fetchProducts`, `fetchOrders`,
  `fetchLoads`, `fetchOpenRfqs`, `fetchMyRfqs`, `fetchUnreadNotifications`.

### 3.4 Polling still present (fallback)

Realtime is the primary path for real accounts, but low-frequency polling
remains for correctness/robustness: driver deliverable polls (~7 s), farmer
live orders (2 s), zvida market (5 s). These are cheap and double as a
reconnect safety net if a websocket drops silently.

---

## 4. Operational notes

- **Adding a table to realtime**: add it to the publication, set
  `replica identity full`, then add a `TABLE_REFRESH` entry in
  `core.ts` and a role entry in `ROLE_TABLES` (unless it should be
  async-fetch-only like `notifications`/`payments`/`messages`).
- **Security**: never widen `ROLE_TABLES` without confirming RLS on that table
  restricts rows to the subscriber. Realtime enforces RLS, but a table with
  permissive SELECT policies would leak rows to everyone subscribed.
- **Trigger fan-out**: keep `INSERT INTO notifications` in `security definer`
  functions. If a new status transition needs a bell alert, add a notify
  trigger in `supabase-triggers.sql` (and `notifications` must remain
  published).
- **Truth files**: `supabase-schema.sql` (publication-adjacent DDL +
  `replica identity full` + RLS), `supabase-triggers.sql` (trigger functions
  and triggers), `src/lib/realtime.ts` (channels), `src/dashboards/core.ts`
  (refetch wiring).
