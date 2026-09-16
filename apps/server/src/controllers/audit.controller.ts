import { FastifyRequest, FastifyReply } from 'fastify';
import { auditService } from '../services/audit.service.js';
import { resolveVenueId } from '../utils/tenant.util.js';

export class AuditController {
  async getLogs(request: FastifyRequest, reply: FastifyReply) {
    const venueId = await resolveVenueId(request);
    const { action, limit } = request.query as { action?: string; limit?: string };

    const logs = await auditService.getAuditLogs(venueId, {
      action,
      limit: limit ? parseInt(limit, 10) : 50,
    });

    return reply.send(logs);
  }
}

export const auditController = new AuditController();
