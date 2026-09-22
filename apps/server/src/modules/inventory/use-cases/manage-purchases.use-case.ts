import { IInventoryRepository } from '../interfaces/inventory.repository.interface.js';
import { NotFoundError, BadRequestError } from '../../../errors/app-error.js';

export class ManagePurchasesUseCase {
  constructor(private readonly repo: IInventoryRepository) {}

  async getSuppliers(venueId: string, q?: string) {
    return await this.repo.findSuppliers(venueId, q);
  }

  async getSupplierById(id: string) {
    const supplier = await this.repo.findSupplierById(id);
    if (!supplier) throw new NotFoundError('Proveedor no encontrado');
    return supplier;
  }

  async createSupplier(data: any) {
    return await this.repo.createSupplier(data);
  }

  async updateSupplier(id: string, data: any) {
    await this.getSupplierById(id);
    return await this.repo.updateSupplier(id, data);
  }

  async getPurchases(venueId: string, status?: string) {
    return await this.repo.findPurchases(venueId, status);
  }

  async getPurchaseById(id: string) {
    const purchase = await this.repo.findPurchaseById(id);
    if (!purchase) throw new NotFoundError('Compra no encontrada');
    return purchase;
  }

  async createPurchase(data: any, createdBy?: string) {
    let subtotal = 0;
    let tax = 0;
    const lines = (data.lines || []).map((l: any) => {
      const lineTotal = Number(l.unitCost) * Number(l.quantity);
      subtotal += lineTotal;
      return {
        inventoryItemId: l.inventoryItemId,
        quantity: Number(l.quantity).toFixed(4),
        unitCost: Number(l.unitCost).toFixed(2),
        totalCost: lineTotal.toFixed(2),
      };
    });

    const total = subtotal + tax;
    return await this.repo.createPurchase({
      venueId: data.venueId,
      supplierId: data.supplierId,
      invoiceNumber: data.invoiceNumber || null,
      purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : new Date(),
      status: 'pending',
      subtotal: subtotal.toFixed(2),
      taxTotal: tax.toFixed(2),
      total: total.toFixed(2),
      notes: data.notes || null,
      createdBy: createdBy || null,
    }, lines);
  }

  async receivePurchase(id: string, receivedBy?: string) {
    const purchase = await this.getPurchaseById(id);
    if (purchase.status === 'received') {
      throw new BadRequestError('Esta orden de compra ya fue recibida anteriormente');
    }
    return await this.repo.receivePurchase(id, receivedBy);
  }
}
