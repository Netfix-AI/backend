import { Router } from 'express';
import { clientPortalController } from '../controllers/clientPortalController.js';
import { requireUserAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireUserAuth as any);

router.get('/dashboard', clientPortalController.getDashboard as any);
router.get('/cases', clientPortalController.getCases as any);
router.get('/documents', clientPortalController.getDocuments as any);
router.post('/requests', clientPortalController.createRequest as any);
router.post('/approvals/:approvalId/action', clientPortalController.handleApprovalAction as any);
router.get('/entities', clientPortalController.getEntities as any);

export default router;
