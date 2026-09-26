import { Router } from 'express';
import { advocateController } from '../controllers/advocateController.js';
import { requireUserAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireUserAuth as any);

router.get('/cases', advocateController.getAssignedCases as any);
router.post('/access-requests', advocateController.createAccessRequest as any);

export default router;
