import { eq } from 'drizzle-orm';
import { db } from '../../../db/index.js';
import * as schema from '../../../db/schema.js';
import { AssignDriverInput } from '@poscocina/shared';

export class AssignDriverUseCase {
  async execute(orderId: string, input: AssignDriverInput, socketIo?: any) {
    const [order] = await db
      .select()
      .from(schema.orders)
      .where(eq(schema.orders.id, orderId))
      .limit(1);

    if (!order) {
      throw new Error('Pedido no encontrado');
    }

    const [updatedOrder] = await db
      .update(schema.orders)
      .set({
        driverId: input.driverId,
      })
      .where(eq(schema.orders.id, orderId))
      .returning();

    if (socketIo) {
      socketIo.to(`venue:${order.venueId}`).emit('order:updated', updatedOrder);
    }

    return updatedOrder;
  }
}

export const assignDriverUseCase = new AssignDriverUseCase();
