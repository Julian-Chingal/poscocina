import React from "react";
import { AppItem } from "../types/launcher.types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface AppTileProps {
  app: AppItem;
  onSelect: (id: string) => void;
  className?: string;
  index?: number;
}

const getIconAnimation = (appId: string) => {
  switch (appId) {
    case 'salon':
      return 'group-hover:animate-icon-pulse';
    case 'reservations':
      return 'group-hover:animate-icon-bounce';
    case 'pos':
      return 'group-hover:animate-icon-bounce';
    case 'kds':
      return 'group-hover:animate-icon-wobble';
    case 'catalog':
      return 'group-hover:animate-icon-tilt';
    case 'inventory':
      return 'group-hover:animate-icon-bounce';
    case 'shifts':
      return 'group-hover:animate-icon-bounce';
    case 'reports':
      return 'group-hover:animate-icon-pulse';
    case 'users':
      return 'group-hover:animate-icon-wobble';
    case 'settings':
      return 'group-hover:rotate-180 group-hover:scale-115 transition-transform duration-700 ease-out';
    default:
      return 'group-hover:scale-115 transition-transform duration-200';
  }
};

export const AppTile: React.FC<AppTileProps> = ({
  app,
  onSelect,
  className,
  index = 0,
}) => {
  const Icon = app.icon;
  const [imageError, setImageError] = React.useState(false);

  return (
    <button
      type="button"
      onClick={() => onSelect(app.id)}
      style={{ animationDelay: `${index * 40}ms` }}
      className={cn(
        "group relative flex w-full flex-col items-center justify-between rounded-2xl border border-border/80 bg-card p-5 text-center shadow-xs transition-all duration-200 animate-in fade-in-0 slide-in-from-bottom-3 fill-mode-backwards",
        "hover:-translate-y-1 hover:border-primary/50 hover:shadow-xl hover:shadow-primary/5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 cursor-pointer select-none active:scale-[0.97]",
        className,
      )}
      aria-label={`${app.name}: ${app.subtitle}`}
    >
      {/* Badge condicional */}
      {app.badge && (
        <Badge
          variant="outline"
          className={cn(
            "absolute top-3 right-3 text-[10px] font-semibold tracking-wide",
            app.badgeColor || "bg-muted text-muted-foreground border-border",
          )}
        >
          {app.badge}
        </Badge>
      )}

      {/* Contenedor del icono con halo animado y tamaño responsivo */}
      <div className="relative mb-3.5 flex items-center justify-center">
        {/* Halo luminoso difuminado al hacer hover */}
        <div
          className={cn(
            "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-0 blur-lg transition-all duration-300 group-hover:opacity-50 group-hover:scale-125 -z-10",
            app.gradient,
          )}
          aria-hidden="true"
        />

        {/* Contenedor principal con elevación */}
        <div
          className={cn(
            "relative flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-2xl transition-all duration-300",
            "bg-gradient-to-b from-card to-muted/40 border border-border/60 shadow-xs",
            "group-hover:scale-105 group-hover:shadow-md group-hover:border-primary/20",
          )}
        >
          {/* Tinte ambiental sutil del gradiente corporativo del módulo */}
          <div
            className={cn(
              "absolute inset-0 rounded-2xl bg-gradient-to-br opacity-10 dark:opacity-20 transition-opacity duration-300 group-hover:opacity-20 dark:group-hover:opacity-30",
              app.gradient,
            )}
            aria-hidden="true"
          />

          {app.icon3d && !imageError ? (
            <img
              src={app.icon3d}
              alt=""
              width={72}
              height={72}
              loading="lazy"
              decoding="async"
              onError={() => setImageError(true)}
              className="relative z-10 h-12 w-12 sm:h-14 sm:w-14 object-contain filter drop-shadow-md transition-all duration-300 ease-out group-hover:scale-115 group-hover:-translate-y-1 group-hover:drop-shadow-xl pointer-events-none select-none"
            />
          ) : (
            <div
              className={cn(
                "flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md",
                app.gradient,
              )}
            >
              <Icon
                className={cn(
                  "h-7 w-7 sm:h-8 sm:w-8 drop-shadow-sm shrink-0 transition-transform duration-200",
                  getIconAnimation(app.id),
                )}
                strokeWidth={2}
                aria-hidden="true"
              />
            </div>
          )}
        </div>
      </div>

      {/* Textos semánticos */}
      <div className="flex flex-col items-center w-full">
        <span className="text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
          {app.name}
        </span>
        <span className="mt-1 line-clamp-1 w-full text-xs text-muted-foreground font-normal">
          {app.subtitle}
        </span>
      </div>
    </button>
  );
};
