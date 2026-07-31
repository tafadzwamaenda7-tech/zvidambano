import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const { commodity_id, region } = req.query;
  const conditions = [];
  const params = [];

  if (commodity_id) { conditions.push('p.commodity_id = ?'); params.push(commodity_id); }
  if (region) { conditions.push('p.region = ?'); params.push(region); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = db.prepare(`
    SELECT p.*, c.name as commodity_name
    FROM price_board p
    LEFT JOIN commodities c ON p.commodity_id = c.id
    ${where}
    ORDER BY p.created_at DESC
  `).all(...params);

  res.json(rows);
});

router.post('/', (req, res) => {
  const { commodity_id, region, price, unit } = req.body;

  const result = db.prepare(`
    INSERT INTO price_board (commodity_id, region, price, unit)
    VALUES (?, ?, ?, ?)
  `).run(commodity_id, region, price, unit || 'kg');

  res.status(201).json({ id: result.lastInsertRowid });
});

export default router;
