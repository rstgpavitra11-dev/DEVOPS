import test from 'node:test';
import assert from 'node:assert/strict';
import { app, pool } from '../src/server.js';

test('POST /api/tasks rejects blank titles', async () => {
  const server = app.listen(0);
  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/api/tasks`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title: '   ' })
    });
    assert.equal(response.status, 400);
    assert.deepEqual(await response.json(), { error: 'Title must be 1–200 characters.' });
  } finally {
    server.close();
    await pool.end();
  }
});

