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
    const rawItems = data.items || data.lines || [];
    const lines = rawItems.map((l: any) => {
      const qty = Number(l.quantity) || 0;
      const cost = Number(l.unitCost) || 0;
      const lineTotal = cost * qty;
      subtotal += lineTotal;
      return {
        inventoryItemId: l.inventoryItemId,
        quantity: qty.toFixed(4),
        unitCost: cost.toFixed(4),
        totalCost: lineTotal.toFixed(2),
      };
    });

    const status = data.status === 'draft' ? 'draft' : 'received';
    const purchaseDate = data.purchaseDate ? new Date(data.purchaseDate) : new Date();

    return await this.repo.createPurchase(
      {
        venueId: data.venueId,
        supplierId: data.supplierId,
        invoiceNumber: String(data.invoiceNumber).trim(),
        purchaseDate,
        status,
        totalAmount: subtotal.toFixed(2),
        notes: data.notes || null,
        receivedBy: status === 'received' ? createdBy || null : null,
      },
      lines
    );
  }

  async receivePurchase(id: string, receivedBy?: string) {
    const purchase = await this.getPurchaseById(id);
    if (purchase.status === 'received') {
      throw new BadRequestError('Esta orden de compra ya fue recibida anteriormente');
    }
    return await this.repo.receivePurchase(id, receivedBy);
  }
}
