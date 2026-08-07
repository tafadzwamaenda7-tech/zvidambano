import { it, expect, vi } from 'vitest';

const holder = vi.hoisted(() => {
  type Filter = { col: string; op: string; v: unknown };
  function matches(row: Record<string, unknown>, f: Filter): boolean {
    switch (f.op) {
      case 'eq': return row[f.col] === f.v;
      case 'neq': return row[f.col] !== f.v;
      case 'in': return Array.isArray(f.v) && f.v.includes(row[f.col]);
      case 'is_null': return row[f.col] === null || row[f.col] === undefined;
      case 'is': return row[f.col] === f.v;
      case 'ilike': { const val = String(row[f.col] ?? ''); return val.toLowerCase().includes(String(f.v).toLowerCase().replace(/%/g, '')); }
      default: return true;
    }
  }
  class FakeDB {
    tables: Record<string, Record<string, unknown>[]> = {};
    seed(t: string, rows: Record<string, unknown>[]) { this.tables[t] = rows.map((r) => ({ ...r })); }
    all(t: string) { return this.tables[t] || []; }
    insert(t: string, row: Record<string, unknown>) { (this.tables[t] ||= []).push({ ...row }); }
    update(t: string, patch: Record<string, unknown>, filters: Filter[]) {
      let n = 0;
      for (const r of this.all(t)) if (filters.every((f) => matches(r, f))) { Object.assign(r, patch); n++; }
      return n;
    }
  }
  return { db: new FakeDB() as InstanceType<typeof FakeDB>, FakeDB, matches };
});

function makeClient(h: typeof holder) {
  const from = (table: string) => {
    const filters: { col: string; op: string; v: unknown }[] = [];
    let limitN: number | null = null;
    const scan = () => {
      if (!h.db) return [];
      let rows = h.db.all(table).filter((r) => filters.every((f) => h.matches(r, f)));
      if (limitN != null) rows = rows.slice(0, limitN);
      return rows;
    };
    const insertQ: any = { then: (res: any) => Promise.resolve({ data: h.db.insert(table, insertRow) as any, error: null }).then(res) };
    let insertRow: Record<string, unknown> = {};
    const q: any = {
      select: () => q,
      eq: (col: string, v: unknown) => (filters.push({ col, op: 'eq', v }), q),
      is: (col: string, v: unknown) => (filters.push({ col, op: v === null ? 'is_null' : 'is', v }), q),
      order: () => q,
      limit: (n: number) => (limitN = n, q),
      maybeSingle: async () => { const rows = scan(); return { data: rows[0] ?? null, error: null }; },
      insert: (row: Record<string, unknown>) => (insertRow = row, insertQ),
      then: (res: any) => Promise.resolve({ data: scan(), error: null }).then(res),
    };
    return q;
  };
  return { from };
}

it('probe fake query chain', async () => {
  const client = makeClient(holder);
  holder.db.seed('listings', [{ id: 'l1', title: 'Maize', status: 'active', meta: null, seller_id: 'f1' }]);
  const { data } = await client.from('listings').select('*').is('meta', null).eq('status', 'active');
  console.log('SCAN RESULT', JSON.stringify(data));
  expect(data).toHaveLength(1);
});
