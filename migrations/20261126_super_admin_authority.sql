-- ORGROOM — Super Admin authority, reservation decision history, and global settings
-- Additive and safe to re-run. Select the existing ORGROOM database before execution.
-- This migration does not delete, reset, or rewrite existing accounts, reservations,
-- messages, notifications, facilities, or weekly room schedules.

-- Additive columns. These prepared statements make the file safe to re-run on
-- MySQL/MariaDB installations that do not support ADD COLUMN IF NOT EXISTS.
SET @orgroom_sql := IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'reservations' AND COLUMN_NAME = 'decision_source') = 0,
  'ALTER TABLE reservations ADD COLUMN decision_source VARCHAR(40) NOT NULL DEFAULT ''MANUAL'' AFTER decision_at',
  'SELECT 1'
);
PREPARE orgroom_stmt FROM @orgroom_sql;
EXECUTE orgroom_stmt;
DEALLOCATE PREPARE orgroom_stmt;

SET @orgroom_sql := IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'facilities' AND COLUMN_NAME = 'image_url') = 0,
  'ALTER TABLE facilities ADD COLUMN image_url VARCHAR(1000) NULL AFTER description',
  'SELECT 1'
);
PREPARE orgroom_stmt FROM @orgroom_sql;
EXECUTE orgroom_stmt;
DEALLOCATE PREPARE orgroom_stmt;

CREATE TABLE IF NOT EXISTS orgroom_system_settings (
  setting_key VARCHAR(80) PRIMARY KEY,
  setting_value VARCHAR(255) NOT NULL,
  updated_by_user_id INT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_orgroom_settings_updated (updated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Preserve any existing configuration. These values only initialize missing keys.
INSERT IGNORE INTO orgroom_system_settings (setting_key, setting_value) VALUES
  ('max_accounts', '50'),
  ('reservation_start_minutes', '420'),
  ('reservation_end_minutes', '1230');

CREATE TABLE IF NOT EXISTS orgroom_audit_logs (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  actor_user_id INT NULL,
  actor_name VARCHAR(255) NOT NULL DEFAULT 'System',
  actor_email VARCHAR(255) NOT NULL DEFAULT '',
  actor_role VARCHAR(30) NOT NULL DEFAULT 'SYSTEM',
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(60) NOT NULL,
  entity_id VARCHAR(100) NOT NULL DEFAULT '',
  previous_values LONGTEXT NULL,
  new_values LONGTEXT NULL,
  reason VARCHAR(2000) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_orgroom_audit_created (created_at),
  INDEX idx_orgroom_audit_actor (actor_user_id, created_at),
  INDEX idx_orgroom_audit_entity (entity_type, entity_id, created_at),
  CONSTRAINT fk_orgroom_audit_actor FOREIGN KEY (actor_user_id)
    REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS reservation_decision_history (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  reservation_id INT NOT NULL,
  from_status VARCHAR(30) NULL,
  to_status VARCHAR(30) NOT NULL,
  action_type VARCHAR(50) NOT NULL,
  actor_user_id INT NULL,
  actor_name VARCHAR(255) NOT NULL DEFAULT 'System',
  actor_role VARCHAR(30) NOT NULL DEFAULT 'SYSTEM',
  reason VARCHAR(2000) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reservation_history_reservation (reservation_id, created_at),
  INDEX idx_reservation_history_actor (actor_user_id, created_at),
  CONSTRAINT fk_reservation_history_reservation FOREIGN KEY (reservation_id)
    REFERENCES reservations(id) ON DELETE RESTRICT,
  CONSTRAINT fk_reservation_history_actor FOREIGN KEY (actor_user_id)
    REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- No historical transitions are fabricated. Existing reservation rows and their
-- current decision_by_user_id / decision_at fields remain unchanged. New decisions
-- and overrides are written to reservation_decision_history from this update onward.
