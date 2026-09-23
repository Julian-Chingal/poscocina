import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { toast } from '../components/ui/sonner';
import { useAuthStore } from '../stores/auth.store';
import { useBrandingStore } from '../stores/branding.store';

export const useAppSocketEvents = (onNavigateHome: () => void) => {
  // Atomic Zustand selectors
  const venueId = useAuthStore((s) => s.venueId);
  const logout = useAuthStore((s) => s.logout);
  const loadBranding = useBrandingStore((s) => s.loadBranding);

  useEffect(() => {
    const socket = io();

    const handleSettingsUpdated = () => {
      if (venueId) {
        loadBranding(venueId);
      }
    };

    const handleUserDeactivated = (payload: { userId: string }) => {
      const current = useAuthStore.getState().currentUser;
      if (current && current.id === payload.userId) {
        toast.error('Tu cuenta ha sido desactivada. Comunícate con un administrador.');
        logout();
        onNavigateHome();
      }
    };

    socket.on('venue:settings_updated', handleSettingsUpdated);
    socket.on('user:deactivated', handleUserDeactivated);

    return () => {
      // Explicitly detach event listeners before disconnecting socket
      socket.off('venue:settings_updated', handleSettingsUpdated);
      socket.off('user:deactivated', handleUserDeactivated);
      socket.disconnect();
    };
  }, [venueId, loadBranding, logout, onNavigateHome]);
};
