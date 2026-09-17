import React, { useState, lazy, Suspense } from 'react';
import { TopBar } from './components/TopBar';
import { AppLauncherView } from './features/launcher';
import { ViewLoadingFallback } from './components/ViewLoadingFallback';
import { OfflineView } from './views/OfflineView';
import { PinPadModal } from './features/auth';
import { Toaster } from './components/ui/sonner';
import { useAuthStore } from './stores/auth.store';
import { usePermissions } from './hooks/usePermissions';
import { useAppBootstrap } from './hooks/useAppBootstrap';
import { useHashRouter } from './hooks/useHashRouter';
import { useGlobalKeyboardShortcuts } from './hooks/useGlobalKeyboardShortcuts';
import { useAppSocketEvents } from './hooks/useAppSocketEvents';

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
const ModulePlaceholderView = lazy(() => import('./views/ModulePlaceholderView'));

export const App: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const { venueId, isLocked, currentUser } = useAuthStore();
  const { canAccessModule } = usePermissions();

  const { isApiOnline, checkHealthAndBootstrap } = useAppBootstrap();
  const { currentView, handleNavigate } = useHashRouter();

  useGlobalKeyboardShortcuts(handleNavigate);
  useAppSocketEvents(() => handleNavigate('home'));

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
      <Toaster />

      <TopBar
        currentView={currentView}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

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
              <ModulePlaceholderView
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
              useAuthStore.setState({ isLocked: false });
            }
          }}
        />
      )}
    </div>
  );
};
