export type UserRole = 'employee' | 'management' | 'advocate' | 'client' | 'tenant' | 'regulator';
export type UserStatus = 'active' | 'suspended' | 'deactivated' | 'pending';
export type OtpPurpose = 'register' | 'login' | 'resend_register' | 'resend_login';

export interface UserEntity {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  dob: string;
  email: string;
  phone: string;
  permanent_address: string;
  temporary_address: string;
  password_hash: string;
  role: UserRole;
  status: UserStatus;
  is_deactivated?: boolean;
  last_password_change?: string;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

export interface UserSessionEntity {
  id: string;
  user_id: string;
  session_token: string;
  jti: string;
  device_info?: string;
  ip_address?: string;
  created_at: string;
  last_activity_at: string;
  expires_at: string;
  revoked_at?: string;
}

export interface PasswordResetTokenEntity {
  id: string;
  user_id: string;
  email: string;
  token_hash: string;
  expires_at: string;
  used_at?: string;
  created_at: string;
}

export interface PendingRegistrationEntity {
  id: string;
  email: string;
  registration_data: any;
  password_hash: string;
  role: UserRole;
  expires_at: string;
  created_at: string;
}

export interface OtpVerificationEntity {
  id: string;
  pending_id?: string;
  user_id?: string;
  email: string;
  otp_hash: string;
  purpose: OtpPurpose;
  expires_at: string;
  verified_at?: string;
  attempt_count: number;
  created_at: string;
}

export interface EntityRecord {
  id: string;
  name: string;
  type: 'company' | 'individual' | 'firm' | 'proprietorship';
  gstin?: string;
  pan?: string;
  registered_address: string;
  city?: string;
  state?: string;
  owner_user_id?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface EntityMemberRecord {
  id: string;
  entity_id: string;
  user_id: string;
  role: 'owner' | 'member' | 'authorized_signatory';
  created_at: string;
}

export interface ClientAssignmentRecord {
  id: string;
  client_id: string;
  assigned_employee_id?: string;
  assigned_advocate_id?: string;
  relationship_start_date: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export interface CaseEntity {
  id: string;
  case_number: string;
  title: string;
  entity_id?: string;
  client_id: string;
  assigned_employee_id?: string;
  assigned_advocate_id?: string;
  module_type: 'tax' | 'legal' | 'litigation' | 'corporate' | 'property' | 'projects' | 'compliance';
  status: 'open' | 'in_review' | 'awaiting_approval' | 'completed';
  priority?: 'high' | 'medium' | 'low';
  next_hearing_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CaseNoteEntity {
  id: string;
  case_id: string;
  author_id?: string;
  author_name: string;
  note: string;
  is_internal: boolean;
  created_at: string;
}

export interface CaseStatusHistoryEntity {
  id: string;
  case_id: string;
  previous_status?: string;
  new_status: string;
  changed_by?: string;
  comment?: string;
  created_at: string;
}

export interface DocumentEntity {
  id: string;
  case_id?: string;
  entity_id?: string;
  uploaded_by: string;
  file_name: string;
  file_url: string;
  file_size: number;
  mime_type: string;
  document_type: 'tax_invoice' | 'agreement' | 'notice' | 'compliance' | 'court_order' | 'other';
  extraction_status: 'pending' | 'processing' | 'completed' | 'failed';
  is_confidential?: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentExtractionEntity {
  id: string;
  document_id: string;
  extracted_text?: string;
  extracted_fields: Record<string, any>;
  confidence_score: number;
  created_at: string;
}

export interface AdminEntity {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  admin_level: string;
  mfa_enabled: boolean;
  mfa_secret?: string;
  failed_mfa_attempts: number;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AccessRequestEntity {
  id: string;
  requester_id?: string;
  requester_name: string;
  requester_role: UserRole;
  requested_resource: string;
  reason: string;
  duration_days: number;
  status: 'pending' | 'approved' | 'denied';
  decision_note?: string;
  reviewed_by?: string;
  decision_date?: string;
  created_at: string;
}

export interface AgentEntity {
  id: string;
  agent_key: string;
  name: string;
  description?: string;
  status: 'active' | 'idle' | 'error';
  is_core: boolean;
  tasks_today: number;
  avg_response_time: string;
  failure_rate: string;
  created_at: string;
}

export interface AgentTaskEntity {
  id: string;
  agent_id?: string;
  agent_name: string;
  user_id?: string;
  case_id?: string;
  entity_id?: string;
  input_summary: string;
  output_summary: string;
  status: 'queued' | 'processing' | 'completed' | 'failed' | 'awaiting_user_input';
  human_review_status: 'approved' | 'edited' | 'rejected' | 'pending';
  current_step?: number;
  duration_ms: number;
  created_at: string;
}

export interface AuditLogEntity {
  id: string;
  actor_id?: string;
  actor_name: string;
  actor_type: 'user' | 'admin' | 'system';
  action: string;
  module: string;
  target: string;
  details?: any;
  ip_address?: string;
  created_at: string;
}

export interface TicketEntity {
  id: string;
  ticket_number: string;
  user_id?: string;
  user_name: string;
  issue: string;
  category: string;
  status: 'open' | 'in_progress' | 'resolved';
  description: string;
  assigned_to: string;
  activity_notes: Array<{ timestamp: string; author: string; note: string }>;
  created_at: string;
  updated_at: string;
}

// ============================================================
// PHASE 2 TYPES (MODULES 10-19)
// ============================================================

export interface GstFilingEntity {
  id: string;
  entity_id: string;
  case_id?: string;
  period: string;
  filing_type: 'GSTR-1' | 'GSTR-3B' | 'GSTR-9';
  computed_data: Record<string, any>;
  status: 'draft' | 'approved' | 'filed';
  created_at: string;
  updated_at: string;
}

export interface GstMismatchEntity {
  id: string;
  filing_id: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  source_document_id?: string;
  created_at: string;
}

export interface IncomeTaxFilingEntity {
  id: string;
  entity_id: string;
  case_id?: string;
  assessment_year: string;
  computed_data: Record<string, any>;
  suggested_deductions: Record<string, any>;
  status: 'draft' | 'approved' | 'filed';
  created_at: string;
  updated_at: string;
}

export interface LegalKnowledgeDocEntity {
  id: string;
  category: 'criminal' | 'civil' | 'tax' | 'property';
  title: string;
  source_text: string;
  source_url?: string;
  embedding_vector?: string;
  is_restricted?: boolean;
  allowed_roles?: string[];
  created_at: string;
  updated_at: string;
}

export interface ResearchQueryEntity {
  id: string;
  user_id: string;
  case_id?: string;
  query_text: string;
  category: string;
  result_summary: string;
  sources_cited: any[];
  created_at: string;
}

export interface KnowledgeGraphNodeEntity {
  id: string;
  type: 'case' | 'statute' | 'section' | 'entity';
  label: string;
  entity_id?: string;
  case_id?: string;
  is_private?: boolean;
  metadata: Record<string, any>;
  created_at: string;
}

export interface KnowledgeGraphEdgeEntity {
  id: string;
  from_node_id: string;
  to_node_id: string;
  relationship_type: 'cites' | 'amends' | 'relates_to';
  metadata?: Record<string, any>;
  created_at: string;
}

export interface DraftDocumentEntity {
  id: string;
  case_id: string;
  template_type: string;
  generated_content: string;
  edited_content: string;
  status: 'ai_draft' | 'under_review' | 'finalized';
  is_client_visible: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ReconciliationReportEntity {
  id: string;
  entity_id: string;
  period: string;
  source_filename: string;
  total_transactions: number;
  matched_count: number;
  discrepancy_count: number;
  discrepancies: any[];
  status: string;
  created_at: string;
  updated_at: string;
}

export interface EmailIntakeEntity {
  id: string;
  case_id?: string;
  sender: string;
  subject: string;
  body_text: string;
  received_at: string;
  extracted_action_items: any[];
  created_by: string;
  created_at: string;
}

export interface PropertyEntity {
  id: string;
  owner_entity_id?: string;
  name: string;
  address: string;
  type: 'Residential' | 'Commercial' | 'Industrial' | 'Land';
  status: 'Occupied' | 'Vacant' | 'Under Maintenance' | 'Under Construction';
  created_at: string;
  updated_at: string;
}

export interface LeaseEntity {
  id: string;
  property_id: string;
  tenant_user_id: string;
  start_date: string;
  end_date: string;
  rent_amount: number;
  status: string;
  terms?: string;
  created_at: string;
  updated_at: string;
}

export interface PropertyDocumentEntity {
  id: string;
  property_id: string;
  document_id: string;
  created_at: string;
}

export interface ProjectEntity {
  id: string;
  name: string;
  entity_id?: string;
  status: 'On Track' | 'Delayed' | 'Completed' | 'In Review';
  progress_percentage: number;
  start_date: string;
  expected_end_date: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectMilestoneEntity {
  id: string;
  project_id: string;
  title: string;
  due_date: string;
  status: 'Completed' | 'In Progress' | 'Pending';
  created_at: string;
  updated_at: string;
}

export interface ProjectStakeholderEntity {
  id: string;
  project_id: string;
  user_id: string;
  role_in_project: string;
  created_at: string;
}

// ============================================================
// PHASE 3 TYPES (MODULES 20-28)
// ============================================================

export interface CaseFactEntity {
  id: string;
  case_id: string;
  fact_text: string;
  fact_type: 'date' | 'amount' | 'party' | 'obligation' | 'event';
  source_document_id?: string;
  source_page?: string;
  confidence_score: number;
  verified_by_human: boolean;
  verified_by?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ChronologyEventEntity {
  id: string;
  case_id: string;
  fact_id?: string;
  event_date: string;
  title: string;
  description?: string;
  source_name?: string;
  is_verified: boolean;
  created_at: string;
}

export interface EvidenceItemEntity {
  id: string;
  case_id: string;
  document_id: string;
  evidence_type: 'Contract' | 'Financial' | 'Correspondence' | 'Digital' | 'Physical';
  linked_fact_id?: string;
  custody_status: 'In Custody' | 'In Review' | 'Transferred' | 'Archived';
  custody_log: Array<{ timestamp: string; actor: string; action: string }>;
  added_by: string;
  created_at: string;
  updated_at: string;
}

export interface ContradictionEntity {
  id: string;
  case_id: string;
  fact_id_1?: string;
  fact_id_2?: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'flagged' | 'resolved' | 'dismissed';
  resolution_notes?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DeadlineEntity {
  id: string;
  case_id?: string;
  entity_id?: string;
  title: string;
  deadline_type: 'compliance' | 'tax' | 'litigation' | 'notice' | 'hearing';
  due_date: string;
  days_remaining: number;
  status: 'upcoming' | 'overdue' | 'met';
  reminder_sent: boolean;
  description?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AdversarialReviewEntity {
  id: string;
  draft_document_id: string;
  case_id: string;
  counterarguments: Array<{ point: string; severity: 'low' | 'medium' | 'high' }>;
  weaknesses_identified: Array<{ weakness: string; suggestion: string }>;
  status: 'completed' | 'processing' | 'failed';
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface RiskAssessmentEntity {
  id: string;
  case_id: string;
  risk_score: number; // 0-100
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_factors: Array<{ factor: string; impact: string }>;
  generated_at: string;
  generated_by?: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

export interface CitationCheckEntity {
  id: string;
  source_content_id: string;
  source_type: 'research_query' | 'draft_document';
  citation_text: string;
  verified: boolean;
  matched_source_id?: string;
  verification_notes?: string;
  checked_at: string;
}

export interface SavedReportEntity {
  id: string;
  report_title: string;
  report_type: 'case_summary' | 'compliance' | 'financial' | 'custom';
  filters_applied: Record<string, any>;
  file_url?: string;
  generated_by: string;
  generated_at: string;
  expires_at?: string;
}



// ============================================================
// AI AGENT LAYER TYPES (Phase 1 — Infrastructure Foundation)
// ============================================================

/** Model tier selector for GeminiService */
export type GeminiModelTier = 'FLASH' | 'PRO';

/** Discriminator on every GeminiService response */
export type GeminiAiSource = 'ai' | 'rule_based_fallback';

/** Reason logged on fallback activation */
export type GeminiFailureReason =
  | 'exhausted_retries'
  | 'invalid_json'
  | 'rate_limited'
  | 'api_error'
  | 'no_api_key';

/**
 * Return type of GeminiService.call().
 * On success: ai_source = 'ai' + all parsed fields from the schema.
 * On failure: ai_source = 'rule_based_fallback' only.
 */
export type GeminiResult<T = Record<string, unknown>> =
  | ({ ai_source: 'ai' } & T)
  | { ai_source: 'rule_based_fallback' };

/** Options passed to GeminiService.call() */
export interface GeminiCallOptions {
  /** Agent identifier used in fallback log entries (1–64 chars) */
  agentKey: string;
  /** Selects GEMINI_MODEL_FLASH or GEMINI_MODEL_PRO env var */
  modelTier: GeminiModelTier;
  /** Full merged prompt string (system + user context) */
  prompt: string;
  /** Caller-supplied JSON schema; Gemini is instructed to conform to it */
  schema: Record<string, unknown>;
}

/** Structured warning object written to server log on fallback activation */
export interface GeminiFallbackLogEntry {
  level: 'WARN';
  event: 'gemini_fallback';
  agent_key: string;
  failure_reason: GeminiFailureReason;
  timestamp: string; // ISO 8601 UTC
  attempts: number;
}

/** Mirrors the agent_prompts database table row */
export interface AgentPromptEntity {
  id: string;
  agent_key: string;
  version: number;
  system_prompt: string;
  output_schema: Record<string, unknown>;
  model_tier: 'flash' | 'pro' | null;
  temperature: number;
  is_active: boolean;
  created_at: string;
}

/** Extended AgentTaskEntity — ai_source column added by migration 005 */
export interface AgentTaskAiSourceExtension {
  ai_source: GeminiAiSource | null; // NULL for rows pre-dating migration 005
}

// ============================================================
// AI AGENT LAYER TYPES (Phase 2 — Orchestrator Skeleton)
// ============================================================

export interface OrchestrateRequest {
  taskDescription: string;
  requestingUserId: string;
  forceVerificationFailure?: boolean;
  agentKey?: string;
  caseId?: string;
  documentId?: string;
  details?: Record<string, unknown>;
  citations?: any[];
  templateType?: string;
  draftContent?: string;
}

export interface GeneratedReportEntity {
  id: string;
  task_id: string;
  user_id: string;
  title: string;
  file_path: string;
  file_size_bytes: number;
  download_url: string;
  ai_source: GeminiAiSource;
  created_at: string;
}

export interface OrchestrateResult {
  task_id: string;
  status: 'completed' | 'failed' | 'awaiting_user_input';
  human_review_status?: 'approved' | 'edited' | 'rejected' | 'pending';
  ai_source: GeminiAiSource;
  result: unknown;
  steps_completed: number;
  verification_retries?: number;
  message?: string;
  next_agent?: string;
  pdf_report?: {
    report_id: string;
    download_url: string;
    title: string;
  };
}

export interface UltronContextBundle {
  user: any; // RBACUserContext
  cases: any[]; // CaseRecord[]
  documents: any[]; // DocumentRecord[]
  agentTaskHistory: AgentTaskEntity[];
  taskDescription: string;
  documentId?: string;
  caseId?: string;
}

export interface UltronVerificationResult {
  verdict: 'PASS' | 'FAIL';
  corrective_feedback?: string;
}


