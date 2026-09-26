import { Router } from 'express';
import { clientController } from '../controllers/clientController.js';
import { requireUserAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireUserAuth as any);

router.get('/', clientController.getClients as any);
router.get('/:id', clientController.getClientById as any);
router.post('/:id/assign', clientController.assignClient as any);

export default router;
