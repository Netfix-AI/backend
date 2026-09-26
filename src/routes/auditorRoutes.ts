import { Router, Request, Response } from 'express';

const router = Router();

// Mock / DB auditor data scoped to AUD-001
const reviews = [
  {
    id: 'AUD-103',
    entity: 'MARG Tech Corp',
    type: 'Financial & Tax Audit',
    status: 'In Review',
    period: '01 Apr 2025 – 31 Mar 2026',
    assignedDate: '05 Sep 2025',
    dueDate: '30 Sep 2025',
    progress: 72,
    evidenceVerified: 24,
    evidenceTotal: 31,
    findings: { total: 5, critical: 1, high: 2, medium: 2, low: 0 },
    riskLevel: 'High',
    complianceScore: 81,
    lastActivity: '2 hours ago',
    scope: ['GST Compliance', 'Income Tax', 'TDS', 'Financial Records'],
    reviewer: 'Priya Nair',
    milestones: [
      { text: 'Evidence collection completed', time: '4 days ago' },
      { text: 'Control testing in progress', time: '2 days ago' },
      { text: 'Finding FND-104 escalated', time: 'Yesterday' },
      { text: 'Management response received', time: '4 hours ago' }
    ]
  },
  {
    id: 'AUD-101',
    entity: 'MARG Legal Division',
    type: 'Governance Compliance',
    status: 'Findings Issued',
    period: '01 Jan 2025 – 31 Dec 2025',
    assignedDate: '12 Aug 2025',
    dueDate: '15 Oct 2025',
    progress: 65,
    evidenceVerified: 20,
    evidenceTotal: 30,
    findings: { total: 5, critical: 0, high: 2, medium: 3, low: 0 },
    riskLevel: 'Medium',
    complianceScore: 78,
    lastActivity: '1 day ago',
    scope: ['Board Resolutions', 'ESOP Registry', 'Corporate Governance'],
    reviewer: 'Priya Nair',
    milestones: [
      { text: 'Draft audit report generated', time: '3 days ago' },
      { text: 'Management clarification requested', time: '1 day ago' }
    ]
  },
  {
    id: 'AUD-095',
    entity: 'MARG Commercials',
    type: 'Regulatory Filings',
    status: 'Open',
    period: '01 Jul 2025 – 31 Dec 2025',
    assignedDate: '10 Sep 2025',
    dueDate: '30 Nov 2025',
    progress: 20,
    evidenceVerified: 4,
    evidenceTotal: 21,
    findings: { total: 0, critical: 0, high: 0, medium: 0, low: 0 },
    riskLevel: 'Low',
    complianceScore: 92,
    lastActivity: '3 days ago',
    scope: ['ROC Filings', 'RBI Compliance', 'FDI Reporting'],
    reviewer: 'Priya Nair',
    milestones: [
      { text: 'Audit scope approved', time: '5 days ago' }
    ]
  }
];

const findings = [
  { id: 'FND-104', title: 'GST invoice missing', reviewId: 'AUD-103', severity: 'Critical', risk: 'High', owner: 'Finance', dueDate: '20 Sep 2025', status: 'Open', detail: 'Tax invoice missing for GST claim #1042', requirement: 'REQ-GST-014', control: 'CTL-021' },
  { id: 'FND-102', title: 'Policy deviation', reviewId: 'AUD-101', severity: 'High', risk: 'Medium', owner: 'Legal', dueDate: '25 Sep 2025', status: 'Under Remediation', detail: 'Escrow clause mismatch in agreement #301', requirement: 'REQ-GOV-008', control: 'CTL-014' },
  { id: 'FND-098', title: 'Incomplete disclosure', reviewId: 'AUD-103', severity: 'Medium', risk: 'Medium', owner: 'Accounts', dueDate: '30 Sep 2025', status: 'Open', detail: 'Director interest annexure incomplete', requirement: 'REQ-FIN-003', control: 'CTL-008' },
  { id: 'FND-091', title: 'Access control gap', reviewId: 'AUD-105', severity: 'High', risk: 'High', owner: 'IT', dueDate: '28 Sep 2025', status: 'Under Review', detail: 'Privileged access log review pending for 60 days', requirement: 'REQ-SEC-012', control: 'CTL-033' },
  { id: 'FND-081', title: 'TDS mismatch', reviewId: 'AUD-103', severity: 'Low', risk: 'Low', owner: 'Finance', dueDate: '05 Oct 2025', status: 'Closed', detail: 'Form 26AS mismatch reconciled', requirement: 'REQ-TAX-002', control: 'CTL-005' },
];

const evidence = [
  { id: 'EVD-984', name: 'GST_Return_Q3.pdf', type: 'Tax Document', reviewId: 'AUD-103', control: 'CTL-021', status: 'Verified', integrity: 'Valid', uploadedDate: '12 Sep 2025' },
  { id: 'EVD-923', name: 'TDS_Report.xlsx', type: 'Financial Record', reviewId: 'AUD-103', control: 'CTL-005', status: 'Pending', integrity: 'Valid', uploadedDate: '10 Sep 2025' },
  { id: 'EVD-902', name: 'Board_Resolution.pdf', type: 'Governance', reviewId: 'AUD-101', control: 'CTL-014', status: 'Rejected', integrity: 'Invalid', uploadedDate: '08 Sep 2025' },
  { id: 'EVD-881', name: 'Bank_Statement.pdf', type: 'Financial Record', reviewId: 'AUD-103', control: 'CTL-003', status: 'Verified', integrity: 'Valid', uploadedDate: '07 Sep 2025' },
  { id: 'EVD-850', name: 'Audit_Certificate.pdf', type: 'Statutory Audit', reviewId: 'AUD-095', control: 'CTL-018', status: 'Pending', integrity: 'Valid', uploadedDate: '06 Sep 2025' },
];

const complianceRequirements = [
  { id: 'REQ-GST-014', requirement: 'GST Return Filing', regulation: 'GST Act', control: 'CTL-021', evidenceCount: '3/3', status: 'Compliant', risk: 'Low', lastTested: '12 Sep 2025', nextReview: '12 Mar 2026' },
  { id: 'REQ-IT-012', requirement: 'TDS Reconciliation', regulation: 'Income Tax Act', control: 'CTL-005', evidenceCount: '2/4', status: 'Partially Compliant', risk: 'Medium', lastTested: '10 Sep 2025', nextReview: '10 Mar 2026' },
  { id: 'REQ-COMP-021', requirement: 'Board Resolution', regulation: 'Companies Act', control: 'CTL-014', evidenceCount: '1/3', status: 'Non-Compliant', risk: 'High', lastTested: '08 Sep 2025', nextReview: '08 Mar 2026' },
  { id: 'REQ-FIN-003', requirement: 'Financial Statements', regulation: 'Companies Act', control: 'CTL-003', evidenceCount: '4/4', status: 'Compliant', risk: 'Low', lastTested: '15 Sep 2025', nextReview: '15 Mar 2026' },
  { id: 'REQ-AUD-001', requirement: 'Statutory Audit', regulation: 'Audit Regulations', control: 'CTL-018', evidenceCount: '2/2', status: 'Under Review', risk: 'High', lastTested: '--', nextReview: '30 Sep 2025' },
];

const risks = [
  { id: 'RSK-042', title: 'Financial Misstatement', category: 'Financial', inherentRisk: 'High', residualRisk: 'High', owner: 'CFO', status: 'Open' },
  { id: 'RSK-038', title: 'Regulatory Non-Compliance', category: 'Regulatory', inherentRisk: 'High', residualRisk: 'Medium', owner: 'Compliance', status: 'Mitigated' },
  { id: 'RSK-027', title: 'Data Security Breach', category: 'Operational', inherentRisk: 'High', residualRisk: 'Medium', owner: 'IT', status: 'Open' },
  { id: 'RSK-019', title: 'Contract Control Failure', category: 'Legal', inherentRisk: 'Medium', residualRisk: 'Low', owner: 'Internal Audit', status: 'Closed' },
  { id: 'RSK-012', title: 'Fraud Risk', category: 'Financial', inherentRisk: 'Medium', residualRisk: 'Low', owner: 'Finance', status: 'Open' },
];

const reports = [
  { id: 'RPT-019', name: 'Compliance Summary', type: 'Compliance', reviewId: 'AUD-103', period: 'Q3 2025', status: 'Final', generatedDate: '15 Sep 2025' },
  { id: 'RPT-018', name: 'Audit Findings Report', type: 'Findings', reviewId: 'AUD-103', period: 'Q3 2025', status: 'Awaiting Review', generatedDate: '12 Sep 2025' },
  { id: 'RPT-017', name: 'Risk Assessment', type: 'Risk', reviewId: 'AUD-101', period: 'Q2 2025', status: 'Draft', generatedDate: '10 Sep 2025' },
  { id: 'RPT-016', name: 'Control Effectiveness', type: 'Controls', reviewId: 'AUD-101', period: 'Q2 2025', status: 'Final', generatedDate: '08 Sep 2025' },
  { id: 'RPT-015', name: 'Evidence Register', type: 'Evidence', reviewId: 'AUD-095', period: 'Q3 2025', status: 'Final', generatedDate: '05 Sep 2025' },
];

router.get('/dashboard', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      auditorScope: 'AUD-001',
      reviewPeriod: '01 Sep 2025 — 30 Sep 2025',
      metrics: {
        assignedReviews: 4,
        openFindings: 8,
        criticalFindings: 2,
        complianceScore: 76,
        evidenceVerifiedPercent: 82,
        evidenceVerifiedCount: '38/46',
        overdueActions: 3,
        reportsPending: 3,
      },
      complianceOverview: { compliant: 76, partiallyCompliant: 14, nonCompliant: 6, notApplicable: 4 },
      findingsBySeverity: { critical: 2, high: 3, medium: 2, low: 1 },
      recentActivity: [
        { title: 'Evidence verified', detail: 'EVD-984 Tax Document verified', time: '2 hours ago' },
        { title: 'Finding updated', detail: 'FND-102 severity changed to High', time: '1 day ago' },
        { title: 'Report generated', detail: 'RPT-019 Compliance Summary', time: '2 days ago' },
        { title: 'Control tested', detail: 'CTL-021 - Result: Effective', time: '3 days ago' },
      ]
    }
  });
});

router.get('/reviews', (_req: Request, res: Response) => {
  res.json({ success: true, data: reviews });
});

router.get('/reviews/:id', (req: Request, res: Response) => {
  const review = reviews.find(r => r.id === req.params.id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
  res.json({ success: true, data: review });
});

router.get('/compliance', (_req: Request, res: Response) => {
  res.json({ success: true, data: complianceRequirements });
});

router.get('/evidence', (_req: Request, res: Response) => {
  res.json({ success: true, data: evidence });
});

router.get('/findings', (_req: Request, res: Response) => {
  res.json({ success: true, data: findings });
});

router.get('/risks', (_req: Request, res: Response) => {
  res.json({ success: true, data: risks });
});

router.get('/reports', (_req: Request, res: Response) => {
  res.json({ success: true, data: reports });
});

export default router;
