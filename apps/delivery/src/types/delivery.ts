export interface VenuePublicProfile {
  id: string;
  name: string;
  slug: string;
  restaurantName?: string;
  restaurantSlug?: string;
  address?: string;
  phone?: string;
  city?: string;
  logoUrl?: string | null;
  primaryColor?: string;
  openingHours?: string;
  operatingStatus?: 'auto' | 'open' | 'closed';
  isOpen?: boolean;
  schedule?: Array<{
    day: number;
    dayName: string;
    enabled: boolean;
    openTime: string;
    closeTime: string;
  }>;
  requireShiftForDelivery?: boolean;
  currency?: string;
  taxRate?: number;
  isPrimary?: boolean;
  isActive?: boolean;
}

export interface CatalogCategory {
  id: string;
  venueId: string;
  name: string;
  color?: string | null;
  icon?: string | null;
  sortOrder: number;
}

export interface CatalogModifier {
  id: string;
  groupId: string;
  name: string;
  priceDelta: string | number;
  isDefault?: boolean;
  isAvailable?: boolean;
  sortOrder: number;
}

export interface CatalogModifierGroup {
  id: string;
  venueId: string;
  name: string;
  selectionType: 'single' | 'multiple';
  isRequired: boolean;
  minSelections: number;
  maxSelections?: number | null;
  modifiers: CatalogModifier[];
}

export interface CatalogProduct {
  id: string;
  categoryId: string;
  name: string;
  description?: string | null;
  price: string | number;
  taxRate: string | number;
  imageUrl?: string | null;
  isAvailable: boolean;
  prepTimeMin?: number | null;
  category?: CatalogCategory;
  modifierGroups?: Array<{
    modifierGroup: CatalogModifierGroup;
  }>;
}

export interface CartModifierSelection {
  modifierId: string;
  name: string;
  priceDelta: number;
}

export interface CartItem {
  id: string; // unique item uuid (product + selected modifiers hash)
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  notes?: string;
  modifiers: CartModifierSelection[];
  totalItemPrice: number;
}
