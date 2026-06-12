"""Contrato del servicio de reconocimiento de productos.

Define el modelo de respuesta estructurada y la interfaz que debe implementar
cualquier proveedor (Gemini, Claude, etc.). El registro de inventario solo
depende de esta abstracción, nunca del proveedor concreto.
"""

from abc import ABC, abstractmethod

from pydantic import BaseModel, Field


class RecognitionResult(BaseModel):
    """Respuesta estructurada del reconocimiento de un producto.

    El *prompt* enviado al modelo se diseña para que devuelva exactamente
    estos campos, de modo que la respuesta se acople directamente con la
    lógica de inventario sin interpretación ambigua (TEG, "ingeniería de
    prompts").
    """

    nombre: str = Field(..., description="Nombre comercial del producto")
    marca: str | None = Field(None, description="Marca, si es legible")
    categoria: str | None = Field(None, description="Categoría sugerida")
    presentacion: str | None = Field(
        None, description="Presentación o tamaño (p. ej. '1 kg', '500 ml')"
    )
    confianza: float = Field(
        ..., ge=0.0, le=1.0, description="Confianza del reconocimiento (0–1)"
    )
    texto_detectado: str | None = Field(
        None, description="Texto visible en el empaque (OCR), si aplica"
    )


class ProductRecognizer(ABC):
    """Interfaz de un reconocedor de productos a partir de una imagen."""

    @abstractmethod
    async def recognize(self, image_bytes: bytes, mime_type: str) -> RecognitionResult:
        """Identifica el producto de una imagen y devuelve un resultado estructurado.

        Args:
            image_bytes: contenido binario de la imagen capturada.
            mime_type: tipo MIME de la imagen (p. ej. ``image/jpeg``).

        Returns:
            RecognitionResult con la identificación y sus atributos.
        """
        raise NotImplementedError
