import { IAuthRepository, AuthenticatedUser } from '../interfaces/auth.interface.js';
import { googleAuthService } from '../services/google-auth.service.js';
import { UnauthorizedError, ForbiddenError } from '../../../errors/app-error.js';
import { auditService } from '../../../utils/audit.service.js';

export interface GoogleLoginResult {
  user: AuthenticatedUser;
  company?: {
    id: string;
    tradeName?: string;
    logoUrl?: string | null;
  } | null;
  availableVenues: any[];
}

export class LoginGoogleUseCase {
  constructor(private readonly authRepo: IAuthRepository) {}

  async execute(
    idToken: string,
    clientInfo?: { ip?: string; userAgent?: string }
  ): Promise<GoogleLoginResult> {
    const googleProfile = await googleAuthService.verifyIdToken(idToken);

    // 1. Buscar si ya existe un usuario vinculado con este Google ID
    let user = await this.authRepo.findUserWithRoleByGoogleId(googleProfile.sub);

    // 2. Si no existe por googleId, buscar por email registrado
    if (!user) {
      user = await this.authRepo.findUserWithRoleByEmail(googleProfile.email);
      if (user) {
        // Vinculación automática en el primer inicio de sesión con email coincidente
        await this.authRepo.linkGoogleAccount(user.id, googleProfile.sub, googleProfile.email);
        user.googleId = googleProfile.sub;
        user.googleEmail = googleProfile.email;
      }
    }

    if (!user) {
      throw new UnauthorizedError(
        `No existe ningún usuario en el sistema con el correo de Google (${googleProfile.email}). Contacta a tu administrador.`
      );
    }

    if (!user.isActive) {
      throw new ForbiddenError('Este usuario se encuentra inactivo.');
    }

    if (user.roleName !== 'super_admin' && user.venueIsActive === false) {
      throw new ForbiddenError('La sede a la que pertenece este usuario se encuentra inactiva.');
    }

    auditService.log({
      venueId: user.venueId,
      userId: user.id,
      action: 'auth:google_login_success',
      entityType: 'user',
      entityId: user.id,
      ipAddress: clientInfo?.ip,
      userAgent: clientInfo?.userAgent,
      payload: { googleEmail: googleProfile.email },
    }).catch(() => {});

    const availableVenues = user.companyId
      ? await this.authRepo.findCompanyVenues(user.companyId)
      : user.venueId
      ? [{ id: user.venueId, name: user.venueName, isActive: user.venueIsActive }]
      : [];

    return {
      user: {
        id: user.id,
        companyId: user.companyId,
        venueId: user.venueId,
        allVenuesAccess: user.allVenuesAccess,
        name: user.name,
        email: user.email,
        documentNumber: user.documentNumber,
        role: user.roleName,
        hierarchy: user.roleHierarchy,
        tokenVersion: user.tokenVersion,
        googleId: user.googleId,
        googleEmail: user.googleEmail,
      },
      company: user.companyId
        ? {
            id: user.companyId,
            tradeName: user.companyName,
            logoUrl: user.companyLogo,
          }
        : null,
      availableVenues,
    };
  }
}
