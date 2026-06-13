"""Sesiones de captura móvil vinculadas por QR (RF-01).

Flujo:
  1. La PC crea una sesión (POST /api/sesiones) y muestra el token en un QR.
  2. El teléfono abre /m/{token}, captura la foto y la envía a
     POST /api/sesiones/{token}/capturar (sin requerir login: el token es el secreto).
  3. El backend reconoce el producto con el modelo multimodal y escribe el
     resultado en la sesión; la PC lo refleja por Realtime/consulta.
"""

import base64
import time
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel

from app.config import Settings, get_settings
from app.db import get_client
from app.deps import CurrentUser, get_current_user
from app.recognition import ProductRecognizer
from app.recognition.gemini import GeminiRecognizer
from app.routers.movimientos import _evaluar_alerta_stock

router = APIRouter(prefix="/api/sesiones", tags=["sesiones"])


def get_recognizer(settings: Settings = Depends(get_settings)) -> ProductRecognizer:
    if not settings.gemini_api_key:
        raise HTTPException(503, "GEMINI_API_KEY no configurada.")
    return GeminiRecognizer(settings.gemini_api_key, settings.gemini_model)


def _sesion_vigente(client, token: str, settings: Settings) -> dict | None:
    """Devuelve la sesión si existe y no ha caducado; si caducó, la marca y devuelve None.

    El token del QR es el único secreto del flujo público de captura, por lo que
    limita su validez en el tiempo evita que un token filtrado se reutilice para
    consumir indefinidamente la cuota de la IA (RF-01).
    """
    res = (
        client.table("sesion_captura")
        .select("token, estado, creado_en")
        .eq("token", token)
        .limit(1)
        .execute()
    )
    if not res.data:
        return None
    fila = res.data[0]
    creado = datetime.fromisoformat(fila["creado_en"])
    if creado.tzinfo is None:
        creado = creado.replace(tzinfo=timezone.utc)
    edad_min = (datetime.now(timezone.utc) - creado).total_seconds() / 60
    if edad_min > settings.sesion_ttl_minutos:
        if fila["estado"] != "expirada":
            client.table("sesion_captura").update({"estado": "expirada"}).eq(
                "token", token
            ).execute()
        return None
    return fila


def _subir_foto(client, producto_id: int, data_url: str | None) -> str | None:
    """Sube la foto del reconocimiento al bucket 'productos' y devuelve su URL pública.

    Devuelve None ante cualquier fallo (no debe impedir el registro del producto).
    """
    if not data_url or not data_url.startswith("data:"):
        return None
    try:
        cabecera, b64 = data_url.split(",", 1)
        content_type = cabecera.split(";")[0].removeprefix("data:") or "image/jpeg"
        raw = base64.b64decode(b64)
        ext = "png" if "png" in content_type else "jpg"
        ruta = f"{producto_id}.{ext}"
        client.storage.from_("productos").upload(
            ruta, raw, {"content-type": content_type, "upsert": "true"}
        )
        return client.storage.from_("productos").get_public_url(ruta)
    except Exception:
        return None


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
    settings: Settings = Depends(get_settings),
) -> dict:
    """El teléfono envía la imagen; se reconoce y se guarda en la sesión (RF-01)."""
    client = get_client()
    if _sesion_vigente(client, token, settings) is None:
        raise HTTPException(404, "Sesión no encontrada o expirada.")

    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(400, "El archivo debe ser una imagen.")

    image_bytes = await file.read()
    started = time.perf_counter()
    result = await recognizer.recognize(image_bytes, file.content_type)
    elapsed = round(time.perf_counter() - started, 3)

    # Se guarda la foto (data URL) para mostrarla en la PC junto al resultado.
    imagen = f"data:{file.content_type};base64,{base64.b64encode(image_bytes).decode('ascii')}"
    resultado = {
        "producto": result.model_dump(),
        "tiempo_respuesta_s": elapsed,
        "imagen": imagen,
    }
    client.table("sesion_captura").update(
        {"estado": "reconocido", "resultado": resultado}
    ).eq("token", token).execute()
    return resultado


class ConfirmarIn(BaseModel):
    cantidad: int = 1
    nombre: str | None = None  # permite corregir el nombre reconocido
    tipo: Literal["entrada", "salida"] = "entrada"
    # Foto ya procesada en el cliente (p. ej. PNG sin fondo, data URL). Si viene,
    # se guarda esta en vez de la foto original capturada por el teléfono.
    foto: str | None = None


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
    cantidad = max(1, body.cantidad)

    # Buscar el producto por nombre.
    existente = (
        client.table("producto")
        .select("id, foto_url")
        .eq("nombre", nombre)
        .eq("activo", True)
        .execute()
    )
    if existente.data:
        producto_id = existente.data[0]["id"]
        foto_actual = existente.data[0].get("foto_url")
    elif body.tipo == "salida":
        # No se puede despachar un producto que no está en el inventario.
        raise HTTPException(
            400, f"«{nombre}» no está en el inventario; regístralo como entrada primero."
        )
    else:
        # Entrada de un producto nuevo: se crea el catálogo.
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
        foto_actual = None

    # Una salida no puede dejar el stock en negativo.
    if body.tipo == "salida":
        fila = (
            client.table("vista_stock")
            .select("stock_actual")
            .eq("id", producto_id)
            .limit(1)
            .execute()
        )
        disponible = fila.data[0]["stock_actual"] if fila.data else 0
        if cantidad > disponible:
            raise HTTPException(
                400, f"Stock insuficiente: hay {disponible} unidades disponibles."
            )

    # Asociar la foto al producto, si todavía no tiene una. Se prefiere la foto
    # procesada en el cliente (sin fondo) y, si no, la original de la sesión.
    if not foto_actual:
        data_url = body.foto or ses.data[0]["resultado"].get("imagen")
        url = _subir_foto(client, producto_id, data_url)
        if url:
            client.table("producto").update({"foto_url": url}).eq("id", producto_id).execute()

    mov = (
        client.table("movimiento")
        .insert(
            {
                "producto_id": producto_id,
                "tipo": body.tipo,
                "cantidad": cantidad,
                "usuario_id": int(user.user_id),
                "origen": "reconocimiento_ia",
            }
        )
        .execute()
    )
    _evaluar_alerta_stock(producto_id)
    return {"producto_id": producto_id, "nombre": nombre, "movimiento": mov.data[0]}
