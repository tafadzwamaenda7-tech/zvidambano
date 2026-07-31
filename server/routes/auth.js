import { Router } from 'express';
import db from '../db.js';
import crypto from 'crypto';

const router = Router();

function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(pw, salt, 100000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(pw, stored) {
  const [salt, hash] = stored.split(':');
  const test = crypto.pbkdf2Sync(pw, salt, 100000, 64, 'sha512').toString('hex');
  return test === hash;
}

router.post('/register', (req, res) => {
  const { email, password, full_name, role, phone } = req.body;

  if (!email || !password || !full_name || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const password_hash = hashPassword(password);
  const result = db.prepare(
    'INSERT INTO users (email, password_hash, full_name, role, phone) VALUES (?, ?, ?, ?, ?)'
  ).run(email, password_hash, full_name, role, phone || null);

  res.status(201).json({
    id: result.lastInsertRowid,
    email,
    full_name,
    role
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user || !verifyPassword(password, user.password_hash)) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  res.json({
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    phone: user.phone,
    avatar_url: user.avatar_url
  });
});

export default router;
