"""Seguridad: hash de contraseñas y emisión/validación de JWT (RF-07)."""

from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt

from app.config import get_settings

_ALGO = "HS256"


def hash_password(password: str) -> str:
    # bcrypt opera sobre como máximo 72 bytes.
    return bcrypt.hashpw(password.encode("utf-8")[:72], bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8")[:72], hashed.encode("utf-8"))
    except ValueError:
        return False


def create_access_token(subject: str, rol: str) -> str:
    settings = get_settings()
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.jwt_expire_minutes)
    payload = {"sub": subject, "rol": rol, "exp": expire}
    return jwt.encode(payload, settings.jwt_secret, algorithm=_ALGO)


def decode_token(token: str) -> dict | None:
    """Devuelve el payload si el token es válido, o None si no lo es."""
    try:
        return jwt.decode(token, get_settings().jwt_secret, algorithms=[_ALGO])
    except JWTError:
        return None
