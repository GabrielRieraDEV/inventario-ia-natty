"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { api } from "@/lib/api";

type Producto = { id: number; nombre: string; presentacion: string | null };
type Stock = { id: number; stock_actual: number; stock_minimo: number };

export default function MovimientosPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [stock, setStock] = useState<Record<number, Stock>>({});
  const [productoId, setProductoId] = useState<number | "">("");
  const [query, setQuery] = useState("");
  const [abierto, setAbierto] = useState(false);
  const [tipo, setTipo] = useState<"entrada" | "salida">("entrada");
  const [cantidad, setCantidad] = useState(1);
  const [nota, setNota] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; texto: string } | null>(null);
  const [guardando, setGuardando] = useState(false);
  const combo = useRef<HTMLDivElement>(null);

  async function cargar() {
    const [p, inv] = await Promise.all([
      api.get<Producto[]>("/api/productos"),
      api.get<Stock[]>("/api/productos/inventario"),
    ]);
    setProductos(p);
    setStock(Object.fromEntries(inv.map((s) => [s.id, s])));
  }
  useEffect(() => { cargar(); }, []);

  // Cerrar el desplegable al hacer clic fuera.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (combo.current && !combo.current.contains(e.target as Node)) setAbierto(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  // Solo se renderizan las primeras 50 coincidencias: rápido aunque haya miles.
  const filtrados = useMemo(() => {
    const t = query.trim().toLowerCase();
    const base = t ? productos.filter((p) => p.nombre.toLowerCase().includes(t)) : productos;
    return base.slice(0, 50);
  }, [productos, query]);

  function elegir(p: Producto) {
    setProductoId(p.id);
    setQuery(p.nombre);
    setAbierto(false);
  }

  const actual = productoId !== "" ? stock[productoId]?.stock_actual ?? 0 : 0;
  const nuevo = useMemo(() => (tipo === "entrada" ? actual + cantidad : actual - cantidad), [tipo, actual, cantidad]);
  const seleccionado = productos.find((p) => p.id === productoId);

  async function registrar(e: React.FormEvent) {
    e.preventDefault();
    if (productoId === "") return;
    setGuardando(true);
    setMsg(null);
    try {
      await api.post("/api/movimientos", { producto_id: productoId, tipo, cantidad, nota: nota || null });
      setMsg({ ok: true, texto: "Movimiento registrado y stock actualizado." });
      setCantidad(1);
      setNota("");
      await cargar();
    } catch (e) {
      setMsg({ ok: false, texto: e instanceof Error ? e.message : "No se pudo registrar." });
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="w-full max-w-container-max mx-auto">
      <div className="mb-lg flex flex-col sm:flex-row sm:items-center justify-between gap-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-background">Registrar movimiento</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Registra entradas de mercancía o salidas de despacho.</p>
        </div>
        <Link
          href={`/qr?tipo=${tipo}`}
          className={`flex items-center justify-center gap-xs px-md py-sm rounded-lg font-label-md text-label-md transition-colors shrink-0 border ${
            tipo === "salida"
              ? "border-error text-error hover:bg-error-container/40"
              : "border-primary text-primary hover:bg-surface-container"
          } bg-surface-container-lowest`}
        >
          <Icon name="qr_code_scanner" className="text-[18px]" /> {tipo === "salida" ? "Salida con cámara (IA)" : "Entrada con cámara (IA)"}
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-lg items-start">
        <div className="xl:col-span-8 space-y-lg">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
            <form className="space-y-lg" onSubmit={registrar}>
              <div ref={combo}>
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-sm block">Producto</label>
                <div className="relative">
                  <Icon name="search" className="absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => { setQuery(e.target.value); setProductoId(""); setAbierto(true); }}
                    onFocus={() => setAbierto(true)}
                    placeholder={productos.length ? "Busca un producto por nombre…" : "No hay productos"}
                    className="w-full pl-xl pr-sm py-md bg-surface-bright border border-outline-variant rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  />
                  {abierto && productos.length > 0 && (
                    <ul className="absolute z-20 mt-xs w-full max-h-72 overflow-y-auto bg-surface-container-lowest border border-outline-variant rounded-lg shadow-lg divide-y divide-outline-variant">
                      {filtrados.length === 0 ? (
                        <li className="px-md py-sm font-body-sm text-on-surface-variant">Sin coincidencias.</li>
                      ) : (
                        filtrados.map((p) => (
                          <li key={p.id}>
                            <button type="button" onClick={() => elegir(p)} className="w-full text-left px-md py-sm hover:bg-surface-container-low font-body-md text-body-md flex justify-between items-center gap-md">
                              <span className="truncate">{p.nombre}{p.presentacion ? <span className="text-on-surface-variant"> · {p.presentacion}</span> : null}</span>
                              <span className="font-data-mono text-label-sm text-label-sm text-on-surface-variant shrink-0">{stock[p.id]?.stock_actual ?? 0}</span>
                            </button>
                          </li>
                        ))
                      )}
                    </ul>
                  )}
                </div>
              </div>

              <hr className="border-outline-variant opacity-50" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                <div>
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-sm block">Tipo de movimiento</label>
                  <div className="flex rounded-lg border border-outline-variant p-xs bg-surface-bright">
                    {(["entrada", "salida"] as const).map((t) => (
                      <button key={t} type="button" onClick={() => setTipo(t)}
                        className={`flex-1 text-center py-sm rounded-md font-label-md text-label-md flex items-center justify-center gap-xs transition-colors ${
                          tipo === t
                            ? t === "entrada" ? "bg-primary-container text-on-primary-container" : "bg-error-container text-on-error-container"
                            : "text-on-surface-variant hover:bg-surface-container"
                        }`}>
                        <Icon name={t === "entrada" ? "arrow_downward" : "arrow_upward"} fill className="text-[18px]" />
                        {t === "entrada" ? "Entrada" : "Salida"}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-sm block">Cantidad</label>
                  <input type="number" min={1} value={cantidad} onChange={(e) => setCantidad(Math.max(1, Number(e.target.value)))}
                    className="w-full px-md py-md bg-surface-bright border border-outline-variant rounded-lg font-data-mono text-body-lg text-right outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" />
                </div>
              </div>

              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-sm block">Nota (opcional)</label>
                <textarea rows={2} value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Detalles del movimiento…"
                  className="w-full px-md py-sm bg-surface-bright border border-outline-variant rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 resize-none" />
              </div>

              {msg && (
                <div className={`flex items-center gap-sm rounded-lg px-md py-sm font-body-sm text-body-sm ${msg.ok ? "bg-[#dcfce7] text-[#166534]" : "bg-error-container text-on-error-container"}`}>
                  <Icon name={msg.ok ? "check_circle" : "error"} className="text-[18px]" /> {msg.texto}
                </div>
              )}

              <div className="pt-md flex items-center justify-end gap-md border-t border-outline-variant">
                <button type="submit" disabled={guardando || productoId === ""}
                  className="font-label-md text-label-md bg-primary text-on-primary px-xl py-[10px] rounded-lg hover:bg-primary-container transition-all flex items-center gap-sm disabled:opacity-70">
                  <Icon name="check_circle" fill className="text-[18px]" /> {guardando ? "Registrando…" : "Confirmar movimiento"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Impacto */}
        <div className="xl:col-span-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md flex items-center gap-sm border-b border-outline-variant pb-md">
              <Icon name="analytics" className="text-surface-tint" /> Impacto del movimiento
            </h3>
            <div className="space-y-lg py-md">
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Producto seleccionado</p>
                <p className="font-body-md text-body-md font-medium text-on-surface">{seleccionado?.nombre ?? "—"}</p>
              </div>
              <div className="bg-surface-container rounded-lg p-md border border-outline-variant space-y-sm">
                <div className="flex justify-between items-center">
                  <span className="font-body-md text-body-md text-on-surface-variant">Stock actual</span>
                  <span className="font-data-mono text-body-lg text-on-surface">{actual}</span>
                </div>
                <div className={`flex justify-between items-center ${tipo === "entrada" ? "text-primary" : "text-error"}`}>
                  <span className="font-body-md text-body-md">{tipo === "entrada" ? "Entrada" : "Salida"}</span>
                  <span className="font-data-mono text-body-lg font-bold">{tipo === "entrada" ? "+" : "−"}{cantidad}</span>
                </div>
                <hr className="border-outline-variant my-sm" />
                <div className="flex justify-between items-center">
                  <span className="font-label-md text-label-md text-on-surface uppercase tracking-wider">Nuevo stock</span>
                  <span className={`font-data-mono text-headline-md font-bold ${nuevo < 0 ? "text-error" : "text-on-background"}`}>{nuevo}</span>
                </div>
              </div>
              {nuevo < 0 && (
                <div className="flex items-start gap-sm bg-error-container/40 border border-error rounded-lg p-md">
                  <Icon name="warning" className="text-error mt-[2px]" />
                  <p className="font-body-sm text-body-sm text-on-surface">La salida supera el stock disponible.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
