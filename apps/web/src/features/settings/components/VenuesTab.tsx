import React from 'react';
import { Plus } from 'lucide-react';
import { useAuthStore } from '@/stores/auth.store';
import { useVenuesManagement } from '../hooks/useVenuesManagement';
import { VenueCard } from './VenueCard';
import { NewVenueModal } from './NewVenueModal';

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
  } = useVenuesManagement(isActive);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-white text-lg">Sucursales del Negocio</h3>
          <p className="text-xs text-slate-400">
            Gestiona y monitorea en tiempo real todas las sedes asociadas a la cadena.
          </p>
        </div>

        {currentUser?.roleName === 'super_admin' && (
          <button
            onClick={openModal}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs transition cursor-pointer shadow-lg shadow-orange-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Sede</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {venues.map((v) => (
          <VenueCard
            key={v.id}
            venue={v}
            isCurrent={v.id === currentVenueId}
            summary={summaries[v.id]?.stats}
            onSwitch={handleSwitch}
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
