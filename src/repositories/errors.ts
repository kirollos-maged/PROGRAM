import type { DatabaseError } from 'pg-protocol';

export type RepositoryErrorCode =
  | 'db_error'
  | 'not_found'
  | 'conflict'
  | 'validation'
  | 'unauthorized'
  | 'forbidden';

export class RepositoryError extends Error {
  public readonly code: RepositoryErrorCode;
  public readonly status: number;
  public readonly details?: unknown;

  constructor(code: RepositoryErrorCode, message: string, status = 500, details?: unknown) {
    super(message);
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

// Minimal PG error mapping for production-safe responses.
// Keep raw errors out of API responses; log them instead.
export function mapPgError(err: unknown): RepositoryError {
  const e = err as Partial<DatabaseError> & { message?: string; code?: string };
  const message = e.message || 'Database error';

  // Common SQLSTATE codes:
  // - 23505: unique_violation
  // - 23503: foreign_key_violation
  // - 23502: not_null_violation
  // - 22P02: invalid_text_representation (e.g., bad UUID/int)
  switch (e.code) {
    case '23505':
      return new RepositoryError('conflict', 'Conflict', 409, { pg_code: e.code });
    case '23503':
      return new RepositoryError('validation', 'Invalid reference', 400, { pg_code: e.code });
    case '23502':
      return new RepositoryError('validation', 'Missing required field', 400, { pg_code: e.code });
    case '22P02':
      return new RepositoryError('validation', 'Invalid input format', 400, { pg_code: e.code });
    default:
      return new RepositoryError('db_error', message, 500, { pg_code: e.code });
  }
}

