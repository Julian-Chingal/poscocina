import React, { useState, lazy, Suspense } from "react";
import { TopBar } from "./components/TopBar";
import { AppLauncherView } from "./components/navigation/launcher";
import { ViewLoadingFallback } from "./components/ViewLoadingFallback";
import { OfflineView } from "./features/shared";
import { LockScreen } from "./features/auth";
import { Toaster } from "./components/ui/sonner";
import { useAuthStore } from "./stores/auth.store";
import { usePermissions } from "./hooks/usePermissions";
import { useAppBootstrap } from "./hooks/useAppBootstrap";
import { useHashRouter } from "./hooks/useHashRouter";
import { useGlobalKeyboardShortcuts } from "./hooks/useGlobalKeyboardShortcuts";
import { useAppSocketEvents } from "./hooks/useAppSocketEvents";
import type { TableItem } from "./features/pos/types/pos.types";

// Vistas con Code Splitting
const SalonView = lazy(() => import("./features/salon"));
const PosView = lazy(() => import("./features/pos"));
const KdsView = lazy(() => import("./features/kds"));
const CatalogView = lazy(() => import("./features/catalog"));
const SettingsView = lazy(() => import("./features/settings"));
const InventoryView = lazy(() => import("./features/inventory"));
const CashShiftsView = lazy(() => import("./features/cash-shifts"));
const ReportsView = lazy(() => import("./features/reports"));
const UsersView = lazy(() => import("./features/users"));
const ReservationsView = lazy(() => import("./features/reservations"));
const ModulePlaceholder = lazy(
  () => import("./features/shared/components/ModulePlaceholder"),
);

export const App: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<TableItem | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Selectores atómicos de Zustand
  const venueId = useAuthStore((s) => s.venueId);
  const isLocked = useAuthStore((s) => s.isLocked);
  const currentUser = useAuthStore((s) => s.currentUser);

  const { canAccessModule } = usePermissions();
  const { isApiOnline, checkHealthAndBootstrap } = useAppBootstrap();
  const { currentView, handleNavigate } = useHashRouter();

  useGlobalKeyboardShortcuts(handleNavigate);
  useAppSocketEvents(() => handleNavigate("home"));

  const handleSelectTable = (table: TableItem) => {
    setSelectedTable(table);
    handleNavigate("pos");
  };

  const handleSelectApp = (appId: string) => {
    setSearchQuery("");
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

  // Render condicional del módulo activo
  const renderCurrentView = () => {
    if (currentView === "home") {
      return (
        <AppLauncherView
          onSelectApp={handleSelectApp}
          searchQuery={searchQuery}
        />
      );
    }

    if (!canAccessModule(currentView)) {
      return (
        <ModulePlaceholder
          moduleId={currentView}
          onBack={() => handleNavigate("home")}
        />
      );
    }

    switch (currentView) {
      case "salon":
        return (
          <SalonView
            venueId={venueId || ""}
            onSelectTable={handleSelectTable}
          />
        );
      case "pos":
        return (
          <PosView venueId={venueId || ""} selectedTable={selectedTable} />
        );
      case "kds":
        return <KdsView venueId={venueId || ""} />;
      case "catalog":
        return <CatalogView venueId={venueId || ""} />;
      case "settings":
        return <SettingsView />;
      case "inventory":
        return <InventoryView venueId={venueId || ""} />;
      case "shifts":
        return <CashShiftsView venueId={venueId || ""} />;
      case "reports":
        return <ReportsView venueId={venueId || ""} />;
      case "users":
        return <UsersView venueId={venueId || ""} />;
      case "reservations":
        return (
          <ReservationsView
            venueId={venueId || ""}
            onNavigateToTable={(table) => {
              setSelectedTable(table);
              handleNavigate("pos");
            }}
          />
        );
      default:
        return (
          <ModulePlaceholder
            moduleId={currentView}
            onBack={() => handleNavigate("home")}
          />
        );
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 transition-colors">
      {/* Capa de fondo decorativa con textura sutil */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 bg-subtle-grid"
      />

      <Toaster />

      {/* Header fijo */}
      <TopBar
        currentView={currentView}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Contenedor interactivo principal */}
      <main className="relative z-10 flex-1 overflow-auto flex flex-col">
        {!currentUser ? (
          <div className="min-h-[calc(100vh-48px)] flex flex-col items-center justify-center p-6 text-center text-muted-foreground animate-in fade-in duration-200">
            <div className="w-16 h-16 rounded-2xl bg-card/80 backdrop-blur-xs border border-border flex items-center justify-center text-primary mb-4 shadow-xl">
              <span className="text-2xl">🔒</span>
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Terminal Bloqueada
            </h2>
            <p className="text-xs text-muted-foreground max-w-sm">
              Inicia sesión con tu PIN u opción de correo para acceder a los
              módulos operativos.
            </p>
          </div>
        ) : (
          <Suspense fallback={<ViewLoadingFallback />}>
            {renderCurrentView()}
          </Suspense>
        )}
      </main>

      {/* Pantalla Bloqueante de Terminal / PIN */}
      {isLocked && <LockScreen />}
    </div>
  );
};
