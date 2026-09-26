import { Router } from 'express';
import { AdvancedAnalysisController } from '../controllers/advancedAnalysisController.js';
import { requireUserAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireUserAuth as any);

// Module 20: Case Fact Engine
router.post('/case-facts/extract', AdvancedAnalysisController.extractFacts as any);
router.get('/case-facts/:case_id', AdvancedAnalysisController.getCaseFacts as any);
router.patch('/case-facts/:id/verify', AdvancedAnalysisController.verifyFact as any);

// Module 21: Chronology Engine
router.get('/cases/:id/chronology', AdvancedAnalysisController.getChronology as any);

// Module 22: Evidence Management
router.post('/evidence', AdvancedAnalysisController.addEvidence as any);
router.get('/evidence/:case_id', AdvancedAnalysisController.getEvidence as any);

// Module 23: Contradiction Analysis
router.get('/contradictions/:case_id', AdvancedAnalysisController.getContradictions as any);
router.patch('/contradictions/:id/resolve', AdvancedAnalysisController.resolveContradiction as any);

// Module 24: Limitation & Deadline Engine
router.get('/deadlines', AdvancedAnalysisController.getDeadlines as any);
router.post('/deadlines', AdvancedAnalysisController.createDeadline as any);

// Module 25: Adversarial AI Engine
router.post('/adversarial-review/run', AdvancedAnalysisController.runAdversarialReview as any);
router.get('/adversarial-review/:draft_id', AdvancedAnalysisController.getAdversarialReviews as any);

// Module 26: Risk & Exposure Analysis
router.get('/risk/:case_id', AdvancedAnalysisController.getRiskAssessment as any);

// Module 27: Citation & Source Verification
router.get('/citations/:source_content_id', AdvancedAnalysisController.getCitations as any);

// Module 28: Reporting System
router.get('/reports/case-summary', AdvancedAnalysisController.getCaseSummaryReport as any);
router.post('/reports/export', AdvancedAnalysisController.exportReport as any);

export default router;
