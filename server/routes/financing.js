import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const { farmer_id, status } = req.query;
  const conditions = [];
  const params = [];

  if (farmer_id) { conditions.push('fa.farmer_id = ?'); params.push(farmer_id); }
  if (status) { conditions.push('fa.status = ?'); params.push(status); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = db.prepare(`
    SELECT fa.*, u.full_name as farmer_name
    FROM financing_applications fa
    LEFT JOIN users u ON fa.farmer_id = u.id
    ${where}
    ORDER BY fa.created_at DESC
  `).all(...params);

  res.json(rows);
});

router.post('/', (req, res) => {
  const { farmer_id, amount, purpose, contract_id } = req.body;

  const result = db.prepare(`
    INSERT INTO financing_applications (farmer_id, amount, purpose, contract_id)
    VALUES (?, ?, ?, ?)
  `).run(farmer_id, amount, purpose || null, contract_id || null);

  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/:id/status', (req, res) => {
  const { status } = req.body;
  db.prepare(`UPDATE financing_applications SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(status, req.params.id);
  res.json({ ok: true });
});

export default router;
