"""Configuración central de la aplicación.

Carga las variables de entorno (ver `.env.example`) usando pydantic-settings,
de modo que el resto de la aplicación nunca lea `os.environ` directamente.
"""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_env: str = "development"

    # Persistencia (Supabase / PostgreSQL)
    supabase_url: str = ""
    supabase_key: str = ""

    # Reconocimiento multimodal (Gemini)
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.5-flash"

    # Seguridad
    jwt_secret: str = "dev-secret-change-me"
    jwt_expire_minutes: int = 480

    # Reglas de negocio
    # Vida útil de una sesión de captura por QR (minutos); pasado este tiempo
    # el token deja de aceptar fotos (RF-01, anti-abuso de la cuota de IA).
    sesion_ttl_minutos: int = 30
    # Anticipación con la que se avisa de un producto próximo a vencer (RF-03).
    vencimiento_dias_alerta: int = 30

    # CORS
    cors_origins: str = "http://localhost:3000"

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    """Devuelve una única instancia de configuración (cacheada)."""
    return Settings()
