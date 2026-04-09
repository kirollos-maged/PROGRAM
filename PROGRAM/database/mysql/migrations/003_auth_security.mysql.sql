-- MySQL 8+ conversion of 003_auth_security.sql

CREATE TABLE IF NOT EXISTS refresh_tokens (
  refresh_token_id       BIGINT NOT NULL AUTO_INCREMENT,
  user_id                BIGINT NOT NULL,
  token_hash             VARCHAR(128) NOT NULL,
  device_fingerprint     VARCHAR(255) NULL,
  ip_address             VARCHAR(45) NULL,
  user_agent             TEXT NULL,
  expires_at             TIMESTAMP NOT NULL,
  revoked_at             TIMESTAMP NULL DEFAULT NULL,
  rotated_from_token_id  BIGINT NULL,
  created_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (refresh_token_id),
  UNIQUE KEY uq_refresh_tokens_token_hash (token_hash),
  KEY idx_refresh_tokens_user_id (user_id),
  KEY idx_refresh_tokens_expires_at (expires_at),
  KEY idx_refresh_tokens_revoked_at (revoked_at),
  CONSTRAINT fk_refresh_tokens_user_id FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_refresh_tokens_rotated_from FOREIGN KEY (rotated_from_token_id) REFERENCES refresh_tokens(refresh_token_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS login_attempts (
  login_attempt_id  BIGINT NOT NULL AUTO_INCREMENT,
  user_id           BIGINT NULL,
  email             VARCHAR(255) NULL,
  ip_address        VARCHAR(45) NULL,
  user_agent        TEXT NULL,
  success           TINYINT(1) NOT NULL DEFAULT 0,
  created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (login_attempt_id),
  KEY idx_login_attempts_user_id (user_id),
  KEY idx_login_attempts_email (email),
  KEY idx_login_attempts_ip_address (ip_address),
  KEY idx_login_attempts_created_at (created_at),
  CONSTRAINT fk_login_attempts_user_id FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

