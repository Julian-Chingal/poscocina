import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { GastronomicLoader } from '@/components/common/GastronomicLoader';
import { SalonViewProps } from './types/salon.types';
import { useSalonData } from './hooks/useSalonData';
import { useTableMutations } from './hooks/useTableMutations';
import { useTableOperations } from './hooks/useTableOperations';
import { SalonHeader } from './components/SalonHeader';
import { FloorPlansBar } from './components/FloorPlansBar';
import { TablesGrid } from './components/TablesGrid';
import { FloorPlanCanvas } from './components/FloorPlanCanvas';
import { TableModal } from './components/TableModal';
import { FloorPlanModal } from './components/FloorPlanModal';
import { DeleteTableModal } from './components/DeleteTableModal';
import { TransferTableModal } from './components/TransferTableModal';
import { MergeTablesModal } from './components/MergeTablesModal';
import { TableQrCardsModal } from './components/TableQrCardsModal';

export const SalonView: React.FC<SalonViewProps> = ({ venueId, onSelectTable }) => {
  const { currentUser } = useAuthStore();
  const [isEditMode, setIsEditMode] = useState(false);
  const [viewMode, setViewMode] = useState<'canvas' | 'grid'>('grid');
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrTargetTableId, setQrTargetTableId] = useState<string | null>(null);

  const isManager =
    currentUser?.roleName === 'manager' ||
    currentUser?.roleName === 'super_admin' ||
    Boolean(currentUser?.hierarchy && currentUser.hierarchy >= 80);

  const data = useSalonData(venueId);
  const mutations = useTableMutations(venueId, data.refreshData);
  const operations = useTableOperations(data.tables, data.floorPlans, data.refreshData);

  // Active floor plan for canvas design
  const activePlan =
    data.floorPlans.find((p) => p.id === data.activeFloorPlanId) ||
    data.floorPlans[0] ||
    null;

  // Auto-select first floor plan if in edit mode and on 'all'
  useEffect(() => {
    if (isEditMode && data.activeFloorPlanId === 'all' && data.floorPlans.length > 0) {
      data.setActiveFloorPlanId(data.floorPlans[0].id);
    }
  }, [isEditMode, data.activeFloorPlanId, data.floorPlans]);

  if (data.loading && data.tables.length === 0) {
    return (
      <GastronomicLoader
        variant="fullscreen"
        iconType="cloche"
        message="Alistando el salón y mesas..."
        submessage="Sincronizando planos, distribución y estado de comandas"
      />
    );
  }

  return (
    <div className="w-full min-w-0 p-6 sm:p-10 max-w-7xl mx-auto space-y-6">
      <SalonHeader
        isEditMode={isEditMode}
        isManager={isManager}
        hasFloorPlans={data.floorPlans.length > 0}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        onToggleEditMode={() => setIsEditMode(!isEditMode)}
        onOpenCreateTable={mutations.openCreateTable}
        onOpenNewFloorPlan={mutations.openCreateFloorPlan}
        onOpenQrCards={() => {
          setQrTargetTableId(null);
          setShowQrModal(true);
        }}
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

      {viewMode === 'canvas' ? (
        <FloorPlanCanvas
          floorPlan={activePlan}
          tables={data.filteredTables}
          isEditMode={isEditMode}
          isManager={isManager}
          onSelectTable={onSelectTable}
          onEditTable={mutations.openEditTable}
          onDeleteTable={mutations.setDeleteTarget}
          onOpenCreateTable={mutations.openCreateTable}
          onSaveLayout={mutations.saveFloorPlanDesign}
          onStartTransfer={(t) => {
            operations.setTransferSourceTable(t);
            operations.setSelectedTargetTableId('');
          }}
          onStartMerge={(t) => {
            operations.setMergeSourceTable(t);
            operations.setSelectedTargetTableId('');
          }}
        />
      ) : (
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
          onOpenQrCard={(t) => {
            setQrTargetTableId(t.id);
            setShowQrModal(true);
          }}
        />
      )}

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

      <TableQrCardsModal
        isOpen={showQrModal}
        onClose={() => {
          setShowQrModal(false);
          setQrTargetTableId(null);
        }}
        tables={data.tables}
        floorPlans={data.floorPlans}
        venueId={venueId || ''}
        initialTableId={qrTargetTableId}
      />
    </div>
  );
};

export default SalonView;
