import { Router } from 'express';
import { caseController } from '../controllers/caseController.js';
import { requireUserAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireUserAuth as any);

router.post('/', caseController.createCase as any);
router.get('/', caseController.getCases as any);
router.get('/:id', caseController.getCaseById as any);
router.patch('/:id/status', caseController.updateCaseStatus as any);
router.post('/:id/notes', caseController.addCaseNote as any);

export default router;
