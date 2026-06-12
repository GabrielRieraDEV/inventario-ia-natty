"""Alertas de inventario (RF-03)."""

from fastapi import APIRouter, Depends

from app.db import get_client
from app.deps import CurrentUser, get_current_user

router = APIRouter(prefix="/api/alertas", tags=["alertas"])


@router.get("")
def listar(
    resueltas: bool = False, _: CurrentUser = Depends(get_current_user)
) -> list[dict]:
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
