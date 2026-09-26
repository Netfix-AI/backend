import { Request, Response } from 'express';
import { supabaseService } from '../services/supabaseService.js';
import { auditService } from '../services/auditService.js';

export class AdvancedAnalysisController {
  // ============================================================
  // MODULE 20: CASE FACT ENGINE
  // ============================================================

  static async extractFacts(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { case_id } = req.body;

      if (!case_id) {
        return res.status(400).json({ success: false, error: 'INVALID_INPUT: case_id is required' });
      }

      const c = await supabaseService.getCaseById(String(case_id));
      if (!c) {
        return res.status(404).json({ success: false, error: 'NOT_FOUND: Case not found' });
      }

      if (user.role === 'client' && c.client_id !== user.id) {
        return res.status(403).json({ success: false, error: 'FORBIDDEN: Access denied to case' });
      }

      const facts = await supabaseService.extractCaseFacts(String(case_id), user.id);

      const agentTask = await supabaseService.createAgentTask({
        agent_name: 'Case Fact Agent',
        user_id: user.id,
        case_id: String(case_id),
        input_summary: `Fact extraction for Case #${c.case_number}`,
        output_summary: `Extracted ${facts.length} candidate facts from case documents`,
        status: 'completed',
        human_review_status: 'pending',
      });

      await auditService.log(
        'FACT_EXTRACTION',
        user.first_name || user.email,
        String(case_id),
        'CaseFacts',
        'user',
        user.id,
        { count: facts.length }
      );

      return res.status(200).json({ success: true, data: { facts, agent_task: agentTask } });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  static async getCaseFacts(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const case_id = String(req.params.case_id);

      const c = await supabaseService.getCaseById(case_id);
      if (!c) {
        return res.status(404).json({ success: false, error: 'NOT_FOUND: Case not found' });
      }

      if (user.role === 'client' && c.client_id !== user.id) {
        return res.status(403).json({ success: false, error: 'FORBIDDEN: Access denied' });
      }

      let facts = await supabaseService.getCaseFacts(case_id);

      // Client visibility guard: Clients can ONLY see client-facing/verified facts if configured
      if (user.role === 'client') {
        facts = facts.filter(f => f.verified_by_human);
      }

      return res.status(200).json({ success: true, data: facts });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  static async verifyFact(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const id = String(req.params.id);

      if (user.role === 'client') {
        return res.status(403).json({ success: false, error: 'FORBIDDEN: Clients cannot verify internal case facts' });
      }

      const verified = await supabaseService.verifyCaseFact(id, user.id);
      if (!verified) {
        return res.status(404).json({ success: false, error: 'NOT_FOUND: Fact not found' });
      }

      await auditService.log(
        'FACT_VERIFICATION',
        user.first_name || user.email,
        id,
        'CaseFacts',
        'user',
        user.id,
        { fact_id: id }
      );

      return res.status(200).json({ success: true, data: verified });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  // ============================================================
  // MODULE 21: CHRONOLOGY ENGINE
  // ============================================================

  static async getChronology(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const case_id = String(req.params.id);

      const c = await supabaseService.getCaseById(case_id);
      if (!c) {
        return res.status(404).json({ success: false, error: 'NOT_FOUND: Case not found' });
      }

      if (user.role === 'client' && c.client_id !== user.id) {
        return res.status(403).json({ success: false, error: 'FORBIDDEN: Access denied to case chronology' });
      }

      const events = await supabaseService.getCaseChronology(case_id);
      return res.status(200).json({ success: true, data: events });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  // ============================================================
  // MODULE 22: EVIDENCE MANAGEMENT
  // ============================================================

  static async getEvidence(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const case_id = String(req.params.case_id);

      const c = await supabaseService.getCaseById(case_id);
      if (!c) {
        return res.status(404).json({ success: false, error: 'NOT_FOUND: Case not found' });
      }

      if (user.role === 'client' && c.client_id !== user.id) {
        return res.status(403).json({ success: false, error: 'FORBIDDEN: Access denied' });
      }

      const items = await supabaseService.getEvidenceItems(case_id);
      return res.status(200).json({ success: true, data: items });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  static async addEvidence(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { case_id, document_id, evidence_type, linked_fact_id } = req.body;

      if (!case_id || !document_id) {
        return res.status(400).json({ success: false, error: 'INVALID_INPUT: case_id and document_id are required' });
      }

      if (user.role === 'client') {
        return res.status(403).json({ success: false, error: 'FORBIDDEN: Clients cannot manage litigation evidence logs' });
      }

      const item = await supabaseService.addEvidenceItem({
        case_id: String(case_id),
        document_id: String(document_id),
        evidence_type: evidence_type ? String(evidence_type) as any : 'Contract',
        linked_fact_id: linked_fact_id ? String(linked_fact_id) : undefined,
        added_by: user.id,
      });

      await auditService.log(
        'EVIDENCE_ADD',
        user.first_name || user.email,
        item.id,
        'Evidence',
        'user',
        user.id,
        { case_id, document_id }
      );

      return res.status(200).json({ success: true, data: item });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  // ============================================================
  // MODULE 23: CONTRADICTION ANALYSIS
  // ============================================================

  static async getContradictions(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const case_id = String(req.params.case_id);

      const c = await supabaseService.getCaseById(case_id);
      if (!c) {
        return res.status(404).json({ success: false, error: 'NOT_FOUND: Case not found' });
      }

      if (user.role === 'client') {
        return res.status(403).json({ success: false, error: 'FORBIDDEN: Internal contradiction reasoning is confidential' });
      }

      const list = await supabaseService.getContradictions(case_id);
      return res.status(200).json({ success: true, data: list });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  static async resolveContradiction(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const id = String(req.params.id);
      const { resolution_notes } = req.body;

      if (user.role === 'client') {
        return res.status(403).json({ success: false, error: 'FORBIDDEN: Clients cannot resolve internal contradictions' });
      }

      const resolved = await supabaseService.resolveContradiction(id, String(resolution_notes || 'Resolved'), user.id);
      if (!resolved) {
        return res.status(404).json({ success: false, error: 'NOT_FOUND: Contradiction not found' });
      }

      await auditService.log(
        'CONTRADICTION_RESOLVE',
        user.first_name || user.email,
        id,
        'Contradictions',
        'user',
        user.id,
        { id }
      );

      return res.status(200).json({ success: true, data: resolved });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  // ============================================================
  // MODULE 24: LIMITATION & DEADLINE ENGINE
  // ============================================================

  static async getDeadlines(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const case_id = req.query.case_id ? String(req.query.case_id) : undefined;

      if (case_id) {
        const c = await supabaseService.getCaseById(case_id);
        if (user.role === 'client' && c?.client_id !== user.id) {
          return res.status(403).json({ success: false, error: 'FORBIDDEN: Access denied' });
        }
      }

      const list = await supabaseService.getDeadlines(case_id);
      return res.status(200).json({ success: true, data: list });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  static async createDeadline(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { case_id, title, deadline_type, due_date, days_remaining } = req.body;

      if (!title || !due_date) {
        return res.status(400).json({ success: false, error: 'INVALID_INPUT: title and due_date are required' });
      }

      const deadline = await supabaseService.createDeadline({
        case_id: case_id ? String(case_id) : 'case_gst_2026',
        title: String(title),
        deadline_type: deadline_type ? String(deadline_type) as any : 'compliance',
        due_date: String(due_date),
        days_remaining: days_remaining !== undefined ? Number(days_remaining) : 12,
        created_by: user.id,
      });

      await auditService.log(
        'DEADLINE_CREATE',
        user.first_name || user.email,
        deadline.id,
        'Deadlines',
        'user',
        user.id,
        { title }
      );

      return res.status(200).json({ success: true, data: deadline });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  // ============================================================
  // MODULE 25: ADVERSARIAL AI ENGINE
  // ============================================================

  static async runAdversarialReview(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { draft_id, case_id } = req.body;

      if (!draft_id || !case_id) {
        return res.status(400).json({ success: false, error: 'INVALID_INPUT: draft_id and case_id are required' });
      }

      if (user.role === 'client') {
        return res.status(403).json({ success: false, error: 'FORBIDDEN: Clients cannot execute internal adversarial legal stress-tests' });
      }

      const review = await supabaseService.runAdversarialReview(String(draft_id), String(case_id), user.id);

      const agentTask = await supabaseService.createAgentTask({
        agent_name: 'Adversarial Review Agent',
        user_id: user.id,
        case_id: String(case_id),
        input_summary: `Adversarial Check on Draft #${draft_id}`,
        output_summary: `Identified 3 potential counterarguments and 2 argument weaknesses`,
        status: 'completed',
        human_review_status: 'pending',
      });

      await auditService.log(
        'ADVERSARIAL_CHECK',
        user.first_name || user.email,
        review.id,
        'AdversarialAI',
        'user',
        user.id,
        { draft_id }
      );

      return res.status(200).json({ success: true, data: { review, agent_task: agentTask } });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  static async getAdversarialReviews(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const draft_id = String(req.params.draft_id);

      if (user.role === 'client') {
        return res.status(403).json({ success: false, error: 'FORBIDDEN: Access denied' });
      }

      const reviews = await supabaseService.getAdversarialReviews(draft_id);
      return res.status(200).json({ success: true, data: reviews });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  // ============================================================
  // MODULE 26: RISK & EXPOSURE ANALYSIS
  // ============================================================

  static async getRiskAssessment(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const case_id = String(req.params.case_id);

      const c = await supabaseService.getCaseById(case_id);
      if (!c) {
        return res.status(404).json({ success: false, error: 'NOT_FOUND: Case not found' });
      }

      if (user.role === 'client') {
        return res.status(403).json({ success: false, error: 'FORBIDDEN: Internal risk exposure score is confidential' });
      }

      const risk = await supabaseService.getRiskAssessment(case_id);
      return res.status(200).json({ success: true, data: risk });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  // ============================================================
  // MODULE 27: CITATION & SOURCE VERIFICATION
  // ============================================================

  static async getCitations(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const source_content_id = String(req.params.source_content_id);

      const citations = await supabaseService.getCitationChecks(source_content_id);
      return res.status(200).json({ success: true, data: citations });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  // ============================================================
  // MODULE 28: REPORTING SYSTEM
  // ============================================================

  static async getCaseSummaryReport(req: Request, res: Response) {
    try {
      const user = (req as any).user;

      const summary = await supabaseService.getCaseSummaryReport(user.id, user.role);
      return res.status(200).json({ success: true, data: summary });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  static async exportReport(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { report_type, filters } = req.body;

      const report = await supabaseService.exportReport(String(report_type || 'case_summary'), filters, user.id);

      await auditService.log(
        'REPORT_EXPORT',
        user.first_name || user.email,
        report.id,
        'Reporting',
        'user',
        user.id,
        { report_type }
      );

      return res.status(200).json({ success: true, data: report });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }
}
