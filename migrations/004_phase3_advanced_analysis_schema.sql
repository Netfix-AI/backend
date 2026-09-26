-- ============================================================
-- NETFIX AI — MARG GROUP
-- Phase 3 Advanced Analysis & Oversight Layer Schema Migration (Modules 20-28)
-- ============================================================

-- 1. MODULE 20: CASE FACT ENGINE
CREATE TABLE IF NOT EXISTS case_facts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  fact_text TEXT NOT NULL,
  fact_type VARCHAR(50) NOT NULL DEFAULT 'obligation', -- date, amount, party, obligation, event
  source_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  source_page VARCHAR(50),
  confidence_score NUMERIC(5,2) NOT NULL DEFAULT 90.0,
  verified_by_human BOOLEAN NOT NULL DEFAULT FALSE,
  verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_facts_case ON case_facts(case_id);
CREATE INDEX IF NOT EXISTS idx_facts_doc ON case_facts(source_document_id);
CREATE INDEX IF NOT EXISTS idx_facts_type ON case_facts(fact_type);
CREATE INDEX IF NOT EXISTS idx_facts_verified ON case_facts(verified_by_human);

-- 2. MODULE 21: CHRONOLOGY ENGINE
CREATE TABLE IF NOT EXISTS chronology_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  fact_id UUID REFERENCES case_facts(id) ON DELETE SET NULL,
  event_date DATE NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  source_name VARCHAR(255),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chronology_case ON chronology_events(case_id);
CREATE INDEX IF NOT EXISTS idx_chronology_date ON chronology_events(event_date);

-- 3. MODULE 22: EVIDENCE MANAGEMENT
CREATE TABLE IF NOT EXISTS evidence_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  evidence_type VARCHAR(50) NOT NULL DEFAULT 'Contract', -- Contract, Financial, Correspondence, Digital, Physical
  linked_fact_id UUID REFERENCES case_facts(id) ON DELETE SET NULL,
  custody_status VARCHAR(50) NOT NULL DEFAULT 'In Custody', -- In Custody, In Review, Transferred, Archived
  custody_log JSONB NOT NULL DEFAULT '[]'::jsonb,
  added_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_evidence_case ON evidence_items(case_id);
CREATE INDEX IF NOT EXISTS idx_evidence_doc ON evidence_items(document_id);
CREATE INDEX IF NOT EXISTS idx_evidence_fact ON evidence_items(linked_fact_id);

-- 4. MODULE 23: CONTRADICTION ANALYSIS
CREATE TABLE IF NOT EXISTS contradictions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  fact_id_1 UUID REFERENCES case_facts(id) ON DELETE SET NULL,
  fact_id_2 UUID REFERENCES case_facts(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  status VARCHAR(50) NOT NULL DEFAULT 'flagged', -- flagged, resolved, dismissed
  resolution_notes TEXT,
  resolved_by UUID REFERENCES users(id) ON DELETE SET NULL,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_contradictions_case ON contradictions(case_id);
CREATE INDEX IF NOT EXISTS idx_contradictions_status ON contradictions(status);
CREATE INDEX IF NOT EXISTS idx_contradictions_severity ON contradictions(severity);

-- 5. MODULE 24: LIMITATION & DEADLINE ENGINE
CREATE TABLE IF NOT EXISTS deadlines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
  title VARCHAR(255) NOT NULL,
  deadline_type VARCHAR(50) NOT NULL DEFAULT 'compliance', -- compliance, tax, litigation, notice, hearing
  due_date DATE NOT NULL,
  days_remaining INT NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'upcoming', -- upcoming, overdue, met
  reminder_sent BOOLEAN NOT NULL DEFAULT FALSE,
  description TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deadlines_case ON deadlines(case_id);
CREATE INDEX IF NOT EXISTS idx_deadlines_due ON deadlines(due_date);
CREATE INDEX IF NOT EXISTS idx_deadlines_status ON deadlines(status);

-- 6. MODULE 25: ADVERSARIAL AI ENGINE
CREATE TABLE IF NOT EXISTS adversarial_reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  draft_document_id UUID NOT NULL REFERENCES draft_documents(id) ON DELETE CASCADE,
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  counterarguments JSONB NOT NULL DEFAULT '[]'::jsonb,
  weaknesses_identified JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(50) NOT NULL DEFAULT 'completed',
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_adversarial_draft ON adversarial_reviews(draft_document_id);
CREATE INDEX IF NOT EXISTS idx_adversarial_case ON adversarial_reviews(case_id);

-- 7. MODULE 26: RISK & EXPOSURE ANALYSIS
CREATE TABLE IF NOT EXISTS risk_assessments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  risk_score INT NOT NULL DEFAULT 50, -- 0 to 100
  risk_level VARCHAR(20) NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  risk_factors JSONB NOT NULL DEFAULT '[]'::jsonb,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  generated_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_risk_case ON risk_assessments(case_id);
CREATE INDEX IF NOT EXISTS idx_risk_level ON risk_assessments(risk_level);

-- 8. MODULE 27: CITATION & SOURCE VERIFICATION
CREATE TABLE IF NOT EXISTS citation_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_content_id UUID NOT NULL,
  source_type VARCHAR(50) NOT NULL DEFAULT 'research_query', -- research_query, draft_document
  citation_text VARCHAR(255) NOT NULL,
  verified BOOLEAN NOT NULL DEFAULT TRUE,
  matched_source_id UUID REFERENCES legal_knowledge_docs(id) ON DELETE SET NULL,
  verification_notes TEXT,
  checked_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_citations_source ON citation_checks(source_content_id);
CREATE INDEX IF NOT EXISTS idx_citations_verified ON citation_checks(verified);

-- 9. MODULE 28: REPORTING SYSTEM
CREATE TABLE IF NOT EXISTS saved_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_title VARCHAR(255) NOT NULL,
  report_type VARCHAR(50) NOT NULL DEFAULT 'case_summary', -- case_summary, compliance, financial, custom
  filters_applied JSONB NOT NULL DEFAULT '{}'::jsonb,
  file_url TEXT,
  generated_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_saved_reports_user ON saved_reports(generated_by);
CREATE INDEX IF NOT EXISTS idx_saved_reports_type ON saved_reports(report_type);
