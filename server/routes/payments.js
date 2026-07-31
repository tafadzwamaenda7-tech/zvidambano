import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const { status, contract_id } = req.query;
  const conditions = [];
  const params = [];

  if (status) { conditions.push('p.status = ?'); params.push(status); }
  if (contract_id) { conditions.push('p.contract_id = ?'); params.push(contract_id); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = db.prepare(`
    SELECT p.*, co.contract_number,
           payer.full_name as payer_name, payee.full_name as payee_name
    FROM payments p
    LEFT JOIN contracts co ON p.contract_id = co.id
    LEFT JOIN users payer ON p.payer_id = payer.id
    LEFT JOIN users payee ON p.payee_id = payee.id
    ${where}
    ORDER BY p.created_at DESC
  `).all(...params);

  res.json(rows);
});

router.post('/', (req, res) => {
  const { contract_id, payer_id, payee_id, amount, currency, method, reference } = req.body;
  const result = db.prepare(`
    INSERT INTO payments (contract_id, payer_id, payee_id, amount, currency, method, reference)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(contract_id, payer_id, payee_id, amount, currency || 'USD', method || null, reference || null);

  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/:id/status', (req, res) => {
  const { status } = req.body;
  db.prepare(`UPDATE payments SET status = ? WHERE id = ?`).run(status, req.params.id);
  res.json({ ok: true });
});

export default router;
