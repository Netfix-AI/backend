import { Router } from 'express';
import { queryController } from '../controllers/queryController.js';
import { requireUserAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireUserAuth as any);

router.post('/ask', queryController.askQuery as any);
router.get('/:task_id/status', queryController.getTaskStatus as any);

export default router;
