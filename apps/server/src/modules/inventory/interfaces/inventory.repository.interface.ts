export interface IInventoryRepository {
  findItems(venueId: string): Promise<any[]>;
  findItemById(id: string): Promise<any>;
  createItem(venueId: string, data: any): Promise<any>;
  updateStock(itemId: string, qtyDelta: number, tx?: any): Promise<any>;
  insertMovement(data: any, tx?: any): Promise<any>;
  findMovements(venueId: string, limit?: number): Promise<any[]>;
  findRecipe(productId: string): Promise<any[]>;
  setRecipe(productId: string, ingredients: any[]): Promise<any[]>;
  findLowStock(venueId: string): Promise<any[]>;
  // Suppliers & Purchases
  findSuppliers(venueId: string, query?: string): Promise<any[]>;
  findSupplierById(id: string): Promise<any>;
  createSupplier(data: any): Promise<any>;
  updateSupplier(id: string, data: any): Promise<any>;
  findPurchases(venueId: string, status?: string): Promise<any[]>;
  findPurchaseById(id: string): Promise<any>;
  createPurchase(data: any, lines: any[], tx?: any): Promise<any>;
  receivePurchase(purchaseId: string, receivedBy?: string): Promise<any>;
}
