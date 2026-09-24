import React from 'react';
import { Plus } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useVenuesManagement } from '../hooks/useVenuesManagement';
import { VenueCard } from './VenueCard';
import { NewVenueModal } from './NewVenueModal';
import { Button } from '@/components/ui/button';

interface Props {
  isActive: boolean;
}

export const VenuesTab: React.FC<Props> = ({ isActive }) => {
  const currentUser = useAuthStore((s) => s.currentUser);
  const {
    venues,
    currentVenueId,
    summaries,
    isModalOpen,
    isCreating,
    createError,
    openModal,
    closeModal,
    handleSwitch,
    createVenue,
    toggleVenueStatus,
    deleteVenue,
  } = useVenuesManagement(isActive);

  const isSuperAdmin = currentUser?.roleName === 'super_admin';
  const canManage = isSuperAdmin || currentUser?.roleName === 'manager';

  return (
    <div className="w-full min-w-0 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-foreground text-lg">Sucursales del Negocio</h3>
          <p className="text-xs text-muted-foreground">
            Gestiona y monitorea en tiempo real todas las sedes asociadas a la cadena.
          </p>
        </div>

        {isSuperAdmin && (
          <Button
            type="button"
            onClick={openModal}
            className="flex items-center space-x-2 px-4 py-2 h-auto rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs transition cursor-pointer shadow-lg shadow-primary/20 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Sede</span>
          </Button>
        )}
      </div>

      <div className="w-full min-w-0 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
        {venues.map((v) => (
          <VenueCard
            key={v.id}
            venue={v}
            isCurrent={v.id === currentVenueId}
            canManage={canManage}
            isSuperAdmin={isSuperAdmin}
            summary={summaries[v.id]?.stats}
            onSwitch={handleSwitch}
            onToggleStatus={toggleVenueStatus}
            onDelete={deleteVenue}
          />
        ))}
      </div>

      <NewVenueModal
        isOpen={isModalOpen}
        isCreating={isCreating}
        error={createError}
        onClose={closeModal}
        onSubmit={createVenue}
      />
    </div>
  );
};

export default VenuesTab;
