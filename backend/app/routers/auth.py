"""Autenticación y control de acceso (RF-07)."""

from fastapi import APIRouter, HTTPException, status

from app.db import get_client
from app.models import LoginRequest, TokenResponse
from app.security import create_access_token, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest) -> TokenResponse:
    """Valida credenciales y emite un token JWT."""
    res = (
        get_client()
        .table("usuario")
        .select("id, nombre, email, password_hash, rol, activo")
        .eq("email", str(body.email))
        .limit(1)
        .execute()
    )
    rows = res.data or []
    if not rows:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Credenciales inválidas.")

    user = rows[0]
    if not user.get("activo", True) or not verify_password(
        body.password, user["password_hash"]
    ):
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Credenciales inválidas.")

    token = create_access_token(subject=str(user["id"]), rol=user["rol"])
    return TokenResponse(access_token=token, nombre=user["nombre"], rol=user["rol"])
