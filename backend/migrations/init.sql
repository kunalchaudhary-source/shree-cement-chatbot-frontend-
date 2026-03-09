-- Run this once to initialise the database schema
-- psql -U postgres -d chatbot_admin -f migrations/init.sql

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ---------------------------------------------------------------
-- Users
-- Each row represents one website / tenant that embeds the widget
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS widget_users (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       VARCHAR(128) NOT NULL,
  email      VARCHAR(255) UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------
-- Settings
-- Per-user widget configuration stored as JSONB
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS widget_settings (
  id         SERIAL PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES widget_users(id) ON DELETE CASCADE,
  settings   JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS widget_users_updated_at ON widget_users;
CREATE TRIGGER widget_users_updated_at
  BEFORE UPDATE ON widget_users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS widget_settings_updated_at ON widget_settings;
CREATE TRIGGER widget_settings_updated_at
  BEFORE UPDATE ON widget_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Seed a default user so the admin panel has something to start with
INSERT INTO widget_users (name, email)
VALUES ('Default User', 'admin@example.com')
ON CONFLICT (email) DO NOTHING;
