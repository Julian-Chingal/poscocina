import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';

export interface LogAuditInput {
  venueId?: string;
  userId?: string;
  action: string;
  entityType?: string;
  entityId?: string;
  payload?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  async log(input: LogAuditInput) {
    try {
      const [newLog] = await db
        .insert(schema.auditLogs)
        .values({
          venueId: input.venueId || null,
          userId: input.userId || null,
          action: input.action,
          entityType: input.entityType || null,
          entityId: input.entityId || null,
          payload: input.payload || {},
          ipAddress: input.ipAddress || null,
          userAgent: input.userAgent || null,
        })
        .returning();

      return newLog;
    } catch (err) {
      console.error('⚠️ Error logging audit event:', err);
      return null;
    }
  }

  async getAuditLogs(venueId: string, options?: { action?: string; limit?: number }) {
    const limit = options?.limit || 50;

    return await db.query.auditLogs.findMany({
      where: (logs, { and, eq }) =>
        options?.action
          ? and(eq(logs.venueId, venueId), eq(logs.action, options.action))
          : eq(logs.venueId, venueId),
      with: {
        user: {
          columns: {
            id: true,
            name: true,
            roleId: true,
          },
        },
      },
      orderBy: (logs, { desc }) => [desc(logs.createdAt)],
      limit,
    });
  }
}

export const auditService = new AuditService();
