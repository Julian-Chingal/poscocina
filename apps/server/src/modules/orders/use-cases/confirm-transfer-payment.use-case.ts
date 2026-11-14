import { eq } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import * as schema from '../../../db/schema.js';
import { ConfirmTransferPaymentInput } from '@poscocina/shared';
import { wahaService } from '../../whatsapp/services/waha.service.js';

export class ConfirmTransferPaymentUseCase {
  async execute(orderId: string, input: ConfirmTransferPaymentInput, confirmedByUserId?: string, socketIo?: any) {
    const [order] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, orderId))
      .limit(1);

    if (!order) {
      throw new Error('Pedido no encontrado');
    }

    // Generate unique 4-digit delivery security PIN (e.g. 7482)
    const pin = Math.floor(1000 + Math.random() * 9000).toString();

    const [updatedOrder] = await db
      .update(schema.orders)
      .set({
        paymentStatus: 'paid',
        deliveryPin: pin,
        transferProofUrl: input.receiptUrl || order.transferProofUrl,
        paymentConfirmedAt: new Date(),
        paymentConfirmedBy: confirmedByUserId || null,
      })
      .where(eq(schema.orders.id, orderId))
      .returning();

    // Look up customer phone to send automated WhatsApp confirmation
    let customerPhone: string | null = null;
    if (order.customerId) {
      const [customer] = await db
        .select({ phone: schema.customers.phone })
        .from(schema.customers)
        .where(eq(schema.customers.id, order.customerId))
        .limit(1);
      customerPhone = customer?.phone || null;
    }

    // Fallback: search phone in order notes (e.g. "Teléfono: 3001234567")
    if (!customerPhone && order.notes) {
      const match = order.notes.match(/Teléfono:\s*(\+?\d+)/i);
      if (match) {
        customerPhone = match[1];
      }
    }

    if (customerPhone) {
      const session = `venue_${order.venueId}`;
      const msg = [
        `✅ *¡Tu pago de $${Number(order.total).toLocaleString('es-CO')} ha sido confirmado con éxito!* 🎉`,
        ``,
        `Tu pedido ya está siendo preparado en cocina.`,
        ``,
        `🔑 *Tu CÓDIGO DE ENTREGA es:* \`${pin}\``,
        ``,
        `Por favor entrégale este código al domiciliario cuando llegue a tu dirección para recibir tu pedido. ¡Muchas gracias!`,
      ].join('\n');

      // Dispatch non-blocking WhatsApp message
      wahaService.sendText(session, customerPhone, msg).catch((err) => {
        console.warn(`[ConfirmTransferPayment] Could not send WhatsApp confirmation to ${customerPhone}:`, err.message);
      });
    }

    // Broadcast to Venue terminals
    if (socketIo) {
      socketIo.to(`venue:${order.venueId}`).emit('order:updated', updatedOrder);
      socketIo.to(`venue:${order.venueId}`).emit('order:payment_confirmed', {
        orderId: updatedOrder.id,
        deliveryPin: pin,
      });
    }

    return updatedOrder;
  }
}

export const confirmTransferPaymentUseCase = new ConfirmTransferPaymentUseCase();
