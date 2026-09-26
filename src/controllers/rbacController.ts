import { Request, Response } from 'express';
import { rbacService } from '../services/rbacService.js';
import { auditService } from '../services/auditService.js';
import type { AuthenticatedUserRequest } from '../middleware/authMiddleware.js';

export const rbacController = {
  /**
   * GET /api/v1/rbac/dashboard-data/:role?
   * Secure dashboard data isolated strictly by authenticated user role
   */
  async getDashboardData(req: AuthenticatedUserRequest, res: Response) {
    try {
      const roleParam = (req.params.role || req.user?.role || 'client') as string;
      const userContext = rbacService.getUserContext(roleParam, req.user?.email);

      // If user tries to request dashboard of a role they do not possess, return 403 Forbidden
      if (req.user && req.user.role !== roleParam) {
        await auditService.log(
          'UNAUTHORIZED_ROLE_DASHBOARD_ACCESS',
          req.user.email,
          `Attempted role: ${roleParam}`,
          'RBAC_Protection',
          'user',
          req.user.id
        );
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: `403 Forbidden: You do not have permission to access the ${roleParam.toUpperCase()} workspace.`,
          },
        });
      }

      const data = rbacService.getDashboardDataForRole(roleParam);
      return res.status(200).json({ success: true, data });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  /**
   * GET /api/v1/rbac/cases/:id
   * Explicit IDOR / BOLA protection check
   */
  async getCaseById(req: AuthenticatedUserRequest, res: Response) {
    try {
      const caseId = req.params.id as string;
      const role = (req.user?.role || 'client') as string;
      const user = rbacService.getUserContext(role, req.user?.email);

      const authCheck = await rbacService.verifyAccess(user, 'case', caseId, 'read');
      if (!authCheck.allowed) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: authCheck.reason || '403 Forbidden: Access denied to requested case resource.',
          },
        });
      }

      return res.status(200).json({
        success: true,
        data: {
          id: caseId,
          title: `Authorized Case Record ${caseId}`,
          status: 'In Review',
          securityBoundary: `${user.role.toUpperCase()} -> TENANT_ISOLATED`,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  /**
   * GET /api/v1/rbac/agent-activity
   * Returns live agent task feed & progress
   */
  async getAgentActivity(req: AuthenticatedUserRequest, res: Response) {
    try {
      const role = (req.user?.role || 'client') as string;
      const tasks = rbacService.getAgentTasks(role);
      return res.status(200).json({ success: true, data: tasks });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  /**
   * POST /api/v1/rbac/test-idor-violation
   * Test endpoint to simulate cross-user IDOR access attempt
   */
  async testIdorViolation(req: AuthenticatedUserRequest, res: Response) {
    try {
      const { targetResourceId, requesterRole = 'client' } = req.body;
      const user = rbacService.getUserContext(requesterRole);

      // Force verification on unauthorized foreign resource
      const targetId = targetResourceId || 'FOREIGN-CONFIDENTIAL-DOC-999';
      const authCheck = await rbacService.verifyAccess(user, 'document', targetId, 'read');

      if (!authCheck.allowed) {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: authCheck.reason || '403 Forbidden: Cross-user data access prevented by RBAC kernel.',
          },
        });
      }

      return res.status(200).json({ success: true, message: 'Access allowed' });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },
};
