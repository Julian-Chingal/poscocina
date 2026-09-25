import { FastifyInstance } from 'fastify';
import fp from 'fastify-plugin';
import { Server as SocketIOServer } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';

import { env } from '../config/env.js';

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
  try {
    const pubClient = new Redis(env.REDIS_URL, {
      lazyConnect: true,
      maxRetriesPerRequest: null,
      retryStrategy: (times) => Math.min(times * 200, 2000),
    });
    pubClient.on('error', (err) => {
      fastify.log.warn(`⚠️ Socket.IO Redis pubClient error: ${err.message}`);
    });

    const subClient = pubClient.duplicate();
    subClient.on('error', (err) => {
      fastify.log.warn(`⚠️ Socket.IO Redis subClient error: ${err.message}`);
    });

    await Promise.all([pubClient.connect(), subClient.connect()]);
    io.adapter(createAdapter(pubClient, subClient));
    fastify.log.info('🔌 Socket.IO connected with Redis adapter');
  } catch (err: any) {
    fastify.log.warn(`⚠️ Redis not available for Socket.IO adapter (${err.message}), using in-memory adapter fallback`);
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
