import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from '../components/ui/sonner';
import { useAuthStore } from '../stores/auth.store';
import { usePermissions } from './usePermissions';

const VIEW_NAMES: Record<string, string> = {
  home: 'Aplicaciones',
  salon: 'Salón y Mesas',
  reservations: 'Reservas de Mesas',
  pos: 'Punto de Venta',
  kds: 'Cocina KDS',
  catalog: 'Menú y Catálogo',
  inventory: 'Inventario y Recetas',
  shifts: 'Caja y Turnos',
  reports: 'Reportes y Métricas',
  users: 'Gestión de Empleados',
  settings: 'Ajustes del Sistema',
};

const getViewFromHash = (): string => {
  if (typeof window === 'undefined') return 'home';
  const hash = window.location.hash.replace(/^#\/?/, '').trim();
  return hash || 'home';
};

export const useHashRouter = () => {
  const [currentView, setCurrentView] = useState<string>(getViewFromHash);
  const [history, setHistory] = useState<string[]>(() => {
    const initial = getViewFromHash();
    return initial === 'home' ? ['home'] : ['home', initial];
  });

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
      if (view === currentView) return;

      if (view === 'home') {
        setCurrentView('home');
        syncHashToView('home');
        setHistory((prev) => (prev[prev.length - 1] === 'home' ? prev : [...prev, 'home']));
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
      setHistory((prev) => (prev[prev.length - 1] === view ? prev : [...prev, view]));
    },
    [currentView, currentUser, canAccessModule, syncHashToView]
  );

  const handleBack = useCallback(() => {
    setHistory((prev) => {
      if (prev.length > 1) {
        const nextHistory = prev.slice(0, -1);
        const previousView = nextHistory[nextHistory.length - 1];
        setCurrentView(previousView);
        syncHashToView(previousView);
        return nextHistory;
      } else {
        setCurrentView('home');
        syncHashToView('home');
        return ['home'];
      }
    });
  }, [syncHashToView]);

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
        setHistory((prev) => {
          if (prev.length > 1 && prev[prev.length - 2] === 'home') {
            return prev.slice(0, -1);
          }
          return prev[prev.length - 1] === 'home' ? prev : [...prev, 'home'];
        });
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
      setHistory((prev) => {
        if (prev.length > 1 && prev[prev.length - 2] === targetView) {
          return prev.slice(0, -1);
        }
        return prev[prev.length - 1] === targetView ? prev : [...prev, targetView];
      });
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

  const canGoBack = currentView !== 'home';
  const previousViewId = history.length > 1 ? history[history.length - 2] : 'home';
  const previousViewTitle = VIEW_NAMES[previousViewId] || previousViewId;

  return {
    currentView,
    handleNavigate,
    handleBack,
    canGoBack,
    previousViewTitle,
    history,
  };
};
