import { FastifyRequest, FastifyReply } from 'fastify';
import { authRepository } from './repositories/auth.repository.js';
import { sessionManager } from './repositories/session-manager.repository.js';
import { LoginPinUseCase } from './use-cases/login-pin.use-case.js';
import { LoginPasswordUseCase } from './use-cases/login-password.use-case.js';
import { ManagerOverrideUseCase } from './use-cases/manager-override.use-case.js';
import { validate } from '../../utils/validation.util.js';
import { resolveVenueId } from '../../utils/tenant.util.js';
import { PinLoginSchema, PasswordLoginSchema, ManagerPinOverrideSchema } from '@poscocina/shared';

export class AuthController {
  private readonly pinUseCase = new LoginPinUseCase(authRepository, sessionManager);
  private readonly passwordUseCase = new LoginPasswordUseCase(authRepository);
  private readonly overrideUseCase = new ManagerOverrideUseCase(authRepository, sessionManager);

  async getVenueUsers(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId: string };
    const targetVenueId = await resolveVenueId(request, venueId);
    const users = await authRepository.findVenueUsers(targetVenueId);
    return reply.send(users);
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
      { sub: user.id, venueId: user.venueId, name: user.name, role: user.role, hierarchy: user.hierarchy, tokenVersion: user.tokenVersion },
      { expiresIn }
    );
    return reply.send({ token, user });
  }

  async loginWithPassword(request: FastifyRequest, reply: FastifyReply) {
    const data = validate(PasswordLoginSchema, request.body);
    const user = await this.passwordUseCase.execute(data.email, data.password, {
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });

    const expiresIn = user.hierarchy <= 40 ? '8h' : user.hierarchy <= 60 ? '10h' : '12h';
    const token = request.server.jwt.sign(
      { sub: user.id, venueId: user.venueId, name: user.name, role: user.role, hierarchy: user.hierarchy, tokenVersion: user.tokenVersion },
      { expiresIn }
    );
    return reply.send({ token, user });
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
}

export const authController = new AuthController();
