import { create } from 'zustand';

export interface UserInfo {
  id: string;
  name: string;
  venueId?: string;
  email?: string;
  roleName: string;
  roleLabel: string;
  role?: string;
  hierarchy?: number;
}

export interface PublicVenueItem {
  id: string;
  name: string;
  isPrimary: boolean;
  isActive?: boolean;
}

interface AuthState {
  venueId: string | null;
  setVenueId: (id: string) => void;
  availableVenues: PublicVenueItem[];
  selectedVenueId: string | null;
  setSelectedVenueId: (id: string) => void;
  fetchPublicVenues: () => Promise<void>;
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

const getSavedLockState = (): boolean => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('poscocina_locked') === 'true';
  }
  return false;
};

const getSavedVenueId = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('poscocina_venue_id');
  }
  return null;
};

const initialToken = getSavedToken();
const initialUser = getSavedUser();
const initialLocked = !initialToken || getSavedLockState();
const initialVenueId = getSavedVenueId();

export const useAuthStore = create<AuthState>((set, get) => ({
  venueId: initialVenueId,
  setVenueId: (id: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('poscocina_venue_id', id);
    }
    set({ venueId: id, selectedVenueId: id });
  },
  availableVenues: [],
  selectedVenueId: initialVenueId,
  setSelectedVenueId: (id: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('poscocina_venue_id', id);
    }
    set({ selectedVenueId: id, venueId: id });
  },
  fetchPublicVenues: async () => {
    try {
      const res = await fetch('/api/venues/public');
      if (res.ok) {
        const venues: PublicVenueItem[] = await res.json();
        set({ availableVenues: venues });
        const currentSelected =
          get().selectedVenueId ||
          (typeof window !== 'undefined' ? localStorage.getItem('poscocina_venue_id') : null);
        const exists = venues.some((v) => v.id === currentSelected);
        let targetId = currentSelected;
        if (!exists) {
          const primaryVenue = venues.find((v) => v.isPrimary) || venues[0];
          if (primaryVenue) {
            targetId = primaryVenue.id;
            get().setSelectedVenueId(primaryVenue.id);
          }
        } else if (currentSelected && !get().selectedVenueId) {
          set({ selectedVenueId: currentSelected, venueId: currentSelected });
        }
        if (targetId) {
          get().fetchVenueUsers(targetId);
        }
      }
    } catch (err) {
      console.warn('Could not fetch public venues:', err);
    }
  },
  currentUser: initialUser,
  user: initialUser,
  token: initialToken,
  isLocked: initialLocked, // Require authentication if no valid session token exists or terminal was locked
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
      sessionStorage.removeItem('poscocina_locked');
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
        const currentLock = getSavedLockState();
        set({ currentUser: userData, user: userData, isLocked: currentLock });
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
      let vId = venueId && venueId !== 'default' ? venueId : get().selectedVenueId || get().venueId;
      if (!vId && typeof window !== 'undefined') {
        vId = localStorage.getItem('poscocina_venue_id');
      }

      if (!vId || vId === 'default') {
        const vRes = await fetch('/api/venues/public');
        if (vRes.ok) {
          const list: PublicVenueItem[] = await vRes.json();
          const primary = list.find((v) => v.isPrimary) || list[0];
          if (primary) {
            vId = primary.id;
            set({ venueId: primary.id, selectedVenueId: primary.id });
            if (typeof window !== 'undefined') {
              localStorage.setItem('poscocina_venue_id', primary.id);
            }
          }
        }
      }

      if (!vId || vId === 'default') {
        const vRes = await fetch('/api/venues/first');
        if (vRes.ok) {
          const v = await vRes.json();
          if (v?.id) {
            vId = v.id;
            set({ venueId: v.id, selectedVenueId: v.id });
            if (typeof window !== 'undefined') {
              localStorage.setItem('poscocina_venue_id', v.id);
            }
          }
        }
      }

      if (vId && vId !== 'default') {
        const res = await fetch(`/api/auth/venue/${vId}/users`);
        if (res.ok) {
          const users = await res.json();
          set({ venueUsers: users });
        } else {
          set({ venueUsers: [] });
        }
      } else {
        set({ venueUsers: [] });
      }
    } catch (err) {
      console.warn('Could not fetch venue users:', err);
      set({ venueUsers: [] });
    }
  },

  loginWithPin: async (userId: string, pin: string, venueId) => {
    set({ isLoading: true, error: null });
    try {
      let vId = venueId && venueId !== 'default' ? venueId : get().selectedVenueId || get().venueId;
      if (!vId && typeof window !== 'undefined') {
        vId = localStorage.getItem('poscocina_venue_id');
      }
      if (!vId || vId === 'default') {
        const vRes = await fetch('/api/venues/public');
        if (vRes.ok) {
          const list: PublicVenueItem[] = await vRes.json();
          const primary = list.find((v) => v.isPrimary) || list[0];
          if (primary) {
            vId = primary.id;
          }
        }
      }
      if (!vId || vId === 'default') {
        const vRes = await fetch('/api/venues/first');
        if (vRes.ok) {
          const v = await vRes.json();
          if (v?.id) {
            vId = v.id;
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
        venueId: data.user.venueId,
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

      const finalVenueId = data.user.venueId || vId;
      if (typeof window !== 'undefined') {
        localStorage.setItem('poscocina_token', data.token);
        localStorage.setItem('poscocina_user', JSON.stringify(userData));
        if (finalVenueId) {
          localStorage.setItem('poscocina_venue_id', finalVenueId);
        }
        sessionStorage.removeItem('poscocina_locked');
      }

      set({
        currentUser: userData,
        user: userData,
        venueId: finalVenueId,
        selectedVenueId: finalVenueId,
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
        sessionStorage.removeItem('poscocina_locked');
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

  lockScreen: async () => {
    const token = get().token;
    if (token) {
      try {
        fetch('/api/auth/terminal/lock', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }).catch((err) => console.warn('Could not lock terminal on server:', err));
      } catch (e) {}
    }
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('poscocina_locked', 'true');
    }
    set({ isLocked: true });
  },

  unlockScreen: () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('poscocina_locked');
    }
    set({ isLocked: false });
  },

  unlockWithPin: async (userId: string, pin: string, venueId?: string) => {
    return get().loginWithPin(userId, pin, venueId);
  },
}));
