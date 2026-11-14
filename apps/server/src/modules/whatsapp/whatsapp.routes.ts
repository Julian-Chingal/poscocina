import { FastifyInstance } from 'fastify';
import { whatsAppController } from './whatsapp.controller.js';

export async function whatsAppRoutes(fastify: FastifyInstance) {
  // 1. Inbound Webhook from WAHA (public)
  fastify.post('/api/webhooks/waha', (req, rep) => whatsAppController.handleWebhook(req, rep));

  // 2. Staff Chat Management Endpoints (authenticated)
  fastify.get(
    '/api/venues/:venueId/whatsapp/chats',
    { preHandler: [fastify.authenticate] },
    (req, rep) => whatsAppController.getVenueChats(req, rep)
  );

  fastify.get(
    '/api/whatsapp/chats/:chatId/messages',
    { preHandler: [fastify.authenticate] },
    (req, rep) => whatsAppController.getChatMessages(req, rep)
  );

  fastify.post(
    '/api/whatsapp/chats/:chatId/messages',
    { preHandler: [fastify.authenticate] },
    (req, rep) => whatsAppController.sendChatMessage(req, rep)
  );

  fastify.get(
    '/api/venues/:venueId/whatsapp/session',
    { preHandler: [fastify.authenticate] },
    (req, rep) => whatsAppController.getVenueSessionStatus(req, rep)
  );

  fastify.post(
    '/api/venues/:venueId/whatsapp/session/start',
    { preHandler: [fastify.authenticate] },
    (req, rep) => whatsAppController.startVenueSession(req, rep)
  );
}
