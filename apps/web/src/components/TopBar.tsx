import React, { useState, useEffect } from "react";
import { Lock, Maximize2, Minimize2 } from "lucide-react";
import { useAuthStore } from "../stores/auth.store";
import { BrandLink } from "./navigation/BrandLink";
import { VenueSelector } from "./navigation/VenueSelector";
import { ShiftStatusBadge } from "./navigation/ShiftStatusBadge";
import { UserNav } from "./navigation/UserNav";
import { TopBarSearch } from "./navigation/TopBarSearch";
import { ThemeToggle } from "./navigation/ThemeToggle";
import { Button } from "./ui/button";

interface TopBarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

const VIEW_TITLES: Record<string, string> = {
  home: "Aplicaciones",
  salon: "Salón y Mesas (F1)",
  reservations: "Reservas de Mesas",
  pos: "Punto de Venta (F2)",
  kds: "Cocina KDS (F3)",
  catalog: "Menú y Catálogo",
  inventory: "Inventario y Recetas",
  shifts: "Caja y Turnos (F4)",
  reports: "Reportes y Métricas",
  users: "Gestión de Empleados & Roles",
  settings: "Ajustes y Personalización de Empresa",
};

export const TopBar: React.FC<TopBarProps> = ({
  currentView,
  onNavigate,
  searchQuery,
  onSearchChange,
}) => {
  // Atomic Zustand subscriptions
  const hasCurrentUser = useAuthStore((s) => Boolean(s.currentUser));
  const lockScreen = useAuthStore((s) => s.lockScreen);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const isHome = currentView === "home";

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.warn("Error attempting to enable fullscreen:", err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.warn("Error attempting to exit fullscreen:", err);
      });
    }
  };

  return (
    <header className="h-12 bg-card/90 backdrop-blur-md border-b border-border flex justify-between md:grid md:grid-cols-[1fr_minmax(0,28rem)_1fr] items-center px-3 sm:px-4 text-foreground select-none shadow-xs z-30 sticky top-0 gap-3 transition-colors w-full min-w-0">
      {/* Left section: Brand & Venue */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 justify-start overflow-hidden">
        <BrandLink isHome={isHome} onNavigate={onNavigate} />
        <VenueSelector onNavigateSettings={() => onNavigate("settings")} />

        {!isHome && (
          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground border-l border-border pl-3 min-w-0">
            <button
              type="button"
              onClick={() => onNavigate("home")}
              title="Volver a Aplicaciones"
              aria-label="Volver a Aplicaciones"
              className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary rounded-sm py-0.5 px-1 shrink-0"
            >
              Apps
            </button>
            <span className="text-muted-foreground/60 shrink-0" aria-hidden="true">/</span>
            <span className="font-semibold text-foreground truncate max-w-[160px] xl:max-w-[240px]">
              {VIEW_TITLES[currentView] || currentView}
            </span>
          </div>
        )}
      </div>

      {/* Center section: Quick Search with Debouncing & Transition */}
      <div className="hidden md:flex items-center justify-center min-w-0 w-full">
        <TopBarSearch
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          isHome={isHome}
          onNavigateHome={() => onNavigate("home")}
          className="w-full max-w-md"
        />
      </div>

      {/* Right section: System Badges, Controls & User Profile */}
      <div className="flex items-center justify-end gap-1 sm:gap-1.5 shrink-0">
        <ShiftStatusBadge onNavigateShifts={() => onNavigate("shifts")} />

        <ThemeToggle />

        <Button
          variant="ghost"
          size="icon"
          onClick={toggleFullscreen}
          title={
            isFullscreen
              ? "Salir de Pantalla Completa"
              : "Modo Quiosco Pantalla Completa"
          }
          aria-label={
            isFullscreen
              ? "Salir de Pantalla Completa"
              : "Modo Quiosco Pantalla Completa"
          }
          className="hidden sm:inline-flex size-8 text-muted-foreground hover:text-foreground cursor-pointer shrink-0"
        >
          {isFullscreen ? (
            <Minimize2 className="size-4 shrink-0" strokeWidth={2} />
          ) : (
            <Maximize2 className="size-4 shrink-0" strokeWidth={2} />
          )}
        </Button>

        {hasCurrentUser && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => lockScreen()}
            title="Bloquear terminal (Ctrl+L)"
            aria-label="Bloquear terminal (Ctrl+L)"
            className="size-8 text-muted-foreground hover:text-amber-500 hover:bg-muted cursor-pointer shrink-0"
          >
            <Lock className="size-3.5 shrink-0" strokeWidth={2} />
          </Button>
        )}

        <UserNav onNavigateSettings={() => onNavigate("settings")} />
      </div>
    </header>
  );
};
