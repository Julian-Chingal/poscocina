import bcrypt from 'bcryptjs';
import { IAuthRepository, AuthenticatedUser } from '../interfaces/auth.interface.js';
import { UnauthorizedError, ForbiddenError } from '../../../errors/app-error.js';
import { auditService } from '../../../utils/audit.service.js';

export class LoginPasswordUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(email: string, password: string, clientInfo?: { ip?: string; userAgent?: string }): Promise<AuthenticatedUser> {
    const user = await this.authRepo.findUserWithRoleByEmail(email);
    if (!user) throw new UnauthorizedError('Credenciales incorrectas');
    if (!user.isActive) throw new ForbiddenError('Este usuario se encuentra inactivo');
    if (!user.passwordHash) throw new UnauthorizedError('Este usuario no tiene contraseña de acceso configurada');

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      auditService.log({
        venueId: user.venueId,
        userId: user.id,
        action: 'auth:login_failed',
        entityType: 'user',
        entityId: user.id,
        ipAddress: clientInfo?.ip,
        userAgent: clientInfo?.userAgent,
      }).catch(() => {});
      throw new UnauthorizedError('Credenciales incorrectas');
    }

    auditService.log({
      venueId: user.venueId,
      userId: user.id,
      action: 'auth:login_success',
      entityType: 'user',
      entityId: user.id,
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
