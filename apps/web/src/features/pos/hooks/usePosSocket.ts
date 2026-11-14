import { useEffect } from 'react';
import { getAppSocket } from '@/lib/socket';

interface PosSocketCallbacks {
  onShiftOpened?: () => void;
  onShiftClosed?: () => void;
  onOrderUpdated?: (order: any) => void;
  onTableUpdated?: (table: any) => void;
}

export const usePosSocket = (callbacks: PosSocketCallbacks) => {
  useEffect(() => {
    const socket = getAppSocket();

    if (callbacks.onShiftOpened) {
      socket.on('cash_shift:opened', callbacks.onShiftOpened);
    }
    if (callbacks.onShiftClosed) {
      socket.on('cash_shift:closed', callbacks.onShiftClosed);
    }
    if (callbacks.onOrderUpdated) {
      socket.on('order:updated', callbacks.onOrderUpdated);
    }
    if (callbacks.onTableUpdated) {
      socket.on('table:updated', callbacks.onTableUpdated);
    }

    return () => {
      if (callbacks.onShiftOpened) {
        socket.off('cash_shift:opened', callbacks.onShiftOpened);
      }
      if (callbacks.onShiftClosed) {
        socket.off('cash_shift:closed', callbacks.onShiftClosed);
      }
      if (callbacks.onOrderUpdated) {
        socket.off('order:updated', callbacks.onOrderUpdated);
      }
      if (callbacks.onTableUpdated) {
        socket.off('table:updated', callbacks.onTableUpdated);
      }
    };
  }, [callbacks.onShiftOpened, callbacks.onShiftClosed, callbacks.onOrderUpdated, callbacks.onTableUpdated]);
};

export default usePosSocket;
