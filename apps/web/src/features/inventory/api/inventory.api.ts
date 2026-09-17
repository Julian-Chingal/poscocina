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

  createMovement: (venueId: string, data: any) =>
    api.post(`/venues/${venueId}/inventory/movements`, data),

  getCatalog: (venueId: string) =>
    api.get(`/venues/${venueId}/catalog`),

  getSuppliers: (venueId: string, query: string = ''): Promise<Supplier[]> => {
    const url = query
      ? `/venues/${venueId}/purchases/suppliers?q=${encodeURIComponent(query)}`
      : `/venues/${venueId}/purchases/suppliers`;
    return api.get(url);
  },

  createSupplier: (venueId: string, data: any): Promise<Supplier> =>
    api.post(`/venues/${venueId}/purchases/suppliers`, data),

  getPurchases: (venueId: string): Promise<Purchase[]> =>
    api.get(`/venues/${venueId}/purchases`),

  createPurchase: (venueId: string, data: any): Promise<Purchase> =>
    api.post(`/venues/${venueId}/purchases`, data),

  receivePurchase: (venueId: string, purchaseId: string): Promise<any> =>
    api.post(`/venues/${venueId}/purchases/${purchaseId}/receive`),

  getRecipe: (venueId: string, productId: string): Promise<RecipeIngredient[]> =>
    api.get(`/venues/${venueId}/inventory/recipes/${productId}`),

  saveRecipe: (venueId: string, productId: string, ingredients: RecipeIngredient[]) =>
    api.put(`/venues/${venueId}/inventory/recipes/${productId}`, { ingredients }),
};

