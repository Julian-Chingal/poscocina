import React from 'react';
import { Plus } from 'lucide-react';
import { FloorPlanItem, TableItem } from '../types/salon.types';

interface Props {
  floorPlans: FloorPlanItem[];
  tables: TableItem[];
  activeFloorPlanId: string;
  isEditMode: boolean;
  onSelectFloorPlan: (id: string) => void;
  onOpenNewFloorPlan: () => void;
}

export const FloorPlansBar: React.FC<Props> = ({
  floorPlans,
  tables,
  activeFloorPlanId,
  isEditMode,
  onSelectFloorPlan,
  onOpenNewFloorPlan,
}) => {
  if (floorPlans.length === 0) return null;

  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-6">
      <button
        type="button"
        onClick={() => onSelectFloorPlan('all')}
        className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
          activeFloorPlanId === 'all'
            ? 'bg-emerald-600 text-white shadow'
            : 'bg-slate-800/80 text-slate-400 hover:text-white'
        }`}
      >
        Todas las zonas ({tables.length})
      </button>

      {floorPlans.map((plan) => (
        <button
          key={plan.id}
          type="button"
          onClick={() => onSelectFloorPlan(plan.id)}
          className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
            activeFloorPlanId === plan.id
              ? 'bg-emerald-600 text-white shadow'
              : 'bg-slate-800/80 text-slate-400 hover:text-white'
          }`}
        >
          {plan.name} ({tables.filter((t) => t.floorPlanId === plan.id).length})
        </button>
      ))}

      {isEditMode && (
        <button
          type="button"
          onClick={onOpenNewFloorPlan}
          className="flex items-center space-x-1 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 transition whitespace-nowrap cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nueva Zona</span>
        </button>
      )}
    </div>
  );
};
