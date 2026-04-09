import { getDbPool } from "../config/db";

export type ActivityType = "user" | "admin" | "error" | "security";

export interface ActivityLogEntry {
  id?: number;
  userId?: string;
  type: ActivityType;
  action: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt?: Date;
}

export async function ensureActivityLogTable() {
  const pool = getDbPool();
  if (!pool) return;
  await pool.query(`
    CREATE TABLE IF NOT EXISTS activity_log (
      id SERIAL PRIMARY KEY,
      user_id TEXT,
      type TEXT NOT NULL,
      action TEXT NOT NULL,
      metadata JSONB,
      ip_address TEXT,
      user_agent TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );
  `);
  await pool.query(
    `CREATE INDEX IF NOT EXISTS idx_activity_log_type_created_at ON activity_log (type, created_at DESC);`,
  );
}

export async function getSecurityEvents(limit = 20) {
  const pool = getDbPool();
  if (!pool) {
    return [];
  }

  await ensureActivityLogTable();

  const result = await pool.query(
    `SELECT id, user_id, type, action, metadata, ip_address, user_agent, created_at
     FROM activity_log
     WHERE type = $1 OR type = $2
     ORDER BY created_at DESC
     LIMIT $3;`,
    ["security", "admin", limit],
  );

  return result.rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    type: row.type as ActivityType,
    action: row.action,
    metadata: row.metadata,
    ipAddress: row.ip_address,
    userAgent: row.user_agent,
    createdAt: row.created_at,
  }));
}

export async function logActivity(entry: ActivityLogEntry) {
  const pool = getDbPool();
  if (!pool) {
    // eslint-disable-next-line no-console
    console.log("activity_log (no-db)", entry);
    return;
  }

  await ensureActivityLogTable();

  await pool.query(
    `
      INSERT INTO activity_log (user_id, type, action, metadata, ip_address, user_agent)
      VALUES ($1, $2, $3, $4, $5, $6);
    `,
    [
      entry.userId || null,
      entry.type,
      entry.action,
      entry.metadata ? JSON.stringify(entry.metadata) : null,
      entry.ipAddress || null,
      entry.userAgent || null,
    ],
  );
}

