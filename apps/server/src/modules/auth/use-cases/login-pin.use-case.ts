import bcrypt from 'bcryptjs';
import { IAuthRepository, ISessionManager, AuthenticatedUser } from '../interfaces/auth.interface.js';
import { NotFoundError, UnauthorizedError, ForbiddenError } from '../../../errors/app-error.js';
import { auditService } from '../../../utils/audit.service.js';
import { PIN_RESTRICTED_HIERARCHY } from '@poscocina/shared';

export class LoginPinUseCase {
  constructor(
    private readonly authRepo: IAuthRepository,
    private readonly sessionMgr: ISessionManager
  ) {}

  async execute(venueId: string, userId: string, pin: string, clientInfo?: { ip?: string; userAgent?: string }): Promise<AuthenticatedUser> {
    const isLocked = await this.sessionMgr.isLocked(userId);
    if (isLocked) {
      const ttl = await this.sessionMgr.getLockoutTtl(userId);
      const minutes = Math.max(1, Math.ceil(ttl / 60));
      throw new ForbiddenError(`Terminal bloqueada por demasiados intentos fallidos. Espere ${minutes} minuto(s).`);
    }

    const user = await this.authRepo.findUserWithRoleById(userId);
    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    if (venueId && venueId !== 'default' && user.venueId !== venueId) {
      throw new ForbiddenError('No tienes acceso a esta sede.');
    }

    if (user.venueIsActive === false) {
      throw new ForbiddenError('La sede a la que pertenece este usuario se encuentra inactiva.');
    }

    const targetVenueId = user.venueId || venueId;
    if (!user.isActive) {
      throw new ForbiddenError('Este usuario se encuentra inactivo');
    }
    if (
      user.roleName === 'manager' ||
      user.roleName === 'super_admin' ||
      (user.roleHierarchy !== undefined && user.roleHierarchy >= PIN_RESTRICTED_HIERARCHY && user.roleHierarchy > 10)
    ) {
      throw new ForbiddenError(
        'Este rol requiere autenticación completa por correo y contraseña. El acceso por PIN rápido está reservado para roles operativos.'
      );
    }
    if (!user.pinHash) {
      throw new UnauthorizedError('El usuario no tiene PIN asignado');
    }

    const isMatch = await bcrypt.compare(pin, user.pinHash);
    if (!isMatch) {
      const attempts = await this.sessionMgr.recordFailedAttempt(userId);
      const remaining = Math.max(0, 5 - attempts);
      auditService.log({
        venueId: targetVenueId,
        userId,
        action: 'auth:pin_failed',
        entityType: 'user',
        entityId: userId,
        ipAddress: clientInfo?.ip,
        userAgent: clientInfo?.userAgent,
        payload: { attempts, remainingAttempts: remaining },
      }).catch(() => {});

      if (remaining === 0) {
        throw new ForbiddenError('Demasiados intentos erróneos. Terminal bloqueada por 5 minutos.');
      }
      throw new UnauthorizedError(`PIN incorrecto. Le quedan ${remaining} intento(s).`);
    }

    await this.sessionMgr.resetFailedAttempts(userId);
    await this.sessionMgr.unlockTerminal(userId);

    auditService.log({
      venueId: targetVenueId,
      userId,
      action: 'auth:pin_login',
      entityType: 'user',
      entityId: userId,
      ipAddress: clientInfo?.ip,
      userAgent: clientInfo?.userAgent,
    }).catch(() => {});

    return {
      id: user.id,
      venueId: user.venueId,
      name: user.name,
      email: user.email,
      role: user.roleName,
      hierarchy: user.roleHierarchy,
      tokenVersion: user.tokenVersion,
    };
  }
}
