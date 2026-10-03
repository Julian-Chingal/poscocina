import React from 'react';
import { STATIONS } from '../constants/kds.constants';
import { StationFilter } from '../types/kds.types';

interface KdsStationTabsProps {
  activeStation: StationFilter;
  onSelectStation: (station: StationFilter) => void;
  stationCounts?: Record<StationFilter, number>;
}

export const KdsStationTabs: React.FC<KdsStationTabsProps> = ({
  activeStation,
  onSelectStation,
  stationCounts = { all: 0, kitchen: 0, bar: 0, dessert: 0, history: 0 },
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 p-1 bg-muted/40 rounded-2xl border border-border/60 w-fit max-w-full">
      {STATIONS.map((station) => {
        const Icon = station.icon;
        const isActive = activeStation === station.id;
        const count = stationCounts[station.id];

        return (
          <button
            key={station.id}
            type="button"
            onClick={() => onSelectStation(station.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
              isActive
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{station.label}</span>
            {count !== undefined && count > 0 && (
              <span
                className={`text-[10px] font-black px-1.5 py-0.2 rounded-full font-mono ${
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

