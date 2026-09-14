import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  HOST: z.string().default('0.0.0.0'),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL es obligatoria para arrancar el servidor'),
  REDIS_URL: z.string().default('redis://localhost:6379'),
  JWT_SECRET: z.string().min(16, 'JWT_SECRET debe tener al menos 16 caracteres para seguridad criptográfica'),
  JWT_EXPIRES_IN: z.string().default('12h'),
  CORS_ORIGIN: z.string().default('http://localhost:5173,http://localhost:5174,http://localhost:3000'),
});

const parseEnv = () => {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Error fatal de configuración de variables de entorno:');
    for (const issue of result.error.issues) {
      console.error(`  - ${issue.path.join('.')}: ${issue.message}`);
    }
    process.exit(1);
  }
  return result.data;
};

export const env = parseEnv();
