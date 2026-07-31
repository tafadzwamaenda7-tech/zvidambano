import { Router } from 'express';
import db from '../db.js';

const router = Router();

router.get('/', (req, res) => {
  const { user_id } = req.query;
  const params = [];
  let where = '';

  if (user_id) { where = 'WHERE m.sender_id = ? OR m.receiver_id = ?'; params.push(user_id, user_id); }

  const rows = db.prepare(`
    SELECT m.*, s.full_name as sender_name, r.full_name as receiver_name
    FROM messages m
    LEFT JOIN users s ON m.sender_id = s.id
    LEFT JOIN users r ON m.receiver_id = r.id
    ${where}
    ORDER BY m.created_at DESC
    LIMIT 100
  `).all(...params);

  res.json(rows);
});

router.get('/conversation', (req, res) => {
  const { user_a, user_b } = req.query;
  if (!user_a || !user_b) return res.status(400).json({ error: 'user_a and user_b required' });

  const rows = db.prepare(`
    SELECT m.*, s.full_name as sender_name
    FROM messages m
    LEFT JOIN users s ON m.sender_id = s.id
    WHERE (m.sender_id = ? AND m.receiver_id = ?) OR (m.sender_id = ? AND m.receiver_id = ?)
    ORDER BY m.created_at ASC
  `).all(user_a, user_b, user_b, user_a);

  res.json(rows);
});

router.post('/', (req, res) => {
  const { sender_id, receiver_id, body } = req.body;
  const result = db.prepare(`
    INSERT INTO messages (sender_id, receiver_id, body)
    VALUES (?, ?, ?)
  `).run(sender_id, receiver_id, body);

  res.status(201).json({ id: result.lastInsertRowid });
});

export default router;
