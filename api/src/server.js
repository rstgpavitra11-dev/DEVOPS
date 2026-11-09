import express from 'express';
import pg from 'pg';

const { Pool } = pg;
const app = express();
const port = Number(process.env.PORT || 3000);
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'tasks',
  user: process.env.DB_USER || 'tasks',
  password: process.env.DB_PASSWORD || 'tasks'
});

app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

let initialized;
async function ensureSchema() {
  initialized ??= pool.query(`
    CREATE TABLE IF NOT EXISTS tasks (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL CHECK (length(title) BETWEEN 1 AND 200),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  return initialized;
}

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch {
    res.status(503).json({ status: 'unavailable' });
  }
});

app.get('/api/tasks', async (_req, res, next) => {
  try {
    await ensureSchema();
    const { rows } = await pool.query('SELECT id, title, created_at FROM tasks ORDER BY id DESC');
    res.json(rows);
  } catch (error) { next(error); }
});

app.post('/api/tasks', async (req, res, next) => {
  const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
  if (!title || title.length > 200) return res.status(400).json({ error: 'Title must be 1–200 characters.' });
  try {
    await ensureSchema();
    const { rows } = await pool.query('INSERT INTO tasks(title) VALUES($1) RETURNING id, title, created_at', [title]);
    res.status(201).json(rows[0]);
  } catch (error) { next(error); }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Internal server error' });
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log(`API listening on ${port}`));
}

export { app, pool };

