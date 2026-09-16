import { eq, and, inArray } from 'drizzle-orm';
import { db } from '../db/index.js';
import * as schema from '../db/schema.js';
import { NotFoundError, BadRequestError } from '../errors/app-error.js';
import { auditService } from './audit.service.js';
import type { CreatePurchaseInput } from '@poscocina/shared';

export class PurchasesService {
  async getPurchases(venueId: string, status?: string) {
    return await db.query.purchases.findMany({
      where: (purchases, { and, eq }) =>
        status
          ? and(eq(purchases.venueId, venueId), eq(purchases.status, status))
          : eq(purchases.venueId, venueId),
      with: {
        supplier: {
          columns: {
            id: true,
            name: true,
            documentNumber: true,
            phone: true,
          },
        },
        receiver: {
          columns: {
            id: true,
            name: true,
          },
        },
        items: {
          with: {
            inventoryItem: true,
          },
        },
      },
      orderBy: (purchases, { desc }) => [desc(purchases.createdAt)],
    });
  }

  async getPurchaseById(id: string) {
    const purchase = await db.query.purchases.findFirst({
      where: (purchases, { eq }) => eq(purchases.id, id),
      with: {
        supplier: true,
        receiver: {
          columns: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          with: {
            inventoryItem: true,
          },
        },
      },
    });

    if (!purchase) {
      throw new NotFoundError('Factura de compra no encontrada');
    }

    return purchase;
  }

  async createPurchase(data: CreatePurchaseInput, userId?: string) {
    const { venueId, supplierId, invoiceNumber, purchaseDate, status, notes, items } = data;

    // Verify supplier exists
    const [supplier] = await db
      .select({ id: schema.suppliers.id, name: schema.suppliers.name })
      .from(schema.suppliers)
      .where(and(eq(schema.suppliers.id, supplierId), eq(schema.suppliers.venueId, venueId)))
      .limit(1);

    if (!supplier) {
      throw new NotFoundError('Proveedor no encontrado en este local comercial');
    }

    // Verify all inventory items exist in this venue
    const itemIds = items.map((i) => i.inventoryItemId);
    const dbItems = await db
      .select()
      .from(schema.inventoryItems)
      .where(and(eq(schema.inventoryItems.venueId, venueId), inArray(schema.inventoryItems.id, itemIds)));

    if (dbItems.length !== items.length) {
      throw new BadRequestError('Uno o mas insumos seleccionados no pertenecen a este local comercial');
    }

    const totalAmount = items.reduce((sum, it) => sum + it.quantity * it.unitCost, 0);

    return await db.transaction(async (tx) => {
      // 1. Insert Purchase
      const [newPurchase] = await tx
        .insert(schema.purchases)
        .values({
          venueId,
          supplierId,
          invoiceNumber: invoiceNumber.trim(),
          purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
          totalAmount: totalAmount.toFixed(2),
          status: status || 'received',
          notes: notes?.trim() || null,
          receivedBy: status === 'received' ? userId || null : null,
        })
        .returning();

      // 2. Insert Purchase Items
      const createdItems = [];
      for (const item of items) {
        const itemTotal = item.quantity * item.unitCost;
        const [pItem] = await tx
          .insert(schema.purchaseItems)
          .values({
            purchaseId: newPurchase.id,
            inventoryItemId: item.inventoryItemId,
            quantity: item.quantity.toFixed(4),
            unitCost: item.unitCost.toFixed(4),
            totalCost: itemTotal.toFixed(2),
          })
          .returning();
        createdItems.push(pItem);
      }

      // 3. If received, apply Weighted Average Cost and stock addition
      if (status === 'received') {
        await this.applyInventoryReceipt(tx, venueId, newPurchase, items, dbItems, userId);
      }

      return {
        ...newPurchase,
        supplier,
        items: createdItems,
      };
    });
  }

  async receivePurchase(purchaseId: string, userId?: string) {
    const purchase = await this.getPurchaseById(purchaseId);
    if (purchase.status === 'received') {
      throw new BadRequestError('Esta compra ya ha sido recibida en inventario');
    }
    if (purchase.status === 'cancelled') {
      throw new BadRequestError('No se puede recibir una compra cancelada');
    }

    return await db.transaction(async (tx) => {
      const [updatedPurchase] = await tx
        .update(schema.purchases)
        .set({
          status: 'received',
          receivedBy: userId || null,
          updatedAt: new Date(),
        })
        .where(eq(schema.purchases.id, purchaseId))
        .returning();

      const items = purchase.items.map((i) => ({
        inventoryItemId: i.inventoryItemId,
        quantity: parseFloat(i.quantity),
        unitCost: parseFloat(i.unitCost),
      }));

      const dbItems = purchase.items.map((i) => i.inventoryItem);

      await this.applyInventoryReceipt(tx, purchase.venueId, updatedPurchase, items, dbItems, userId);

      return updatedPurchase;
    });
  }

  private async applyInventoryReceipt(
    tx: any,
    venueId: string,
    purchase: any,
    items: Array<{ inventoryItemId: string; quantity: number; unitCost: number }>,
    dbItems: any[],
    userId?: string
  ) {
    for (const item of items) {
      const targetDbItem = dbItems.find((d: any) => d.id === item.inventoryItemId);
      if (!targetDbItem) continue;

      const currentStock = parseFloat(targetDbItem.currentStock || '0');
      const currentCost = parseFloat(targetDbItem.costPerUnit || '0');
      const qtyPurchased = item.quantity;
      const costPurchased = item.unitCost;

      // Weighted Average Cost Formula
      let newCost: number;
      if (currentStock <= 0) {
        newCost = costPurchased;
      } else {
        const totalValueBefore = currentStock * currentCost;
        const totalValuePurchased = qtyPurchased * costPurchased;
        const totalQuantityAfter = currentStock + qtyPurchased;
        newCost = (totalValueBefore + totalValuePurchased) / totalQuantityAfter;
      }

      const newStock = currentStock + qtyPurchased;

      // Update inventory item stock and unit cost
      await tx
        .update(schema.inventoryItems)
        .set({
          currentStock: newStock.toFixed(4),
          costPerUnit: newCost.toFixed(4),
          updatedAt: new Date(),
        })
        .where(eq(schema.inventoryItems.id, item.inventoryItemId));

      // Record inventory movement
      await tx.insert(schema.inventoryMovements).values({
        inventoryItemId: item.inventoryItemId,
        movementType: 'purchase',
        quantity: qtyPurchased.toFixed(4),
        referenceId: purchase.id,
        notes: `Compra Factura #${purchase.invoiceNumber} (Costo Unit: $${costPurchased.toFixed(2)})`,
        createdBy: userId || null,
      });
    }

    // Audit log
    auditService
      .log({
        venueId,
        userId,
        action: 'inventory:purchase_received',
        entityType: 'purchase',
        entityId: purchase.id,
        payload: {
          invoiceNumber: purchase.invoiceNumber,
          totalAmount: purchase.totalAmount,
          itemsCount: items.length,
        },
      })
      .catch(() => {});
  }
}

export const purchasesService = new PurchasesService();
