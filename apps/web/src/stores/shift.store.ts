import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import { api } from '@/services/api';

interface ShiftState {
  isOpen: boolean;
  shiftId: string | null;
  cashierName?: string;
  loading: boolean;
  fetchCurrentShift: (venueId: string) => Promise<void>;
  setShiftStatus: (status: { isOpen: boolean; shiftId?: string | null; cashierName?: string }) => void;
  initSocket: (venueId?: string) => () => void;
}

export const useShiftStore = create<ShiftState>((set, get) => ({
  isOpen: false,
  shiftId: null,
  cashierName: undefined,
  loading: false,

  setShiftStatus: ({ isOpen, shiftId = null, cashierName }) => {
    set({ isOpen, shiftId, cashierName });
  },

  fetchCurrentShift: async (venueId: string) => {
    if (!venueId) return;
    set({ loading: true });
    try {
      const data = await api.get(`/cash-shifts/current/${venueId}`);
      if (data?.open && data?.shift) {
        set({
          isOpen: true,
          shiftId: data.shift.id,
          cashierName: data.shift.openedByName || 'Cajero',
          loading: false,
        });
        return;
      }
      set({ isOpen: false, shiftId: null, cashierName: undefined, loading: false });
    } catch {
      set({ isOpen: false, shiftId: null, cashierName: undefined, loading: false });
    }
  },

  initSocket: (venueId?: string) => {
    const socket: Socket = io();

    const handleShiftOpened = (shift: any) => {
      set({
        isOpen: true,
        shiftId: shift?.id || null,
        cashierName: shift?.openedByName || 'Cajero',
      });
      if (venueId) {
        get().fetchCurrentShift(venueId);
      }
    };

    const handleShiftClosed = () => {
      set({
        isOpen: false,
        shiftId: null,
        cashierName: undefined,
      });
      if (venueId) {
        get().fetchCurrentShift(venueId);
      }
    };

    socket.on('cash_shift:opened', handleShiftOpened);
    socket.on('shift:opened', handleShiftOpened);
    socket.on('cash_shift:closed', handleShiftClosed);
    socket.on('shift:closed', handleShiftClosed);

    return () => {
      socket.off('cash_shift:opened', handleShiftOpened);
      socket.off('shift:opened', handleShiftOpened);
      socket.off('cash_shift:closed', handleShiftClosed);
      socket.off('shift:closed', handleShiftClosed);
      socket.disconnect();
    };
  },
}));
