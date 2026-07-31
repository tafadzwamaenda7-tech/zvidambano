import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const { contract_id, type } = req.query;
  const conditions = [];
  const params = [];

  if (contract_id) { conditions.push('d.contract_id = ?'); params.push(contract_id); }
  if (type) { conditions.push('d.type = ?'); params.push(type); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = db.prepare(`
    SELECT d.*, co.contract_number
    FROM documents d
    LEFT JOIN contracts co ON d.contract_id = co.id
    ${where}
    ORDER BY d.created_at DESC
  `).all(...params);

  res.json(rows);
});

router.post('/', (req, res) => {
  const { contract_id, type, name, file_url, uploaded_by } = req.body;

  const result = db.prepare(`
    INSERT INTO documents (contract_id, type, name, file_url, uploaded_by)
    VALUES (?, ?, ?, ?, ?)
  `).run(contract_id, type, name, file_url || null, uploaded_by || null);

  res.status(201).json({ id: result.lastInsertRowid });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM documents WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
