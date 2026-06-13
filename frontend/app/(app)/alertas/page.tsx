"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { useAlerts } from "@/components/AlertsContext";
import { api } from "@/lib/api";

type Alerta = {
  id: number;
  tipo: "stock_minimo" | "por_vencer";
  mensaje: string;
  producto: { nombre: string; codigo_barras: string | null } | null;
};

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { refrescar } = useAlerts();

  async function cargar() {
    setCargando(true);
    try {
      setAlertas(await api.get<Alerta[]>("/api/alertas"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar.");
    } finally {
      setCargando(false);
    }
  }
  useEffect(() => { cargar(); }, []);

  async function resolver(id: number) {
    // Optimista: quita la alerta de la vista al instante.
    setAlertas((prev) => prev.filter((a) => a.id !== id));
    await api.post(`/api/alertas/${id}/resolver`);
    await Promise.all([cargar(), refrescar()]);
  }

  const stock = alertas.filter((a) => a.tipo === "stock_minimo");
  const vencer = alertas.filter((a) => a.tipo === "por_vencer");

  return (
    <div className="max-w-container-max mx-auto w-full">
      <div className="mb-lg">
        <h2 className="font-headline-lg text-headline-lg text-on-surface">Centro de alertas</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Atención inmediata para anomalías del inventario.</p>
      </div>

      {error && (
        <div className="mb-lg flex items-center gap-sm bg-error-container text-on-error-container rounded-lg px-md py-sm font-body-sm text-body-sm">
          <Icon name="error" className="text-[18px]" /> {error}
        </div>
      )}

      {cargando ? (
        <div className="py-xl text-center text-on-surface-variant"><Icon name="progress_activity" className="animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
          {/* Stock crítico */}
          <section className="lg:col-span-7 flex flex-col gap-md">
            <div className="flex items-center gap-sm mb-xs">
              <Icon name="warning" fill className="text-error" />
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Stock mínimo</h3>
              <span className="bg-error-container text-on-error-container font-label-sm text-label-sm px-xs py-[2px] rounded-full ml-sm">{stock.length}</span>
            </div>
            {stock.length === 0 ? (
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg font-body-sm text-body-sm text-on-surface-variant text-center">Sin alertas de stock.</div>
            ) : (
              stock.map((a) => (
                <div key={a.id} className="bg-surface-container-lowest border border-error-container rounded-xl p-md flex gap-md relative overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-error" />
                  <div className="w-12 h-12 rounded-lg bg-surface-container-high flex-shrink-0 flex items-center justify-center text-error"><Icon name="inventory_2" /></div>
                  <div className="flex-1">
                    <p className="font-data-mono text-data-mono text-outline">{a.producto?.codigo_barras ?? "—"}</p>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface leading-tight">{a.producto?.nombre ?? "Producto"}</h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">{a.mensaje}</p>
                  </div>
                  <div className="flex flex-col justify-center gap-sm">
                    <button onClick={() => resolver(a.id)} className="px-md py-sm bg-primary text-on-primary rounded-md font-label-md text-label-md hover:bg-primary-container transition-colors whitespace-nowrap">Resolver</button>
                  </div>
                </div>
              ))
            )}
          </section>

          {/* Vencimientos */}
          <section className="lg:col-span-5 flex flex-col gap-md">
            <div className="flex items-center gap-sm mb-xs">
              <Icon name="event_busy" fill className="text-secondary" />
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Próximos a vencer</h3>
              <span className="bg-surface-variant text-on-surface-variant font-label-sm text-label-sm px-xs py-[2px] rounded-full ml-sm">{vencer.length}</span>
            </div>
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
              {vencer.length === 0 ? (
                <div className="p-lg font-body-sm text-body-sm text-on-surface-variant text-center">Sin productos por vencer.</div>
              ) : (
                vencer.map((a) => (
                  <div key={a.id} className="p-md border-b border-outline-variant last:border-b-0 flex items-start gap-md">
                    <div className="w-10 h-10 rounded-full bg-[#FFFBEB] text-[#D97706] flex items-center justify-center flex-shrink-0"><Icon name="schedule" className="text-sm" /></div>
                    <div className="flex-1">
                      <h5 className="font-label-md text-label-md text-on-surface">{a.producto?.nombre ?? "Producto"}</h5>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">{a.mensaje}</p>
                      <button onClick={() => resolver(a.id)} className="mt-sm text-primary font-label-sm text-label-sm hover:underline">Resolver</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
