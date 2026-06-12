"""Catálogo de categorías (RF-06)."""

from fastapi import APIRouter, Depends

from app.db import get_client
from app.deps import CurrentUser, get_current_user
from app.models import Categoria, CategoriaIn

router = APIRouter(prefix="/api/categorias", tags=["categorias"])


@router.get("", response_model=list[Categoria])
def listar(_: CurrentUser = Depends(get_current_user)) -> list[dict]:
    res = get_client().table("categoria").select("id, nombre").order("nombre").execute()
    return res.data or []


@router.post("", response_model=Categoria, status_code=201)
def crear(body: CategoriaIn, _: CurrentUser = Depends(get_current_user)) -> dict:
    res = get_client().table("categoria").insert({"nombre": body.nombre}).execute()
    return res.data[0]
