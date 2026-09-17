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
};
