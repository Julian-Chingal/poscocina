import { IInventoryRepository } from '../interfaces/inventory.repository.interface.js';
import { NotFoundError } from '../../../errors/app-error.js';
import { auditService } from '../../../utils/audit.service.js';

export class ManageStockUseCase {
  constructor(private readonly repo: IInventoryRepository) {}

  async getItems(venueId: string) {
    return await this.repo.findItems(venueId);
  }

  async createItem(venueId: string, data: any) {
    return await this.repo.createItem(venueId, data);
  }

  async registerMovement(data: {
    inventoryItemId: string;
    movementType: 'purchase' | 'waste' | 'adjustment';
    quantity: number;
    notes?: string;
    createdBy?: string;
  }) {
    const item = await this.repo.findItemById(data.inventoryItemId);
    if (!item) throw new NotFoundError('Insumo no encontrado');

    const qtyNumber = Number(data.quantity);
    const qtyDelta = data.movementType === 'waste' ? -Math.abs(qtyNumber) : qtyNumber;

    const updatedItem = await this.repo.updateStock(data.inventoryItemId, qtyDelta);
    const movement = await this.repo.insertMovement({
      inventoryItemId: data.inventoryItemId,
      movementType: data.movementType,
      quantity: qtyDelta.toFixed(4),
      notes: data.notes,
      createdBy: data.createdBy,
    });

    const isLowStock = parseFloat(updatedItem.currentStock) <= parseFloat(updatedItem.alertThreshold);

    auditService.log({
      venueId: item.venueId,
      action: 'inventory:movement_registered',
      entityType: 'inventory_item',
      entityId: item.id,
      payload: { movementType: data.movementType, quantity: qtyDelta, currentStock: updatedItem.currentStock },
    }).catch(() => {});

    return { item: updatedItem, movement, isLowStock };
  }

  async getLowStock(venueId: string) {
    return await this.repo.findLowStock(venueId);
  }

  async getMovements(venueId: string) {
    return await this.repo.findMovements(venueId);
  }

  async getRecipe(productId: string) {
    return await this.repo.findRecipe(productId);
  }

  async setRecipe(productId: string, ingredients: any[]) {
    return await this.repo.setRecipe(productId, ingredients);
  }
}
