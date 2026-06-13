"""Sesiones de captura móvil vinculadas por QR (RF-01).

Flujo:
  1. La PC crea una sesión (POST /api/sesiones) y muestra el token en un QR.
  2. El teléfono abre /m/{token}, captura la foto y la envía a
     POST /api/sesiones/{token}/capturar (sin requerir login: el token es el secreto).
  3. El backend reconoce el producto con el modelo multimodal y escribe el
     resultado en la sesión; la PC lo refleja por Realtime/consulta.
"""

import time

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel

from app.config import Settings, get_settings
from app.db import get_client
from app.deps import CurrentUser, get_current_user
from app.recognition import ProductRecognizer
from app.recognition.gemini import GeminiRecognizer

router = APIRouter(prefix="/api/sesiones", tags=["sesiones"])


def get_recognizer(settings: Settings = Depends(get_settings)) -> ProductRecognizer:
    if not settings.gemini_api_key:
        raise HTTPException(503, "GEMINI_API_KEY no configurada.")
    return GeminiRecognizer(settings.gemini_api_key, settings.gemini_model)


@router.post("", status_code=201)
def crear_sesion(_: CurrentUser = Depends(get_current_user)) -> dict:
    """La PC crea una sesión de captura y obtiene su token (para el QR)."""
    res = get_client().table("sesion_captura").insert({"estado": "pendiente"}).execute()
    return {"token": res.data[0]["token"]}


@router.get("/{token}")
def estado_sesion(token: str, _: CurrentUser = Depends(get_current_user)) -> dict:
    """Consulta el estado/resultado de la sesión (respaldo si no hay Realtime)."""
    res = (
        get_client()
        .table("sesion_captura")
        .select("*")
        .eq("token", token)
        .limit(1)
        .execute()
    )
    if not res.data:
        raise HTTPException(404, "Sesión no encontrada.")
    return res.data[0]


@router.post("/{token}/capturar")
async def capturar(
    token: str,
    file: UploadFile = File(...),
    recognizer: ProductRecognizer = Depends(get_recognizer),
) -> dict:
    """El teléfono envía la imagen; se reconoce y se guarda en la sesión (RF-01)."""
    client = get_client()
    sesion = client.table("sesion_captura").select("token").eq("token", token).execute()
    if not sesion.data:
        raise HTTPException(404, "Sesión no encontrada o expirada.")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "El archivo debe ser una imagen.")

    image_bytes = await file.read()
    started = time.perf_counter()
    result = await recognizer.recognize(image_bytes, file.content_type)
    elapsed = round(time.perf_counter() - started, 3)

    resultado = {"producto": result.model_dump(), "tiempo_respuesta_s": elapsed}
    client.table("sesion_captura").update(
        {"estado": "reconocido", "resultado": resultado}
    ).eq("token", token).execute()
    return resultado


class ConfirmarIn(BaseModel):
    cantidad: int = 1
    nombre: str | None = None  # permite corregir el nombre reconocido


@router.post("/{token}/confirmar")
def confirmar(
    token: str, body: ConfirmarIn, user: CurrentUser = Depends(get_current_user)
) -> dict:
    """Confirma el reconocimiento: busca/crea el producto y registra la entrada (RF-01/02)."""
    client = get_client()
    ses = (
        client.table("sesion_captura").select("resultado").eq("token", token).execute()
    )
    if not ses.data or not ses.data[0].get("resultado"):
        raise HTTPException(404, "La sesión no tiene un reconocimiento.")

    prod = ses.data[0]["resultado"].get("producto", {})
    nombre = body.nombre or prod.get("nombre") or "Desconocido"

    # Buscar el producto por nombre; si no existe, crearlo.
    existente = (
        client.table("producto").select("id").eq("nombre", nombre).eq("activo", True).execute()
    )
    if existente.data:
        producto_id = existente.data[0]["id"]
    else:
        categoria_id = None
        if prod.get("categoria"):
            c = client.table("categoria").select("id").eq("nombre", prod["categoria"]).execute()
            categoria_id = c.data[0]["id"] if c.data else None
        nuevo = (
            client.table("producto")
            .insert(
                {
                    "nombre": nombre,
                    "categoria_id": categoria_id,
                    "marca": prod.get("marca"),
                    "presentacion": prod.get("presentacion"),
                }
            )
            .execute()
        )
        producto_id = nuevo.data[0]["id"]

    mov = (
        client.table("movimiento")
        .insert(
            {
                "producto_id": producto_id,
                "tipo": "entrada",
                "cantidad": max(1, body.cantidad),
                "usuario_id": int(user.user_id),
                "origen": "reconocimiento_ia",
            }
        )
        .execute()
    )
    return {"producto_id": producto_id, "nombre": nombre, "movimiento": mov.data[0]}
