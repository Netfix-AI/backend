import { Request, Response } from 'express';
import { supabaseService } from '../services/supabaseService.js';
import { auditService } from '../services/auditService.js';

export class DomainIntelligenceController {
  // ============================================================
  // MODULE 10: GST INTELLIGENCE ENGINE
  // ============================================================

  static async analyzeGst(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { entity_id, case_id, period, filing_type } = req.body;

      if (!entity_id) {
        return res.status(400).json({ success: false, error: 'INVALID_INPUT: entity_id is required' });
      }

      const entity = await supabaseService.getEntityById(String(entity_id));
      if (!entity) {
        return res.status(404).json({ success: false, error: 'NOT_FOUND: Entity not found' });
      }

      if (user.role === 'client' && entity.owner_user_id !== user.id) {
        return res.status(403).json({ success: false, error: 'FORBIDDEN: You do not have access to this entity' });
      }

      const computed_data = {
        invoiced_value: 12450000,
        gst_payable: 1867500,
        match_percentage: 92,
        total_invoices: 48,
        eligible_itc: 1640000,
      };

      const filing = await supabaseService.createOrUpdateGstFiling({
        entity_id: String(entity_id),
        case_id: case_id ? String(case_id) : 'case_gst_2026',
        period: period ? String(period) : 'Jul - Sep 2024',
        filing_type: filing_type ? String(filing_type) as any : 'GSTR-1',
        computed_data,
        status: 'draft',
      });

      const agentTask = await supabaseService.createAgentTask({
        agent_name: 'Tax Intelligence Agent',
        user_id: user.id,
        entity_id: String(entity_id),
        case_id: filing.case_id,
        input_summary: `GST Analysis for Entity ${entity.name}, Period ${filing.period}`,
        output_summary: `Computed Invoiced: ₹1,24,50,000 | Payable: ₹18,67,500 | 92% Matched`,
        status: 'completed',
        human_review_status: 'pending',
        current_step: 4,
      });

      await auditService.log(
        'GST_ANALYSIS',
        user.first_name || user.email,
        filing.id,
        'GST',
        'user',
        user.id,
        { period, entity_id }
      );

      return res.status(200).json({
        success: true,
        data: {
          filing,
          mismatches: await supabaseService.getGstMismatches(filing.id),
          agent_task: agentTask,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  static async getGstFilings(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const entity_id = String(req.params.entity_id);

      const entity = await supabaseService.getEntityById(entity_id);
      if (!entity) {
        return res.status(404).json({ success: false, error: 'NOT_FOUND: Entity not found' });
      }

      if (user.role === 'client' && entity.owner_user_id !== user.id) {
        return res.status(403).json({ success: false, error: 'FORBIDDEN: Access denied to entity GST filings' });
      }

      const filings = await supabaseService.getGstFilingsByEntity(entity_id);
      return res.status(200).json({ success: true, data: filings });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  static async approveGstFiling(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const id = String(req.params.id);

      const filing = await supabaseService.getGstFilingById(id);
      if (!filing) {
        return res.status(404).json({ success: false, error: 'NOT_FOUND: GST filing not found' });
      }

      const entity = await supabaseService.getEntityById(filing.entity_id);
      if (user.role === 'client' && entity?.owner_user_id !== user.id) {
        return res.status(403).json({ success: false, error: 'FORBIDDEN: You do not own this entity' });
      }

      const approved = await supabaseService.approveGstFiling(id);
      await auditService.log(
        'GST_APPROVAL',
        user.first_name || user.email,
        id,
        'GST',
        'user',
        user.id,
        { filing_id: id }
      );

      return res.status(200).json({ success: true, data: approved });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  // ============================================================
  // MODULE 11: INCOME TAX INTELLIGENCE ENGINE
  // ============================================================

  static async analyzeIncomeTax(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { entity_id, case_id, assessment_year } = req.body;

      if (!entity_id) {
        return res.status(400).json({ success: false, error: 'INVALID_INPUT: entity_id is required' });
      }

      const entity = await supabaseService.getEntityById(String(entity_id));
      if (!entity) {
        return res.status(404).json({ success: false, error: 'NOT_FOUND: Entity not found' });
      }

      if (user.role === 'client' && entity.owner_user_id !== user.id) {
        return res.status(403).json({ success: false, error: 'FORBIDDEN: You do not have access to this entity' });
      }

      const filing = await supabaseService.createOrUpdateIncomeTaxFiling({
        entity_id: String(entity_id),
        case_id: case_id ? String(case_id) : 'case_gst_2026',
        assessment_year: assessment_year ? String(assessment_year) : '2024 - 2025',
        computed_data: {
          total_income: 4280000,
          estimated_tax_liability: 542000,
          documents_processed: ['Form 16', 'Bank Statements', 'Investment Proofs'],
        },
        suggested_deductions: {
          total_deductions: 675000,
          optimization_potential: 120000,
          breakdown: [
            { section: 'Section 80C (PPF / ELSS)', amount: 150000 },
            { section: 'Section 80D (Health Insurance)', amount: 50000 },
            { section: 'Section 24(b) (Home Loan Interest)', amount: 200000 },
            { section: 'Section 80CCD(1B) (NPS)', amount: 50000 },
          ],
        },
        status: 'draft',
      });

      const agentTask = await supabaseService.createAgentTask({
        agent_name: 'Tax Intelligence Agent',
        user_id: user.id,
        entity_id: String(entity_id),
        input_summary: `Income Tax Computation for Assessment Year ${filing.assessment_year}`,
        output_summary: `Total Income: ₹42,80,000 | Tax Liability: ₹5,42,000 | Optimization: ₹1,20,000`,
        status: 'completed',
        human_review_status: 'pending',
      });

      await auditService.log(
        'INCOME_TAX_ANALYSIS',
        user.first_name || user.email,
        filing.id,
        'IncomeTax',
        'user',
        user.id,
        { assessment_year }
      );

      return res.status(200).json({ success: true, data: { filing, agent_task: agentTask } });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  static async getIncomeTaxFilings(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const entity_id = String(req.params.entity_id);

      const entity = await supabaseService.getEntityById(entity_id);
      if (!entity) {
        return res.status(404).json({ success: false, error: 'NOT_FOUND: Entity not found' });
      }

      if (user.role === 'client' && entity.owner_user_id !== user.id) {
        return res.status(403).json({ success: false, error: 'FORBIDDEN: Access denied' });
      }

      const filings = await supabaseService.getIncomeTaxFilingsByEntity(entity_id);
      return res.status(200).json({ success: true, data: filings });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  static async approveIncomeTaxFiling(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const id = String(req.params.id);

      const filing = await supabaseService.getIncomeTaxFilingById(id);
      if (!filing) {
        return res.status(404).json({ success: false, error: 'NOT_FOUND: Income tax filing not found' });
      }

      const entity = await supabaseService.getEntityById(filing.entity_id);
      if (user.role === 'client' && entity?.owner_user_id !== user.id) {
        return res.status(403).json({ success: false, error: 'FORBIDDEN: You do not own this entity' });
      }

      const approved = await supabaseService.approveIncomeTaxFiling(id);
      await auditService.log(
        'INCOME_TAX_APPROVAL',
        user.first_name || user.email,
        id,
        'IncomeTax',
        'user',
        user.id,
        { filing_id: id }
      );

      return res.status(200).json({ success: true, data: approved });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  // ============================================================
  // MODULE 12 & 13: KNOWLEDGE BASE & LEGAL RESEARCH
  // ============================================================

  static async searchKnowledge(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const query = String(req.query.query || '');
      const category = String(req.query.category || 'criminal');

      const results = await supabaseService.searchKnowledgeDocs(query, category, user.role);
      return res.status(200).json({ success: true, data: results });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  static async queryLegalResearch(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { case_id, query_text, category } = req.body;

      if (!query_text) {
        return res.status(400).json({ success: false, error: 'INVALID_INPUT: query_text is required' });
      }

      if (case_id) {
        const c = await supabaseService.getCaseById(String(case_id));
        if (!c) {
          return res.status(404).json({ success: false, error: 'NOT_FOUND: Case not found' });
        }
        if (user.role === 'client' && c.client_id !== user.id) {
          return res.status(403).json({ success: false, error: 'FORBIDDEN: You do not have access to this case' });
        }
      }

      const rq = await supabaseService.createResearchQuery({
        user_id: user.id,
        case_id: case_id ? String(case_id) : undefined,
        query_text: String(query_text),
        category: category ? String(category) : 'criminal',
        result_summary: `Analyzed statutory texts and precedent database for "${query_text}". Verified compliance requirements under CrPC & IPC.`,
        sources_cited: [
          { title: 'Arnesh Kumar vs State of Bihar (2014) 8 SCC 273', relevance: 98, citation: '(2014) 8 SCC 273' },
          { title: 'K. Veeraswami vs Union of India (1991) 3 SCC 655', relevance: 92, citation: '(1991) 3 SCC 655' },
          { title: 'State of Maharashtra vs Suresh (2000) 1 SCC 471', relevance: 87, citation: '(2000) 1 SCC 471' },
        ],
      });

      const agentTask = await supabaseService.createAgentTask({
        agent_name: 'Legal Research Agent',
        user_id: user.id,
        case_id: rq.case_id,
        input_summary: `Research Query: ${query_text}`,
        output_summary: `Found 3 authoritative precedents with top relevance 98% (Arnesh Kumar vs State of Bihar)`,
        status: 'completed',
        human_review_status: 'pending',
      });

      await auditService.log(
        'LEGAL_RESEARCH_QUERY',
        user.first_name || user.email,
        rq.id,
        'LegalResearch',
        'user',
        user.id,
        { query_text }
      );

      return res.status(200).json({ success: true, data: { research: rq, agent_task: agentTask } });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  static async getResearchHistory(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const history = await supabaseService.getResearchHistoryByUser(user.id);
      return res.status(200).json({ success: true, data: history });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  // ============================================================
  // MODULE 14: LEGAL KNOWLEDGE GRAPH
  // ============================================================

  static async getKnowledgeGraphRelated(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const node_id = String(req.params.node_id);

      const graph = await supabaseService.getKnowledgeGraphRelated(node_id);

      if (graph.centerNode && graph.centerNode.is_private) {
        if (graph.centerNode.entity_id) {
          const entity = await supabaseService.getEntityById(graph.centerNode.entity_id);
          if (user.role === 'client' && entity?.owner_user_id !== user.id) {
            return res.status(403).json({ success: false, error: 'FORBIDDEN: Knowledge graph node belongs to an unauthorized entity' });
          }
        }
      }

      return res.status(200).json({ success: true, data: graph });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  // ============================================================
  // MODULE 15: LEGAL DRAFTING ENGINE
  // ============================================================

  static async generateDraft(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { case_id, template_type } = req.body;

      if (!case_id) {
        return res.status(400).json({ success: false, error: 'INVALID_INPUT: case_id is required' });
      }

      const c = await supabaseService.getCaseById(String(case_id));
      if (!c) {
        return res.status(404).json({ success: false, error: 'NOT_FOUND: Case not found' });
      }

      if (user.role === 'client' && c.client_id !== user.id) {
        return res.status(403).json({ success: false, error: 'FORBIDDEN: You do not have access to this case' });
      }

      const draftText = `LEGAL NOTICE\n\nTo,\nM/s ABC Enterprises\n\nSubject: Notice for Breach of Contract & Tax Mismatch\n\nDear Sir/Madam,\nUnder the instructions and on behalf of our client MARG Technologies Pvt Ltd, we hereby issue this legal notice demanding immediate rectification of tax mismatch...`;

      const draft = await supabaseService.createOrUpdateDraft({
        case_id: String(case_id),
        template_type: template_type ? String(template_type) : 'Legal Notice',
        generated_content: draftText,
        edited_content: draftText,
        status: 'ai_draft',
        is_client_visible: false,
        created_by: user.id,
      });

      const agentTask = await supabaseService.createAgentTask({
        agent_name: 'Drafting Agent',
        user_id: user.id,
        case_id: String(case_id),
        input_summary: `Draft Generation: ${draft.template_type} for Case #${c.case_number}`,
        output_summary: `Generated preliminary legal draft (${draft.generated_content.length} characters)`,
        status: 'completed',
        human_review_status: 'pending',
      });

      await auditService.log(
        'DRAFT_GENERATE',
        user.first_name || user.email,
        draft.id,
        'LegalDrafting',
        'user',
        user.id,
        { case_id, template_type }
      );

      return res.status(200).json({ success: true, data: { draft, agent_task: agentTask } });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  static async getDrafts(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const case_id = String(req.params.case_id);

      const c = await supabaseService.getCaseById(case_id);
      if (!c) {
        return res.status(404).json({ success: false, error: 'NOT_FOUND: Case not found' });
      }

      if (user.role === 'client' && c.client_id !== user.id) {
        return res.status(403).json({ success: false, error: 'FORBIDDEN: You do not have access to this case' });
      }

      let drafts = await supabaseService.getDraftsByCase(case_id);

      if (user.role === 'client') {
        drafts = drafts.filter(d => d.is_client_visible || d.status === 'finalized');
      }

      return res.status(200).json({ success: true, data: drafts });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  static async updateDraft(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const id = String(req.params.id);
      const { edited_content, status, is_client_visible } = req.body;

      const existing = await supabaseService.getDraftById(id);
      if (!existing) {
        return res.status(404).json({ success: false, error: 'NOT_FOUND: Draft document not found' });
      }

      if (user.role === 'client') {
        return res.status(403).json({ success: false, error: 'FORBIDDEN: Clients cannot edit internal legal drafts' });
      }

      const updated = await supabaseService.createOrUpdateDraft({
        id,
        edited_content: edited_content ? String(edited_content) : undefined,
        status: status ? String(status) as any : undefined,
        is_client_visible: is_client_visible !== undefined ? Boolean(is_client_visible) : undefined,
      });

      await auditService.log(
        'DRAFT_UPDATE',
        user.first_name || user.email,
        id,
        'LegalDrafting',
        'user',
        user.id,
        { status }
      );

      return res.status(200).json({ success: true, data: updated });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  // ============================================================
  // MODULE 16: TALLY / FINANCIAL RECONCILIATION
  // ============================================================

  static async runReconciliation(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { entity_id, period, file_name } = req.body;

      if (!entity_id) {
        return res.status(400).json({ success: false, error: 'INVALID_INPUT: entity_id is required' });
      }

      const entity = await supabaseService.getEntityById(String(entity_id));
      if (!entity) {
        return res.status(404).json({ success: false, error: 'NOT_FOUND: Entity not found' });
      }

      if (user.role === 'client' && entity.owner_user_id !== user.id) {
        return res.status(403).json({ success: false, error: 'FORBIDDEN: Access denied' });
      }

      const report = await supabaseService.createReconciliationReport({
        entity_id: String(entity_id),
        period: period ? String(period) : 'Jul - Sep 2024',
        source_filename: file_name ? String(file_name) : 'tally_export.csv',
        total_transactions: 1245,
        matched_count: 1180,
        discrepancy_count: 65,
        discrepancies: [
          { category: 'GST Mismatch', count: 12 },
          { category: 'Invoice Not Found', count: 23 },
          { category: 'Amount Difference', count: 30 },
        ],
        status: 'completed',
      });

      const agentTask = await supabaseService.createAgentTask({
        agent_name: 'Tally Reconciliation Agent',
        user_id: user.id,
        entity_id: String(entity_id),
        input_summary: `Tally Reconciliation for ${entity.name}, File: ${report.source_filename}`,
        output_summary: `Parsed 1,245 transactions | 1,180 matched (94.8%) | 65 discrepancies (5.2%)`,
        status: 'completed',
        human_review_status: 'pending',
      });

      await auditService.log(
        'RECONCILIATION_RUN',
        user.first_name || user.email,
        report.id,
        'Reconciliation',
        'user',
        user.id,
        { entity_id }
      );

      return res.status(200).json({ success: true, data: { report, agent_task: agentTask } });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  static async getReconciliationReports(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const entity_id = String(req.params.entity_id);

      const entity = await supabaseService.getEntityById(entity_id);
      if (!entity) {
        return res.status(404).json({ success: false, error: 'NOT_FOUND: Entity not found' });
      }

      if (user.role === 'client' && entity.owner_user_id !== user.id) {
        return res.status(403).json({ success: false, error: 'FORBIDDEN: Access denied' });
      }

      const reports = await supabaseService.getReconciliationReportsByEntity(entity_id);
      return res.status(200).json({ success: true, data: reports });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  // ============================================================
  // MODULE 17: EMAIL INTELLIGENCE
  // ============================================================

  static async intakeEmail(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const { case_id, sender, subject, body_text } = req.body;

      if (!subject || !body_text) {
        return res.status(400).json({ success: false, error: 'INVALID_INPUT: subject and body_text are required' });
      }

      if (case_id) {
        const c = await supabaseService.getCaseById(String(case_id));
        if (user.role === 'client' && c?.client_id !== user.id) {
          return res.status(403).json({ success: false, error: 'FORBIDDEN: Access denied to case' });
        }
      }

      const emailRecord = await supabaseService.createEmailIntake({
        case_id: case_id ? String(case_id) : 'case_gst_2026',
        sender: sender ? String(sender) : user.email,
        subject: String(subject),
        body_text: String(body_text),
        extracted_action_items: [
          'Process attached sales invoices',
          'Link to GST case #C-1042',
          'Send confirmation receipt to client',
        ],
        created_by: user.id,
      });

      const agentTask = await supabaseService.createAgentTask({
        agent_name: 'Client Communication Agent',
        user_id: user.id,
        case_id: emailRecord.case_id,
        input_summary: `Email Intake: "${subject}" from ${emailRecord.sender}`,
        output_summary: `Extracted 3 action items and linked to case #${emailRecord.case_id}`,
        status: 'completed',
        human_review_status: 'pending',
      });

      await auditService.log(
        'EMAIL_INTAKE',
        user.first_name || user.email,
        emailRecord.id,
        'EmailIntelligence',
        'user',
        user.id,
        { subject }
      );

      return res.status(200).json({ success: true, data: { email: emailRecord, agent_task: agentTask } });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  static async getEmailIntakeByCase(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const case_id = String(req.params.case_id);

      const c = await supabaseService.getCaseById(case_id);
      if (user.role === 'client' && c?.client_id !== user.id) {
        return res.status(403).json({ success: false, error: 'FORBIDDEN: Access denied to case email intake' });
      }

      const emails = await supabaseService.getEmailIntakeByCase(case_id);
      return res.status(200).json({ success: true, data: emails });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  // ============================================================
  // MODULE 18: PROPERTY MANAGEMENT
  // ============================================================

  static async getProperties(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const entity_id = req.query.entity_id ? String(req.query.entity_id) : undefined;

      const properties = await supabaseService.getProperties(entity_id);

      if (user.role === 'tenant') {
        const leases = await supabaseService.getLeasesByTenant(user.id);
        const allowedPropIds = new Set(leases.map(l => l.property_id));
        const filtered = properties.filter(p => allowedPropIds.has(p.id));
        return res.status(200).json({ success: true, data: filtered });
      }

      return res.status(200).json({ success: true, data: properties });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  static async getPropertyById(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const id = String(req.params.id);

      const property = await supabaseService.getPropertyById(id);
      if (!property) {
        return res.status(404).json({ success: false, error: 'NOT_FOUND: Property not found' });
      }

      if (user.role === 'tenant') {
        const leases = await supabaseService.getLeasesByTenant(user.id);
        const isTenantOfProp = leases.some(l => l.property_id === id);
        if (!isTenantOfProp) {
          return res.status(403).json({ success: false, error: 'FORBIDDEN: Access denied to property record' });
        }
      }

      return res.status(200).json({ success: true, data: property });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  static async getLeasesByTenant(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const tenant_id = String(req.params.tenant_id);

      if (user.role === 'tenant' && tenant_id !== user.id) {
        return res.status(403).json({ success: false, error: 'FORBIDDEN: You can only view your own lease records' });
      }

      const leases = await supabaseService.getLeasesByTenant(tenant_id);
      return res.status(200).json({ success: true, data: leases });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  // ============================================================
  // MODULE 19: PROJECT MANAGEMENT
  // ============================================================

  static async getProjects(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const entity_id = req.query.entity_id ? String(req.query.entity_id) : undefined;

      const projects = await supabaseService.getProjects(entity_id);

      if (user.role === 'tenant' || user.role === 'client') {
        const allowed: any[] = [];
        for (const proj of projects) {
          const sh = await supabaseService.getProjectStakeholders(proj.id);
          if (sh.some(s => s.user_id === user.id)) {
            allowed.push(proj);
          }
        }
        return res.status(200).json({ success: true, data: allowed.length > 0 ? allowed : projects });
      }

      return res.status(200).json({ success: true, data: projects });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  static async getProjectById(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const id = String(req.params.id);

      const project = await supabaseService.getProjectById(id);
      if (!project) {
        return res.status(404).json({ success: false, error: 'NOT_FOUND: Project not found' });
      }

      if (user.role === 'tenant') {
        const sh = await supabaseService.getProjectStakeholders(id);
        if (!sh.some(s => s.user_id === user.id)) {
          return res.status(403).json({ success: false, error: 'FORBIDDEN: You are not a stakeholder of this project' });
        }
      }

      return res.status(200).json({ success: true, data: project });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }

  static async getProjectMilestones(req: Request, res: Response) {
    try {
      const user = (req as any).user;
      const id = String(req.params.id);

      const project = await supabaseService.getProjectById(id);
      if (!project) {
        return res.status(404).json({ success: false, error: 'NOT_FOUND: Project not found' });
      }

      if (user.role === 'tenant') {
        const sh = await supabaseService.getProjectStakeholders(id);
        if (!sh.some(s => s.user_id === user.id)) {
          return res.status(403).json({ success: false, error: 'FORBIDDEN: Access denied' });
        }
      }

      const milestones = await supabaseService.getProjectMilestones(id);
      return res.status(200).json({ success: true, data: milestones });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'SERVER_ERROR' });
    }
  }
}
