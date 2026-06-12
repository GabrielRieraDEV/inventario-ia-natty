"""Implementación del reconocedor con Google Gemini (modelo multimodal).

Envía la imagen del producto junto con una instrucción (prompt) que fuerza
una respuesta JSON estructurada conforme a `RecognitionResult`.
"""

import json

from google import genai
from google.genai import types

from app.recognition.base import ProductRecognizer, RecognitionResult

# Instrucción diseñada para una respuesta estructurada y sin texto libre.
_PROMPT = """\
Eres un asistente de inventario para un bodegón (tienda de abarrotes) en \
Venezuela. Analiza la imagen del producto y devuelve ÚNICAMENTE un objeto JSON \
válido, sin texto adicional ni markdown, con esta forma exacta:

{
  "nombre": "<nombre comercial del producto>",
  "marca": "<marca o null>",
  "categoria": "<una de: Alimentos no perecederos, Bebidas, Higiene personal, \
Limpieza del hogar, Otros>",
  "presentacion": "<tamaño/presentación, p. ej. '1 kg', '500 ml', o null>",
  "confianza": <número entre 0 y 1>,
  "texto_detectado": "<texto visible en el empaque o null>"
}

Si no puedes identificar el producto, usa "nombre": "Desconocido" y \
"confianza": 0.0."""


class GeminiRecognizer(ProductRecognizer):
    """Reconocedor de productos basado en la API de Google Gemini."""

    def __init__(self, api_key: str, model: str = "gemini-2.0-flash") -> None:
        self._client = genai.Client(api_key=api_key)
        self._model = model

    async def recognize(self, image_bytes: bytes, mime_type: str) -> RecognitionResult:
        response = await self._client.aio.models.generate_content(
            model=self._model,
            contents=[
                _PROMPT,
                types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
            ],
            config=types.GenerateContentConfig(response_mime_type="application/json"),
        )
        data = json.loads(response.text)
        return RecognitionResult.model_validate(data)
