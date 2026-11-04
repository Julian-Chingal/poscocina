export interface HealthStatus {
  status: 'ok' | 'degraded';
  timestamp: string;
  service: string;
  version: string;
  database: 'up' | 'down';
  valkey: 'up' | 'down';
  redis: 'up' | 'down'; // Kept for backwards compatibility
}

export interface IHealthRepository {
  checkDatabase(timeoutMs?: number): Promise<boolean>;
  checkValkey(timeoutMs?: number): Promise<boolean>;
  checkRedis(timeoutMs?: number): Promise<boolean>;
}
