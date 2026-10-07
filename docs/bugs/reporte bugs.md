# Reporte de Incidencias: Módulo de Carga Multimedia (2D / 3D)

**Severidad global:** Alta  
**Entorno:** Producción / Staging (`poscocina.redcasa.site`)  
**Estado:** ✅ **TODOS LOS PUNTOS RESUELTOS Y CORREGIDOS**  
**Impacto previo:** Bloqueo en la creación de activos 3D y degradación severa de UX/visualización en activos 2D.

---

### Bug 1: Fallo crítico en endpoint de subida 3D (`400 Bad Request`)
* **Severidad:** Bloqueante (Critical / Blocker)
* **Componente:** Backend API / Módulo 3D
* **Endpoint afectado:** `POST /api/catalog/upload-base64`
* **Estado:** ✅ **RESUELTO**
* **Causa técnica identificada:**
  1. El cliente frontend enviaba `{ base64Data: ... }` mientras que el controlador backend exigía estrictamente `{ dataUrl: ... }`, rechazando la petición inmediatamente con `400 Bad Request`.
  2. Límite de carga de Fastify (`bodyLimit`) en valor por defecto de 1 MB, bloqueando imágenes en alta resolución y modelos base64.
  3. Expresión regular rígida que fallaba ante saltos de línea (`\r\n`), parámetros charset en el data URI o base64 crudo.
* **Solución aplicada:**
  * En `catalog.controller.ts`: Soporte polimórfico de campos (`dataUrl`, `base64Data`, `base64`, `data`, `image`), desinfección de espacios en blanco y saltos de línea, detección flexible de cabeceras data URI o base64 puro, y derivación automática de extensiones (`.jpeg`, `.png`, `.webp`, `.glb`).
  * En `server.ts` y `catalog.routes.ts`: Configurado `bodyLimit: 50MB` para Fastify, el parser JSON y la ruta `/api/catalog/upload-base64`.
  * En `catalog.api.ts`: Envío dual de `dataUrl` y `base64Data`.

---

### Bug 2: Fallo de renderizado en imagen 2D (Imagen rota tras subida exitosa)
* **Severidad:** Alta
* **Componente:** Frontend / Almacenamiento estático / Proxy Nginx & Vite
* **URL de recurso:** `GET /uploads/gastropos/images/{id}.jpeg` (Retornaba `200 OK`)
* **Estado:** ✅ **RESUELTO**
* **Causa técnica identificada:**
  * `nginx.conf` (y `vite.config.ts`) no tenían configurada la regla de reverse proxy para `/uploads/`. Al solicitar `/uploads/...`, la petición caía en la regla fallback SPA de Nginx/Vite (`try_files $uri $uri/ /index.html`), devolviendo `index.html` con `Content-Type: text/html` y status `200 OK`. La etiqueta `<img>` fallaba al intentar decodificar HTML como imagen JPEG, mostrando el ícono de imagen rota.
* **Solución aplicada:**
  * En `apps/web/nginx.conf`: Agregada la directiva `location /uploads/ { proxy_pass http://poscocina-server:3000/uploads/; ... }` con encabezados CORS y Cross-Origin-Resource-Policy.
  * En `apps/web/vite.config.ts`: Agregado el proxy para `'/uploads'` hacia `http://localhost:3000`.
  * En `apps/server/src/server.ts`: Registrado `@fastify/static` con `setHeaders` (`Access-Control-Allow-Origin: *`, `Cross-Origin-Resource-Policy: cross-origin`, y `Cache-Control`).
  * En `storage.service.ts`: Manejo consistente de extensiones según el MIME type (`image/jpeg` -> `.jpeg`).

---

### Bug 3: Interferencia de scripts externos (Cloudflare Insights / Beacon)
* **Severidad:** Media
* **Componente:** Frontend / Infraestructura
* **URL afectada:** `https://static.cloudflareinsights.com/beacon.min.js/...`
* **Estado:** ✅ **RESUELTO**
* **Causa técnica identificada:**
  * El script inyectado por Cloudflare Web Analytics arrojaba excepciones globales de red o promesas no capturadas al ser bloqueado por extensiones o políticas estrictas del navegador.
* **Solución aplicada:**
  * En `apps/web/index.html`: Implementado un escudo protector de aislamiento en el `<head>` que captura y detiene la propagación de excepciones y rechazos no controlados de promesas originados por `cloudflareinsights` y `beacon.min.js`, garantizando que ningún script de terceros interrumpa la app ni los event listeners.

---

### UX/UI 4: Experiencia de usuario invasiva y saturada en el cargador 3D
* **Severidad:** Media / Usabilidad (UX)
* **Componente:** Modal / Canvas de captura 3D
* **Estado:** ✅ **RESUELTO**
* **Solución aplicada:**
  * Implementado **Modo Foco (Focus Mode)** activado por defecto con conmutador en la barra superior.
  * Oculta banners secundarios, textos de ayuda no esenciales y avisos de dispositivo para liberar el 100% del área de captura.
  * Fondo oscuro inmersivo (`bg-black/98`) con visor maximizado y controles HUD flotantes no invasivos.
  * Al activarse el escáner, la vista previa de fondo queda completamente atenuada sin competir por atención visual.

---

### UX/UI 5: Guía de alineación distorsionada e interactividad nula en navegador
* **Severidad:** Alta (Afecta la calidad del catálogo)
* **Componente:** Canvas de encuadre / Guía de referencia
* **Estado:** ✅ **RESUELTO**
* **Solución aplicada:**
  1. **Aspect Ratio Vectorial Corregido:** Se implementó el componente `AlignmentGuide` con `preserveAspectRatio="xMidYMid meet"` y contenedor `aspect-square`.
     * **Paso 0 (0° Mesa):** Horizonte de mesa nivelado, silueta de plato y burbuja horizontal.
     * **Paso 1 (45° Inclinación):** Proyección elíptica isométrica exacta con relación angular $\sin(45^\circ)$.
     * **Paso 2 (90° Cenital):** Círculo geométrico perfecto (1:1) con diana central y retícula que nunca se deforma en pantallas panorámicas.
  2. **Herramienta de Alineación Interactiva (Reencuadre):**
     * Al subir un archivo desde el navegador o seleccionar cualquier toma de la galería, se abre el lienzo interactivo.
     * Controles interactivos de **Zoom / Escala** (0.5x a 3.0x), **Rotación** (-180° a 180° con giros rápidos de 90°), y **Arrastre / Desplazamiento (Pan)** con mouse o pantalla táctil.
     * Botón de **Confirmar Encuadre**: renderiza y rasteriza la imagen transformada en un canvas antes de almacenarla.

---

### UX/UI 6: Modal invasivo de medidas tras previsualización
* **Severidad:** Menor / Fricción de flujo (UX)
* **Componente:** Flujo de configuración de producto
* **Estado:** ✅ **RESUELTO**
* **Solución aplicada:**
  * Se implementó la verificación de medidas existentes (`hasValidDimensions`). Si el producto ya cuenta con diámetro y altura configurados, el flujo omite automáticamente el paso obligatorio de medidas y avanza directamente a la **Previsualización (Paso 5)**.
  * En la pantalla de previsualización se agregó un botón secundario discreto: `Modificar Dimensiones 📐`. Al pulsarlo, despliega un panel rápido desplegable sin forzar modales emergentes ni interrumpir el flujo del usuario.