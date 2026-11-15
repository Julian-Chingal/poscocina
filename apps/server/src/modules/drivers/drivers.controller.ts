import { FastifyRequest, FastifyReply } from 'fastify';
import { validate } from '../../utils/validation.util.js';
import {
  RegisterDriverSchema,
  ConfirmPickupPinSchema,
  CompleteDeliverySchema,
  UpdateDriverStatusSchema,
} from '@poscocina/shared';
import { driversService } from './drivers.service.js';

export class DriversController {
  /**
   * Public courier registration
   */
  async register(request: FastifyRequest, reply: FastifyReply) {
    const data = validate(RegisterDriverSchema, request.body);
    const result = await driversService.registerDriver(data);

    // Issue standard JWT session for the driver
    const token = request.server.jwt.sign(
      {
        sub: result.user.id,
        role: result.user.role,
        name: result.user.name,
        venueId: '',
        hierarchy: 30,
        tokenVersion: 1,
        allVenuesAccess: true,
      },
      { expiresIn: '30d' }
    );

    return reply.status(201).send({
      token,
      user: result.user,
      profile: result.profile,
    });
  }

  /**
   * Current driver profile
   */
  async getProfile(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request as any).user?.sub;
    if (!userId) {
      return reply.status(401).send({ error: 'No autenticado' });
    }

    const profile = await driversService.getDriverProfile(userId);
    return reply.send(profile);
  }

  /**
   * Update online/offline status and GPS location
   */
  async updateStatus(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request as any).user?.sub;
    if (!userId) {
      return reply.status(401).send({ error: 'No autenticado' });
    }

    const data = validate(UpdateDriverStatusSchema, request.body);
    const profile = await driversService.updateStatus(userId, data.status, data.currentLat, data.currentLng);
    return reply.send(profile);
  }

  /**
   * Unassigned delivery orders in the city pool
   */
  async getAvailableOrders(request: FastifyRequest, reply: FastifyReply) {
    const orders = await driversService.getAvailableOrders();
    return reply.send(orders);
  }

  /**
   * Claim an unassigned delivery order
   */
  async claimOrder(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request as any).user?.sub;
    if (!userId) {
      return reply.status(401).send({ error: 'No autenticado' });
    }

    const { id } = request.params as { id: string };
    try {
      const order = await driversService.claimOrder(id, userId, request.server.io);
      return reply.send({ success: true, order });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  }

  /**
   * Step 1 Handshake: Confirm pickup at restaurant with pickupPin
   */
  async confirmPickup(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request as any).user?.sub;
    if (!userId) {
      return reply.status(401).send({ error: 'No autenticado' });
    }

    const { id } = request.params as { id: string };
    const { pickupPin } = validate(ConfirmPickupPinSchema, request.body);

    try {
      const order = await driversService.confirmPickup(id, userId, pickupPin, request.server.io);
      return reply.send({ success: true, order });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  }

  /**
   * Step 2 Handshake: Complete delivery at customer door with deliveryPin
   */
  async completeDelivery(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request as any).user?.sub;
    if (!userId) {
      return reply.status(401).send({ error: 'No autenticado' });
    }

    const { id } = request.params as { id: string };
    const { deliveryPin } = validate(CompleteDeliverySchema, request.body);

    try {
      const order = await driversService.completeDelivery(id, userId, deliveryPin, request.server.io);
      return reply.send({ success: true, order });
    } catch (err: any) {
      return reply.status(400).send({ error: err.message });
    }
  }

  /**
   * Courier digital wallet, balance and transaction ledger
   */
  async getWallet(request: FastifyRequest, reply: FastifyReply) {
    const userId = (request as any).user?.sub;
    if (!userId) {
      return reply.status(401).send({ error: 'No autenticado' });
    }

    const wallet = await driversService.getDriverWallet(userId);
    return reply.send(wallet);
  }
}

export const driversController = new DriversController();
