import { create } from 'zustand';

export interface UserInfo {
  id: string;
  name: string;
  roleName: string;
  roleLabel: string;
  role?: string;
  hierarchy?: number;
}

interface AuthState {
  venueId: string | null;
  setVenueId: (id: string) => void;
  currentUser: UserInfo | null;
  user: UserInfo | null; // Compatibility alias
  token: string | null;
  isLocked: boolean;
  venueUsers: UserInfo[];
  isLoading: boolean;
  error: string | null;
  setCurrentUser: (user: UserInfo) => void;
  logout: () => void;
  fetchVenueUsers: (venueId?: string) => Promise<void>;
  loginWithPin: (userId: string, pin: string, venueId?: string) => Promise<boolean>;
  lockScreen: () => void;
  unlockWithPin: (userId: string, pin: string, venueId?: string) => Promise<boolean>;
}

const getSavedToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('poscocina_token');
  }
  return null;
};

const getSavedUser = (): UserInfo | null => {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('poscocina_user');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    }
  }
  return null;
};

const initialToken = getSavedToken();
const initialUser = getSavedUser();

export const useAuthStore = create<AuthState>((set, get) => ({
  venueId: null,
  setVenueId: (id: string) => set({ venueId: id }),
  currentUser: initialUser,
  user: initialUser,
  token: initialToken,
  isLocked: !initialToken, // Require authentication if no valid session token exists
  venueUsers: [],
  isLoading: false,
  error: null,

  setCurrentUser: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('poscocina_user', JSON.stringify(user));
    }
    set({ currentUser: user, user });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('poscocina_token');
      localStorage.removeItem('poscocina_user');
    }
    set({ currentUser: null, user: null, token: null, isLocked: true });
  },

  fetchVenueUsers: async (venueId = 'default') => {
    try {
      let vId = venueId;
      if (vId === 'default') {
        const vRes = await fetch('http://localhost:3000/api/venues');
        const [v] = await vRes.json();
        if (v) vId = v.id;
      }
      const res = await fetch(`http://localhost:3000/api/auth/venue/${vId}/users`);
      if (res.ok) {
        const users = await res.json();
        set({ venueUsers: users });
      }
    } catch (err) {
      console.warn('Could not fetch venue users:', err);
    }
  },

  loginWithPin: async (userId: string, pin: string, venueId = 'default') => {
    set({ isLoading: true, error: null });
    try {
      let vId = venueId;
      if (vId === 'default') {
        const vRes = await fetch('http://localhost:3000/api/venues');
        const [v] = await vRes.json();
        if (v) vId = v.id;
      }

      const res = await fetch('http://localhost:3000/api/auth/pin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venueId: vId, userId, pin }),
      });

      if (!res.ok) {
        const data = await res.json();
        set({ error: data.error || data.message || 'PIN incorrecto', isLoading: false });
        return false;
      }

      const data = await res.json();
      const userData: UserInfo = {
        id: data.user.id,
        name: data.user.name,
        roleName: data.user.role,
        roleLabel:
          data.user.role === 'manager'
            ? 'Gerente'
            : data.user.role === 'cashier'
            ? 'Cajero'
            : data.user.role === 'waiter'
            ? 'Mesero'
            : 'Administrador',
        role: data.user.role,
        hierarchy: data.user.hierarchy,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem('poscocina_token', data.token);
        localStorage.setItem('poscocina_user', JSON.stringify(userData));
      }

      set({
        currentUser: userData,
        user: userData,
        token: data.token,
        isLocked: false,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err) {
      set({ error: 'Error de conexión con el servidor', isLoading: false });
      return false;
    }
  },

  lockScreen: () => set({ isLocked: true }),

  unlockWithPin: async (userId: string, pin: string, venueId?: string) => {
    return get().loginWithPin(userId, pin, venueId);
  },
}));
