import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';

declare module 'fastify' {
  interface FastifyInstance {
    io: SocketIOServer;
  }
}

export const socketPlugin = fp(async (fastify: FastifyInstance) => {
  const io = new SocketIOServer(fastify.server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PATCH'],
    },
  });

  // Redis Adapter for WebSocket scaling (with fallback if Redis is unreachable)
  const redisHost = process.env.REDIS_HOST || 'localhost';
  const redisPort = Number(process.env.REDIS_PORT) || 6379;

  try {
    const pubClient = new Redis({ host: redisHost, port: redisPort, lazyConnect: true });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    fastify.log.info('🔌 Socket.IO connected with Redis adapter');
  } catch (err) {
    fastify.log.warn('⚠️ Redis not available for Socket.IO adapter, using in-memory adapter fallback');
  }

  io.on('connection', (socket) => {
    fastify.log.info(`Client connected: ${socket.id}`);

    socket.on('join:venue', (venueId: string) => {
      socket.join(`venue:${venueId}`);
      fastify.log.info(`Socket ${socket.id} joined venue:${venueId}`);
    });

    socket.on('join:kds', (station: string) => {
      socket.join(`kds:${station || 'all'}`);
      fastify.log.info(`Socket ${socket.id} joined kds:${station}`);
    });

    socket.on('disconnect', () => {
      fastify.log.info(`Client disconnected: ${socket.id}`);
    });
  });

  fastify.decorate('io', io);
});
