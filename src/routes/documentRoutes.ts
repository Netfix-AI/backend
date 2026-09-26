import { Router } from 'express';
import { documentController } from '../controllers/documentController.js';
import { requireUserAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.use(requireUserAuth as any);

router.post('/upload', documentController.uploadDocument as any);
router.get('/', documentController.getDocuments as any);
router.get('/:id', documentController.getDocumentById as any);
router.get('/:id/download', documentController.downloadDocument as any);

export default router;
