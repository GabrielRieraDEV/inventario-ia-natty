# Sistema de Digitalización y Registro de Productos con IA — Bodegón Pa' Donde Natty

Prototipo funcional de un **sistema de control de inventarios con reconocimiento de productos por Inteligencia Artificial** para el Bodegón Pa' Donde Natty C.A. (Ciudad Bolívar, Estado Bolívar, Venezuela).

Este repositorio acompaña el **Trabajo Especial de Grado (TEG)** de Gabriel Riera, Escuela de Ingeniería en Informática — Universidad Nororiental Privada Gran Mariscal de Ayacucho. El documento completo está en [`docs/TEG.tex`](docs/TEG.tex).

---

## ¿Qué hace el sistema?

El operario **toma una foto del producto con el teléfono** (vinculado por código QR a la sesión de la PC); un **modelo de lenguaje multimodal** lo identifica automáticamente, y el sistema **registra el movimiento de inventario en tiempo real**. Sustituye un proceso manual de 4 a 6 horas por ciclo y elimina la discrepancia entre el inventario físico y el registrado.

### Módulos (derivados de los requerimientos funcionales del TEG)

| Código | Módulo | Función |
|--------|--------|---------|
| RF-01 | Reconocimiento IA + captura móvil (QR) | Identifica el producto desde la foto y lo registra |
| RF-02 | Gestión de stock y movimientos | Entradas/salidas; el stock es un dato derivado y auditable |
| RF-03 | Alertas de inventario | Stock mínimo y productos próximos a vencer |
| RF-04 | Consulta de inventario | Búsqueda por nombre, categoría o código |
| RF-05 | Reportes gerenciales | KPIs: existencias, rotación, movimientos |
| RF-06 | Catálogo y categorías | Altas, modificaciones y bajas |
| RF-07 | Autenticación y usuarios | Inicio de sesión y control de acceso |
| RF-08 | Panel general (dashboard) | Indicadores y alertas más relevantes |
| RF-09 | Respaldo y configuración | Exportación de datos y parámetros del sistema |

---

## Arquitectura

Arquitectura modular de **tres capas** con frontend y backend desacoplados:

```
┌─────────────────────────┐      ┌─────────────────────────┐
│  Presentación (Next.js)  │      │  Captura móvil (Next.js) │
│  PC — gestión completa   │◄──QR─┤  Teléfono — solo cámara  │
└───────────┬─────────────┘      └────────────┬────────────┘
            │  REST (la PC sondea la sesión)   │
            ▼                                  ▼
        ┌───────────────────────────────────────────┐
        │     Lógica de negocio (Python / FastAPI)   │
        │  ┌─────────────────────────────────────┐   │
        │  │ Cliente de reconocimiento (multimodal)│──┼──► API IA (Gemini)
        │  └─────────────────────────────────────┘   │
        └───────────────────┬───────────────────────┘
                            ▼
                ┌───────────────────────────┐
                │ Persistencia (PostgreSQL)  │
                │ Supabase                   │
                └───────────────────────────┘
```

### Stack tecnológico

- **Backend:** Python · [FastAPI](https://fastapi.tiangolo.com/) (API REST) — desplegado en Render
- **Frontend:** [Next.js](https://nextjs.org/) — desplegado en Vercel
- **Base de datos:** PostgreSQL gestionado por [Supabase](https://supabase.com/)
- **Reconocimiento IA:** modelo de lenguaje multimodal **Google Gemini** consumido vía API (capa gratuita)
- **Despliegue:** capa gratuita (Vercel + Render + Supabase)

El reconocimiento **no entrena un modelo propio**: delega la visión en un servicio multimodal de propósito general guiado por *prompt engineering*, lo que reduce costo y complejidad (ver Cap. II y IV del TEG).

---

## Estructura del repositorio

```
inventario-ia-natty/
├── backend/          # API FastAPI (lógica de negocio + cliente de IA)
├── frontend/         # Aplicación Next.js (PC + vista móvil de captura)
├── docs/
│   ├── TEG.tex       # Trabajo Especial de Grado (fuente LaTeX)
│   ├── DEPLOY.md     # Guía de despliegue (Supabase + Render + Vercel)
│   └── uploads/      # Figuras del TEG (capturas del sistema, diagramas)
├── render.yaml       # Blueprint de despliegue del backend en Render
└── README.md
```

---

## Puesta en marcha (desarrollo local)

> Estado: **prototipo funcional completo** — los 9 módulos (RF-01…RF-09) están implementados y probados end-to-end. Para publicarlo, ver [`docs/DEPLOY.md`](docs/DEPLOY.md).

### Requisitos
- Python 3.12+
- Node.js 20+
- Una cuenta de [Supabase](https://supabase.com) (gratuita)
- Una clave de API de [Google AI Studio](https://aistudio.google.com/) para Gemini (gratuita)

### Backend
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate   |   Linux/Mac: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env      # completar credenciales
uvicorn app.main:app --port 8003   # ver gotcha de puertos en CLAUDE.md
```

> Primera vez: ejecuta `backend/schema.sql` en el SQL Editor de Supabase y luego `python seed.py` (crea el admin y datos de ejemplo).

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local  # completar credenciales
npm run dev
```

---

## Criterios de validación (del TEG)

| Requisito | Umbral | Estado |
|-----------|--------|--------|
| RT-03 — Tiempo de respuesta del reconocimiento | ≤ 3 s | ✔ ~2 s (medido) |
| RT-04 — Exactitud del reconocimiento | ≥ 90 % | ✔ ~95 % (medido) |
| Cumplimiento de requerimientos funcionales | 100 % | ✔ RF-01…RF-09 |

---

## Licencia

Proyecto académico — Trabajo Especial de Grado. Uso educativo.

© 2026 Gabriel Riera.
