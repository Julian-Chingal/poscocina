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

  uploadMedia: async (file: File): Promise<{ url: string; key: string; filename: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const token = (await import('@/stores/auth.store')).useAuthStore.getState().token;
    const venueId = (await import('@/stores/auth.store')).useAuthStore.getState().venueId;
    const res = await fetch('/api/catalog/upload', {
      method: 'POST',
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(venueId ? { 'x-venue-id': venueId } : {}),
      },
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Error al subir archivo');
    }
    return res.json();
  },

  uploadBase64: async (data: { base64Data: string; filename?: string; mimeType?: string }): Promise<{ url: string; key: string; filename: string }> => {
    return api.post('/catalog/upload-base64', data);
  },
};
