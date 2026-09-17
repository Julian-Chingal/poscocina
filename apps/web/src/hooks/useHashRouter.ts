import { useState, useEffect, useCallback } from 'react';
import { toast } from '../components/ui/sonner';
import { useAuthStore } from '../stores/auth.store';
import { usePermissions } from './usePermissions';

const getViewFromHash = (): string => {
  if (typeof window === 'undefined') return 'home';
  const hash = window.location.hash.replace(/^#\/?/, '').trim();
  return hash || 'home';
};

export const useHashRouter = () => {
  const [currentView, setCurrentView] = useState<string>(getViewFromHash);
  const { currentUser } = useAuthStore();
  const { canAccessModule } = usePermissions();

  const handleNavigate = useCallback(
    (view: string) => {
      if (view === 'home') {
        setCurrentView('home');
        window.location.hash = '';
        return;
      }

      if (!currentUser) {
        useAuthStore.getState().lockScreen();
        toast.error('Debes iniciar sesión para acceder al sistema');
        return;
      }

      if (!canAccessModule(view)) {
        toast.error('No tienes permisos para acceder a este módulo');
        setCurrentView('home');
        window.location.hash = '';
        return;
      }

      setCurrentView(view);
      window.location.hash = `/${view}`;
    },
    [currentUser, canAccessModule]
  );

  useEffect(() => {
    const handleHashChange = () => {
      const targetView = getViewFromHash();
      if (targetView !== currentView) {
        handleNavigate(targetView);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentView, handleNavigate]);

  useEffect(() => {
    if (currentView !== 'home') {
      if (!currentUser) {
        setCurrentView('home');
        window.location.hash = '';
      } else if (!canAccessModule(currentView)) {
        toast.error('No tienes permisos para acceder a este módulo');
        setCurrentView('home');
        window.location.hash = '';
      }
    }
  }, [currentView, currentUser, canAccessModule]);

  return {
    currentView,
    handleNavigate,
  };
};
