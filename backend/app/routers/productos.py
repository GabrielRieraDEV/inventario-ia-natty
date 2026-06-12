"""Catálogo de productos y consulta de inventario (RF-04, RF-06)."""

from fastapi import APIRouter, Depends, HTTPException

from app.db import get_client
from app.deps import CurrentUser, get_current_user
from app.models import Producto, ProductoIn

router = APIRouter(prefix="/api/productos", tags=["productos"])


def _serializar(body: ProductoIn) -> dict:
    data = body.model_dump()
    if data.get("fecha_vencimiento"):
        data["fecha_vencimiento"] = data["fecha_vencimiento"].isoformat()
    return data


@router.get("", response_model=list[Producto])
def listar(_: CurrentUser = Depends(get_current_user)) -> list[dict]:
    res = (
        get_client()
        .table("producto")
        .select("*")
        .eq("activo", True)
        .order("nombre")
        .execute()
    )
    return res.data or []


@router.get("/inventario")
def inventario(_: CurrentUser = Depends(get_current_user)) -> list[dict]:
    """Existencias actuales (stock derivado de los movimientos, RF-04)."""
    res = get_client().table("vista_stock").select("*").order("nombre").execute()
    return res.data or []


@router.post("", response_model=Producto, status_code=201)
def crear(body: ProductoIn, _: CurrentUser = Depends(get_current_user)) -> dict:
    res = get_client().table("producto").insert(_serializar(body)).execute()
    return res.data[0]


@router.put("/{producto_id}", response_model=Producto)
def actualizar(
    producto_id: int, body: ProductoIn, _: CurrentUser = Depends(get_current_user)
) -> dict:
    res = (
        get_client()
        .table("producto")
        .update(_serializar(body))
        .eq("id", producto_id)
        .execute()
    )
    if not res.data:
        raise HTTPException(404, "Producto no encontrado.")
    return res.data[0]


@router.delete("/{producto_id}", status_code=204)
def eliminar(producto_id: int, _: CurrentUser = Depends(get_current_user)) -> None:
    # Baja lógica (mantiene la trazabilidad de los movimientos históricos).
    get_client().table("producto").update({"activo": False}).eq("id", producto_id).execute()
