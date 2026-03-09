-- Chat logs table
-- psql -U chatbot_user -d chatbot_admin -f migrations/add_chat_logs.sql

CREATE TABLE IF NOT EXISTS chat_logs (
  id          BIGSERIAL PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES widget_users(id) ON DELETE CASCADE,
  session_id  VARCHAR(64) NOT NULL,
  sender      VARCHAR(8)  NOT NULL CHECK (sender IN ('user', 'bot')),
  message     TEXT        NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS chat_logs_user_id_idx ON chat_logs (user_id, created_at DESC);
