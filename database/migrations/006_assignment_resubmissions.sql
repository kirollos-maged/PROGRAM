-- Assignment resubmission support (safe migration)

ALTER TABLE assignments
  ADD COLUMN IF NOT EXISTS allow_resubmission BOOLEAN DEFAULT FALSE;

ALTER TABLE assignments
  ADD COLUMN IF NOT EXISTS max_attempts INT DEFAULT 1;

