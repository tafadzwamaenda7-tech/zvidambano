import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const { broker_id, status } = req.query;
  const conditions = [];
  const params = [];

  if (broker_id) { conditions.push('bc.broker_id = ?'); params.push(broker_id); }
  if (status) { conditions.push('bc.status = ?'); params.push(status); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = db.prepare(`
    SELECT bc.*, u.full_name as broker_name, co.contract_number
    FROM broker_commission_ledger bc
    LEFT JOIN users u ON bc.broker_id = u.id
    LEFT JOIN contracts co ON bc.contract_id = co.id
    ${where}
    ORDER BY bc.created_at DESC
  `).all(...params);

  res.json(rows);
});

router.post('/', (req, res) => {
  const { broker_id, contract_id, amount, description } = req.body;

  const result = db.prepare(`
    INSERT INTO broker_commission_ledger (broker_id, contract_id, amount, description)
    VALUES (?, ?, ?, ?)
  `).run(broker_id, contract_id, amount, description || null);

  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/:id/status', (req, res) => {
  const { status } = req.body;
  db.prepare(`UPDATE broker_commission_ledger SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(status, req.params.id);
  res.json({ ok: true });
});

export default router;
