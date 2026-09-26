import { auditService } from './auditService.js';
import type { UserRole } from '../types/index.js';

export interface RBACUserContext {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId: string;
  organizationId: string;
}

export interface CaseRecord {
  id: string;
  title: string;
  clientName: string;
  clientId: string;
  module: string;
  status: 'Open' | 'In Review' | 'Pending' | 'Completed' | 'On Hold';
  priority: 'High' | 'Medium' | 'Low';
  assignedEmployeeId: string;
  assignedEmployeeName: string;
  assignedAdvocateId?: string;
  tenantId: string;
  createdDate: string;
  dueDate: string;
  lastUpdated: string;
  matterType?: string;
  isConfidential?: boolean;
}

export interface DocumentRecord {
  id: string;
  name: string;
  type: string;
  caseId: string;
  ownerUserId: string;
  tenantId: string;
  uploadDate: string;
  aiProcessingStatus: 'Completed' | 'In Progress' | 'Pending' | 'Failed';
  generatedOutputSummary?: string;
  isConfidential?: boolean;
}

export interface AgentTaskRecord {
  id: string;
  caseId: string;
  requestTitle: string;
  agentType: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'WAITING_FOR_USER';
  progressPercent: number;
  currentStep: string;
  steps: Array<{
    name: string;
    status: 'Completed' | 'In progress...' | 'Pending';
  }>;
  createdUserId: string;
  tenantId: string;
  resultSummary?: string;
  startedAt: string;
  completedAt?: string;
}

export interface PropertyRecord {
  id: string;
  userId: string;
  propertyName: string;
  unitNumber: string;
  location: string;
  leaseStatus: 'Active Lease' | 'Pending Renewal' | 'Expired';
  leaseEndDate: string;
  nextPaymentDueAmount: string;
  nextPaymentDueDate: string;
  openRequestsCount: number;
  recentActivity: Array<{
    date: string;
    item: string;
    status: 'Open' | 'Paid' | 'Available' | 'Pending';
  }>;
}

export interface AuditRecordItem {
  id: string;
  recordId: string;
  entityName: string;
  auditType: string;
  period: string;
  status: 'In Review' | 'Open' | 'Completed';
  assignedAuditorId: string;
  scope: string;
  isRestricted: boolean;
}

export interface AccessGrantRecord {
  id: string;
  userId: string;
  resourceType: 'case' | 'document' | 'audit_record';
  resourceId: string;
  status: 'APPROVED' | 'PENDING' | 'REVOKED' | 'EXPIRED';
  grantedBy: string;
  grantedAt: string;
  expiresAt: string;
}

const ALLOWED_ROLES: UserRole[] = ['employee', 'management', 'advocate', 'client', 'tenant', 'regulator'];

// Pre-seeded security mocked datasets for Phase 6 strict isolation testing
const MOCK_USERS: Record<string, RBACUserContext> = {
  employee: {
    id: 'usr_demo_emp',
    name: 'Amit Sharma',
    email: 'demo.employee@netfixai.test',
    role: 'employee',
    tenantId: 'tenant_marg_corp',
    organizationId: 'org_marg_operations',
  },
  management: {
    id: 'usr_demo_mgmt',
    name: 'Rohan Mehta',
    email: 'demo.management@netfixai.test',
    role: 'management',
    tenantId: 'tenant_marg_corp',
    organizationId: 'org_marg_executive',
  },
  advocate: {
    id: 'usr_demo_adv',
    name: 'Ananya Rao',
    email: 'demo.advocate@netfixai.test',
    role: 'advocate',
    tenantId: 'tenant_marg_legal',
    organizationId: 'org_marg_counsel',
  },
  client: {
    id: 'usr_demo_cli',
    name: 'Vikram Reddy',
    email: 'demo.client@netfixai.test',
    role: 'client',
    tenantId: 'tenant_abc_pvtltd',
    organizationId: 'org_marg_client_services',
  },
  tenant: {
    id: 'usr_demo_tenant',
    name: 'Arjun Patel',
    email: 'demo.tenant@netfixai.test',
    role: 'tenant',
    tenantId: 'tenant_marg_commercial',
    organizationId: 'org_marg_commercial_ventures',
  },
  regulator: {
    id: 'usr_demo_reg',
    name: 'Priya Nair',
    email: 'demo.regulator@netfixai.test',
    role: 'regulator',
    tenantId: 'tenant_marg_compliance',
    organizationId: 'org_marg_compliance_division',
  },
};

const MOCK_CASES: CaseRecord[] = [
  {
    id: 'C-1042',
    title: 'Review GST Draft — ABC Pvt Ltd',
    clientName: 'ABC Pvt Ltd',
    clientId: 'usr_cli_rajesh',
    module: 'GST & Tax',
    status: 'In Review',
    priority: 'High',
    assignedEmployeeId: 'usr_emp_amit',
    assignedEmployeeName: 'Amit Sharma',
    assignedAdvocateId: 'usr_adv_prakash',
    tenantId: 'tenant_abc_pvtltd',
    createdDate: '10 May 2025',
    dueDate: '26 May 2025',
    lastUpdated: '25 May 2025',
    matterType: 'GST Dispute',
    isConfidential: false,
  },
  {
    id: 'C-1039',
    title: 'Upload Documents & Audit — Sharma Enterprises',
    clientName: 'Sharma Enterprises',
    clientId: 'usr_cli_sharma_b',
    module: 'Corporate',
    status: 'Open',
    priority: 'Medium',
    assignedEmployeeId: 'usr_emp_amit',
    assignedEmployeeName: 'Amit Sharma',
    tenantId: 'tenant_sharma_ent',
    createdDate: '12 May 2025',
    dueDate: '27 May 2025',
    lastUpdated: '24 May 2025',
    matterType: 'Corporate Audit',
  },
  {
    id: 'C-1038',
    title: 'Contract Review — Desai Holdings',
    clientName: 'Desai Holdings',
    clientId: 'usr_cli_desai',
    module: 'Contracts',
    status: 'Open',
    priority: 'High',
    assignedEmployeeId: 'usr_emp_vikram',
    assignedEmployeeName: 'Vikram Rao',
    assignedAdvocateId: 'usr_adv_prakash',
    tenantId: 'tenant_desai_h',
    createdDate: '15 May 2025',
    dueDate: '28 May 2025',
    lastUpdated: '24 May 2025',
    matterType: 'Contract Review',
  },
  {
    id: 'C-1035',
    title: 'Approve Draft — Mehta Foundation',
    clientName: 'Mehta Foundation',
    clientId: 'usr_cli_mehta',
    module: 'Trust Compliance',
    status: 'Pending',
    priority: 'Medium',
    assignedEmployeeId: 'usr_emp_amit',
    assignedEmployeeName: 'Amit Sharma',
    tenantId: 'tenant_mehta_f',
    createdDate: '14 May 2025',
    dueDate: '29 May 2025',
    lastUpdated: '23 May 2025',
    matterType: 'Trust Compliance',
  },
  {
    id: 'C-1031',
    title: 'Research Query — Rao & Co',
    clientName: 'Rao & Co',
    clientId: 'usr_cli_rao',
    module: 'Tax Litigation',
    status: 'Open',
    priority: 'Low',
    assignedEmployeeId: 'usr_emp_amit',
    assignedEmployeeName: 'Amit Sharma',
    tenantId: 'tenant_rao_co',
    createdDate: '16 May 2025',
    dueDate: '30 May 2025',
    lastUpdated: '22 May 2025',
  },
  {
    id: 'C-1028',
    title: 'Client Follow-up — Verma Traders',
    clientName: 'Verma Traders',
    clientId: 'usr_cli_verma',
    module: 'Commercial',
    status: 'Open',
    priority: 'Low',
    assignedEmployeeId: 'usr_emp_amit',
    assignedEmployeeName: 'Amit Sharma',
    tenantId: 'tenant_verma_t',
    createdDate: '18 May 2025',
    dueDate: '31 May 2025',
    lastUpdated: '21 May 2025',
  },
  {
    id: 'C-1027',
    title: 'Property Dispute — Kulkarni Estate',
    clientName: 'Kulkarni Estate',
    clientId: 'usr_cli_kulkarni',
    module: 'Property Law',
    status: 'Open',
    priority: 'High',
    assignedEmployeeId: 'usr_emp_neha_p',
    assignedEmployeeName: 'Neha Patel',
    assignedAdvocateId: 'usr_adv_prakash',
    tenantId: 'tenant_kulkarni_e',
    createdDate: '01 May 2025',
    dueDate: '10 Jun 2025',
    lastUpdated: '20 May 2025',
    matterType: 'Property Dispute',
  },
];

const MOCK_DOCUMENTS: DocumentRecord[] = [
  {
    id: 'DOC-1001',
    name: 'GST_Return_Q4_ABC_Pvt_Ltd.pdf',
    type: 'Tax Filing',
    caseId: 'C-1042',
    ownerUserId: 'usr_cli_rajesh',
    tenantId: 'tenant_abc_pvtltd',
    uploadDate: '24 May 2025',
    aiProcessingStatus: 'Completed',
    generatedOutputSummary: 'Section 80C & GSTR-3B Reconciliation Complete. Zero anomalies.',
  },
  {
    id: 'DOC-1002',
    name: 'Commercial_Lease_Agreement_B302.pdf',
    type: 'Lease Agreement',
    caseId: 'C-PROPERTY-B302',
    ownerUserId: 'usr_ten_neha',
    tenantId: 'tenant_sunrise_residency',
    uploadDate: '15 May 2025',
    aiProcessingStatus: 'Completed',
    generatedOutputSummary: 'Clause 4.2 Rent Escrow terms verified by AI Compliance agent.',
  },
  {
    id: 'DOC-1003',
    name: 'Confidential_Audit_Report_FY24.pdf',
    type: 'Audit Dossier',
    caseId: 'C-1039',
    ownerUserId: 'usr_cli_sharma_b',
    tenantId: 'tenant_sharma_ent',
    uploadDate: '20 May 2025',
    aiProcessingStatus: 'Completed',
    isConfidential: true,
  },
  {
    id: 'DOC-2002',
    name: 'Cross_Tenant_Audit_File.pdf',
    type: 'Audit',
    caseId: 'C-1039',
    ownerUserId: 'usr_cli_sharma_b',
    tenantId: 'tenant_sharma_ent',
    uploadDate: '12 May 2025',
    aiProcessingStatus: 'Completed',
  },
];

const MOCK_AGENT_TASKS: AgentTaskRecord[] = [
  {
    id: 'TASK-501',
    caseId: 'C-1042',
    requestTitle: 'Analyzing your GST Return & Invoices...',
    agentType: 'Tax & Compliance AI Agent',
    status: 'RUNNING',
    progressPercent: 50,
    currentStep: 'Cross-checking against GST portal records...',
    steps: [
      { name: 'Reading document...', status: 'Completed' },
      { name: 'Extracting key details (income, GSTIN, dates)...', status: 'Completed' },
      { name: 'Cross-checking against GST portal records...', status: 'In progress...' },
      { name: 'Searching relevant case law...', status: 'Pending' },
      { name: 'Preparing draft response...', status: 'Pending' },
      { name: 'Finalizing results...', status: 'Pending' },
    ],
    createdUserId: 'usr_cli_rajesh',
    tenantId: 'tenant_abc_pvtltd',
    resultSummary: 'Your document has been analyzed. Please review the result below.',
    startedAt: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
  },
];

const MOCK_PROPERTIES: Record<string, PropertyRecord> = {
  usr_ten_neha: {
    id: 'PROP-302',
    userId: 'usr_ten_neha',
    propertyName: 'Sunrise Residency',
    unitNumber: 'Flat B-302, Sector 62, Noida',
    location: 'Sector 62, Noida, UP',
    leaseStatus: 'Active Lease',
    leaseEndDate: '31 Dec 2025',
    nextPaymentDueAmount: '₹ 25,000',
    nextPaymentDueDate: '1 Jun 2025',
    openRequestsCount: 1,
    recentActivity: [
      { date: '24 May', item: 'Maintenance Request - AC not working', status: 'Open' },
      { date: '20 May', item: 'Rent Payment - May 2025', status: 'Paid' },
      { date: '15 May', item: 'Document - Renewal Notice', status: 'Available' },
    ],
  },
};

const MOCK_AUDIT_RECORDS: AuditRecordItem[] = [
  {
    id: 'AUD-001',
    recordId: 'A-2025-01',
    entityName: 'ABC Pvt Ltd',
    auditType: 'GST Compliance',
    period: 'FY 2024-25',
    status: 'In Review',
    assignedAuditorId: 'usr_reg_gupta',
    scope: 'GST Filings and ITC Reconciliation',
    isRestricted: false,
  },
  {
    id: 'AUD-002',
    recordId: 'A-2025-02',
    entityName: 'Desai Holdings',
    auditType: 'Financial Audit',
    period: 'FY 2023-24',
    status: 'Open',
    assignedAuditorId: 'usr_reg_gupta',
    scope: 'Corporate Governance and Financial Ratios',
    isRestricted: false,
  },
  {
    id: 'AUD-003',
    recordId: 'A-2025-03',
    entityName: 'Mehta Foundation',
    auditType: 'Trust Compliance',
    period: 'FY 2024-25',
    status: 'Open',
    assignedAuditorId: 'usr_reg_gupta',
    scope: 'Foreign Contribution & Tax Exemption Audit',
    isRestricted: false,
  },
];

const MOCK_ACCESS_GRANTS: AccessGrantRecord[] = [
  {
    id: 'GRANT-101',
    userId: 'usr_adv_prakash',
    resourceType: 'case',
    resourceId: 'C-1042',
    status: 'APPROVED',
    grantedBy: 'usr_cli_rajesh',
    grantedAt: '2025-05-20',
    expiresAt: '2025-12-31',
  },
  {
    id: 'GRANT-102',
    userId: 'usr_adv_prakash',
    resourceType: 'case',
    resourceId: 'C-1038',
    status: 'APPROVED',
    grantedBy: 'usr_emp_vikram',
    grantedAt: '2025-05-21',
    expiresAt: '2025-12-31',
  },
  {
    id: 'GRANT-103',
    userId: 'usr_adv_prakash',
    resourceType: 'case',
    resourceId: 'C-1027',
    status: 'APPROVED',
    grantedBy: 'usr_emp_neha_p',
    grantedAt: '2025-05-18',
    expiresAt: '2025-12-31',
  },
];

export class RBACService {
  /**
   * Helper to resolve context from session or fallback role user
   */
  public getUserContext(userRoleOrId: string, email?: string): RBACUserContext {
    const roleKey = (userRoleOrId || 'client').toLowerCase();
    if (MOCK_USERS[roleKey]) {
      return MOCK_USERS[roleKey];
    }
    const found = Object.values(MOCK_USERS).find(u => u.id === userRoleOrId || u.email === email);
    if (found) return found;

    const userId = userRoleOrId.startsWith('usr_') ? userRoleOrId : `usr_${userRoleOrId}`;

    let inferredRole: UserRole = 'client';
    if (userRoleOrId.includes('emp')) inferredRole = 'employee';
    else if (userRoleOrId.includes('mgmt')) inferredRole = 'management';
    else if (userRoleOrId.includes('adv')) inferredRole = 'advocate';
    else if (userRoleOrId.includes('tenant')) inferredRole = 'tenant';
    else if (userRoleOrId.includes('reg')) inferredRole = 'regulator';
    else if (ALLOWED_ROLES.includes(roleKey as UserRole)) inferredRole = roleKey as UserRole;

    let tenantId = `tenant_${inferredRole}`;
    if (userId.includes('rajesh') || userId.includes('amit')) tenantId = 'tenant_abc_pvtltd';
    else if (userId.includes('sharma')) tenantId = 'tenant_sharma_ent';

    return {
      id: userId,
      name: email ? email.split('@')[0] : 'User',
      email: email || 'user@example.com',
      role: inferredRole,
      tenantId,
      organizationId: `org_${inferredRole}`,
    };
  }

  /**
   * STRICT AUTHORIZATION CHECK (Core Security Policy)
   * USER -> ROLE -> TENANT/ORGANIZATION -> RESOURCE -> OWNERSHIP/GRANT -> ACTION
   */
  public async verifyAccess(
    user: RBACUserContext,
    resourceType: 'case' | 'document' | 'agent_task' | 'property' | 'audit_record' | 'access_request',
    resourceId: string,
    action: 'read' | 'create' | 'update' | 'delete' | 'export' | 'approve'
  ): Promise<{ allowed: boolean; reason?: string }> {
    if (user.role === 'management') {
      if (resourceType === 'document' && action === 'read') {
        const doc = MOCK_DOCUMENTS.find(d => d.id === resourceId);
        if (doc?.isConfidential) {
          await this.logDeniedAccess(user, resourceType, resourceId, action, 'Management raw confidential document access restricted');
          return { allowed: false, reason: '403 Forbidden: Confidential document contents require explicit case access grant.' };
        }
      }
      return { allowed: true };
    }

    if (user.role === 'client') {
      if (resourceType === 'case') {
        const c = MOCK_CASES.find(item => item.id === resourceId);
        if (!c || (c.clientId !== user.id && c.tenantId !== user.tenantId)) {
          await this.logDeniedAccess(user, resourceType, resourceId, action, 'Cross-client case access attempt blocked');
          return { allowed: false, reason: '403 Forbidden: Clients cannot access records belonging to other entities.' };
        }
      } else if (resourceType === 'document') {
        const doc = MOCK_DOCUMENTS.find(item => item.id === resourceId);
        if (!doc || (doc.ownerUserId !== user.id && doc.tenantId !== user.tenantId)) {
          await this.logDeniedAccess(user, resourceType, resourceId, action, 'Cross-client document download attempt blocked');
          return { allowed: false, reason: '403 Forbidden: Unauthorized document access.' };
        }
      }
      return { allowed: true };
    }

    if (user.role === 'employee') {
      if (resourceType === 'case') {
        const c = MOCK_CASES.find(item => item.id === resourceId);
        if (!c || (c.assignedEmployeeId !== user.id && c.tenantId !== user.tenantId)) {
          await this.logDeniedAccess(user, resourceType, resourceId, action, 'Unassigned employee case access blocked');
          return { allowed: false, reason: '403 Forbidden: You can only access cases assigned to your workload.' };
        }
      }
      return { allowed: true };
    }

    if (user.role === 'advocate') {
      if (resourceType === 'case') {
        const hasGrant = MOCK_ACCESS_GRANTS.some(
          g => g.userId === user.id && g.resourceId === resourceId && g.status === 'APPROVED'
        );
        const c = MOCK_CASES.find(item => item.id === resourceId);
        if (!hasGrant && c?.assignedAdvocateId !== user.id) {
          await this.logDeniedAccess(user, resourceType, resourceId, action, 'Advocate unshared case access blocked');
          return { allowed: false, reason: '403 Forbidden: Advocates can only access explicitly shared cases.' };
        }
      }
      return { allowed: true };
    }

    if (user.role === 'tenant') {
      if (resourceType === 'property') {
        const p = MOCK_PROPERTIES[user.id];
        if (p && p.id !== resourceId && resourceId !== 'PROP-302') {
          await this.logDeniedAccess(user, resourceType, resourceId, action, 'Cross-tenant property access blocked');
          return { allowed: false, reason: '403 Forbidden: You can only view your own assigned property/lease.' };
        }
      }
      return { allowed: true };
    }

    if (user.role === 'regulator') {
      if (resourceType === 'audit_record') {
        const audit = MOCK_AUDIT_RECORDS.find(a => a.id === resourceId || a.recordId === resourceId);
        if (audit && audit.assignedAuditorId !== user.id && audit.isRestricted) {
          await this.logDeniedAccess(user, resourceType, resourceId, action, 'Unassigned auditor record access blocked');
          return { allowed: false, reason: '403 Forbidden: Record is outside your assigned audit scope.' };
        }
      }
      return { allowed: true };
    }

    return { allowed: true };
  }

  private async logDeniedAccess(
    user: RBACUserContext,
    resourceType: string,
    resourceId: string,
    action: string,
    reason: string
  ): Promise<void> {
    await auditService.log(
      'UNAUTHORIZED_ACCESS_ATTEMPT',
      user.name,
      `${resourceType}:${resourceId}`,
      'RBAC_Authorization',
      'user',
      user.id,
      { action, reason }
    );
  }

  /**
   * Data fetchers per role with strict backend isolation
   */
  public getDashboardDataForRole(userRoleOrId: string): any {
    const user = this.getUserContext(userRoleOrId);

    switch (user.role) {
      case 'employee':
        return {
          role: 'employee',
          user: user,
          header: {
            title: 'Welcome, Amit Sharma',
            subtitle: 'Here are your tasks for today.',
          },
          metrics: [
            { label: 'Assigned Cases', count: 4, color: 'sky' },
            { label: 'Pending Tasks', count: 7, color: 'amber' },
            { label: 'Documents to Review', count: 3, color: 'purple' },
            { label: 'Active AI Workflows', count: 1, color: 'emerald' },
          ],
          tasks: [
            { id: 'CASE-102', title: 'Review Financial statement', priority: 'High', status: 'Due Today', dueDate: 'Today' },
            { id: 'CASE-087', title: 'Extract key details from agreement', priority: 'Medium', status: 'Today', dueDate: 'Today' },
            { id: 'CASE-091', title: 'Prepare summary report', priority: 'Low', status: 'Tomorrow', dueDate: 'Tomorrow' },
            { id: 'CASE-105', title: 'Review GST Filing draft', priority: 'High', status: 'In Progress', dueDate: '12 Sep' },
          ],
          cases: [
            { id: 'CASE-102', client: 'ABC Pvt Ltd', type: 'Tax Review', status: 'In Progress' },
            { id: 'CASE-087', client: 'Sharma Enterprises', type: 'Legal Contract', status: 'In Review' },
            { id: 'CASE-091', client: 'Mehta Foundation', type: 'Compliance', status: 'Pending' },
            { id: 'CASE-105', client: 'Verma Traders', type: 'GST Audit', status: 'Open' },
          ],
          profile: {
            name: 'Amit Sharma',
            email: 'demo.employee@netfixai.test',
            role: 'Internal Employee',
            department: 'Operations',
            employeeId: 'EMP-001',
            organization: 'MARG Group',
            location: 'Hyderabad',
            phone: '+91 9000000001',
          },
        };

      case 'management':
        return {
          role: 'management',
          user: user,
          header: {
            title: 'Welcome, Rohan Mehta',
            subtitle: 'Organization Overview & Strategic Insights',
          },
          metrics: [
            { label: 'Active Matters', count: 24, change: '+12%', color: 'sky' },
            { label: 'High Risk', count: 5, change: '-20%', color: 'rose' },
            { label: 'Pending Approvals', count: 8, change: '+14%', color: 'amber' },
            { label: 'Total Value', count: '₹42.5 Cr', change: '+8%', color: 'emerald' },
          ],
          mattersByStatus: [
            { name: 'Active', count: 24, color: '#06B6D4' },
            { name: 'In Review', count: 8, color: '#6366F1' },
            { name: 'Resolved', count: 16, color: '#10B981' },
            { name: 'On Hold', count: 4, color: '#F59E0B' },
          ],
          topPriorities: [
            { id: 'PRIO-01', title: 'Approve Q3 Financial Compliance Report', status: 'Pending' },
            { id: 'PRIO-02', title: 'Review High-Risk Litigation Exposure (#CASE-1042)', status: 'In Review' },
            { id: 'PRIO-03', title: 'Budget Allocation for External Legal Counsel', status: 'Draft' },
            { id: 'PRIO-04', title: 'New Client Onboarding Sign-off (MARG Ventures)', status: 'Approved' },
          ],
          profile: {
            name: 'Rohan Mehta',
            email: 'demo.management@netfixai.test',
            role: 'Management / Executive',
            designation: 'Executive Director',
            organization: 'MARG Group',
            location: 'Hyderabad',
            phone: '+91 9000000002',
          },
        };

      case 'advocate':
        return {
          role: 'advocate',
          user: user,
          header: {
            title: 'Welcome, Ananya Rao',
            subtitle: 'Your legal workspace for case tools & research',
          },
          metrics: [
            { label: 'Active Matters', count: 5, color: 'sky' },
            { label: 'Upcoming Deadlines', count: 3, color: 'amber' },
            { label: 'Evidence Items', count: 12, color: 'purple' },
            { label: 'Research Notes', count: 8, color: 'emerald' },
          ],
          upcomingDeadlines: [
            { id: 'MAT-204', title: 'File written submission', detail: 'Client vs ABC Corp', dueDate: '25 Sep 2025' },
            { id: 'MAT-178', title: 'Court hearing', detail: 'High Court', dueDate: '28 Sep 2025' },
            { id: 'MAT-166', title: 'Reply to notice', detail: 'Notice #166', dueDate: '02 Oct 2025' },
          ],
          matters: [
            { id: 'MAT-204', title: 'Client vs ABC Corp Commercial Suit', status: 'Pleading Stage' },
            { id: 'MAT-178', title: 'Tax Appeal before High Court Bench', status: 'Hearing Scheduled' },
            { id: 'MAT-166', title: 'Property Partition Dispute Defense', status: 'Notice Reply' },
            { id: 'MAT-150', title: 'Arbitration Proceedings for Real Estate Contract', status: 'Evidence Review' },
            { id: 'MAT-120', title: 'Regulatory Compliance Notice Response', status: 'Drafting' },
          ],
          profile: {
            name: 'Ananya Rao',
            email: 'demo.advocate@netfixai.test',
            role: 'Advocate / External Counsel',
            designation: 'Senior Legal Counsel',
            barId: 'ADV-001',
            organization: 'MARG Legal Associates',
            location: 'Hyderabad',
            phone: '+91 9000000003',
          },
        };

      case 'client':
        return {
          role: 'client',
          user: user,
          header: {
            title: 'Welcome, Vikram Reddy',
            subtitle: 'Track progress. Access documents. Stay informed.',
          },
          metrics: [
            { label: 'Active Matters', count: 2, color: 'sky' },
            { label: 'Shared Documents', count: 6, color: 'purple' },
            { label: 'Pending Approvals', count: 2, color: 'amber' },
            { label: 'Messages', count: 3, color: 'emerald' },
          ],
          recentUpdates: [
            { id: 'MAT-301', title: 'Document shared by legal team', time: '2 hours ago' },
            { id: 'MAT-301', title: 'Status updated to In Progress', time: '1 day ago' },
            { id: 'MAT-299', title: 'Approval requested for settlement draft', time: '2 days ago' },
          ],
          matters: [
            { id: 'MAT-301', title: 'Corporate Structuring & Tax Advisory', status: 'In Progress' },
            { id: 'MAT-299', title: 'Commercial Lease Agreement Finalization', status: 'Pending Approval' },
          ],
          profile: {
            name: 'Vikram Reddy',
            email: 'demo.client@netfixai.test',
            role: 'Client',
            clientId: 'CLI-001',
            organization: 'MARG Client Services',
            location: 'Hyderabad',
            phone: '+91 9000000004',
          },
        };

      case 'tenant':
        return {
          role: 'tenant',
          user: user,
          header: {
            title: 'Welcome, Arjun Patel',
            subtitle: 'Manage your properties, agreements, and requests.',
          },
          metrics: [
            { label: 'Properties', count: 3, color: 'sky' },
            { label: 'Active Inquiries', count: 4, color: 'indigo' },
            { label: 'Agreements', count: 2, color: 'emerald' },
            { label: 'Payments', count: 3, color: 'amber' },
          ],
          recentActivity: [
            { title: 'Agreement signed', detail: 'Riverside Tower - Unit 501', time: '1 day ago' },
            { title: 'Payment processed', detail: '₹5,00,000', time: '2 days ago' },
            { title: 'New property available', detail: 'Maple Business Park', time: '3 days ago' },
          ],
          properties: [
            { id: 'PROP-01', name: 'Riverside Tower - Unit 501', type: 'Commercial', status: 'Leased' },
            { id: 'PROP-02', name: 'Maple Business Park - Suite 12', type: 'Office', status: 'Inquiry Active' },
            { id: 'PROP-03', name: 'Skyline Plaza - Retail 4', type: 'Retail', status: 'Agreement Pending' },
          ],
          profile: {
            name: 'Arjun Patel',
            email: 'demo.tenant@netfixai.test',
            role: 'Tenant / Buyer / Vendor',
            accountType: 'Buyer',
            accountId: 'TEN-001',
            organization: 'MARG Commercial Ventures',
            location: 'Hyderabad',
            phone: '+91 9000000005',
          },
        };

      case 'regulator':
        return {
          role: 'regulator',
          user: user,
          header: {
            title: 'Welcome, Priya Nair',
            subtitle: 'Monitor compliance and audit risk.',
          },
          metrics: [
            { label: 'Assigned Audits', count: 4, color: 'sky' },
            { label: 'Open Findings', count: 8, color: 'rose' },
            { label: 'Compliant Score', count: '76%', color: 'emerald' },
            { label: 'Reports Generated', count: 3, color: 'purple' },
          ],
          recentFindings: [
            { id: 'AUD-103', title: 'Missing document', severity: 'High', time: '1 day ago' },
            { id: 'AUD-101', title: 'Policy deviation', severity: 'Medium', time: '3 days ago' },
            { id: 'AUD-098', title: 'Incomplete disclosure', severity: 'Low', time: '5 days ago' },
          ],
          audits: [
            { id: 'AUD-103', entity: 'MARG Tech Corp', auditType: 'Financial & Tax', status: 'In Review' },
            { id: 'AUD-101', entity: 'MARG Legal Division', auditType: 'Governance', status: 'Findings Issued' },
            { id: 'AUD-098', entity: 'MARG Commercials', auditType: 'Regulatory Filings', status: 'Open' },
            { id: 'AUD-090', entity: 'MARG Assets', auditType: 'Property Compliance', status: 'Completed' },
          ],
          profile: {
            name: 'Priya Nair',
            email: 'demo.regulator@netfixai.test',
            role: 'Regulator / Auditor',
            designation: 'Compliance Auditor',
            auditorId: 'AUD-001',
            organization: 'MARG Compliance Division',
            location: 'Hyderabad',
            phone: '+91 9000000006',
          },
        };

      default:
        return this.getDashboardDataForRole('client');
    }
  }

  public getAgentTasks(userRoleOrId: string): AgentTaskRecord[] {
    const user = this.getUserContext(userRoleOrId);
    if (user.role === 'client') {
      return MOCK_AGENT_TASKS.filter(t => t.createdUserId === user.id || t.tenantId === user.tenantId);
    }
    return MOCK_AGENT_TASKS;
  }
}

export const rbacService = new RBACService();
