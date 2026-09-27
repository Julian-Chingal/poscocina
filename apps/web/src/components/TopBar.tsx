import React, { useState, useEffect } from "react";
import { Lock, Maximize2, Minimize2 } from "lucide-react";
import { useAuthStore } from "../stores/auth.store";
import { BrandLink } from "./navigation/BrandLink";
import { VenueSelector } from "./navigation/VenueSelector";
import { ShiftStatusBadge } from "./navigation/ShiftStatusBadge";
import { UserNav } from "./navigation/UserNav";
import { TopBarSearch } from "./navigation/TopBarSearch";
import { ThemeToggle } from "./navigation/ThemeToggle";
import { BreadcrumbNav } from "./navigation/BreadcrumbNav";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

interface TopBarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  onBack: () => void;
  canGoBack?: boolean;
  previousViewTitle?: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  currentView,
  onNavigate,
  onBack,
  canGoBack = true,
  previousViewTitle,
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
    <header className="h-14 bg-card/90 backdrop-blur-xl border-b border-border/80 flex items-center justify-between px-2.5 sm:px-4 text-foreground select-none shadow-2xs z-30 sticky top-0 gap-2 sm:gap-3 transition-colors w-full min-w-0">
      {/* Left section: Brand, Venue & Breadcrumb Navigation with Back button */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 justify-start overflow-hidden flex-1 sm:flex-initial">
        <BrandLink isHome={isHome} onNavigate={onNavigate} />
        <VenueSelector onNavigateSettings={() => onNavigate("settings")} />

        {!isHome && (
          <BreadcrumbNav
            currentView={currentView}
            onNavigate={onNavigate}
            onBack={onBack}
            canGoBack={canGoBack}
            previousViewTitle={previousViewTitle}
          />
        )}
      </div>

      {/* Center section: Quick Search with Debouncing & Transition */}
      <div
        className={cn(
          "items-center justify-center min-w-0 flex-1 max-w-xs xl:max-w-md mx-2",
          isHome ? "hidden sm:flex" : "hidden lg:flex"
        )}
      >
        <TopBarSearch
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          isHome={isHome}
          onNavigateHome={() => onNavigate("home")}
          className="w-full"
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
