import { db } from '../db/index.js';
import * as schema from '../db/schema.js';

export interface AuditLogEntry {
  venueId?: string | null;
  userId?: string | null;
  action: string;
  entityType?: string;
  entityId?: string;
  payload?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export const auditService = {
  async log(entry: AuditLogEntry): Promise<void> {
    try {
      await db.insert(schema.auditLogs).values({
        venueId: entry.venueId || null,
        userId: entry.userId || null,
        action: entry.action,
        entityType: entry.entityType || null,
        entityId: entry.entityId || null,
        payload: entry.payload || {},
        ipAddress: entry.ipAddress || null,
        userAgent: entry.userAgent || null,
      });
    } catch (err) {
      console.error('⚠️ Error al registrar log de auditoría:', err);
      // No lanzamos excepción para no romper la transacción principal
    }
  },
};
