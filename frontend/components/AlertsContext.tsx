"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

export type Alerta = {
  id: number;
  tipo: "stock_minimo" | "por_vencer";
  mensaje: string;
  producto: { nombre: string; codigo_barras: string | null } | null;
};

type Ctx = { alertas: Alerta[]; refrescar: () => Promise<void> };

const AlertsContext = createContext<Ctx>({ alertas: [], refrescar: async () => {} });

export function AlertsProvider({ children }: { children: React.ReactNode }) {
  const [alertas, setAlertas] = useState<Alerta[]>([]);

  const refrescar = useCallback(async () => {
    try {
      setAlertas(await api.get<Alerta[]>("/api/alertas"));
    } catch {
      /* sin sesión o backend caído: deja la lista como está */
    }
  }, []);

  useEffect(() => {
    refrescar();
    const t = setInterval(refrescar, 20000); // refresco periódico
    return () => clearInterval(t);
  }, [refrescar]);

  return <AlertsContext.Provider value={{ alertas, refrescar }}>{children}</AlertsContext.Provider>;
}

export function useAlerts() {
  return useContext(AlertsContext);
}
