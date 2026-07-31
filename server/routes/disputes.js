import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const { status, raised_by } = req.query;
  const conditions = [];
  const params = [];

  if (status) { conditions.push('dp.status = ?'); params.push(status); }
  if (raised_by) { conditions.push('dp.raised_by = ?'); params.push(raised_by); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = db.prepare(`
    SELECT dp.*, co.contract_number, u.full_name as raised_by_name
    FROM disputes dp
    LEFT JOIN contracts co ON dp.contract_id = co.id
    LEFT JOIN users u ON dp.raised_by = u.id
    ${where}
    ORDER BY dp.created_at DESC
  `).all(...params);

  res.json(rows);
});

router.post('/', (req, res) => {
  const { contract_id, raised_by, reason, description } = req.body;
  const result = db.prepare(`
    INSERT INTO disputes (contract_id, raised_by, reason, description)
    VALUES (?, ?, ?, ?)
  `).run(contract_id, raised_by, reason, description || null);

  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/:id/resolve', (req, res) => {
  const { status, resolution } = req.body;
  db.prepare(`
    UPDATE disputes SET status = ?, resolution = ?, resolved_at = datetime('now') WHERE id = ?
  `).run(status, resolution, req.params.id);
  res.json({ ok: true });
});

export default router;
