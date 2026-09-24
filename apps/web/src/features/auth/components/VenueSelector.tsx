import React from 'react';
import { Store, Star } from 'lucide-react';
import { PublicVenueItem } from '@/stores/auth.store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface VenueSelectorProps {
  venues: PublicVenueItem[];
  selectedVenueId: string | null;
  onVenueChange: (venueId: string) => void;
  disabled?: boolean;
}

export const VenueSelector: React.FC<VenueSelectorProps> = ({
  venues,
  selectedVenueId,
  onVenueChange,
  disabled = false,
}) => {
  if (venues.length === 0) {
    return null;
  }

  // Si solo hay una sede, mostrar un indicador visual compacto
  if (venues.length === 1) {
    const venue = venues[0];
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/80 text-xs text-muted-foreground">
        <Store className="w-3.5 h-3.5 text-primary shrink-0" />
        <span className="font-semibold text-foreground truncate max-w-[140px] sm:max-w-[180px]">
          {venue.name}
        </span>
        {venue.isPrimary && (
          <Badge variant="outline" className="text-[9px] py-0 px-1.5 h-4 gap-0.5 border-primary/40 bg-primary/10 text-primary font-semibold">
            <Star className="w-2.5 h-2.5 fill-primary" />
            Principal
          </Badge>
        )}
      </div>
    );
  }

  const currentVenue = venues.find((v) => v.id === selectedVenueId) || venues[0];

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedVenueId || currentVenue.id}
        onValueChange={(val) => {
          if (val) onVenueChange(val);
        }}
        disabled={disabled}
      >
        <SelectTrigger className="h-9 min-w-[180px] max-w-[240px] bg-card/80 border-border text-xs rounded-xl focus:ring-1 focus:ring-primary shadow-xs">
          <div className="flex items-center gap-2 truncate">
            <Store className="w-3.5 h-3.5 text-primary shrink-0" />
            <SelectValue placeholder="Seleccionar sede" />
          </div>
        </SelectTrigger>
        <SelectContent className="rounded-xl border-border bg-popover text-xs shadow-xl z-[250]">
          {venues.map((v) => (
            <SelectItem
              key={v.id}
              value={v.id}
              className="cursor-pointer py-2 px-3 rounded-lg focus:bg-primary/15"
            >
              <div className="flex items-center justify-between w-full gap-2">
                <span className="font-medium text-foreground truncate">{v.name}</span>
                {v.isPrimary && (
                  <Badge
                    variant="outline"
                    className="text-[9px] py-0 px-1.5 h-4 gap-0.5 border-primary/40 bg-primary/10 text-primary shrink-0 font-semibold"
                  >
                    <Star className="w-2.5 h-2.5 fill-primary" />
                    Principal
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
