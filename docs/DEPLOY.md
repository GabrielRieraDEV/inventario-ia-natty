# Guía de despliegue

Sistema de inventario con IA — Bodegón Pa' Donde Natty. Despliegue en **capa
gratuita**: base de datos en Supabase, backend en Render, frontend en Vercel.

> Orden recomendado: **1) Supabase → 2) Backend (Render) → 3) Frontend (Vercel)**.
> El frontend necesita la URL del backend, y el backend necesita la de Supabase.

---

## 1. Base de datos (Supabase)

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. **SQL Editor** → pega y ejecuta `backend/schema.sql` (esquema completo: tablas,
   la vista de stock, la tabla de sesiones de captura, las categorías semilla y el
   **bucket público `productos`** para las fotos).
3. **Project Settings → API**, copia:
   - `Project URL` → será `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL`.
   - La clave **secret** (`sb_secret_…`) → `SUPABASE_KEY` (backend).
   - La clave **publishable** (`sb_publishable_…`) → `NEXT_PUBLIC_SUPABASE_ANON_KEY` (frontend).

> Las claves nuevas requieren `supabase>=2.31` (ya fijado en `requirements.txt`).

---

## 2. Backend (Render)

El repo incluye `render.yaml` (Blueprint), así que Render configura casi todo solo.

1. En [render.com](https://render.com): **New → Blueprint** y selecciona este repo.
2. Render detecta `render.yaml` y crea el servicio `inventario-ia-natty-api`
   (root `backend/`, arranque `uvicorn app.main:app --host 0.0.0.0 --port $PORT`).
3. Completa las variables marcadas como secretas (Environment):
   - `SUPABASE_URL`, `SUPABASE_KEY` (la **secret**), `GEMINI_API_KEY`.
   - `CORS_ORIGINS` → de momento `http://localhost:3000`; lo actualizarás con el
     dominio de Vercel en el paso 3.
   - `JWT_SECRET` lo genera Render automáticamente; `GEMINI_MODEL`, `APP_ENV` y
     `PYTHON_VERSION` ya vienen del Blueprint.
4. Deploy. Verifica `https://<tu-servicio>.onrender.com/health` → `{"status":"healthy"}`.
5. **Siembra inicial** (una sola vez): desde tu PC, con `backend/.env` apuntando a
   la misma base de Supabase, ejecuta:
   ```bash
   cd backend && python seed.py
   ```
   Crea el admin (`admin@padondenatty.com` / `admin1234`) y datos de ejemplo.
   **Cambia esa contraseña tras el primer ingreso.**

> Nota: el plan gratuito de Render "duerme" el servicio tras inactividad; la
> primera petición tras dormir tarda ~30 s en responder.

---

## 3. Frontend (Vercel)

1. En [vercel.com](https://vercel.com): **Add New → Project** e importa el repo.
2. **Root Directory → `frontend`** (es un monorepo; Vercel autodetecta Next.js).
3. Environment Variables:
   - `NEXT_PUBLIC_API_URL` = URL del backend en Render (sin barra final).
   - `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (la **publishable**).
4. Deploy. Anota el dominio (p. ej. `https://inventario-ia-natty.vercel.app`).
5. **Cierra el círculo de CORS:** vuelve a Render y pon ese dominio en
   `CORS_ORIGINS` (puedes listar varios separados por coma). Redeploy del backend.

---

## 4. Comprobación end-to-end

- [ ] `GET /health` del backend responde `healthy`.
- [ ] Login en el frontend con el admin sembrado.
- [ ] Dashboard, inventario y reportes cargan datos.
- [ ] **Flujo QR**: en "Vincular teléfono" se genera el QR; al escanearlo con un
      teléfono (¡requiere HTTPS, que Vercel ya da!) se abre la cámara, la foto se
      reconoce y la PC navega a la pantalla de confirmación.
- [ ] Configuración → "Exportar inventario / movimientos" descarga el CSV.
- [ ] Crear una salida mayor al stock devuelve error (no deja stock negativo).

---

## Variables de entorno (resumen)

### Backend (Render)
| Variable | Ejemplo / valor | Notas |
|---|---|---|
| `SUPABASE_URL` | `https://xxxx.supabase.co` | |
| `SUPABASE_KEY` | `sb_secret_…` | clave **secret/service_role** |
| `GEMINI_API_KEY` | `AIza…` | Google AI Studio |
| `GEMINI_MODEL` | `gemini-2.5-flash` | no usar 2.0-flash (cuota 0) |
| `JWT_SECRET` | (autogenerado) | cadena larga aleatoria |
| `JWT_EXPIRE_MINUTES` | `480` | duración del token |
| `CORS_ORIGINS` | `https://…vercel.app` | dominios del frontend, por coma |
| `SESION_TTL_MINUTOS` | `30` | validez del QR de captura |
| `VENCIMIENTO_DIAS_ALERTA` | `30` | anticipación de la alerta por vencer |

### Frontend (Vercel)
| Variable | Ejemplo / valor | Notas |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | `https://…onrender.com` | sin barra final |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxx.supabase.co` | |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_…` | clave **publishable** |
