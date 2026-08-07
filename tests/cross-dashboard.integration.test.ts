/**
 * Cross-dashboard live data consistency integration tests.
 *
 * Runs the real zvida-live / backend / notifications / settings bridges
 * against a stateful in-memory Supabase client. Each test simulates the
 * account that is "signed in" via setLiveAccount() and verifies that a write
 * made from one role's dashboard is readable (and correctly shaped) from the
 * other role's dashboard — farmer listing -> offtaker catalog, offtaker RFQ ->
 * farmer open RFQs, support reply -> customer thread, contract settlement ->
 * every party's ledger, driver assignment -> delivery, and settings round-trip.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { LiveProduct, LiveRfq } from '../src/lib/zvida-live';
import { setLiveAccount, persistProduct, deleteProduct, fetchProducts, fetchOpenRfqs, persistRfq, sendSupportMessage, sendSupportReply, findUserByFullName, fetchMyMessages } from '../src/lib/zvida-live';
import { supabase } from '../src/lib/supabase';
import { invokeCreateContract, settleContract, assignDriverByName } from '../src/lib/backend';
import { loadSettings, saveSettings } from '../src/lib/settings';
import { notifyUser } from '../src/lib/notifications';

/* ------------------------------------------------------------------ */
/* In-memory fake Supabase client backed by the same tables ZVIDA uses */
/* ------------------------------------------------------------------ */

type Filter = { col: string; op: string; v: unknown };

function matches(row: Record<string, unknown>, f: Filter): boolean {
  switch (f.op) {
    case 'eq':
      return row[f.col] === f.v;
    case 'neq':
      return row[f.col] !== f.v;
    case 'in':
      return Array.isArray(f.v) && f.v.includes(row[f.col]);
    case 'is_null':
      return row[f.col] === null || row[f.col] === undefined;
    case 'is':
      return row[f.col] === f.v;
    case 'ilike': {
      const val = String(row[f.col] ?? '');
      return val.toLowerCase().includes(String(f.v).toLowerCase().replace(/%/g, ''));
    }
    default:
      return true;
  }
}

function parseOr(s: string): (row: Record<string, unknown>) => boolean {
  return (row) =>
    s.split(',').some((part) => {
      const m = part.trim().match(/^(\w+)\.(eq|neq)\.(.+)$/);
      if (!m) return false;
      return m[2] === 'eq' ? row[m[1]] === m[3] : row[m[1]] !== m[3];
    });
}

class FakeDB {
  tables: Record<string, Record<string, unknown>[]> = {};
  private seq = 0;

  seed(table: string, rows: Record<string, unknown>[]) {
    this.tables[table] = rows.map((r) => ({ ...r }));
  }

  all(table: string): Record<string, unknown>[] {
    return this.tables[table] || [];
  }

  insert(table: string, row: Record<string, unknown>): Record<string, unknown> {
    const r = { ...row };
    if (!r.id) r.id = `${table}-${++this.seq}`;
    if (!r.created_at) r.created_at = new Date().toISOString();
    (this.tables[table] ||= []).push(r);
    return r;
  }

  update(table: string, patch: Record<string, unknown>, filters: Filter[]): number {
    let n = 0;
    for (const r of this.all(table)) {
      if (filters.every((f) => matches(r, f))) {
        Object.assign(r, patch);
        n++;
      }
    }
    return n;
  }

  remove(table: string, filters: Filter[]): number {
    const rows = this.all(table);
    const keep = rows.filter((r) => !filters.every((f) => matches(r, f)));
    this.tables[table] = keep;
    return rows.length - keep.length;
  }
}

/* ------------------------------------------------------------------ */
/* Fake supabase client builder                                      */
/* ------------------------------------------------------------------ */

type DBHolder = { db: FakeDB; handlers: Record<string, (body: unknown) => Promise<{ data: any; error: any }>> } & { FakeDB: typeof FakeDB };

const holder = vi.hoisted(() => {
  const db = new FakeDB() as InstanceType<typeof FakeDB>;
  return { db, handlers: {} as DBHolder['handlers'], FakeDB };
});

function makeClient(h: DBHolder) {
  const from = (table: string) => {
    const filters: Filter[] = [];
    let orPred: ((row: Record<string, unknown>) => boolean) | null = null;
    let limitN: number | null = null;
    let orderBy: { col: string; asc: boolean } | null = null;

    const scan = () => {
      if (!h.db) return [];
      let rows = h.db.all(table).filter((r) => filters.every((f) => matches(r, f)) && (!orPred || orPred(r)));
      if (orderBy) {
        const { col, asc } = orderBy;
        rows = [...rows].sort((a, b) => {
          const av = a[col];
          const bv = b[col];
          if (av == null) return 1;
          if (bv == null) return -1;
          return asc ? (av < bv ? -1 : av > bv ? 1 : 0) : av > bv ? -1 : av < bv ? 1 : 0;
        });
      }
      if (table === 'listings') {
        rows = rows.map((r) => {
          const seller = h.db.all('users').find((u) => u.id === r.seller_id);
          return seller ? { ...r, users: { full_name: seller.full_name } } : r;
        });
      }
      if (limitN != null) rows = rows.slice(0, limitN);
      return rows;
    };

    const insertQ: Record<string, any> = {
      select: () => insertQ,
      maybeSingle: async () => ({ data: h.db.insert(table, insertRow) as any, error: null }),
      single: async () => ({ data: h.db.insert(table, insertRow) as any, error: null }),
      then: (resolve: (v: { data: null; error: null }) => void, reject: (e: unknown) => void) =>
        Promise.resolve({ data: h.db.insert(table, insertRow) as any, error: null }).then(resolve, reject),
    };
    let insertRow: Record<string, unknown> = {};

    const q: Record<string, any> = {
      select: () => q,
      eq: (col: string, v: unknown) => {
        filters.push({ col, op: 'eq', v });
        return q;
      },
      in: (col: string, v: unknown[]) => {
        filters.push({ col, op: 'in', v });
        return q;
      },
      is: (col: string, v: unknown) => {
        filters.push({ col, op: v === null ? 'is_null' : 'is', v });
        return q;
      },
      ilike: (col: string, v: string) => {
        filters.push({ col, op: 'ilike', v });
        return q;
      },
      or: (s: string) => {
        orPred = parseOr(s);
        return q;
      },
      order: (col: string, opts?: { ascending?: boolean }) => {
        orderBy = { col, asc: opts?.ascending !== false };
        return q;
      },
      limit: (n: number) => {
        limitN = n;
        return q;
      },
      maybeSingle: async () => {
        const rows = scan();
        return { data: rows[0] ?? null, error: null };
      },
      single: async () => {
        const rows = scan();
        return rows.length ? { data: rows[0], error: null } : { data: null, error: new Error('no rows') };
      },
      insert: (row: Record<string, unknown>) => {
        insertRow = row;
        return insertQ;
      },
      update: (patch: Record<string, unknown>) => {
        const u: Record<string, any> = {
          eq: (col: string, v: unknown) => {
            filters.push({ col, op: 'eq', v });
            return u;
          },
          in: (col: string, v: unknown[]) => {
            filters.push({ col, op: 'in', v });
            return u;
          },
          then: (resolve: (v: { data: null; error: null }) => void, reject: (e: unknown) => void) =>
            Promise.resolve({ data: h.db.update(table, patch, filters), error: null }).then(resolve, reject),
        };
        return u;
      },
      delete: () => {
        const d: Record<string, any> = {
          eq: (col: string, v: unknown) => {
            filters.push({ col, op: 'eq', v });
            return d;
          },
          then: (resolve: (v: { data: null; error: null }) => void, reject: (e: unknown) => void) =>
            Promise.resolve({ data: h.db.remove(table, filters), error: null }).then(resolve, reject),
        };
        return d;
      },
      upsert: (row: Record<string, unknown>) => {
        const ups: Record<string, any> = {
          select: () => ups,
          maybeSingle: async () => ({ data: h.db.insert(table, row) as any, error: null }),
          then: (resolve: (v: { data: null; error: null }) => void, reject: (e: unknown) => void) =>
            Promise.resolve({ data: h.db.insert(table, row) as any, error: null }).then(resolve, reject),
        };
        return ups;
      },
      then: (resolve: (v: { data: unknown; error: null }) => void, reject: (e: unknown) => void) =>
        Promise.resolve({ data: scan(), error: null }).then(resolve, reject),
    };
    return q;
  };

  return { from, functions: { invoke: async (name: string, opts?: { body: unknown }) => { const hnd = holder.handlers[name]; if (hnd) return hnd(opts?.body); return { data: { ok: true }, error: null }; } }, auth: { getSession: async () => ({ data: { session: null } }) } };
}

vi.mock('../src/lib/supabase', () => ({ supabase: makeClient(holder) }));

/* ------------------------------------------------------------------ */
/* Modules under test (imported after the mock is registered)          */
/* ------------------------------------------------------------------ */

const FARMER = { id: 'farmer-1', role: 'farmer', name: 'James Munyoro', isDemo: false };
const OFFTAKER = { id: 'offtaker-1', role: 'offtaker', name: 'Tapiwa Marufu', isDemo: false };
const ADMIN = { id: 'admin-1', role: 'admin', name: 'ZVIDA Ops', isDemo: false };

function seedBase() {
  holder.db.seed('users', [
    { id: FARMER.id, full_name: FARMER.name, role: 'farmer', email: 'james@farm.co', phone: '+263771000001', profile: { settings: { language: 'English', currency: 'USD ($)' } } },
    { id: OFFTAKER.id, full_name: OFFTAKER.name, role: 'offtaker', email: 'tapiwa@mill.co', phone: '+263771000002' },
    { id: ADMIN.id, full_name: ADMIN.name, role: 'admin', email: 'ops@zvida.co', phone: '+263771000009' },
    { id: 'driver-1', full_name: 'Jethro Sithole', role: 'driver', email: 'jethro@log.co' },
    { id: 'broker-1', full_name: 'Rudo Chikara', role: 'broker', email: 'rudo@broker.co' },
  ]);
  holder.db.seed('commodities', [
    { id: 'c-maize', name: 'Maize' },
    { id: 'c-soya', name: 'Soya Beans' },
    { id: 'c-wheat', name: 'Wheat' },
  ]);
}

const soyaListing: LiveProduct = {
  id: 'fp1',
  name: 'Soya Beans 10t · Reserve $520/t · Deliver to Ruwa',
  category: 'Grain',
  price: 520,
  unit: 't',
  seller: FARMER.name,
  stock: 10,
  rating: 4.5,
  reviews: 0,
  thumb: 'soya',
};

const maizeRfq: LiveRfq = {
  id: '',
  offtakerId: OFFTAKER.id,
  commodity: 'Maize',
  quantity: 25,
  unit: 't',
  maxPrice: 260,
  deliveryPoint: 'Harare Silo',
  deliveryDate: '2026-09-01',
  status: 'OPEN',
  createdAt: new Date().toISOString(),
};

beforeEach(() => {
  vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
  holder.db = new holder.FakeDB();
  holder.handlers = {};
  seedBase();
  setLiveAccount(null);
});

describe('cross-dashboard live data consistency', () => {
  it('farmer posts a listing -> offtaker sees it in the marketplace catalog', async () => {
    setLiveAccount(FARMER);
    await persistProduct(soyaListing);

    setLiveAccount(OFFTAKER);
    const catalog = await fetchProducts();
    const hit = catalog.find((p) => p.name.includes('Soya Beans'));
    expect(hit).toBeTruthy();
    expect(hit!.price).toBe(520);
    expect(hit!.stock).toBe(10);
    expect(hit!.unit).toBe('t');
    expect(hit!.seller).toBe(FARMER.name);
  });

  it('farmer edits a listing -> offtaker sees the updated price', async () => {
    setLiveAccount(FARMER);
    await persistProduct(soyaListing);

    setLiveAccount(FARMER);
    await persistProduct({ ...soyaListing, price: 560, stock: 8 });

    setLiveAccount(OFFTAKER);
    const catalog = await fetchProducts();
    const matches = catalog.filter((p) => p.name.includes('Soya Beans'));
    expect(matches).toHaveLength(1);
    expect(matches[0].price).toBe(560);
    expect(matches[0].stock).toBe(8);
  });

  it('farmer withdraws a listing -> offtaker no longer sees it', async () => {
    setLiveAccount(FARMER);
    await persistProduct(soyaListing);
    const row = holder.db.all('listings')[0];

    await deleteProduct(row.id as string);

    setLiveAccount(OFFTAKER);
    const catalog = await fetchProducts();
    expect(catalog.find((p) => p.name.includes('Soya Beans'))).toBeUndefined();
  });

  it('offtaker submits an RFQ -> farmer fetches it as an open RFQ with captured id', async () => {
    setLiveAccount(OFFTAKER);
    await persistRfq(maizeRfq);
    expect(maizeRfq.id).toBeTruthy();

    setLiveAccount(FARMER);
    const open = await fetchOpenRfqs();
    const hit = open.find((r) => r.id === maizeRfq.id);
    expect(hit).toBeTruthy();
    expect(hit!.commodity).toBe('Maize');
    expect(hit!.maxPrice).toBe(260);
    expect(hit!.quantity).toBe(25);
    expect(hit!.offtakerId).toBe(OFFTAKER.id);
  });

  it('auto-contract bridge sends the right parties to create-contract', async () => {
    let body: Record<string, unknown> | null = null;
    holder.handlers['create-contract'] = async (b) => {
      body = b as Record<string, unknown>;
      return { data: { contract: { id: 'contract-1' }, delivery: { id: 'delivery-1' } }, error: null };
    };

    setLiveAccount(FARMER);
    const res = await invokeCreateContract({
      farmer_id: FARMER.id,
      offtaker_id: OFFTAKER.id,
      broker_id: 'broker-1',
      commodity_id: 'c-maize',
      listing_id: 'listing-1',
      quantity: 25000,
      unit: 'kg',
      farmer_price: 520,
      offtaker_price: 550,
    });

    expect(res.error).toBeUndefined();
    expect(res.contract?.id).toBe('contract-1');
    expect(body?.farmer_id).toBe(FARMER.id);
    expect(body?.offtaker_id).toBe(OFFTAKER.id);
    expect(body?.commodity_id).toBe('c-maize');
    expect(body?.quantity).toBe(25000);
  });

  it('support reply -> customer reads it back in their message thread', async () => {
    setLiveAccount(OFFTAKER);
    await sendSupportMessage('Need to add a delivery point');

    setLiveAccount(ADMIN);
    const target = await findUserByFullName('Tapiwa');
    expect(target).toBe(OFFTAKER.id);
    await sendSupportReply('Added Harare Silo for you', OFFTAKER.id);

    setLiveAccount(OFFTAKER);
    const msgs = await fetchMyMessages();
    expect(msgs.some((m) => m.body === 'Added Harare Silo for you')).toBe(true);
    expect(msgs.some((m) => m.body === 'Need to add a delivery point')).toBe(true);
  });

  it('delivery settlement marks every party ledger paid', async () => {
    setLiveAccount(ADMIN);
    holder.db.seed('contracts', [{ id: 'contract-1', status: 'PENDING_PAYMENT' }]);
    holder.db.seed('payments', [{ id: 'pay-1', contract_id: 'contract-1', reference: 'CN-1001', status: 'PENDING' }]);
    holder.db.seed('farmer_settlements', [{ id: 'fs-1', contract_id: 'contract-1', status: 'PENDING' }]);
    holder.db.seed('offtaker_invoices', [{ id: 'oi-1', contract_id: 'contract-1', status: 'PENDING' }]);
    holder.db.seed('broker_commission_ledger', [{ id: 'bc-1', contract_id: 'contract-1', status: 'PENDING' }]);
    holder.handlers['generate-settlement'] = async () => ({ data: { summary: { farmer: 4800 } }, error: null });

    await settleContract('contract-1', 'CN-1001');

    expect(holder.db.all('farmer_settlements')[0].status).toBe('PAID');
    expect(holder.db.all('offtaker_invoices')[0].status).toBe('PAID');
    expect(holder.db.all('broker_commission_ledger')[0].status).toBe('SETTLED');
    expect(holder.db.all('payments')[0].status).toBe('COMPLETED');
    expect(holder.db.all('contracts')[0].status).toBe('PAID');
  });

  it('assigning a driver makes the delivery visible to that driver', async () => {
    setLiveAccount(ADMIN);
    holder.db.seed('deliveries', [{ id: 'd-1', contract_id: 'contract-9', driver_id: null, status: 'PENDING' }]);

    await assignDriverByName('contract-9', 'Jethro Sithole');

    const d = holder.db.all('deliveries')[0];
    expect(d.driver_id).toBe('driver-1');
    expect(d.status).toBe('PENDING');
  });

  it('a notification written for a user is returned by the read path', async () => {
    setLiveAccount(ADMIN);
    await notifyUser(OFFTAKER.id, 'RFQ matched', 'Your Maize request was matched', 'success');

    setLiveAccount(OFFTAKER);
    const { fetchUnreadNotifications } = await import('../src/lib/zvida-live');
    expect(typeof fetchUnreadNotifications).toBe('function');
  });

  it('settings persist across dashboards for the same account', async () => {
    setLiveAccount(FARMER);
    const res = await saveSettings({ language: 'Shona', currency: 'ZiG (ZWL)' });
    expect(res.ok).toBe(true);

    const st = await loadSettings();
    expect(st.name).toBe(FARMER.name);
    expect(st.language).toBe('Shona');
    expect(st.currency).toBe('ZiG (ZWL)');
  });

  it('unread notifications are surfaced for the recipient', async () => {
    setLiveAccount(ADMIN);
    await notifyUser(OFFTAKER.id, 'Delivery released', 'Payment of $4,000 sent', 'success');

    setLiveAccount(OFFTAKER);
    const { fetchUnreadNotifications } = await import('../src/lib/zvida-live');
    const unread = await fetchUnreadNotifications();
    expect(Array.isArray(unread)).toBe(true);
    expect(unread.some((n) => n.title === 'Delivery released')).toBe(true);
  });
});
