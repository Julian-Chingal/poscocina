import React from 'react';
import { AppItem } from '../types/launcher.types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface AppTileProps {
  app: AppItem;
  onSelect: (id: string) => void;
}

export const AppTile: React.FC<AppTileProps> = ({ app, onSelect }) => {
  const Icon = app.icon;

  return (
    <Button
      variant="ghost"
      type="button"
      onClick={() => onSelect(app.id)}
      className="group flex flex-col items-center text-center p-5 h-auto rounded-2xl bg-card hover:bg-muted/80 border border-border hover:border-primary/40 transition-all duration-200 hover:-translate-y-1.5 hover:shadow-lg shadow-xs cursor-pointer relative whitespace-normal"
    >
      {app.badge && (
        <Badge
          variant="outline"
          className={`absolute top-2.5 right-2.5 text-[10px] font-semibold ${
            app.badgeColor || 'bg-muted text-muted-foreground border-border'
          }`}
        >
          {app.badge}
        </Badge>
      )}

      <div
        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${app.gradient} flex items-center justify-center text-white shadow-md group-hover:scale-105 group-hover:shadow-lg transition-all mb-3.5`}
      >
        <Icon className="w-8 h-8 drop-shadow" />
      </div>

      <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
        {app.name}
      </span>
      <span className="text-[11px] text-muted-foreground mt-1 line-clamp-1 font-normal">
        {app.subtitle}
      </span>
    </Button>
  );
};
