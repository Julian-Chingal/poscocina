import { api } from '@/services/api';
import { KdsOrder, KdsItem, StationFilter } from '../types/kds.types';

export const kdsApi = {
  getOrders: (venueId: string, station?: StationFilter): Promise<KdsOrder[]> => {
    let url = `/venues/${venueId}/kds/orders`;
    if (station === 'history') {
      url += '?history=true';
    } else if (station && station !== 'all') {
      url += `?station=${station}`;
    }
    return api.get(url);
  },

  updateItemStatus: (itemId: string, status: KdsItem['status']): Promise<any> =>
    api.patch(`/order-items/${itemId}/status`, { status }),

  modifyItem: (itemId: string, data: any): Promise<any> =>
    api.patch(`/order-items/${itemId}`, data),

  deleteItem: (itemId: string, kitchenApproved = false): Promise<any> =>
    api.delete(`/order-items/${itemId}?kitchenApproved=${kitchenApproved}&source=kds`),
};
