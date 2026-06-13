"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { api, descargar, ApiError } from "@/lib/api";

type Usuario = { rol: string; activo: boolean };

// Preferencias guardadas localmente (RF-09). El detector de anomalías y las
// notificaciones por correo son trabajo futuro; aquí se persiste la preferencia.
type Config = {
  sensibilidad: number;
  notifs: Record<string, boolean>;
};

const NOTIFS = [
  { k: "stock", t: "Agotamiento crítico de stock", d: "Alerta inmediata cuando un producto cae por debajo del stock mínimo.", warn: false },
  { k: "reporte", t: "Reporte diario consolidado", d: "Resumen de fin de día con el detalle de todos los movimientos.", warn: false },
  { k: "acceso", t: "Accesos en horarios inusuales", d: "Aviso si se accede al sistema fuera del horario laboral.", warn: true },
];

const CONFIG_KEY = "natty_config";
const DEFAULT_CONFIG: Config = {
  sensibilidad: 75,
  notifs: { stock: true, reporte: false, acceso: true },
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer shrink-0">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="sr-only peer" />
      <div className="w-12 h-6 bg-outline-variant rounded-full peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:shadow after:transition-all peer-checked:after:translate-x-6" />
    </label>
  );
}

function leerConfig(): Config {
  if (typeof window === "undefined") return DEFAULT_CONFIG;
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    return raw ? { ...DEFAULT_CONFIG, ...(JSON.parse(raw) as Config) } : DEFAULT_CONFIG;
  } catch {
    return DEFAULT_CONFIG;
  }
}

export default function ConfiguracionPage() {
  const [admins, setAdmins] = useState<number | null>(null);
  const [personal, setPersonal] = useState<number | null>(null);
  const [productos, setProductos] = useState<number | null>(null);
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [exportando, setExportando] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    setConfig(leerConfig());
    // Conteos reales (la lista de usuarios solo está disponible para administradores).
    api
      .get<Usuario[]>("/api/usuarios")
      .then((us) => {
        setAdmins(us.filter((u) => u.activo && u.rol === "admin").length);
        setPersonal(us.filter((u) => u.activo && u.rol !== "admin").length);
      })
      .catch((e) => {
        if (e instanceof ApiError && e.status === 403) {
          setAdmins(-1); // sin permiso para ver el detalle
          setPersonal(-1);
        }
      });
    api
      .get<{ id: number }[]>("/api/productos")
      .then((p) => setProductos(p.length))
      .catch(() => setProductos(null));
  }, []);

  async function exportar(tipo: "inventario" | "movimientos") {
    setExportando(tipo);
    setAviso(null);
    try {
      await descargar(`/api/reportes/export/${tipo}`, `${tipo}.csv`);
      setAviso(`Exportación de ${tipo} generada.`);
    } catch {
      setAviso("No se pudo generar el archivo. Inténtalo de nuevo.");
    } finally {
      setExportando(null);
    }
  }

  function guardar() {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(config));
    setAviso("Configuración guardada.");
  }

  function descartar() {
    setConfig(leerConfig());
    setAviso("Cambios descartados.");
  }

  const conteo = (n: number | null) =>
    n === null ? "—" : n === -1 ? "•••" : String(n);

  return (
    <div className="w-full max-w-container-max mx-auto">
      <div className="mb-xl flex items-start justify-between gap-md flex-wrap">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-background">Configuración del sistema</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Administra respaldos, usuarios y parámetros de la Inteligencia Artificial.
          </p>
        </div>
        {aviso && (
          <span className="font-label-md text-label-md text-primary bg-primary-fixed px-md py-sm rounded-full flex items-center gap-xs">
            <Icon name="info" className="text-[18px]" /> {aviso}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        {/* Respaldo */}
        <section className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-sm mb-md">
              <div className="p-sm bg-secondary-container text-on-secondary-container rounded-lg flex items-center justify-center">
                <Icon name="database" />
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Respaldo y exportación</h3>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-xl">
              Exporta los registros de inventario y el historial de movimientos en formato CSV (compatible con Excel). Guarda estos archivos periódicamente como respaldo del negocio.
            </p>
          </div>
          <div className="border-t border-outline-variant pt-md flex gap-md flex-wrap">
            <button
              onClick={() => exportar("inventario")}
              disabled={exportando !== null}
              className="flex-1 min-w-[200px] bg-surface-container-lowest hover:bg-surface-container border border-outline text-primary font-label-md text-label-md py-sm px-md rounded-lg transition-colors flex justify-center items-center gap-sm disabled:opacity-50"
            >
              <Icon name={exportando === "inventario" ? "progress_activity" : "inventory_2"} className={`text-[20px] ${exportando === "inventario" ? "animate-spin" : ""}`} /> Exportar inventario
            </button>
            <button
              onClick={() => exportar("movimientos")}
              disabled={exportando !== null}
              className="flex-1 min-w-[200px] bg-surface-container-lowest hover:bg-surface-container border border-outline text-primary font-label-md text-label-md py-sm px-md rounded-lg transition-colors flex justify-center items-center gap-sm disabled:opacity-50"
            >
              <Icon name={exportando === "movimientos" ? "progress_activity" : "swap_vert"} className={`text-[20px] ${exportando === "movimientos" ? "animate-spin" : ""}`} /> Exportar movimientos
            </button>
          </div>
        </section>

        {/* Usuarios */}
        <section className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col">
          <div className="flex items-center gap-sm mb-md">
            <div className="p-sm bg-secondary-container text-on-secondary-container rounded-lg flex items-center justify-center">
              <Icon name="group" />
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Gestión de usuarios</h3>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-xl flex-1">
            Controla los niveles de acceso del personal de almacén, gerentes y administradores.
          </p>
          <ul className="space-y-sm mb-xl">
            <li className="flex justify-between items-center text-body-sm">
              <span className="text-on-surface">Administradores activos</span>
              <span className="font-data-mono font-medium text-primary bg-primary-fixed px-xs py-[2px] rounded">{conteo(admins)}</span>
            </li>
            <li className="flex justify-between items-center text-body-sm">
              <span className="text-on-surface">Personal</span>
              <span className="font-data-mono font-medium text-secondary bg-secondary-fixed px-xs py-[2px] rounded">{conteo(personal)}</span>
            </li>
            <li className="flex justify-between items-center text-body-sm">
              <span className="text-on-surface">Productos en catálogo</span>
              <span className="font-data-mono font-medium text-on-surface bg-surface-container px-xs py-[2px] rounded">{conteo(productos)}</span>
            </li>
          </ul>
          <Link href="/usuarios" className="w-full bg-surface-container-lowest hover:bg-surface-container border border-primary text-primary font-label-md text-label-md py-sm px-md rounded-lg transition-colors flex justify-center items-center gap-sm mt-auto">
            <Icon name="manage_accounts" className="text-[20px]" /> Gestionar roles y usuarios
          </Link>
        </section>

        {/* Sensibilidad IA */}
        <section className="lg:col-span-6 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
          <div className="flex items-center gap-sm mb-md">
            <div className="p-sm bg-surface-tint text-surface-bright rounded-lg flex items-center justify-center">
              <Icon name="psychology" fill />
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-xs">
              Sensibilidad de la IA
              <span className="bg-surface-variant text-primary text-[10px] uppercase font-bold px-xs py-[2px] rounded-sm tracking-wider">Beta</span>
            </h3>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-lg">
            Ajusta el umbral de confianza con el que el reconocimiento marca un producto como dudoso para revisión manual.
          </p>
          <div className="mt-xl">
            <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant mb-sm">
              <span>Permisiva</span>
              <span className="font-data-mono text-primary font-bold">{config.sensibilidad}</span>
              <span>Estricta</span>
            </div>
            <input
              type="range"
              min={1}
              max={100}
              value={config.sensibilidad}
              onChange={(e) => setConfig((c) => ({ ...c, sensibilidad: Number(e.target.value) }))}
              className="w-full accent-primary"
            />
            <div className="mt-lg p-md bg-inverse-on-surface border border-outline-variant border-dashed rounded-lg flex items-start gap-md">
              <Icon name="info" className="text-surface-tint mt-xs" />
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Nivel actual: <strong className="text-on-surface">{config.sensibilidad}</strong>. Cuanto más estricta, más capturas se enviarán a revisión manual antes de registrarse.
              </p>
            </div>
          </div>
        </section>

        {/* Notificaciones */}
        <section className="lg:col-span-6 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
          <div className="flex items-center gap-sm mb-md">
            <div className="p-sm bg-secondary-container text-on-secondary-container rounded-lg flex items-center justify-center">
              <Icon name="notifications" />
            </div>
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Notificaciones del sistema</h3>
          </div>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-xl">
            Configura qué eventos de inventario y seguridad quieres que el sistema resalte.
          </p>
          <div className="flex flex-col gap-md">
            {NOTIFS.map((n, i) => (
              <div key={n.k} className={`flex items-center justify-between gap-md py-sm ${i < NOTIFS.length - 1 ? "border-b border-outline-variant/50 pb-md" : ""}`}>
                <div>
                  <p className="font-label-md text-label-md text-on-surface flex items-center gap-xs">
                    {n.t}
                    {n.warn && <Icon name="warning" className="text-[16px] text-error" />}
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">{n.d}</p>
                </div>
                <Toggle
                  checked={config.notifs[n.k] ?? false}
                  onChange={(v) => setConfig((c) => ({ ...c, notifs: { ...c.notifs, [n.k]: v } }))}
                />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Guardar */}
      <div className="mt-xl pt-lg border-t border-outline-variant flex justify-end gap-md">
        <button onClick={descartar} className="bg-transparent hover:bg-surface-container text-on-surface font-label-md text-label-md py-md px-lg rounded-lg transition-colors">
          Descartar cambios
        </button>
        <button onClick={guardar} className="bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-md px-lg rounded-lg transition-colors flex items-center gap-sm">
          <Icon name="save" className="text-[20px]" /> Guardar configuración
        </button>
      </div>
    </div>
  );
}
