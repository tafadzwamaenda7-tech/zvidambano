import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const { farmer_id, supplier_id, status } = req.query;
  const conditions = [];
  const params = [];

  if (farmer_id) { conditions.push('io.farmer_id = ?'); params.push(farmer_id); }
  if (supplier_id) { conditions.push('io.supplier_id = ?'); params.push(supplier_id); }
  if (status) { conditions.push('io.status = ?'); params.push(status); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = db.prepare(`
    SELECT io.*, u.full_name as farmer_name, s.full_name as supplier_name
    FROM input_orders io
    LEFT JOIN users u ON io.farmer_id = u.id
    LEFT JOIN users s ON io.supplier_id = s.id
    ${where}
    ORDER BY io.created_at DESC
  `).all(...params);

  res.json(rows);
});

router.post('/', (req, res) => {
  const { farmer_id, supplier_id, item, quantity, unit, total_cost } = req.body;

  const result = db.prepare(`
    INSERT INTO input_orders (farmer_id, supplier_id, item, quantity, unit, total_cost)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(farmer_id, supplier_id, item, quantity, unit || 'kg', total_cost || null);

  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/:id/status', (req, res) => {
  const { status } = req.body;
  db.prepare(`UPDATE input_orders SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(status, req.params.id);
  res.json({ ok: true });
});

export default router;
