import { readdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { transaction } from '@complyos/runtime/database';
export async function migrate(db) {
  const directory = new URL('../packages/runtime/migrations/', import.meta.url);
  const migrations = readdirSync(directory).filter(file => /^\d+_[a-z_]+\.sql$/.test(file)).sort();
  await transaction(db, async client => {
    await client.query('SELECT pg_advisory_xact_lock(424242, 1)');
    await client.query('CREATE TABLE IF NOT EXISTS "_complyos_migrations" ("name" TEXT PRIMARY KEY, "checksum" TEXT NOT NULL, "appliedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW())');
    for (const name of migrations) {
      const sql = readFileSync(new URL(name, directory), 'utf8');
      const checksum = createHash('sha256').update(sql).digest('hex');
      const existing = await client.query('SELECT "checksum" FROM "_complyos_migrations" WHERE "name" = $1', [name]);
      if (existing.rowCount) {
        if (existing.rows[0].checksum !== checksum) throw new Error('Applied migration checksum changed.');
        continue;
      }
      await client.query(sql);
      await client.query('INSERT INTO "_complyos_migrations" ("name", "checksum") VALUES ($1, $2)', [name, checksum]);
    }
  });
}

