import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

interface PosSocketCallbacks {
  onShiftOpened?: () => void;
  onShiftClosed?: () => void;
  onOrderUpdated?: (order: any) => void;
  onTableUpdated?: (table: any) => void;
}

export const usePosSocket = (callbacks: PosSocketCallbacks) => {
  useEffect(() => {
    const socket: Socket = io();

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
      socket.disconnect();
    };
  }, [callbacks.onShiftOpened, callbacks.onShiftClosed, callbacks.onOrderUpdated, callbacks.onTableUpdated]);
};

export default usePosSocket;
