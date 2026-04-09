import type { PoolClient, QueryResultRow } from 'pg';
import { dbQuery, type DbClient } from './db';
import { RepositoryError, mapPgError } from './errors';
import { withTransaction } from './transaction';

export abstract class BaseRepository {
  protected async queryOne<T extends QueryResultRow = any>(
    client: DbClient,
    text: string,
    params: readonly unknown[] = [],
  ): Promise<T | null> {
    try {
      const res = await dbQuery<T>(client, text, params);
      return res.rows[0] ?? null;
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw mapPgError(err);
    }
  }

  protected async queryMany<T extends QueryResultRow = any>(
    client: DbClient,
    text: string,
    params: readonly unknown[] = [],
  ): Promise<T[]> {
    try {
      const res = await dbQuery<T>(client, text, params);
      return res.rows;
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw mapPgError(err);
    }
  }

  protected async exec(
    client: DbClient,
    text: string,
    params: readonly unknown[] = [],
  ): Promise<void> {
    try {
      await dbQuery(client, text, params);
    } catch (err) {
      if (err instanceof RepositoryError) throw err;
      throw mapPgError(err);
    }
  }

  protected notFound(message = 'Not found'): never {
    throw new RepositoryError('not_found', message, 404);
  }

  protected async tx<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    return withTransaction(fn);
  }
}

