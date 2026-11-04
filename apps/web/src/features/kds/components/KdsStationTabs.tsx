import React, { useEffect, useState } from 'react';
import {
  Layers,
  History,
  ChefHat,
  Flame,
  Wine,
  Coffee,
  Cake,
  Utensils,
  Pizza,
  Beer,
} from 'lucide-react';
import { api } from '@/services/api';
import { StationFilter } from '../types/kds.types';

interface DynamicStation {
  id: string;
  name: string;
  code: string;
  color?: string;
  icon?: string;
}

interface TabItem {
  id: string;
  label: string;
  icon: React.ElementType;
  color?: string;
  code?: string;
}

interface KdsStationTabsProps {
  activeStation: StationFilter;
  onSelectStation: (station: StationFilter) => void;
  stationCounts?: Record<string, number>;
}

const ICON_MAP: Record<string, React.ElementType> = {
  ChefHat,
  Flame,
  Wine,
  Coffee,
  Cake,
  Utensils,
  Pizza,
  Beer,
  Layers,
};

export const KdsStationTabs: React.FC<KdsStationTabsProps> = ({
  activeStation,
  onSelectStation,
  stationCounts = {},
}) => {
  const [dynamicStations, setDynamicStations] = useState<DynamicStation[]>([]);

  useEffect(() => {
    api
      .get<DynamicStation[]>('/api/stations')
      .then((res) => {
        setDynamicStations(res || []);
      })
      .catch(() => {});
  }, []);

  const allTabs: TabItem[] = [
    { id: 'all', label: 'Todas las Estaciones', icon: Layers },
    ...dynamicStations.map((st) => ({
      id: st.id,
      label: st.name,
      icon: (st.icon && ICON_MAP[st.icon]) || ChefHat,
      color: st.color,
      code: st.code,
    })),
    { id: 'history', label: 'Historial', icon: History },
  ];

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 p-1 bg-muted/40 rounded-2xl border border-border/60 w-fit max-w-full">
      {allTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeStation === tab.id || (Boolean(tab.code) && activeStation === tab.code);
        const count = stationCounts[tab.id] ?? (tab.code ? stationCounts[tab.code] : undefined);

        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectStation(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer whitespace-nowrap ${
              isActive
                ? 'bg-background text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            {tab.color ? (
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: tab.color }}
              />
            ) : null}
            <Icon className="w-4 h-4 shrink-0" />
            <span>{tab.label}</span>
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
export default KdsStationTabs;
