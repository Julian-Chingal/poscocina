export interface ICatalogRepository {
  findVenueCatalog(venueId: string): Promise<any>;
  findCategoryById(id: string): Promise<any>;
  createCategory(venueId: string, data: any): Promise<any>;
  updateCategory(id: string, data: any): Promise<any>;
  deleteCategory(id: string): Promise<void>;
  findProductById(id: string): Promise<any>;
  createProduct(data: any): Promise<any>;
  updateProduct(id: string, data: any): Promise<any>;
  deleteProduct(id: string): Promise<void>;
  toggleProductAvailability(id: string): Promise<any>;

  // Modifier Groups & Modifiers
  findModifierGroups(venueId: string): Promise<any>;
  findModifierGroupById(id: string): Promise<any>;
  createModifierGroup(venueId: string, data: any): Promise<any>;
  updateModifierGroup(id: string, data: any): Promise<any>;
  deleteModifierGroup(id: string): Promise<void>;
  createModifier(groupId: string, data: any): Promise<any>;
  updateModifier(id: string, data: any): Promise<any>;
  deleteModifier(id: string): Promise<void>;
  linkProductModifierGroup(productId: string, groupId: string, isRequired?: boolean | null, sortOrder?: number): Promise<any>;
  unlinkProductModifierGroup(productId: string, groupId: string): Promise<void>;
}
