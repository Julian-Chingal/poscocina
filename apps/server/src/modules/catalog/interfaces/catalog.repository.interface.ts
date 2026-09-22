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
}
