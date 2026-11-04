import { db } from '../../../db/index.js';
import * as schema from '../../../db/schema.js';
import { inArray, eq, and } from 'drizzle-orm';
import { BadRequestError, NotFoundError } from '../../../errors/app-error.js';
import { IOrderRepository, CreateOrderPayload } from '../interfaces/order.repository.interface.js';
import { auditService } from '../../../utils/audit.service.js';

export class CreateOrderUseCase {
  constructor(private readonly orderRepo: IOrderRepository) {}

  async execute(data: CreateOrderPayload) {
    const { venueId, tableId, customerId, waiterId, notes, items } = data;
    const orderType = data.orderType || 'dine_in';
    const guestCount = data.guestCount || 1;

    if (!items || items.length === 0) {
      throw new BadRequestError('La comanda debe contener al menos un ítem.');
    }

    return await db.transaction(async (tx) => {
      const activeShift = await this.orderRepo.findActiveShift(venueId, tx);
      if (!activeShift) {
        throw new BadRequestError('Caja cerrada: Debes abrir la caja antes de registrar pedidos');
      }

      // Resolve product data (price + taxRate) from DB — never trust client-supplied prices
      const productIds = items.map((i) => i.productId);
      const products = await tx.select().from(schema.products).where(inArray(schema.products.id, productIds));
      const productMap = new Map(products.map((p) => [p.id, p]));

      // Validate all products exist
      for (const item of items) {
        if (!productMap.has(item.productId)) {
          throw new NotFoundError(`Producto no encontrado: ${item.productId}`);
        }
      }

      let subtotal = 0;
      let taxTotal = 0;

      for (const item of items) {
        const prod = productMap.get(item.productId)!;
        // Server-side price resolution: ignore any unitPrice sent by the client
        const resolvedPrice = parseFloat(prod.price);
        const rate = parseFloat(prod.taxRate || '0.08');
        const qty = item.quantity || 1;

        let itemTotal = resolvedPrice * qty;
        if (item.modifiers && item.modifiers.length > 0) {
          for (const mod of item.modifiers) itemTotal += (mod.priceDelta || 0) * qty;
        }

        subtotal += itemTotal;
        taxTotal += resolvedPrice * qty * rate;
      }

      const total = subtotal + taxTotal;

      const order = await this.orderRepo.createOrder({
        venueId,
        tableId: tableId || null,
        customerId: customerId || null,
        waiterId: waiterId || null,
        orderType,
        status: 'sent_to_kitchen',
        paymentStatus: 'unpaid',
        kitchenStatus: 'queued',
        guestCount,
        guestName: data.guestName?.trim() || null,
        subtotal: subtotal.toFixed(2),
        taxTotal: taxTotal.toFixed(2),
        total: total.toFixed(2),
        notes,
      }, tx);

      const itemsToInsert = items.map((item) => {
        const prod = productMap.get(item.productId)!;
        const resolvedPrice = parseFloat(prod.price);
        return {
          orderId: order.id,
          productId: item.productId,
          status: 'pending',
          quantity: item.quantity || 1,
          unitPrice: resolvedPrice.toFixed(2),  // Always use DB price
          seatNumber: item.seatNumber || null,
          course: item.course || 1,
          notes: item.notes || null,
        };
      });

      const insertedItems = await this.orderRepo.insertOrderItems(itemsToInsert, tx);

      const modifiersToInsert = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const inserted = insertedItems[i];
        if (item.modifiers && item.modifiers.length > 0) {
          for (const mod of item.modifiers) {
            modifiersToInsert.push({
              orderItemId: inserted.id,
              modifierId: mod.modifierId,
              priceDelta: (mod.priceDelta || 0).toFixed(2),
            });
          }
        }
      }
      await this.orderRepo.insertItemModifiers(modifiersToInsert, tx);

      // Multi-station routing: Resolve stations for inserted items
      const assignedProductStations = await tx
        .select()
        .from(schema.productStations)
        .where(inArray(schema.productStations.productId, productIds))
        .orderBy(schema.productStations.sortOrder);

      let defaultStationId: string | null = null;
      const [firstStation] = await tx
        .select()
        .from(schema.workstations)
        .where(and(eq(schema.workstations.venueId, venueId), eq(schema.workstations.isActive, true)))
        .orderBy(schema.workstations.sortOrder)
        .limit(1);
      if (firstStation) {
        defaultStationId = firstStation.id;
      }

      const stationRowsToInsert = [];
      const now = new Date();
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const inserted = insertedItems[i];
        const prodStations = assignedProductStations.filter((ps) => ps.productId === item.productId);

        if (prodStations.length > 0) {
          for (const ps of prodStations) {
            stationRowsToInsert.push({
              orderItemId: inserted.id,
              stationId: ps.stationId,
              status: 'pending',
              sentAt: now,
            });
          }
        } else if (defaultStationId) {
          stationRowsToInsert.push({
            orderItemId: inserted.id,
            stationId: defaultStationId,
            status: 'pending',
            sentAt: now,
          });
        }
      }
      await this.orderRepo.insertOrderItemStations(stationRowsToInsert, tx);

      if (tableId) {
        await this.orderRepo.updateTableOccupied(tableId, order.id, tx);
      }

      auditService.log({
        venueId,
        action: 'order:created',
        entityType: 'order',
        entityId: order.id,
        payload: { tableId, itemsCount: items.length, total: total.toFixed(2) },
      }).catch(() => {});

      return { order, items: insertedItems, tableId };
    });
  }
}

