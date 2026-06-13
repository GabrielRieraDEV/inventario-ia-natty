"""Indicadores y reportes gerenciales (RF-05, RF-08) y exportación (RF-09)."""

import csv
import io
from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, Response

from app.db import get_client
from app.deps import CurrentUser, get_current_user

router = APIRouter(prefix="/api/reportes", tags=["reportes"])

# Ciudad Bolívar opera en horario de Venezuela; el corte del "día" debe ser local.
_TZ = ZoneInfo("America/Caracas")


@router.get("/resumen")
def resumen(_: CurrentUser = Depends(get_current_user)) -> dict:
    """KPIs del panel general: productos, alertas, movimientos del día, categorías."""
    client = get_client()

    productos = client.table("producto").select("id", count="exact").eq("activo", True).execute()
    categorias = client.table("categoria").select("id", count="exact").execute()
    alertas = (
        client.table("alerta").select("id", count="exact").eq("resuelta", False).execute()
    )

    # Inicio del día local (Venezuela) expresado en UTC para comparar con la BD.
    inicio = datetime.now(_TZ).replace(hour=0, minute=0, second=0, microsecond=0)
    movs = (
        client.table("movimiento")
        .select("tipo")
        .gte("creado_en", inicio.astimezone(ZoneInfo("UTC")).isoformat())
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


@router.get("/stock-por-categoria")
def stock_por_categoria(_: CurrentUser = Depends(get_current_user)) -> list[dict]:
    """Existencias totales agrupadas por categoría (gráfico de reportes)."""
    client = get_client()
    filas = client.table("vista_stock").select("categoria_id, stock_actual").execute().data or []
    cats = {
        c["id"]: c["nombre"]
        for c in client.table("categoria").select("id, nombre").execute().data or []
    }
    agg: dict[str, int] = {}
    for f in filas:
        nombre = cats.get(f.get("categoria_id"), "Sin categoría")
        agg[nombre] = agg.get(nombre, 0) + (f.get("stock_actual") or 0)
    return [
        {"categoria": k, "stock": v}
        for k, v in sorted(agg.items(), key=lambda x: -x[1])
    ]


def _csv_response(filename: str, encabezados: list[str], filas: list[list]) -> Response:
    """Arma un CSV descargable (BOM UTF-8 para que Excel muestre bien los acentos)."""
    buffer = io.StringIO()
    writer = csv.writer(buffer)
    writer.writerow(encabezados)
    writer.writerows(filas)
    return Response(
        content=buffer.getvalue().encode("utf-8-sig"),
        media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )


@router.get("/export/inventario")
def export_inventario(_: CurrentUser = Depends(get_current_user)) -> Response:
    """Exporta el inventario actual a CSV (respaldo/exportación, RF-09)."""
    client = get_client()
    datos = client.table("vista_stock").select("*").order("nombre").execute().data or []
    cats = {
        c["id"]: c["nombre"]
        for c in client.table("categoria").select("id, nombre").execute().data or []
    }
    filas = [
        [
            f.get("nombre"),
            f.get("categoria") or cats.get(f.get("categoria_id")) or "Sin categoría",
            f.get("codigo_barras") or "",
            f.get("stock_actual") or 0,
            f.get("stock_minimo") or 0,
            f.get("precio") or 0,
        ]
        for f in datos
    ]
    return _csv_response(
        "inventario.csv",
        ["Producto", "Categoría", "Código de barras", "Stock actual", "Stock mínimo", "Precio"],
        filas,
    )


@router.get("/export/movimientos")
def export_movimientos(
    limite: int = 5000, _: CurrentUser = Depends(get_current_user)
) -> Response:
    """Exporta el historial de movimientos a CSV (RF-09)."""
    client = get_client()
    datos = (
        client.table("movimiento")
        .select("creado_en, tipo, cantidad, origen, nota, producto(nombre)")
        .order("creado_en", desc=True)
        .limit(limite)
        .execute()
        .data
        or []
    )
    filas = [
        [
            m.get("creado_en"),
            (m.get("producto") or {}).get("nombre", ""),
            m.get("tipo"),
            m.get("cantidad"),
            m.get("origen"),
            m.get("nota") or "",
        ]
        for m in datos
    ]
    return _csv_response(
        "movimientos.csv",
        ["Fecha", "Producto", "Tipo", "Cantidad", "Origen", "Nota"],
        filas,
    )
