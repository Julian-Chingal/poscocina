import React from "react";
import { UtensilsCrossed, LayoutGrid } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "../ui/button";

interface BrandLinkProps {
  isHome: boolean;
  onNavigate: (view: string) => void;
  className?: string;
}

export const BrandLink: React.FC<BrandLinkProps> = ({
  isHome,
  onNavigate,
  className,
}) => {
  return (
    <Button
      variant="ghost"
      onClick={() => onNavigate("home")}
      title="Ir al Menú Principal de Aplicaciones [Esc]"
      className={cn(
        "h-auto group flex items-center gap-2.5 px-2 py-1 rounded-xl transition-all cursor-pointer select-none text-left",
        "border border-transparent hover:border-border hover:bg-muted/70",
        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary",
        isHome && "bg-muted/80 border-border shadow-2xs",
        className,
      )}
    >
      {/* Brand Icon or Logo */}
      <div className="relative shrink-0 flex items-center justify-center">
        <div className="size-7 rounded-lg flex items-center justify-center text-xs font-bold text-primary-foreground shadow-xs transition-transform group-hover:scale-105 bg-primary">
          <UtensilsCrossed className="size-4" />
        </div>
        <span className="absolute -bottom-0.5 -right-0.5 size-2 bg-success rounded-full ring-2 ring-background animate-pulse" />
      </div>

      {/* Brand Name & Action caption */}
      <div className="flex flex-col min-w-0">
        <span className="font-bold text-xs sm:text-sm text-foreground tracking-tight truncate leading-tight group-hover:text-primary transition-colors">
          PosCocina
        </span>
        <span className="text-[10px] text-muted-foreground font-medium leading-none flex items-center gap-1 mt-0.5">
          <LayoutGrid className="size-2.5 text-muted-foreground/80 group-hover:text-primary transition-colors" />
          <span className="truncate group-hover:text-primary transition-colors">
            Inicio / Apps
          </span>
        </span>
      </div>
    </Button>
  );
};
