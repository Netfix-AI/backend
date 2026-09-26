import { Router, Response } from 'express';
import fs from 'fs';
import { requireUserAuth, AuthenticatedUserRequest } from '../middleware/authMiddleware.js';
import { ultronOrchestrator } from '../services/ultronOrchestrator.js';
import { supabaseService } from '../services/supabaseService.js';
import { pdfGeneratorService } from '../services/pdfGeneratorService.js';

const router = Router();

/**
 * POST /api/agent/test-orchestrator
 * Requirement 7: Test Endpoint invoking full Ultron loop with dummy agent
 */
router.post('/test-orchestrator', requireUserAuth, async (req: AuthenticatedUserRequest, res: Response) => {
  try {
    const { taskDescription, forceVerificationFailure, agentKey } = req.body || {};
    const requestingUserId = req.user?.id || 'usr_demo_cli';

    const orchestrateResult = await ultronOrchestrator.orchestrate({
      taskDescription: taskDescription || 'Test orchestration task for dummy agent',
      requestingUserId,
      forceVerificationFailure: Boolean(forceVerificationFailure),
      agentKey: agentKey || 'dummy',
    });

    return res.status(200).json({
      success: true,
      data: orchestrateResult,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'ORCHESTRATION_ERROR',
        message: err?.message || 'Failed to process orchestration test task.',
      },
    });
  }
});

/**
 * POST /api/agent/doc-intake
 * Phase 7: Document Intelligence Agent endpoint
 */
router.post('/doc-intake', requireUserAuth, async (req: AuthenticatedUserRequest, res: Response) => {
  try {
    const { documentId, taskDescription, forceVerificationFailure } = req.body || {};
    const requestingUserId = req.user?.id || 'usr_demo_cli';

    const orchestrateResult = await ultronOrchestrator.orchestrate({
      taskDescription: taskDescription || `Classify and extract fields for document ${documentId || 'DOC-1001'}`,
      requestingUserId,
      agentKey: 'doc_intake',
      documentId,
      forceVerificationFailure: Boolean(forceVerificationFailure),
    });

    return res.status(200).json({
      success: true,
      data: orchestrateResult,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'DOC_INTAKE_ERROR',
        message: err?.message || 'Failed to process document intelligence task.',
      },
    });
  }
});
/**
 * POST /api/agent/case-analysis
 * Phase 8: Case Intelligence Agent endpoint (Modules 20, 21, 23)
 */
router.post('/case-analysis', requireUserAuth, async (req: AuthenticatedUserRequest, res: Response) => {
  try {
    const { caseId, taskDescription, forceVerificationFailure } = req.body || {};
    const requestingUserId = req.user?.id || 'usr_emp_amit';

    const orchestrateResult = await ultronOrchestrator.orchestrate({
      taskDescription: taskDescription || `Analyze facts, issues, and synthesis for case ${caseId || 'C-1042'}`,
      requestingUserId,
      agentKey: 'case_analysis',
      caseId,
      forceVerificationFailure: Boolean(forceVerificationFailure),
    });

    return res.status(200).json({
      success: true,
      data: orchestrateResult,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'CASE_ANALYSIS_ERROR',
        message: err?.message || 'Failed to process case intelligence task.',
      },
    });
  }
});

/**
 * POST /api/agent/risk-compliance
 * Phase 9: Risk & Compliance / GST Intelligence Agent endpoint (Modules 24, 26)
 */
router.post('/risk-compliance', requireUserAuth, async (req: AuthenticatedUserRequest, res: Response) => {
  try {
    const { caseId, documentId, taskDescription, forceVerificationFailure } = req.body || {};
    const requestingUserId = req.user?.id || 'usr_emp_amit';

    const orchestrateResult = await ultronOrchestrator.orchestrate({
      taskDescription:
        taskDescription ||
        `Evaluate risk score, compliance deficiencies, and GST reconciliation for ${caseId || documentId || 'C-1042'}`,
      requestingUserId,
      agentKey: 'risk_compliance',
      caseId,
      documentId,
      forceVerificationFailure: Boolean(forceVerificationFailure),
    });

    return res.status(200).json({
      success: true,
      data: orchestrateResult,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'RISK_COMPLIANCE_ERROR',
        message: err?.message || 'Failed to process risk and compliance task.',
      },
    });
  }
});

/**
 * POST /api/agent/tax-intelligence
 * Phase 13: Tax & GST Intelligence Agent endpoint (Modules 10, 11, 16)
 */
router.post('/tax-intelligence', requireUserAuth, async (req: AuthenticatedUserRequest, res: Response) => {
  try {
    const { caseId, documentId, assessmentYear, taxRegime, taskDescription, forceVerificationFailure } = req.body || {};
    const requestingUserId = req.user?.id || 'usr_emp_amit';

    const orchestrateResult = await ultronOrchestrator.orchestrate({
      taskDescription:
        taskDescription ||
        `Compute Income Tax & GST compliance for ${assessmentYear || 'AY 2025-26'} (${taxRegime || 'new'} regime) for ${caseId || 'C-1042'}`,
      requestingUserId,
      agentKey: 'tax_intelligence',
      caseId,
      documentId,
      forceVerificationFailure: Boolean(forceVerificationFailure),
    });

    return res.status(200).json({
      success: true,
      data: orchestrateResult,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'TAX_INTELLIGENCE_ERROR',
        message: err?.message || 'Failed to process tax intelligence task.',
      },
    });
  }
});

/**
 * POST /api/agent/portal-automation
 * Phase 14: Portal Automation Worker Agent endpoint
 */
router.post('/portal-automation', requireUserAuth, async (req: AuthenticatedUserRequest, res: Response) => {
  try {
    const { caseId, documentId, portalName, actionType, taskDescription, forceVerificationFailure } = req.body || {};
    const requestingUserId = req.user?.id || 'usr_emp_amit';

    const orchestrateResult = await ultronOrchestrator.orchestrate({
      taskDescription:
        taskDescription ||
        `Automate portal workflow (${actionType || 'GSTR-3B Filing'}) on ${portalName || 'GST Portal'} for ${caseId || 'C-1042'}`,
      requestingUserId,
      agentKey: 'portal_automation',
      caseId,
      documentId,
      forceVerificationFailure: Boolean(forceVerificationFailure),
    });

    return res.status(200).json({
      success: true,
      data: orchestrateResult,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'PORTAL_AUTOMATION_ERROR',
        message: err?.message || 'Failed to process portal automation task.',
      },
    });
  }
});

/**
 * POST /api/agent/legal-research
 * Phase 10: Legal Research Agent endpoint (Modules 12, 13, 14)
 */
router.post('/legal-research', requireUserAuth, async (req: AuthenticatedUserRequest, res: Response) => {
  try {
    const { caseId, documentId, taskDescription, forceVerificationFailure } = req.body || {};
    const requestingUserId = req.user?.id || 'usr_emp_amit';

    const orchestrateResult = await ultronOrchestrator.orchestrate({
      taskDescription:
        taskDescription ||
        `Perform legal research, precedent analysis, and statutory retrieval for ${caseId || 'C-1042'}`,
      requestingUserId,
      agentKey: 'legal_research',
      caseId,
      documentId,
      forceVerificationFailure: Boolean(forceVerificationFailure),
    });

    return res.status(200).json({
      success: true,
      data: orchestrateResult,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'LEGAL_RESEARCH_ERROR',
        message: err?.message || 'Failed to process legal research task.',
      },
    });
  }
});

/**
 * POST /api/agent/citation-check
 * Phase 11: Citation Verification Agent endpoint (Module 27)
 */
router.post('/citation-check', requireUserAuth, async (req: AuthenticatedUserRequest, res: Response) => {
  try {
    const { caseId, documentId, citations, taskDescription, forceVerificationFailure } = req.body || {};
    const requestingUserId = req.user?.id || 'usr_emp_amit';

    const orchestrateResult = await ultronOrchestrator.orchestrate({
      taskDescription:
        taskDescription ||
        `Verify citation validity, legal database status, and authority scope for ${caseId || 'C-1042'}`,
      requestingUserId,
      agentKey: 'citation_check',
      caseId,
      documentId,
      citations,
      forceVerificationFailure: Boolean(forceVerificationFailure),
    });

    return res.status(200).json({
      success: true,
      data: orchestrateResult,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'CITATION_CHECK_ERROR',
        message: err?.message || 'Failed to process citation check task.',
      },
    });
  }
});

/**
 * POST /api/agent/drafting
 * Phase 12: Legal Drafting Agent endpoint (Module 15)
 */
router.post('/drafting', requireUserAuth, async (req: AuthenticatedUserRequest, res: Response) => {
  try {
    const { caseId, documentId, templateType, taskDescription, forceVerificationFailure } = req.body || {};
    const requestingUserId = req.user?.id || 'usr_emp_amit';

    const orchestrateResult = await ultronOrchestrator.orchestrate({
      taskDescription:
        taskDescription ||
        `Draft legal document (${templateType || 'Legal Response Notice'}) for ${caseId || 'C-1042'}`,
      requestingUserId,
      agentKey: 'drafting',
      caseId,
      documentId,
      templateType,
      forceVerificationFailure: Boolean(forceVerificationFailure),
    });

    return res.status(200).json({
      success: true,
      data: orchestrateResult,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'DRAFTING_ERROR',
        message: err?.message || 'Failed to process legal drafting task.',
      },
    });
  }
});

/**
 * POST /api/agent/adversarial
 * Phase 12: Adversarial Red-Team Agent endpoint (Module 25)
 */
router.post('/adversarial', requireUserAuth, async (req: AuthenticatedUserRequest, res: Response) => {
  try {
    const { caseId, documentId, draftContent, taskDescription, forceVerificationFailure } = req.body || {};
    const requestingUserId = req.user?.id || 'usr_emp_amit';

    const orchestrateResult = await ultronOrchestrator.orchestrate({
      taskDescription:
        taskDescription ||
        `Perform adversarial red-team stress testing and flaw analysis for ${caseId || 'C-1042'}`,
      requestingUserId,
      agentKey: 'adversarial',
      caseId,
      documentId,
      draftContent,
      forceVerificationFailure: Boolean(forceVerificationFailure),
    });

    return res.status(200).json({
      success: true,
      data: orchestrateResult,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: {
        code: 'ADVERSARIAL_ERROR',
        message: err?.message || 'Failed to process adversarial analysis task.',
      },
    });
  }
});

/**
 * GET /api/agent/reports/download/:id
 * Phase 3: Authenticated PDF Report Download Endpoint
 */
router.get('/reports/download/:id', requireUserAuth, async (req: AuthenticatedUserRequest, res: Response) => {
  try {
    const reportId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const user = req.user;

    const report = await supabaseService.getGeneratedReportById(reportId as string);
    if (!report) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'The requested report was not found.' },
      });
    }

    // Security / RBAC check: Client/Tenant can only download their own reports
    if (user && (user.role === 'client' || user.role === 'tenant')) {
      if (report.user_id !== user.id && report.user_id !== 'usr_demo_cli') {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You are not authorized to download this report.' },
        });
      }
    }

    // Stream PDF if file exists on disk
    if (fs.existsSync(report.file_path)) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${report.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf"`);
      return fs.createReadStream(report.file_path).pipe(res);
    }

    // Fallback on-the-fly PDF render if file missing
    const pdfBuffer = await pdfGeneratorService.generatePdfBuffer({
      taskId: report.task_id,
      userId: report.user_id,
      title: report.title,
      agentKey: 'comms_reporting',
      aiSource: report.ai_source,
      data: { report_id: report.id, task_id: report.task_id, generated_at: report.created_at },
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${report.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf"`);
    return res.status(200).send(pdfBuffer);
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'DOWNLOAD_ERROR', message: err?.message || 'Failed to download report.' },
    });
  }
});

/**
 * POST /api/agent/rag/search
 * Phase 4: RAG Foundation Embedding Cosine Similarity Search
 */
router.post('/rag/search', requireUserAuth, async (req: AuthenticatedUserRequest, res: Response) => {
  try {
    const { query, category, topK } = req.body || {};
    const userRole = req.user?.role || 'client';

    if (!query || typeof query !== 'string') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Parameter query string is required.' },
      });
    }

    const { ragService } = await import('../services/ragService.js');
    const results = await ragService.searchSimilarDocs(query, {
      topK: Number(topK) || 3,
      category,
      userRole,
    });

    return res.status(200).json({
      success: true,
      data: {
        query,
        count: results.length,
        results,
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'RAG_SEARCH_ERROR', message: err?.message || 'Failed to execute RAG similarity search.' },
    });
  }
});

/**
 * GET /api/agent/tasks
 * Phase 5: List live tasks for requesting user (RBAC isolated)
 */
router.get('/tasks', requireUserAuth, async (req: AuthenticatedUserRequest, res: Response) => {
  try {
    const user = req.user;
    const userId = user?.role === 'client' || user?.role === 'tenant' ? user.id : undefined;

    const tasks = await supabaseService.getAgentTasks(userId);
    return res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'TASKS_FETCH_ERROR', message: err?.message || 'Failed to fetch agent tasks.' },
    });
  }
});

/**
 * GET /api/agent/tasks/:id
 * Phase 5: Poll live task state by task ID (RBAC isolated)
 */
router.get('/tasks/:id', requireUserAuth, async (req: AuthenticatedUserRequest, res: Response) => {
  try {
    const taskId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const user = req.user;

    const task = await supabaseService.getAgentTaskById(taskId as string);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Agent task not found.' },
      });
    }

    // Security/RBAC check: Client and Tenant can only access their own tasks
    if (user && (user.role === 'client' || user.role === 'tenant')) {
      if (task.user_id && task.user_id !== user.id && task.user_id !== 'usr_demo_cli') {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'You are not authorized to view this task.' },
        });
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        task_id: task.id,
        status: task.status,
        current_step: task.current_step,
        output_summary: task.output_summary,
        ai_source: (task as any).ai_source || (task as any).aiSource || 'ai',
        human_review_status: task.human_review_status,
        created_at: task.created_at,
      },
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'TASK_FETCH_ERROR', message: err?.message || 'Failed to fetch task details.' },
    });
  }
});

export default router;


