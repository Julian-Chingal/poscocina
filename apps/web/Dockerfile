# syntax=docker/dockerfile:1

# ==============================================================================
# 1. Builder stage: Node.js 22 Alpine para compilar la SPA React + Vite
# ==============================================================================
FROM node:22-alpine AS builder
WORKDIR /app

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable && corepack prepare pnpm@12.4.1 --activate

# Copiar manifiestos y lockfile de todos los paquetes para consistencia del workspace
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json turbo.json ./
COPY packages/tsconfig/package.json ./packages/tsconfig/
COPY packages/tsconfig/base.json ./packages/tsconfig/
COPY packages/shared/package.json ./packages/shared/
COPY apps/server/package.json ./apps/server/
COPY apps/web/package.json ./apps/web/

# Instalar dependencias requeridas para el build
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY packages/tsconfig/ ./packages/tsconfig/
COPY packages/shared/ ./packages/shared/
COPY apps/web/ ./apps/web/

# Variables de entorno en tiempo de compilación (Vite embebe variables VITE_*)
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

# Compilar dependencias compartidas y bundle del frontend
RUN pnpm --filter @poscocina/shared build
RUN pnpm --filter @poscocina/web build

# ==============================================================================
# 2. Runner stage: Nginx Alpine ultraligero para servir estáticos y reverse proxy
# ==============================================================================
FROM nginx:1.27-alpine AS runner

# Eliminar configuración por defecto de Nginx
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copiar configuración personalizada optimizada para SPA y proxy reverso
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Copiar bundle estático generado por Vite
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Exponer el puerto 80 del contenedor Nginx
EXPOSE 80

# Healthcheck HTTP nativo
HEALTHCHECK --interval=15s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:80/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
