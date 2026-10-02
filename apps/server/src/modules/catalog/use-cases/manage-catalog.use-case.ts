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

  // Modifier Groups & Modifiers
  async getModifierGroups(venueId: string) {
    return await this.catalogRepo.findModifierGroups(venueId);
  }

  async createModifierGroup(venueId: string, data: any) {
    return await this.catalogRepo.createModifierGroup(venueId, data);
  }

  async updateModifierGroup(id: string, data: any) {
    const existing = await this.catalogRepo.findModifierGroupById(id);
    if (!existing) throw new NotFoundError('Grupo de modificadores no encontrado');
    return await this.catalogRepo.updateModifierGroup(id, data);
  }

  async deleteModifierGroup(id: string) {
    const existing = await this.catalogRepo.findModifierGroupById(id);
    if (!existing) throw new NotFoundError('Grupo de modificadores no encontrado');
    await this.catalogRepo.deleteModifierGroup(id);
    return { success: true };
  }

  async createModifier(groupId: string, data: any) {
    const existing = await this.catalogRepo.findModifierGroupById(groupId);
    if (!existing) throw new NotFoundError('Grupo de modificadores no encontrado');
    return await this.catalogRepo.createModifier(groupId, data);
  }

  async updateModifier(id: string, data: any) {
    return await this.catalogRepo.updateModifier(id, data);
  }

  async deleteModifier(id: string) {
    await this.catalogRepo.deleteModifier(id);
    return { success: true };
  }

  async linkProductModifierGroup(productId: string, groupId: string, isRequired?: boolean | null, sortOrder?: number) {
    const product = await this.catalogRepo.findProductById(productId);
    if (!product) throw new NotFoundError('Producto no encontrado');
    const group = await this.catalogRepo.findModifierGroupById(groupId);
    if (!group) throw new NotFoundError('Grupo de modificadores no encontrado');
    return await this.catalogRepo.linkProductModifierGroup(productId, groupId, isRequired, sortOrder);
  }

  async unlinkProductModifierGroup(productId: string, groupId: string) {
    await this.catalogRepo.unlinkProductModifierGroup(productId, groupId);
    return { success: true };
  }
}

