import Link from "next/link";
import { Icon } from "@/components/Icon";

// Datos de muestra (se reemplazan por datos reales del backend al integrar).
const KPIS = [
  { label: "Total de productos", value: "1.240", icon: "inventory_2", tint: "bg-surface-container text-primary", foot: "+2,4% vs. semana pasada", footCls: "text-[#059669]" },
  { label: "Alertas activas", value: "5", icon: "warning", tint: "bg-error-container text-on-error-container", foot: "Requieren atención inmediata", footCls: "text-error", valueCls: "text-error" },
  { label: "Movimientos hoy", value: "12", icon: "sync_alt", tint: "bg-secondary-container text-on-secondary-container", foot: "8 entradas, 4 salidas" },
  { label: "Categorías", value: "15", icon: "category", tint: "bg-surface-container text-secondary", foot: "Distribuidas en 4 zonas" },
];

const MOVS = [
  { ini: "AP", nombre: "Arroz Primor", tipo: "entrada", qty: "+50", hora: "10:42 a. m." },
  { ini: "HP", nombre: "Harina PAN", tipo: "salida", qty: "-20", hora: "09:15 a. m." },
  { ini: "AM", nombre: "Aceite Mazeite", tipo: "entrada", qty: "+120", hora: "Ayer" },
  { ini: "CF", nombre: "Café Fama de América", tipo: "ajuste", qty: "-2", hora: "Ayer" },
];

const ALERTAS = [
  { nombre: "Azúcar Montalbán", sku: "AZC-001", unidades: "3 uds.", min: "Mín: 20", critico: true },
  { nombre: "Leche Campestre", sku: "LCH-042", unidades: "12 uds.", min: "Mín: 50", critico: false },
  { nombre: "Mantequilla Mavesa", sku: "MTV-011", unidades: "0 uds.", min: "Mín: 15", critico: true },
  { nombre: "Pasta Mary", sku: "PST-088", unidades: "8 uds.", min: "Mín: 30", critico: false },
];

const tipoBadge = {
  entrada: { cls: "bg-[#dcfce7] text-[#166534] border-[#bbf7d0]", icon: "south_west", label: "Entrada" },
  salida: { cls: "bg-[#fee2e2] text-[#991b1b] border-[#fecaca]", icon: "north_east", label: "Salida" },
  ajuste: { cls: "bg-[#fef3c7] text-[#92400e] border-[#fde68a]", icon: "published_with_changes", label: "Ajuste" },
} as const;

const qtyColor = { entrada: "text-[#166534]", salida: "text-[#991b1b]", ajuste: "text-[#92400e]" } as const;

export default function DashboardPage() {
  return (
    <>
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-md">
        <div>
          <h2 className="font-headline-md text-headline-md text-on-background">Panel general</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Métricas del inventario en tiempo real.
          </p>
        </div>
        <div className="flex gap-sm">
          <button className="bg-surface-container-lowest border border-primary text-primary font-label-md text-label-md px-md py-sm rounded-lg hover:bg-surface-container-low transition-colors flex items-center gap-xs shadow-sm">
            <Icon name="download" className="text-[18px]" /> Exportar
          </button>
          <Link
            href="/movimientos"
            className="bg-primary text-surface-bright font-label-md text-label-md px-md py-sm rounded-lg hover:bg-primary-container transition-colors shadow-sm flex items-center gap-xs"
          >
            <Icon name="add" className="text-[18px]" /> Nuevo movimiento
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-lg">
        {KPIS.map((k) => (
          <div
            key={k.label}
            className="md:col-span-3 bg-surface-container-lowest border border-[#E2E8F0] rounded-xl p-lg flex flex-col justify-between"
          >
            <div className="flex justify-between items-start mb-md">
              <span className="font-label-md text-label-md text-on-surface-variant">{k.label}</span>
              <div className={`p-1.5 rounded-md ${k.tint}`}>
                <Icon name={k.icon} className="text-[20px]" />
              </div>
            </div>
            <div>
              <div className={`font-headline-lg text-headline-lg ${k.valueCls ?? "text-on-background"}`}>
                {k.value}
              </div>
              <div className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                <span className={k.footCls}>{k.foot}</span>
              </div>
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
                {MOVS.map((m) => (
                  <tr key={m.nombre} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-md px-md">
                      <div className="flex items-center gap-sm">
                        <div className="w-8 h-8 rounded bg-surface-container flex items-center justify-center text-primary font-bold text-xs">
                          {m.ini}
                        </div>
                        <span className="font-medium text-on-background">{m.nombre}</span>
                      </div>
                    </td>
                    <td className="py-md px-md">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md font-label-sm text-[11px] border ${tipoBadge[m.tipo as keyof typeof tipoBadge].cls}`}>
                        <Icon name={tipoBadge[m.tipo as keyof typeof tipoBadge].icon} className="text-[12px]" />
                        {tipoBadge[m.tipo as keyof typeof tipoBadge].label}
                      </span>
                    </td>
                    <td className={`py-md px-md text-right font-data-mono font-medium ${qtyColor[m.tipo as keyof typeof qtyColor]}`}>
                      {m.qty}
                    </td>
                    <td className="py-md px-md text-right text-on-surface-variant hidden sm:table-cell">{m.hora}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alertas de stock */}
        <div className="md:col-span-4 bg-surface-container-lowest border border-[#E2E8F0] rounded-xl flex flex-col overflow-hidden">
          <div className="p-md border-b border-outline-variant flex items-center gap-sm bg-[#F8FAF9]">
            <Icon name="warning" className="text-error" />
            <h3 className="font-headline-sm text-headline-sm text-on-background">Alertas de stock</h3>
          </div>
          <ul className="divide-y divide-[#E2E8F0]">
            {ALERTAS.map((a) => (
              <li key={a.sku} className="p-md flex justify-between items-center hover:bg-surface-container-low transition-colors">
                <div>
                  <div className="font-label-md text-label-md text-on-background">{a.nombre}</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">SKU: {a.sku}</div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <span
                    className={`font-label-sm px-2 py-1 rounded-md border ${
                      a.critico
                        ? "bg-error-container text-on-error-container border-error"
                        : "bg-[#ffedd5] text-[#9a3412] border-[#fed7aa]"
                    }`}
                  >
                    {a.unidades}
                  </span>
                  <span className="font-body-sm text-[11px] text-on-surface-variant mt-1">{a.min}</span>
                </div>
              </li>
            ))}
          </ul>
          <div className="p-sm bg-surface-container-low text-center border-t border-outline-variant mt-auto">
            <Link href="/alertas" className="text-primary font-label-sm text-label-sm hover:underline block py-sm">
              Generar orden de reposición
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
