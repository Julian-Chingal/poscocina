export interface ProductDimensions {
  diameter?: number | null;
  height?: number | null;
  unit?: string | null;
  portion?: string | null;
}

export type DisplayMediaType = 'image' | 'model3d' | 'both';

export interface Product {
  id: string;
  categoryId: string;
  name: string;
  description?: string | null;
  price: string | number;
  taxRate?: string | number;
  imageUrl?: string | null;
  model3dUrl?: string | null;
  model3dType?: string | null;
  dimensions?: ProductDimensions | null;
  displayMedia?: DisplayMediaType | null;
  printerStation?: string | null;
  prepTimeMin?: number | null;
  trackInventory?: boolean;
  isAvailable: boolean;
  sortOrder?: number;
}

export interface Category {
  id: string;
  venueId?: string;
  name: string;
  color?: string | null;
  icon?: string | null;
  printerStation?: string | null;
  sortOrder?: number;
}

export interface CategoryFormData {
  name: string;
  color: string;
  printerStation: string;
  sortOrder: number;
}

export interface ProductFormData {
  name: string;
  categoryId: string;
  price: string;
  taxRate: number;
  printerStation: string;
  description: string;
  prepTimeMin: number;
  trackInventory: boolean;
  isAvailable: boolean;
  imageUrl?: string | null;
  model3dUrl?: string | null;
  model3dType?: string | null;
  dimensions?: ProductDimensions | null;
  displayMedia?: DisplayMediaType;
}

export interface DeleteTarget {
  type: 'category' | 'product';
  id: string;
  name: string;
}
