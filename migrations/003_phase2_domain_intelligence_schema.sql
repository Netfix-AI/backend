-- ============================================================
-- NETFIX AI — MARG GROUP
-- Phase 2 Domain Intelligence Layer Schema Migration (Modules 10-19)
-- ============================================================

-- 1. MODULE 10: GST INTELLIGENCE ENGINE
CREATE TABLE IF NOT EXISTS gst_filings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  period VARCHAR(50) NOT NULL, -- e.g. 'Jul - Sep 2024'
  filing_type VARCHAR(50) NOT NULL DEFAULT 'GSTR-1', -- GSTR-1, GSTR-3B, GSTR-9
  computed_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, approved, filed
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gst_filings_entity ON gst_filings(entity_id);
CREATE INDEX IF NOT EXISTS idx_gst_filings_case ON gst_filings(case_id);

CREATE TABLE IF NOT EXISTS gst_mismatches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  filing_id UUID NOT NULL REFERENCES gst_filings(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  severity VARCHAR(20) NOT NULL DEFAULT 'medium', -- low, medium, high, critical
  source_document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gst_mismatches_filing ON gst_mismatches(filing_id);

-- 2. MODULE 11: INCOME TAX INTELLIGENCE ENGINE
CREATE TABLE IF NOT EXISTS income_tax_filings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  assessment_year VARCHAR(20) NOT NULL, -- e.g. '2024 - 2025'
  computed_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  suggested_deductions JSONB NOT NULL DEFAULT '{}'::jsonb,
  status VARCHAR(50) NOT NULL DEFAULT 'draft', -- draft, approved, filed
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_it_filings_entity ON income_tax_filings(entity_id);
CREATE INDEX IF NOT EXISTS idx_it_filings_case ON income_tax_filings(case_id);

-- 3. MODULE 12 & 13: LEGAL KNOWLEDGE BASE & CASE-LAW INTELLIGENCE
CREATE TABLE IF NOT EXISTS legal_knowledge_docs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category VARCHAR(50) NOT NULL DEFAULT 'criminal', -- criminal, civil, tax, property
  title VARCHAR(255) NOT NULL,
  source_text TEXT NOT NULL,
  source_url TEXT,
  embedding_vector TEXT,
  is_restricted BOOLEAN NOT NULL DEFAULT FALSE,
  allowed_roles JSONB NOT NULL DEFAULT '["internal_employee","advocate","management","admin"]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_knowledge_category ON legal_knowledge_docs(category);

CREATE TABLE IF NOT EXISTS research_queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  query_text TEXT NOT NULL,
  category VARCHAR(50) NOT NULL DEFAULT 'criminal',
  result_summary TEXT NOT NULL,
  sources_cited JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_research_user ON research_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_research_case ON research_queries(case_id);

-- 4. MODULE 14: LEGAL KNOWLEDGE GRAPH
CREATE TABLE IF NOT EXISTS knowledge_graph_nodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type VARCHAR(50) NOT NULL, -- case, statute, section, entity
  label VARCHAR(255) NOT NULL,
  entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  is_private BOOLEAN NOT NULL DEFAULT FALSE,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kg_nodes_entity ON knowledge_graph_nodes(entity_id);
CREATE INDEX IF NOT EXISTS idx_kg_nodes_case ON knowledge_graph_nodes(case_id);

CREATE TABLE IF NOT EXISTS knowledge_graph_edges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  from_node_id UUID NOT NULL REFERENCES knowledge_graph_nodes(id) ON DELETE CASCADE,
  to_node_id UUID NOT NULL REFERENCES knowledge_graph_nodes(id) ON DELETE CASCADE,
  relationship_type VARCHAR(50) NOT NULL, -- cites, amends, relates_to
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_kg_edges_from ON knowledge_graph_edges(from_node_id);
CREATE INDEX IF NOT EXISTS idx_kg_edges_to ON knowledge_graph_edges(to_node_id);

-- 5. MODULE 15: LEGAL DRAFTING ENGINE
CREATE TABLE IF NOT EXISTS draft_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID NOT NULL REFERENCES cases(id) ON DELETE CASCADE,
  template_type VARCHAR(100) NOT NULL,
  generated_content TEXT NOT NULL,
  edited_content TEXT NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'ai_draft', -- ai_draft, under_review, finalized
  is_client_visible BOOLEAN NOT NULL DEFAULT FALSE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_draft_case ON draft_documents(case_id);
CREATE INDEX IF NOT EXISTS idx_draft_user ON draft_documents(created_by);

-- 6. MODULE 16: TALLY / FINANCIAL RECONCILIATION
CREATE TABLE IF NOT EXISTS reconciliation_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_id UUID NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  period VARCHAR(50) NOT NULL,
  source_filename VARCHAR(255) NOT NULL DEFAULT 'tally_export.csv',
  total_transactions INT NOT NULL DEFAULT 0,
  matched_count INT NOT NULL DEFAULT 0,
  discrepancy_count INT NOT NULL DEFAULT 0,
  discrepancies JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(50) NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reconciliation_entity ON reconciliation_reports(entity_id);

-- 7. MODULE 17: EMAIL INTELLIGENCE
CREATE TABLE IF NOT EXISTS email_intake (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  case_id UUID REFERENCES cases(id) ON DELETE SET NULL,
  sender VARCHAR(255) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body_text TEXT NOT NULL,
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  extracted_action_items JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_email_intake_case ON email_intake(case_id);
CREATE INDEX IF NOT EXISTS idx_email_intake_user ON email_intake(created_by);

-- 8. MODULE 18: PROPERTY MANAGEMENT
CREATE TABLE IF NOT EXISTS properties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL DEFAULT 'Sunrise Apartments',
  address TEXT NOT NULL,
  type VARCHAR(50) NOT NULL DEFAULT 'Residential', -- Residential, Commercial, Industrial, Land
  status VARCHAR(50) NOT NULL DEFAULT 'Occupied', -- Occupied, Vacant, Under Maintenance, Under Construction
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_properties_entity ON properties(owner_entity_id);

CREATE TABLE IF NOT EXISTS leases (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  tenant_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  rent_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(50) NOT NULL DEFAULT 'Active',
  terms TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_leases_property ON leases(property_id);
CREATE INDEX IF NOT EXISTS idx_leases_tenant ON leases(tenant_user_id);

CREATE TABLE IF NOT EXISTS property_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. MODULE 19: PROJECT MANAGEMENT
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  entity_id UUID REFERENCES entities(id) ON DELETE SET NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'On Track', -- On Track, Delayed, Completed, In Review
  progress_percentage INT NOT NULL DEFAULT 0,
  start_date DATE NOT NULL,
  expected_end_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_projects_entity ON projects(entity_id);

CREATE TABLE IF NOT EXISTS project_milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  due_date DATE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Pending', -- Completed, In Progress, Pending
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_milestones_project ON project_milestones(project_id);

CREATE TABLE IF NOT EXISTS project_stakeholders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_in_project VARCHAR(50) NOT NULL DEFAULT 'stakeholder', -- tenant, buyer, vendor, employee, manager
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_stakeholders_project ON project_stakeholders(project_id);
CREATE INDEX IF NOT EXISTS idx_stakeholders_user ON project_stakeholders(user_id);
