import React, { useEffect, useState } from 'react';
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
import { useAuthStore } from './stores/auth.store';
import { useBrandingStore } from './stores/branding.store';

import { io } from 'socket.io-client';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isApiOnline, setIsApiOnline] = useState<boolean>(true);

  const { venueId, setVenueId, isLocked, currentUser } = useAuthStore();
  const { loadBranding, settings } = useBrandingStore();

  const checkHealthAndBootstrap = async () => {
    try {
      const healthRes = await fetch('/health');
      if (!healthRes.ok) {
        setIsApiOnline(false);
        return;
      }
      setIsApiOnline(true);

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
        setCurrentView('salon');
      } else if (e.key === 'F2') {
        e.preventDefault();
        setCurrentView('pos');
      } else if (e.key === 'F3') {
        e.preventDefault();
        setCurrentView('kds');
      } else if (e.key === 'F4') {
        e.preventDefault();
        setCurrentView('shifts');
      } else if (e.key === 'Escape') {
        if (!isInput) {
          e.preventDefault();
          setCurrentView('home');
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        useAuthStore.getState().lockScreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const socket = io();
    socket.on('venue:settings_updated', () => {
      if (venueId) loadBranding(venueId);
    });
    return () => {
      socket.disconnect();
    };
  }, [venueId, loadBranding]);

  // Apply custom primary color dynamically to document root if specified
  useEffect(() => {
    if (settings.primaryColor) {
      document.documentElement.style.setProperty('--primary-brand', settings.primaryColor);
    }
  }, [settings.primaryColor]);

  const handleSelectTable = (table: any) => {
    setSelectedTable(table);
    setCurrentView('pos');
  };

  const handleSelectApp = (appId: string) => {
    setSearchQuery('');
    setCurrentView(appId);
  };

  if (!isApiOnline) {
    return <OfflineView onRetry={checkHealthAndBootstrap} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-orange-500">
      {/* Global Top Bar */}
      <TopBar
        currentView={currentView}
        onNavigate={setCurrentView}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Main View Area */}
      <main className="flex-1 overflow-auto">
        {currentView === 'home' && (
          <AppLauncherView onSelectApp={handleSelectApp} searchQuery={searchQuery} />
        )}

        {currentView === 'salon' && (
          <SalonView venueId={venueId || ''} onSelectTable={handleSelectTable} />
        )}

        {currentView === 'pos' && (
          <PosView venueId={venueId || ''} selectedTable={selectedTable} />
        )}

        {currentView === 'kds' && (
          <KdsView venueId={venueId || ''} />
        )}

        {currentView === 'catalog' && (
          <CatalogView venueId={venueId || ''} />
        )}

        {currentView === 'settings' && (
          <SettingsView />
        )}

        {currentView === 'inventory' && (
          <InventoryView venueId={venueId || ''} />
        )}

        {currentView === 'shifts' && (
          <CashShiftsView venueId={venueId || ''} />
        )}

        {currentView === 'reports' && (
          <ReportsView venueId={venueId || ''} />
        )}

        {currentView === 'users' && (
          <UsersView venueId={venueId || ''} />
        )}

        {currentView === 'reservations' && (
          <ReservationsView
            venueId={venueId || ''}
            onNavigateToTable={(table) => {
              setSelectedTable(table);
              setCurrentView('pos');
            }}
          />
        )}

        {!['home', 'salon', 'reservations', 'pos', 'kds', 'catalog', 'settings', 'inventory', 'shifts', 'reports', 'users'].includes(currentView) && (
          <ModulePlaceholderView
            moduleId={currentView}
            onBack={() => setCurrentView('home')}
          />
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
