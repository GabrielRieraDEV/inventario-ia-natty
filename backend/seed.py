"""Inicialización de datos: usuario administrador y productos de ejemplo.

Uso:
    cd backend
    python seed.py

Requiere SUPABASE_URL y SUPABASE_KEY en el archivo .env, y haber ejecutado
antes schema.sql en el proyecto de Supabase.
"""

import os

from app.db import get_client
from app.security import hash_password

ADMIN_EMAIL = os.getenv("SEED_ADMIN_EMAIL", "admin@padondenatty.com")
ADMIN_PASSWORD = os.getenv("SEED_ADMIN_PASSWORD", "admin1234")


def main() -> None:
    client = get_client()

    # --- Usuario administrador ---
    existing = client.table("usuario").select("id").eq("email", ADMIN_EMAIL).execute()
    if existing.data:
        print(f"El usuario {ADMIN_EMAIL} ya existe; se omite.")
    else:
        client.table("usuario").insert(
            {
                "nombre": "Administrador",
                "email": ADMIN_EMAIL,
                "password_hash": hash_password(ADMIN_PASSWORD),
                "rol": "admin",
            }
        ).execute()
        print(f"Usuario administrador creado: {ADMIN_EMAIL} / {ADMIN_PASSWORD}")

    # --- Mapa de categorías por nombre ---
    cats = {c["nombre"]: c["id"] for c in client.table("categoria").select("id, nombre").execute().data}

    # --- Productos de ejemplo (si no hay ninguno) ---
    if not client.table("producto").select("id").limit(1).execute().data:
        ejemplos = [
            {"nombre": "Harina PAN 1kg", "codigo_barras": "HPAN-001", "categoria_id": cats.get("Alimentos no perecederos"), "marca": "PAN", "presentacion": "1 kg", "precio": 1.50, "stock_minimo": 20},
            {"nombre": "Arroz Mary 1kg", "codigo_barras": "AMAR-001", "categoria_id": cats.get("Alimentos no perecederos"), "marca": "Mary", "presentacion": "1 kg", "precio": 1.20, "stock_minimo": 20},
            {"nombre": "Aceite de Girasol 1L", "codigo_barras": "ACE-001", "categoria_id": cats.get("Alimentos no perecederos"), "marca": "Mazeite", "presentacion": "1 L", "precio": 3.00, "stock_minimo": 15},
            {"nombre": "Coca-Cola 2L", "codigo_barras": "COKE-2L", "categoria_id": cats.get("Bebidas"), "marca": "Coca-Cola", "presentacion": "2 L", "precio": 2.50, "stock_minimo": 24},
            {"nombre": "Detergente Ariel 900g", "codigo_barras": "ARIEL-900", "categoria_id": cats.get("Limpieza del hogar"), "marca": "Ariel", "presentacion": "900 g", "precio": 4.00, "stock_minimo": 10},
        ]
        inserted = client.table("producto").insert(ejemplos).execute().data
        print(f"{len(inserted)} productos de ejemplo creados.")

        # Existencias iniciales (entradas) para algunos productos
        admin_id = client.table("usuario").select("id").eq("email", ADMIN_EMAIL).execute().data[0]["id"]
        movimientos = [
            {"producto_id": inserted[0]["id"], "tipo": "entrada", "cantidad": 150, "usuario_id": admin_id},
            {"producto_id": inserted[1]["id"], "tipo": "entrada", "cantidad": 24, "usuario_id": admin_id},
            {"producto_id": inserted[2]["id"], "tipo": "entrada", "cantidad": 5, "usuario_id": admin_id},
            {"producto_id": inserted[3]["id"], "tipo": "entrada", "cantidad": 80, "usuario_id": admin_id},
            {"producto_id": inserted[4]["id"], "tipo": "entrada", "cantidad": 3, "usuario_id": admin_id},
        ]
        client.table("movimiento").insert(movimientos).execute()
        print("Existencias iniciales registradas.")
    else:
        print("Ya existen productos; se omite la siembra de ejemplos.")

    print("Listo.")


if __name__ == "__main__":
    main()
