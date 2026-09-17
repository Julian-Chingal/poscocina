import { useState, useEffect, useCallback } from 'react';
import { toast } from '../components/ui/sonner';
import { useAuthStore } from '../stores/auth.store';
import { useBrandingStore } from '../stores/branding.store';
import { onNetworkStatusChange } from '../services/api';

export const useAppBootstrap = () => {
  const [isApiOnline, setIsApiOnline] = useState<boolean>(true);
  const { setVenueId, checkSession, token } = useAuthStore();
  const { loadBranding, settings } = useBrandingStore();

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
        const vRes = await fetch(`/api/venues/${savedVenueId}`);
        if (vRes.ok) {
          const data = await vRes.json();
          if (data?.id) {
            setVenueId(data.id);
            loadBranding(data.id);
            return;
          }
        }
      }

      const vRes = await fetch('/api/venues/first');
      if (vRes.ok) {
        const data = await vRes.json();
        if (data?.id) {
          setVenueId(data.id);
          loadBranding(data.id);
        }
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
    if (settings.primaryColor) {
      document.documentElement.style.setProperty('--primary-brand', settings.primaryColor);
    }
  }, [settings.primaryColor]);

  return {
    isApiOnline,
    checkHealthAndBootstrap,
  };
};
