import React, { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { Skeleton } from '@/components/ui/skeleton';
import { SalonViewProps } from './types/salon.types';
import { useSalonData } from './hooks/useSalonData';
import { useTableMutations } from './hooks/useTableMutations';
import { useTableOperations } from './hooks/useTableOperations';
import { SalonHeader } from './components/SalonHeader';
import { FloorPlansBar } from './components/FloorPlansBar';
import { TablesGrid } from './components/TablesGrid';
import { TableModal } from './components/TableModal';
import { FloorPlanModal } from './components/FloorPlanModal';
import { DeleteTableModal } from './components/DeleteTableModal';
import { TransferTableModal } from './components/TransferTableModal';
import { MergeTablesModal } from './components/MergeTablesModal';

export const SalonView: React.FC<SalonViewProps> = ({ venueId, onSelectTable }) => {
  const { currentUser } = useAuthStore();
  const [isEditMode, setIsEditMode] = useState(false);

  const isManager =
    currentUser?.roleName === 'manager' ||
    currentUser?.roleName === 'super_admin' ||
    Boolean(currentUser?.hierarchy && currentUser.hierarchy >= 80);

  const data = useSalonData(venueId);
  const mutations = useTableMutations(venueId, data.refreshData);
  const operations = useTableOperations(data.tables, data.floorPlans, data.refreshData);

  if (data.loading && data.tables.length === 0) {
    return (
      <div className="w-full min-w-0 p-6 sm:p-10 max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-44" />
          <Skeleton className="h-9 w-32 rounded-xl" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 pt-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 p-6 sm:p-10 max-w-7xl mx-auto space-y-6">
      <SalonHeader
        isEditMode={isEditMode}
        isManager={isManager}
        hasFloorPlans={data.floorPlans.length > 0}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
        onOpenCreateTable={mutations.openCreateTable}
        onOpenNewFloorPlan={mutations.openCreateFloorPlan}
      />

      <FloorPlansBar
        floorPlans={data.floorPlans}
        tables={data.tables}
        activeFloorPlanId={data.activeFloorPlanId}
        isEditMode={isEditMode}
        isManager={isManager}
        onSelectFloorPlan={data.setActiveFloorPlanId}
        onOpenNewFloorPlan={mutations.openCreateFloorPlan}
      />

      <TablesGrid
        tables={data.filteredTables}
        hasFloorPlans={data.floorPlans.length > 0}
        isEditMode={isEditMode}
        isManager={isManager}
        onSelectTable={onSelectTable}
        onOpenCreateTable={mutations.openCreateTable}
        onOpenNewFloorPlan={mutations.openCreateFloorPlan}
        onEditTable={mutations.openEditTable}
        onDeleteTable={mutations.setDeleteTarget}
        onStartTransfer={(t) => {
          operations.setTransferSourceTable(t);
          operations.setSelectedTargetTableId('');
        }}
        onStartMerge={(t) => {
          operations.setMergeSourceTable(t);
          operations.setSelectedTargetTableId('');
        }}
      />

      <TableModal
        isOpen={mutations.showTableModal}
        editingTable={mutations.editingTable}
        floorPlans={data.floorPlans}
        defaultFloorPlanId={data.activeFloorPlanId}
        totalTables={data.tables.length}
        submitting={mutations.submitting}
        formError={mutations.formError}
        onClose={() => mutations.setShowTableModal(false)}
        onOpenNewFloorPlan={mutations.openCreateFloorPlan}
        onSubmit={mutations.saveTable}
      />

      <FloorPlanModal
        isOpen={mutations.showFloorPlanModal}
        submitting={mutations.submitting}
        formError={mutations.floorPlanError}
        onClose={() => mutations.setShowFloorPlanModal(false)}
        onSubmit={async (name) => {
          const created = await mutations.createFloorPlan(name);
          if (created) {
            data.setFloorPlans((prev) => [...prev, created]);
            data.setActiveFloorPlanId(created.id);
          }
        }}
      />

      <DeleteTableModal
        deleteTarget={mutations.deleteTarget}
        submitting={mutations.submitting}
        onClose={() => mutations.setDeleteTarget(null)}
        onConfirm={mutations.confirmDeleteTable}
      />

      <TransferTableModal
        sourceTable={operations.transferSourceTable}
        tables={data.tables}
        floorPlans={data.floorPlans}
        targetZone={operations.transferTargetZone}
        selectedTargetTableId={operations.selectedTargetTableId}
        actionLoading={operations.actionLoading}
        actionError={operations.actionError}
        onClose={() => operations.setTransferSourceTable(null)}
        onZoneChange={(zone) => {
          operations.setTransferTargetZone(zone);
          operations.setSelectedTargetTableId('');
        }}
        onTargetTableChange={operations.setSelectedTargetTableId}
        onConfirm={operations.handleTransferTable}
      />

      <MergeTablesModal
        sourceTable={operations.mergeSourceTable}
        tables={data.tables}
        selectedTargetTableId={operations.selectedTargetTableId}
        actionLoading={operations.actionLoading}
        actionError={operations.actionError}
        onClose={() => operations.setMergeSourceTable(null)}
        onTargetTableChange={operations.setSelectedTargetTableId}
        onConfirm={operations.handleMergeTables}
      />
    </div>
  );
};

export default SalonView;
