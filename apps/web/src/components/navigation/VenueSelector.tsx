import React, { useState, useEffect, useRef } from "react";
import { Store, ChevronDown, Check, Plus } from "lucide-react";
import { useAuthStore } from "../../stores/auth.store";
import { useBrandingStore, VenueItem } from "../../stores/branding.store";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { toast } from "../ui/sonner";
import { cn } from "../../lib/utils";

interface VenueSelectorProps {
  onNavigateSettings?: () => void;
  className?: string;
}

export const VenueSelector: React.FC<VenueSelectorProps> = ({
  onNavigateSettings,
  className,
}) => {
  const { currentUser, venueId, setVenueId } = useAuthStore();
  const {
    venues,
    loadAllVenues,
    switchVenue,
    name: fallbackCompanyName,
  } = useBrandingStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load venues on mount
  useEffect(() => {
    loadAllVenues();
  }, [loadAllVenues]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const currentVenue: VenueItem = venues.find((v) => v.id === venueId) || {
    id: venueId || "default",
    name: fallbackCompanyName || "Sede Principal",
    slug: "default",
  };

  const handleSelectVenue = (venue: VenueItem) => {
    if (venue.id === currentVenue.id) {
      setIsOpen(false);
      return;
    }
    setVenueId(venue.id);
    switchVenue(venue.id);
    setIsOpen(false);
    toast.success(`Cambiaste a la sede: ${venue.name}`, {
      description:
        "Los catálogos, mesas y pedidos se han sincronizado con esta sede.",
    });
  };

  const getVenueInitial = (venueName: string) => {
    return venueName ? venueName.trim().charAt(0).toUpperCase() : "S";
  };

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      {/* Selector Trigger Button */}
      <Button
        variant="ghost"
        onClick={() => setIsOpen((prev) => !prev)}
        title="Cambiar de Sede / Sucursal"
        className={cn(
          "h-auto flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs transition cursor-pointer select-none",
          "bg-muted/80 hover:bg-muted border border-border text-foreground hover:text-foreground shadow-2xs",
          "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
          isOpen && "bg-muted border-primary/50 text-foreground",
        )}
      >
        {/* Active Venue Logo / Avatar */}
        <Avatar size="sm" className="size-5 border border-border">
          {currentVenue.settings?.logoUrl && (
            <AvatarImage
              src={currentVenue.settings.logoUrl}
              alt={currentVenue.name}
            />
          )}
          <AvatarFallback className="bg-primary/20 text-primary font-bold text-[10px]">
            {getVenueInitial(currentVenue.name)}
          </AvatarFallback>
        </Avatar>

        {/* Venue Name */}
        <span className="font-medium max-w-32.5 truncate text-left">
          {currentVenue.name}
        </span>

        <ChevronDown
          className={cn(
            "size-3.5 text-muted-foreground transition-transform duration-200",
            isOpen && "rotate-180 text-primary",
          )}
        />
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-1.5 w-64 bg-popover text-popover-foreground border border-border rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-3 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border mb-1 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Store className="size-3 text-primary" />
              <span>Sucursales Activas</span>
            </span>
            <span className="text-primary font-bold text-xs bg-primary/10 px-1.5 py-0.2 rounded border border-primary/20">
              {venues.length}
            </span>
          </div>

          {venues.length === 0 ? (
            <div className="px-3 py-2 text-xs text-muted-foreground">
              Cargando sedes...
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto divide-y divide-border">
              {venues.map((v) => {
                const isSelected = v.id === currentVenue.id;
                return (
                  <Button
                    key={v.id}
                    variant="ghost"
                    onClick={() => handleSelectVenue(v)}
                    className={cn(
                      "w-full h-auto px-3 py-2 text-left text-xs flex items-center justify-between gap-2 transition cursor-pointer select-none rounded-none",
                      isSelected
                        ? "bg-primary/10 text-primary font-semibold hover:bg-primary/20"
                        : "text-foreground hover:bg-muted hover:text-foreground",
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {/* Venue Avatar / Logo */}
                      <Avatar
                        size="sm"
                        className={cn(
                          "size-6 shrink-0 border",
                          isSelected ? "border-primary/50" : "border-border",
                        )}
                      >
                        {v.settings?.logoUrl && (
                          <AvatarImage src={v.settings.logoUrl} alt={v.name} />
                        )}
                        <AvatarFallback
                          className={cn(
                            "text-[10px] font-bold",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {getVenueInitial(v.name)}
                        </AvatarFallback>
                      </Avatar>

                      {/* Venue Info */}
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium">{v.name}</div>
                        {v.address && (
                          <div className="text-[10px] text-muted-foreground truncate">
                            {v.address}
                          </div>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className="size-4 text-primary shrink-0" />
                    )}
                  </Button>
                );
              })}
            </div>
          )}

          {/* Super Admin Shortcut to manage venues */}
          {currentUser?.roleName === "super_admin" && onNavigateSettings && (
            <div className="border-t border-border mt-1 pt-1 px-1">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsOpen(false);
                  onNavigateSettings();
                }}
                className="w-full h-auto px-2.5 py-1.5 text-left text-[11px] text-primary hover:bg-muted rounded-lg flex items-center justify-start gap-1.5 cursor-pointer font-medium transition-colors"
              >
                <Plus className="size-3.5" />
                <span>Gestionar / Configurar Sedes</span>
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
