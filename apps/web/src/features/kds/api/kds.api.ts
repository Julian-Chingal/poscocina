import { api } from '@/services/api';
import { KdsOrder, KdsItem, StationFilter } from '../types/kds.types';

export const kdsApi = {
  getOrders: (venueId: string, station?: StationFilter): Promise<KdsOrder[]> => {
    const url = station && station !== 'all'
      ? `/venues/${venueId}/kds/orders?station=${station}`
      : `/venues/${venueId}/kds/orders`;
    return api.get(url);
  },

  updateItemStatus: (itemId: string, status: KdsItem['status']): Promise<void> =>
    api.patch(`/order-items/${itemId}/status`, { status }),
};
