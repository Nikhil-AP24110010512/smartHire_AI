import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const PORT = 3001;
const JWT_SECRET = 'super-secret-key-for-smarthire-local-dev';

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Setup Database
let db: any;
(async () => {
  db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE,
      password TEXT,
      name TEXT
    );
    CREATE TABLE IF NOT EXISTS screenings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER,
      job_title TEXT,
      result_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);
  
  // Try adding name column if it doesn't exist (for existing databases)
  try {
    await db.exec('ALTER TABLE users ADD COLUMN name TEXT;');
  } catch (e) {
    // Column already exists
  }
  
  console.log('Database initialized.');

  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
})();

process.stdin.resume();

// Middleware to authenticate JWT
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- AUTH ENDPOINTS ---

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return res.status(400).json({ error: 'Name, email, and password required' });

    const existingUser = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) return res.status(400).json({ error: 'Email already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.run('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', [email, hashedPassword, name]);
    
    const token = jwt.sign({ id: result.lastID, email, name }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: result.lastID, email, name } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) return res.status(400).json({ error: 'Invalid credentials' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/me', authenticateToken, async (req: any, res) => {
  const user = await db.get('SELECT id, email FROM users WHERE id = ?', [req.user.id]);
  res.json({ user });
});

// --- SCREENINGS ENDPOINTS ---

app.post('/api/screenings', authenticateToken, async (req: any, res) => {
  try {
    const { jobTitle, resultJson } = req.body;
    const result = await db.run(
      'INSERT INTO screenings (user_id, job_title, result_json) VALUES (?, ?, ?)',
      [req.user.id, jobTitle, JSON.stringify(resultJson)]
    );
    res.status(201).json({ id: result.lastID });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/screenings', authenticateToken, async (req: any, res) => {
  try {
    const screenings = await db.all(
      'SELECT id, job_title, created_at FROM screenings WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json(screenings);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/screenings/:id', authenticateToken, async (req: any, res) => {
  try {
    const screening = await db.get(
      'SELECT * FROM screenings WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (!screening) return res.status(404).json({ error: 'Not found' });
    
    // Parse JSON back to object
    screening.result_json = JSON.parse(screening.result_json);
    res.json(screening);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
