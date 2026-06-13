-- ============================================================
--  Esquema de base de datos — Sistema de Inventario con IA
--  Bodegón Pa' Donde Natty C.A.
--
--  Modelo relacional normalizado hasta la Tercera Forma Normal (3FN).
--  Entidades del ERD (TEG, Figura 3): Usuario, Categoria, Producto,
--  Movimiento, Alerta. El stock es un dato DERIVADO de los movimientos
--  (auditable), no un valor sobrescrito.
--  Compatible con PostgreSQL / Supabase.
-- ============================================================

-- ---------- Usuarios (RF-07) ----------
CREATE TABLE IF NOT EXISTS usuario (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre        TEXT        NOT NULL,
    email         TEXT        NOT NULL UNIQUE,
    password_hash TEXT        NOT NULL,
    rol           TEXT        NOT NULL DEFAULT 'operario'
                              CHECK (rol IN ('admin', 'gerente', 'operario')),
    activo        BOOLEAN     NOT NULL DEFAULT TRUE,
    creado_en     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Categorías (RF-06) ----------
CREATE TABLE IF NOT EXISTS categoria (
    id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre    TEXT NOT NULL UNIQUE,
    creado_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Productos (RF-04, RF-06) ----------
CREATE TABLE IF NOT EXISTS producto (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre        TEXT        NOT NULL,
    codigo_barras TEXT        UNIQUE,
    categoria_id  BIGINT      REFERENCES categoria (id) ON DELETE SET NULL,
    marca         TEXT,
    presentacion  TEXT,
    precio        NUMERIC(12, 2) NOT NULL DEFAULT 0 CHECK (precio >= 0),
    stock_minimo  INTEGER     NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0),
    fecha_vencimiento DATE,
    foto_url      TEXT,
    activo        BOOLEAN     NOT NULL DEFAULT TRUE,
    creado_en     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Movimientos de inventario (RF-02) ----------
-- Cada entrada/salida es una fila; el stock se reconstruye sumando movimientos.
CREATE TABLE IF NOT EXISTS movimiento (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    producto_id BIGINT      NOT NULL REFERENCES producto (id) ON DELETE CASCADE,
    usuario_id  BIGINT      REFERENCES usuario (id) ON DELETE SET NULL,
    tipo        TEXT        NOT NULL CHECK (tipo IN ('entrada', 'salida', 'ajuste')),
    cantidad    INTEGER     NOT NULL CHECK (cantidad > 0),
    origen      TEXT        NOT NULL DEFAULT 'manual'
                            CHECK (origen IN ('manual', 'reconocimiento_ia')),
    nota        TEXT,
    creado_en   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_movimiento_producto ON movimiento (producto_id);
CREATE INDEX IF NOT EXISTS idx_movimiento_fecha    ON movimiento (creado_en);

-- ---------- Alertas (RF-03) ----------
CREATE TABLE IF NOT EXISTS alerta (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    producto_id BIGINT      NOT NULL REFERENCES producto (id) ON DELETE CASCADE,
    tipo        TEXT        NOT NULL CHECK (tipo IN ('stock_minimo', 'por_vencer')),
    mensaje     TEXT        NOT NULL,
    resuelta    BOOLEAN     NOT NULL DEFAULT FALSE,
    creado_en   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_alerta_producto ON alerta (producto_id);

-- ---------- Vista de stock actual (dato derivado, RF-04) ----------
CREATE OR REPLACE VIEW vista_stock AS
SELECT
    p.id,
    p.nombre,
    p.codigo_barras,
    p.categoria_id,
    c.nombre AS categoria,
    p.stock_minimo,
    p.precio,
    p.foto_url,
    COALESCE(SUM(
        CASE m.tipo
            WHEN 'entrada' THEN m.cantidad
            WHEN 'salida'  THEN -m.cantidad
            WHEN 'ajuste'  THEN m.cantidad
        END
    ), 0) AS stock_actual
FROM producto p
LEFT JOIN categoria c ON c.id = p.categoria_id
LEFT JOIN movimiento m ON m.producto_id = p.id
WHERE p.activo = TRUE
GROUP BY p.id, c.nombre;

-- ---------- Sesión de captura móvil (RF-01, flujo QR) ----------
-- La PC crea una sesión y muestra su token en un QR; el teléfono la abre,
-- captura la foto y el backend escribe aquí el resultado del reconocimiento.
-- La PC sondea esta fila (GET /api/sesiones/{token}) hasta verla 'reconocido'.
-- El token caduca a los SESION_TTL_MINUTOS (estado 'expirada').
CREATE TABLE IF NOT EXISTS sesion_captura (
    token        UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    estado       TEXT        NOT NULL DEFAULT 'pendiente'
                             CHECK (estado IN ('pendiente', 'vinculada', 'reconocido', 'expirada')),
    resultado    JSONB,
    creado_en    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Almacenamiento de fotos de productos ----------
-- Bucket público (lectura por URL). El backend sube con la clave service_role
-- (omite RLS); la lectura pública permite mostrar las miniaturas en la UI.
INSERT INTO storage.buckets (id, name, public)
VALUES ('productos', 'productos', TRUE)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
--  Datos semilla mínimos (categorías y un usuario administrador)
--  La contraseña del admin se define al ejecutar el backend (seed).
-- ============================================================
INSERT INTO categoria (nombre) VALUES
    ('Alimentos no perecederos'),
    ('Bebidas'),
    ('Higiene personal'),
    ('Limpieza del hogar'),
    ('Lácteos'),
    ('Otros')
ON CONFLICT (nombre) DO NOTHING;
