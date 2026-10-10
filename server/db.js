import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'orgroom_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true
});

export async function ensureDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS verification_codes (
      id INT PRIMARY KEY AUTO_INCREMENT,
      email VARCHAR(255) NOT NULL,
      purpose VARCHAR(30) NOT NULL,
      code_hash VARCHAR(255) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      attempts INT NOT NULL DEFAULT 0,
      INDEX idx_verification_email_purpose (email,purpose)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS auth_sessions (
      id BIGINT PRIMARY KEY AUTO_INCREMENT,
      user_id INT NOT NULL,
      token_hash CHAR(64) NOT NULL,
      expires_at DATETIME NOT NULL,
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      last_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_auth_session_token (token_hash),
      INDEX idx_auth_session_user (user_id,expires_at),
      INDEX idx_auth_session_expiry (expires_at),
      CONSTRAINT fk_auth_session_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await pool.query(`DELETE FROM auth_sessions WHERE expires_at < NOW()`);
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
      UNIQUE KEY uq_notification_recipient_event (recipient_user_id,event_key),
      INDEX idx_notifications_recipient_created (recipient_user_id,is_read,created_at),
      INDEX idx_notifications_reservation (reservation_id),
      CONSTRAINT fk_notification_recipient FOREIGN KEY (recipient_user_id) REFERENCES users(id) ON DELETE CASCADE
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
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_notification_email (notification_id),
      INDEX idx_notification_email_status (delivery_status),
      CONSTRAINT fk_notification_email_notification FOREIGN KEY (notification_id) REFERENCES notifications(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await pool.query(`
    UPDATE weekly_room_schedules
    SET is_active=0
    WHERE is_active=1
      AND (HOUR(start_time) >= 24 OR HOUR(end_time) >= 24 OR MINUTE(start_time) >= 60 OR MINUTE(end_time) >= 60 OR end_time <= start_time OR UPPER(TRIM(activity_name)) IN ('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY') OR UPPER(TRIM(activity_name)) LIKE 'APPROVED BY:%')
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
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_usage_reservation (reservation_id),
      INDEX idx_usage_status (usage_status),
      INDEX idx_usage_checked_at (checked_at),
      CONSTRAINT fk_usage_reservation FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
      CONSTRAINT fk_usage_checker FOREIGN KEY (checked_by_user_id) REFERENCES users(id) ON DELETE SET NULL
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
      updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY uq_reservation_reminder (reservation_id,reminder_type),
      INDEX idx_reminder_status (delivery_status,sent_at),
      CONSTRAINT fk_reminder_reservation FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified TINYINT(1) NOT NULL DEFAULT 1 AFTER position`);
  await pool.query(`ALTER TABLE reservations ADD COLUMN IF NOT EXISTS decision_by_user_id INT NULL AFTER admin_notes`);
  await pool.query(`ALTER TABLE reservations ADD COLUMN IF NOT EXISTS decision_at DATETIME NULL AFTER decision_by_user_id`);
  await pool.query(`ALTER TABLE verification_codes ADD COLUMN IF NOT EXISTS attempts INT NOT NULL DEFAULT 0 AFTER created_at`);

  // Repair only invalid orphan references before adding the audit-required foreign keys.
  await pool.query(`UPDATE reservations r LEFT JOIN users u ON u.id=r.decision_by_user_id SET r.decision_by_user_id=NULL WHERE r.decision_by_user_id IS NOT NULL AND u.id IS NULL`);
  await pool.query(`UPDATE notifications n LEFT JOIN reservations r ON r.id=n.reservation_id SET n.reservation_id=NULL WHERE n.reservation_id IS NOT NULL AND r.id IS NULL`);

  const reservationDecisionFk = await pool.query(`SELECT COUNT(*) AS count FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=DATABASE() AND TABLE_NAME='reservations' AND CONSTRAINT_NAME='fk_reservation_decision_by'`);
  if(!Number(reservationDecisionFk[0][0]?.count)){
    await pool.query(`ALTER TABLE reservations ADD CONSTRAINT fk_reservation_decision_by FOREIGN KEY (decision_by_user_id) REFERENCES users(id) ON DELETE SET NULL`);
  }
  const notificationReservationFk = await pool.query(`SELECT COUNT(*) AS count FROM information_schema.TABLE_CONSTRAINTS WHERE CONSTRAINT_SCHEMA=DATABASE() AND TABLE_NAME='notifications' AND CONSTRAINT_NAME='fk_notification_reservation'`);
  if(!Number(notificationReservationFk[0][0]?.count)){
    await pool.query(`ALTER TABLE notifications ADD CONSTRAINT fk_notification_reservation FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE SET NULL`);
  }
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
