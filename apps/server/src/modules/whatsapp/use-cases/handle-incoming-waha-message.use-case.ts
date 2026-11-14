import { eq, and, or, ilike } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import * as schema from '../../../db/schema.js';
import { WahaWebhookPayload } from '../interfaces/waha.types.js';
import { wahaService } from '../services/waha.service.js';

export class HandleIncomingWahaMessageUseCase {
  async execute(webhook: WahaWebhookPayload, socketIo?: any): Promise<{ handled: boolean; messageId?: string }> {
    if (webhook.event !== 'message' || !webhook.payload) {
      return { handled: false };
    }

    const { payload, session } = webhook;
    const messageId = payload.id;
    const rawFrom = payload.from || '';
    const cleanPhone = rawFrom.replace(/@.*$/, '').replace(/\D/g, '');

    if (!cleanPhone) {
      return { handled: false };
    }

    // Try resolving real phone number if sender is an internal LID (15+ digits)
    let resolvedPhone: string | null = null;
    if (rawFrom.includes('@lid') || cleanPhone.length >= 15) {
      resolvedPhone = await wahaService.resolvePhoneFromLid(session, cleanPhone);
    }

    // 1. Idempotency Check
    const [existingMessage] = await db
      .select({ id: schema.whatsappMessages.id })
      .from(schema.whatsappMessages)
      .where(eq(schema.whatsappMessages.wahaMessageId, messageId))
      .limit(1);

    if (existingMessage) {
      return { handled: true, messageId: existingMessage.id };
    }

    // 2. Resolve Venue
    let targetVenueId: string | null = null;
    if (session && session.startsWith('venue_')) {
      targetVenueId = session.replace('venue_', '');
    } else {
      // Fallback: look up primary or first active venue
      const [primaryVenue] = await db
        .select({ id: schema.venues.id })
        .from(schema.venues)
        .where(eq(schema.venues.isActive, true))
        .orderBy(schema.venues.isPrimary)
        .limit(1);
      targetVenueId = primaryVenue?.id || null;
    }

    if (!targetVenueId) {
      console.warn('[HandleIncomingWahaMessage] No active venue found to route WhatsApp message.');
      return { handled: false };
    }

    // 3. Resolve Customer & Chat
    const chatCondition = resolvedPhone
      ? or(eq(schema.whatsappChats.phone, cleanPhone), eq(schema.whatsappChats.phone, resolvedPhone))
      : eq(schema.whatsappChats.phone, cleanPhone);

    const [existingChat] = await db
      .select()
      .from(schema.whatsappChats)
      .where(and(eq(schema.whatsappChats.venueId, targetVenueId), chatCondition))
      .limit(1);

    let chatId = existingChat?.id;
    const isOutbound = Boolean(payload.fromMe);
    const bodyText = payload.body || (payload.hasMedia ? '📷 Archivo multimedia' : '');
    let mediaUrl = payload.media?.url || payload.mediaUrl || null;
    if (mediaUrl && mediaUrl.includes('/api/files/')) {
      const filePart = mediaUrl.split('/api/files/')[1];
      mediaUrl = `/api/whatsapp/files/${filePart}`;
    }
    const mediaType = payload.media?.mimetype || null;

    // Look up existing CRM customer by phone, resolved phone, or notifyName
    let existingCustomer: any = null;
    if (resolvedPhone) {
      const [c] = await db
        .select()
        .from(schema.customers)
        .where(and(eq(schema.customers.venueId, targetVenueId), eq(schema.customers.phone, resolvedPhone)))
        .limit(1);
      existingCustomer = c;
    }
    if (!existingCustomer) {
      const [c] = await db
        .select()
        .from(schema.customers)
        .where(and(eq(schema.customers.venueId, targetVenueId), eq(schema.customers.phone, cleanPhone)))
        .limit(1);
      existingCustomer = c;
    }
    const notifyName = payload._data?.notifyName?.trim();
    if (!existingCustomer && notifyName && notifyName.length > 2) {
      const [c] = await db
        .select()
        .from(schema.customers)
        .where(and(eq(schema.customers.venueId, targetVenueId), ilike(schema.customers.name, `%${notifyName}%`)))
        .limit(1);
      existingCustomer = c;
    }

    const customerName =
      existingCustomer?.name ||
      notifyName ||
      (cleanPhone.length >= 15 ? 'Usuario WhatsApp' : `WhatsApp ${cleanPhone.slice(-4)}`);

    if (!chatId) {
      const [newChat] = await db
        .insert(schema.whatsappChats)
        .values({
          venueId: targetVenueId,
          phone: cleanPhone,
          customerId: existingCustomer?.id || null,
          customerName,
          lastMessage: bodyText,
          lastMessageAt: new Date(),
          unreadCount: isOutbound ? 0 : 1,
        })
        .returning();

      chatId = newChat.id;
    } else {
      // Update existing chat summary and attach customer if newly resolved
      await db
        .update(schema.whatsappChats)
        .set({
          customerName: existingChat.customerName || customerName,
          customerId: existingChat.customerId || existingCustomer?.id || null,
          lastMessage: bodyText,
          lastMessageAt: new Date(),
          unreadCount: isOutbound ? existingChat.unreadCount : (existingChat.unreadCount || 0) + 1,
          updatedAt: new Date(),
        })
        .where(eq(schema.whatsappChats.id, chatId));
    }

    // 4. Insert message record
    const [insertedMsg] = await db
      .insert(schema.whatsappMessages)
      .values({
        chatId,
        venueId: targetVenueId,
        wahaMessageId: messageId,
        direction: isOutbound ? 'outbound' : 'inbound',
        body: bodyText,
        mediaUrl,
        mediaType,
        status: isOutbound ? 'sent' : 'received',
      })
      .returning();

    // 5. Real-time broadcast to venue room in apps/web
    if (socketIo) {
      socketIo.to(`venue:${targetVenueId}`).emit('whatsapp:message:received', {
        chatId,
        message: insertedMsg,
        venueId: targetVenueId,
        phone: cleanPhone,
      });
    }

    return { handled: true, messageId: insertedMsg.id };
  }
}

export const handleIncomingWahaMessageUseCase = new HandleIncomingWahaMessageUseCase();
