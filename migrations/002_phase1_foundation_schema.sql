-- ============================================================
-- NETFIX AI — MARG GROUP
-- Phase 1 Foundation Layer Database Migration
-- ============================================================

-- 1. EXTEND USERS TABLE
ALTER TABLE users 
  ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_deactivated BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. USER SESSIONS TABLE (For JWT tracking & instant session revocation)
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  jti VARCHAR(255) UNIQUE NOT NULL,
  device_info TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_jti ON user_sessions(jti);
CREATE INDEX IF NOT EXISTS idx_sessions_revoked ON user_sessions(revoked_at);

-- 3. PASSWORD RESET TOKENS TABLE
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pwd_reset_email ON password_reset_tokens(email);
CREATE INDEX IF NOT EXISTS idx_pwd_reset_token ON password_reset_tokens(token_hash);

-- 4. ENTITIES TABLE (Company & Entity Management)
CREATE TABLE IF NOT EXISTS entities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'company', -- company, individual, firm, proprietorship
  gstin VARCHAR(50),
  pan VARCHAR(50),
  registered_address TEXT NOT NULL,
  city VARCHAR(100),
  state VARCHAR(100),
  owner_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_entities_owner ON entities(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_entities_status ON entities(status);

-- 5. ENTITY MEMBERS TABLE
CREATE TABLE IF NOT EXISTS entity_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'member', -- owner, member, authorized_signatory
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(entity_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_entity_members_user ON entity_members(user_id);
CREATE INDEX IF NOT EXISTS idx_entity_members_entity ON entity_members(entity_id);

-- 6. CLIENT ASSIGNMENTS TABLE (Client Management)
CREATE TABLE IF NOT EXISTS client_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_employee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_advocate_id UUID REFERENCES users(id) ON DELETE SET NULL,
  relationship_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_client_assign_client ON client_assignments(client_id);
CREATE INDEX IF NOT EXISTS idx_client_assign_emp ON client_assignments(assigned_employee_id);
CREATE INDEX IF NOT EXISTS idx_client_assign_adv ON client_assignments(assigned_advocate_id);

-- 7. CASES TABLE (Central Case Management)
CREATE TABLE IF NOT EXISTS cases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  assigned_employee_id UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_advocate_id UUID REFERENCES users(id) ON DELETE SET NULL,
  module_type VARCHAR(50) NOT NULL DEFAULT 'tax', -- tax, legal, litigation, corporate, property, projects, compliance
  status VARCHAR(50) NOT NULL DEFAULT 'open', -- open, in_review, awaiting_approval, completed
  priority VARCHAR(20) DEFAULT 'medium',
  next_hearing_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cases_client ON cases(client_id);
CREATE INDEX IF NOT EXISTS idx_cases_entity ON cases(entity_id);
CREATE INDEX IF NOT EXISTS idx_cases_employee ON cases(assigned_employee_id);
CREATE INDEX IF NOT EXISTS idx_cases_advocate ON cases(assigned_advocate_id);
CREATE INDEX IF NOT EXISTS idx_cases_status ON cases(status);

-- 8. CASE NOTES TABLE (Internal Notes vs Client Notes)
CREATE TABLE IF NOT EXISTS case_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  author_id UUID REFERENCES users(id) ON DELETE SET NULL,
  author_name VARCHAR(150) NOT NULL,
  note TEXT NOT NULL,
  is_internal BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_case_notes_case ON case_notes(case_id);

-- 9. CASE STATUS HISTORY TABLE
CREATE TABLE IF NOT EXISTS case_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  previous_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_case_history_case ON case_status_history(case_id);

-- 10. DOCUMENTS TABLE (Intelligent Document Intake)
CREATE TABLE IF NOT EXISTS documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE CASCADE,
  entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
  uploaded_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  file_size INT NOT NULL DEFAULT 0,
  mime_type VARCHAR(100) NOT NULL DEFAULT 'application/pdf',
  document_type VARCHAR(50) NOT NULL DEFAULT 'other', -- tax_invoice, agreement, notice, compliance, court_order, other
  extraction_status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  is_confidential BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_case ON documents(case_id);
CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_documents_entity ON documents(entity_id);

-- 11. DOCUMENT EXTRACTIONS TABLE (OCR & Document AI)
CREATE TABLE IF NOT EXISTS document_extractions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  extracted_text TEXT,
  extracted_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence_score NUMERIC(5,2) DEFAULT 95.0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doc_extractions_doc ON document_extractions(document_id);

-- 12. EXTEND AGENT TASKS TABLE (Query System & Agent Task Plumbing)
ALTER TABLE agent_tasks
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS current_step INT DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_agent_tasks_user ON agent_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_case ON agent_tasks(case_id);
