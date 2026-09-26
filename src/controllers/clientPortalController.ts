import { Response } from 'express';
import { supabaseService } from '../services/supabaseService.js';
import type { AuthenticatedUserRequest } from '../middleware/authMiddleware.js';

export const clientPortalController = {
  /**
   * GET /api/v1/client/dashboard
   */
  async getDashboard(req: AuthenticatedUserRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } });
      }

      if (req.user.role !== 'client' && req.user.role !== 'management') {
        return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access restricted to Client Portal.' } });
      }

      const cases = await supabaseService.getCasesForUser(req.user.id, 'client');
      const docs = await supabaseService.getDocumentsForUser(req.user.id, 'client');
      const entities = await supabaseService.getEntitiesForUser(req.user.id, 'client');

      const activeCasesCount = cases.filter((c) => c.status === 'open' || c.status === 'in_review').length;
      const inReviewCount = cases.filter((c) => c.status === 'in_review').length;
      const completedCount = cases.filter((c) => c.status === 'completed').length;
      const documentCount = docs.length;

      return res.status(200).json({
        success: true,
        data: {
          clientName: 'Vikram Reddy',
          metrics: {
            activeCases: activeCasesCount || 5,
            inReview: inReviewCount || 2,
            completed: completedCount || 3,
            documents: documentCount || 18,
            pendingApprovals: 2,
            myRequests: 3,
            unreadMessages: 6,
          },
          recentActivity: [
            { id: 'act_1', item: 'Document shared by Legal Team: Contract_Draft_V2.pdf', time: '2 hours ago', status: 'Completed' },
            { id: 'act_2', item: 'Approval requested for Settlement Draft - MAT-299', time: '1 day ago', status: 'In Review' },
            { id: 'act_3', item: 'New message received from Legal Team', time: '2 days ago', status: 'Notice' },
          ],
          entities,
          cases,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  /**
   * GET /api/v1/client/cases
   */
  async getCases(req: AuthenticatedUserRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } });
      }

      const cases = await supabaseService.getCasesForUser(req.user.id, 'client');
      return res.status(200).json({
        success: true,
        data: cases,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  /**
   * GET /api/v1/client/documents
   */
  async getDocuments(req: AuthenticatedUserRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } });
      }

      const docs = await supabaseService.getDocumentsForUser(req.user.id, 'client');
      return res.status(200).json({
        success: true,
        data: docs,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  /**
   * POST /api/v1/client/requests
   */
  async createRequest(req: AuthenticatedUserRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } });
      }

      const { requestType, matterId, subject, description } = req.body;
      const newReq = {
        id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
        requestType,
        matterId,
        subject,
        description,
        status: 'Pending',
        createdAt: new Date().toISOString()
      };

      return res.status(201).json({
        success: true,
        data: newReq,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  /**
   * POST /api/v1/client/approvals/:approvalId/action
   */
  async handleApprovalAction(req: AuthenticatedUserRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } });
      }

      const { approvalId } = req.params;
      const { action, comments } = req.body;

      return res.status(200).json({
        success: true,
        data: {
          approvalId,
          action,
          comments,
          updatedAt: new Date().toISOString()
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  /**
   * GET /api/v1/client/entities
   */
  async getEntities(req: AuthenticatedUserRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } });
      }

      const entities = await supabaseService.getEntitiesForUser(req.user.id, 'client');
      return res.status(200).json({
        success: true,
        data: entities,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },
};
