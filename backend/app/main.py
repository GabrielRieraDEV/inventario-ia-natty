"""Punto de entrada de la API (FastAPI).

Expone la lógica de negocio como API REST y agrupa los módulos del sistema
(auth, categorías, productos, movimientos, alertas, reportes y el flujo de
captura por QR con reconocimiento IA).
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app import __version__
from app.config import get_settings
from app.routers import (
    alertas,
    auth,
    categorias,
    movimientos,
    productos,
    reportes,
    sesiones,
    usuarios,
)

app = FastAPI(
    title="Inventario IA — Bodegón Pa' Donde Natty",
    description="API de control de inventarios con reconocimiento de productos por IA.",
    version=__version__,
)

settings = get_settings()
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(categorias.router)
app.include_router(productos.router)
app.include_router(movimientos.router)
app.include_router(alertas.router)
app.include_router(reportes.router)
app.include_router(sesiones.router)
app.include_router(usuarios.router)


@app.get("/")
def root() -> dict:
    return {"servicio": "inventario-ia-natty", "version": __version__, "estado": "ok"}


@app.get("/health")
def health() -> dict:
    return {"status": "healthy"}
