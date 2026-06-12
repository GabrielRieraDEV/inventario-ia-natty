"""Implementación del reconocedor con Google Gemini (modelo multimodal).

Envía la imagen del producto junto con una instrucción (prompt) y un esquema
de respuesta estructurada, de modo que el modelo devuelva directamente los
campos de `RecognitionResult` sin texto libre.
"""

import json

from google import genai
from google.genai import types

from app.recognition.base import ProductRecognizer, RecognitionResult

_PROMPT = """\
Eres un asistente de inventario para un bodegón (tienda de abarrotes) en \
Venezuela. Analiza la imagen del producto e identifícalo. La categoría debe \
ser una de: "Alimentos no perecederos", "Bebidas", "Higiene personal", \
"Limpieza del hogar", "Lácteos" u "Otros". Si no puedes identificar el \
producto, usa nombre "Desconocido" y confianza 0.0. La confianza es un número \
entre 0 y 1."""


class GeminiRecognizer(ProductRecognizer):
    """Reconocedor de productos basado en la API de Google Gemini."""

    def __init__(self, api_key: str, model: str = "gemini-2.5-flash") -> None:
        self._client = genai.Client(api_key=api_key)
        self._model = model

    async def recognize(self, image_bytes: bytes, mime_type: str) -> RecognitionResult:
        response = await self._client.aio.models.generate_content(
            model=self._model,
            contents=[
                _PROMPT,
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            ],
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=RecognitionResult,
                # Desactiva el "thinking" para que el presupuesto de tokens se
                # use en la respuesta (los modelos 2.5 lo activan por defecto).
                thinking_config=types.ThinkingConfig(thinking_budget=0),
            ),
        )
        parsed = getattr(response, "parsed", None)
        if isinstance(parsed, RecognitionResult):
            return parsed
        return RecognitionResult.model_validate(json.loads(response.text or "{}"))
