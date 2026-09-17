import React from 'react';
import { AppItem } from '../types/launcher.types';

interface AppTileProps {
  app: AppItem;
  onSelect: (id: string) => void;
}

export const AppTile: React.FC<AppTileProps> = ({ app, onSelect }) => {
  const Icon = app.icon;

  return (
    <button
      onClick={() => onSelect(app.id)}
      className="group flex flex-col items-center text-center p-5 rounded-2xl bg-slate-800/40 hover:bg-slate-800 border border-slate-700/40 hover:border-slate-600 transition-all duration-200 hover:-translate-y-1.5 hover:shadow-2xl cursor-pointer relative"
    >
      {app.badge && (
        <span
          className={`absolute top-2.5 right-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
            app.badgeColor || 'bg-slate-700 text-slate-300'
          }`}
        >
          {app.badge}
        </span>
      )}

      <div
        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${app.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-105 group-hover:shadow-xl transition-all mb-3.5`}
      >
        <Icon className="w-8 h-8 drop-shadow" />
      </div>

      <span className="font-bold text-sm text-slate-100 group-hover:text-white transition-colors">
        {app.name}
      </span>
      <span className="text-[11px] text-slate-400 mt-1 line-clamp-1">
        {app.subtitle}
      </span>
    </button>
  );
};
