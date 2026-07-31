import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const { type, status, contract_id } = req.query;
  const conditions = [];
  const params = [];

  if (contract_id) { conditions.push('contract_id = ?'); params.push(contract_id); }
  if (status) { conditions.push('status = ?'); params.push(status); }

  let rows;
  if (type === 'farmer') {
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    rows = db.prepare(`
      SELECT fs.*, u.full_name as farmer_name, co.contract_number
      FROM farmer_settlements fs
      LEFT JOIN users u ON fs.farmer_id = u.id
      LEFT JOIN contracts co ON fs.contract_id = co.id
      ${where}
      ORDER BY fs.created_at DESC
    `).all(...params);
  } else if (type === 'offtaker') {
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    rows = db.prepare(`
      SELECT oi.*, u.full_name as offtaker_name, co.contract_number
      FROM offtaker_invoices oi
      LEFT JOIN users u ON oi.offtaker_id = u.id
      LEFT JOIN contracts co ON oi.contract_id = co.id
      ${where}
      ORDER BY oi.created_at DESC
    `).all(...params);
  } else {
    const farmerWhere = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const farmerRows = db.prepare(`
      SELECT fs.*, u.full_name as farmer_name, co.contract_number, 'farmer' as type
      FROM farmer_settlements fs
      LEFT JOIN users u ON fs.farmer_id = u.id
      LEFT JOIN contracts co ON fs.contract_id = co.id
      ${farmerWhere}
      ORDER BY fs.created_at DESC
    `).all(...params);

    const offtakerWhere = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const offtakerRows = db.prepare(`
      SELECT oi.*, u.full_name as offtaker_name, co.contract_number, 'offtaker' as type
      FROM offtaker_invoices oi
      LEFT JOIN users u ON oi.offtaker_id = u.id
      LEFT JOIN contracts co ON oi.contract_id = co.id
      ${offtakerWhere}
      ORDER BY oi.created_at DESC
    `).all(...params);

    rows = [...farmerRows, ...offtakerRows].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  res.json(rows);
});

router.post('/', (req, res) => {
  const { type, farmer_id, offtaker_id, contract_id, amount, description } = req.body;

  if (type === 'farmer') {
    const result = db.prepare(`
      INSERT INTO farmer_settlements (farmer_id, contract_id, amount, description)
      VALUES (?, ?, ?, ?)
    `).run(farmer_id, contract_id, amount, description || null);
    res.status(201).json({ id: result.lastInsertRowid });
  } else if (type === 'offtaker') {
    const result = db.prepare(`
      INSERT INTO offtaker_invoices (offtaker_id, contract_id, amount, description)
      VALUES (?, ?, ?, ?)
    `).run(offtaker_id, contract_id, amount, description || null);
    res.status(201).json({ id: result.lastInsertRowid });
  } else {
    res.status(400).json({ error: 'type must be farmer or offtaker' });
  }
});

router.put('/:id/status', (req, res) => {
  const { status, type } = req.body;
  if (type === 'farmer') {
    db.prepare(`UPDATE farmer_settlements SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(status, req.params.id);
  } else if (type === 'offtaker') {
    db.prepare(`UPDATE offtaker_invoices SET status = ?, updated_at = datetime('now') WHERE id = ?`).run(status, req.params.id);
  } else {
    return res.status(400).json({ error: 'type must be farmer or offtaker' });
  }
  res.json({ ok: true });
});

export default router;
