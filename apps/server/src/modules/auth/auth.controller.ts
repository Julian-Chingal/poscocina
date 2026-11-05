import { FastifyRequest, FastifyReply } from 'fastify';
import { authRepository } from './repositories/auth.repository.js';
import { sessionManager } from './repositories/session-manager.repository.js';
import { LoginPinUseCase } from './use-cases/login-pin.use-case.js';
import { LoginPasswordUseCase } from './use-cases/login-password.use-case.js';
import { LoginDocumentUseCase } from './use-cases/login-document.use-case.js';
import { LoginGoogleUseCase } from './use-cases/login-google.use-case.js';
import { ManageGoogleLinkUseCase } from './use-cases/manage-google-link.use-case.js';
import { ManagerOverrideUseCase } from './use-cases/manager-override.use-case.js';
import { validate } from '../../utils/validation.util.js';
import { resolveVenueId } from '../../utils/tenant.util.js';
import {
  PinLoginSchema,
  PasswordLoginSchema,
  DocumentLoginSchema,
  SelectAuthContextSchema,
  ManagerPinOverrideSchema,
  GoogleAuthSchema,
} from '@poscocina/shared';
import { UnauthorizedError } from '../../errors/app-error.js';

export class AuthController {
  private readonly pinUseCase = new LoginPinUseCase(authRepository, sessionManager);
  private readonly passwordUseCase = new LoginPasswordUseCase(authRepository);
  private readonly documentUseCase = new LoginDocumentUseCase(authRepository, sessionManager);
  private readonly googleLoginUseCase = new LoginGoogleUseCase(authRepository);
  private readonly googleLinkUseCase = new ManageGoogleLinkUseCase(authRepository);
  private readonly overrideUseCase = new ManagerOverrideUseCase(authRepository, sessionManager);

  async getVenueUsers(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId: string };
    const targetVenueId = await resolveVenueId(request, venueId);
    const users = await authRepository.findVenueUsers(targetVenueId);
    return reply.send(users);
  }

  async loginWithDocument(request: FastifyRequest, reply: FastifyReply) {
    const data = validate(DocumentLoginSchema, request.body);

    const result = await this.documentUseCase.execute(
      data.documentNumber,
      data.pin,
      data.companyId,
      data.venueId,
      {
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      }
    );

    if (result.requiresContextSelection) {
      const selectionToken = request.server.jwt.sign(
        {
          sub: 'pending_context_selection',
          venueId: 'pending',
          name: 'pending',
          role: 'pending',
          hierarchy: 0,
          tokenVersion: 1,
        },
        { expiresIn: '5m' }
      );

      return reply.send({
        requiresContextSelection: true,
        selectionToken,
        options: result.options,
      });
    }

    const user = result.user;
    const expiresIn = user.hierarchy <= 40 ? '8h' : user.hierarchy <= 60 ? '10h' : '12h';
    const token = request.server.jwt.sign(
      {
        sub: user.id,
        companyId: user.companyId || undefined,
        venueId: user.venueId,
        allVenuesAccess: user.allVenuesAccess,
        name: user.name,
        role: user.role,
        hierarchy: user.hierarchy,
        tokenVersion: user.tokenVersion,
      },
      { expiresIn }
    );

    await sessionManager.unlockTerminal(user.id);

    return reply.send({
      requiresContextSelection: false,
      token,
      user,
      company: result.company,
      venue: result.venue,
    });
  }

  async selectAuthContext(request: FastifyRequest, reply: FastifyReply) {
    const data = validate(SelectAuthContextSchema, request.body);

    try {
      request.server.jwt.verify(data.selectionToken);
    } catch {
      throw new UnauthorizedError('El token de selección ha expirado. Digite su cédula nuevamente.');
    }

    const user = await authRepository.findUserWithRoleById(data.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Usuario no disponible');
    }

    if (user.companyId !== data.companyId || (user.venueId !== data.venueId && !user.allVenuesAccess)) {
      throw new UnauthorizedError('Contexto no autorizado para este usuario');
    }

    const expiresIn = user.roleHierarchy <= 40 ? '8h' : user.roleHierarchy <= 60 ? '10h' : '12h';
    const token = request.server.jwt.sign(
      {
        sub: user.id,
        companyId: user.companyId || undefined,
        venueId: data.venueId,
        allVenuesAccess: user.allVenuesAccess,
        name: user.name,
        role: user.roleName,
        hierarchy: user.roleHierarchy,
        tokenVersion: user.tokenVersion,
      },
      { expiresIn }
    );

    await sessionManager.unlockTerminal(user.id);

    return reply.send({
      token,
      user: {
        id: user.id,
        companyId: user.companyId,
        venueId: data.venueId,
        allVenuesAccess: user.allVenuesAccess,
        name: user.name,
        documentNumber: user.documentNumber,
        role: user.roleName,
        hierarchy: user.roleHierarchy,
        tokenVersion: user.tokenVersion,
      },
      company: user.companyId
        ? {
            id: user.companyId,
            tradeName: user.companyName,
            logoUrl: user.companyLogo,
          }
        : null,
      venue: {
        id: data.venueId,
        name: user.venueName || 'Sede',
      },
    });
  }

  async loginWithPin(request: FastifyRequest, reply: FastifyReply) {
    const data = validate(PinLoginSchema, request.body);
    const targetVenueId = await resolveVenueId(request, data.venueId);

    const user = await this.pinUseCase.execute(targetVenueId, data.userId, data.pin, {
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });

    const expiresIn = user.hierarchy <= 40 ? '8h' : user.hierarchy <= 60 ? '10h' : '12h';
    const token = request.server.jwt.sign(
      {
        sub: user.id,
        companyId: user.companyId || undefined,
        venueId: user.venueId,
        allVenuesAccess: user.allVenuesAccess,
        name: user.name,
        role: user.role,
        hierarchy: user.hierarchy,
        tokenVersion: user.tokenVersion,
      },
      { expiresIn }
    );
    return reply.send({ token, user });
  }

  async loginWithPassword(request: FastifyRequest, reply: FastifyReply) {
    const data = validate(PasswordLoginSchema, request.body);
    const result = await this.passwordUseCase.execute(data.email, data.password, {
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });

    const user = result.user;
    const expiresIn = user.hierarchy <= 40 ? '8h' : user.hierarchy <= 60 ? '10h' : '12h';
    const token = request.server.jwt.sign(
      {
        sub: user.id,
        companyId: user.companyId || undefined,
        venueId: user.venueId,
        allVenuesAccess: user.allVenuesAccess,
        name: user.name,
        role: user.role,
        hierarchy: user.hierarchy,
        tokenVersion: user.tokenVersion,
      },
      { expiresIn }
    );
    await sessionManager.unlockTerminal(user.id);
    return reply.send({
      token,
      user,
      company: result.company,
      availableVenues: result.availableVenues,
    });
  }

  async lockTerminal(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user?.sub) {
      return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'No autenticado' });
    }
    await sessionManager.lockTerminal(request.user.sub);
    return reply.send({ success: true, message: 'Terminal bloqueada exitosamente' });
  }

  async getMe(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user?.sub) {
      return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'No autenticado' });
    }
    const user = await authRepository.findUserWithRoleById(request.user.sub);
    return reply.send({ user });
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    if (request.user?.sub) {
      await this.overrideUseCase.logout(request.user.sub);
      await sessionManager.unlockTerminal(request.user.sub);
    }
    return reply.send({ success: true, message: 'Sesión finalizada exitosamente' });
  }

  async managerPinOverride(request: FastifyRequest, reply: FastifyReply) {
    const data = validate(ManagerPinOverrideSchema, request.body);
    const targetVenueId = await resolveVenueId(request, data.venueId);
    const result = await this.overrideUseCase.execute(targetVenueId, data.managerPin, data.action, data.reason, {
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });
    return reply.send(result);
  }

  async loginWithGoogle(request: FastifyRequest, reply: FastifyReply) {
    const data = validate(GoogleAuthSchema, request.body);
    const result = await this.googleLoginUseCase.execute(data.idToken, {
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });

    const user = result.user;
    const expiresIn = user.hierarchy <= 40 ? '8h' : user.hierarchy <= 60 ? '10h' : '12h';
    const token = request.server.jwt.sign(
      {
        sub: user.id,
        companyId: user.companyId || undefined,
        venueId: user.venueId,
        allVenuesAccess: user.allVenuesAccess,
        name: user.name,
        role: user.role,
        hierarchy: user.hierarchy,
        tokenVersion: user.tokenVersion,
      },
      { expiresIn }
    );
    await sessionManager.unlockTerminal(user.id);
    return reply.send({
      token,
      user,
      company: result.company,
      availableVenues: result.availableVenues,
    });
  }

  async getGoogleClientId(_request: FastifyRequest, reply: FastifyReply) {
    const clientId = process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || '';
    return reply.send({ clientId });
  }

  async linkGoogle(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user?.sub) {
      return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'No autenticado' });
    }
    const data = validate(GoogleAuthSchema, request.body);
    const result = await this.googleLinkUseCase.link(request.user.sub, data.idToken, {
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });
    return reply.send(result);
  }

  async unlinkGoogle(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user?.sub) {
      return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'No autenticado' });
    }
    const result = await this.googleLinkUseCase.unlink(request.user.sub, {
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });
    return reply.send(result);
  }

  async getAccountProfile(request: FastifyRequest, reply: FastifyReply) {
    if (!request.user?.sub) {
      return reply.status(401).send({ statusCode: 401, error: 'Unauthorized', message: 'No autenticado' });
    }
    const user = await authRepository.findUserWithRoleById(request.user.sub);
    if (!user) {
      return reply.status(404).send({ statusCode: 404, error: 'Not Found', message: 'Usuario no encontrado' });
    }

    return reply.send({
      id: user.id,
      name: user.name,
      email: user.email,
      documentNumber: user.documentNumber,
      roleName: user.roleName,
      roleHierarchy: user.roleHierarchy,
      companyId: user.companyId,
      companyName: user.companyName,
      companyLogo: user.companyLogo,
      venueId: user.venueId,
      venueName: user.venueName,
      allVenuesAccess: user.allVenuesAccess,
      hasGoogleLinked: Boolean(user.googleId),
      googleEmail: user.googleEmail,
      hasPassword: Boolean(user.passwordHash),
      hasPin: Boolean(user.pinHash),
    });
  }
}

export const authController = new AuthController();
