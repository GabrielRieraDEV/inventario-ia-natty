"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { api } from "@/lib/api";

type Resumen = {
  total_productos: number;
  total_categorias: number;
  alertas_activas: number;
  movimientos_hoy: number;
  entradas_hoy: number;
  salidas_hoy: number;
};
type Mov = { id: number; tipo: string; cantidad: number; creado_en: string; producto: { nombre: string } | null };
type Alerta = { id: number; mensaje: string; producto: { nombre: string; codigo_barras: string | null } | null };

const tipoBadge = {
  entrada: { cls: "bg-[#dcfce7] text-[#166534] border-[#bbf7d0]", icon: "south_west", label: "Entrada", color: "text-[#166534]", signo: "+" },
  salida: { cls: "bg-[#fee2e2] text-[#991b1b] border-[#fecaca]", icon: "north_east", label: "Salida", color: "text-[#991b1b]", signo: "-" },
  ajuste: { cls: "bg-[#fef3c7] text-[#92400e] border-[#fde68a]", icon: "published_with_changes", label: "Ajuste", color: "text-[#92400e]", signo: "±" },
} as const;

function iniciales(n: string) {
  return n.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
}
function hora(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString("es-VE", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

export default function DashboardPage() {
  const [resumen, setResumen] = useState<Resumen | null>(null);
  const [movs, setMovs] = useState<Mov[]>([]);
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      api.get<Resumen>("/api/reportes/resumen"),
      api.get<Mov[]>("/api/movimientos?limite=5"),
      api.get<Alerta[]>("/api/alertas"),
    ])
      .then(([r, m, a]) => { setResumen(r); setMovs(m); setAlertas(a); })
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar."));
  }, []);

  const kpis = [
    { label: "Total de productos", value: resumen?.total_productos ?? "—", icon: "inventory_2", tint: "bg-surface-container text-primary" },
    { label: "Alertas activas", value: resumen?.alertas_activas ?? "—", icon: "warning", tint: "bg-error-container text-on-error-container", valueCls: "text-error" },
    { label: "Movimientos hoy", value: resumen?.movimientos_hoy ?? "—", icon: "sync_alt", tint: "bg-secondary-container text-on-secondary-container", foot: resumen ? `${resumen.entradas_hoy} entradas, ${resumen.salidas_hoy} salidas` : "" },
    { label: "Categorías", value: resumen?.total_categorias ?? "—", icon: "category", tint: "bg-surface-container text-secondary" },
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-background">Panel general</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Métricas del inventario en tiempo real.</p>
        </div>
        <Link href="/movimientos" className="bg-primary text-surface-bright font-label-md text-label-md px-md py-sm rounded-lg hover:bg-primary-container transition-colors shadow-sm flex items-center gap-xs">
          <Icon name="add" className="text-[18px]" /> Nuevo movimiento
        </Link>
      </div>

      {error && (
        <div className="flex items-center gap-sm bg-error-container text-on-error-container rounded-lg px-md py-sm font-body-sm text-body-sm">
          <Icon name="error" className="text-[18px]" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
        {kpis.map((k) => (
          <div key={k.label} className="md:col-span-3 bg-surface-container-lowest border border-[#E2E8F0] rounded-xl p-lg flex flex-col justify-between">
            <div className="flex justify-between items-start mb-md">
              <span className="font-label-md text-label-md text-on-surface-variant">{k.label}</span>
              <div className={`p-1.5 rounded-md ${k.tint}`}><Icon name={k.icon} className="text-[20px]" /></div>
            </div>
            <div>
              <div className={`font-headline-lg text-headline-lg ${k.valueCls ?? "text-on-background"}`}>{k.value}</div>
              {k.foot && <div className="font-body-sm text-body-sm text-on-surface-variant mt-1">{k.foot}</div>}
            </div>
          </div>
        ))}

        {/* Movimientos recientes */}
        <div className="md:col-span-8 bg-surface-container-lowest border border-[#E2E8F0] rounded-xl flex flex-col overflow-hidden">
          <div className="p-md border-b border-outline-variant flex justify-between items-center bg-[#F8FAF9]">
            <h3 className="font-headline-sm text-headline-sm text-on-background">Movimientos recientes</h3>
            <Link href="/movimientos" className="font-label-sm text-label-sm text-primary hover:underline flex items-center">
              Ver todos <Icon name="chevron_right" className="text-[16px]" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAF9] border-b border-[#E2E8F0]">
                  <th className="py-sm px-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider w-1/2">Producto</th>
                  <th className="py-sm px-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Tipo</th>
                  <th className="py-sm px-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Cant.</th>
                  <th className="py-sm px-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right hidden sm:table-cell">Hora</th>
                </tr>
              </thead>
              <tbody className="font-body-sm text-body-sm divide-y divide-[#E2E8F0]">
                {movs.length === 0 ? (
                  <tr><td colSpan={4} className="py-xl text-center text-on-surface-variant">Sin movimientos recientes.</td></tr>
                ) : (
                  movs.map((m) => {
                    const b = tipoBadge[m.tipo as keyof typeof tipoBadge];
                    const nombre = m.producto?.nombre ?? "—";
                    return (
                      <tr key={m.id} className="hover:bg-surface-container-low transition-colors">
                        <td className="py-md px-md">
                          <div className="flex items-center gap-sm">
                            <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-primary font-bold text-xs">{iniciales(nombre)}</div>
                            <span className="font-medium text-on-background">{nombre}</span>
                          </div>
                        </td>
                        <td className="py-md px-md">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md font-label-sm text-[11px] border ${b.cls}`}>
                            <Icon name={b.icon} className="text-[12px]" /> {b.label}
                          </span>
                        </td>
                        <td className={`py-md px-md text-right font-data-mono font-medium ${b.color}`}>{b.signo}{m.cantidad}</td>
                        <td className="py-md px-md text-right text-on-surface-variant hidden sm:table-cell">{hora(m.creado_en)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alertas */}
        <div className="md:col-span-4 bg-surface-container-lowest border border-[#E2E8F0] rounded-xl flex flex-col overflow-hidden">
          <div className="p-md border-b border-outline-variant flex items-center gap-sm bg-[#F8FAF9]">
            <Icon name="warning" className="text-error" />
            <h3 className="font-headline-sm text-headline-sm text-on-background">Alertas de stock</h3>
          </div>
          <ul className="divide-y divide-[#E2E8F0] flex-1">
            {alertas.length === 0 ? (
              <li className="p-md font-body-sm text-body-sm text-on-surface-variant text-center">Sin alertas activas.</li>
            ) : (
              alertas.slice(0, 5).map((a) => (
                <li key={a.id} className="p-md hover:bg-surface-container-low transition-colors">
                  <div className="font-label-md text-label-md text-on-background">{a.producto?.nombre ?? "Producto"}</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">{a.mensaje}</div>
                </li>
              ))
            )}
          </ul>
          <div className="p-sm bg-surface-container-low text-center border-t border-outline-variant">
            <Link href="/alertas" className="text-primary font-label-sm text-label-sm hover:underline block py-sm">Ver todas las alertas</Link>
          </div>
        </div>
      </div>
    </>
  );
}
