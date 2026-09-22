export interface HealthStatus {
  status: 'ok' | 'degraded';
  timestamp: string;
  service: string;
  version: string;
  database: 'up' | 'down';
  redis: 'up' | 'down';
}

export interface IHealthRepository {
  checkDatabase(timeoutMs?: number): Promise<boolean>;
  checkRedis(timeoutMs?: number): Promise<boolean>;
}
