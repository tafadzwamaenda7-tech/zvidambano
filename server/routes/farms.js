import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const { owner_id } = req.query;
  const conditions = [];
  const params = [];

  if (owner_id) { conditions.push('f.owner_id = ?'); params.push(owner_id); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = db.prepare(`
    SELECT f.*, u.full_name as owner_name
    FROM farms f
    LEFT JOIN users u ON f.owner_id = u.id
    ${where}
    ORDER BY f.created_at DESC
  `).all(...params);

  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare(`
    SELECT f.*, u.full_name as owner_name
    FROM farms f
    LEFT JOIN users u ON f.owner_id = u.id
    WHERE f.id = ?
  `).get(req.params.id);

  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

router.post('/', (req, res) => {
  const { owner_id, name, location, size, size_unit, description } = req.body;

  const result = db.prepare(`
    INSERT INTO farms (owner_id, name, location, size, size_unit, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(owner_id, name, location || null, size || null, size_unit || 'hectares', description || null);

  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const { name, location, size, size_unit, description } = req.body;
  db.prepare(`
    UPDATE farms SET name = COALESCE(?, name), location = COALESCE(?, location),
    size = COALESCE(?, size), size_unit = COALESCE(?, size_unit),
    description = COALESCE(?, description), updated_at = datetime('now')
    WHERE id = ?
  `).run(name, location, size, size_unit, description, req.params.id);

  res.json({ ok: true });
});

export default router;
