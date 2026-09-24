export interface FloorPlanItem {
  id: string;
  name: string;
}

export interface TableItem {
  id: string;
  floorPlanId?: string;
  label: string;
  capacity: number;
  positionX?: string | number;
  positionY?: string | number;
  shape?: 'rect' | 'circle' | 'square';
  status: 'free' | 'occupied' | 'check_requested' | 'paid_waiting_food' | 'reserved' | 'blocked';
  currentOrderId?: string | null;
}

export interface TableFormData {
  label: string;
  floorPlanId: string;
  capacity: number;
  shape: 'rect' | 'circle' | 'square';
  status: TableItem['status'];
}

export interface SalonViewProps {
  venueId: string;
  onSelectTable: (table: TableItem) => void;
}
