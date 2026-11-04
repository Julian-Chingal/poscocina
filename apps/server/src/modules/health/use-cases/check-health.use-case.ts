import { IHealthRepository, HealthStatus } from '../interfaces/health.interface.js';

export class CheckHealthUseCase {
  constructor(private readonly repo: IHealthRepository) {}

  async execute(): Promise<HealthStatus> {
    const [dbOk, cacheOk] = await Promise.all([
      this.repo.checkDatabase(3000),
      this.repo.checkValkey(3000),
    ]);

    const isHealthy = dbOk && cacheOk;

    return {
      status: isHealthy ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      service: 'poscocina-server',
      version: '0.1.0',
      database: dbOk ? 'up' : 'down',
      valkey: cacheOk ? 'up' : 'down',
      redis: cacheOk ? 'up' : 'down',
    };
  }
}
