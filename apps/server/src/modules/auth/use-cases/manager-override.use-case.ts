import bcrypt from 'bcryptjs';
import { IAuthRepository, ISessionManager } from '../interfaces/auth.interface.js';
import { UnauthorizedError } from '../../../errors/app-error.js';
import { auditService } from '../../../utils/audit.service.js';

export class ManagerOverrideUseCase {
  constructor(
    private readonly authRepo: IAuthRepository,
    private readonly sessionMgr: ISessionManager
  ) {}

  async execute(venueId: string, managerPin: string, action: string, reason: string, clientInfo?: { ip?: string; userAgent?: string }) {
    const managers = await this.authRepo.findManagersByVenue(venueId);
    let authorizedManager: any = null;

    for (const m of managers) {
      if (m.pinHash && (m.roleHierarchy >= 60 || m.roleName === 'manager' || m.roleName === 'super_admin')) {
        const match = await bcrypt.compare(managerPin, m.pinHash);
        if (match) {
          authorizedManager = m;
          break;
        }
      }
    }

    if (!authorizedManager) {
      throw new UnauthorizedError('PIN de autorización inválido o nivel de permisos insuficiente');
    }

    auditService.log({
      venueId,
      userId: authorizedManager.id,
      action: 'auth:manager_override',
      entityType: 'authorization',
      ipAddress: clientInfo?.ip,
      userAgent: clientInfo?.userAgent,
      payload: { action, reason, authorizedBy: authorizedManager.name },
    }).catch(() => {});

    return { authorized: true, managerId: authorizedManager.id, managerName: authorizedManager.name, action };
  }

  async logout(userId: string): Promise<void> {
    await this.authRepo.incrementTokenVersion(userId);
    await this.sessionMgr.blacklistToken(userId, 86400);
  }
}
