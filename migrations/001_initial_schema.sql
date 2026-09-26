-- ============================================================
-- NETFIX AI — MARG GROUP
-- Supabase PostgreSQL Initial Migration Schema
-- ============================================================

-- Extension setup
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
CREATE TYPE user_role_enum AS ENUM (
  'employee',
  'management',
  'advocate',
  'client',
  'tenant',
  'regulator'
);

CREATE TYPE user_status_enum AS ENUM (
  'active',
  'suspended',
  'pending'
);

CREATE TYPE otp_purpose_enum AS ENUM (
  'register',
  'login',
  'resend_register',
  'resend_login'
);

CREATE TYPE agent_status_enum AS ENUM (
  'active',
  'idle',
  'error'
);

CREATE TYPE agent_task_status_enum AS ENUM (
  'queued',
  'processing',
  'completed',
  'failed'
);

CREATE TYPE human_review_status_enum AS ENUM (
  'approved',
  'edited',
  'rejected',
  'pending'
);

CREATE TYPE access_request_status_enum AS ENUM (
  'pending',
  'approved',
  'denied'
);

CREATE TYPE ticket_status_enum AS ENUM (
  'open',
  'in_progress',
  'resolved'
);

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  middle_name VARCHAR(100),
  last_name VARCHAR(100) NOT NULL,
  dob DATE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(50) NOT NULL,
  permanent_address TEXT NOT NULL,
  temporary_address TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role_enum NOT NULL,
  status user_status_enum NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- 3. PENDING REGISTRATIONS TABLE
CREATE TABLE IF NOT EXISTS pending_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  registration_data JSONB NOT NULL,
  password_hash TEXT NOT NULL,
  role user_role_enum NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. OTP VERIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS otp_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pending_id UUID REFERENCES pending_registrations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  otp_hash TEXT NOT NULL,
  purpose otp_purpose_enum NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  attempt_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_email ON otp_verifications(email);
CREATE INDEX IF NOT EXISTS idx_otp_expires ON otp_verifications(expires_at);

-- 5. ADMINS TABLE
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(150) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  admin_level VARCHAR(50) NOT NULL DEFAULT 'SuperAdministrator',
  mfa_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  mfa_secret TEXT,
  failed_mfa_attempts INT NOT NULL DEFAULT 0,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ACCESS REQUESTS TABLE
CREATE TABLE IF NOT EXISTS access_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requester_id UUID REFERENCES users(id) ON DELETE SET NULL,
  requester_name VARCHAR(150) NOT NULL,
  requester_role user_role_enum NOT NULL,
  requested_resource VARCHAR(255) NOT NULL,
  reason TEXT NOT NULL,
  duration_days INT NOT NULL DEFAULT 30,
  status access_request_status_enum NOT NULL DEFAULT 'pending',
  decision_note TEXT,
  reviewed_by VARCHAR(150),
  decision_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_access_req_status ON access_requests(status);

-- 7. AGENTS TABLE
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_key VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  status agent_status_enum NOT NULL DEFAULT 'active',
  is_core BOOLEAN NOT NULL DEFAULT FALSE,
  tasks_today INT NOT NULL DEFAULT 0,
  avg_response_time VARCHAR(20) DEFAULT '1.8s',
  failure_rate VARCHAR(20) DEFAULT '0.5%',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. AGENT TASKS TABLE
CREATE TABLE IF NOT EXISTS agent_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  agent_name VARCHAR(150) NOT NULL,
  input_summary TEXT NOT NULL,
  output_summary TEXT NOT NULL,
  status agent_task_status_enum NOT NULL DEFAULT 'completed',
  human_review_status human_review_status_enum NOT NULL DEFAULT 'approved',
  duration_ms INT DEFAULT 1800,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_tasks_agent ON agent_tasks(agent_id);

-- 9. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID,
  actor_name VARCHAR(150) NOT NULL,
  actor_type VARCHAR(20) NOT NULL DEFAULT 'user',
  action VARCHAR(100) NOT NULL,
  module VARCHAR(100) NOT NULL,
  target VARCHAR(255) NOT NULL,
  details JSONB,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);

-- 10. SUPPORT TICKETS TABLE
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number VARCHAR(50) UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_name VARCHAR(150) NOT NULL,
  issue VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  status ticket_status_enum NOT NULL DEFAULT 'open',
  description TEXT NOT NULL,
  assigned_to VARCHAR(150) DEFAULT 'Unassigned',
  activity_notes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);

-- ============================================================
-- SEED DATA
-- ============================================================

-- Seed Default Admin
INSERT INTO admins (id, name, email, password_hash, admin_level, mfa_enabled, mfa_secret)
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Admin Administrator',
  'admin@netfixai.com',
  '$2a$10$wN9a5a3C5u.c8.1wK6M0X.gS.1kO4e9YyZ/k1p2q3r4s5t6u7v8w9', -- hashed admin password
  'SuperAdministrator',
  TRUE,
  'JBSWY3DPEHPK3PXP'
) ON CONFLICT (email) DO NOTHING;

-- Seed Default AI Agents
INSERT INTO agents (agent_key, name, description, status, is_core, tasks_today, avg_response_time, failure_rate)
VALUES
  ('ultron', 'Ultron AI Orchestrator', 'Coordinates specialized agents and manages multi-agent workflows.', 'active', TRUE, 210, '1.9s', '0.7%'),
  ('legal_research', 'Legal Research Agent', 'Analyzes case law, statutes, precedents and court dockets.', 'active', FALSE, 124, '1.8s', '0.5%'),
  ('tax_intelligence', 'Tax Intelligence Agent', 'Reconciles GST filings, tax codes and financial compliance.', 'active', FALSE, 98, '2.2s', '0.8%'),
  ('doc_intake', 'Document Intake Agent', 'Extracts and classifies incoming corporate and legal documents.', 'active', FALSE, 176, '1.4s', '1.2%'),
  ('drafting', 'Drafting Agent', 'Generates legal contracts, agreements and response dockets.', 'active', FALSE, 84, '2.7s', '0.6%'),
  ('case_analysis', 'Case Analysis Agent', 'Synthesizes litigation risk and calculates strategy recommendations.', 'idle', FALSE, 26, '3.1s', '1.4%')
ON CONFLICT (agent_key) DO NOTHING;
