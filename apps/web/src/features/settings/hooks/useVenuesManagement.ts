import { useState, useEffect, useCallback, useMemo } from 'react';
import { useBrandingStore, VenueItem } from '@/stores/branding.store';
import { useAuthStore } from '@/stores/auth.store';
import { settingsApi } from '../api/settings.api';
import { VenueSummaryData, NewVenuePayload, UpdateVenuePayload } from '../types/settings.types';
import { toast } from '@/components/ui/sileo';

export type VenueStatusFilter = 'all' | 'active' | 'inactive';
export type VenueViewMode = 'grid' | 'table';

export const useVenuesManagement = (isActiveTab: boolean) => {
  const { venues, venueId, loadAllVenues, switchVenue, loadBranding } = useBrandingStore();
  const setAuthVenueId = useAuthStore((s) => s.setVenueId);
  const [summaries, setSummaries] = useState<Record<string, VenueSummaryData>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<VenueItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Search and view mode controls
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<VenueStatusFilter>('all');
  const [viewMode, setViewMode] = useState<VenueViewMode>('grid');

  const fetchSummaries = useCallback(async () => {
    if (!venues.length) return;
    try {
      const entries = await Promise.all(
        venues.map(async (v) => {
          try {
            const data = await settingsApi.getVenueSummary(v.id);
            return [v.id, data] as const;
          } catch {
            return null;
          }
        })
      );
      const valid = Object.fromEntries(entries.filter(Boolean) as [string, VenueSummaryData][]);
      setSummaries(valid);
    } catch (err) {
      console.error('Error fetching summaries:', err);
    }
  }, [venues]);

  useEffect(() => {
    loadAllVenues();
  }, [loadAllVenues]);

  useEffect(() => {
    if (isActiveTab) fetchSummaries();
  }, [isActiveTab, fetchSummaries]);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      await loadAllVenues();
      await fetchSummaries();
      toast.success('Estado de sucursales sincronizado');
    } catch {
      toast.error('Error al actualizar sedes');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleSwitch = async (targetId: string) => {
    setAuthVenueId(targetId);
    await switchVenue(targetId);
  };

  const openCreateModal = () => {
    setEditingVenue(null);
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (venue: VenueItem) => {
    setEditingVenue(venue);
    setModalError('');
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingVenue(null);
    setModalError('');
  };

  const createVenue = async (payload: NewVenuePayload) => {
    setIsSaving(true);
    setModalError('');
    try {
      await settingsApi.createVenue(payload);
      toast.success(`Sucursal "${payload.name}" creada con éxito`);
      await loadAllVenues();
      closeModal();
    } catch (err: any) {
      setModalError(err?.message || 'No se pudo crear la sucursal');
    } finally {
      setIsSaving(false);
    }
  };

  const updateVenue = async (id: string, payload: UpdateVenuePayload) => {
    setIsSaving(true);
    setModalError('');
    try {
      await settingsApi.updateVenue(id, payload);
      toast.success('Sucursal actualizada con éxito');
      await loadAllVenues();
      // If updating current active venue, refresh branding
      if (id === venueId) {
        await loadBranding(id);
      }
      closeModal();
    } catch (err: any) {
      setModalError(err?.message || 'No se pudo actualizar la sucursal');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleVenueStatus = async (targetId: string, nextStatus: boolean) => {
    try {
      await settingsApi.toggleVenueStatus(targetId, nextStatus);
      toast.success(nextStatus ? 'Sede activada con éxito' : 'Sede desactivada con éxito');
      await loadAllVenues();
    } catch (err: any) {
      toast.error(err?.message || 'Error al cambiar estado de la sede');
    }
  };

  const deleteVenue = async (targetId: string) => {
    try {
      await settingsApi.deleteVenue(targetId);
      toast.success('Sede eliminada con éxito');
      await loadAllVenues();
    } catch (err: any) {
      if (err?.status !== 409) {
        toast.error(err?.message || 'Error al eliminar la sede');
      }
    }
  };

  // Filtered venues list
  const filteredVenues = useMemo(() => {
    return venues.filter((v) => {
      const isActive = v.isActive !== false;
      if (statusFilter === 'active' && !isActive) return false;
      if (statusFilter === 'inactive' && isActive) return false;

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase().trim();
        const nameMatch = v.name?.toLowerCase().includes(query);
        const addressMatch = v.address?.toLowerCase().includes(query);
        const slugMatch = (v.slug || (v.settings as any)?.slug)?.toLowerCase().includes(query);
        const cityMatch = ((v.settings as any)?.city)?.toLowerCase().includes(query);
        const managerMatch = ((v.settings as any)?.managerName)?.toLowerCase().includes(query);
        if (!nameMatch && !addressMatch && !slugMatch && !cityMatch && !managerMatch) return false;
      }
      return true;
    });
  }, [venues, statusFilter, searchTerm]);

  // Executive chain metrics
  const chainMetrics = useMemo(() => {
    const totalVenues = venues.length;
    const activeVenues = venues.filter((v) => v.isActive !== false).length;
    const inactiveVenues = totalVenues - activeVenues;

    let totalTables = 0;
    let occupiedTables = 0;
    let totalActiveOrders = 0;
    let openShiftsCount = 0;
    let totalActiveStaff = 0;

    Object.values(summaries).forEach((s) => {
      if (s?.stats) {
        totalTables += s.stats.tables?.total || 0;
        occupiedTables += s.stats.tables?.occupied || 0;
        totalActiveOrders += s.stats.activeOrders || 0;
        if (s.stats.openShift) openShiftsCount++;
        totalActiveStaff += s.stats.activeStaff || 0;
      }
    });

    const freeTables = Math.max(0, totalTables - occupiedTables);
    const occupancyRate = totalTables > 0 ? Math.round((occupiedTables / totalTables) * 100) : 0;

    return {
      totalVenues,
      activeVenues,
      inactiveVenues,
      totalTables,
      occupiedTables,
      freeTables,
      occupancyRate,
      totalActiveOrders,
      openShiftsCount,
      totalActiveStaff,
    };
  }, [venues, summaries]);

  return {
    venues,
    filteredVenues,
    currentVenueId: venueId,
    summaries,
    chainMetrics,
    // Modal states
    isModalOpen,
    editingVenue,
    isSaving,
    modalError,
    openCreateModal,
    openEditModal,
    closeModal,
    // Filter controls
    searchTerm,
    setSearchTerm,
    statusFilter,
    setStatusFilter,
    viewMode,
    setViewMode,
    isRefreshing,
    refreshData,
    // Actions
    handleSwitch,
    createVenue,
    updateVenue,
    toggleVenueStatus,
    deleteVenue,
  };
};
