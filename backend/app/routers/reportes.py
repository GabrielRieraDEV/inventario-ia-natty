"""Indicadores y reportes gerenciales (RF-05, RF-08)."""

from datetime import datetime, timezone

from fastapi import APIRouter, Depends

from app.db import get_client
from app.deps import CurrentUser, get_current_user

router = APIRouter(prefix="/api/reportes", tags=["reportes"])


@router.get("/resumen")
def resumen(_: CurrentUser = Depends(get_current_user)) -> dict:
    """KPIs del panel general: productos, alertas, movimientos del día, categorías."""
    client = get_client()

    productos = client.table("producto").select("id", count="exact").eq("activo", True).execute()
    categorias = client.table("categoria").select("id", count="exact").execute()
    alertas = (
        client.table("alerta").select("id", count="exact").eq("resuelta", False).execute()
    )

    hoy = datetime.now(timezone.utc).date().isoformat()
    movs = (
        client.table("movimiento")
        .select("tipo")
        .gte("creado_en", hoy)
        .execute()
    )
    filas = movs.data or []
    entradas = sum(1 for m in filas if m["tipo"] == "entrada")
    salidas = sum(1 for m in filas if m["tipo"] == "salida")

    return {
        "total_productos": productos.count or 0,
        "total_categorias": categorias.count or 0,
        "alertas_activas": alertas.count or 0,
        "movimientos_hoy": len(filas),
        "entradas_hoy": entradas,
        "salidas_hoy": salidas,
    }
