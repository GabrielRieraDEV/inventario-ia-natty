"""Esquemas de entrada/salida de la API (pydantic)."""

from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


# ---------- Autenticación ----------
class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    nombre: str
    rol: str


# ---------- Categoría ----------
class CategoriaIn(BaseModel):
    nombre: str


class Categoria(CategoriaIn):
    id: int


# ---------- Producto ----------
class ProductoIn(BaseModel):
    nombre: str
    codigo_barras: str | None = None
    categoria_id: int | None = None
    marca: str | None = None
    presentacion: str | None = None
    precio: float = 0
    stock_minimo: int = 0
    fecha_vencimiento: date | None = None


class Producto(ProductoIn):
    id: int
    foto_url: str | None = None
    activo: bool = True


# ---------- Movimiento ----------
class MovimientoIn(BaseModel):
    producto_id: int
    tipo: Literal["entrada", "salida", "ajuste"]
    cantidad: int = Field(gt=0)
    origen: Literal["manual", "reconocimiento_ia"] = "manual"
    nota: str | None = None


class Movimiento(MovimientoIn):
    id: int
    usuario_id: int | None = None
    creado_en: datetime


# ---------- Sesión de captura (flujo QR) ----------
class SesionCaptura(BaseModel):
    token: str
    estado: str
    resultado: dict | None = None
