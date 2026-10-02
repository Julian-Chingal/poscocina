import { api } from '@/services/api';
import {
  InventoryItem,
  InventoryMovement,
  Supplier,
  Purchase,
  RecipeIngredient,
} from '../types/inventory.types';

export const inventoryApi = {
  getItems: (venueId: string): Promise<InventoryItem[]> =>
    api.get(`/venues/${venueId}/inventory/items`),

  createItem: (venueId: string, data: any): Promise<InventoryItem> =>
    api.post(`/venues/${venueId}/inventory/items`, data),

  getMovements: (venueId: string): Promise<InventoryMovement[]> =>
    api.get(`/venues/${venueId}/inventory/movements`),

  createMovement: (_venueId: string, data: any) =>
    api.post('/inventory/movements', data),

  getCatalog: (venueId: string) =>
    api.get(`/venues/${venueId}/catalog`),

  getSuppliers: (venueId: string, query: string = ''): Promise<Supplier[]> => {
    const url = query
      ? `/venues/${venueId}/suppliers?q=${encodeURIComponent(query)}`
      : `/venues/${venueId}/suppliers`;
    return api.get(url);
  },

  createSupplier: (venueId: string, data: any): Promise<Supplier> =>
    api.post('/suppliers', { ...data, venueId }),

  getPurchases: (venueId: string): Promise<Purchase[]> =>
    api.get(`/venues/${venueId}/purchases`),

  createPurchase: (venueId: string, data: any): Promise<Purchase> =>
    api.post('/purchases', { ...data, venueId }),

  receivePurchase: (_venueId: string, purchaseId: string): Promise<any> =>
    api.post(`/purchases/${purchaseId}/receive`),

  getRecipe: (_venueId: string, productId: string): Promise<RecipeIngredient[]> =>
    api.get(`/products/${productId}/recipe`),

  saveRecipe: (_venueId: string, productId: string, ingredients: RecipeIngredient[]) =>
    api.post(`/products/${productId}/recipe`, { ingredients }),
};

