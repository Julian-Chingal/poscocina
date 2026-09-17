export type InventoryTab = 'stock' | 'purchases' | 'suppliers' | 'recipes' | 'movements';
export type MovementType = 'purchase' | 'waste' | 'adjustment';
export type SupplierDocType = 'NIT' | 'RUT' | 'CC' | 'CE' | 'Passport';

export interface InventoryItem {
  id: string;
  name: string;
  unit: string;
  currentStock: string;
  alertThreshold: string;
  costPerUnit: string;
}

export interface Product {
  id: string;
  name: string;
  price: string;
}

export interface RecipeIngredient {
  inventoryItemId: string;
  quantity: number;
}

export interface Supplier {
  id: string;
  venueId: string;
  name: string;
  documentType: string;
  documentNumber: string;
  contactName?: string | null;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt?: string;
}

export interface PurchaseItemDetail {
  id: string;
  purchaseId: string;
  inventoryItemId: string;
  quantity: string;
  unitCost: string;
  totalCost: string;
  inventoryItem?: InventoryItem;
}

export interface Purchase {
  id: string;
  venueId: string;
  supplierId: string;
  invoiceNumber: string;
  purchaseDate: string;
  totalAmount: string;
  status: 'draft' | 'received' | 'cancelled';
  notes?: string | null;
  createdAt: string;
  supplier?: Supplier;
  items?: PurchaseItemDetail[];
}

export interface InventoryMovement {
  id: string;
  venueId: string;
  inventoryItemId: string;
  type?: 'purchase' | 'waste' | 'adjustment' | 'order_consumed';
  movementType?: 'purchase' | 'waste' | 'adjustment' | 'sale';
  quantity: string;
  notes?: string | null;
  createdAt: string;
  inventoryItem?: InventoryItem;
}

