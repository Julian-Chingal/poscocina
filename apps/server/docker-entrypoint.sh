#!/bin/sh
set -e

echo "🚀 Iniciando contenedor poscocina-server..."

# 1. Comprobación opcional de conectividad de migraciones
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "⏳ Ejecutando migraciones de base de datos (Drizzle ORM)..."
  if node dist/db/migrate.js; then
    echo "✅ Migraciones ejecutadas con éxito."
  else
    echo "❌ Error al ejecutar las migraciones."
    exit 1
  fi
else
  echo "⏭️ RUN_MIGRATIONS está desactivado. Omitiendo migraciones."
fi

# 2. Ejecución opcional de semillas (Seeds)
if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "🌱 Ejecutando seed de datos iniciales..."
  if node dist/db/seed.js; then
    echo "✅ Datos iniciales sembrados con éxito."
  else
    echo "⚠️ Advertencia: Error o conflicto al sembrar datos."
  fi
fi

# 3. Arrancar servidor principal pasando señales (PID 1)
echo "⚡ Arrancando servidor Fastify..."
exec "$@"
