import { supabase } from './supabase';

/* ============================================================
   ZVIDAMBANO Dashboard ⇄ Supabase bridge.
   The dashboards in src/dashboards/core.ts keep their state in
   localStorage by default. When a real Supabase project is
   configured, these helpers seed + read + write the demo data
   into live tables (listings / market_orders / contracts) using
   the anonymous key, and round-trip rows back into the dashboard
   store shapes.

   All operations are best-effort: any failure falls back to the
   local demo seed. The Demo anon RLS policies in
   supabase-dashboard-data.sql make this possible.
   ============================================================ */

const MK_FLOW = ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Out for delivery', 'Delivered'];
const LG_FLOW = ['Scheduled', 'Loading', 'Weigh 1', 'In Transit', 'Offloading', 'Weigh 2', 'Payment Pending', 'Paid'];

const mkTone = (s: string): string =>
  ({ NEW: 'amber', CONFIRMED: 'green', PROCESSING: 'blue', SHIPPED: 'indigo', OUT_FOR_DELIVERY: 'blue', DELIVERED: 'green', PAID: 'green', CANCELLED: 'red', ESCALATED: 'red' } as Record<string, string>)[s] || 'gray';

const lgTone = (s: string): string =>
  ({ PENDING: 'amber', LOADING: 'blue', WEIGHED_1: 'indigo', IN_TRANSIT: 'indigo', OFFLOADING: 'blue', WEIGHED_2: 'violet', PENDING_PAYMENT: 'amber', PAID: 'green', CANCELLED: 'red' } as Record<string, string>)[s] || 'gray';

const lgSteps = (s: string): number =>
  ({ PENDING: 0, LOADING: 1, WEIGHED_1: 2, IN_TRANSIT: 3, OFFLOADING: 4, WEIGHED_2: 5, PENDING_PAYMENT: 6, PAID: 7, CANCELLED: 0 } as Record<string, number>)[s] ?? 0;

/* ---- shapes mirrored from core.ts (kept local to avoid a cycle) ---- */
export interface LiveProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  seller: string;
  stock: number;
  rating: number;
  reviews: number;
  thumb: string;
}

export interface LiveOrderItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  thumb: string;
  seller: string;
  unit: string;
}

export interface LiveOrder {
  id: string;
  ref: string;
  buyer: string;
  address: string;
  delivery: string;
  payment: string;
  placedAt: string;
  items: LiveOrderItem[];
  status: string;
  tone: string;
  flow: string[];
  step: number;
  total: number;
  history: { t: string; d: string }[];
}

export interface LiveLoad {
  id: string;
  ref: string;
  contract: string;
  poRef: string;
  order: string;
  commodity: string;
  art: string;
  supplier: string;
  receiver: string;
  from: string;
  dest: string;
  driver: string;
  phone: string;
  truck: string;
  trailer: string;
  weightMode: 'weighbridge' | 'scale';
  bucketKg: number;
  weight1: number;
  weight2: number;
  bags: number;
  buckets: number;
  inputKg: number;
  unitPrice: number;
  qty: number;
  amount: number;
  payTerm: string;
  status: string;
  tone: string;
  step: number;
  history: { t: string; d: string }[];
  due: string;
  slip: string;
  pics: number;
  live: number;
}

let configured = false;

export function liveConfigured(): boolean {
  if (configured) return true;
  const url = import.meta.env?.VITE_SUPABASE_URL || '';
  const key = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';
  configured = Boolean(url && key);
  return configured;
}

interface RefMap {
  users: { id: string; full_name: string; role: string }[];
  commodities: { id: string; name: string }[];
}

let refMap: RefMap | null = null;

async function ensureRefs(): Promise<RefMap> {
  if (refMap) return refMap;
  const [users, commodities] = await Promise.all([
    supabase.from('users').select('id,full_name,role'),
    supabase.from('commodities').select('id,name'),
  ]);
  refMap = {
    users: (users.data as { id: string; full_name: string; role: string }[]) || [],
    commodities: (commodities.data as { id: string; name: string }[]) || [],
  };
  return refMap;
}

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function findUserId(map: RefMap, name: string): string | null {
  const n = norm(name);
  if (!n) return null;
  let hit = map.users.find((u) => norm(u.full_name) === n);
  if (hit) return hit.id;
  hit = map.users.find((u) => {
    const f = norm(u.full_name);
    return (f.length > 2 && (f.includes(n) || n.includes(f)));
  });
  return hit?.id ?? null;
}

function findCommodityId(map: RefMap, name: string): string | null {
  const n = norm(name);
  if (!n) return null;
  const hit = map.commodities.find((c) => {
    const f = norm(c.name);
    return f === n || (f.length > 2 && n.includes(f));
  });
  return hit?.id ?? null;
}

/* ---------- products ⇄ listings ---------- */

async function demoListings(): Promise<any[]> {
  const { data } = await supabase
    .from('listings')
    .select('*')
    .not('meta', 'is', null);
  return (data as any[]) || [];
}

function productToRow(map: RefMap, p: LiveProduct): Record<string, unknown> {
  const sellerId = findUserId(map, p.seller) || map.users.find((u) => u.role === 'supplier')?.id || null;
  return {
    seller_id: sellerId,
    commodity_id: findCommodityId(map, p.name),
    title: p.name,
    description: `${p.name} — listed on ZVIDAMBANO`,
    quantity: p.stock,
    unit: p.unit,
    asking_price: p.price,
    category: p.category,
    grade: null,
    origin: null,
    status: 'active',
    is_distressed: false,
    photo_url: null,
    meta: { demo_id: p.id, seller: p.seller, rating: p.rating, reviews: p.reviews, thumb: p.thumb },
  };
}

function rowToProduct(r: any): LiveProduct {
  const meta = r.meta || {};
  return {
    id: meta.demo_id || r.id,
    name: r.title,
    category: r.category || 'Inputs',
    price: Number(r.asking_price ?? 0),
    unit: r.unit || 'kg',
    seller: meta.seller || 'ZVIDA Vendor',
    stock: Number(r.quantity ?? 0),
    rating: Number(meta.rating ?? 4.5),
    reviews: Number(meta.reviews ?? 0),
    thumb: meta.thumb || 'box',
  };
}

export async function ensureProducts(products: LiveProduct[]): Promise<LiveProduct[]> {
  if (!liveConfigured()) return [];
  try {
    const map = await ensureRefs();
    const existing = await demoListings();
    const have = new Set(existing.map((r) => r.meta?.demo_id));
    const rows = products.filter((p) => !have.has(p.id)).map((p) => productToRow(map, p));
    if (rows.length) {
      await supabase.from('listings').insert(rows as any[]);
    }
    const after = await demoListings();
    return after.map(rowToProduct);
  } catch {
    return [];
  }
}

export async function fetchProducts(): Promise<LiveProduct[]> {
  if (!liveConfigured()) return [];
  try {
    const rows = await demoListings();
    return rows.map(rowToProduct);
  } catch {
    return [];
  }
}

export async function persistProduct(p: LiveProduct): Promise<void> {
  if (!liveConfigured()) return;
  try {
    const map = await ensureRefs();
    const { data } = await supabase.from('listings').select('id').eq('meta->>demo_id', p.id).maybeSingle();
    const row = productToRow(map, p);
    if (data?.id) await supabase.from('listings').update(row).eq('id', data.id);
    else await supabase.from('listings').insert(row as any);
  } catch {
    /* ignore */
  }
}

export async function deleteProduct(id: string): Promise<void> {
  if (!liveConfigured()) return;
  try {
    const { data } = await supabase.from('listings').select('id').eq('meta->>demo_id', id).maybeSingle();
    if (data?.id) await supabase.from('listings').delete().eq('id', data.id);
  } catch {
    /* ignore */
  }
}

/* ---------- orders ⇄ market_orders ---------- */

function orderToRow(o: LiveOrder): Record<string, unknown> {
  return {
    id: o.id,
    ref: o.ref,
    buyer: o.buyer,
    address: o.address,
    delivery: o.delivery,
    payment: o.payment,
    placed_at: o.placedAt,
    items: o.items,
    history: o.history,
    status: o.status,
    step: o.step,
    total: o.total,
  };
}

function rowToOrder(r: any): LiveOrder {
  return {
    id: r.id,
    ref: r.ref,
    buyer: r.buyer,
    address: r.address,
    delivery: r.delivery,
    payment: r.payment,
    placedAt: r.placed_at,
    items: r.items || [],
    status: r.status,
    tone: mkTone(r.status),
    flow: [...MK_FLOW],
    step: Number(r.step ?? 0),
    total: Number(r.total ?? 0),
    history: r.history || [],
  };
}

function orderSeq(rows: any[], fallback: number): number {
  let max = 0;
  rows.forEach((r) => {
    const n = parseInt(String(r.id).replace(/\D/g, ''), 10);
    if (!isNaN(n) && n > max) max = n;
  });
  return Math.max(max + 1, fallback);
}

export async function ensureOrders(orders: LiveOrder[], fallbackSeq: number): Promise<{ orders: LiveOrder[]; seq: number }> {
  if (!liveConfigured()) return { orders: [], seq: fallbackSeq };
  try {
    const { data } = await supabase.from('market_orders').select('*');
    const existing = (data as any[]) || [];
    const have = new Set(existing.map((r) => r.id));
    const rows = orders.filter((o) => !have.has(o.id)).map(orderToRow);
    if (rows.length) {
      await supabase.from('market_orders').insert(rows as any[]);
    }
    const { data: after } = await supabase.from('market_orders').select('*').order('ref', { ascending: true });
    const list = ((after as any[]) || []).map(rowToOrder);
    return { orders: list, seq: orderSeq(list, fallbackSeq) };
  } catch {
    return { orders: [], seq: fallbackSeq };
  }
}

export async function fetchOrders(): Promise<{ orders: LiveOrder[]; seq: number }> {
  if (!liveConfigured()) return { orders: [], seq: 1 };
  try {
    const { data } = await supabase.from('market_orders').select('*').order('ref', { ascending: true });
    const list = ((data as any[]) || []).map(rowToOrder);
    return { orders: list, seq: orderSeq(list, 1) };
  } catch {
    return { orders: [], seq: 1 };
  }
}

export async function persistOrder(o: LiveOrder): Promise<void> {
  if (!liveConfigured()) return;
  try {
    await supabase.from('market_orders').upsert(orderToRow(o) as any, { onConflict: 'id' });
  } catch {
    /* ignore */
  }
}

/* ---------- consignments ⇄ contracts ---------- */

function loadToRow(map: RefMap, l: LiveLoad): Record<string, unknown> {
  return {
    contract_number: l.ref,
    farmer_id: findUserId(map, l.supplier),
    offtaker_id: findUserId(map, l.receiver),
    broker_id: null,
    commodity_id: findCommodityId(map, l.commodity),
    quantity: l.qty,
    unit: 'kg',
    farmer_price: l.unitPrice,
    offtaker_price: l.unitPrice,
    broker_commission: null,
    status: l.status,
    meta: {
      contract: l.contract,
      poRef: l.poRef,
      order: l.order,
      commodity: l.commodity,
      art: l.art,
      supplier: l.supplier,
      receiver: l.receiver,
      from: l.from,
      dest: l.dest,
      driver: l.driver,
      phone: l.phone,
      truck: l.truck,
      trailer: l.trailer,
      weightMode: l.weightMode,
      bucketKg: l.bucketKg,
      weight1: l.weight1,
      weight2: l.weight2,
      bags: l.bags,
      buckets: l.buckets,
      inputKg: l.inputKg,
      unitPrice: l.unitPrice,
      qty: l.qty,
      amount: l.amount,
      payTerm: l.payTerm,
      history: l.history,
      due: l.due,
      slip: l.slip,
      pics: l.pics,
      live: l.live,
    },
  };
}

function rowToLoad(r: any): LiveLoad {
  const m = r.meta || {};
  const num = (v: any, d = 0) => (v === null || v === undefined ? d : Number(v));
  return {
    id: 'lg' + String(r.contract_number).replace(/\D/g, '').slice(-4),
    ref: r.contract_number,
    contract: m.contract || r.contract_number,
    poRef: m.poRef || 'PO-' + String(r.contract_number).replace(/\D/g, ''),
    order: m.order || 'SO-' + r.contract_number,
    commodity: m.commodity || 'Maize',
    art: m.art || 'grain',
    supplier: m.supplier || 'ZVIDA Vendor',
    receiver: m.receiver || 'ZVIDA Brokerage',
    from: m.from || '',
    dest: m.dest || '',
    driver: m.driver || '',
    phone: m.phone || '',
    truck: m.truck || '',
    trailer: m.trailer || '',
    weightMode: m.weightMode || 'weighbridge',
    bucketKg: num(m.bucketKg, 20),
    weight1: num(m.weight1),
    weight2: num(m.weight2),
    bags: num(m.bags),
    buckets: num(m.buckets),
    inputKg: num(m.inputKg),
    unitPrice: num(m.unitPrice),
    qty: num(m.qty, num(r.quantity)),
    amount: num(m.amount),
    payTerm: m.payTerm || 'NET_7',
    status: r.status,
    tone: lgTone(r.status),
    step: lgSteps(r.status),
    history: m.history || [],
    due: m.due || '',
    slip: m.slip || '',
    pics: num(m.pics),
    live: num(m.live),
  };
}

function loadSeq(rows: any[], fallback: number): number {
  let max = 0;
  rows.forEach((r) => {
    const n = parseInt(String(r.contract_number).replace(/\D/g, ''), 10);
    if (!isNaN(n) && n > max) max = n;
  });
  return Math.max(max + 1, fallback);
}

export async function ensureLoads(loads: LiveLoad[], fallbackSeq: number): Promise<{ loads: LiveLoad[]; seq: number }> {
  if (!liveConfigured()) return { loads: [], seq: fallbackSeq };
  try {
    const map = await ensureRefs();
    const { data } = await supabase.from('contracts').select('contract_number').like('contract_number', 'LD-%');
    const existing = new Set(((data as any[]) || []).map((r) => r.contract_number));
    const rows = loads.filter((l) => !existing.has(l.ref)).map((l) => loadToRow(map, l));
    if (rows.length) {
      await supabase.from('contracts').insert(rows as any[]);
    }
    const { data: after } = await supabase.from('contracts').select('*').like('contract_number', 'LD-%').order('contract_number', { ascending: true });
    const list = ((after as any[]) || []).map(rowToLoad);
    return { loads: list, seq: loadSeq(list, fallbackSeq) };
  } catch {
    return { loads: [], seq: fallbackSeq };
  }
}

export async function fetchLoads(): Promise<{ loads: LiveLoad[]; seq: number }> {
  if (!liveConfigured()) return { loads: [], seq: 1 };
  try {
    const { data } = await supabase.from('contracts').select('*').like('contract_number', 'LD-%').order('contract_number', { ascending: true });
    const list = ((data as any[]) || []).map(rowToLoad);
    return { loads: list, seq: loadSeq(list, 1) };
  } catch {
    return { loads: [], seq: 1 };
  }
}

export async function persistLoad(l: LiveLoad): Promise<void> {
  if (!liveConfigured()) return;
  try {
    const map = await ensureRefs();
    await supabase
      .from('contracts')
      .update(loadToRow(map, l) as any)
      .eq('contract_number', l.ref);
  } catch {
    /* ignore */
  }
}

/* ---------- convenience ---------- */

export interface LiveSeed {
  products: LiveProduct[];
  orders: LiveOrder[];
  orderSeq: number;
  loads: LiveLoad[];
  loadSeq: number;
}

export interface LiveResult {
  products: LiveProduct[];
  orders: LiveOrder[];
  orderSeq: number;
  loads: LiveLoad[];
  loadSeq: number;
}

export async function syncAll(seed: LiveSeed): Promise<LiveResult | null> {
  if (!liveConfigured()) return null;
  const [products, ord, ld] = await Promise.all([
    ensureProducts(seed.products),
    ensureOrders(seed.orders, seed.orderSeq),
    ensureLoads(seed.loads, seed.loadSeq),
  ]);
  return {
    products,
    orders: ord.orders,
    orderSeq: ord.seq,
    loads: ld.loads,
    loadSeq: ld.seq,
  };
}
