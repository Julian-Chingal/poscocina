# syntax=docker/dockerfile:1

# ==============================================================================
# 1. Base stage: Node.js 22 Alpine con pnpm habilitado vía Corepack
# ==============================================================================
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@12.4.1 --activate

# ==============================================================================
# 2. Builder stage: Instalación de dependencias y compilación TypeScript
# ==============================================================================
FROM base AS builder
WORKDIR /app

# Copiar manifiestos de todos los paquetes del workspace para validar pnpm-lock.yaml
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/tsconfig/base.json ./packages/tsconfig/
COPY packages/shared/package.json ./packages/shared/
COPY apps/server/package.json ./apps/server/
COPY apps/web/package.json ./apps/web/

# Instalar dependencias completas de forma determinista
RUN pnpm install --frozen-lockfile

# Copiar código fuente de paquetes y del backend
COPY packages/tsconfig/ ./packages/tsconfig/
COPY packages/shared/ ./packages/shared/
COPY apps/server/ ./apps/server/

# Compilar paquete compartido y backend Fastify
RUN pnpm --filter @poscocina/shared build
RUN pnpm --filter @poscocina/server build

# Desplegar únicamente dependencias de producción para apps/server
RUN pnpm --filter @poscocina/server deploy /app/pruned --prod

# ==============================================================================
# 3. Runner stage: Imagen de producción mínima y segura (Non-root user)
# ==============================================================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3000 \
    HOST=0.0.0.0

# Copiar dependencias de producción y package.json
COPY --chown=node:node --from=builder /app/pruned/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/pruned/package.json ./package.json

# Copiar artefactos compilados y migraciones Drizzle
COPY --chown=node:node --from=builder /app/apps/server/dist ./dist
COPY --chown=node:node --from=builder /app/apps/server/drizzle ./drizzle

# Copiar script de arranque / migraciones
COPY --chown=node:node apps/server/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Usuario sin privilegios
USER node

# Exposición interna (utilizado en la red interna de Docker)
EXPOSE 3000

# Healthcheck interno del servicio
HEALTHCHECK --interval=15s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3000/health || exit 1

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "dist/index.js"]
