import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const { contract_id, result } = req.query;
  const conditions = [];
  const params = [];

  if (contract_id) { conditions.push('qs.contract_id = ?'); params.push(contract_id); }
  if (result) { conditions.push('qs.result = ?'); params.push(result); }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const rows = db.prepare(`
    SELECT qs.*, co.contract_number
    FROM quality_scans qs
    LEFT JOIN contracts co ON qs.contract_id = co.id
    ${where}
    ORDER BY qs.created_at DESC
  `).all(...params);

  res.json(rows);
});

router.post('/', (req, res) => {
  const { contract_id, result, notes, image_url, scanned_by } = req.body;

  const scanResult = db.prepare(`
    INSERT INTO quality_scans (contract_id, result, notes, image_url, scanned_by)
    VALUES (?, ?, ?, ?, ?)
  `).run(contract_id, result, notes || null, image_url || null, scanned_by || null);

  res.status(201).json({ id: scanResult.lastInsertRowid });
});

export default router;
