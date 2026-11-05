import { IAuthRepository } from '../interfaces/auth.interface.js';
import { googleAuthService } from '../services/google-auth.service.js';
import { BadRequestError, NotFoundError } from '../../../errors/app-error.js';
import { auditService } from '../../../utils/audit.service.js';

export class ManageGoogleLinkUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async link(
    userId: string,
    idToken: string,
    clientInfo?: { ip?: string; userAgent?: string }
  ): Promise<{ success: boolean; googleEmail: string }> {
    const googleProfile = await googleAuthService.verifyIdToken(idToken);

    // Verificar si ya existe otro usuario con este googleId
    const existingUser = await this.authRepo.findUserWithRoleByGoogleId(googleProfile.sub);
    if (existingUser && existingUser.id !== userId) {
      throw new BadRequestError(
        `Esta cuenta de Google (${googleProfile.email}) ya se encuentra vinculada a otro usuario.`
      );
    }

    const currentUser = await this.authRepo.findUserWithRoleById(userId);
    if (!currentUser) {
      throw new NotFoundError('Usuario no encontrado');
    }

    await this.authRepo.linkGoogleAccount(userId, googleProfile.sub, googleProfile.email);

    auditService.log({
      venueId: currentUser.venueId,
      userId: currentUser.id,
      action: 'auth:google_linked',
      entityType: 'user',
      entityId: currentUser.id,
      ipAddress: clientInfo?.ip,
      userAgent: clientInfo?.userAgent,
      payload: { googleEmail: googleProfile.email },
    }).catch(() => {});

    return {
      success: true,
      googleEmail: googleProfile.email,
    };
  }

  async unlink(
    userId: string,
    clientInfo?: { ip?: string; userAgent?: string }
  ): Promise<{ success: boolean }> {
    const currentUser = await this.authRepo.findUserWithRoleById(userId);
    if (!currentUser) {
      throw new NotFoundError('Usuario no encontrado');
    }

    if (!currentUser.googleId) {
      throw new BadRequestError('Esta cuenta no tiene ninguna cuenta de Google vinculada.');
    }

    // Regla de seguridad: Impedir bloqueo si no cuenta con contraseña ni PIN
    const hasAlternativeLogin = Boolean(currentUser.passwordHash || currentUser.pinHash);
    if (!hasAlternativeLogin) {
      throw new BadRequestError(
        'No puedes desvincular tu cuenta de Google porque no tienes una contraseña o PIN configurado para acceder al sistema.'
      );
    }

    await this.authRepo.unlinkGoogleAccount(userId);

    auditService.log({
      venueId: currentUser.venueId,
      userId: currentUser.id,
      action: 'auth:google_unlinked',
      entityType: 'user',
      entityId: currentUser.id,
      ipAddress: clientInfo?.ip,
      userAgent: clientInfo?.userAgent,
    }).catch(() => {});

    return { success: true };
  }
}
