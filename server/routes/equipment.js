import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const { owner_id, category, available } = req.query;
  const conditions = [];
  const params = [];

  if (owner_id) { conditions.push('e.owner_id = ?'); params.push(owner_id); }
  if (category) { conditions.push('e.category = ?'); params.push(category); }
  if (available !== undefined) { conditions.push('e.available = ?'); params.push(available); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = db.prepare(`
    SELECT e.*, u.full_name as owner_name
    FROM equipment_listings e
    LEFT JOIN users u ON e.owner_id = u.id
    ${where}
    ORDER BY e.created_at DESC
  `).all(...params);

  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare(`
    SELECT e.*, u.full_name as owner_name
    FROM equipment_listings e
    LEFT JOIN users u ON e.owner_id = u.id
    WHERE e.id = ?
  `).get(req.params.id);

  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

router.post('/', (req, res) => {
  const { owner_id, name, category, description, daily_rate, available } = req.body;

  const result = db.prepare(`
    INSERT INTO equipment_listings (owner_id, name, category, description, daily_rate, available)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(owner_id, name, category || null, description || null, daily_rate || null, available !== undefined ? available : 1);

  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const { name, category, description, daily_rate, available } = req.body;
  db.prepare(`
    UPDATE equipment_listings SET name = COALESCE(?, name), category = COALESCE(?, category),
    description = COALESCE(?, description), daily_rate = COALESCE(?, daily_rate),
    available = COALESCE(?, available), updated_at = datetime('now')
    WHERE id = ?
  `).run(name, category, description, daily_rate, available, req.params.id);

  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM equipment_listings WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
