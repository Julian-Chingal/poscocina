import { useState, useEffect, useCallback } from 'react';
import { toast } from '../components/ui/sonner';
import { useAuthStore } from '../stores/auth.store';
import { useBrandingStore } from '../stores/branding.store';
import { useShiftStore } from '../stores/shift.store';
import { api, onNetworkStatusChange } from '../services/api';

export const useAppBootstrap = () => {
  const [isApiOnline, setIsApiOnline] = useState<boolean>(true);

  // Atomic Zustand selectors
  const token = useAuthStore((s) => s.token);
  const setVenueId = useAuthStore((s) => s.setVenueId);
  const checkSession = useAuthStore((s) => s.checkSession);

  const loadBranding = useBrandingStore((s) => s.loadBranding);
  const primaryColor = useBrandingStore((s) => s.settings.primaryColor);

  const checkHealthAndBootstrap = useCallback(async () => {
    try {
      const healthRes = await fetch('/health');
      if (!healthRes.ok) {
        setIsApiOnline(false);
        return;
      }
      setIsApiOnline(true);

      if (token) {
        const isValid = await checkSession();
        if (!isValid) {
          toast.error('Sesión expirada. Inicia sesión nuevamente');
        }
      }

      const savedVenueId = localStorage.getItem('poscocina_venue_id');
      if (savedVenueId) {
        try {
          const data = await api.get(`/venues/${savedVenueId}`);
          if (data?.id) {
            setVenueId(data.id);
            loadBranding(data.id);
            useShiftStore.getState().fetchCurrentShift(data.id);
            return;
          }
        } catch {
          // If saved venue fails or is invalid, proceed to fallback first venue
        }
      }

      try {
        const data = await api.get('/venues/first');
        if (data?.id) {
          setVenueId(data.id);
          loadBranding(data.id);
          useShiftStore.getState().fetchCurrentShift(data.id);
        }
      } catch (venueErr) {
        console.warn('Could not bootstrap default venue:', venueErr);
      }
    } catch (err) {
      console.warn('API health check failed:', err);
      setIsApiOnline(false);
    }
  }, [token, checkSession, setVenueId, loadBranding]);

  useEffect(() => {
    checkHealthAndBootstrap();

    const timer = setInterval(() => {
      fetch('/health')
        .then((res) => setIsApiOnline(res.ok))
        .catch(() => setIsApiOnline(false));
    }, 30000);

    const unsubscribe = onNetworkStatusChange((online) => {
      setIsApiOnline(online);
    });

    return () => {
      clearInterval(timer);
      unsubscribe();
    };
  }, [checkHealthAndBootstrap]);

  useEffect(() => {
    if (primaryColor) {
      document.documentElement.style.setProperty('--primary-brand', primaryColor);
    }
  }, [primaryColor]);

  return {
    isApiOnline,
    checkHealthAndBootstrap,
  };
};
