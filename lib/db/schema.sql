-- Schema for the admin panel. Apply once against DATABASE_URL:
--   psql "$DATABASE_URL" -f lib/db/schema.sql
-- Every statement is idempotent, so re-running it is safe.

-- ===========================================================================
-- Documents (résumé, cover letter, outreach templates)
-- ===========================================================================

-- One JSON document holds the live copy; the shape is validated in application
-- code against lib/documents/types.ts.
CREATE TABLE IF NOT EXISTS site_documents (
  id          TEXT PRIMARY KEY,
  bundle      JSONB       NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ===========================================================================
-- Blog
-- ===========================================================================

CREATE TABLE IF NOT EXISTS blog_posts (
  slug          TEXT PRIMARY KEY,
  title         TEXT NOT NULL,
  excerpt       TEXT NOT NULL DEFAULT '',
  body          TEXT NOT NULL DEFAULT '',
  tags          TEXT[] NOT NULL DEFAULT '{}',
  published_at  DATE NOT NULL DEFAULT CURRENT_DATE,
  draft         BOOLEAN NOT NULL DEFAULT TRUE,
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS blog_posts_published_idx
  ON blog_posts (draft, published_at DESC);

-- ===========================================================================
-- Email campaigns
-- ===========================================================================

DO $$ BEGIN
  CREATE TYPE em_template_type AS ENUM ('initial', 'follow_up_1', 'follow_up_2');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS em_templates (
  template_type  em_template_type PRIMARY KEY,
  subject        TEXT NOT NULL,
  body_html      TEXT NOT NULL,
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS em_recipients (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name         TEXT NOT NULL DEFAULT '',
  contact_name         TEXT NOT NULL DEFAULT '',
  email                TEXT NOT NULL,
  industry             TEXT NOT NULL DEFAULT '',
  notes                TEXT NOT NULL DEFAULT '',
  status               TEXT NOT NULL DEFAULT 'not_sent'
                       CHECK (status IN ('not_sent', 'sent', 'replied', 'bounced')),
  auto_follow_up       BOOLEAN NOT NULL DEFAULT FALSE,
  initial_sent_at      TIMESTAMPTZ,
  follow_up_1_sent_at  TIMESTAMPTZ,
  follow_up_2_sent_at  TIMESTAMPTZ,
  replied_at           TIMESTAMPTZ,
  last_template_type   em_template_type,
  -- DNS audit. NULL means never audited; 'unknown' means a transient failure.
  domain_status        TEXT CHECK (domain_status IN ('ok', 'ok_fallback', 'invalid', 'unknown')),
  domain_checked_at    TIMESTAMPTZ,
  -- Hard bounce. Once set, the address is never emailed again.
  bounced_at           TIMESTAMPTZ,
  bounce_reason        TEXT NOT NULL DEFAULT '',
  -- Permanent opt-out. Legally required for cold outreach in the EU; never
  -- cleared automatically, and checked before every single send.
  opted_out            BOOLEAN NOT NULL DEFAULT FALSE,
  opted_out_at         TIMESTAMPTZ,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS em_recipients_email_unique
  ON em_recipients (lower(email));
CREATE INDEX IF NOT EXISTS em_recipients_status_idx ON em_recipients (status);
CREATE INDEX IF NOT EXISTS em_recipients_domain_status_idx ON em_recipients (domain_status);
CREATE INDEX IF NOT EXISTS em_recipients_opted_out_idx ON em_recipients (opted_out);

CREATE TABLE IF NOT EXISTS em_campaigns (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_type    em_template_type NOT NULL,
  auto_follow_up   BOOLEAN NOT NULL DEFAULT FALSE,
  recipient_count  INT NOT NULL DEFAULT 0,
  sent_count       INT NOT NULL DEFAULT 0,
  failed_count     INT NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS em_campaigns_created_idx ON em_campaigns (created_at DESC);

CREATE TABLE IF NOT EXISTS em_send_logs (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id    UUID REFERENCES em_campaigns (id) ON DELETE SET NULL,
  recipient_id   UUID REFERENCES em_recipients (id) ON DELETE SET NULL,
  template_type  em_template_type NOT NULL,
  email          TEXT NOT NULL,
  status         TEXT NOT NULL CHECK (status IN
                   ('sent', 'failed', 'skipped_invalid_domain', 'skipped_bounced', 'skipped_opted_out')),
  error_message  TEXT NOT NULL DEFAULT '',
  sent_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS em_send_logs_sent_at_idx ON em_send_logs (sent_at DESC);

-- Background send jobs: a campaign is processed in small batches so each worker
-- invocation finishes well inside the serverless function timeout.
CREATE TABLE IF NOT EXISTS em_send_jobs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id     UUID REFERENCES em_campaigns (id) ON DELETE SET NULL,
  status          TEXT NOT NULL DEFAULT 'queued'
                  CHECK (status IN ('queued', 'running', 'completed', 'failed', 'cancelled')),
  template_type   em_template_type NOT NULL,
  auto_follow_up  BOOLEAN NOT NULL DEFAULT FALSE,
  selection_mode  TEXT NOT NULL CHECK (selection_mode IN ('all_not_sent', 'recipient_ids')),
  recipient_ids   JSONB NOT NULL DEFAULT '[]'::jsonb,
  processed_index INT NOT NULL DEFAULT 0,
  total_count     INT NOT NULL DEFAULT 0,
  sent_count      INT NOT NULL DEFAULT 0,
  failed_count    INT NOT NULL DEFAULT 0,
  last_error      TEXT NOT NULL DEFAULT '',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  started_at      TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS em_send_jobs_status_created_idx
  ON em_send_jobs (status, created_at DESC);

-- Visual theme chosen per send ('branded' card or 'plain' letter). Added after
-- launch, so it is an idempotent ALTER rather than a column in the CREATE.
ALTER TABLE em_campaigns ADD COLUMN IF NOT EXISTS theme TEXT NOT NULL DEFAULT 'branded'
  CHECK (theme IN ('branded', 'plain'));
ALTER TABLE em_send_jobs ADD COLUMN IF NOT EXISTS theme TEXT NOT NULL DEFAULT 'branded'
  CHECK (theme IN ('branded', 'plain'));
