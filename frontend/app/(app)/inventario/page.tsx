"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/Icon";
import { api } from "@/lib/api";

type Fila = {
  id: number;
  nombre: string;
  categoria: string | null;
  stock_actual: number;
  stock_minimo: number;
  foto_url: string | null;
};

function estadoDe(f: Fila): "critico" | "bajo" | "normal" {
  if (f.stock_actual <= Math.max(1, Math.ceil(f.stock_minimo * 0.25))) return "critico";
  if (f.stock_actual <= f.stock_minimo) return "bajo";
  return "normal";
}

const badge = {
  critico: { cls: "bg-error-container text-on-error-container", label: "Crítico" },
  bajo: { cls: "bg-surface-variant text-on-surface-variant", label: "Bajo" },
  normal: { cls: "bg-primary-fixed text-on-primary-fixed", label: "Normal" },
} as const;

function Contenido() {
  const params = useSearchParams();
  const [items, setItems] = useState<Fila[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");

  // Sincroniza la caja con el término que llega del buscador de la barra superior.
  useEffect(() => setQ(params.get("q") ?? ""), [params]);

  useEffect(() => {
    api
      .get<Fila[]>("/api/productos/inventario")
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar."))
      .finally(() => setCargando(false));
  }, []);

  const filtrados = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return items;
    return items.filter(
      (f) =>
        f.nombre.toLowerCase().includes(t) ||
        (f.categoria ?? "").toLowerCase().includes(t),
    );
  }, [items, q]);

  return (
    <div className="max-w-container-max mx-auto flex flex-col gap-lg w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Inventario actual</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Existencias en tiempo real (derivadas de los movimientos).
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Icon name="search" className="absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar por nombre o categoría…"
            className="w-full bg-surface-bright border border-outline-variant rounded-lg pl-xl pr-sm py-sm font-body-sm text-on-surface outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-sm bg-error-container text-on-error-container rounded-lg px-md py-sm font-body-sm text-body-sm">
          <Icon name="error" className="text-[18px]" /> {error}
        </div>
      )}

      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col shadow-sm">
        <div className="px-md py-sm border-b border-outline-variant flex items-center justify-between">
          <span className="font-label-sm text-label-sm text-on-surface-variant">
            {cargando
              ? "Cargando…"
              : q.trim()
                ? `${filtrados.length} de ${items.length} artículos`
                : `Mostrando ${items.length} artículos`}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead className="bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">
              <tr>
                <th className="px-md py-sm font-medium">Producto</th>
                <th className="px-md py-sm font-medium">Categoría</th>
                <th className="px-md py-sm font-medium text-right">Stock actual</th>
                <th className="px-md py-sm font-medium text-right">Mínimo</th>
                <th className="px-md py-sm font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {cargando ? (
                <tr><td colSpan={5} className="py-xl text-center text-on-surface-variant"><Icon name="progress_activity" className="animate-spin" /></td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={5} className="py-xl text-center font-body-sm text-on-surface-variant">Aún no hay productos. Agrégalos desde el catálogo.</td></tr>
              ) : filtrados.length === 0 ? (
                <tr><td colSpan={5} className="py-xl text-center font-body-sm text-on-surface-variant">Sin resultados para «{q.trim()}».</td></tr>
              ) : (
                filtrados.map((f) => {
                  const e = estadoDe(f);
                  return (
                    <tr key={f.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-md py-md font-label-md text-label-md text-on-surface">
                        <div className="flex items-center gap-sm">
                          {f.foto_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={f.foto_url} alt={f.nombre} className="w-8 h-8 rounded object-cover border border-outline-variant shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-surface-variant flex items-center justify-center text-primary shrink-0"><Icon name="inventory_2" className="text-[18px]" /></div>
                          )}
                          {f.nombre}
                        </div>
                      </td>
                      <td className="px-md py-md font-body-sm text-body-sm text-on-surface-variant">{f.categoria ?? "—"}</td>
                      <td className={`px-md py-md text-right font-data-mono text-data-mono text-on-surface ${e === "critico" ? "font-bold" : ""}`}>{f.stock_actual}</td>
                      <td className="px-md py-md text-right font-data-mono text-data-mono text-on-surface-variant">{f.stock_minimo}</td>
                      <td className="px-md py-md">
                        <span className={`inline-flex items-center px-sm py-xs rounded-full font-label-sm text-label-sm ${badge[e].cls}`}>{badge[e].label}</span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default function InventarioPage() {
  return (
    <Suspense fallback={<div className="py-xl text-center text-on-surface-variant"><Icon name="progress_activity" className="animate-spin" /></div>}>
      <Contenido />
    </Suspense>
  );
}
