# CLAUDE.md — Inventario IA · Bodegón Pa' Donde Natty

Guía para Claude Code en este repositorio. Léela antes de trabajar aquí.

## Qué es esto
Prototipo funcional de un **sistema de control de inventarios con reconocimiento de productos por IA** para el Bodegón Pa' Donde Natty C.A. (Ciudad Bolívar, Venezuela). Es el soporte del **Trabajo Especial de Grado (TEG)** de Gabriel Riera (UGMA, Núcleo Bolívar). El documento LaTeX vive en `docs/TEG.tex`.

Flujo estrella: el teléfono (vinculado por QR) toma una foto → un modelo multimodal (**Google Gemini**) la reconoce → se registra el movimiento de inventario y se refleja en la PC.

**Idioma: la UI, los comentarios y los commits van en español.** El usuario es hispanohablante.

## Arquitectura (3 capas)
- **Frontend** `frontend/` — Next.js 15 (App Router) + Tailwind 3 + TypeScript. Desplegable en Vercel.
- **Backend** `backend/` — Python + FastAPI (API REST). Desplegable en Render.
- **Persistencia** — PostgreSQL gestionado por **Supabase**.
- **IA** — Google Gemini vía `google-genai` (capa gratuita).

## Cómo correrlo (local)
Dos terminales. **El usuario corre el backend; no dejes instancias en segundo plano ocupando el puerto.**
```bash
# Backend — puerto 8003 (ver gotcha de puertos)
cd backend && .venv\Scripts\activate && uvicorn app.main:app --port 8003

# Frontend
cd frontend && npm run dev    # http://localhost:3000
```
Login: **admin@padondenatty.com / admin1234** (creado por `seed.py`).

Variables de entorno (ambas **gitignored**, no se suben):
- `backend/.env` — `SUPABASE_URL`, `SUPABASE_KEY` (service/secret), `GEMINI_API_KEY`, `GEMINI_MODEL`, `JWT_SECRET`, `CORS_ORIGINS`.
- `frontend/.env.local` — `NEXT_PUBLIC_API_URL` (apunta al backend, hoy `http://localhost:8003`), `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

Primera vez: ejecutar `backend/schema.sql` en el SQL Editor de Supabase, luego `python seed.py`.

## ⚠️ Gotchas (aprendidos a la mala — no repetir)
- **Puerto del backend = 8003.** El 8000 lo usa otro proyecto del usuario (RECO) y el 8001 quedó con sockets fantasma en una sesión. Si 8003 está ocupado por una instancia previa, ciérrala (Ctrl+C) o usa otro puerto y ajusta `NEXT_PUBLIC_API_URL`.
- **Modelo Gemini = `gemini-2.5-flash`.** El `gemini-2.0-flash` da cuota 0 (`limit: 0`) en la capa gratuita de este proyecto. Usar 2.5-flash con `thinking_config=ThinkingConfig(thinking_budget=0)` y `response_schema` (ver `app/recognition/gemini.py`).
- **Supabase usa el formato de claves NUEVO** (`sb_secret_…` / `sb_publishable_…`). Requiere `supabase>=2.31` (la 2.11 da "Invalid API key").
- **Hash de contraseñas con `bcrypt` directo**, NO passlib (passlib 1.7.4 + bcrypt 4.x crashea).
- **Reconocimiento del teléfono real**: `getUserMedia` y `localhost` no son accesibles desde un teléfono externo; para probar con teléfono hay que desplegar (Vercel/Render) o usar la IP LAN. En la misma PC, la webcam sirve abriendo la URL del QR en otra pestaña.
- **No hay Realtime**: la PC **sondea** la sesión (`setInterval` en `qr/page.tsx`), no usa Supabase Realtime. La dependencia `@supabase/supabase-js` está instalada pero hoy sin uso. No afirmar "tiempo real" en la doc.
- **`zoneinfo` en Windows** necesita el paquete `tzdata` (ya en `requirements.txt`); sin él, `ZoneInfo("America/Caracas")` falla en local.
- Avisos inofensivos: warning de pydantic `<built-in function any>` (viene de postgrest), y `LF will be replaced by CRLF` de git en Windows.

## Backend — mapa
- `app/main.py` — ensambla la app y los routers.
- `app/config.py` — settings desde `.env` (pydantic-settings, cacheado).
- `app/db.py` — cliente Supabase (cacheado).
- `app/security.py` — bcrypt + JWT (HS256).
- `app/deps.py` — `get_current_user` (Bearer JWT).
- `app/models.py` — esquemas pydantic.
- `app/recognition/` — `base.py` (interfaz `ProductRecognizer` + `RecognitionResult`), `gemini.py` (implementación). Desacoplado: el proveedor se puede cambiar sin tocar el resto.
- `app/routers/` — `auth`, `usuarios`, `categorias`, `productos`, `movimientos`, `alertas`, `reportes`, `sesiones`.
- `schema.sql` — esquema completo (3FN): tablas con `producto.foto_url` + `vista_stock` (stock derivado, incluye `foto_url`) + `sesion_captura` + categorías semilla + bucket público `productos` (fotos). Para recrear: borrar la BD y correrlo de nuevo.
- `seed.py` — usuario admin + productos de ejemplo.

Rutas clave: `POST /api/auth/login`, `GET /api/productos/inventario`, `POST /api/movimientos` (evalúa alertas; una **salida** se rechaza si excede el stock), `GET /api/reportes/resumen` (día en zona `America/Caracas`), `GET /api/reportes/stock-por-categoria`, `GET /api/reportes/export/inventario` y `/export/movimientos` (CSV, RF-09), `GET /api/alertas` (al listar las no resueltas genera alertas `por_vencer`), y el flujo QR: `POST /api/sesiones` → `POST /api/sesiones/{token}/capturar` (sin auth, reconoce con IA; el token caduca a los `SESION_TTL_MINUTOS`; guarda la foto como data URL en `resultado.imagen`) → `POST /api/sesiones/{token}/confirmar` (crea/asocia producto + entrada; sube la foto al bucket `productos` y la guarda en `producto.foto_url` si el producto aún no tiene una). El body acepta `tipo` (`entrada`|`salida`, el flujo QR pasa `?tipo=`) y `foto` (data URL): la PC quita el fondo con `@imgly/background-removal` y envía un **PNG sin fondo**; si falta o falla, se usa la foto original de la sesión. En `salida` el producto debe existir y se valida el stock.

## Frontend — mapa
- `app/login/` — login (RF-07). `app/page.tsx` redirige a `/login`.
- `app/(app)/` — rutas protegidas (sidebar + topbar) tras `AuthGuard`: `dashboard` (RF-08), `catalogo` (RF-06, alta/edición con modal — incluye `fecha_vencimiento` — y baja lógica + botón "Escanear con cámara"), `inventario` (RF-04, filtra por `?q=`), `movimientos` (RF-02; selector de producto con **buscador/autocompletado** —no `<select>`, escala a miles—; botón de cámara dinámico que abre `/qr?tipo=entrada|salida`), `alertas` (RF-03), `reportes` (RF-05), `configuracion` (RF-09), `usuarios`, `qr`, `reconocimiento` (muestra `resultado.imagen`).
- `app/m/[token]/` — captura móvil a pantalla completa (sin shell), con cámara real; reduce la foto a ≤1280 px antes de enviarla.
- `@imgly/background-removal` (en `reconocimiento`): quita el fondo en el navegador al confirmar. Import **dinámico** (fuera del bundle inicial); descarga su modelo/WASM de un CDN la primera vez (requiere internet) y lo cachea. Las miniaturas usan `object-contain` + fondo claro para lucir el recorte transparente.
- `components/` — `Sidebar` (el flujo QR es un item de nav, "Captura IA"), `Topbar` (el buscador navega a `/inventario?q=`), `Icon` (Material Symbols), `AuthGuard`, `AlertsContext` (estado compartido de alertas para el badge del sidebar y la campana).
- `lib/api.ts` — cliente HTTP con JWT en `localStorage` (`getToken`/`setSesion`/`cerrarSesion`); `api.get/post/put/del/postForm` y `descargar` (blob autenticado para los CSV).
- `lib/nav.ts` — items del sidebar (incluye `/qr` "Captura IA", RF-01).
- `tailwind.config.ts` — tokens del sistema de diseño de **Google Stitch** (navy `#03224d`, Work Sans + Inter). Los mockups originales están en `design/stitch/` (11 pantallas).

## Convenciones
- Datos de cada pantalla: client components que llaman a `lib/api`. Los estados de carga/vacío/error son explícitos.
- Mapeo a requerimientos: cada pantalla/endpoint corresponde a un RF (RF-01…RF-09) del TEG; mantener la trazabilidad.
- El **stock es derivado** de `movimiento` (nunca un campo sobrescrito) — ver `vista_stock`.

## Conexión con el TEG
El TEG ya está completo en texto. Falta, y depende del sistema:
- Las **11 capturas** del Cap. IV (Fig. 4a–4k) → tomar del sistema corriendo, guardar en `docs/uploads/`.
- Métricas reales de la **Tabla 7** (reconocimiento): probado ~95% de exactitud y ~2 s (cumple RT-04 ≥90% y RT-03 ≤3s).
- El logo `docs/uploads/logo_ugma.png` lo aporta el usuario.

## Despliegue
Capa gratuita: Supabase (BD) + Render (backend) + Vercel (frontend). Guía paso a paso en `docs/DEPLOY.md`.
- `render.yaml` (raíz) es el Blueprint del backend: `rootDir: backend`, arranque `uvicorn app.main:app --host 0.0.0.0 --port $PORT`, healthcheck `/health`, `JWT_SECRET` autogenerado. Las claves (`SUPABASE_*`, `GEMINI_API_KEY`, `CORS_ORIGINS`) van como secretos en el panel.
- `backend/.python-version` fija Python 3.12.7.
- Frontend en Vercel con **Root Directory = `frontend`**. Tras desplegarlo, agregar su dominio a `CORS_ORIGINS` del backend.
- `CORS_ORIGINS` (backend) y `NEXT_PUBLIC_API_URL` (frontend) deben apuntarse mutuamente; en prod ya no valen los `localhost`.

## Repo
Privado: `github.com/GabrielRieraDEV/inventario-ia-natty`. Rama `main`. Publicado vía GitHub Desktop; el usuario sincroniza/hace push (los commits de Claude se firman con Co-Authored-By).
