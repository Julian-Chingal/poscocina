import bcrypt from 'bcryptjs';
import { IAuthRepository, ISessionManager, AuthenticatedUser } from '../interfaces/auth.interface.js';
import { UnauthorizedError, ForbiddenError } from '../../../errors/app-error.js';
import { auditService } from '../../../utils/audit.service.js';

export interface ContextOption {
  userId: string;
  companyId: string;
  companyName: string;
  companyLogo?: string | null;
  venueId: string;
  venueName: string;
  roleName: string;
  roleLabel: string;
}

export type DocumentLoginResult =
  | {
      requiresContextSelection: false;
      user: AuthenticatedUser;
      company: {
        id: string;
        tradeName: string;
        logoUrl?: string | null;
      } | null;
      venue: {
        id: string;
        name: string;
      } | null;
    }
  | {
      requiresContextSelection: true;
      options: ContextOption[];
    };

export class LoginDocumentUseCase {
  constructor(
    private readonly authRepo: IAuthRepository,
    private readonly sessionMgr: ISessionManager
  ) {}

  async execute(
    documentNumber: string,
    pin: string,
    preferredCompanyId?: string,
    preferredVenueId?: string,
    clientInfo?: { ip?: string; userAgent?: string }
  ): Promise<DocumentLoginResult> {
    const candidates = await this.authRepo.findUsersWithRoleByDocument(documentNumber);
    if (!candidates || candidates.length === 0) {
      throw new UnauthorizedError('Cédula o PIN incorrecto');
    }

    // Comprobar PIN contra cada cuenta activa registrada con esa cédula
    const matchingUsers: typeof candidates = [];
    for (const candidate of candidates) {
      if (candidate.pinHash) {
        const isMatch = await bcrypt.compare(pin, candidate.pinHash);
        if (isMatch) {
          matchingUsers.push(candidate);
        }
      }
    }

    if (matchingUsers.length === 0) {
      auditService.log({
        action: 'auth:document_pin_failed',
        entityType: 'user',
        ipAddress: clientInfo?.ip,
        userAgent: clientInfo?.userAgent,
        payload: { documentNumber },
      }).catch(() => {});
      throw new UnauthorizedError('Cédula o PIN incorrecto');
    }

    // Si se especificó una empresa o sede específica (ej. terminal contextualizada)
    let selectedUser = matchingUsers[0];
    if (preferredCompanyId && preferredVenueId) {
      const specific = matchingUsers.find(
        (u) => u.companyId === preferredCompanyId && u.venueId === preferredVenueId
      );
      if (specific) {
        selectedUser = specific;
      }
    } else if (matchingUsers.length > 1) {
      // Múltiples restaurantes para el mismo colaborador: requiere selección
      return {
        requiresContextSelection: true,
        options: matchingUsers.map((u) => ({
          userId: u.id,
          companyId: u.companyId || '',
          companyName: u.companyName || 'Restaurante',
          companyLogo: u.companyLogo,
          venueId: u.venueId || '',
          venueName: u.venueName || 'Sede Principal',
          roleName: u.roleName,
          roleLabel: u.roleLabel || u.roleName,
        })),
      };
    }

    if (selectedUser.venueIsActive === false) {
      throw new ForbiddenError('La sede a la que pertenece este usuario se encuentra inactiva.');
    }

    auditService.log({
      venueId: selectedUser.venueId,
      userId: selectedUser.id,
      action: 'auth:document_login_success',
      entityType: 'user',
      entityId: selectedUser.id,
      ipAddress: clientInfo?.ip,
      userAgent: clientInfo?.userAgent,
    }).catch(() => {});

    return {
      requiresContextSelection: false,
      user: {
        id: selectedUser.id,
        companyId: selectedUser.companyId,
        venueId: selectedUser.venueId,
        allVenuesAccess: selectedUser.allVenuesAccess,
        name: selectedUser.name,
        documentNumber: selectedUser.documentNumber,
        role: selectedUser.roleName,
        hierarchy: selectedUser.roleHierarchy,
        tokenVersion: selectedUser.tokenVersion,
      },
      company: selectedUser.companyId
        ? {
            id: selectedUser.companyId,
            tradeName: selectedUser.companyName || 'Restaurante',
            logoUrl: selectedUser.companyLogo,
          }
        : null,
      venue: selectedUser.venueId
        ? {
            id: selectedUser.venueId,
            name: selectedUser.venueName || 'Sede Principal',
          }
        : null,
    };
  }
}
