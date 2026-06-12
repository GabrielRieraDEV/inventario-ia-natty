"""Módulo de reconocimiento de productos (RF-01).

Delega la visión por computadora en un modelo de lenguaje multimodal de
propósito general, consumido vía API. La interfaz `ProductRecognizer`
mantiene el reconocimiento desacoplado del proveedor concreto, de modo que
pueda sustituirse sin alterar la lógica de inventario (ver Cap. IV del TEG,
"bajo acoplamiento").
"""

from app.recognition.base import ProductRecognizer, RecognitionResult

__all__ = ["ProductRecognizer", "RecognitionResult"]
