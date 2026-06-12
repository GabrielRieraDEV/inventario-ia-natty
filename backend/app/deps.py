"""Dependencias compartidas de la API (autenticación)."""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.security import decode_token

_bearer = HTTPBearer(auto_error=False)


class CurrentUser:
    def __init__(self, user_id: str, rol: str) -> None:
        self.user_id = user_id
        self.rol = rol


def get_current_user(
    creds: HTTPAuthorizationCredentials | None = Depends(_bearer),
) -> CurrentUser:
    """Valida el token Bearer y devuelve el usuario autenticado (RF-07)."""
    if creds is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="No autenticado."
        )
    payload = decode_token(creds.credentials)
    if payload is None or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido o expirado."
        )
    return CurrentUser(user_id=payload["sub"], rol=payload.get("rol", "operario"))
