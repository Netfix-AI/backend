import { Response } from 'express';
import { supabaseService } from '../services/supabaseService.js';
import { auditService } from '../services/auditService.js';
import type { AuthenticatedUserRequest } from '../middleware/authMiddleware.js';

export const advocateController = {
  /**
   * GET /api/v1/advocate/cases
   */
  async getAssignedCases(req: AuthenticatedUserRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } });
      }

      if (req.user.role !== 'advocate' && req.user.role !== 'management' && req.user.role !== 'employee') {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Access denied to Advocate Workspace.' },
        });
      }

      const cases = await supabaseService.getCasesForUser(req.user.id, 'advocate');
      const safeCases = cases.map((c) => ({
        id: c.id,
        caseNumber: c.case_number,
        title: c.title,
        type: c.module_type,
        status: c.status,
        nextHearingDate: c.next_hearing_date || '2026-09-25',
        assignedTo: 'Sanjay Prakash',
      }));

      return res.status(200).json({
        success: true,
        data: safeCases,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  /**
   * POST /api/v1/access-requests
   */
  async createAccessRequest(req: AuthenticatedUserRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } });
      }

      const { requestedResource, reason, durationDays } = req.body;

      if (!requestedResource || !reason) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Requested resource and reason are required.' } });
      }

      const reqRecord = {
        requester_id: req.user.id,
        requester_name: req.user.email.split('@')[0],
        requester_role: req.user.role,
        requested_resource: requestedResource,
        reason,
        duration_days: durationDays || 30,
        status: 'pending' as const,
        created_at: new Date().toISOString(),
      };

      await auditService.log('ACCESS_REQUESTED', req.user.email, requestedResource, 'AccessControl', 'user', req.user.id);

      return res.status(201).json({
        success: true,
        data: {
          id: `req_${Date.now()}`,
          message: 'Access request submitted for Administrator review.',
          status: 'pending',
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },
};
