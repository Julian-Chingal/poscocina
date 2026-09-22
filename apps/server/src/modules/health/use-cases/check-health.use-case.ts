import { IHealthRepository, HealthStatus } from '../interfaces/health.interface.js';

export class CheckHealthUseCase {
  constructor(private readonly repo: IHealthRepository) {}

  async execute(): Promise<HealthStatus> {
    const [dbOk, redisOk] = await Promise.all([
      this.repo.checkDatabase(3000),
      this.repo.checkRedis(3000),
    ]);

    const isHealthy = dbOk && redisOk;

    return {
      status: isHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      service: 'poscocina-server',
      version: '0.1.0',
      database: dbOk ? 'up' : 'down',
      redis: redisOk ? 'up' : 'down',
    };
  }
}
