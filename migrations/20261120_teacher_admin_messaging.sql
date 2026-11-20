-- ORGROOM Teacher-to-Admin messaging
-- Safe additive migration: CREATE TABLE IF NOT EXISTS; no existing records are dropped.
-- The same migration is also applied automatically by server/db.js on backend startup.

CREATE TABLE IF NOT EXISTS orgroom_chat_conversations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  teacher_user_id INT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_chat_teacher (teacher_user_id),
  INDEX idx_chat_conversation_updated (updated_at),
  CONSTRAINT fk_chat_conversation_teacher
    FOREIGN KEY (teacher_user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
