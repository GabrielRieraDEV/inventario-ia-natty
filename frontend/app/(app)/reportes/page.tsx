import { Icon } from "@/components/Icon";

const KPIS = [
  { label: "Valor total", value: "$124.500", icon: "payments", tint: "text-primary-container bg-surface-container", foot: "+4,2% vs. mes pasado", footCls: "text-[#059669]", trend: "trending_up" },
  { label: "Stock bajo", value: "24", unit: "artículos", icon: "warning", tint: "text-error bg-error-container", foot: "Requiere acción inmediata", footCls: "text-error", trend: "priority_high" },
  { label: "Movimientos", value: "1.842", icon: "sync_alt", tint: "text-surface-tint bg-surface-variant", foot: "Volumen estable", footCls: "text-on-surface-variant", trend: "trending_flat" },
  { label: "Rotación", value: "4,8", unit: "x", icon: "rotate_right", tint: "text-secondary bg-secondary-container", foot: "+0,5 de mejora", footCls: "text-[#059669]", trend: "trending_up" },
];

const BARRAS = [
  { cat: "Bebidas", h: 80, val: "8.400", crit: false },
  { cat: "Snacks", h: 65, val: "6.200", crit: false },
  { cat: "Lácteos", h: 40, val: "3.800", crit: false },
  { cat: "Frescos", h: 15, val: "1.100", crit: true },
  { cat: "Enlatados", h: 55, val: "5.100", crit: false },
  { cat: "Secos", h: 90, val: "9.200", crit: false },
];

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun"];

export default function ReportesPage() {
  return (
    <div className="max-w-container-max mx-auto w-full flex flex-col gap-lg">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Reportes gerenciales</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Indicadores clave para la toma de decisiones.
          </p>
        </div>
        <div className="flex gap-sm">
          <button className="px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-label-md text-label-md text-primary flex items-center gap-xs hover:bg-surface-container-low transition-colors">
            <Icon name="calendar_month" className="text-[18px]" /> Este mes
          </button>
          <button className="px-md py-sm bg-primary text-on-primary rounded-lg font-label-md text-label-md flex items-center gap-xs hover:bg-primary-container transition-colors">
            <Icon name="download" className="text-[18px]" /> Exportar
          </button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
        {KPIS.map((k) => (
          <div key={k.label} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-md">
              <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">{k.label}</p>
              <Icon name={k.icon} className={`rounded-lg p-sm ${k.tint}`} />
            </div>
            <div>
              <h3 className="font-headline-lg text-headline-lg text-on-surface mb-xs">
                {k.value}
                {k.unit && <span className="font-headline-sm text-headline-sm text-on-surface-variant"> {k.unit}</span>}
              </h3>
              <p className={`font-body-sm text-body-sm flex items-center gap-xs ${k.footCls}`}>
                <Icon name={k.trend} className="text-[16px]" /> {k.foot}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        {/* Barras: stock por categoría */}
        <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm flex flex-col p-lg min-h-[340px]">
          <div className="flex justify-between items-center mb-xl">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Existencias por categoría</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Volumen actual en almacén</p>
            </div>
          </div>
          <div className="flex-1 flex items-end gap-md pt-lg">
            {BARRAS.map((b) => (
              <div key={b.cat} className="flex-1 flex flex-col items-center gap-sm group cursor-pointer">
                <div className="w-full flex items-end h-full">
                  <div
                    className={`w-full rounded-t-sm transition-colors ${b.crit ? "bg-error-container border border-error" : "bg-primary-container group-hover:bg-primary"}`}
                    style={{ height: `${b.h}%` }}
                    title={b.val}
                  />
                </div>
                <span className={`font-label-sm text-label-sm text-center truncate w-full ${b.crit ? "text-error font-medium" : "text-on-surface-variant"}`}>
                  {b.cat}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Dona: rotación */}
        <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm flex flex-col p-lg">
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-xs">Velocidad de rotación</h3>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-xl">Análisis de antigüedad</p>
          <div className="flex-1 flex flex-col items-center justify-center">
            <div
              className="w-48 h-48 rounded-full border border-outline-variant/20 relative flex items-center justify-center"
              style={{ background: "conic-gradient(#03224d 0% 60%, #505f76 60% 85%, #c4c7c9 85% 100%)" }}
            >
              <div className="w-32 h-32 bg-surface-container-lowest rounded-full flex items-center justify-center shadow-sm">
                <div className="text-center">
                  <span className="block font-headline-md text-headline-md text-on-surface">60%</span>
                  <span className="block font-label-sm text-label-sm text-on-surface-variant">Rápida</span>
                </div>
              </div>
            </div>
            <div className="w-full mt-xl flex flex-col gap-sm">
              {[
                { c: "bg-primary", t: "Rápida (< 30 días)", v: "60%" },
                { c: "bg-secondary", t: "Media (30–90 días)", v: "25%" },
                { c: "bg-tertiary-fixed-dim", t: "Lenta (> 90 días)", v: "15%" },
              ].map((r) => (
                <div key={r.t} className="flex items-center justify-between">
                  <div className="flex items-center gap-sm">
                    <div className={`w-sm h-sm rounded-full ${r.c}`} />
                    <span className="font-body-sm text-body-sm text-on-surface">{r.t}</span>
                  </div>
                  <span className="font-data-mono text-data-mono text-on-surface-variant">{r.v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Líneas: historial de movimientos */}
        <div className="lg:col-span-12 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm flex flex-col p-lg min-h-[300px]">
          <div className="flex justify-between items-center mb-xl">
            <div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Historial de movimientos</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Entradas vs. salidas en 6 meses</p>
            </div>
            <div className="flex gap-md items-center">
              <div className="flex items-center gap-xs">
                <div className="w-md h-[2px] bg-primary" />
                <span className="font-label-sm text-label-sm text-on-surface-variant">Salidas</span>
              </div>
              <div className="flex items-center gap-xs">
                <div className="w-md h-[2px] bg-secondary border border-secondary border-dashed" />
                <span className="font-label-sm text-label-sm text-on-surface-variant">Entradas</span>
              </div>
            </div>
          </div>
          <div className="flex-1 w-full relative min-h-[220px]">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 1000 220" preserveAspectRatio="none">
              <line stroke="#c4c6d0" strokeOpacity="0.3" x1="0" x2="1000" y1="50" y2="50" />
              <line stroke="#c4c6d0" strokeOpacity="0.3" x1="0" x2="1000" y1="100" y2="100" />
              <line stroke="#c4c6d0" strokeOpacity="0.3" x1="0" x2="1000" y1="150" y2="150" />
              <line stroke="#c4c6d0" strokeOpacity="0.8" x1="0" x2="1000" y1="200" y2="200" />
              <path d="M0,180 C100,160 200,190 300,140 C400,90 500,150 600,120 C700,90 800,130 900,100 L1000,110" fill="none" opacity="0.6" stroke="#505f76" strokeDasharray="6,4" strokeWidth="2" />
              <path d="M0,150 C150,120 250,80 400,100 C550,120 650,40 800,60 C900,70 950,30 1000,20 L1000,200 L0,200 Z" fill="#e7eeff" opacity="0.6" />
              <path d="M0,150 C150,120 250,80 400,100 C550,120 650,40 800,60 C900,70 950,30 1000,20" fill="none" stroke="#03224d" strokeWidth="3" />
              {MESES.map((m, i) => (
                <text key={m} fill="#44474f" fontFamily="Inter" fontSize="12" fontWeight="600" x={i * 200} y="218">{m}</text>
              ))}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
