-- Run this to add password support to widget_users
-- psql -U postgres -d chatbot_admin -f migrations/add_password.sql

ALTER TABLE widget_users
  ADD COLUMN IF NOT EXISTS password VARCHAR(255);
