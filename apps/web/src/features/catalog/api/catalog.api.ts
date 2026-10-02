import { api } from '@/services/api';
import { Category, Product, CategoryFormData } from '../types/catalog.types';

export const catalogApi = {
  getCatalog: (venueId: string): Promise<{ categories: Category[]; products: Product[] }> =>
    api.get(`/venues/${venueId}/catalog`),

  createCategory: (venueId: string, data: CategoryFormData): Promise<Category> =>
    api.post(`/venues/${venueId}/categories`, data),

  updateCategory: (venueId: string, categoryId: string, data: Partial<CategoryFormData>): Promise<Category> =>
    api.patch(`/venues/${venueId}/categories/${categoryId}`, data),

  deleteCategory: (venueId: string, categoryId: string): Promise<void> =>
    api.delete(`/venues/${venueId}/categories/${categoryId}`),

  createProduct: (data: any): Promise<Product> =>
    api.post('/products', data),

  updateProduct: (productId: string, data: any): Promise<Product> =>
    api.patch(`/products/${productId}`, data),

  deleteProduct: (productId: string): Promise<void> =>
    api.delete(`/products/${productId}`),

  toggleProductAvailability: (productId: string): Promise<Product> =>
    api.patch(`/products/${productId}/toggle-availability`),

  // Modifier Groups & Toppings
  getModifierGroups: (venueId: string): Promise<any[]> =>
    api.get(`/venues/${venueId}/modifier-groups`),

  createModifierGroup: (venueId: string, data: any): Promise<any> =>
    api.post(`/venues/${venueId}/modifier-groups`, data),

  updateModifierGroup: (venueId: string, id: string, data: any): Promise<any> =>
    api.patch(`/venues/${venueId}/modifier-groups/${id}`, data),

  deleteModifierGroup: (venueId: string, id: string): Promise<void> =>
    api.delete(`/venues/${venueId}/modifier-groups/${id}`),

  createModifier: (venueId: string, groupId: string, data: any): Promise<any> =>
    api.post(`/venues/${venueId}/modifier-groups/${groupId}/modifiers`, data),

  updateModifier: (venueId: string, id: string, data: any): Promise<any> =>
    api.patch(`/venues/${venueId}/modifiers/${id}`, data),

  deleteModifier: (venueId: string, id: string): Promise<void> =>
    api.delete(`/venues/${venueId}/modifiers/${id}`),

  linkProductModifierGroup: (productId: string, groupId: string, isRequired?: boolean, sortOrder?: number): Promise<any> =>
    api.post(`/products/${productId}/modifier-groups`, { groupId, isRequired, sortOrder }),

  unlinkProductModifierGroup: (productId: string, groupId: string): Promise<void> =>
    api.delete(`/products/${productId}/modifier-groups/${groupId}`),
};
