"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { api } from "@/lib/api";

type Fila = {
  id: number;
  nombre: string;
  categoria: string | null;
  stock_actual: number;
  stock_minimo: number;
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

export default function InventarioPage() {
  const [items, setItems] = useState<Fila[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Fila[]>("/api/productos/inventario")
      .then(setItems)
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar."))
      .finally(() => setCargando(false));
  }, []);

  return (
    <div className="max-w-container-max mx-auto flex flex-col gap-lg w-full">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Inventario actual</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Existencias en tiempo real (derivadas de los movimientos).
          </p>
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
            {cargando ? "Cargando…" : `Mostrando ${items.length} artículos`}
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
              ) : (
                items.map((f) => {
                  const e = estadoDe(f);
                  return (
                    <tr key={f.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="px-md py-md font-label-md text-label-md text-on-surface">{f.nombre}</td>
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
