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
                ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20 hover:bg-orange-500'
                : 'bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700/60'
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
