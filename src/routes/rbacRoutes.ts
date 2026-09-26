import { Router } from 'express';
import { rbacController } from '../controllers/rbacController.js';
import { requireUserAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Dashboard data endpoint with role param
router.get('/dashboard-data/:role?', rbacController.getDashboardData as any);

// Resource case endpoint with IDOR validation
router.get('/cases/:id', requireUserAuth as any, rbacController.getCaseById as any);

// Live Agent activity feed
router.get('/agent-activity', rbacController.getAgentActivity as any);

// IDOR & Security Simulation Test Endpoint
router.post('/test-idor-violation', rbacController.testIdorViolation as any);

export default router;
