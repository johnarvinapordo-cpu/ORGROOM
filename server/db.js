import mysql from 'mysql2/promise';
import { MAX_ACCOUNT_CAPACITY } from './account-config.js';
import { RESERVATION_WINDOW_START_MINUTES, RESERVATION_WINDOW_END_MINUTES } from '../shared/reservation-window.js';

const databaseHost = process.env.DB_HOST || '127.0.0.1';
const isLocalDatabase = /^(localhost|127\.0\.0\.1|::1)$/i.test(databaseHost);
const databaseSsl = !isLocalDatabase && process.env.DB_SSL_CA?.trim()
  ? {
      ca: process.env.DB_SSL_CA,
      rejectUnauthorized: true
    }
  : undefined;

const pool = mysql.createPool({
  host: databaseHost,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'orgroom_db',
  // MySQL date parsing/formatting stays deterministic; DATETIME values are UTC.
  timezone: 'Z',
  ...(databaseSsl ? { ssl: databaseSsl } : {}),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

// Aiven/Render and local MySQL sessions must store and evaluate metadata
// timestamps in UTC. Queue this as the first statement on each new connection.
pool.on('connection', connection => {
  connection.query("SET SESSION time_zone = '+00:00'", error => {
    if (error) {
      console.error(`ORGROOM could not set MySQL session time zone to UTC: ${error.message || error}`);
    }
  });
});

// Compatible with MySQL versions that do not support
// ALTER TABLE ... ADD COLUMN IF NOT EXISTS.
async function addColumnIfMissing(table, column, definition) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS count
     FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = ?
       AND COLUMN_NAME = ?`,
    [table, column]
  );

  if (!Number(rows[0]?.count)) {
    await pool.query(
      `ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`
    );
  }
}

export async function ensureDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orgroom_security_setup (
      setup_key VARCHAR(80) PRIMARY KEY,
      completed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      completed_by_user_id INT NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS verification_codes (
      id INT PRIMARY KEY AUTO_INCREMENT,
      email VARCHAR(255) NOT NULL,
      purpose VARCHAR(30) NOT NULL,
      code_hash VARCHAR(255) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      attempts INT NOT NULL DEFAULT 0,
      INDEX idx_verification_email_purpose (email, purpose)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS auth_sessions (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      token_hash CHAR(64) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_auth_session_token (token_hash),
      INDEX idx_auth_session_user (user_id, expires_at),
      INDEX idx_auth_session_expiry (expires_at),
      CONSTRAINT fk_auth_session_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    DELETE FROM auth_sessions
    WHERE expires_at < NOW()
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      recipient_user_id INT NOT NULL,
      notification_type VARCHAR(60) NOT NULL,
      reservation_id INT NULL,
      event_key VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      is_read TINYINT(1) NOT NULL DEFAULT 0,
      read_at DATETIME NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_notification_recipient_event
        (recipient_user_id, event_key),
      INDEX idx_notifications_recipient_created
        (recipient_user_id, is_read, created_at),
      INDEX idx_notifications_reservation (reservation_id),
      CONSTRAINT fk_notification_recipient
        FOREIGN KEY (recipient_user_id) REFERENCES users(id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS notification_email_deliveries (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      notification_id BIGINT NOT NULL,
      recipient_email VARCHAR(255) NOT NULL,
      delivery_status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
      attempts INT NOT NULL DEFAULT 0,
      sent_at DATETIME NULL,
      error_message VARCHAR(1000) DEFAULT '',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_notification_email (notification_id),
      INDEX idx_notification_email_status (delivery_status),
      CONSTRAINT fk_notification_email_notification
        FOREIGN KEY (notification_id) REFERENCES notifications(id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    UPDATE weekly_room_schedules
    SET is_active = 0
    WHERE is_active = 1
      AND (
        HOUR(start_time) >= 24
        OR HOUR(end_time) >= 24
        OR MINUTE(start_time) >= 60
        OR MINUTE(end_time) >= 60
        OR end_time <= start_time
        OR UPPER(TRIM(activity_name)) IN (
          'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY',
          'FRIDAY', 'SATURDAY', 'SUNDAY'
        )
        OR UPPER(TRIM(activity_name)) LIKE 'APPROVED BY:%'
      )
  `);

  // Persistent Teacher-to-Admin messaging. All DDL is additive and repeatable.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orgroom_chat_conversations (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      teacher_user_id INT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_chat_teacher (teacher_user_id),
      INDEX idx_chat_conversation_updated (updated_at),
      CONSTRAINT fk_chat_conversation_teacher
        FOREIGN KEY (teacher_user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orgroom_chat_messages (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      conversation_id BIGINT NOT NULL,
      sender_user_id INT NULL,
      message_text TEXT NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_chat_messages_conversation (conversation_id, id),
      INDEX idx_chat_messages_sender (sender_user_id),
      CONSTRAINT fk_chat_message_conversation
        FOREIGN KEY (conversation_id) REFERENCES orgroom_chat_conversations(id) ON DELETE CASCADE,
      CONSTRAINT fk_chat_message_sender
        FOREIGN KEY (sender_user_id) REFERENCES users(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orgroom_chat_reads (
      conversation_id BIGINT NOT NULL,
      user_id INT NOT NULL,
      last_read_message_id BIGINT NULL,
      last_read_at DATETIME NULL,
      PRIMARY KEY (conversation_id, user_id),
      INDEX idx_chat_reads_user (user_id),
      CONSTRAINT fk_chat_read_conversation
        FOREIGN KEY (conversation_id) REFERENCES orgroom_chat_conversations(id) ON DELETE CASCADE,
      CONSTRAINT fk_chat_read_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS room_usage_checks (
      id INT PRIMARY KEY AUTO_INCREMENT,
      reservation_id INT NOT NULL,
      checked_by_user_id INT NULL,
      usage_status VARCHAR(30) NOT NULL DEFAULT 'NOT_CHECKED',
      checked_at DATETIME NULL,
      note VARCHAR(1000) DEFAULT '',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_usage_reservation (reservation_id),
      INDEX idx_usage_status (usage_status),
      INDEX idx_usage_checked_at (checked_at),
      CONSTRAINT fk_usage_reservation
        FOREIGN KEY (reservation_id) REFERENCES reservations(id)
        ON DELETE CASCADE,
      CONSTRAINT fk_usage_checker
        FOREIGN KEY (checked_by_user_id) REFERENCES users(id)
        ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS reservation_reminders (
      id INT PRIMARY KEY AUTO_INCREMENT,
      reservation_id INT NOT NULL,
      reminder_type VARCHAR(20) NOT NULL,
      scheduled_at DATETIME NOT NULL,
      sent_at DATETIME NULL,
      delivery_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
      error_message VARCHAR(1000) DEFAULT '',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_reservation_reminder
        (reservation_id, reminder_type),
      INDEX idx_reminder_status (delivery_status, sent_at),
      CONSTRAINT fk_reminder_reservation
        FOREIGN KEY (reservation_id) REFERENCES reservations(id)
        ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  // Add missing columns without unsupported IF NOT EXISTS syntax.
  await addColumnIfMissing(
    'users',
    'is_verified',
    'TINYINT(1) NOT NULL DEFAULT 1 AFTER position'
  );

  await addColumnIfMissing(
    'users',
    'is_active',
    'TINYINT(1) NOT NULL DEFAULT 1 AFTER is_verified'
  );

  // Ensure the role constraint permits SUPER_ADMIN. Older databases may use
  // a different constraint name, so inspect every CHECK constraint on users.
  const [userRoleChecks] = await pool.query(`
    SELECT tc.CONSTRAINT_NAME, cc.CHECK_CLAUSE
    FROM information_schema.TABLE_CONSTRAINTS tc
    INNER JOIN information_schema.CHECK_CONSTRAINTS cc
      ON cc.CONSTRAINT_SCHEMA = tc.CONSTRAINT_SCHEMA
      AND cc.CONSTRAINT_NAME = tc.CONSTRAINT_NAME
    WHERE tc.CONSTRAINT_SCHEMA = DATABASE()
      AND tc.TABLE_NAME = 'users'
      AND tc.CONSTRAINT_TYPE = 'CHECK'
  `);
  const roleChecks = userRoleChecks.filter(row =>
    /\bROLE\b/i.test(String(row.CHECK_CLAUSE || ''))
  );
  const hasCompatibleRoleCheck = roleChecks.some(row =>
    /SUPER_ADMIN/i.test(String(row.CHECK_CLAUSE || ''))
  );

  for (const row of roleChecks) {
    if (!/SUPER_ADMIN/i.test(String(row.CHECK_CLAUSE || ''))) {
      const constraintName = String(row.CONSTRAINT_NAME || '').replace(/`/g, '``');
      if (constraintName) {
        await pool.query(`ALTER TABLE users DROP CONSTRAINT \`${constraintName}\``);
      }
    }
  }

  if (!hasCompatibleRoleCheck) {
    await pool.query(`
      ALTER TABLE users
      ADD CONSTRAINT chk_users_role
      CHECK (role IN ('TEACHER','ADMIN','SUPER_ADMIN'))
    `);
  }

  await addColumnIfMissing(
    'reservations',
    'decision_by_user_id',
    'INT NULL AFTER admin_notes'
  );

  await addColumnIfMissing(
    'reservations',
    'decision_at',
    'DATETIME NULL AFTER decision_by_user_id'
  );

  await addColumnIfMissing(
    'reservations',
    'decision_source',
    "VARCHAR(40) NOT NULL DEFAULT 'MANUAL' AFTER decision_at"
  );

  await addColumnIfMissing(
    'facilities',
    'image_url',
    'VARCHAR(1000) NULL AFTER description'
  );

  await addColumnIfMissing(
    'verification_codes',
    'attempts',
    'INT NOT NULL DEFAULT 0 AFTER created_at'
  );

  // Repair invalid orphan references before adding foreign keys.
  await pool.query(`
    UPDATE reservations r
    LEFT JOIN users u ON u.id = r.decision_by_user_id
    SET r.decision_by_user_id = NULL
    WHERE r.decision_by_user_id IS NOT NULL
      AND u.id IS NULL
  `);

  await pool.query(`
    UPDATE notifications n
    LEFT JOIN reservations r ON r.id = n.reservation_id
    SET n.reservation_id = NULL
    WHERE n.reservation_id IS NOT NULL
      AND r.id IS NULL
  `);

  const [reservationDecisionFk] = await pool.query(`
    SELECT COUNT(*) AS count
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'reservations'
      AND CONSTRAINT_NAME = 'fk_reservation_decision_by'
  `);

  if (!Number(reservationDecisionFk[0]?.count)) {
    await pool.query(`
      ALTER TABLE reservations
      ADD CONSTRAINT fk_reservation_decision_by
      FOREIGN KEY (decision_by_user_id)
      REFERENCES users(id)
      ON DELETE SET NULL
    `);
  }

  const [notificationReservationFk] = await pool.query(`
    SELECT COUNT(*) AS count
    FROM information_schema.TABLE_CONSTRAINTS
    WHERE CONSTRAINT_SCHEMA = DATABASE()
      AND TABLE_NAME = 'notifications'
      AND CONSTRAINT_NAME = 'fk_notification_reservation'
  `);

  if (!Number(notificationReservationFk[0]?.count)) {
    await pool.query(`
      ALTER TABLE notifications
      ADD CONSTRAINT fk_notification_reservation
      FOREIGN KEY (reservation_id)
      REFERENCES reservations(id)
      ON DELETE SET NULL
    `);
  }

  // Additive authority/audit tables. Existing account, reservation, message,
  // and schedule rows are never rewritten by these table creations.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS orgroom_system_settings (
      setting_key VARCHAR(80) PRIMARY KEY,
      setting_value VARCHAR(255) NOT NULL,
      updated_by_user_id INT NULL,
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_orgroom_settings_updated (updated_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(
    `INSERT IGNORE INTO orgroom_system_settings (setting_key, setting_value) VALUES
      ('max_accounts', ?),
      ('reservation_start_minutes', ?),
      ('reservation_end_minutes', ?)`,
    [String(MAX_ACCOUNT_CAPACITY), String(RESERVATION_WINDOW_START_MINUTES), String(RESERVATION_WINDOW_END_MINUTES)]
  );

  await pool.query(`
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);

  await pool.query(`
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
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

export async function dbQuery(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

export async function dbTransaction(work) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const result = await work(connection);

    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

export { pool };