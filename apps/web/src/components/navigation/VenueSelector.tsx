import React, { useEffect } from "react";
import { Store, ChevronDown, Check, Plus } from "lucide-react";
import { useAuthStore } from "../../stores/auth.store";
import { useBrandingStore, VenueItem } from "../../stores/branding.store";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
  DropdownMenuGroup,
} from "../ui/dropdown-menu";
import { toast } from "../ui/sonner";
import { cn } from "@/lib/utils";

interface VenueSelectorProps {
  onNavigateSettings?: () => void;
  className?: string;
}

export const VenueSelector: React.FC<VenueSelectorProps> = ({
  onNavigateSettings,
  className,
}) => {
  // Atomic Zustand selectors to prevent unnecessary re-renders
  const currentUser = useAuthStore((s) => s.currentUser);
  const venueId = useAuthStore((s) => s.venueId);
  const setVenueId = useAuthStore((s) => s.setVenueId);

  const venues = useBrandingStore((s) => s.venues);
  const loadAllVenues = useBrandingStore((s) => s.loadAllVenues);
  const switchVenue = useBrandingStore((s) => s.switchVenue);
  const fallbackCompanyName = useBrandingStore((s) => s.name);

  // Load venues on mount
  useEffect(() => {
    loadAllVenues();
  }, [loadAllVenues]);

  const currentVenue: VenueItem = venues.find((v) => v.id === venueId) || {
    id: venueId || "default",
    name: fallbackCompanyName || "Sede Principal",
    slug: "default",
  };

  const handleSelectVenue = (venue: VenueItem) => {
    if (venue.id === currentVenue.id) return;

    setVenueId(venue.id);
    switchVenue(venue.id);
    toast.success(`Cambiaste a la sede: ${venue.name}`, {
      description:
        "Los catálogos, mesas y pedidos se han sincronizado con esta sede.",
    });
  };

  const getVenueInitial = (venueName: string) => {
    return venueName ? venueName.trim().charAt(0).toUpperCase() : "S";
  };

  const isSuperAdmin = currentUser?.roleName === 'super_admin';

  if (!isSuperAdmin) {
    return (
      <div
        title={`Sede asignada: ${currentVenue.name}`}
        className={cn(
          "h-8 flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs select-none min-w-[100px] max-w-[170px]",
          "bg-muted/60 border border-border/80 text-foreground shadow-2xs",
          className
        )}
      >
        <Avatar size="sm" className="size-5 border border-border shrink-0">
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
        <span className="font-medium truncate text-left min-w-0 flex-1">
          {currentVenue.name}
        </span>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title="Cambiar de Sede / Sucursal"
          aria-label={`Sede actual: ${currentVenue.name}. Clic para cambiar de sede.`}
          className={cn(
            "group h-8 flex items-center gap-2 px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer select-none min-w-[100px] max-w-[170px]",
            "bg-muted/80 hover:bg-muted border border-border text-foreground hover:text-foreground shadow-2xs",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            "data-[state=open]:bg-muted data-[state=open]:border-primary/50",
            className,
          )}
        >
          {/* Active Venue Logo / Avatar */}
          <Avatar size="sm" className="size-5 border border-border shrink-0">
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
          <span className="font-medium truncate text-left min-w-0 flex-1">
            {currentVenue.name}
          </span>

          <ChevronDown
            className="size-3.5 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180 group-data-[state=open]:text-primary shrink-0"
            strokeWidth={2}
            aria-hidden="true"
          />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        sideOffset={6}
        className="w-68 bg-popover text-popover-foreground border border-border rounded-xl shadow-2xl p-1 z-50 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header Summary */}
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-border flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Store className="size-3 text-primary shrink-0" strokeWidth={2} />
              <span>Sucursales Activas</span>
            </span>
            <span className="text-primary font-bold text-xs bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20">
              {venues.length}
            </span>
          </div>
        </DropdownMenuLabel>

        {/* Venues List */}
        {venues.length === 0 ? (
          <div className="px-3 py-3 text-xs text-muted-foreground text-center">
            Cargando sedes...
          </div>
        ) : (
          <DropdownMenuGroup className="max-h-60 overflow-y-auto py-1">
            {venues.map((v) => {
              const isSelected = v.id === currentVenue.id;
              return (
                <DropdownMenuItem
                  key={v.id}
                  onSelect={() => handleSelectVenue(v)}
                  className={cn(
                    "cursor-pointer justify-between gap-2 p-2 rounded-lg text-xs transition-colors my-0.5",
                    isSelected
                      ? "bg-primary/10 text-primary font-semibold focus:bg-primary/15 focus:text-primary"
                      : "text-foreground focus:bg-muted focus:text-foreground",
                  )}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
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
                    <div className="min-w-0 flex-1 text-left">
                      <div className="truncate font-medium leading-tight">
                        {v.name}
                      </div>
                      {v.address && (
                        <div className="text-[10px] text-muted-foreground truncate leading-tight mt-0.5">
                          {v.address}
                        </div>
                      )}
                    </div>
                  </div>

                  {isSelected && (
                    <Check
                      className="size-4 text-primary shrink-0 ml-1"
                      strokeWidth={2}
                      aria-hidden="true"
                    />
                  )}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuGroup>
        )}

        {/* Super Admin Shortcut to manage venues */}
        {currentUser?.roleName === "super_admin" && onNavigateSettings && (
          <>
            <DropdownMenuSeparator className="my-1 bg-border" />
            <DropdownMenuItem
              onSelect={onNavigateSettings}
              className="cursor-pointer gap-1.5 p-2 rounded-lg text-primary focus:bg-primary/10 focus:text-primary text-[11px] font-medium"
            >
              <Plus className="size-3.5 shrink-0" strokeWidth={2} />
              <span>Gestionar / Configurar Sedes</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
