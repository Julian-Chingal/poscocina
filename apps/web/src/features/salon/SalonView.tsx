import React, { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
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
      <div className="flex items-center justify-center h-96">
        <div className="text-slate-400 animate-spin text-2xl">⏳</div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto">
      <SalonHeader
        isEditMode={isEditMode}
        isManager={isManager}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
        onOpenCreateTable={mutations.openCreateTable}
      />

      <FloorPlansBar
        floorPlans={data.floorPlans}
        tables={data.tables}
        activeFloorPlanId={data.activeFloorPlanId}
        isEditMode={isEditMode}
        onSelectFloorPlan={data.setActiveFloorPlanId}
        onOpenNewFloorPlan={() => mutations.setShowFloorPlanModal(true)}
      />

      <TablesGrid
        tables={data.filteredTables}
        isEditMode={isEditMode}
        isManager={isManager}
        onSelectTable={onSelectTable}
        onOpenCreateTable={mutations.openCreateTable}
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
        onSubmit={mutations.saveTable}
      />

      <FloorPlanModal
        isOpen={mutations.showFloorPlanModal}
        submitting={mutations.submitting}
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
