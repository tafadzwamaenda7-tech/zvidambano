import { it, expect, vi } from 'vitest';
import type { LiveProduct } from '../src/lib/zvida-live';

const holder = vi.hoisted(() => {
  class FakeDB {
    tables: Record<string, any[]> = {};
    insert(table: string, row: any) {
      (this.tables[table] ||= []).push({ ...row });
    }
  }
  return { db: new FakeDB(), FakeDB };
});

vi.mock('../src/lib/supabase', () => {
  const from = (table: string) => {
    const filters: { col: string; op: string; v: any }[] = [];
    const q: any = {
      select: () => q,
      eq: (col: string, v: any) => (filters.push({ col, op: 'eq', v }), q),
      is: (col: string, v: any) => (filters.push({ col, op: v === null ? 'is_null' : 'is', v }), q),
      order: () => q,
      limit: () => q,
      maybeSingle: async () => ({ data: null, error: null }),
      then: (res: any) => {
        const rows = holder.db.tables[table] || [];
        return Promise.resolve({ data: rows, error: null }).then(res);
      },
      insert: (row: any) => {
        holder.db.insert(table, row);
        return { then: (res: any) => Promise.resolve({ data: null, error: null }).then(res) };
      },
    };
    return q;
  };
  return { supabase: { from } };
});

import { setLiveAccount, persistProduct, fetchProducts } from '../src/lib/zvida-live';

const FARMER = { id: 'farmer-1', role: 'farmer', name: 'James Munyoro', isDemo: false };
const OFFTAKER = { id: 'offtaker-1', role: 'offtaker', name: 'Tapiwa Marufu', isDemo: false };

it('probe flow', async () => {
  vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
  holder.db.tables['commodities'] = [{ id: 'c-soya', name: 'Soya Beans' }];
  setLiveAccount(FARMER);
  const p: LiveProduct = {
    id: 'fp1', name: 'Soya Beans 10t · Reserve $520/t · Deliver to Ruwa', category: 'Grain',
    price: 520, unit: 't', seller: 'James Munyoro', stock: 10, rating: 4.5, reviews: 0, thumb: 'soya',
  };
  await persistProduct(p);
  console.log('LISTINGS AFTER INSERT', JSON.stringify(holder.db.tables['listings']));
  setLiveAccount(OFFTAKER);
  const prods = await fetchProducts();
  console.log('FETCH RESULT', JSON.stringify(prods));
  expect(prods.find((x) => x.name.includes('Soya Beans'))).toBeTruthy();
});
