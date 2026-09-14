import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';
import dotenv from 'dotenv';

dotenv.config({ path: '../../.env' });

const connectionString =
  process.env.DATABASE_URL || 'postgresql://posuser:pospassword@localhost:5432/poscocina';

// Postgres client with connection pooling
export const queryClient = postgres(connectionString, {
  max: 20,
  idle_timeout: 30,
  connect_timeout: 10,
});

export const db = drizzle(queryClient, { schema });
