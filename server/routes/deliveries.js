import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const { status, driver_id, contract_id } = req.query;
  const conditions = [];
  const params = [];

  if (status) { conditions.push('d.status = ?'); params.push(status); }
  if (driver_id) { conditions.push('d.driver_id = ?'); params.push(driver_id); }
  if (contract_id) { conditions.push('d.contract_id = ?'); params.push(contract_id); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = db.prepare(`
    SELECT d.*, co.contract_number, dr.full_name as driver_name
    FROM deliveries d
    LEFT JOIN contracts co ON d.contract_id = co.id
    LEFT JOIN users dr ON d.driver_id = dr.id
    ${where}
    ORDER BY d.created_at DESC
  `).all(...params);

  res.json(rows);
});

router.get('/:id', (req, res) => {
  const row = db.prepare(`
    SELECT d.*, co.contract_number, dr.full_name as driver_name
    FROM deliveries d
    LEFT JOIN contracts co ON d.contract_id = co.id
    LEFT JOIN users dr ON d.driver_id = dr.id
    WHERE d.id = ?
  `).get(req.params.id);

  if (!row) return res.status(404).json({ error: 'Not found' });
  res.json(row);
});

router.post('/', (req, res) => {
  const { contract_id, driver_id, vehicle_reg, origin, destination } = req.body;
  const result = db.prepare(`
    INSERT INTO deliveries (contract_id, driver_id, vehicle_reg, origin, destination)
    VALUES (?, ?, ?, ?, ?)
  `).run(contract_id, driver_id || null, vehicle_reg || null, origin, destination);

  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/:id/weight', (req, res) => {
  const { first_weight, first_weighbridge_ticket, second_weight, second_weighbridge_ticket, bucket_count, bucket_capacity_kg, bucket_photo_url } = req.body;
  db.prepare(`
    UPDATE deliveries SET
      first_weight = COALESCE(?, first_weight),
      first_weighbridge_ticket = COALESCE(?, first_weighbridge_ticket),
      second_weight = COALESCE(?, second_weight),
      second_weighbridge_ticket = COALESCE(?, second_weighbridge_ticket),
      bucket_count = COALESCE(?, bucket_count),
      bucket_capacity_kg = COALESCE(?, bucket_capacity_kg),
      bucket_photo_url = COALESCE(?, bucket_photo_url),
      updated_at = datetime('now')
    WHERE id = ?
  `).run(first_weight, first_weighbridge_ticket, second_weight, second_weighbridge_ticket, bucket_count, bucket_capacity_kg, bucket_photo_url, req.params.id);

  res.json({ ok: true });
});

router.put('/:id/status', (req, res) => {
  const { status } = req.body;
  db.prepare(`UPDATE deliveries SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(status, req.params.id);
  res.json({ ok: true });
});

export default router;
