"""Acceso a la base de datos vía cliente de Supabase (PostgreSQL).

Expone un cliente único configurado con las credenciales del entorno. El
backend usa la clave de servicio (service_role) para operar sobre todas las
tablas; la autorización por rol se aplica en la capa de la API.
"""

from functools import lru_cache

from supabase import Client, create_client

from app.config import get_settings


@lru_cache
def get_client() -> Client:
    """Devuelve el cliente de Supabase (cacheado)."""
    settings = get_settings()
    if not settings.supabase_url or not settings.supabase_key:
        raise RuntimeError(
            "SUPABASE_URL y SUPABASE_KEY no están configuradas. Revisa el archivo .env."
        )
    return create_client(settings.supabase_url, settings.supabase_key)
