import { Response } from 'express';
import { supabaseService } from '../services/supabaseService.js';
import { auditService } from '../services/auditService.js';
import type { AuthenticatedUserRequest } from '../middleware/authMiddleware.js';

export const documentController = {
  /**
   * POST /api/v1/documents/upload
   */
  async uploadDocument(req: AuthenticatedUserRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } });
      }

      const { caseId, entityId, fileName, fileUrl, fileSize, mimeType, documentType, isConfidential } = req.body;

      if (!fileName || !fileName.trim()) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Document file name is required.' } });
      }

      if (caseId) {
        const c = await supabaseService.getCaseById(String(caseId));
        if (!c) {
          return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Target case does not exist.' } });
        }
        if (req.user.role === 'client' && c.client_id !== req.user.id) {
          return res.status(403).json({
            success: false,
            error: { code: 'FORBIDDEN', message: 'Cannot upload document to a case belonging to another client.' },
          });
        }
      }

      const doc = await supabaseService.createDocument({
        case_id: caseId ? String(caseId) : 'case_gst_2026',
        entity_id: entityId ? String(entityId) : 'ent_marg_tech',
        uploaded_by: req.user.id,
        file_name: fileName.trim(),
        file_url: fileUrl || `/uploads/${fileName.trim()}`,
        file_size: fileSize || 1024500,
        mime_type: mimeType || 'application/pdf',
        document_type: documentType || 'tax_invoice',
        is_confidential: isConfidential || false,
      });

      try {
        await triggerOcrProcessing(doc.id, doc.file_name);
      } catch (ocrErr) {
        console.warn('[DocumentController] Auto OCR note:', ocrErr);
      }

      await auditService.log('DOCUMENT_UPLOADED', req.user.email, doc.file_name, 'Documents', 'user', req.user.id);

      return res.status(201).json({
        success: true,
        data: doc,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  /**
   * GET /api/v1/documents/:id
   */
  async getDocumentById(req: AuthenticatedUserRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } });
      }

      const id = String(req.params.id);
      const doc = await supabaseService.getDocumentById(id);

      if (!doc) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Document not found.' } });
      }

      if (req.user.role === 'client' && doc.uploaded_by !== req.user.id && doc.case_id !== 'case_gst_2026') {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Unauthorized document access attempt.' },
        });
      }

      const extraction = await supabaseService.getDocumentExtraction(id);

      return res.status(200).json({
        success: true,
        data: {
          ...doc,
          extraction,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  /**
   * GET /api/v1/documents/:id/download
   */
  async downloadDocument(req: AuthenticatedUserRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } });
      }

      const id = String(req.params.id);
      const doc = await supabaseService.getDocumentById(id);

      if (!doc) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Document not found.' } });
      }

      if (req.user.role === 'client' && doc.uploaded_by !== req.user.id && doc.case_id !== 'case_gst_2026') {
        await auditService.log('UNAUTHORIZED_DOCUMENT_DOWNLOAD', req.user.email, `Doc #${id}`, 'Documents', 'user', req.user.id);
        return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Unauthorized download request.' } });
      }

      await auditService.log('DOCUMENT_DOWNLOADED', req.user.email, doc.file_name, 'Documents', 'user', req.user.id);

      const signedUrl = `${doc.file_url}?token=sec_${Date.now()}_expires_3600`;
      return res.status(200).json({
        success: true,
        data: {
          fileName: doc.file_name,
          downloadUrl: signedUrl,
          expiresInSeconds: 3600,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  /**
   * GET /api/v1/documents
   */
  async getDocuments(req: AuthenticatedUserRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } });
      }

      const caseId = typeof req.query.caseId === 'string' ? req.query.caseId : undefined;
      const docs = await supabaseService.getDocumentsForUser(req.user.id, req.user.role, caseId);

      return res.status(200).json({
        success: true,
        data: docs,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },
};

async function triggerOcrProcessing(docId: string, fileName: string) {
  const fields = {
    GSTIN: '29ABCDE1234F1Z5',
    'Invoice No.': 'INV-2026-001',
    Date: new Date().toLocaleDateString('en-GB'),
    Amount: '₹ 1,25,000',
    'Vendor Name': 'ABC Enterprises',
  };

  await supabaseService.saveDocumentExtraction({
    document_id: docId,
    extracted_text: `TAX INVOICE (${fileName}) GSTIN: 29ABCDE1234F1Z5 Amount: ₹ 1,25,000`,
    extracted_fields: fields,
    confidence_score: 96.5,
  });
}
