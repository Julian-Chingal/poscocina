import { eq } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import * as schema from '../../../db/schema.js';
import { CompleteDeliveryInput } from '@poscocina/shared';
import { wahaService } from '../../whatsapp/services/waha.service.js';

export class CompleteDeliveryUseCase {
  async execute(orderId: string, input: CompleteDeliveryInput, driverUserId?: string, socketIo?: any) {
    const [order] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, orderId))
      .limit(1);

    if (!order) {
      throw new Error('Pedido no encontrado');
    }

    // Validate PIN if one was generated
    if (order.deliveryPin) {
      if (order.deliveryPin.trim() !== input.deliveryPin.trim()) {
        const error: any = new Error('Código de entrega incorrecto. Verifique con el cliente.');
        error.statusCode = 400;
        throw error;
      }
    }

    const [updatedOrder] = await db
      .update(schema.orders)
      .set({
        kitchenStatus: 'delivered',
        status: 'paid',
        closedAt: new Date(),
        deliveredAt: new Date(),
        driverId: driverUserId || order.driverId,
      })
      .where(eq(schema.orders.id, orderId))
      .returning();

    // Look up customer phone for delivery completion notice
    let customerPhone: string | null = null;
    if (order.customerId) {
      const [customer] = await db
        .select({ phone: schema.customers.phone })
        .from(schema.customers)
        .where(eq(schema.customers.id, order.customerId))
        .limit(1);
      customerPhone = customer?.phone || null;
    }

    if (!customerPhone && order.notes) {
      const match = order.notes.match(/Teléfono:\s*(\+?\d+)/i);
      if (match) {
        customerPhone = match[1];
      }
    }

    if (customerPhone) {
      const session = `venue_${order.venueId}`;
      const msg = [
        `🎉 *¡Tu pedido ha sido entregado con éxito por nuestro domiciliario!*`,
        ``,
        `¡Muchas gracias por tu compra en Zogui y buen provecho! 🍽️✨`,
      ].join('\n');

      wahaService.sendText(session, customerPhone, msg).catch((err) => {
        console.warn(`[CompleteDelivery] Could not send WhatsApp delivery notification to ${customerPhone}:`, err.message);
      });
    }

    if (socketIo) {
      socketIo.to(`venue:${order.venueId}`).emit('order:updated', updatedOrder);
      socketIo.to(`venue:${order.venueId}`).emit('order:delivered', updatedOrder);
    }

    return updatedOrder;
  }
}

export const completeDeliveryUseCase = new CompleteDeliveryUseCase();
