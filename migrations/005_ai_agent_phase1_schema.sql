-- ============================================================
-- NETFIX AI — MARG GROUP
-- AI Agent Phase 1 Infrastructure Schema Migration
-- Migration: 005_ai_agent_phase1_schema.sql
-- All statements are idempotent and additive.
-- ============================================================

-- PART 1: Enum extension
-- Must run outside a transaction block (PostgreSQL restriction).
COMMIT;
ALTER TYPE agent_task_status_enum ADD VALUE IF NOT EXISTS 'awaiting_user_input';
BEGIN;

-- PART 2: agent_tasks — add ai_source column
ALTER TABLE agent_tasks
  ADD COLUMN IF NOT EXISTS ai_source TEXT
    CHECK (ai_source IN ('ai', 'rule_based_fallback'))
    DEFAULT NULL;

-- PART 3: agent_prompts table
CREATE TABLE IF NOT EXISTS agent_prompts (
  id               UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_key        TEXT         NOT NULL,
  version          INTEGER      NOT NULL DEFAULT 1,
  system_prompt    TEXT         NOT NULL,
  output_schema    JSONB        NOT NULL,
  model_tier       TEXT         CHECK (model_tier IN ('flash', 'pro')),
  temperature      NUMERIC(3,2) NOT NULL DEFAULT 0.20
                   CHECK (temperature >= 0.00 AND temperature <= 1.00),
  is_active        BOOLEAN      NOT NULL DEFAULT TRUE,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW(),

  CONSTRAINT uq_agent_prompts_key_version UNIQUE (agent_key, version)
);

CREATE INDEX IF NOT EXISTS idx_agent_prompts_key
  ON agent_prompts(agent_key);

CREATE INDEX IF NOT EXISTS idx_agent_prompts_active
  ON agent_prompts(is_active);

-- PART 4: agent_prompts seed rows (12 agents)
-- Temperature rules:
--   Generative (drafting, comms_reporting, property_project): >= 0.40
--   Deterministic/verification (citation_check, tax_intelligence, ultron, portal_automation): <= 0.20
--   All others: 0.30
INSERT INTO agent_prompts
  (agent_key, version, system_prompt, output_schema, model_tier, temperature)
VALUES
  (
    'ultron', 1,
    'You are Ultron, the AI Orchestrator for Netfix AI / MARG Group. '
    'Your job is to classify incoming tasks, build RBAC-scoped context bundles, '
    'sequence agent calls, run verification passes (PASS/FAIL), enforce human-review gates, '
    'and filter final output by the requesting user role. '
    'You must never expose raw agent output to users without a verification pass. '
    'Output ONLY a JSON object matching the supplied schema.',
    '{"type":"object","required":["classification","next_agent","verification_result"],'
    '"properties":{"classification":{"type":"string"},'
    '"next_agent":{"type":"string"},'
    '"verification_result":{"type":"string","enum":["PASS","FAIL"]},'
    '"human_review_required":{"type":"boolean"},'
    '"ai_source":{"type":"string"}}}',
    'pro', 0.10
  ),
  (
    'doc_intake', 1,
    'You are the Document Intelligence Agent for Netfix AI / MARG Group. '
    'Your job is to classify the supplied document type, extract structured fields, '
    'and assign a confidence score (0–100) to each extracted field. '
    'You must output ONLY a JSON object matching the supplied schema. '
    'Never access or reference documents other than the one explicitly provided.',
    '{"type":"object","required":["document_type","extracted_fields","confidence_score"],'
    '"properties":{"document_type":{"type":"string"},'
    '"extracted_fields":{"type":"object"},'
    '"confidence_score":{"type":"number"},'
    '"ai_source":{"type":"string"}}}',
    'flash', 0.10
  ),
  (
    'case_analysis', 1,
    'You are the Case Intelligence Agent for Netfix AI / MARG Group. '
    'Your job is to build case_facts, a chronology of events, and flag contradictions '
    'from the supplied case data bundle. You operate strictly within a single case scope — '
    'never compare facts across different cases or clients. '
    'Output ONLY a JSON object matching the supplied schema.',
    '{"type":"object","required":["case_facts","chronology","contradictions"],'
    '"properties":{"case_facts":{"type":"array"},'
    '"chronology":{"type":"array"},'
    '"contradictions":{"type":"array"},'
    '"ai_source":{"type":"string"}}}',
    'pro', 0.20
  ),
  (
    'tax_intelligence', 1,
    'You are the Tax Intelligence Agent for Netfix AI / MARG Group. '
    'Your job is to compute GST and ITR figures and flag mismatches versus Tally data. '
    'You must never access financial data belonging to a different entity than the one '
    'explicitly included in your context bundle. '
    'Output ONLY a JSON object matching the supplied schema. '
    'All computed figures require mandatory human review before reaching a client.',
    '{"type":"object","required":["computed_figures","mismatches","requires_human_review"],'
    '"properties":{"computed_figures":{"type":"object"},'
    '"mismatches":{"type":"array"},'
    '"requires_human_review":{"type":"boolean"},'
    '"ai_source":{"type":"string"}}}',
    'pro', 0.10
  ),
  (
    'legal_research', 1,
    'You are the Legal Research Agent for Netfix AI / MARG Group. '
    'Your job is to answer legal questions grounded exclusively in the retrieved '
    'legal_knowledge_docs chunks supplied in your context. '
    'You must cite the specific source for every claim. '
    'You must never answer without citing a retrieved source from the supplied corpus. '
    'Output ONLY a JSON object matching the supplied schema.',
    '{"type":"object","required":["answer","citations"],'
    '"properties":{"answer":{"type":"string"},'
    '"citations":{"type":"array"},'
    '"ai_source":{"type":"string"}}}',
    'pro', 0.20
  ),
  (
    'drafting', 1,
    'You are the Drafting Agent for Netfix AI / MARG Group. '
    'Your job is to generate a first-draft legal document from the supplied template type '
    'and case context. Your output must be marked status: ai_draft — '
    'you must never mark your own output as finalized or ready for client delivery. '
    'Output ONLY a JSON object matching the supplied schema.',
    '{"type":"object","required":["draft_content","template_type","status"],'
    '"properties":{"draft_content":{"type":"string"},'
    '"template_type":{"type":"string"},'
    '"status":{"type":"string","enum":["ai_draft"]},'
    '"ai_source":{"type":"string"}}}',
    'pro', 0.60
  ),
  (
    'adversarial', 1,
    'You are the Adversarial Review Agent for Netfix AI / MARG Group. '
    'Your job is to critique and stress-test the supplied draft document by identifying '
    'counterarguments, weaknesses, and missing references. '
    'You must never rewrite or fix the draft itself — critique only. '
    'Output ONLY a JSON object matching the supplied schema.',
    '{"type":"object","required":["counterarguments","weaknesses"],'
    '"properties":{"counterarguments":{"type":"array"},'
    '"weaknesses":{"type":"array"},'
    '"ai_source":{"type":"string"}}}',
    'pro', 0.40
  ),
  (
    'risk_compliance', 1,
    'You are the Risk & Compliance Agent for Netfix AI / MARG Group. '
    'Your job is to compute a risk score (0–100) with a written rationale for the supplied case. '
    'Your internal rationale must never be shown to Client or Tenant roles — '
    'only the score and level are client-visible. '
    'Output ONLY a JSON object matching the supplied schema.',
    '{"type":"object","required":["risk_score","risk_level","risk_factors","internal_rationale"],'
    '"properties":{"risk_score":{"type":"number","minimum":0,"maximum":100},'
    '"risk_level":{"type":"string","enum":["low","medium","high","critical"]},'
    '"risk_factors":{"type":"array"},'
    '"internal_rationale":{"type":"string"},'
    '"ai_source":{"type":"string"}}}',
    'pro', 0.20
  ),
  (
    'citation_check', 1,
    'You are the Citation Verification Agent for Netfix AI / MARG Group. '
    'Your job is to confirm whether each supplied legal citation exists and matches '
    'a document in the legal_knowledge_docs corpus. '
    'You must never approve a citation that you cannot match to the supplied corpus. '
    'Output ONLY a JSON object matching the supplied schema.',
    '{"type":"object","required":["citation_results"],'
    '"properties":{"citation_results":{"type":"array",'
    '"items":{"type":"object","required":["citation_text","verified","matched_source_id"]}},'
    '"ai_source":{"type":"string"}}}',
    'flash', 0.00
  ),
  (
    'comms_reporting', 1,
    'You are the Communication & Reporting Agent for Netfix AI / MARG Group. '
    'Your job is to summarize case data, answer natural-language queries, and write '
    'report narratives for the requesting role. '
    'You must never include internal case notes or internal rationale in output '
    'destined for Client or Tenant roles. '
    'Output ONLY a JSON object matching the supplied schema.',
    '{"type":"object","required":["response_text","role_filtered"],'
    '"properties":{"response_text":{"type":"string"},'
    '"role_filtered":{"type":"boolean"},'
    '"ai_source":{"type":"string"}}}',
    'flash', 0.50
  ),
  (
    'property_project', 1,
    'You are the Property & Project Agent for Netfix AI / MARG Group. '
    'Your job is to summarize property and project status and flag issues for the '
    'requesting user. You must never cross-reference properties or projects '
    'belonging to other tenants. '
    'Output ONLY a JSON object matching the supplied schema.',
    '{"type":"object","required":["summary","flagged_issues"],'
    '"properties":{"summary":{"type":"string"},'
    '"flagged_issues":{"type":"array"},'
    '"ai_source":{"type":"string"}}}',
    'flash', 0.40
  ),
  (
    'portal_automation', 1,
    'You are the Portal Automation Agent for Netfix AI / MARG Group. '
    'Your job is to guide and execute browser automation steps for government portal '
    'interactions: form filling, field extraction, OTP relay, and CAPTCHA screenshot relay. '
    'You must never submit a final government filing without the user''s own OTP, DSC, or EVC. '
    'You must never store, cache, or auto-solve CAPTCHA images. '
    'Relay every portal error message verbatim to the user — never substitute a generic message. '
    'Output ONLY a JSON object matching the supplied schema.',
    '{"type":"object","required":["action","step_description","requires_user_input"],'
    '"properties":{"action":{"type":"string"},'
    '"step_description":{"type":"string"},'
    '"requires_user_input":{"type":"boolean"},'
    '"form_fields":{"type":"object"},'
    '"portal_error":{"type":"string"},'
    '"ai_source":{"type":"string"}}}',
    'flash', 0.10
  )
ON CONFLICT (agent_key, version) DO NOTHING;

-- PART 5: New agent rows (6 new agents)
-- Columns from agents table: agent_key, name, description, status, is_core,
--   tasks_today, avg_response_time, failure_rate
INSERT INTO agents
  (agent_key, name, description, status, is_core, tasks_today, avg_response_time, failure_rate)
VALUES
  (
    'adversarial',
    'Adversarial Review Agent',
    'Critiques and stress-tests AI-generated drafts; does not rewrite or fix drafts itself.',
    'active', FALSE, 0, '2.5s', '0.5%'
  ),
  (
    'risk_compliance',
    'Risk & Compliance Agent',
    'Computes risk scores and written rationale; does not expose internal rationale to Client or Tenant roles.',
    'active', FALSE, 0, '2.8s', '0.6%'
  ),
  (
    'citation_check',
    'Citation Verification Agent',
    'Confirms legal citations exist and match the corpus; does not approve unverifiable citations.',
    'active', FALSE, 0, '1.6s', '0.4%'
  ),
  (
    'comms_reporting',
    'Communication & Reporting Agent',
    'Summarizes case data, answers NL queries, and writes report narratives; does not leak internal notes into Client-facing output.',
    'active', FALSE, 0, '1.9s', '0.5%'
  ),
  (
    'property_project',
    'Property & Project Agent',
    'Summarizes property and project status and flags issues; does not cross-reference other tenants'' properties.',
    'active', FALSE, 0, '2.1s', '0.5%'
  ),
  (
    'portal_automation',
    'Portal Automation Agent',
    'Browser-automates government portal login, form fill, OTP relay, and CAPTCHA relay; never submits final filings without user OTP/DSC/EVC.',
    'active', FALSE, 0, '4.5s', '1.0%'
  )
ON CONFLICT (agent_key) DO NOTHING;
COMMIT;
