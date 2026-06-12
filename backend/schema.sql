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
    p.categoria_id,
    p.stock_minimo,
    COALESCE(SUM(
        CASE m.tipo
            WHEN 'entrada' THEN m.cantidad
            WHEN 'salida'  THEN -m.cantidad
            WHEN 'ajuste'  THEN m.cantidad
        END
    ), 0) AS stock_actual
FROM producto p
LEFT JOIN movimiento m ON m.producto_id = p.id
GROUP BY p.id;
