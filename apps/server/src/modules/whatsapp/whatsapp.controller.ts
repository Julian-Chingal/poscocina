import { FastifyRequest, FastifyReply } from 'fastify';
import { eq, desc, asc } from 'drizzle-orm';
import { db } from '../../db/index.js';
import * as schema from '../../db/schema.js';
import { handleIncomingWahaMessageUseCase } from './use-cases/handle-incoming-waha-message.use-case.js';
import { wahaService } from './services/waha.service.js';
import { WahaWebhookPayload } from './interfaces/waha.types.js';

export class WhatsAppController {
  async handleWebhook(request: FastifyRequest, reply: FastifyReply) {
    const payload = request.body as WahaWebhookPayload;
    if (!payload) {
      return reply.status(400).send({ error: 'Payload required' });
    }

    try {
      const result = await handleIncomingWahaMessageUseCase.execute(payload, request.server.io);
      return reply.status(200).send({ success: true, ...result });
    } catch (err: any) {
      request.log.error({ err }, 'Error processing WAHA webhook');
      return reply.status(200).send({ success: false, error: err.message });
    }
  }

  async getVenueChats(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId: string };
    if (!venueId) {
      return reply.status(400).send({ error: 'venueId is required' });
    }

    const chats = await db
      .select()
      .from(schema.whatsappChats)
      .where(eq(schema.whatsappChats.venueId, venueId))
      .orderBy(desc(schema.whatsappChats.lastMessageAt));

    return reply.send(chats);
  }

  async getChatMessages(request: FastifyRequest, reply: FastifyReply) {
    const { chatId } = request.params as { chatId: string };
    if (!chatId) {
      return reply.status(400).send({ error: 'chatId is required' });
    }

    const messages = await db
      .select()
      .from(schema.whatsappMessages)
      .where(eq(schema.whatsappMessages.chatId, chatId))
      .orderBy(asc(schema.whatsappMessages.createdAt));

    // Reset unread count for this chat
    await db
      .update(schema.whatsappChats)
      .set({ unreadCount: 0 })
      .where(eq(schema.whatsappChats.id, chatId));

    return reply.send(messages);
  }

  async sendChatMessage(request: FastifyRequest, reply: FastifyReply) {
    const { chatId } = request.params as { chatId: string };
    const { text } = request.body as { text: string };

    if (!chatId || !text || !text.trim()) {
      return reply.status(400).send({ error: 'chatId and non-empty text are required' });
    }

    const [chat] = await db
      .select()
      .from(schema.whatsappChats)
      .where(eq(schema.whatsappChats.id, chatId))
      .limit(1);

    if (!chat) {
      return reply.status(404).send({ error: 'Chat not found' });
    }

    const sessionName = `venue_${chat.venueId}`;
    // Dispatch via WAHA API
    const wahaRes = await wahaService.sendText(sessionName, chat.phone, text.trim());

    // Record outbound message in database
    const [inserted] = await db
      .insert(schema.whatsappMessages)
      .values({
        chatId,
        venueId: chat.venueId,
        wahaMessageId: wahaRes?.id || null,
        direction: 'outbound',
        body: text.trim(),
        status: wahaRes ? 'sent' : 'failed',
      })
      .returning();

    // Update chat last message
    await db
      .update(schema.whatsappChats)
      .set({
        lastMessage: text.trim(),
        lastMessageAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.whatsappChats.id, chatId));

    // Broadcast Socket.io event to venue
    if (request.server.io) {
      request.server.io.to(`venue:${chat.venueId}`).emit('whatsapp:message:sent', {
        chatId,
        message: inserted,
      });
    }

    return reply.status(201).send(inserted);
  }

  async getVenueSessionStatus(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId: string };
    const sessionName = `venue_${venueId}`;

    let status = await wahaService.getSessionStatus(sessionName);
    let targetSession = sessionName;

    // Fallback: If venue session doesn't exist, check 'default' session
    if (status.status === 'DISCONNECTED') {
      const defaultStatus = await wahaService.getSessionStatus('default');
      if (defaultStatus.status !== 'DISCONNECTED' && defaultStatus.status !== 'UNREACHABLE') {
        status = defaultStatus;
        targetSession = 'default';
      }
    }

    // Attempt to retrieve QR code if session needs pairing or is starting
    let qr: string | null = null;
    if (status.status === 'SCAN_QR_CODE' || status.status === 'STARTING') {
      qr = await wahaService.getSessionQr(targetSession);
      if (qr) {
        status.status = 'SCAN_QR_CODE';
      }
    }

    return reply.send({ ...status, qr, session: targetSession });
  }

  async startVenueSession(request: FastifyRequest, reply: FastifyReply) {
    const { venueId } = request.params as { venueId: string };
    const sessionName = `venue_${venueId}`;
    let success = await wahaService.startSession(sessionName);
    if (!success) {
      // Also try default session fallback
      success = await wahaService.startSession('default');
    }
    return reply.send({ success });
  }
}

export const whatsAppController = new WhatsAppController();
