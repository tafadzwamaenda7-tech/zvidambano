/**
 * Warehouse Receipts — proof of stored grain that collateralises buying power
 * (offtakers) and input credit (farmers).
 *
 * DEMO accounts (seeded @zvida.zw personas) keep receipts in localStorage and
 * never touch Supabase. REAL accounts read/write their own rows in the
 * `warehouse_receipts` table, which is RLS-scoped to auth.uid() as holder.
 */

import { supabase } from './supabase';
import { handleSupabaseError } from './error-handler';
import { liveConfigured } from './zvida-live';

export interface WarehouseReceipt {
  id: string;
  receipt_number: string;
  holder_id: string;
  issued_by?: string | null;
  contract_id?: string | null;
  commodity: string;
  quantity_kg: number;
  quality_grade?: string;
  storage_location?: string;
  issue_date: string;
  maturity_date?: string | null;
  status: 'ISSUED' | 'PLEDGED' | 'RELEASED' | 'REDEEMED' | 'EXPIRED';
  collateralized_amount?: number | null;
  created_at: string;
}

export type WarehouseReceiptStatus = WarehouseReceipt['status'];

const WR_KEY = 'zvida_receipts_v1';

function readDemo(): WarehouseReceipt[] {
  try {
    const list = JSON.parse(localStorage.getItem(WR_KEY) || '[]');
    return Array.isArray(list) ? (list as WarehouseReceipt[]) : [];
  } catch {
    return [];
  }
}

function writeDemo(list: WarehouseReceipt[]): void {
  try {
    localStorage.setItem(WR_KEY, JSON.stringify(list));
  } catch {
    /* ignore quota / private-mode errors */
  }
}

function demoId(): string {
  return `wr-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`;
}

const DEMO_SEEDS: Omit<WarehouseReceipt, 'id' | 'created_at'>[] = [
  {
    receipt_number: 'WR-ZVIDA-0001',
    holder_id: 'farmer',
    issued_by: 'GMB Grain Silo',
    commodity: 'Maize',
    quantity_kg: 12000,
    quality_grade: 'Grade A',
    storage_location: 'Harare · GMB Grain Silo',
    issue_date: '2026-05-12T08:00:00.000Z',
    maturity_date: '2026-11-12T00:00:00.000Z',
    status: 'PLEDGED',
    collateralized_amount: 4800,
  },
  {
    receipt_number: 'WR-ZVIDA-0002',
    holder_id: 'farmer',
    issued_by: 'ZVIDA Hub Ruwa',
    commodity: 'Soya',
    quantity_kg: 4000,
    quality_grade: 'Grade B',
    storage_location: 'Ruwa · ZVIDA Hub',
    issue_date: '2026-06-02T08:00:00.000Z',
    maturity_date: '2026-12-02T00:00:00.000Z',
    status: 'ISSUED',
  },
  {
    receipt_number: 'WR-ZVIDA-0003',
    holder_id: 'offtaker',
    issued_by: 'GMB Grain Silo',
    commodity: 'Maize',
    quantity_kg: 50000,
    quality_grade: 'Grade A',
    storage_location: 'Harare · GMB Grain Silo',
    issue_date: '2026-04-20T08:00:00.000Z',
    maturity_date: '2026-10-20T00:00:00.000Z',
    status: 'PLEDGED',
    collateralized_amount: 20000,
  },
  {
    receipt_number: 'WR-ZVIDA-0004',
    holder_id: 'offtaker',
    issued_by: 'GMB Grain Silo',
    commodity: 'Wheat',
    quantity_kg: 20000,
    quality_grade: 'Grade B',
    storage_location: 'Harare · GMB Grain Silo',
    issue_date: '2026-06-18T08:00:00.000Z',
    maturity_date: '2026-12-18T00:00:00.000Z',
    status: 'ISSUED',
  },
];

function seedDemo(): void {
  if (readDemo().length) return;
  writeDemo(
    DEMO_SEEDS.map((s) => ({ ...s, id: demoId(), created_at: s.issue_date }))
  );
}

/** Synchronous demo-only read, for rendering while a page paints. Real
    accounts never see demo receipts — they resolve to empty until live
    hydration swaps the panel to its async fetch. */
export function demoReceipts(holderId: string): WarehouseReceipt[] {
  if (liveConfigured()) return [];
  seedDemo();
  return readDemo().filter((r) => r.holder_id === holderId);
}

export function clearDemoReceipts(): void {
  writeDemo([]);
}

export async function getWarehouseReceipt(id: string): Promise<WarehouseReceipt | null> {
  if (liveConfigured()) {
    const { data, error } = await supabase
      .from('warehouse_receipts')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw handleSupabaseError(error);
    return (data as WarehouseReceipt) || null;
  }
  seedDemo();
  return readDemo().find((r) => r.id === id) || null;
}

export async function getWarehouseReceipts(holderId: string): Promise<WarehouseReceipt[]> {
  if (liveConfigured()) {
    const { data, error } = await supabase
      .from('warehouse_receipts')
      .select('*')
      .eq('holder_id', holderId)
      .order('issue_date', { ascending: false });
    if (error) throw handleSupabaseError(error);
    return (data as WarehouseReceipt[]) || [];
  }
  seedDemo();
  return readDemo().filter((r) => r.holder_id === holderId);
}

export async function issueWarehouseReceipt(input: {
  holder_id: string;
  commodity: string;
  quantity_kg: number;
  quality_grade?: string;
  storage_location?: string;
  issue_date?: string;
  maturity_date?: string;
}): Promise<WarehouseReceipt> {
  if (liveConfigured()) {
    const { data, error } = await supabase
      .from('warehouse_receipts')
      .insert({
        holder_id: input.holder_id,
        commodity: input.commodity,
        quantity_kg: input.quantity_kg,
        quality_grade: input.quality_grade,
        storage_location: input.storage_location,
        issue_date: input.issue_date || new Date().toISOString(),
        maturity_date: input.maturity_date || null,
      })
      .select()
      .single();
    if (error) throw handleSupabaseError(error);
    return data as WarehouseReceipt;
  }
  seedDemo();
  const rec: WarehouseReceipt = {
    id: demoId(),
    receipt_number: `WR-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 9) + 1}`,
    holder_id: input.holder_id,
    issued_by: 'ZVIDA Hub',
    commodity: input.commodity,
    quantity_kg: input.quantity_kg,
    quality_grade: input.quality_grade,
    storage_location: input.storage_location,
    issue_date: input.issue_date || new Date().toISOString(),
    maturity_date: input.maturity_date || null,
    status: 'ISSUED',
    created_at: new Date().toISOString(),
  };
  writeDemo([rec, ...readDemo()]);
  return rec;
}

export async function updateWarehouseReceipt(
  id: string,
  updates: { status?: WarehouseReceiptStatus; collateralized_amount?: number | null }
): Promise<WarehouseReceipt> {
  if (liveConfigured()) {
    const { data, error } = await supabase
      .from('warehouse_receipts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw handleSupabaseError(error);
    return data as WarehouseReceipt;
  }
  const list = readDemo();
  const i = list.findIndex((r) => r.id === id);
  if (i < 0) throw new Error('Warehouse receipt not found');
  list[i] = { ...list[i], ...updates };
  writeDemo(list);
  return list[i];
}

export async function deleteWarehouseReceipt(id: string): Promise<void> {
  if (liveConfigured()) {
    const { error } = await supabase.from('warehouse_receipts').delete().eq('id', id);
    if (error) throw handleSupabaseError(error);
    return;
  }
  writeDemo(readDemo().filter((r) => r.id !== id));
}

/** Estimated buying power = sum of collateralised value across PLEDGED receipts. */
export function buyingPower(receipts: WarehouseReceipt[]): number {
  return receipts
    .filter((r) => r.status === 'PLEDGED')
    .reduce((sum, r) => sum + (r.collateralized_amount || 0), 0);
}

export function pledgedTonnes(receipts: WarehouseReceipt[]): number {
  return (
    receipts
      .filter((r) => r.status === 'PLEDGED')
      .reduce((sum, r) => sum + r.quantity_kg, 0) / 1000
  );
}

export function totalTonnes(receipts: WarehouseReceipt[]): number {
  return receipts.reduce((sum, r) => sum + r.quantity_kg, 0) / 1000;
}
