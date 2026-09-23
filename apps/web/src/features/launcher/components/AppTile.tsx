import React from "react";
import { AppItem } from "../types/launcher.types";
import { Badge } from "@/components/ui/badge";

interface AppTileProps {
  app: AppItem;
  onSelect: (id: string) => void;
}

export const AppTile: React.FC<AppTileProps> = ({ app, onSelect }) => {
  const Icon = app.icon;

  return (
    <button
      type="button"
      onClick={() => onSelect(app.id)}
      className="group relative flex w-full flex-col items-center justify-between rounded-2xl border border-border bg-card p-5 text-center shadow-xs transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:bg-muted/50 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring cursor-pointer"
    >
      {/* Badge condicional */}
      {app.badge && (
        <Badge
          variant="outline"
          className={`absolute top-3 right-3 text-[10px] font-semibold tracking-wide ${
            app.badgeColor || "bg-muted text-muted-foreground border-border"
          }`}
        >
          {app.badge}
        </Badge>
      )}

      {/* Contenedor del icono con tamaño responsivo explícito */}
      <div
        className={`mb-3.5 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-linear-to-br ${app.gradient} text-white shadow-md transition-transform duration-200 group-hover:scale-105 group-hover:shadow-lg`}
      >
        {/* Tamaño explícito del icono con stroke responsivo */}
        <Icon
          className="h-7 w-7 sm:h-8 sm:w-8 drop-shadow-sm"
          strokeWidth={2}
        />
      </div>

      {/* Textos */}
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
