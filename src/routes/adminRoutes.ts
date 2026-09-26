import { Router } from 'express';
import { adminAuthController } from '../controllers/adminAuthController.js';
import { adminController } from '../controllers/adminController.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Phase 4 Authoritative Admin Security Auth Flow
router.post('/auth/login-step1', adminAuthController.loginStep1);
router.post('/auth/verify-mfa', adminAuthController.verifyMfa);
router.post('/auth/verify-captcha', adminAuthController.verifyCaptcha);
router.get('/auth/session', adminAuthController.checkSession as any);
router.post('/auth/logout', adminAuthController.logout as any);

// Protected Admin Control Center Endpoints
router.use(requireAdminAuth as any);

router.get('/dashboard-stats', adminController.getDashboardStats as any);
router.get('/users', adminController.getUsers as any);
router.get('/users/:id', adminController.getUserDetail as any);
router.patch('/users/:id/status', adminController.updateUserStatus as any);

router.get('/agents', adminController.getAgents as any);
router.get('/agent-tasks', adminController.getAgentTasks as any);

router.get('/access-requests', adminController.getAccessRequests as any);
router.patch('/access-requests/:id', adminController.updateAccessRequest as any);

router.get('/audit-logs', adminController.getAuditLogs as any);
router.get('/tickets', adminController.getTickets as any);
router.patch('/tickets/:id', adminController.updateTicket as any);

router.get('/system-health', adminController.getSystemHealth as any);

export default router;
