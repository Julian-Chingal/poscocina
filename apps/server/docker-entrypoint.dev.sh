#!/bin/sh
set -e

echo "🚀 [poscocina-server-dev] Iniciando contenedor de desarrollo..."

# 1. Asegurar compilación de paquetes compartidos
echo "📦 [poscocina-server-dev] Compilando @poscocina/shared..."
pnpm --offline --filter @poscocina/shared build || pnpm --filter @poscocina/shared build

# 2. Comprobación opcional de migraciones
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "⏳ [poscocina-server-dev] Ejecutando migraciones de base de datos..."
  pnpm --filter @poscocina/server db:migrate || echo "⚠️ Advertencia: fallo al ejecutar migraciones"
fi

# 3. Comprobación opcional de semillas
if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "🌱 [poscocina-server-dev] Sembrando datos iniciales..."
  pnpm --filter @poscocina/server db:seed || echo "⚠️ Advertencia: fallo al ejecutar seed"
fi

echo "⚡ [poscocina-server-dev] Arrancando Fastify en modo desarrollo con tsx watch..."
exec "$@"
