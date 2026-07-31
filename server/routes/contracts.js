import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const { status, farmer_id, offtaker_id, broker_id } = req.query;
  const conditions = [];
  const params = [];

  if (status) { conditions.push('co.status = ?'); params.push(status); }
  if (farmer_id) { conditions.push('co.farmer_id = ?'); params.push(farmer_id); }
  if (offtaker_id) { conditions.push('co.offtaker_id = ?'); params.push(offtaker_id); }
  if (broker_id) { conditions.push('co.broker_id = ?'); params.push(broker_id); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = db.prepare(`
    SELECT co.*, c.name as commodity_name,
           f.full_name as farmer_name, o.full_name as offtaker_name, b.full_name as broker_name
    FROM contracts co
    LEFT JOIN commodities c ON co.commodity_id = c.id
    LEFT JOIN users f ON co.farmer_id = f.id
    LEFT JOIN users o ON co.offtaker_id = o.id
    LEFT JOIN users b ON co.broker_id = b.id
    ${where}
    ORDER BY co.created_at DESC
  `).all(...params);

  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare(`
    SELECT co.*, c.name as commodity_name,
           f.full_name as farmer_name, o.full_name as offtaker_name, b.full_name as broker_name
    FROM contracts co
    LEFT JOIN commodities c ON co.commodity_id = c.id
    LEFT JOIN users f ON co.farmer_id = f.id
    LEFT JOIN users o ON co.offtaker_id = o.id
    LEFT JOIN users b ON co.broker_id = b.id
    WHERE co.id = ?
  `).get(req.params.id);

  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

router.post('/', (req, res) => {
  const { farmer_id, offtaker_id, broker_id, commodity_id, listing_id, quantity, unit, farmer_price, offtaker_price, broker_commission } = req.body;
  const contract_number = `ZV-${Date.now().toString(36).toUpperCase()}`;

  const result = db.prepare(`
    INSERT INTO contracts (contract_number, farmer_id, offtaker_id, broker_id, commodity_id, listing_id, quantity, unit, farmer_price, offtaker_price, broker_commission)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(contract_number, farmer_id, offtaker_id, broker_id, commodity_id, listing_id || null, quantity, unit || 'kg', farmer_price || null, offtaker_price || null, broker_commission || null);

  res.status(201).json({ id: result.lastInsertRowid, contract_number });
});

router.put('/:id/status', (req, res) => {
  const { status } = req.body;
  db.prepare(`UPDATE contracts SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(status, req.params.id);
  res.json({ ok: true });
});

export default router;
