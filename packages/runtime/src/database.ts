import pg, { type PoolClient } from 'pg';
export function createDatabase(databaseUrl: string) {
  // Neon uses the PostgreSQL wire protocol. Preserve provider TLS settings in the URL.
  const pool = new pg.Pool({ connectionString: databaseUrl, max: 5, connectionTimeoutMillis: 10000, idleTimeoutMillis: 30000, statement_timeout: 10000, query_timeout: 12000 });
  pool.on('error', () => { /* Readiness and command boundaries report safe diagnostics. */ });
  return pool;
}
export type Database = ReturnType<typeof createDatabase>;
export async function transaction<T>(db: Database, work: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try { await client.query('ROLLBACK'); } catch { /* Preserve the original failure. */ }
    throw error;
  } finally { client.release(); }
}

