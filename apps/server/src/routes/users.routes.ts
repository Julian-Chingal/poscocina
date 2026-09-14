import { FastifyInstance } from 'fastify';
import { ROLES } from '@poscocina/shared';
import { usersController } from '../controllers/users.controller.js';

export async function usersRoutes(fastify: FastifyInstance) {
  const managerGuard = {
    preHandler: [
      fastify.authenticate,
      fastify.requireRole([ROLES.MANAGER, ROLES.SUPER_ADMIN]),
    ],
  };

  const staffGuard = {
    preHandler: [fastify.authenticate],
  };

  // 1. Get system roles
  fastify.get('/api/roles', staffGuard, (request, reply) =>
    usersController.getRoles(request, reply)
  );

  // 2. List users for management (all active/inactive employees)
  fastify.get('/api/venues/:venueId/users', staffGuard, (request, reply) =>
    usersController.getVenueUsers(request, reply)
  );

  // 3. Create new user/employee (Manager only)
  fastify.post('/api/venues/:venueId/users', managerGuard, (request, reply) =>
    usersController.createUser(request, reply)
  );

  // 4. Update user/employee details (Manager only)
  fastify.patch('/api/venues/:venueId/users/:id', managerGuard, (request, reply) =>
    usersController.updateUser(request, reply)
  );

  // 5. Reset user PIN (Manager only)
  fastify.post('/api/venues/:venueId/users/:id/reset-pin', managerGuard, (request, reply) =>
    usersController.resetPin(request, reply)
  );

  // 6. Delete / Deactivate user (Manager only)
  fastify.delete('/api/venues/:venueId/users/:id', managerGuard, (request, reply) =>
    usersController.deleteUser(request, reply)
  );
}
