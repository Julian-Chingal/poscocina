import { useState, useEffect, useCallback } from 'react';
import { useBrandingStore } from '@/stores/branding.store';
import { useAuthStore } from '@/stores/auth.store';
import { settingsApi } from '../api/settings.api';
import { VenueSummaryData, NewVenuePayload } from '../types/settings.types';
import { toast } from '@/components/ui/sonner';

export const useVenuesManagement = (isActiveTab: boolean) => {
  const { venues, venueId, loadAllVenues, switchVenue } = useBrandingStore();
  const setAuthVenueId = useAuthStore((s) => s.setVenueId);
  const [summaries, setSummaries] = useState<Record<string, VenueSummaryData>>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  const fetchSummaries = useCallback(async () => {
    if (!venues.length) return;
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
  }, [venues]);

  useEffect(() => {
    loadAllVenues();
  }, [loadAllVenues]);

  useEffect(() => {
    if (isActiveTab) fetchSummaries();
  }, [isActiveTab, fetchSummaries]);

  const handleSwitch = async (targetId: string) => {
    setAuthVenueId(targetId);
    await switchVenue(targetId);
  };

  const createVenue = async (payload: NewVenuePayload) => {
    setIsCreating(true);
    setCreateError('');
    try {
      await settingsApi.createVenue(payload);
      toast.success('Nueva sucursal creada con éxito');
      await loadAllVenues();
      setIsModalOpen(false);
    } catch (err: any) {
      setCreateError(err?.message || 'No se pudo crear la sucursal');
    } finally {
      setIsCreating(false);
    }
  };

  return {
    venues,
    currentVenueId: venueId,
    summaries,
    isModalOpen,
    isCreating,
    createError,
    openModal: () => setIsModalOpen(true),
    closeModal: () => setIsModalOpen(false),
    handleSwitch,
    createVenue,
  };
};
