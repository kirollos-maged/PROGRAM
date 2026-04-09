import type { PoolClient } from 'pg';
import { withClient } from './db';
import { RepositoryError, mapPgError } from './errors';

export async function withTransaction<T>(
  fn: (client: PoolClient) => Promise<T>,
): Promise<T> {
  return withClient(async (client) => {
    try {
      await client.query('BEGIN');
      const result = await fn(client);
      await client.query('COMMIT');
      return result;
    } catch (err) {
      try {
        await client.query('ROLLBACK');
      } catch {
        // ignore rollback failures; original error is more important
      }
      if (err instanceof RepositoryError) throw err;
      throw mapPgError(err);
    }
  });
}

