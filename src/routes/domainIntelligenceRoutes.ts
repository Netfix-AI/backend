import { Router } from 'express';
import { DomainIntelligenceController } from '../controllers/domainIntelligenceController.js';
import { requireUserAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireUserAuth as any);

// Module 10: GST Intelligence Engine
router.post('/gst/analyze', DomainIntelligenceController.analyzeGst as any);
router.get('/gst/filings/:entity_id', DomainIntelligenceController.getGstFilings as any);
router.patch('/gst/filings/:id/approve', DomainIntelligenceController.approveGstFiling as any);

// Module 11: Income Tax Intelligence Engine
router.post('/income-tax/analyze', DomainIntelligenceController.analyzeIncomeTax as any);
router.get('/income-tax/filings/:entity_id', DomainIntelligenceController.getIncomeTaxFilings as any);
router.patch('/income-tax/filings/:id/approve', DomainIntelligenceController.approveIncomeTaxFiling as any);

// Module 12 & 13: Knowledge Base & Legal Research
router.get('/knowledge/search', DomainIntelligenceController.searchKnowledge as any);
router.post('/legal-research/query', DomainIntelligenceController.queryLegalResearch as any);
router.get('/legal-research/history', DomainIntelligenceController.getResearchHistory as any);

// Module 14: Legal Knowledge Graph
router.get('/knowledge-graph/related/:node_id', DomainIntelligenceController.getKnowledgeGraphRelated as any);

// Module 15: Legal Drafting Engine
router.post('/drafting/generate', DomainIntelligenceController.generateDraft as any);
router.get('/drafting/:case_id', DomainIntelligenceController.getDrafts as any);
router.patch('/drafting/:id', DomainIntelligenceController.updateDraft as any);

// Module 16: Tally / Financial Reconciliation
router.post('/reconciliation/run', DomainIntelligenceController.runReconciliation as any);
router.get('/reconciliation/:entity_id', DomainIntelligenceController.getReconciliationReports as any);

// Module 17: Email Intelligence
router.post('/email-intake', DomainIntelligenceController.intakeEmail as any);
router.get('/email-intake/:case_id', DomainIntelligenceController.getEmailIntakeByCase as any);

// Module 18: Property Management
router.get('/properties', DomainIntelligenceController.getProperties as any);
router.get('/properties/:id', DomainIntelligenceController.getPropertyById as any);
router.get('/leases/:tenant_id', DomainIntelligenceController.getLeasesByTenant as any);

// Module 19: Project Management
router.get('/projects', DomainIntelligenceController.getProjects as any);
router.get('/projects/:id', DomainIntelligenceController.getProjectById as any);
router.get('/projects/:id/milestones', DomainIntelligenceController.getProjectMilestones as any);

export default router;
