"""Gestión de usuarios y roles (RF-07, RF-09). Solo administradores."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr

from app.db import get_client
from app.deps import CurrentUser, get_current_user
from app.security import hash_password

router = APIRouter(prefix="/api/usuarios", tags=["usuarios"])


class UsuarioIn(BaseModel):
    nombre: str
    email: EmailStr
    password: str
    rol: str = "operario"


def _solo_admin(user: CurrentUser) -> None:
    if user.rol != "admin":
        raise HTTPException(403, "Solo un administrador puede gestionar usuarios.")


@router.get("")
def listar(user: CurrentUser = Depends(get_current_user)) -> list[dict]:
    _solo_admin(user)
    res = (
        get_client()
        .table("usuario")
        .select("id, nombre, email, rol, activo, creado_en")
        .order("creado_en")
        .execute()
    )
    return res.data or []


@router.post("", status_code=201)
def crear(body: UsuarioIn, user: CurrentUser = Depends(get_current_user)) -> dict:
    _solo_admin(user)
    if body.rol not in ("admin", "gerente", "operario"):
        raise HTTPException(400, "Rol inválido.")
    existe = get_client().table("usuario").select("id").eq("email", str(body.email)).execute()
    if existe.data:
        raise HTTPException(409, "Ya existe un usuario con ese correo.")
    res = (
        get_client()
        .table("usuario")
        .insert(
            {
                "nombre": body.nombre,
                "email": str(body.email),
                "password_hash": hash_password(body.password),
                "rol": body.rol,
            }
        )
        .execute()
    )
    u = res.data[0]
    return {"id": u["id"], "nombre": u["nombre"], "email": u["email"], "rol": u["rol"]}


@router.post("/{usuario_id}/desactivar", status_code=204)
def desactivar(usuario_id: int, user: CurrentUser = Depends(get_current_user)) -> None:
    _solo_admin(user)
    get_client().table("usuario").update({"activo": False}).eq("id", usuario_id).execute()
