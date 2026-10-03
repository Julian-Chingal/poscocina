# 🍽️ Poscocina — Sistema POS & KDS Modular para Gastronomía

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61dafb.svg)](https://react.dev/)
[![Fastify](https://img.shields.io/badge/Fastify-5.2-black.svg)](https://fastify.dev/)
[![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.40-C5F74F.svg)](https://orm.drizzle.team/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791.svg)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D.svg)](https://redis.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.4-EF4444.svg)](https://turbo.build/)
[![pnpm](https://img.shields.io/badge/pnpm-12.4-f69220.svg)](https://pnpm.io/)

**Poscocina** es una plataforma integral, modular y de alto rendimiento diseñada específicamente para el sector gastronómico (restaurantes, bares, cafeterías, dark kitchens y cadenas multisede). Combina un **Punto de Venta (POS) táctil ultrasensible**, un **Sistema de Visualización de Cocina (KDS) en tiempo real vía WebSockets**, control de **inventarios con escandallos (recetas automáticas)**, **arqueos y turnos de caja**, **reservas**, facturación fiscal y una innovadora suite de **catálogo con escaneo e interactividad 3D (fotogrametría / WebGL)**.

---

## 📑 Tabla de Contenidos

- [✨ Características Principales](#-características-principales)
  - [🗺️ Salón Interactivo & Mesas](#️-salón-interactivo--mesas)
  - [🧾 Punto de Venta Táctil (POS)](#-punto-de-venta-táctil-pos)
  - [👨‍🍳 Kitchen Display System (KDS) en Tiempo Real](#-kitchen-display-system-kds-en-tiempo-real)
  - [🍔 Catálogo de Productos & Modelado 3D](#-catálogo-de-productos--modelado-3d)
  - [📦 Inventario, Escandallos (Recetas), Proveedores y Compras](#-inventario-escandallos-recetas-proveedores-y-compras)
  - [💵 Turnos de Caja & Arqueos (Cash Shifts)](#-turnos-de-caja--arqueos-cash-shifts)
  - [📅 Motor de Reservas](#-motor-de-reservas)
  - [🏢 Multisede & Configuración Fiscal](#-multisede--configuración-fiscal)
  - [🖨️ Hardware & Ecosistema de Impresión Térmica](#️-hardware--ecosistema-de-impresión-térmica)
  - [🔐 Seguridad, Roles (RBAC) & PIN Terminal](#-seguridad-roles-rbac--pin-terminal)
- [🏗️ Arquitectura del Monorepo](#️-arquitectura-del-monorepo)
- [🛠️ Stack Tecnológico](#️-stack-tecnológico)
- [⚙️ Requisitos Previos](#️-requisitos-previos)
- [🚀 Instalación y Puesta en Marcha Local](#-instalación-y-puesta-en-marcha-local)
- [🔑 Credenciales por Defecto](#-credenciales-por-defecto)
- [📜 Scripts Disponibles](#-scripts-disponibles)
- [🌍 Variables de Entorno](#-variables-de-entorno)
- [🐳 Despliegue en Producción (Docker & Dokploy)](#-despliegue-en-producción-docker--dokploy)
- [🤝 Integración con Zogui Print Bridge](#-integración-con-zogui-print-bridge)

---

## ✨ Características Principales

### 🗺️ Salón Interactivo & Mesas
- **Mapa visual de salón dinámico**: Distribución espacial de mesas por zonas y salones con posiciones arrastrables (\(X, Y\)) y geometrías rectangulares o redondas.
- **Monitoreo de estados en tiempo real**: Indicadores cromáticos vivos para mesas libres, ocupadas, con precuenta solicitada, pagadas a la espera de comida, reservadas o bloqueadas.
- **Gestión por comensal**: Control de número de invitados por mesa, mesero asignado y notas especiales de servicio.

### 🧾 Punto de Venta Táctil (POS)
- **Toma de pedidos ultra rápida**: Diseñado para pantallas táctiles, tablets de salón y comandas en barra.
- **Modificadores y adiciones**: Grupos de opciones obligatorias/opcionales con selección simple o múltiple y deltas de precio en tiempo real.
- **Tiempos de servicio (Cursos)**: Organización de platos por tiempos (entradas, principales, postres, bebidas) y asignación por número de asiento.
- **Cobro flexible & Cuentas divididas**: Soporte para división de cuentas (*split bill*), múltiples formas de pago en un mismo ticket (efectivo, datáfono/tarjeta, transferencia bancaria, QR), cálculo automático de cambio y sugerencia porcentual de propina.
- **Descuentos controlados**: Descuentos manuales protegidos por validación de PIN de supervisor o gerente.

### 👨‍🍳 Kitchen Display System (KDS) en Tiempo Real
- **Sincronización instantánea**: Alimentado por WebSockets con Socket.IO y Redis PubSub para latencia cero entre meseros y cocina.
- **Enrutamiento por estaciones de trabajo**: Filtrado automático de ítems por estación de preparación asignada (Cocina Caliente, Cocina Fría, Barra/Bar, Repostería, Estación de Despacho/Expediter).
- **Semáforo de tiempos de preparación**: Alertas visuales y temporizadores de avance para prevenir retrasos en mesa.
- **Transición de estados**: Ciclo completo de ítem (`pending` ➔ `sent` ➔ `in_preparation` ➔ `ready` ➔ `delivered`).

### 🍔 Catálogo de Productos & Modelado 3D
- **Gestión completa**: Categorías personalizadas con paleta de colores e iconos, impuestos diferenciados (IVA / INC) y tiempos estimados de preparación.
- **Escaneo e interactividad 3D**:
  - Modal asistido con **guías visuales e ilustraciones de posturas de captura fotográfica** para platos desde el teléfono móvil (`Product3dScannerModal`, `ScanPoseIllustration`).
  - Carga y renderizado de modelos 3D en formato `.glb` mediante `@google/model-viewer`.
  - Visualización híbrida de fotografías de alta definición y modelos 3D interactivos con rotación y zoom 360°.

### 📦 Inventario, Escandallos (Recetas), Proveedores y Compras
- **Fichas técnicas y escandallos (`productRecipes`)**: Deducción milimétrica de stock de insumos por cada plato vendido según su receta configurada.
- **Salud de stock y semáforos ejecutivos**: Medidores visuales de existencias con umbrales mínimos de alerta para prevenir desabastecimiento.
- **Gestión de compras y proveedores**: Registro de facturas de compras a proveedores con actualización automática de costo ponderado unitario y existencias.
- **Auditoría de movimientos**: Registro y trazabilidad de ingresos (`purchase`), consumos (`sale`), bajas/mermas (`waste`) y ajustes manuales (`adjustment`), con KPIs gerenciales y exportación instantánea a CSV.

### 💵 Turnos de Caja & Arqueos (Cash Shifts)
- **Control estricto de caja**: Apertura obligatoria con fondo inicial antes de facturar.
- **Arqueo y cierre ciego**: Conteo de efectivo real vs. esperado por el sistema según ventas del turno.
- **Detección de descuadres**: Cálculo automático de sobrantes o faltantes con justificación obligatoria y auditoría.

### 📅 Motor de Reservas
- **Agenda de reservas**: Programación de reservas con fecha, hora, comensales, datos de contacto del cliente y mesa asignada.
- **Ciclo de reserva**: Estados configurables (`pending`, `confirmed`, `seated`, `cancelled`, `no_show`).

### 🏢 Multisede & Configuración Fiscal
- **Arquitectura Corporativa**: Jerarquía de empresas (`companies`) con múltiples sedes operativas (`venues`).
- **Parámetros tributarios**: Soporte para régimen común y simplificado, IVA, Impuesto Nacional al Consumo (INC 8%), resoluciones de facturación DIAN con prefijos y rangos autorizados.
- **Tickets configurables**: Encabezados, pies de página y políticas comerciales personalizables por sede.

### 🖨️ Hardware & Ecosistema de Impresión Térmica
- **Impresión en red (TCP/IP puerto 9100)**: Despacho directo de comandas a impresoras térmicas de cocina o barra.
- **Anchos de papel adaptables**: Compatible con formatos estándar de 80 mm y 58 mm.
- **Integración nativa con Zogui Print Bridge**: Conexión con el controlador de escritorio/móvil para impresión RAW ESC/POS sin bloqueos de navegador ni certificados SSL locales.

### 🔐 Seguridad, Roles (RBAC) & PIN Terminal
- **Matriz de roles jerárquicos**: `super_admin` > `manager` > `cashier` > `waiter` > `kitchen` > `kds_display`.
- **Autenticación dual**: Login corporativo con Email y Contraseña + desbloqueo veloz de terminal táctil mediante PIN de 4 dígitos.
- **Seguridad de sesión**: Tokens JWT con versionado (`tokenVersion`) para revocación remota instantánea.
- **Bitácora de auditoría (`audit_logs`)**: Registro inmutable de acciones críticas con dirección IP, agente de usuario y carga útil.

---

## 🏗️ Arquitectura del Monorepo

El proyecto está organizado como un **monorepo modular** impulsado por **Turborepo** y **pnpm workspaces**:

```text
poscocina/
├── apps/
│   ├── server/                     # Backend API & WebSocket Server
│   │   ├── src/
│   │   │   ├── config/             # Variables de entorno validadas con Zod
│   │   │   ├── db/                 # Conexión, schemas Drizzle, migraciones y semillas
│   │   │   ├── modules/            # Vertical slices de dominio de negocio
│   │   │   │   ├── analytics/      # Reportes, ventas y métricas ejecutivas
│   │   │   │   ├── auth/           # Login, PIN, tokens JWT y perfiles
│   │   │   │   ├── billing/        # Facturación, pagos y arqueos de caja
│   │   │   │   ├── catalog/        # Categorías, productos y modificadores
│   │   │   │   ├── company/        # Datos corporativos y fiscales
│   │   │   │   ├── customers/      # CRM y fidelización
│   │   │   │   ├── hardware/       # Controladores e impresoras térmicas
│   │   │   │   ├── health/         # Healthcheck para Docker y Kubernetes
│   │   │   │   ├── inventory/      # Stock, recetas, insumos, compras y proveedores
│   │   │   │   ├── orders/         # Comandas, pedidos y ciclo KDS
│   │   │   │   ├── reservations/   # Motor de reservas
│   │   │   │   ├── tables/         # Planos de salón y mesas
│   │   │   │   └── venues/         # Gestión de sedes/locales
│   │   │   ├── plugins/            # Plugins Fastify (Auth RBAC, Socket.IO, Errors)
│   │   │   ├── services/           # Servicios compartidos (Storage S3/Local, etc.)
│   │   │   ├── index.ts            # Arranque del proceso
│   │   │   └── server.ts           # Configuración del servidor Fastify
│   │   ├── Dockerfile              # Imagen Node 22 Alpine optimizada con pnpm deploy
│   │   └── package.json
│   │
│   └── web/                        # Frontend SPA en React 19 + Vite
│       ├── src/
│       │   ├── components/         # Primitivas UI y navegación global
│       │   ├── features/           # Módulos desacoplados del frontend
│       │   │   ├── auth/           # Pantalla de bloqueo PIN y login
│       │   │   ├── cash-shifts/    # Gestión y arqueo de turnos de caja
│       │   │   ├── catalog/        # Catálogo, escáner y visor 3D
│       │   │   ├── inventory/      # Stock, compras, proveedores y recetas
│       │   │   ├── kds/            # Pantalla de cocina en tiempo real
│       │   │   ├── pos/            # Terminal de toma de comandas y cobro
│       │   │   ├── reports/        # Analítica y reportes de ventas
│       │   │   ├── reservations/   # Calendario y lista de reservas
│       │   │   ├── salon/          # Mapa visual de mesas
│       │   │   ├── settings/       # Configuración del establecimiento
│       │   │   └── users/          # Administración de personal y roles
│       │   ├── hooks/              # Hooks globales (permisos, sockets, router)
│       │   ├── stores/             # Estado global con Zustand (auth, turno)
│       │   ├── App.tsx             # Enrutador principal y layout
│       │   └── main.tsx
│       ├── Dockerfile              # Build Vite + Nginx 1.27 Alpine ligero
│       ├── nginx.conf              # Configuración de Nginx para SPA y reverse proxy
│       └── package.json
│
├── packages/
│   ├── shared/                     # Paquete compartido entre server y web
│   │   ├── src/
│   │   │   ├── constants/          # Constantes de roles, jerarquías y estados
│   │   │   └── schemas/            # Esquemas de validación Zod unificados
│   │   └── package.json
│   └── tsconfig/                   # Configuraciones base de TypeScript
│
├── docker-compose.yml              # Orquestación completa de servicios (Dev / Prod)
├── docker-compose.prod.yml         # Overrides para entornos de producción / Dokploy
├── pnpm-workspace.yaml             # Definición de paquetes del monorepo
├── turbo.json                      # Configuración del pipeline de Turborepo
└── package.json                    # Scripts globales del workspace
```

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología | Descripción |
| :--- | :--- | :--- |
| **Monorepo** | [Turborepo 2.4](https://turbo.build/) + [pnpm 12](https://pnpm.io/) | Cache de compilación remota y gestión de dependencias estricta. |
| **Backend** | [Fastify 5.2](https://fastify.dev/) | Framework Node.js de mínimo overhead y alto rendimiento. |
| **Lenguaje** | [TypeScript 5.8](https://www.typescriptlang.org/) | Tipado estricto extremo de extremo a extremo (E2E). |
| **Base de Datos** | [PostgreSQL 16](https://www.postgresql.org/) + [Drizzle ORM](https://orm.drizzle.team/) | Consultas SQL declarativas con inferencia automática de tipos. |
| **Caché & Sockets** | [Redis 7](https://redis.io/) + [Socket.IO 4.8](https://socket.io/) | Publicación/Suscripción escalable con `@socket.io/redis-adapter`. |
| **Frontend** | [React 19](https://react.dev/) + [Vite 6](https://vite.dev/) | Renderizado concurrente de última generación y HMR instantáneo. |
| **Estilos** | [Tailwind CSS v4](https://tailwindcss.com/) | Motor CSS de última generación sin configuración pesada. |
| **Componentes UI**| [Radix UI](https://www.radix-ui.com/) + [Motion](https://motion.dev/) | Primitivas accesibles sin estilos con animaciones fluidas. |
| **Estado & Datos** | [Zustand 5](https://zustand.docs.pmnd.rs/) + [TanStack Query 5](https://tanstack.com/query) | Gestión atómica de estado en cliente y sincronización asíncrona. |
| **Modelado 3D** | [@google/model-viewer](https://modelviewer.dev/) | Renderizado WebGL inmersivo para platillos en realidad 3D. |
| **Almacenamiento** | AWS S3 SDK (Garage / MinIO / Local) | Gestión de imágenes y modelos 3D tanto en nube como en local. |
| **Contenedores** | [Docker](https://www.docker.com/) + Nginx Alpine | Despliegue reproducible y seguro sin privilegios de root. |

---

## ⚙️ Requisitos Previos

Antes de comenzar, asegúrate de contar con las siguientes herramientas instaladas:

1. **Node.js**: Versión `v22.x` o superior.
2. **pnpm**: Versión `12.x` (se puede habilitar con `corepack enable`).
3. **Docker & Docker Compose**: Para levantar PostgreSQL y Redis en local.

---

## 🚀 Instalación y Puesta en Marcha Local

### 1. Clonar el repositorio
```bash
git clone https://github.com/Julian-Chingal/poscocina.git
cd poscocina
```

### 2. Configurar variables de entorno
Copia la plantilla de variables de entorno:
```bash
cp .env.example .env
```
*(Revisa los valores en `.env`. Los valores predeterminados funcionan de inmediato para entornos locales).*

### 3. Iniciar servicios base con Docker (PostgreSQL y Redis)
```bash
pnpm docker:up
```
> Esto iniciará los contenedores de `poscocina-postgres` (puerto 5432) y `poscocina-redis` (puerto 6379) en segundo plano.

### 4. Instalar dependencias del workspace
```bash
pnpm install
```

### 5. Compilar paquetes compartidos
```bash
pnpm --filter @poscocina/shared build
```

### 6. Ejecutar migraciones de base de datos
Aplica la estructura de tablas a PostgreSQL con Drizzle:
```bash
pnpm db:migrate
```

### 7. Inicializar semilla de datos base (Seed)
Crea los roles del sistema, la empresa por defecto, el venue inicial y el usuario Super Administrador:
```bash
pnpm db:seed
```

### 8. Iniciar el entorno de desarrollo
Puedes iniciar ambos servicios a la vez o de manera individual:

- **Todo el ecosistema (Recomendado)**:
  ```bash
  pnpm dev:all
  ```
- **Solo Backend (Fastify en `http://localhost:3000`)**:
  ```bash
  pnpm dev:server
  ```
- **Solo Frontend (Vite en `http://localhost:5173`)**:
  ```bash
  pnpm dev:web
  ```

Abre tu navegador en `http://localhost:5173` para ingresar al sistema.

---

## 🔑 Credenciales por Defecto

Al ejecutar `pnpm db:seed`, se genera automáticamente la cuenta inicial:

| Campo | Valor por Defecto |
| :--- | :--- |
| **Email** | `admin@poscocina.com` |
| **Contraseña** | `admin123` |
| **PIN Rápido de Terminal** | `1234` |
| **Rol** | `Super Administrador` |

> [!WARNING]
> En entornos de producción debes cambiar inmediatamente esta contraseña y generar un nuevo PIN desde el módulo de **Usuarios**.

---

## 📜 Scripts Disponibles

El archivo raíz [`package.json`](file:///d:/dev/Zogui.cloud/poscocina/package.json) centraliza los comandos más utilizados:

| Comando | Descripción |
| :--- | :--- |
| `pnpm dev:all` | Inicia en paralelo el servidor y el cliente web con recarga en vivo. |
| `pnpm dev:server` | Inicia el backend Fastify con `tsx watch`. |
| `pnpm dev:web` | Inicia el frontend Vite en modo desarrollo. |
| `pnpm build` | Compila todos los paquetes y aplicaciones mediante Turborepo. |
| `pnpm build:web` | Genera la compilación de producción de la SPA en `apps/web/dist`. |
| `pnpm build:server` | Compila el backend en `apps/server/dist`. |
| `pnpm typecheck` | Ejecuta la verificación de tipos TypeScript en todo el monorepo. |
| `pnpm db:generate` | Genera nuevos archivos de migración SQL basados en `schema.ts`. |
| `pnpm db:migrate` | Aplica las migraciones pendientes en la base de datos PostgreSQL. |
| `pnpm db:seed` | Puebla la base de datos con los datos semilla iniciales. |
| `pnpm docker:up` | Levanta los servicios auxiliares definidos en `docker-compose.yml`. |
| `pnpm docker:down` | Detiene y apaga los contenedores Docker. |
| `pnpm docker:logs` | Sigue en vivo los registros de los contenedores Docker. |
| `pnpm clean` | Limpia los directorios `dist` y cachés de Turborepo. |

---

## 🌍 Variables de Entorno

Principales variables configurables en el archivo `.env`:

| Variable | Tipo / Ejemplo | Descripción |
| :--- | :--- | :--- |
| `NODE_ENV` | `development` \| `production` | Modo de ejecución del servidor. |
| `PORT` | `3000` | Puerto de escucha de Fastify. |
| `DATABASE_URL` | `postgresql://posuser:pass@localhost:5432/poscocina` | Cadena de conexión principal a PostgreSQL. |
| `REDIS_URL` | `redis://localhost:6379` | Cadena de conexión para Redis. |
| `JWT_SECRET` | *(string criptográfico >= 32 chars)* | Clave para firma y verificación de tokens JWT. |
| `JWT_EXPIRES_IN` | `12h` | Tiempo de vida de los tokens de sesión. |
| `CORS_ORIGIN` | `http://localhost:5173,http://localhost:3000` | Lista separada por comas de orígenes permitidos. |
| `RUN_MIGRATIONS` | `true` \| `false` | Ejecuta migraciones automáticas al iniciar el contenedor. |
| `RUN_SEED` | `false` \| `true` | Ejecuta el script de semilla al iniciar el contenedor. |
| `STORAGE_BUCKET` | `catastrocol-cargues` | Bucket S3/MinIO para imágenes y modelos 3D. |
| `STORAGE_PATH` | `gastropos` | Subcarpeta o prefijo dentro del bucket de almacenamiento. |
| `GARAGE_S3_ENDPOINT`| `http://garage:3900` | Endpoint de S3/Garage/MinIO (vacío para usar `./uploads`). |
| `GARAGE_ACCESS_KEY_ID` | *(string)* | Llave de acceso S3/Garage. |
| `GARAGE_SECRET_ACCESS_KEY` | *(string)* | Llave secreta S3/Garage. |
| `PUBLIC_STORAGE_URL` | `https://cdn.tudominio.com` | URL pública base para servir archivos multimedia. |

---

## 🐳 Despliegue en Producción (Docker & Dokploy)

El proyecto cuenta con un archivo [`docker-compose.yml`](file:///d:/dev/Zogui.cloud/poscocina/docker-compose.yml) listo para producción, compuesto por 4 servicios aislados en su propia red interna `poscocina-network`:

1. **`poscocina-postgres`**: Base de datos PostgreSQL 16 con volumen persistente (`postgres_data`).
2. **`poscocina-redis`**: Servidor Redis 7 con persistencia AOF (`redis_data`).
3. **`poscocina-server`**: Backend Fastify construido con imagen *multi-stage* y usuario sin privilegios (`node`).
4. **`poscocina-client`**: Frontend Nginx que sirve el bundle estático compilado y actúa de proxy reverso hacia el backend.

### Despliegue con Docker Compose
```bash
# 1. Configurar variables de producción en .env
cp .env.example .env

# 2. Levantar la infraestructura completa con build
docker compose up -d --build

# 3. Monitorear los logs de inicio y migraciones automáticas
docker compose logs -f
```

El cliente web quedará disponible en el puerto `8080` (o el que definas en `CLIENT_PORT`), canalizando las llamadas a la API internamente hacia el backend sin exponer puertos sensibles de base de datos a internet.

---

## 🤝 Integración con Zogui Print Bridge

Para resolver las restricciones de seguridad inherentes a los navegadores web (pérdida de permisos WebUSB al cerrar pestañas, imposibilidad de abrir sockets TCP crudos hacia impresoras de cocina en `192.168.1.x:9100`), **Poscocina** se complementa de forma nativa con [**Zogui Print Bridge (controladorimpresora)**](file:///d:/dev/Zogui.cloud/controladorimpresora/README.md).

- **¿Cómo funciona?**:
  - `controladorimpresora` es una aplicación nativa en Flutter que corre como servicio de fondo en Windows o Android.
  - Expone un servidor local HTTP/WebSocket en el puerto `8080` con soporte completo de CORS.
  - La terminal web de **poscocina** envía la comanda o precuenta en formato binario o texto ESC/POS directamente al puente local, el cual la imprime de inmediato, corta el papel y dispara la apertura de cajón monedero sin intervención manual del operador.

---

## 📄 Licencia

Este software es propiedad privada y confidencial de **Zogui.cloud**. Prohibida su copia, distribución o modificación no autorizada.
