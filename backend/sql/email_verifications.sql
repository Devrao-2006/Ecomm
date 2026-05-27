-- Audit log for email verification lifecycle events
-- Run once against your PostgreSQL database

CREATE TABLE IF NOT EXISTS verification_events (
  id          BIGSERIAL PRIMARY KEY,
  user_id     VARCHAR(64)  NOT NULL,
  event       VARCHAR(64)  NOT NULL,   -- token_issued | verified | expired | replayed | resend_blocked | login_blocked
  ip          VARCHAR(64),
  user_agent  TEXT,
  metadata    JSONB,
  created_at  TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_verification_events_user_id   ON verification_events(user_id);
CREATE INDEX IF NOT EXISTS idx_verification_events_event      ON verification_events(event);
CREATE INDEX IF NOT EXISTS idx_verification_events_created_at ON verification_events(created_at DESC);
