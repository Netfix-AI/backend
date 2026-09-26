import { Response } from 'express';
import { supabaseService } from '../services/supabaseService.js';
import { auditService } from '../services/auditService.js';
import type { AuthenticatedUserRequest } from '../middleware/authMiddleware.js';

export const queryController = {
  /**
   * POST /api/v1/query/ask
   */
  async askQuery(req: AuthenticatedUserRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } });
      }

      const { queryText, entityId, caseId } = req.body;

      if (!queryText || !queryText.trim()) {
        return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Query text cannot be empty.' } });
      }

      // Verify Entity Ownership if provided
      if (entityId) {
        const entity = await supabaseService.getEntityById(String(entityId));
        if (!entity) {
          return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Selected entity does not exist.' } });
        }
        if (req.user.role === 'client' && entity.owner_user_id !== req.user.id) {
          return res.status(403).json({
            success: false,
            error: { code: 'FORBIDDEN', message: 'Unauthorized entity scope for query submission.' },
          });
        }
      }

      const task = await supabaseService.createAgentQueryTask({
        agent_name: 'Ultron AI Orchestrator',
        user_id: req.user.id,
        entity_id: entityId ? String(entityId) : 'ent_marg_tech',
        case_id: caseId ? String(caseId) : 'case_gst_2026',
        input_summary: queryText.trim(),
        output_summary: 'Query received and task pipeline initialized.',
        status: 'processing',
        current_step: 1,
      });

      await auditService.log('QUERY_SUBMITTED', req.user.email, queryText.substring(0, 50), 'QuerySystem', 'user', req.user.id);

      return res.status(201).json({
        success: true,
        data: {
          taskId: task.id,
          status: task.status,
          currentStep: task.current_step,
          stepName: 'Request received',
          totalSteps: 7,
          queryText: task.input_summary,
          message: 'Query submitted successfully. Agent pipeline processing.',
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },

  /**
   * GET /api/v1/query/:task_id/status
   */
  async getTaskStatus(req: AuthenticatedUserRequest, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ success: false, error: { code: 'UNAUTHENTICATED', message: 'Authentication required.' } });
      }

      const taskId = String(req.params.task_id);
      const task = await supabaseService.getAgentTaskById(taskId);

      if (!task) {
        return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Task ID not found.' } });
      }

      // IDOR Security Check
      if (req.user.role === 'client' && task.user_id && task.user_id !== req.user.id) {
        await auditService.log('UNAUTHORIZED_TASK_ACCESS_ATTEMPT', req.user.email, `Task #${taskId}`, 'QuerySystem', 'user', req.user.id);
        return res.status(403).json({
          success: false,
          error: { code: 'FORBIDDEN', message: 'Unauthorized access to agent task record.' },
        });
      }

      const stepsList = [
        { id: 1, name: 'Request received', status: 'Completed' },
        { id: 2, name: 'Reading documents...', status: (task.current_step || 1) >= 2 ? 'Completed' : 'Processing' },
        { id: 3, name: 'Analyzing information', status: (task.current_step || 1) >= 3 ? 'Completed' : (task.current_step === 2 ? 'Processing' : 'Pending') },
        { id: 4, name: 'Processing', status: (task.current_step || 1) >= 4 ? 'Completed' : (task.current_step === 3 ? 'Processing' : 'Pending') },
        { id: 5, name: 'Generating result', status: (task.current_step || 1) >= 5 ? 'Completed' : (task.current_step === 4 ? 'Processing' : 'Pending') },
        { id: 6, name: 'Human review', status: (task.current_step || 1) >= 6 ? 'Completed' : (task.current_step === 5 ? 'Processing' : 'Pending') },
        { id: 7, name: 'Completed', status: (task.current_step || 1) >= 7 ? 'Completed' : 'Pending' },
      ];

      return res.status(200).json({
        success: true,
        data: {
          taskId: task.id,
          agentName: task.agent_name,
          status: task.status,
          currentStep: task.current_step || 2,
          steps: stepsList,
          inputSummary: task.input_summary,
          outputSummary: task.output_summary,
        },
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
    }
  },
};
