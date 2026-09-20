import { create } from 'zustand';

export interface UserInfo {
  id: string;
  name: string;
  email?: string;
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
  checkSession: () => Promise<boolean>;
  fetchVenueUsers: (venueId?: string) => Promise<void>;
  loginWithPin: (userId: string, pin: string, venueId?: string) => Promise<boolean>;
  loginWithPassword: (email: string, password: string) => Promise<boolean>;
  lockScreen: () => void;
  unlockScreen: () => void;
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

  logout: async () => {
    const token = get().token;
    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.warn('Could not revoke session on server:', err);
      }
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('poscocina_token');
      localStorage.removeItem('poscocina_user');
    }
    set({ currentUser: null, user: null, token: null, isLocked: true });
  },

  checkSession: async () => {
    const token = get().token;
    if (!token) {
      set({ currentUser: null, user: null, isLocked: true });
      return false;
    }
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        const userData: UserInfo = {
          id: data.user.id,
          name: data.user.name,
          roleName: data.user.roleName || data.user.role,
          roleLabel: data.user.roleLabel,
          role: data.user.role,
          hierarchy: data.user.hierarchy,
        };
        if (typeof window !== 'undefined') {
          localStorage.setItem('poscocina_user', JSON.stringify(userData));
        }
        set({ currentUser: userData, user: userData, isLocked: false });
        if (data.user.venueId && !get().venueId) {
          set({ venueId: data.user.venueId });
        }
        return true;
      } else {
        get().logout();
        return false;
      }
    } catch (err) {
      console.warn('Error verifying session:', err);
      return false;
    }
  },

  fetchVenueUsers: async (venueId) => {
    try {
      let vId = venueId && venueId !== 'default' ? venueId : get().venueId;
      if (!vId || vId === 'default') {
        const vRes = await fetch('/api/venues/first');
        if (vRes.ok) {
          const v = await vRes.json();
          if (v?.id) {
            vId = v.id;
            set({ venueId: v.id });
          }
        }
      }
      const res = await fetch(`/api/auth/venue/${vId || 'default'}/users`);
      if (res.ok) {
        const users = await res.json();
        set({ venueUsers: users });
      }
    } catch (err) {
      console.warn('Could not fetch venue users:', err);
    }
  },

  loginWithPin: async (userId: string, pin: string, venueId) => {
    set({ isLoading: true, error: null });
    try {
      let vId = venueId && venueId !== 'default' ? venueId : get().venueId;
      if (!vId || vId === 'default') {
        const vRes = await fetch('/api/venues/first');
        if (vRes.ok) {
          const v = await vRes.json();
          if (v?.id) {
            vId = v.id;
            set({ venueId: v.id });
          }
        }
      }

      const res = await fetch('/api/auth/pin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venueId: vId || 'default', userId, pin }),
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

  loginWithPassword: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        set({ error: data.error || data.message || 'Credenciales incorrectas', isLoading: false });
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
  unlockScreen: () => set({ isLocked: false }),

  unlockWithPin: async (userId: string, pin: string, venueId?: string) => {
    return get().loginWithPin(userId, pin, venueId);
  },
}));
