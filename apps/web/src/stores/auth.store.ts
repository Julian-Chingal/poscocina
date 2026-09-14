import { create } from 'zustand';

export interface UserSession {
  id: string;
  name: string;
  role: string;
  hierarchy: number;
}

interface AuthState {
  token: string | null;
  user: UserSession | null;
  venueId: string;
  setSession: (token: string, user: UserSession) => void;
  setVenueId: (id: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('pos_token'),
  user: localStorage.getItem('pos_user') ? JSON.parse(localStorage.getItem('pos_user')!) : null,
  venueId: localStorage.getItem('pos_venue_id') || '',
  setSession: (token, user) => {
    localStorage.setItem('pos_token', token);
    localStorage.setItem('pos_user', JSON.stringify(user));
    set({ token, user });
  },
  setVenueId: (id) => {
    localStorage.setItem('pos_venue_id', id);
    set({ venueId: id });
  },
  logout: () => {
    localStorage.removeItem('pos_token');
    localStorage.removeItem('pos_user');
    set({ token: null, user: null });
  },
}));
