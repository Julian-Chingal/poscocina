import { io, Socket } from 'socket.io-client';

let socketInstance: Socket | null = null;

export function getAppSocket(): Socket {
  if (!socketInstance) {
    socketInstance = io({
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });
  }
  return socketInstance;
}
