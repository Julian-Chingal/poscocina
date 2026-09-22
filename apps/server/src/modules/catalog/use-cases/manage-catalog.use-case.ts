import { ICatalogRepository } from '../interfaces/catalog.repository.interface.js';
import { NotFoundError } from '../../../errors/app-error.js';
import { auditService } from '../../../utils/audit.service.js';

export class ManageCatalogUseCase {
  constructor(private readonly catalogRepo: ICatalogRepository) {}

  async getVenueCatalog(venueId: string) {
    return await this.catalogRepo.findVenueCatalog(venueId);
  }

  async createCategory(venueId: string, data: any) {
    return await this.catalogRepo.createCategory(venueId, data);
  }

  async updateCategory(id: string, data: any) {
    const existing = await this.catalogRepo.findCategoryById(id);
    if (!existing) throw new NotFoundError('Categoría no encontrada');
    return await this.catalogRepo.updateCategory(id, data);
  }

  async deleteCategory(id: string) {
    const existing = await this.catalogRepo.findCategoryById(id);
    if (!existing) throw new NotFoundError('Categoría no encontrada');
    await this.catalogRepo.deleteCategory(id);
    return { success: true };
  }

  async createProduct(data: any) {
    const product = await this.catalogRepo.createProduct(data);
    auditService.log({
      venueId: data.venueId,
      action: 'product:created',
      entityType: 'product',
      entityId: product.id,
      payload: { name: product.name, price: product.price },
    }).catch(() => {});
    return product;
  }

  async updateProduct(id: string, data: any) {
    const existing = await this.catalogRepo.findProductById(id);
    if (!existing) throw new NotFoundError('Producto no encontrado');
    return await this.catalogRepo.updateProduct(id, data);
  }

  async deleteProduct(id: string) {
    const existing = await this.catalogRepo.findProductById(id);
    if (!existing) throw new NotFoundError('Producto no encontrado');
    await this.catalogRepo.deleteProduct(id);
    return { success: true };
  }

  async toggleAvailability(id: string) {
    const existing = await this.catalogRepo.findProductById(id);
    if (!existing) throw new NotFoundError('Producto no encontrado');
    return await this.catalogRepo.toggleProductAvailability(id);
  }
}
