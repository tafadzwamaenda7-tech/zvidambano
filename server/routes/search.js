import { Router } from 'express';
import db from '../db.js';

const router = Router();

const SEARCHABLE = [
  {
    table: 'users',
    columns: ['full_name', 'email', 'phone', 'role'],
    label: 'Users',
    map: r => ({ type: 'user', id: r.id, title: r.full_name, subtitle: `${r.role} — ${r.email}`, role: r.role })
  },
  {
    table: 'commodities',
    columns: ['name', 'category', 'description'],
    label: 'Commodities',
    map: r => ({ type: 'commodity', id: r.id, title: r.name, subtitle: r.category, category: r.category })
  },
  {
    table: 'listings',
    columns: ['title', 'description', 'grade', 'origin', 'category'],
    label: 'Listings',
    map: r => ({ type: 'listing', id: r.id, title: r.title, subtitle: `${r.quantity}${r.unit} — ${r.grade || 'Standard'}`, status: r.status })
  },
  {
    table: 'contracts',
    columns: ['contract_number', 'status'],
    label: 'Contracts',
    map: r => ({ type: 'contract', id: r.id, title: r.contract_number, subtitle: r.status, status: r.status })
  },
  {
    table: 'deliveries',
    columns: ['origin', 'destination', 'vehicle_reg'],
    label: 'Deliveries',
    map: r => ({ type: 'delivery', id: r.id, title: `${r.origin} → ${r.destination}`, subtitle: r.vehicle_reg || 'Unassigned', status: r.status })
  },
  {
    table: 'disputes',
    columns: ['reason', 'description', 'status'],
    label: 'Disputes',
    map: r => ({ type: 'dispute', id: r.id, title: r.reason, subtitle: r.description?.slice(0, 80) || '', status: r.status })
  },
  {
    table: 'notifications',
    columns: ['title', 'body', 'type'],
    label: 'Notifications',
    map: r => ({ type: 'notification', id: r.id, title: r.title, subtitle: r.body?.slice(0, 80) || '' })
  },
  {
    table: 'messages',
    columns: ['body'],
    label: 'Messages',
    map: r => ({ type: 'message', id: r.id, title: r.body?.slice(0, 60) || '', subtitle: '' })
  },
  {
    table: 'documents',
    columns: ['type', 'title'],
    label: 'Documents',
    map: r => ({ type: 'document', id: r.id, title: r.title, subtitle: r.type })
  },
  {
    table: 'price_board',
    columns: ['region', 'source'],
    label: 'Price Board',
    map: r => ({ type: 'price', id: r.id, title: `${r.region || 'National'} — $${r.buying_price}/${r.selling_price}`, subtitle: r.source || '' })
  },
  {
    table: 'farms',
    columns: ['name', 'location'],
    label: 'Farms',
    map: r => ({ type: 'farm', id: r.id, title: r.name, subtitle: r.location || '' })
  },
  {
    table: 'input_orders',
    columns: ['product_name', 'status'],
    label: 'Input Orders',
    map: r => ({ type: 'input_order', id: r.id, title: r.product_name, subtitle: r.status })
  },
  {
    table: 'financing_applications',
    columns: ['purpose', 'status'],
    label: 'Financing',
    map: r => ({ type: 'financing', id: r.id, title: r.purpose || 'Loan Application', subtitle: `$${r.amount} — ${r.status}` })
  },
  {
    table: 'equipment_listings',
    columns: ['title', 'description', 'category', 'condition'],
    label: 'Equipment',
    map: r => ({ type: 'equipment', id: r.id, title: r.title, subtitle: `${r.category || ''} — ${r.condition || ''}` })
  }
];

router.get('/', (req, res) => {
  const q = (req.query.q || '').trim();
  const limit = Math.min(parseInt(req.query.limit) || 20, 50);
  const offset = parseInt(req.query.offset) || 0;
  const typeFilter = req.query.type;

  if (!q || q.length < 2) {
    return res.json({ results: [], total: 0, query: q });
  }

  const pattern = `%${q}%`;
  let allResults = [];
  let total = 0;

  const targets = typeFilter
    ? SEARCHABLE.filter(s => s.table === typeFilter)
    : SEARCHABLE;

  for (const target of targets) {
    const conditions = target.columns.map(c => `${c} LIKE ?`).join(' OR ');
    const params = target.columns.map(() => pattern);

    const countRow = db.prepare(`SELECT COUNT(*) as cnt FROM ${target.table} WHERE ${conditions}`).get(...params);
    total += countRow.cnt;

    const rows = db.prepare(
      `SELECT * FROM ${target.table} WHERE ${conditions} LIMIT ? OFFSET ?`
    ).all(...params, limit, offset);

    for (const row of rows) {
      allResults.push(target.map(row));
    }
  }

  allResults.sort((a, b) => {
    const aStart = a.title.toLowerCase().startsWith(q.toLowerCase()) ? 0 : 1;
    const bStart = b.title.toLowerCase().startsWith(q.toLowerCase()) ? 0 : 1;
    return aStart - bStart;
  });

  allResults = allResults.slice(0, limit);

  res.json({
    results: allResults,
    total,
    query: q,
    limit,
    offset
  });
});

router.get('/stats', (req, res) => {
  const stats = {};
  for (const target of SEARCHABLE) {
    const row = db.prepare(`SELECT COUNT(*) as cnt FROM ${target.table}`).get();
    stats[target.table] = { label: target.label, count: row.cnt };
  }
  res.json(stats);
});

export default router;
