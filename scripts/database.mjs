import { readFileSync, existsSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { createDatabase } from '@complyos/runtime/database';
import { migrate } from './migrations.mjs';
const file = new URL('../apps/api/.env', import.meta.url);
const env = { ...(existsSync(file) ? parseEnv(readFileSync(file, 'utf8')) : {}), ...process.env };
let db;
try {
  if (!env.DATABASE_URL) throw new Error('Missing database URL.');
  const url = new URL(env.DATABASE_URL);
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || url.pathname.length <= 1) throw new Error('Invalid database URL.');
  db = createDatabase(env.DATABASE_URL);
  if (process.argv[2] === 'migrate') { await migrate(db); console.log('ComplyOS SQL migrations applied without resetting data.'); }
  else if (process.argv[2] === 'check') { await db.query('SELECT 1'); console.log('Neon/PostgreSQL connection succeeded (read-only check).'); }
  else throw new Error('Unknown database command.');
} catch { console.error('Database command failed. Verify DATABASE_URL, provider availability, TLS and permissions. No connection details printed.'); process.exitCode = 1; }
finally { if (db) await db.end(); }

