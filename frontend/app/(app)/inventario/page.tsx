import { Icon } from "@/components/Icon";

const ITEMS = [
  { id: "#INV-8492", nombre: "Leche Larga Vida", cat: "Lácteos", stock: 4, estado: "critico" },
  { id: "#INV-8493", nombre: "Azúcar 1kg", cat: "Abarrotes", stock: 14, estado: "bajo" },
  { id: "#INV-8494", nombre: "Arroz Blanco 1kg", cat: "Abarrotes", stock: 85, estado: "normal" },
  { id: "#INV-8495", nombre: "Aceite de Girasol 900ml", cat: "Abarrotes", stock: 2, estado: "critico" },
  { id: "#INV-8496", nombre: "Harina de Trigo 1kg", cat: "Abarrotes", stock: 120, estado: "normal" },
  { id: "#INV-8497", nombre: "Café Molido 500g", cat: "Bebidas", stock: 25, estado: "bajo" },
];

const estadoBadge = {
  critico: { cls: "bg-error-container text-on-error-container", label: "Crítico", bold: true },
  bajo: { cls: "bg-surface-variant text-on-surface-variant", label: "Bajo", bold: false },
  normal: { cls: "bg-primary-fixed text-on-primary-fixed", label: "Normal", bold: false },
} as const;

export default function InventarioPage() {
  return (
    <div className="max-w-container-max mx-auto flex flex-col gap-lg w-full">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-surface">Inventario actual</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
            Consulta los niveles de existencias e identifica faltantes críticos.
          </p>
        </div>
        <div className="flex items-center gap-md">
          <button className="flex items-center gap-xs px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface font-label-md text-label-md hover:bg-surface-container-low transition-colors shadow-sm">
            <Icon name="filter_list" className="text-[20px]" /> Filtrar
          </button>
          <button className="flex items-center gap-xs px-md py-sm bg-primary text-on-primary rounded-lg font-label-md text-label-md hover:bg-primary-container transition-colors shadow-sm">
            <Icon name="add" className="text-[20px]" /> Nuevo producto
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden flex flex-col shadow-sm">
        <div className="px-md py-sm border-b border-outline-variant flex items-center justify-between">
          <span className="font-label-sm text-label-sm text-on-surface-variant">Mostrando 6 artículos</span>
          <button className="text-on-surface-variant hover:text-on-surface transition-colors"><Icon name="more_vert" /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="bg-surface-container-low font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider border-b border-outline-variant">
              <tr>
                <th className="px-md py-sm font-medium">ID</th>
                <th className="px-md py-sm font-medium">Producto</th>
                <th className="px-md py-sm font-medium">Categoría</th>
                <th className="px-md py-sm font-medium text-right">Stock actual</th>
                <th className="px-md py-sm font-medium">Estado</th>
                <th className="px-md py-sm font-medium text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {ITEMS.map((it) => {
                const e = estadoBadge[it.estado as keyof typeof estadoBadge];
                return (
                  <tr key={it.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="px-md py-md whitespace-nowrap font-data-mono text-data-mono text-on-surface-variant">{it.id}</td>
                    <td className="px-md py-md font-label-md text-label-md text-on-surface">{it.nombre}</td>
                    <td className="px-md py-md whitespace-nowrap font-body-sm text-body-sm text-on-surface-variant">{it.cat}</td>
                    <td className={`px-md py-md whitespace-nowrap text-right font-data-mono text-data-mono text-on-surface ${e.bold ? "font-bold" : ""}`}>{it.stock}</td>
                    <td className="px-md py-md whitespace-nowrap">
                      <span className={`inline-flex items-center px-sm py-xs rounded-full font-label-sm text-label-sm ${e.cls}`}>{e.label}</span>
                    </td>
                    <td className="px-md py-md whitespace-nowrap text-right">
                      <button className="text-on-surface-variant hover:text-primary transition-colors opacity-0 group-hover:opacity-100"><Icon name="edit" /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
