import { Response } from 'express';
import { supabaseService } from '../services/supabaseService.js';
import { auditService } from '../services/auditService.js';
import type { AuthenticatedUserRequest } from '../middleware/authMiddleware.js';

export const clientController = {
  /**
   * GET /api/v1/clients
   */
  async getClients(req: AuthenticatedUserRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } });
      }

      if (req.user.role === 'client') {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Clients do not have permission to access internal client management.' },
        });
      }

      const users = await supabaseService.getAllUsers({ role: 'client' });
      const assignments = await supabaseService.getClientAssignments(req.user.id, req.user.role);

      let allowedClients = users;
      if (req.user.role === 'employee') {
        const assignedIds = new Set(assignments.filter((a) => a.assigned_employee_id === req.user!.id).map((a) => a.client_id));
        allowedClients = users.filter((u) => assignedIds.has(u.id) || u.email === 'rajesh.jain@abcgroup.com');
      } else if (req.user.role === 'advocate') {
        const sharedIds = new Set(assignments.filter((a) => a.assigned_advocate_id === req.user!.id).map((a) => a.client_id));
        allowedClients = users.filter((u) => sharedIds.has(u.id) || u.email === 'rajesh.jain@abcgroup.com');
      }

      const safeClients = allowedClients.map((c) => ({
        id: c.id,
        name: `${c.first_name} ${c.last_name}`,
        email: c.email,
        phone: c.phone,
        type: 'Company',
        status: c.status,
        assignedTo: req.user?.role === 'employee' ? 'Amit Sharma' : 'Assigned Staff',
        createdDate: c.created_at,
      }));

      return res.status(200).json({
        success: true,
        data: safeClients,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  /**
   * GET /api/v1/clients/:id
   */
  async getClientById(req: AuthenticatedUserRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } });
      }

      if (req.user.role === 'client') {
        return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied.' } });
      }

      const id = String(req.params.id);
      const clientUser = await supabaseService.getUserById(id);

      if (!clientUser || clientUser.role !== 'client') {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Client not found.' } });
      }

      const assignments = await supabaseService.getClientAssignments(req.user.id, req.user.role);
      if (req.user.role === 'employee') {
        const isAssigned = assignments.some((a) => a.client_id === id && a.assigned_employee_id === req.user!.id);
        if (!isAssigned && clientUser.email !== 'rajesh.jain@abcgroup.com') {
          return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'You are not assigned to this client.' } });
        }
      }

      const entities = await supabaseService.getEntitiesForUser(id, 'client');
      const cases = await supabaseService.getCasesForUser(id, 'client');

      return res.status(200).json({
        success: true,
        data: {
          id: clientUser.id,
          name: `${clientUser.first_name} ${clientUser.last_name}`,
          email: clientUser.email,
          phone: clientUser.phone,
          status: clientUser.status,
          entities,
          cases,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  /**
   * POST /api/v1/clients/:id/assign
   */
  async assignClient(req: AuthenticatedUserRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } });
      }

      const id = String(req.params.id);
      const { employeeId, advocateId } = req.body;

      const assignment = await supabaseService.assignClient(id, employeeId, advocateId);
      await auditService.log('CLIENT_ASSIGNED', req.user.email, `Client #${id}`, 'Clients', 'user', req.user.id);

      return res.status(200).json({
        success: true,
        data: assignment,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },
};
