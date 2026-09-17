import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from '../components/ui/sonner';
import { useAuthStore } from '../stores/auth.store';
import { useBrandingStore } from '../stores/branding.store';

export const useAppSocketEvents = (onNavigateHome: () => void) => {
  const { venueId, logout } = useAuthStore();
  const { loadBranding } = useBrandingStore();

  useEffect(() => {
    const socket = io();

    socket.on('venue:settings_updated', () => {
      if (venueId) loadBranding(venueId);
    });

    socket.on('user:deactivated', (payload: { userId: string }) => {
      const current = useAuthStore.getState().currentUser;
      if (current && current.id === payload.userId) {
        toast.error('Tu cuenta ha sido desactivada. Comunícate con un administrador.');
        logout();
        onNavigateHome();
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [venueId, loadBranding, logout, onNavigateHome]);
};
