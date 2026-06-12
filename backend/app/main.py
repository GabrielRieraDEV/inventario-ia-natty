"""Punto de entrada de la API (FastAPI).

Expone la lógica de negocio como API REST. En esta fase inicial incluye el
chequeo de salud y el endpoint de reconocimiento (RF-01). Los demás módulos
(stock, alertas, catálogo, reportes, auth) se incorporan de forma incremental.
"""

import time

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app import __version__
from app.config import Settings, get_settings
from app.recognition import ProductRecognizer
from app.recognition.gemini import GeminiRecognizer

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


def get_recognizer(settings: Settings = Depends(get_settings)) -> ProductRecognizer:
    """Provee el reconocedor configurado (Gemini por defecto)."""
    if not settings.gemini_api_key:
        raise HTTPException(
            status_code=503,
            detail="GEMINI_API_KEY no configurada. Revisa el archivo .env.",
        )
    return GeminiRecognizer(settings.gemini_api_key, settings.gemini_model)


@app.get("/")
def root() -> dict:
    return {"servicio": "inventario-ia-natty", "version": __version__, "estado": "ok"}


@app.get("/health")
def health() -> dict:
    return {"status": "healthy"}


@app.post("/api/recognize")
async def recognize(
    file: UploadFile = File(...),
    recognizer: ProductRecognizer = Depends(get_recognizer),
) -> dict:
    """Reconoce un producto a partir de una imagen capturada (RF-01)."""
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="El archivo debe ser una imagen.")

    image_bytes = await file.read()
    started = time.perf_counter()
    result = await recognizer.recognize(image_bytes, file.content_type)
    elapsed = round(time.perf_counter() - started, 3)

    # RT-03: el tiempo de respuesta del reconocimiento debe ser ≤ 3 s.
    return {"producto": result.model_dump(), "tiempo_respuesta_s": elapsed}
