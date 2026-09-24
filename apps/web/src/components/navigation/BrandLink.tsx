import React from "react";
import { LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <button
      type="button"
      onClick={() => onNavigate("home")}
      title="Ir al Menú Principal de Aplicaciones [Esc]"
      aria-label="Ir al Menú Principal de Aplicaciones [Esc]"
      className={cn(
        "h-auto group flex items-center gap-2.5 px-2 py-1 rounded-xl transition-all cursor-pointer select-none text-left",
        "border border-transparent hover:border-border hover:bg-muted/70",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
        isHome && "bg-muted/80 border-border shadow-2xs",
        className,
      )}
    >
      {/* Brand Icon Badge */}
      <div className="relative shrink-0 flex items-center justify-center">
        <div className="size-7 rounded-lg overflow-hidden flex items-center justify-center shadow-xs transition-transform group-hover:scale-105 bg-background border border-border">
          <img
            src="/logo.png" // Cambia "logo.png" por el nombre exacto de tu archivo en public/
            alt="Logo PosCocina"
            className="size-full object-contain p-0.5"
          />
        </div>
        <span
          className="absolute -bottom-0.5 -right-0.5 size-2 bg-emerald-500 rounded-full ring-2 ring-background animate-pulse"
          aria-hidden="true"
        />
      </div>

      {/* Brand Name & Action caption */}
      <div className="flex flex-col min-w-0">
        <span className="font-bold text-xs sm:text-sm text-foreground tracking-tight truncate leading-tight group-hover:text-primary transition-colors">
          PosCocina
        </span>
        <span className="text-[10px] text-muted-foreground font-medium leading-none flex items-center gap-1 mt-0.5">
          <LayoutGrid
            className="size-2.5 shrink-0 text-muted-foreground/80 group-hover:text-primary transition-colors"
            strokeWidth={2}
            aria-hidden="true"
          />
          <span className="truncate group-hover:text-primary transition-colors">
            Inicio / Apps
          </span>
        </span>
      </div>
    </button>
  );
};
