# syntax=docker/dockerfile:1

# ==============================================================================
# 1. Base stage: Node.js 22 Alpine con pnpm habilitado vía Corepack
# ==============================================================================
FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@12.4.1 --activate

# ==============================================================================
# 2. Builder stage: Instalación de dependencias y compilación Next.js
# ==============================================================================
FROM base AS builder
WORKDIR /app

# Copiar manifiestos y lockfile de todos los paquetes para consistencia del workspace
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/tsconfig/base.json ./packages/tsconfig/
COPY packages/shared/package.json ./packages/shared/
COPY apps/server/package.json ./apps/server/
COPY apps/web/package.json ./apps/web/
COPY apps/delivery/package.json ./apps/delivery/

# Instalar dependencias requeridas para el build
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY packages/tsconfig/ ./packages/tsconfig/
COPY packages/shared/ ./packages/shared/
COPY apps/delivery/ ./apps/delivery/

# Variables de entorno en tiempo de compilación
ARG NEXT_PUBLIC_API_URL=/api
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL

# Compilar paquetes compartidos y la aplicación de delivery
RUN pnpm --filter @poscocina/shared build
RUN pnpm --filter @poscocina/delivery build

# Desplegar únicamente dependencias de producción para apps/delivery
RUN pnpm --filter @poscocina/delivery deploy /app/pruned --prod

# ==============================================================================
# 3. Runner stage: Imagen de producción mínima y segura (Non-root user)
# ==============================================================================
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=3001 \
    HOST=0.0.0.0

# Copiar dependencias de producción y package.json
COPY --chown=node:node --from=builder /app/pruned/node_modules ./node_modules
COPY --chown=node:node --from=builder /app/pruned/package.json ./package.json

# Copiar artefactos de compilación de Next.js y archivos públicos
COPY --chown=node:node --from=builder /app/apps/delivery/.next ./.next
COPY --chown=node:node --from=builder /app/apps/delivery/public ./public
COPY --chown=node:node --from=builder /app/apps/delivery/next.config.mjs ./next.config.mjs

USER node

EXPOSE 3001

# Healthcheck interno del servicio
HEALTHCHECK --interval=15s --timeout=5s --start-period=15s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:3001/ || exit 1

CMD ["node", "node_modules/next/dist/bin/next", "start", "-p", "3001"]
