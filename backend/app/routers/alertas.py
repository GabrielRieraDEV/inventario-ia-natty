"""Alertas de inventario (RF-03)."""

from datetime import date, timedelta

from fastapi import APIRouter, Depends

from app.config import Settings, get_settings
from app.db import get_client
from app.deps import CurrentUser, get_current_user

router = APIRouter(prefix="/api/alertas", tags=["alertas"])


def _evaluar_alertas_por_vencer(dias: int) -> None:
    """Crea alertas para productos cuya fecha de vencimiento está próxima (RF-03).

    Se evalúa al consultar las alertas (no hay planificador): por cada producto
    activo, con existencias y con fecha de vencimiento dentro de la ventana, se
    genera una alerta 'por_vencer' si no hay ya una sin resolver.
    """
    client = get_client()
    limite = (date.today() + timedelta(days=dias)).isoformat()
    productos = (
        client.table("producto")
        .select("id, nombre, fecha_vencimiento")
        .eq("activo", True)
        .not_.is_("fecha_vencimiento", "null")
        .lte("fecha_vencimiento", limite)
        .execute()
    )
    if not productos.data:
        return
    # Solo alertar de productos que aún tienen existencias.
    stock = {
        f["id"]: f.get("stock_actual") or 0
        for f in client.table("vista_stock").select("id, stock_actual").execute().data or []
    }
    for p in productos.data:
        if stock.get(p["id"], 0) <= 0:
            continue
        activa = (
            client.table("alerta")
            .select("id")
            .eq("producto_id", p["id"])
            .eq("tipo", "por_vencer")
            .eq("resuelta", False)
            .execute()
        )
        if not activa.data:
            client.table("alerta").insert(
                {
                    "producto_id": p["id"],
                    "tipo": "por_vencer",
                    "mensaje": f"{p['nombre']} vence el {p['fecha_vencimiento']}.",
                }
            ).execute()


@router.get("")
def listar(
    resueltas: bool = False,
    _: CurrentUser = Depends(get_current_user),
    settings: Settings = Depends(get_settings),
) -> list[dict]:
    if not resueltas:
        _evaluar_alertas_por_vencer(settings.vencimiento_dias_alerta)
    res = (
        get_client()
        .table("alerta")
        .select("*, producto(nombre, codigo_barras)")
        .eq("resuelta", resueltas)
        .order("creado_en", desc=True)
        .execute()
    )
    return res.data or []


@router.post("/{alerta_id}/resolver", status_code=204)
def resolver(alerta_id: int, _: CurrentUser = Depends(get_current_user)) -> None:
    get_client().table("alerta").update({"resuelta": True}).eq("id", alerta_id).execute()
