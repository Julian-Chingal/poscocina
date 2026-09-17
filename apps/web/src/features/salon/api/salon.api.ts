import { api } from '@/services/api';
import { FloorPlanItem, TableItem } from '../types/salon.types';

export const salonApi = {
  getTables: (venueId: string): Promise<TableItem[]> =>
    api.get(`/venues/${venueId}/tables`),

  getFloorPlans: (venueId: string): Promise<FloorPlanItem[]> =>
    api.get(`/venues/${venueId}/floor-plans`),

  createTable: (payload: any): Promise<TableItem> =>
    api.post('/tables', payload),

  updateTable: (tableId: string, payload: any): Promise<TableItem> =>
    api.patch(`/tables/${tableId}`, payload),

  deleteTable: (tableId: string): Promise<void> =>
    api.delete(`/tables/${tableId}`),

  createFloorPlan: (venueId: string, name: string): Promise<FloorPlanItem> =>
    api.post(`/venues/${venueId}/floor-plans`, { name }),

  transferTable: (sourceTableId: string, targetTableId: string): Promise<any> =>
    api.post('/tables/transfer', { sourceTableId, targetTableId }),

  mergeTables: (sourceTableId: string, targetTableId: string): Promise<any> =>
    api.post('/tables/merge', { sourceTableId, targetTableId }),
};
