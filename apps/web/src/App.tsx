import React, { useState, useEffect, lazy, Suspense } from 'react';
import { TopBar } from './components/TopBar';
import { AppLauncherView } from './features/launcher';
import { ViewLoadingFallback } from './components/ViewLoadingFallback';
import { OfflineView } from './features/shared';
import { PinPadModal } from './features/auth';
import { Toaster } from './components/ui/sonner';
import { useAuthStore } from './stores/auth.store';
import { useBrandingStore } from './stores/branding.store';
import { usePermissions } from './hooks/usePermissions';
import { useAppBootstrap } from './hooks/useAppBootstrap';
import { useHashRouter } from './hooks/useHashRouter';
import { useGlobalKeyboardShortcuts } from './hooks/useGlobalKeyboardShortcuts';
import { useAppSocketEvents } from './hooks/useAppSocketEvents';
import type { TableItem } from './features/pos/types/pos.types';

const SalonView = lazy(() => import('./features/salon'));
const PosView = lazy(() => import('./features/pos'));
const KdsView = lazy(() => import('./features/kds'));
const CatalogView = lazy(() => import('./features/catalog'));
const SettingsView = lazy(() => import('./features/settings'));
const InventoryView = lazy(() => import('./features/inventory'));
const CashShiftsView = lazy(() => import('./features/cash-shifts'));
const ReportsView = lazy(() => import('./features/reports'));
const UsersView = lazy(() => import('./features/users'));
const ReservationsView = lazy(() => import('./features/reservations'));
const ModulePlaceholder = lazy(() => import('./features/shared/components/ModulePlaceholder'));

export const App: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { venueId, isLocked, currentUser, unlockScreen } = useAuthStore();
  const { canAccessModule } = usePermissions();

  const { isApiOnline, checkHealthAndBootstrap } = useAppBootstrap();
  const { currentView, handleNavigate } = useHashRouter();

  // Initialize corporate primary brand color on mount
  useEffect(() => {
    const initialColor = useBrandingStore.getState().settings.primaryColor;
    if (initialColor) {
      document.documentElement.style.setProperty('--primary-brand', initialColor);
    }
  }, []);

  useGlobalKeyboardShortcuts(handleNavigate);
  useAppSocketEvents(() => handleNavigate('home'));

  const handleSelectTable = (table: TableItem) => {
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
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary selection:text-primary-foreground transition-colors">
      <Toaster />

      <TopBar
        currentView={currentView}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="flex-1 overflow-auto">
        {!currentUser ? (
          <div className="min-h-[calc(100vh-48px)] flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
            <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center text-primary mb-4 shadow-xl">
              <span className="text-2xl">🔒</span>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">Terminal Bloqueada</h2>
            <p className="text-xs text-muted-foreground max-w-sm">
              Inicia sesión con tu PIN u opción de correo para acceder a los módulos operativos.
            </p>
          </div>
        ) : (
          <Suspense fallback={<ViewLoadingFallback />}>
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
              <ModulePlaceholder
                moduleId={currentView}
                onBack={() => handleNavigate('home')}
              />
            )}
          </Suspense>
        )}
      </main>

      {isLocked && (
        <PinPadModal
          isOpen={isLocked}
          isMandatoryLock={!currentUser}
          onClose={() => {
            if (currentUser) {
              unlockScreen();
            }
          }}
        />
      )}
    </div>
  );
};
