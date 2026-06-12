import { Icon } from "@/components/Icon";

const STOCK = [
  {
    sku: "OLV-XTR-500", nombre: "Aceite de Oliva Extra Virgen 500ml", unidades: 2,
    critico: true, info: "Consumo prom.: 15/semana", extra: "Agotamiento en < 1 día", icon: "water_drop",
  },
  {
    sku: "COF-RST-1KG", nombre: "Café Tostado Artesanal 1kg", unidades: 12,
    critico: false, info: "Umbral mínimo: 15", extra: "", icon: "coffee",
  },
];

const VENCE = [
  { nombre: "Leche Entera 1L", dias: "3 días", lote: "#B-9982 • 24 uds.", critico: true },
  { nombre: "Mozzarella Fresca 200g", dias: "6 días", lote: "#B-1043 • 18 uds.", critico: false },
];

export default function AlertasPage() {
  return (
    <div className="max-w-container-max mx-auto w-full">
      {/* Encabezado */}
      <div className="mb-lg flex flex-col sm:flex-row sm:items-center justify-between gap-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Centro de alertas</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Atención inmediata para anomalías del inventario.
          </p>
        </div>
        <div className="flex gap-sm">
          <button className="px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-md font-label-md text-label-md text-primary flex items-center gap-sm hover:bg-surface-container-low transition-colors">
            <Icon name="filter_list" className="text-sm" /> Filtrar
          </button>
          <button className="px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-md font-label-md text-label-md text-primary flex items-center gap-sm hover:bg-surface-container-low transition-colors">
            <Icon name="download" className="text-sm" /> Exportar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        {/* Stock crítico */}
        <section className="lg:col-span-7 flex flex-col gap-md">
          <div className="flex items-center gap-sm mb-xs">
            <Icon name="warning" fill className="text-error" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Stock crítico</h3>
            <span className="bg-error-container text-on-error-container font-label-sm text-label-sm px-xs py-[2px] rounded-full ml-sm">
              {STOCK.length} artículos
            </span>
          </div>
          {STOCK.map((s) => (
            <div
              key={s.sku}
              className={`bg-surface-container-lowest border rounded-xl p-md flex flex-col sm:flex-row gap-md relative overflow-hidden ${
                s.critico ? "border-error-container" : "border-outline-variant"
              }`}
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${s.critico ? "bg-error" : "bg-[#F59E0B]"}`} />
              <div className="w-16 h-16 rounded-lg bg-surface-container-high flex-shrink-0 flex items-center justify-center text-primary border border-outline-variant">
                <Icon name={s.icon} className="text-3xl" />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-data-mono text-data-mono text-outline">SKU: {s.sku}</p>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface leading-tight mt-xs">{s.nombre}</h4>
                  </div>
                  <div className="text-right">
                    <p className={`text-[24px] leading-none font-bold ${s.critico ? "text-error" : "text-[#D97706]"}`}>{s.unidades}</p>
                    <p className="font-label-sm text-label-sm text-outline uppercase tracking-wide mt-xs">uds.</p>
                  </div>
                </div>
                <div className="flex items-center gap-sm mt-md">
                  <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-xs">
                    <Icon name="trending_down" className="text-[16px]" /> {s.info}
                  </p>
                  {s.extra && (
                    <>
                      <span className="w-1 h-1 bg-outline rounded-full" />
                      <p className="font-body-sm text-body-sm text-error font-medium">{s.extra}</p>
                    </>
                  )}
                </div>
              </div>
              <div className="sm:border-l border-outline-variant sm:pl-md flex flex-row sm:flex-col justify-center gap-sm">
                <button className="px-md py-sm bg-primary text-on-primary rounded-md font-label-md text-label-md hover:bg-primary-container transition-colors whitespace-nowrap">
                  Reponer
                </button>
                <button className="px-md py-sm bg-surface-container-lowest border border-outline-variant text-primary rounded-md font-label-md text-label-md hover:bg-surface-container-low transition-colors whitespace-nowrap">
                  Ignorar
                </button>
              </div>
            </div>
          ))}
        </section>

        {/* Vencimientos */}
        <section className="lg:col-span-5 flex flex-col gap-md">
          <div className="flex items-center gap-sm mb-xs">
            <Icon name="event_busy" fill className="text-secondary" />
            <h3 className="font-headline-sm text-headline-sm text-on-surface">Próximos a vencer</h3>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            {VENCE.map((v) => (
              <div key={v.nombre} className="p-md border-b border-outline-variant last:border-b-0 flex items-start gap-md hover:bg-surface-container-low transition-colors">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${v.critico ? "bg-[#FEF2F2] text-error" : "bg-[#FFFBEB] text-[#D97706]"}`}>
                  <Icon name="schedule" className="text-sm" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h5 className="font-label-md text-label-md text-on-surface">{v.nombre}</h5>
                    <span className={`font-data-mono text-data-mono font-bold ${v.critico ? "text-error" : "text-[#D97706]"}`}>{v.dias}</span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Lote: {v.lote}</p>
                  <div className="mt-sm flex gap-sm">
                    <button className="text-primary font-label-sm text-label-sm hover:underline">Descontar lote</button>
                    <span className="text-outline-variant">|</span>
                    <button className="text-on-surface-variant font-label-sm text-label-sm hover:underline">Marcar merma</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
