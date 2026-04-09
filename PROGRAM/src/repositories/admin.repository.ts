import { getDbPool } from '../config/db';
import { ensureActivityLogTable, getSecurityEvents } from './activityLog.repository';
import { ensureFeatureFlagsTable, getFeatureFlags } from './featureFlag.repository';

export interface AdminStats {
  totalUsers: number;
  totalStudents: number;
  totalInstructors: number;
  totalAdmins: number;
  totalCourses: number;
  publishedCourses: number;
  draftCourses: number;
  archivedCourses: number;
  totalActivityEvents: number;
}

export interface AdminUserRow {
  user_id: number;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  is_email_verified: boolean;
  created_at: string;
}

export interface AdminCourseRow {
  course_id: number;
  title: string;
  status: string;
  level: string | null;
  price: string;
  instructor_email: string;
  created_at: string;
}

export async function getAdminStats(): Promise<AdminStats> {
  const pool = getDbPool();
  if (!pool) {
    return {
      totalUsers: 0,
      totalStudents: 0,
      totalInstructors: 0,
      totalAdmins: 0,
      totalCourses: 0,
      publishedCourses: 0,
      draftCourses: 0,
      archivedCourses: 0,
      totalActivityEvents: 0,
    };
  }

  const userCounts = await pool.query(
    `SELECT role, COUNT(*) as count
     FROM users
     WHERE deleted_at IS NULL
     GROUP BY role`,
  );

  const courseCounts = await pool.query(
    `SELECT status, COUNT(*) as count
     FROM courses
     GROUP BY status`,
  );

  await ensureActivityLogTable();

  const activityCounts = await pool.query(
    `SELECT COUNT(*) as count
     FROM activity_log
     WHERE type IN ('admin', 'security')`,
  );

  const totals = {
    totalUsers: 0,
    totalStudents: 0,
    totalInstructors: 0,
    totalAdmins: 0,
    totalCourses: 0,
    publishedCourses: 0,
    draftCourses: 0,
    archivedCourses: 0,
    totalActivityEvents: Number(activityCounts.rows[0]?.count ?? 0),
  };

  userCounts.rows.forEach((row) => {
    const count = Number(row.count ?? 0);
    totals.totalUsers += count;
    if (row.role === 'student') totals.totalStudents = count;
    if (row.role === 'instructor') totals.totalInstructors = count;
    if (row.role === 'admin') totals.totalAdmins = count;
  });

  courseCounts.rows.forEach((row) => {
    const count = Number(row.count ?? 0);
    totals.totalCourses += count;
    if (row.status === 'published') totals.publishedCourses = count;
    if (row.status === 'draft') totals.draftCourses = count;
    if (row.status === 'archived') totals.archivedCourses = count;
  });

  await ensureFeatureFlagsTable();

  return totals;
}

export async function listAdminUsers(limit = 50, offset = 0): Promise<AdminUserRow[]> {
  const pool = getDbPool();
  if (!pool) return [];

  const result = await pool.query(
    `SELECT user_id, email, role, COALESCE(is_email_verified, false) as is_email_verified, created_at
     FROM users
     WHERE deleted_at IS NULL
     ORDER BY created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset],
  );

  return result.rows;
}

export async function listAdminCourses(limit = 50, offset = 0): Promise<AdminCourseRow[]> {
  const pool = getDbPool();
  if (!pool) return [];

  const result = await pool.query(
    `SELECT c.course_id, c.title, c.status, c.level, c.price, c.created_at, u.email as instructor_email
     FROM courses c
     LEFT JOIN users u ON c.instructor_id = u.user_id
     ORDER BY c.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset],
  );

  return result.rows;
}

export async function getAdminFeatureFlags() {
  await ensureFeatureFlagsTable();
  return getFeatureFlags();
}
