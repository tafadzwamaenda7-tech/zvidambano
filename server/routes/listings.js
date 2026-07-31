import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const { category, status, seller_id } = req.query;
  const conditions = [];
  const params = [];

  if (category) { conditions.push('l.category = ?'); params.push(category); }
  if (status) { conditions.push('l.status = ?'); params.push(status); }
  if (seller_id) { conditions.push('l.seller_id = ?'); params.push(seller_id); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = db.prepare(`
    SELECT l.*, c.name as commodity_name, u.full_name as seller_name
    FROM listings l
    LEFT JOIN commodities c ON l.commodity_id = c.id
    LEFT JOIN users u ON l.seller_id = u.id
    ${where}
    ORDER BY l.created_at DESC
  `).all(...params);

  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare(`
    SELECT l.*, c.name as commodity_name, u.full_name as seller_name
    FROM listings l
    LEFT JOIN commodities c ON l.commodity_id = c.id
    LEFT JOIN users u ON l.seller_id = u.id
    WHERE l.id = ?
  `).get(req.params.id);

  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

router.post('/', (req, res) => {
  const { seller_id, commodity_id, title, description, quantity, unit, asking_price, category, grade, origin } = req.body;

  const result = db.prepare(`
    INSERT INTO listings (seller_id, commodity_id, title, description, quantity, unit, asking_price, category, grade, origin)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(seller_id, commodity_id, title, description || null, quantity, unit || 'kg', asking_price || null, category || null, grade || null, origin || null);

  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/:id', (req, res) => {
  const { title, description, quantity, unit, asking_price, grade, status } = req.body;
  db.prepare(`
    UPDATE listings SET title = COALESCE(?, title), description = COALESCE(?, description),
    quantity = COALESCE(?, quantity), unit = COALESCE(?, unit), asking_price = COALESCE(?, asking_price),
    grade = COALESCE(?, grade), status = COALESCE(?, status), updated_at = datetime('now')
    WHERE id = ?
  `).run(title, description, quantity, unit, asking_price, grade, status, req.params.id);

  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  db.prepare('DELETE FROM listings WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
