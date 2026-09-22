import { FastifyRequest, FastifyReply } from 'fastify';
import { CheckHealthUseCase } from './use-cases/check-health.use-case.js';
import { healthRepository } from './repositories/health.repository.js';

export class HealthController {
  private readonly checkHealthUseCase = new CheckHealthUseCase(healthRepository);

  async check(request: FastifyRequest, reply: FastifyReply) {
    const health = await this.checkHealthUseCase.execute();
    const statusCode = health.status === 'ok' ? 200 : 503;
    return reply.status(statusCode).send(health);
  }
}

export const healthController = new HealthController();
