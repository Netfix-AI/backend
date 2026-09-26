import { Router } from 'express';
import { entityController } from '../controllers/entityController.js';
import { requireUserAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireUserAuth as any);

router.post('/', entityController.createEntity as any);
router.get('/', entityController.getEntities as any);
router.get('/:id', entityController.getEntityById as any);
router.patch('/:id', entityController.updateEntity as any);

export default router;
