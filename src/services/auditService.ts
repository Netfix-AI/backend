import { supabaseService } from './supabaseService.js';
import type { AuditLogEntity } from '../types/index.js';

class AuditService {
  async log(
    action: string,
    actorName: string,
    target: string,
    module: string = 'General',
    actorType: 'user' | 'admin' | 'system' = 'user',
    actorId?: string,
    details?: any,
    ipAddress?: string
  ): Promise<void> {
    try {
      await supabaseService.writeAuditLog({
        action,
        actor_name: actorName,
        target,
        module,
        actor_type: actorType,
        actor_id: actorId,
        details,
        ip_address: ipAddress || '127.0.0.1',
      });
    } catch (err) {
      console.error('[AuditService] Failed to record audit log:', err);
    }
  }

  async getLogs(): Promise<AuditLogEntity[]> {
    return supabaseService.getAuditLogs();
  }
}

export const auditService = new AuditService();
