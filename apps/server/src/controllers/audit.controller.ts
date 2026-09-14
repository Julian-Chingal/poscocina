import { FastifyRequest, FastifyReply } from 'fastify';
import { auditService } from '../services/audit.service.js';
import { resolveVenueId } from '../utils/tenant.util.js';

export class AuditController {
  async getAuditLogs(request: FastifyRequest, reply: FastifyReply) {
    const { limit = '50' } = request.query as { limit?: string; action?: string };
    const venueId = await resolveVenueId(request);

    const logs = await auditService.getAuditLogs(venueId, Number(limit) || 50);
    return reply.send(logs);
  }
}

export const auditController = new AuditController();
