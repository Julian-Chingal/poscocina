import dotenv from 'dotenv';
import { sql } from 'drizzle-orm';
import { buildServer } from './server.js';
import { db } from './db/index.js';
import { redis } from './config/redis.js';

dotenv.config({ path: '../../.env' });

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

async function validateInfrastructure() {
  console.log('🔍 Validando infraestructura (Base de datos PostgreSQL y Redis)...');

  // 1. Validar conexión con PostgreSQL
  try {
    const dbPromise = db.execute(sql`SELECT 1`);
    const dbTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout de conexión a Base de Datos (5000ms)')), 5000)
    );
    await Promise.race([dbPromise, dbTimeout]);
    console.log('✅ Base de datos (PostgreSQL): Conectada exitosamente.');
  } catch (err: any) {
    console.error('❌ ERROR CRÍTICO AL INICIAR: No se pudo conectar a PostgreSQL.');
    console.error(`   Detalle: ${err.message || err}`);
    console.error('   El backend no puede operar sin base de datos. Terminando proceso...');
    process.exit(1);
  }

  // 2. Validar conexión con Redis
  try {
    const redisPromise = redis.ping();
    const redisTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout de conexión a Redis (5000ms)')), 5000)
    );
    const pong = await Promise.race([redisPromise, redisTimeout]);
    if (pong !== 'PONG') {
      throw new Error(`Respuesta inválida de Redis PING: ${pong}`);
    }
    console.log('✅ Caché y Sesiones (Redis): Conectado exitosamente.');
  } catch (err: any) {
    console.error('❌ ERROR CRÍTICO AL INICIAR: No se pudo conectar a Redis.');
    console.error(`   Detalle: ${err.message || err}`);
    console.error('   El backend no puede operar sin Redis (sesiones/rate-limiting/sockets). Terminando proceso...');
    process.exit(1);
  }
}

async function start() {
  await validateInfrastructure();
  const server = await buildServer();

  try {
    await server.listen({ port: PORT, host: HOST });
    console.log(`🚀 poscocina backend server ready at http://${HOST}:${PORT}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
