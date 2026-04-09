-- Auth + Security infrastructure
-- Refresh token rotation + login attempt tracking

CREATE TABLE IF NOT EXISTS refresh_tokens (
    refresh_token_id        BIGSERIAL PRIMARY KEY,
    user_id                 BIGINT NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    token_hash              VARCHAR(128) NOT NULL UNIQUE,
    device_fingerprint      VARCHAR(255),
    ip_address              INET,
    user_agent              TEXT,
    expires_at              TIMESTAMPTZ NOT NULL,
    revoked_at              TIMESTAMPTZ,
    rotated_from_token_id   BIGINT REFERENCES refresh_tokens(refresh_token_id) ON DELETE SET NULL,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_revoked_at ON refresh_tokens(revoked_at);

CREATE TABLE IF NOT EXISTS login_attempts (
    login_attempt_id    BIGSERIAL PRIMARY KEY,
    user_id             BIGINT REFERENCES users(user_id) ON DELETE SET NULL,
    email               VARCHAR(255),
    ip_address          INET,
    user_agent          TEXT,
    success             BOOLEAN NOT NULL DEFAULT false,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_login_attempts_user_id ON login_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_address ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_created_at ON login_attempts(created_at);


