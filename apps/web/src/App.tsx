import React, { useEffect, useState, useCallback } from 'react';
import { TopBar } from './components/TopBar';
import { AppLauncherView } from './views/AppLauncherView';
import { SalonView } from './views/SalonView';
import { PosView } from './views/PosView';
import { KdsView } from './views/KdsView';
import { CatalogView } from './views/CatalogView';
import { SettingsView } from './views/SettingsView';
import { InventoryView } from './views/InventoryView';
import { CashShiftsView } from './views/CashShiftsView';
import { ReportsView } from './views/ReportsView';
import { UsersView } from './views/UsersView';
import { ReservationsView } from './views/ReservationsView';
import { ModulePlaceholderView } from './views/ModulePlaceholderView';
import { OfflineView } from './views/OfflineView';
import { PinPadModal } from './components/PinPadModal';
import { Toaster, toast } from './components/ui/sonner';
import { useAuthStore } from './stores/auth.store';
import { useBrandingStore } from './stores/branding.store';
import { usePermissions } from './hooks/usePermissions';
import { io } from 'socket.io-client';

const getViewFromHash = (): string => {
  if (typeof window === 'undefined') return 'home';
  const hash = window.location.hash.replace(/^#\/?/, '').trim();
  return hash || 'home';
};

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>(getViewFromHash);
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isApiOnline, setIsApiOnline] = useState<boolean>(true);

  const { venueId, setVenueId, isLocked, currentUser, checkSession, logout, token } = useAuthStore();
  const { loadBranding, settings } = useBrandingStore();
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

  const checkHealthAndBootstrap = async () => {
    try {
      const healthRes = await fetch('/health');
      if (!healthRes.ok) {
        setIsApiOnline(false);
        return;
      }
      setIsApiOnline(true);

      // Verify token/session on startup
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
  };

  useEffect(() => {
    checkHealthAndBootstrap();

    // Heartbeat every 30 seconds
    const timer = setInterval(() => {
      fetch('/health')
        .then((res) => setIsApiOnline(res.ok))
        .catch(() => setIsApiOnline(false));
    }, 30000);

    return () => clearInterval(timer);
  }, []);

  // Sync with window.location.hash on hashchange
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

  // Route Guard verification whenever currentView or currentUser changes
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

  // Global POS Kiosk Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable);

      if (e.key === 'F1') {
        e.preventDefault();
        handleNavigate('salon');
      } else if (e.key === 'F2') {
        e.preventDefault();
        handleNavigate('pos');
      } else if (e.key === 'F3') {
        e.preventDefault();
        handleNavigate('kds');
      } else if (e.key === 'F4') {
        e.preventDefault();
        handleNavigate('shifts');
      } else if (e.key === 'Escape') {
        if (!isInput) {
          e.preventDefault();
          handleNavigate('home');
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        useAuthStore.getState().lockScreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNavigate]);

  // Socket.IO event listeners
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
        setCurrentView('home');
        window.location.hash = '';
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [venueId, loadBranding, logout]);

  // Apply custom primary color dynamically to document root if specified
  useEffect(() => {
    if (settings.primaryColor) {
      document.documentElement.style.setProperty('--primary-brand', settings.primaryColor);
    }
  }, [settings.primaryColor]);

  const handleSelectTable = (table: any) => {
    setSelectedTable(table);
    handleNavigate('pos');
  };

  const handleSelectApp = (appId: string) => {
    setSearchQuery('');
    handleNavigate(appId);
  };

  if (!isApiOnline) {
    return (
      <>
        <Toaster />
        <OfflineView onRetry={checkHealthAndBootstrap} />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500">
      {/* Global Notifications Toaster */}
      <Toaster />

      {/* Global Top Bar */}
      <TopBar
        currentView={currentView}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main View Area */}
      <main className="flex-1 overflow-auto">
        {!currentUser ? (
          <div className="min-h-[calc(100vh-48px)] flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-amber-400 mb-4 shadow-xl">
              <span className="text-2xl">🔒</span>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Terminal Bloqueada</h2>
            <p className="text-xs text-slate-400 max-w-sm">
              Inicia sesión con tu PIN u opción de correo para acceder a los módulos operativos.
            </p>
          </div>
        ) : (
          <>
            {currentView === 'home' && (
              <AppLauncherView onSelectApp={handleSelectApp} searchQuery={searchQuery} />
            )}

            {currentView === 'salon' && canAccessModule('salon') && (
              <SalonView venueId={venueId || ''} onSelectTable={handleSelectTable} />
            )}

            {currentView === 'pos' && canAccessModule('pos') && (
              <PosView venueId={venueId || ''} selectedTable={selectedTable} />
            )}

            {currentView === 'kds' && canAccessModule('kds') && (
              <KdsView venueId={venueId || ''} />
            )}

            {currentView === 'catalog' && canAccessModule('catalog') && (
              <CatalogView venueId={venueId || ''} />
            )}

            {currentView === 'settings' && canAccessModule('settings') && (
              <SettingsView />
            )}

            {currentView === 'inventory' && canAccessModule('inventory') && (
              <InventoryView venueId={venueId || ''} />
            )}

            {currentView === 'shifts' && canAccessModule('shifts') && (
              <CashShiftsView venueId={venueId || ''} />
            )}

            {currentView === 'reports' && canAccessModule('reports') && (
              <ReportsView venueId={venueId || ''} />
            )}

            {currentView === 'users' && canAccessModule('users') && (
              <UsersView venueId={venueId || ''} />
            )}

            {currentView === 'reservations' && canAccessModule('reservations') && (
              <ReservationsView
                venueId={venueId || ''}
                onNavigateToTable={(table) => {
                  setSelectedTable(table);
                  handleNavigate('pos');
                }}
              />
            )}

            {!['home', 'salon', 'reservations', 'pos', 'kds', 'catalog', 'settings', 'inventory', 'shifts', 'reports', 'users'].includes(currentView) && (
              <ModulePlaceholderView
                moduleId={currentView}
                onBack={() => handleNavigate('home')}
              />
            )}
          </>
        )}
      </main>

      {/* Terminal Lock / Auth Overlay */}
      {isLocked && (
        <PinPadModal
          isOpen={isLocked}
          isMandatoryLock={!currentUser}
          onClose={() => {
            if (currentUser) {
              useAuthStore.setState({ isLocked: false });
            }
          }}
        />
      )}
    </div>
  );
};
