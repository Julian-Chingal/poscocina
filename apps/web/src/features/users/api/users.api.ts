import { api } from '@/services/api';
import {
  UserItem,
  RoleItem,
  CreateUserPayload,
  UpdateUserPayload,
} from '../types/users.types';

export const usersApi = {
  getUsers: (venueId: string): Promise<UserItem[]> =>
    api.get(`/venues/${venueId}/users`),

  getRoles: (): Promise<RoleItem[]> =>
    api.get('/roles'),

  createUser: (venueId: string, payload: CreateUserPayload): Promise<UserItem> =>
    api.post(`/venues/${venueId}/users`, payload),

  updateUser: (venueId: string, userId: string, payload: UpdateUserPayload): Promise<UserItem> =>
    api.patch(`/venues/${venueId}/users/${userId}`, payload),

  resetPin: (venueId: string, userId: string, newPin: string): Promise<void> =>
    api.post(`/venues/${venueId}/users/${userId}/reset-pin`, { newPin }),

  deleteUser: (venueId: string, userId: string): Promise<void> =>
    api.delete(`/venues/${venueId}/users/${userId}`),

  reactivateUser: (venueId: string, userId: string): Promise<void> =>
    api.patch(`/venues/${venueId}/users/${userId}`, { isActive: true }),
};
