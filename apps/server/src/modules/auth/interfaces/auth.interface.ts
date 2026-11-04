export interface AuthenticatedUser {
  id: string;
  companyId?: string | null;
  venueId: string;
  allVenuesAccess?: boolean;
  name: string;
  email?: string | null;
  documentNumber?: string | null;
  role: string;
  hierarchy: number;
  tokenVersion: number;
}

export interface IAuthRepository {
  findVenueUsers(venueId: string): Promise<any[]>;
  findUserWithRoleById(userId: string): Promise<any>;
  findUserWithRoleByEmail(email: string): Promise<any>;
  findUsersWithRoleByDocument(documentNumber: string): Promise<any[]>;
  findManagersByVenue(venueId: string): Promise<any[]>;
  incrementTokenVersion(userId: string): Promise<void>;
  findCompanyVenues(companyId: string): Promise<any[]>;
}

export interface ISessionManager {
  isLocked(userId: string): Promise<boolean>;
  getLockoutTtl(userId: string): Promise<number>;
  recordFailedAttempt(userId: string): Promise<number>;
  resetFailedAttempts(userId: string): Promise<void>;
  blacklistToken(userId: string, ttlSeconds: number): Promise<void>;
  lockTerminal(userId: string, ttlSeconds?: number): Promise<void>;
  unlockTerminal(userId: string): Promise<void>;
  isTerminalLocked(userId: string): Promise<boolean>;
}
