import { supabase } from './supabase';

/* ============================================================
   ZVIDAMBANO Dashboard ⇄ Supabase bridge (v2 — per-account).

   Two account modes, one bridge:

   • DEMO accounts (seeded @zvida.zw personas): liveConfigured() is false.
     Dashboards keep their state in localStorage, the badge reads DEMO, and
     NOTHING is written to Supabase. Reset-to-default just clears the local
     stores. Demo personas can never touch real rows.

   • REAL accounts (any other email): liveConfigured() is true. Every read is
     scoped to the signed-in user's JWT via RLS and every write carries
     auth.uid() ownership. Accounts start empty — the dashboards show their
     empty states until the user creates their first row.

   Demo rows that leaked into the live tables in the past are excluded from
   real queries by tagging them with meta.demo_id (meta IS NOT NULL).
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
  userId?: string;
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
  photos: string[];
  contractId?: string;
  deliveryId?: string;
  driverId?: string;
  firstWeight?: number;
  secondWeight?: number;
}

export interface LiveAccount {
  id: string;
  role: string;
  name: string;
  isDemo: boolean;
}

export interface LiveRfq {
  id: string;
  offtakerId: string;
  commodity: string;
  quantity: number;
  unit: string;
  maxPrice: number;
  deliveryPoint: string;
  deliveryDate: string;
  status: string;
  createdAt: string;
}

let account: LiveAccount | null = null;
let envReady = false;

function detectEnv(): boolean {
  if (envReady) return true;
  const url = import.meta.env?.VITE_SUPABASE_URL || '';
  const key = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';
  envReady = Boolean(url && key);
  return envReady;
}

/**
 * Real mode is on only when a signed-in, non-demo account exists AND the
 * project env is configured. Demo accounts therefore never touch Supabase.
 */
export function liveConfigured(): boolean {
  return Boolean(account && !account.isDemo && detectEnv());
}

export function setLiveAccount(a: LiveAccount | null): void {
  account = a;
}

export function getLiveAccount(): LiveAccount | null {
  return account;
}

function myId(): string {
  return account?.id || '';
}

function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

interface RefMap {
  commodities: { id: string; name: string }[];
}

let refMap: RefMap | null = null;

async function ensureCommodities(): Promise<RefMap> {
  if (refMap) return refMap;
  try {
    const { data } = await supabase.from('commodities').select('id,name');
    refMap = { commodities: (data as { id: string; name: string }[]) || [] };
  } catch {
    refMap = { commodities: [] };
  }
  return refMap;
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

function rowToProduct(r: any): LiveProduct {
  const meta = r.meta || {};
  return {
    id: meta.demo_id || r.id,
    name: r.title,
    category: r.category || 'Inputs',
    price: Number(r.asking_price ?? 0),
    unit: r.unit || 'kg',
    seller: meta.seller || r.seller_name || 'ZVIDA Vendor',
    stock: Number(r.quantity ?? 0),
    rating: Number(meta.rating ?? 4.5),
    reviews: Number(meta.reviews ?? 0),
    thumb: r.photo_url || meta.thumb || 'box',
  };
}

function productToRow(p: LiveProduct): Record<string, unknown> {
  return {
    seller_id: myId() || null,
    title: p.name,
    description: `${p.name} — listed on ZVIDAMBANO`,
    quantity: p.stock,
    unit: p.unit,
    asking_price: p.price,
    category: p.category,
    status: 'active',
    is_distressed: false,
    photo_url: p.thumb?.startsWith('http') ? p.thumb : null,
    meta: null,
  };
}

async function realListings(): Promise<any[]> {
  const { data, error } = await supabase
    .from('listings')
    .select('*, users!listings_seller_id_fkey(full_name)')
    .is('meta', null)
    .eq('status', 'active');
  if (error) return [];
  return ((data as any[]) || []).map((r) => ({ ...r, seller_name: r.users?.full_name }));
}

async function myListings(): Promise<any[]> {
  const { data } = await supabase
    .from('listings')
    .select('*, users!listings_seller_id_fkey(full_name)')
    .eq('seller_id', myId())
    .is('meta', null);
  return ((data as any[]) || []).map((r) => ({ ...r, seller_name: r.users?.full_name }));
}

export async function ensureProducts(_seed: LiveProduct[]): Promise<LiveProduct[]> {
  if (!liveConfigured()) return [];
  try {
    const rows = await realListings();
    return rows.map(rowToProduct);
  } catch {
    return [];
  }
}

export async function fetchProducts(): Promise<LiveProduct[]> {
  if (!liveConfigured()) return [];
  try {
    const rows = await realListings();
    return rows.map(rowToProduct);
  } catch {
    return [];
  }
}

export async function persistProduct(p: LiveProduct): Promise<void> {
  if (!liveConfigured()) return;
  try {
    const map = await ensureCommodities();
    const row: Record<string, unknown> = {
      ...productToRow(p),
      commodity_id: findCommodityId(map, p.name),
    };
    const { data } = await supabase.from('listings').select('id').eq('seller_id', myId()).eq('title', p.name).maybeSingle();
    if (data?.id) await supabase.from('listings').update(row).eq('id', data.id);
    else await supabase.from('listings').insert(row as any);
  } catch {
    /* ignore */
  }
}

export async function deleteProduct(id: string): Promise<void> {
  if (!liveConfigured()) return;
  try {
    await supabase.from('listings').delete().eq('id', id).eq('seller_id', myId());
  } catch {
    /* ignore */
  }
}

/* ---------- my listings (own rows, any status) ---------- */

export async function fetchMyListings(): Promise<LiveProduct[]> {
  if (!liveConfigured()) return [];
  try {
    const rows = await myListings();
    return rows.map(rowToProduct);
  } catch {
    return [];
  }
}

/* ---------- RFQs ⇄ rfqs ---------- */

function rowToRfq(r: any): LiveRfq {
  return {
    id: r.id,
    offtakerId: r.offtaker_id || '',
    commodity: r.commodity || 'Commodity',
    quantity: Number(r.quantity ?? 0),
    unit: r.unit || 'kg',
    maxPrice: Number(r.max_price ?? 0),
    deliveryPoint: r.delivery_point || '',
    deliveryDate: r.delivery_date || '',
    status: r.status || 'OPEN',
    createdAt: r.created_at || '',
  };
}

function rfqToRow(r: LiveRfq): Record<string, unknown> {
  return {
    offtaker_id: myId() || null,
    commodity: r.commodity,
    quantity: r.quantity,
    unit: r.unit,
    max_price: r.maxPrice,
    delivery_point: r.deliveryPoint,
    delivery_date: r.deliveryDate || null,
    status: r.status || 'OPEN',
  };
}

export async function fetchMyRfqs(): Promise<LiveRfq[]> {
  if (!liveConfigured()) return [];
  try {
    const { data } = await supabase.from('rfqs').select('*').eq('offtaker_id', myId()).order('created_at', { ascending: false });
    return ((data as any[]) || []).map(rowToRfq);
  } catch {
    return [];
  }
}

export async function fetchOpenRfqs(): Promise<LiveRfq[]> {
  if (!liveConfigured()) return [];
  try {
    const { data } = await supabase.from('rfqs').select('*').eq('status', 'OPEN').order('created_at', { ascending: false });
    return ((data as any[]) || []).map(rowToRfq);
  } catch {
    return [];
  }
}

export async function persistRfq(r: LiveRfq): Promise<void> {
  if (!liveConfigured()) return;
  try {
    const { offtaker_id: _o, ...row } = rfqToRow(r);
    if (r.id) {
      await supabase.from('rfqs').update(row).eq('id', r.id).eq('offtaker_id', myId());
    } else {
      await supabase.from('rfqs').insert({ ...row, offtaker_id: myId() } as any);
    }
  } catch {
    /* ignore */
  }
}

export async function deleteRfq(id: string): Promise<void> {
  if (!liveConfigured()) return;
  try {
    await supabase.from('rfqs').delete().eq('id', id).eq('offtaker_id', myId());
  } catch {
    /* ignore */
  }
}

/* ---------- messages (support tickets) ---------- */

let supportId: string | null = null;

async function findSupportId(): Promise<string | null> {
  if (supportId) return supportId;
  try {
    const { data } = await supabase.from('users').select('id').in('role', ['admin', 'compliance']).limit(1).maybeSingle();
    supportId = data?.id || null;
  } catch {
    supportId = null;
  }
  return supportId;
}

export interface LiveMessage {
  id: string;
  senderId: string;
  receiverId: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export async function fetchMyMessages(): Promise<LiveMessage[]> {
  if (!liveConfigured()) return [];
  try {
    const me = myId();
    if (!me) return [];
    const { data } = await supabase
      .from('messages')
      .select('id, sender_id, receiver_id, body, read, created_at')
      .or(`sender_id.eq.${me},receiver_id.eq.${me}`)
      .order('created_at', { ascending: false })
      .limit(50);
    return ((data as any[]) || []).map((m) => ({
      id: m.id,
      senderId: m.sender_id,
      receiverId: m.receiver_id,
      body: m.body,
      read: m.read,
      createdAt: m.created_at,
    }));
  } catch {
    return [];
  }
}

export async function sendSupportMessage(body: string): Promise<LiveMessage | null> {
  if (!liveConfigured()) return null;
  try {
    const receiver = await findSupportId();
    if (!receiver) return null;
    const { data } = await supabase
      .from('messages')
      .insert({ sender_id: myId(), receiver_id: receiver, body } as any)
      .select()
      .single();
    if (!data) return null;
    return {
      id: data.id,
      senderId: data.sender_id,
      receiverId: data.receiver_id,
      body: data.body,
      read: data.read,
      createdAt: data.created_at,
    };
  } catch {
    return null;
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
    user_id: myId(),
  };
}

function rowToOrder(r: any): LiveOrder {
  return {
    id: r.id,
    ref: r.ref,
    buyer: r.buyer,
    userId: r.user_id,
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

export async function ensureOrders(_orders: LiveOrder[], fallbackSeq: number): Promise<{ orders: LiveOrder[]; seq: number }> {
  if (!liveConfigured()) return { orders: [], seq: fallbackSeq };
  try {
    const { data } = await supabase.from('market_orders').select('*').order('ref', { ascending: true });
    const list = ((data as any[]) || []).map(rowToOrder);
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
    const { data: existing } = await supabase.from('market_orders').select('id').eq('id', o.id).maybeSingle();
    if (existing?.id) {
      await supabase.from('market_orders').update({
        status: o.status,
        step: o.step,
        history: o.history,
        items: o.items,
        total: o.total,
        delivery: o.delivery,
        payment: o.payment,
        address: o.address,
      }).eq('id', o.id);
    } else {
      await supabase.from('market_orders').insert(orderToRow(o) as any);
    }
  } catch {
    /* ignore */
  }
}

/* ---------- consignments ⇄ contracts ---------- */

function loadToRow(l: LiveLoad): Record<string, unknown> {
  return {
    contract_number: l.ref,
    farmer_id: account?.role === 'farmer' ? myId() : null,
    offtaker_id: account?.role === 'offtaker' ? myId() : null,
    broker_id: null,
    quantity: l.qty,
    unit: 'kg',
    farmer_price: l.unitPrice,
    offtaker_price: Math.max(1, Math.round(l.unitPrice * 1.2)),
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
      photos: l.photos || [],
    },
  };
}

function rowToLoad(r: any): LiveLoad {
  const m = r.meta || {};
  const d = r._delivery || {};
  const num = (v: any, d = 0) => (v === null || v === undefined ? d : Number(v));
  return {
    id: 'lg' + String(r.contract_number).replace(/\D/g, '').slice(-4),
    ref: r.contract_number,
    contract: m.contract || r.contract_number,
    poRef: m.poRef || 'PO-' + String(r.contract_number).replace(/\D/g, ''),
    order: m.order || 'SO-' + r.contract_number,
    commodity: m.commodity || 'Commodity',
    art: m.art || 'grain',
    supplier: m.supplier || r.farmer_name || 'Farmer',
    receiver: m.receiver || r.offtaker_name || 'Offtaker',
    from: m.from || '',
    dest: m.dest || '',
    driver: m.driver || '',
    phone: m.phone || '',
    truck: m.truck || '',
    trailer: m.trailer || '',
    weightMode: m.weightMode || 'weighbridge',
    bucketKg: num(m.bucketKg, 20),
    weight1: num(m.weight1, num(d.first_weight)),
    weight2: num(m.weight2, num(d.second_weight)),
    bags: num(m.bags),
    buckets: num(m.buckets),
    inputKg: num(m.inputKg),
    unitPrice: num(m.unitPrice, num(r.farmer_price)),
    qty: num(m.qty, num(r.quantity)),
    amount: num(m.amount),
    payTerm: m.payTerm || 'NET_7',
    status: r.status,
    tone: lgTone(r.status),
    step: lgSteps(r.status),
    history: m.history || [],
    due: m.due || '',
    slip: m.slip || d.first_weighbridge_ticket || '',
    pics: num(m.pics),
    live: num(m.live),
    photos: Array.isArray(m.photos) ? m.photos.map(String) : [],
    contractId: r.id,
    deliveryId: d.id || undefined,
    driverId: d.driver_id || undefined,
    firstWeight: d.first_weight === null || d.first_weight === undefined ? undefined : num(d.first_weight),
    secondWeight: d.second_weight === null || d.second_weight === undefined ? undefined : num(d.second_weight),
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

async function realLoads(): Promise<any[]> {
  const role = account?.role;
  let query = supabase.from('contracts').select('*, users!contracts_farmer_id_fkey(full_name), offtakers:users!contracts_offtaker_id_fkey(full_name)');
  /* Demo-seeded contracts carry meta.demo_id — never surface them to real accounts. */
  query = query.filter('meta->>demo_id', 'is', null);
  if (role === 'farmer') query = query.eq('farmer_id', myId());
  else if (role === 'offtaker') query = query.eq('offtaker_id', myId());
  const { data, error } = await query.order('created_at', { ascending: false });
  if (error) return [];
  const rows = (data as any[]) || [];
  /* Merge the single delivery per contract (weights, driver, tickets) so the
     driver dashboard can advance real statuses via the edge function. */
  const ids = rows.map((r) => r.id);
  const byContract = new Map<string, any>();
  if (ids.length) {
    const { data: deliveries } = await supabase
      .from('deliveries')
      .select('id, contract_id, driver_id, status, first_weight, first_weighbridge_ticket, second_weight, second_weighbridge_ticket, vehicle_reg, origin, destination')
      .in('contract_id', ids);
    ((deliveries as any[]) || []).forEach((d) => byContract.set(d.contract_id, d));
  }
  return rows.map((r) => ({
    ...r,
    _delivery: byContract.get(r.id),
    farmer_name: r.users?.full_name,
    offtaker_name: r.offtakers?.full_name,
  }));
}

export async function ensureLoads(_loads: LiveLoad[], fallbackSeq: number): Promise<{ loads: LiveLoad[]; seq: number }> {
  if (!liveConfigured()) return { loads: [], seq: fallbackSeq };
  try {
    const rows = await realLoads();
    const list = rows.map(rowToLoad);
    return { loads: list, seq: loadSeq(rows, fallbackSeq) };
  } catch {
    return { loads: [], seq: fallbackSeq };
  }
}

export async function fetchLoads(): Promise<{ loads: LiveLoad[]; seq: number }> {
  if (!liveConfigured()) return { loads: [], seq: 1 };
  try {
    const rows = await realLoads();
    return { loads: rows.map(rowToLoad), seq: loadSeq(rows, 1) };
  } catch {
    return { loads: [], seq: 1 };
  }
}

export async function persistLoad(l: LiveLoad): Promise<void> {
  if (!liveConfigured()) return;
  try {
    const { data: existing } = await supabase.from('contracts').select('id').eq('contract_number', l.ref).maybeSingle();
    const row = loadToRow(l);
    if (existing?.id) {
      const { contract_number: _cn, ...rest } = row;
      await supabase.from('contracts').update(rest as any).eq('id', existing.id);
    } else {
      await supabase.from('contracts').insert(row as any);
    }
  } catch {
    /* ignore */
  }
}

/* ---------- notifications (real accounts only) ---------- */

export async function fetchUnreadNotifications(): Promise<{ count: number; latest: { id: string; title: string; body?: string; type: string; read: boolean; created_at?: string }[] }> {
  if (!liveConfigured()) return { count: 0, latest: [] };
  try {
    const { data } = await supabase
      .from('notifications')
      .select('id,title,body,type,read,created_at')
      .eq('user_id', myId())
      .eq('read', false)
      .order('created_at', { ascending: false })
      .limit(10);
    const latest = (data as any[]) || [];
    return { count: latest.length, latest };
  } catch {
    return { count: 0, latest: [] };
  }
}

export async function markNotificationsRead(): Promise<void> {
  if (!liveConfigured()) return;
  try {
    await supabase.from('notifications').update({ read: true }).eq('user_id', myId()).eq('read', false);
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
  rfqs: LiveRfq[];
}

export interface LiveResult {
  products: LiveProduct[];
  orders: LiveOrder[];
  orderSeq: number;
  loads: LiveLoad[];
  loadSeq: number;
  rfqs: LiveRfq[];
}

export async function syncAll(seed: LiveSeed): Promise<LiveResult | null> {
  if (!liveConfigured()) return null;
  const [products, ord, ld, openRfqs, myRfqs] = await Promise.all([
    ensureProducts(seed.products),
    ensureOrders(seed.orders, seed.orderSeq),
    ensureLoads(seed.loads, seed.loadSeq),
    fetchOpenRfqs(),
    fetchMyRfqs(),
  ]);
  const seen = new Set<string>();
  const rfqs = [...myRfqs, ...openRfqs].filter((r) => (seen.has(r.id) ? false : (seen.add(r.id), true)));
  return {
    products,
    orders: ord.orders,
    orderSeq: ord.seq,
    loads: ld.loads,
    loadSeq: ld.seq,
    rfqs,
  };
}
