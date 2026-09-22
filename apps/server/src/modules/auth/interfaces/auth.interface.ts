export interface AuthenticatedUser {
  id: string;
  venueId: string;
  name: string;
  email?: string | null;
  role: string;
  hierarchy: number;
  tokenVersion: number;
}

export interface IAuthRepository {
  findVenueUsers(venueId: string): Promise<any[]>;
  findUserWithRoleById(userId: string): Promise<any>;
  findUserWithRoleByEmail(email: string): Promise<any>;
  findManagersByVenue(venueId: string): Promise<any[]>;
  incrementTokenVersion(userId: string): Promise<void>;
}

export interface ISessionManager {
  isLocked(userId: string): Promise<boolean>;
  getLockoutTtl(userId: string): Promise<number>;
  recordFailedAttempt(userId: string): Promise<number>;
  resetFailedAttempts(userId: string): Promise<void>;
  blacklistToken(userId: string, ttlSeconds: number): Promise<void>;
}
