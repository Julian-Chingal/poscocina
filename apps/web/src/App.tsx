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
import { ModulePlaceholderView } from './views/ModulePlaceholderView';
import { useAuthStore } from './stores/auth.store';
import { useBrandingStore } from './stores/branding.store';

import { io } from 'socket.io-client';

export const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('home');
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { venueId, setVenueId } = useAuthStore();
  const { loadBranding, settings } = useBrandingStore();

  useEffect(() => {
    // 1. Resolve default venue
    fetch('/api/venues/first')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.id) {
          setVenueId(data.id);
          loadBranding(data.id);
        }
      })
      .catch((err) => console.error('Error bootstrapping venue:', err));
  }, [setVenueId, loadBranding]);

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
          <SalonView venueId={venueId} onSelectTable={handleSelectTable} />
        )}

        {currentView === 'pos' && (
          <PosView venueId={venueId} selectedTable={selectedTable} />
        )}

        {currentView === 'kds' && (
          <KdsView venueId={venueId} />
        )}

        {currentView === 'catalog' && (
          <CatalogView venueId={venueId} />
        )}

        {currentView === 'settings' && (
          <SettingsView />
        )}

        {currentView === 'inventory' && (
          <InventoryView venueId={venueId} />
        )}

        {currentView === 'shifts' && (
          <CashShiftsView venueId={venueId} />
        )}

        {['reports'].includes(currentView) && (
          <ModulePlaceholderView
            moduleId={currentView}
            onBack={() => setCurrentView('home')}
          />
        )}
      </main>
    </div>
  );
};
