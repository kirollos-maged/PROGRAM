import { Pool } from 'pg';
import { env } from './env';

export const pgPool = new Pool({
  connectionString: env.postgresUrl,
  max: 20,
  idleTimeoutMillis: 30000,
});

export function getDbPool() {
  return pgPool;
}

pgPool.on('error', (err: Error) => {
  // eslint-disable-next-line no-console
  console.error('Unexpected PG pool error', err);
});

