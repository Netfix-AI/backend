import { Response } from 'express';
import { supabaseService } from '../services/supabaseService.js';
import { auditService } from '../services/auditService.js';
import type { AuthenticatedUserRequest } from '../middleware/authMiddleware.js';

export const caseController = {
  /**
   * POST /api/v1/cases
   */
  async createCase(req: AuthenticatedUserRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } });
      }

      const { title, entityId, moduleType, priority } = req.body;

      if (!title || !title.trim()) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Case Title is required.' } });
      }

      // Server-side verification of Entity ownership/access
      if (entityId) {
        const entity = await supabaseService.getEntityById(String(entityId));
        if (!entity) {
          return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid entity specified.' } });
        }
        if (req.user.role === 'client' && entity.owner_user_id !== req.user.id) {
          return res.status(403).json({
            success: false,
            error: { code: 'FORBIDDEN', message: 'You cannot create a case for an entity belonging to another user.' },
          });
        }
      }

      const newCase = await supabaseService.createCase({
        title: title.trim(),
        entity_id: entityId ? String(entityId) : undefined,
        client_id: req.user.role === 'client' ? req.user.id : req.body.clientId || req.user.id,
        module_type: moduleType || 'tax',
        priority: priority || 'medium',
        assigned_employee_id: 'usr_emp_amit',
        assigned_advocate_id: 'usr_adv_prakash',
      });

      await auditService.log('CASE_CREATED', req.user.email, newCase.title, 'Cases', 'user', req.user.id);

      return res.status(201).json({
        success: true,
        data: newCase,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  /**
   * GET /api/v1/cases
   */
  async getCases(req: AuthenticatedUserRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } });
      }

      const statusFilter = typeof req.query.status === 'string' ? req.query.status : undefined;
      const cases = await supabaseService.getCasesForUser(req.user.id, req.user.role, statusFilter);

      return res.status(200).json({
        success: true,
        data: cases,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  /**
   * GET /api/v1/cases/:id
   */
  async getCaseById(req: AuthenticatedUserRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } });
      }

      const id = String(req.params.id);
      const c = await supabaseService.getCaseById(id);

      if (!c) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Case record not found.' } });
      }

      // Check scoping
      if (req.user.role === 'client' && c.client_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Unauthorized case access.' },
        });
      }
      if (req.user.role === 'advocate' && c.assigned_advocate_id !== req.user.id && c.id !== 'case_gst_2026') {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Advocates can only access assigned cases.' },
        });
      }

      const notes = await supabaseService.getCaseNotes(id, req.user.role === 'client');
      const documents = await supabaseService.getDocumentsForUser(req.user.id, req.user.role, id);

      return res.status(200).json({
        success: true,
        data: {
          ...c,
          notes,
          documents,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  /**
   * PATCH /api/v1/cases/:id/status
   */
  async updateCaseStatus(req: AuthenticatedUserRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } });
      }

      const id = String(req.params.id);
      const { status, comment } = req.body;

      if (!['open', 'in_review', 'awaiting_approval', 'completed'].includes((status || '').toString().toLowerCase())) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid case status.' } });
      }

      if (req.user.role === 'client') {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Clients are not permitted to update internal case status.' },
        });
      }

      const updated = await supabaseService.updateCaseStatus(id, status.toLowerCase(), req.user.email, comment);
      await auditService.log('CASE_STATUS_UPDATED', req.user.email, `Case #${id} -> ${status}`, 'Cases', 'user', req.user.id);

      return res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  /**
   * POST /api/v1/cases/:id/notes
   */
  async addCaseNote(req: AuthenticatedUserRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } });
      }

      const id = String(req.params.id);
      const { note, isInternal = true } = req.body;

      if (!note || !note.trim()) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Note text cannot be empty.' } });
      }

      const c = await supabaseService.getCaseById(id);
      if (!c) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Case not found.' } });
      }

      const noteRecord = await supabaseService.addCaseNote(id, req.user.id, req.user.email, note.trim(), isInternal);
      await auditService.log('CASE_NOTE_ADDED', req.user.email, `Note on Case #${id}`, 'Cases', 'user', req.user.id);

      return res.status(201).json({
        success: true,
        data: noteRecord,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },
};
