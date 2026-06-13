# Imagen del backend (FastAPI) para Hugging Face Spaces (tipo Docker).
# HF expone el puerto declarado en README.md (app_port: 7860).
FROM python:3.12-slim

WORKDIR /app

# Dependencias primero (mejor cacheo de capas).
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Código de la aplicación.
COPY . .

EXPOSE 7860

# Las credenciales se inyectan como "Secrets" del Space (variables de entorno).
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]
