import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const { user_id } = req.query;
  const params = [];
  let where = '';

  if (user_id) { where = 'WHERE n.user_id = ?'; params.push(user_id); }

  const rows = db.prepare(`SELECT * FROM notifications ${where} ORDER BY created_at DESC LIMIT 50`).all(...params);
  res.json(rows);
});

router.post('/', (req, res) => {
  const { user_id, title, body, type, action_url } = req.body;
  const result = db.prepare(`
    INSERT INTO notifications (user_id, title, body, type, action_url)
    VALUES (?, ?, ?, ?, ?)
  `).run(user_id, title, body || null, type || 'info', action_url || null);

  res.status(201).json({ id: result.lastInsertRowid });
});

router.put('/read-all', (req, res) => {
  const { user_id } = req.body;
  db.prepare('UPDATE notifications SET read = 1 WHERE user_id = ?').run(user_id);
  res.json({ ok: true });
});

router.put('/:id/read', (req, res) => {
  db.prepare('UPDATE notifications SET read = 1 WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

export default router;
