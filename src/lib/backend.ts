/**
 * Backend bridge — typed wrappers over the deployed ZVIDAMBANO edge
 * functions (create-contract, update-delivery-status, generate-settlement)
 * plus the direct admin/broker writes that finalize a settlement.
 *
 * Every call is gated on liveConfigured(): demo personas run on localStorage
 * and must never touch Supabase, exactly like the rest of the zvida-live
 * bridge. All functions attach the signed-in user's JWT automatically via
 * the shared client, and RLS scopes every row to auth.uid().
 */

import { supabase } from './supabase';
import { liveConfigured } from './zvida-live';

export interface CreateContractDelivery {
  driver_id?: string;
  origin?: string;
  destination?: string;
  vehicle_reg?: string;
}

export interface CreateContractInput {
  farmer_id?: string;
  offtaker_id?: string;
  broker_id?: string;
  commodity_id?: string;
  listing_id?: string;
  quantity: number;
  unit?: string;
  farmer_price?: number;
  offtaker_price?: number;
  broker_commission?: number;
  delivery?: CreateContractDelivery;
}

export interface DeliveryWeightData {
  first_weight?: number;
  first_weighbridge_ticket?: string;
  second_weight?: number;
  second_weighbridge_ticket?: string;
  bucket_count?: number;
  bucket_capacity_kg?: number;
  bucket_photo_url?: string;
  bucket_approved?: boolean;
}

export interface UpdateDeliveryStatusInput {
  delivery_id?: string;
  contract_id?: string;
  status?: string;
  gps_lat?: number;
  gps_lng?: number;
  weight_data?: DeliveryWeightData;
}

export async function invokeCreateContract(input: CreateContractInput): Promise<{ contract?: any; delivery?: any; error?: unknown }> {
  if (!liveConfigured()) return {};
  try {
    const { data, error } = await supabase.functions.invoke('create-contract', { body: input });
    if (error) return { error };
    return { contract: data?.contract, delivery: data?.delivery };
  } catch (e) {
    return { error: e };
  }
}

export async function invokeUpdateDeliveryStatus(input: UpdateDeliveryStatusInput): Promise<{ delivery?: any; error?: unknown }> {
  if (!liveConfigured()) return {};
  try {
    const { data, error } = await supabase.functions.invoke('update-delivery-status', { body: input });
    if (error) return { error };
    return { delivery: data?.delivery };
  } catch (e) {
    return { error: e };
  }
}

/**
 * Generates the settlement ledger rows (farmer settlement, offtaker invoice,
 * broker commission) via the edge function. The DB trigger may already have
 * created them when the delivery reached DELIVERED — a 409 there is fine.
 */
export async function invokeGenerateSettlement(contractId: string): Promise<{ summary?: any; error?: unknown; alreadyGenerated?: boolean }> {
  if (!liveConfigured()) return {};
  try {
    const { data, error } = await supabase.functions.invoke('generate-settlement', { body: { contract_id: contractId } });
    if (error) return { error, alreadyGenerated: (error as any)?.context?.status === 409 };
    return { summary: data?.summary };
  } catch (e) {
    return { error: e };
  }
}

/**
 * Finalizes a settlement the way an admin "Release Payment" should: marks the
 * ledger rows paid/settled, completes the wallet payment, and closes the
 * contract at PAID. Runs with the signed-in user's JWT — RLS only allows
 * admin/broker to update these tables, which is who this button is for.
 */
export async function markSettlementPaid(contractId: string, contractNumber: string): Promise<void> {
  if (!liveConfigured()) return;
  try {
    const now = new Date().toISOString();
    await supabase.from('farmer_settlements').update({ status: 'PAID', paid_at: now }).eq('contract_id', contractId);
    await supabase.from('offtaker_invoices').update({ status: 'PAID', paid_at: now }).eq('contract_id', contractId);
    await supabase.from('broker_commission_ledger').update({ status: 'SETTLED', settled_at: now }).eq('contract_id', contractId);
    await supabase.from('payments').update({ status: 'COMPLETED', updated_at: now }).eq('contract_id', contractId).eq('reference', contractNumber);
    await supabase.from('contracts').update({ status: 'PAID' }).eq('id', contractId);
  } catch (e) {
    console.error('[backend] mark settlement paid failed:', e);
  }
}

export async function settleContract(contractId: string, contractNumber: string): Promise<void> {
  if (!liveConfigured()) return;
  const res = await invokeGenerateSettlement(contractId);
  if (res.error && !res.alreadyGenerated) {
    console.error('[backend] generate-settlement failed:', res.error);
  }
  await markSettlementPaid(contractId, contractNumber);
}

/* ---------- driver assignment ---------- */

export async function resolveDriverId(driverName: string): Promise<string | null> {
  if (!liveConfigured() || !driverName) return null;
  try {
    const { data } = await supabase.from('users').select('id').ilike('full_name', `%${driverName}%`).eq('role', 'driver').maybeSingle();
    return data?.id || null;
  } catch {
    return null;
  }
}

/**
 * Points a contract's delivery at a real driver so is_assigned_driver()
 * exposes the contract to that driver under RLS. Upserts the delivery row.
 */
export async function setDeliveryDriver(contractId: string, driverId: string): Promise<void> {
  if (!liveConfigured() || !contractId || !driverId) return;
  try {
    const { data: existing } = await supabase.from('deliveries').select('id').eq('contract_id', contractId).maybeSingle();
    if (existing?.id) {
      await supabase.from('deliveries').update({ driver_id: driverId }).eq('id', existing.id);
    } else {
      await supabase.from('deliveries').insert({ contract_id: contractId, driver_id: driverId, status: 'PENDING' });
    }
  } catch (e) {
    console.error('[backend] set delivery driver failed:', e);
  }
}

export async function assignDriverByName(contractId: string, driverName: string): Promise<void> {
  const driverId = await resolveDriverId(driverName);
  if (driverId) await setDeliveryDriver(contractId, driverId);
}

/* ---------- consignment status pipeline ---------- */

interface LoadLike {
  contractId?: string;
  deliveryId?: string;
  weightMode?: string;
  weight1?: number;
  weight2?: number;
  bags?: number;
  buckets?: number;
  bucketKg?: number;
  inputKg?: number;
  slip?: string;
  photos?: string[];
}

/**
 * Maps a dashboard freight action to an update-delivery-status call so real
 * deliveries (and thus the assigned driver's contract visibility) advance on
 * the server instead of living only in contracts.meta. No-op for demo mode.
 */
export async function syncDeliveryStatus(l: LoadLike, action: string): Promise<void> {
  if (!liveConfigured()) return;
  if (!l.contractId) return;

  const step: Record<string, UpdateDeliveryStatusInput> = {
    start: { contract_id: l.contractId, status: 'LOADING' },
    w1: {
      contract_id: l.contractId,
      status: 'FIRST_WEIGHT',
      weight_data: { first_weight: l.weight1, first_weighbridge_ticket: l.slip || undefined },
    },
    count: {
      contract_id: l.contractId,
      status: 'DELIVERED',
      weight_data: { bucket_count: l.buckets || 0, bucket_capacity_kg: l.bucketKg || 20, bucket_approved: true },
    },
    depart: { contract_id: l.contractId, status: 'IN_TRANSIT', gps_lat: -17.883, gps_lng: 31.033 },
    arrive: { contract_id: l.contractId, status: 'IN_TRANSIT' },
    w2: {
      contract_id: l.contractId,
      status: 'SECOND_WEIGHT',
      weight_data: { second_weight: l.weight2, second_weighbridge_ticket: l.slip || undefined },
    },
    deliver: { contract_id: l.contractId, status: 'DELIVERED' },
  };

  const input = step[action];
  if (!input) return;

  const { error } = await invokeUpdateDeliveryStatus(input);
  if (error) console.error('[backend] update-delivery-status failed:', error);
}
