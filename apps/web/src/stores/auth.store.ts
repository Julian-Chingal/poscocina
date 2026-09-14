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

const defaultUser: UserInfo = {
  id: 'demo-admin',
  name: 'Carlos Gerente',
  roleName: 'manager',
  roleLabel: 'Gerente de Local',
  role: 'manager',
  hierarchy: 2,
};

export const useAuthStore = create<AuthState>((set, get) => ({
  venueId: null,
  setVenueId: (id: string) => set({ venueId: id }),
  currentUser: defaultUser,
  user: defaultUser,
  token: null,
  isLocked: false,
  venueUsers: [],
  isLoading: false,
  error: null,

  setCurrentUser: (user) => set({ currentUser: user, user }),
  logout: () => set({ currentUser: null, user: null, token: null, isLocked: true }),

  fetchVenueUsers: async (venueId = 'default') => {
    try {
      // First get default venue id if default passed
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
        // Set first user as active if none set
        if (!get().currentUser && users.length > 0) {
          set({ currentUser: users[0] });
        }
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
        set({ error: data.error || 'PIN incorrecto', isLoading: false });
        return false;
      }

      const data = await res.json();
      set({
        currentUser: {
          id: data.user.id,
          name: data.user.name,
          roleName: data.user.role,
          roleLabel: data.user.role === 'manager' ? 'Gerente' : data.user.role === 'cashier' ? 'Cajero' : data.user.role === 'waiter' ? 'Mesero' : 'Administrador',
          hierarchy: data.user.hierarchy,
        },
        token: data.token,
        isLocked: false,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err) {
      set({ error: 'Error de red al verificar PIN', isLoading: false });
      return false;
    }
  },

  lockScreen: () => set({ isLocked: true }),

  unlockWithPin: async (userId: string, pin: string, venueId?: string) => {
    return get().loginWithPin(userId, pin, venueId);
  },
}));
