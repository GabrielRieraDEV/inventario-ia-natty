"""Gestión de stock y movimientos (RF-02). Evalúa alertas tras cada registro."""

from fastapi import APIRouter, Depends

from app.db import get_client
from app.deps import CurrentUser, get_current_user
from app.models import Movimiento, MovimientoIn

router = APIRouter(prefix="/api/movimientos", tags=["movimientos"])


def _evaluar_alerta_stock(producto_id: int) -> None:
    """Genera una alerta de stock mínimo si el producto cruza su umbral (RF-03)."""
    client = get_client()
    stock = (
        client.table("vista_stock").select("*").eq("id", producto_id).limit(1).execute()
    )
    if not stock.data:
        return
    fila = stock.data[0]
    if fila["stock_actual"] <= fila["stock_minimo"]:
        activa = (
            client.table("alerta")
            .select("id")
            .eq("producto_id", producto_id)
            .eq("tipo", "stock_minimo")
            .eq("resuelta", False)
            .execute()
        )
        if not activa.data:
            client.table("alerta").insert(
                {
                    "producto_id": producto_id,
                    "tipo": "stock_minimo",
                    "mensaje": f"{fila['nombre']} alcanzó el stock mínimo "
                    f"({fila['stock_actual']}/{fila['stock_minimo']}).",
                }
            ).execute()


@router.get("", response_model=list[Movimiento])
def listar(_: CurrentUser = Depends(get_current_user)) -> list[dict]:
    res = (
        get_client()
        .table("movimiento")
        .select("*")
        .order("creado_en", desc=True)
        .limit(100)
        .execute()
    )
    return res.data or []


@router.post("", response_model=Movimiento, status_code=201)
def crear(body: MovimientoIn, user: CurrentUser = Depends(get_current_user)) -> dict:
    data = body.model_dump()
    data["usuario_id"] = int(user.user_id)
    res = get_client().table("movimiento").insert(data).execute()
    _evaluar_alerta_stock(body.producto_id)
    return res.data[0]
