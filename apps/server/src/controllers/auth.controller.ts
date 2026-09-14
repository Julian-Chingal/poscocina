import { FastifyRequest, FastifyReply } from 'fastify';
import { authService } from '../services/auth.service.js';
import { validate } from '../utils/validation.util.js';
import { resolveVenueId } from '../utils/tenant.util.js';
import { PinLoginSchema, PasswordLoginSchema, ManagerPinOverrideSchema } from '@poscocina/shared';

export class AuthController {
  async getVenueUsers(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId: string };
    const targetVenueId = await resolveVenueId(request, venueId);
    const users = await authService.getVenueUsers(targetVenueId);
    return reply.send(users);
  }

  async loginWithPin(request: FastifyRequest, reply: FastifyReply) {
    const data = validate(PinLoginSchema, request.body);
    const targetVenueId = await resolveVenueId(request, data.venueId);

    const user = await authService.loginWithPin(targetVenueId, data.userId, data.pin, {
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });

    const expiresIn = user.hierarchy <= 40 ? '8h' : user.hierarchy <= 60 ? '10h' : '12h';

    const token = request.server.jwt.sign(
      {
        sub: user.id,
        venueId: user.venueId,
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

    const user = await authService.loginWithPassword(data.email, data.password, {
      ip: request.ip,
      userAgent: request.headers['user-agent'],
    });

    const expiresIn = user.hierarchy <= 40 ? '8h' : user.hierarchy <= 60 ? '10h' : '12h';

    const token = request.server.jwt.sign(
      {
        sub: user.id,
        venueId: user.venueId,
        name: user.name,
        role: user.role,
        hierarchy: user.hierarchy,
        tokenVersion: user.tokenVersion,
      },
      { expiresIn }
    );

    return reply.send({ token, user });
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    if (request.user?.sub) {
      await authService.invalidateUserSession(request.user.sub, request.user.venueId);
    }
    return reply.send({ success: true, message: 'Sesión finalizada exitosamente' });
  }

  async managerPinOverride(request: FastifyRequest, reply: FastifyReply) {
    const data = validate(ManagerPinOverrideSchema, request.body);
    const targetVenueId = await resolveVenueId(request, data.venueId);

    const result = await authService.verifyManagerPinOverride(
      targetVenueId,
      data.managerPin,
      data.action,
      data.reason,
      {
        ip: request.ip,
        userAgent: request.headers['user-agent'],
      }
    );

    return reply.send(result);
  }
}

export const authController = new AuthController();
