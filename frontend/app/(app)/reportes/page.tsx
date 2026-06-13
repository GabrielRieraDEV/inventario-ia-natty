"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { api } from "@/lib/api";

type Resumen = { total_productos: number; total_categorias: number; alertas_activas: number; movimientos_hoy: number; entradas_hoy: number; salidas_hoy: number };
type BarraCat = { categoria: string; stock: number };

export default function ReportesPage() {
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [barras, setBarras] = useState<BarraCat[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<Resumen>("/api/reportes/resumen"),
      api.get<BarraCat[]>("/api/reportes/stock-por-categoria"),
    ])
      .then(([r, b]) => { setResumen(r); setBarras(b); })
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar."));
  }, []);

  const maxStock = Math.max(1, ...barras.map((b) => b.stock));

  const kpis = [
    { label: "Productos", value: resumen?.total_productos ?? "—", icon: "inventory_2", tint: "text-primary bg-surface-container" },
    { label: "Alertas activas", value: resumen?.alertas_activas ?? "—", icon: "warning", tint: "text-error bg-error-container" },
    { label: "Movimientos hoy", value: resumen?.movimientos_hoy ?? "—", icon: "sync_alt", tint: "text-surface-tint bg-surface-variant" },
    { label: "Categorías", value: resumen?.total_categorias ?? "—", icon: "category", tint: "text-secondary bg-secondary-container" },
  ];

  return (
    <div className="max-w-container-max mx-auto w-full flex flex-col gap-lg">
      <div>
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Reportes gerenciales</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Indicadores clave para la toma de decisiones.</p>
      </div>

      {error && (
        <div className="flex items-center gap-sm bg-error-container text-on-error-container rounded-lg px-md py-sm font-body-sm text-body-sm">
          <Icon name="error" className="text-[18px]" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
        {kpis.map((k) => (
          <div key={k.label} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-md">
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">{k.label}</p>
              <Icon name={k.icon} className={`rounded-lg p-sm ${k.tint}`} />
            </div>
            <h3 className="font-headline-lg text-headline-lg text-on-surface">{k.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        {/* Barras reales: stock por categoría */}
        <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm flex flex-col p-lg min-h-[340px]">
          <div className="mb-xl">
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Existencias por categoría</h3>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Unidades totales en stock.</p>
          </div>
          {barras.length === 0 ? (
            <div className="flex-1 flex items-center justify-center font-body-sm text-on-surface-variant">Sin datos.</div>
          ) : (
            <div className="flex-1 flex items-end gap-md pt-lg min-h-[200px]">
              {barras.map((b) => (
                <div key={b.categoria} className="flex-1 flex flex-col items-center gap-sm group cursor-pointer">
                  <span className="font-data-mono text-[11px] text-on-surface-variant">{b.stock}</span>
                  <div className="w-full flex items-end" style={{ height: 180 }}>
                    <div className="w-full bg-primary-container group-hover:bg-primary rounded-t-sm transition-colors" style={{ height: `${(b.stock / maxStock) * 100}%` }} />
                  </div>
                  <span className="font-label-sm text-label-sm text-center text-on-surface-variant w-full truncate" title={b.categoria}>{b.categoria}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resumen de movimientos del día */}
        <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm flex flex-col p-lg">
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-xs">Movimientos de hoy</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-xl">Entradas y salidas registradas.</p>
          <div className="flex-1 flex flex-col justify-center gap-md">
            <div className="flex items-center justify-between p-md bg-[#dcfce7] rounded-lg">
              <span className="flex items-center gap-sm font-label-md text-label-md text-[#166534]"><Icon name="south_west" /> Entradas</span>
              <span className="font-headline-md text-headline-md text-[#166534]">{resumen?.entradas_hoy ?? "—"}</span>
            </div>
            <div className="flex items-center justify-between p-md bg-[#fee2e2] rounded-lg">
              <span className="flex items-center gap-sm font-label-md text-label-md text-[#991b1b]"><Icon name="north_east" /> Salidas</span>
              <span className="font-headline-md text-headline-md text-[#991b1b]">{resumen?.salidas_hoy ?? "—"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
