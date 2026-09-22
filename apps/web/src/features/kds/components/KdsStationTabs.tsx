import React from 'react';
import { STATIONS } from '../constants/kds.constants';
import { StationFilter } from '../types/kds.types';
import { Button } from '@/components/ui/button';

interface KdsStationTabsProps {
  activeStation: StationFilter;
  onSelectStation: (station: StationFilter) => void;
}

export const KdsStationTabs: React.FC<KdsStationTabsProps> = ({
  activeStation,
  onSelectStation,
}) => {
  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-1">
      {STATIONS.map((station) => {
        const Icon = station.icon;
        const isActive = activeStation === station.id;
        return (
          <Button
            key={station.id}
            variant={isActive ? 'default' : 'secondary'}
            onClick={() => onSelectStation(station.id)}
            className={`flex items-center space-x-2 px-4 py-2.5 h-auto rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
              isActive
                ? 'bg-primary text-primary-foreground shadow-md hover:bg-primary/90'
                : 'bg-card hover:bg-muted text-muted-foreground hover:text-foreground border border-border'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{station.label}</span>
          </Button>
        );
      })}
    </div>
  );
};
