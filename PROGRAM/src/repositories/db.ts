import type { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { pgPool } from '../config/db';

export type DbClient = Pool | PoolClient;

export async function dbQuery<T extends QueryResultRow = any>(
  client: DbClient,
  text: string,
  params: readonly unknown[] = [],
): Promise<QueryResult<T>> {
  // `pg` typings expect a mutable array for params.
  return client.query<T>(text, Array.from(params));
}

export async function withClient<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pgPool.connect();
  try {
    return await fn(client);
  } finally {
    client.release();
  }
}

