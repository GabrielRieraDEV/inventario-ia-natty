---
title: Inventario IA Natty API
emoji: 📦
colorFrom: blue
colorTo: indigo
sdk: docker
app_port: 7860
pinned: false
---

# Inventario IA — Backend (FastAPI)

API REST del sistema de inventario con reconocimiento de productos por IA del
Bodegón Pa' Donde Natty. Este `README.md` lleva los metadatos que **Hugging Face
Spaces** necesita (tipo Docker, puerto 7860); el resto de la documentación está
en el repositorio raíz (`../README.md` y `../CLAUDE.md`).

## Variables de entorno (Secrets del Space)
`SUPABASE_URL`, `SUPABASE_KEY` (clave secret), `GEMINI_API_KEY`,
`GEMINI_MODEL` (`gemini-2.5-flash`), `JWT_SECRET`, `JWT_EXPIRE_MINUTES`,
`CORS_ORIGINS`, `SESION_TTL_MINUTOS`, `VENCIMIENTO_DIAS_ALERTA`.

Comprobación: `GET /health` → `{"status":"healthy"}`.
