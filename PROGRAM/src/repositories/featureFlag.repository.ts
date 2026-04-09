import { getDbPool } from "../config/db";

export interface FeatureFlag {
  key: string;
  enabled: boolean;
  description?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function ensureFeatureFlagsTable() {
  const pool = getDbPool();
  if (!pool) return;

  await pool.query(`
    CREATE TABLE IF NOT EXISTS feature_flags (
      id SERIAL PRIMARY KEY,
      key TEXT UNIQUE NOT NULL,
      enabled BOOLEAN NOT NULL DEFAULT FALSE,
      description TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_feature_flags_key ON feature_flags (key);
  `);
}

export async function upsertFeatureFlag(flag: {
  key: string;
  enabled: boolean;
  description?: string;
}) {
  const pool = getDbPool();
  if (!pool) {
    return {
      key: flag.key,
      enabled: flag.enabled,
      description: flag.description,
    };
  }

  await ensureFeatureFlagsTable();

  const result = await pool.query(
    `INSERT INTO feature_flags (key, enabled, description)
     VALUES ($1, $2, $3)
     ON CONFLICT (key)
     DO UPDATE SET enabled = EXCLUDED.enabled, description = EXCLUDED.description, updated_at = NOW()
     RETURNING key, enabled, description, created_at, updated_at;`,
    [flag.key, flag.enabled, flag.description || null],
  );

  return result.rows[0] as FeatureFlag;
}

export async function getFeatureFlags() {
  const pool = getDbPool();
  if (!pool) return [];

  await ensureFeatureFlagsTable();

  const result = await pool.query(
    `SELECT key, enabled, description, created_at, updated_at FROM feature_flags ORDER BY key ASC;`,
  );

  return result.rows as FeatureFlag[];
}
