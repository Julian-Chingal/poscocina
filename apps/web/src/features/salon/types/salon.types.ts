export type WallKind = 'wall' | 'divider' | 'glass' | 'door';
export type FixtureKind = 'bar' | 'cashier' | 'kitchen' | 'restroom' | 'entrance' | 'plant' | 'stage' | 'pillar';

export interface FloorWall {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  kind: WallKind;
  label?: string;
  rotation?: number; // 0, 90
}

export interface FloorFixture {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  kind: FixtureKind;
  label: string;
  color?: string;
  rotation?: number;
}

export interface FloorPlanLayout {
  canvasWidth?: number;
  canvasHeight?: number;
  gridSize?: number;
  walls?: FloorWall[];
  fixtures?: FloorFixture[];
  tableMeta?: Record<string, { width?: number; height?: number; rotation?: number }>;
}

export interface FloorPlanItem {
  id: string;
  name: string;
  layout?: FloorPlanLayout;
  isActive?: boolean;
}

export interface TableItem {
  id: string;
  floorPlanId?: string;
  label: string;
  capacity: number;
  positionX?: string | number;
  positionY?: string | number;
  width?: number;
  height?: number;
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
