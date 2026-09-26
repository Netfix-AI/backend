import { Router } from 'express';
import { ocrController } from '../controllers/ocrController.js';
import { requireUserAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireUserAuth as any);

router.post('/documents/:id/process', ocrController.processDocument as any);

export default router;
