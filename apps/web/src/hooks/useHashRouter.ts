import { useState, useEffect, useCallback, useRef } from 'react';
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
  // Atomic selector to avoid re-renders on unrelated auth state changes
  const currentUser = useAuthStore((s) => s.currentUser);
  const { canAccessModule } = usePermissions();

  // Flag to avoid race conditions and re-entrant loops when updating hash programmatically
  const isInternalNavRef = useRef(false);

  const syncHashToView = useCallback((view: string) => {
    const expectedHash = view === 'home' ? '' : `#/${view}`;
    if (window.location.hash !== expectedHash) {
      isInternalNavRef.current = true;
      window.location.hash = expectedHash;
    }
  }, []);

  const handleNavigate = useCallback(
    (view: string) => {
      if (view === 'home') {
        setCurrentView('home');
        syncHashToView('home');
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
        syncHashToView('home');
        return;
      }

      setCurrentView(view);
      syncHashToView(view);
    },
    [currentUser, canAccessModule, syncHashToView]
  );

  useEffect(() => {
    const handleHashChange = () => {
      // Guard against race conditions from programmatic hash changes
      if (isInternalNavRef.current) {
        isInternalNavRef.current = false;
        return;
      }

      const targetView = getViewFromHash();
      if (targetView === 'home') {
        setCurrentView('home');
        return;
      }

      const user = useAuthStore.getState().currentUser;
      if (!user) {
        useAuthStore.getState().lockScreen();
        toast.error('Debes iniciar sesión para acceder al sistema');
        setCurrentView('home');
        isInternalNavRef.current = true;
        window.location.hash = '';
        return;
      }

      if (!canAccessModule(targetView)) {
        toast.error('No tienes permisos para acceder a este módulo');
        setCurrentView('home');
        isInternalNavRef.current = true;
        window.location.hash = '';
        return;
      }

      setCurrentView(targetView);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [canAccessModule]);

  // Auth / permissions synchronization on view changes
  useEffect(() => {
    if (currentView !== 'home') {
      if (!currentUser) {
        setCurrentView('home');
        syncHashToView('home');
      } else if (!canAccessModule(currentView)) {
        toast.error('No tienes permisos para acceder a este módulo');
        setCurrentView('home');
        syncHashToView('home');
      }
    }
  }, [currentView, currentUser, canAccessModule, syncHashToView]);

  return {
    currentView,
    handleNavigate,
  };
};
