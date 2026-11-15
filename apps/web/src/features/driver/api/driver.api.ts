import { api } from '@/services/api';
import {
  DriverProfile,
  DriverOrder,
  DriverWalletResponse,
} from '../types/driver.types';

export const driverApi = {
  getProfile: (): Promise<DriverProfile> =>
    api.get('/driver/profile'),

  updateStatus: (data: { status: 'offline' | 'available' | 'busy'; currentLat?: number; currentLng?: number }): Promise<DriverProfile> =>
    api.patch('/driver/status', data),

  getAvailableOrders: (): Promise<DriverOrder[]> =>
    api.get('/driver/available-orders'),

  getMyOrders: (): Promise<DriverOrder[]> =>
    api.get('/driver/orders'),

  claimOrder: (orderId: string): Promise<{ success: boolean; order: DriverOrder }> =>
    api.post(`/driver/orders/${orderId}/claim`),

  confirmPickup: (orderId: string, pickupPin: string): Promise<{ success: boolean; order: DriverOrder }> =>
    api.post(`/driver/orders/${orderId}/confirm-pickup`, { pickupPin }),

  completeDelivery: (orderId: string, deliveryPin: string): Promise<{ success: boolean; order: DriverOrder }> =>
    api.post(`/driver/orders/${orderId}/complete-delivery`, { deliveryPin }),

  getWallet: (): Promise<DriverWalletResponse> =>
    api.get('/driver/wallet'),

  register: (data: any): Promise<{ token: string; user: any; profile: DriverProfile }> =>
    api.post('/driver/register', data),
};
