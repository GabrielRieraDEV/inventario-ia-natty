import Link from "next/link";
import { Icon } from "@/components/Icon";

function Toggle({ defaultChecked = false }: { defaultChecked?: boolean }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer shrink-0">
      <input type="checkbox" defaultChecked={defaultChecked} className="sr-only peer" />
      <div className="w-12 h-6 bg-outline-variant rounded-full peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:shadow after:transition-all peer-checked:after:translate-x-6" />
    </label>
  );
}

const NOTIFS = [
  { t: "Agotamiento crítico de stock", d: "Alerta inmediata cuando un producto de alta rotación cae por debajo del 10%.", on: true },
  { t: "Reporte diario consolidado", d: "Correo de fin de día con el detalle de todos los movimientos.", on: false },
  { t: "Accesos en horarios inusuales", d: "Alerta si se accede al sistema fuera del horario laboral.", on: true, warn: true },
];

export default function ConfiguracionPage() {
  return (
    <div className="w-full max-w-container-max mx-auto">
      <div className="mb-xl">
        <h2 className="font-headline-lg text-headline-lg text-on-background">Configuración del sistema</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
          Administra respaldos, usuarios y parámetros de la Inteligencia Artificial.
        </p>
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
              Exporta de forma segura los registros de inventario, el historial de transacciones y los datos de usuarios. Los respaldos periódicos garantizan la continuidad del negocio.
            </p>
            <div className="bg-surface-container-low border border-outline-variant rounded-lg p-md mb-xl flex items-center justify-between">
              <div>
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wide">Último respaldo automático</p>
                <p className="font-body-md text-body-md font-medium text-on-surface mt-xs flex items-center gap-xs">
                  <Icon name="check_circle" className="text-[18px] text-primary" /> Hoy, 03:00 a. m.
                </p>
              </div>
              <button className="bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-sm px-md rounded-lg transition-colors">
                Respaldo manual
              </button>
            </div>
          </div>
          <div className="border-t border-outline-variant pt-md flex gap-md">
            <button className="flex-1 bg-surface-container-lowest hover:bg-surface-container border border-outline text-primary font-label-md text-label-md py-sm px-md rounded-lg transition-colors flex justify-center items-center gap-sm">
              <Icon name="csv" className="text-[20px]" /> Exportar a CSV
            </button>
            <button className="flex-1 bg-surface-container-lowest hover:bg-surface-container border border-outline text-primary font-label-md text-label-md py-sm px-md rounded-lg transition-colors flex justify-center items-center gap-sm">
              <Icon name="table_view" className="text-[20px]" /> Exportar a Excel
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
              <span className="font-data-mono font-medium text-primary bg-primary-fixed px-xs py-[2px] rounded">3</span>
            </li>
            <li className="flex justify-between items-center text-body-sm">
              <span className="text-on-surface">Personal</span>
              <span className="font-data-mono font-medium text-secondary bg-secondary-fixed px-xs py-[2px] rounded">12</span>
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
            Ajusta el umbral de tolerancia del detector de anomalías. Una mayor sensibilidad marcará discrepancias menores en los patrones de movimiento.
          </p>
          <div className="mt-xl">
            <div className="flex justify-between font-label-sm text-label-sm text-on-surface-variant mb-sm">
              <span>Permisiva</span>
              <span className="font-data-mono text-primary font-bold">Estricta</span>
              <span>Estricta</span>
            </div>
            <input type="range" min={1} max={100} defaultValue={75} className="w-full accent-primary" />
            <div className="mt-lg p-md bg-inverse-on-surface border border-outline-variant border-dashed rounded-lg flex items-start gap-md">
              <Icon name="info" className="text-surface-tint mt-xs" />
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Nivel actual: <strong className="text-on-surface">75</strong>. El sistema alertará si las tasas de consumo se desvían más del 5% respecto al histórico.
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
            Configura cómo y cuándo el sistema te avisa sobre eventos de inventario y seguridad.
          </p>
          <div className="flex flex-col gap-md">
            {NOTIFS.map((n, i) => (
              <div key={n.t} className={`flex items-center justify-between gap-md py-sm ${i < NOTIFS.length - 1 ? "border-b border-outline-variant/50 pb-md" : ""}`}>
                <div>
                  <p className="font-label-md text-label-md text-on-surface flex items-center gap-xs">
                    {n.t}
                    {n.warn && <Icon name="warning" className="text-[16px] text-error" />}
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">{n.d}</p>
                </div>
                <Toggle defaultChecked={n.on} />
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Guardar */}
      <div className="mt-xl pt-lg border-t border-outline-variant flex justify-end gap-md">
        <button className="bg-transparent hover:bg-surface-container text-on-surface font-label-md text-label-md py-md px-lg rounded-lg transition-colors">
          Descartar cambios
        </button>
        <button className="bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md py-md px-lg rounded-lg transition-colors flex items-center gap-sm">
          <Icon name="save" className="text-[20px]" /> Guardar configuración
        </button>
      </div>
    </div>
  );
}
