-- ============================================================
-- MIGRATION 006: AI AGENT LAYER PHASE 3 — GENERATED REPORTS SCHEMA
-- ============================================================

CREATE TABLE IF NOT EXISTS generated_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  title TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size_bytes INTEGER DEFAULT 0,
  download_url TEXT NOT NULL,
  ai_source TEXT CHECK (ai_source IN ('ai', 'rule_based_fallback')) DEFAULT 'ai',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast user/task report lookups
CREATE INDEX IF NOT EXISTS idx_generated_reports_task_id ON generated_reports(task_id);
CREATE INDEX IF NOT EXISTS idx_generated_reports_user_id ON generated_reports(user_id);
