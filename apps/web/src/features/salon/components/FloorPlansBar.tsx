import React from 'react';
import { Plus } from 'lucide-react';
import { FloorPlanItem, TableItem } from '../types/salon.types';
import { Button } from '@/components/ui/button';

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
      <Button
        variant={activeFloorPlanId === 'all' ? 'default' : 'ghost'}
        type="button"
        onClick={() => onSelectFloorPlan('all')}
        className={`px-4 h-9 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
          activeFloorPlanId === 'all'
            ? 'bg-primary text-primary-foreground shadow'
            : 'bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted'
        }`}
      >
        Todas las zonas ({tables.length})
      </Button>

      {floorPlans.map((plan) => (
        <Button
          key={plan.id}
          variant={activeFloorPlanId === plan.id ? 'default' : 'ghost'}
          type="button"
          onClick={() => onSelectFloorPlan(plan.id)}
          className={`px-4 h-9 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
            activeFloorPlanId === plan.id
              ? 'bg-primary text-primary-foreground shadow'
              : 'bg-muted/70 text-muted-foreground hover:text-foreground hover:bg-muted'
          }`}
        >
          {plan.name} ({tables.filter((t) => t.floorPlanId === plan.id).length})
        </Button>
      ))}

      {isEditMode && (
        <Button
          variant="ghost"
          type="button"
          onClick={onOpenNewFloorPlan}
          className="flex items-center space-x-1 px-3 h-9 rounded-xl text-xs font-semibold text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 whitespace-nowrap"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nueva Zona</span>
        </Button>
      )}
    </div>
  );
};

export default FloorPlansBar;
