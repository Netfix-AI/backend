import { Response } from 'express';
import { supabaseService } from '../services/supabaseService.js';
import { auditService } from '../services/auditService.js';
import type { AuthenticatedUserRequest } from '../middleware/authMiddleware.js';

export const entityController = {
  /**
   * POST /api/v1/entities
   */
  async createEntity(req: AuthenticatedUserRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } });
      }

      const { name, type, gstin, pan, registeredAddress, city, state } = req.body;

      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Company/Entity Name is required.' } });
      }
      if (!registeredAddress || !registeredAddress.trim()) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Registered Address is required.' } });
      }

      const entity = await supabaseService.createEntity({
        name: name.trim(),
        type: type || 'company',
        gstin: gstin ? gstin.trim().toUpperCase() : '',
        pan: pan ? pan.trim().toUpperCase() : '',
        registered_address: registeredAddress.trim(),
        city: city ? city.trim() : '',
        state: state ? state.trim() : '',
        owner_user_id: req.user.id,
      });

      await auditService.log('ENTITY_CREATED', req.user.email, entity.name, 'Entities', 'user', req.user.id);

      return res.status(201).json({
        success: true,
        data: entity,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  /**
   * GET /api/v1/entities
   */
  async getEntities(req: AuthenticatedUserRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } });
      }

      const entities = await supabaseService.getEntitiesForUser(req.user.id, req.user.role);
      return res.status(200).json({
        success: true,
        data: entities,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  /**
   * GET /api/v1/entities/:id
   */
  async getEntityById(req: AuthenticatedUserRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } });
      }

      const id = String(req.params.id);
      const entity = await supabaseService.getEntityById(id);

      if (!entity) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Entity not found.' } });
      }

      if (req.user.role === 'client' && entity.owner_user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Access denied. You do not own or manage this entity.' },
        });
      }

      return res.status(200).json({
        success: true,
        data: entity,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  /**
   * PATCH /api/v1/entities/:id
   */
  async updateEntity(req: AuthenticatedUserRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } });
      }

      const id = String(req.params.id);
      const entity = await supabaseService.getEntityById(id);

      if (!entity) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Entity not found.' } });
      }

      if (req.user.role === 'client' && entity.owner_user_id !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Access denied. You cannot edit this entity.' },
        });
      }

      const updated = await supabaseService.updateEntity(id, req.body);
      await auditService.log('ENTITY_UPDATED', req.user.email, entity.name, 'Entities', 'user', req.user.id);

      return res.status(200).json({
        success: true,
        data: updated,
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },
};
