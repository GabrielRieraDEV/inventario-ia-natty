import { Icon } from "@/components/Icon";

const CATEGORIAS = ["Todas", "Bebidas", "Alimentos", "Limpieza", "Higiene personal"];

const PRODUCTOS = [
  { nombre: "Harina PAN", desc: "Harina de maíz precocida 1 kg", sku: "HPAN-001", cat: "Alimentos", precio: "$1,50", stock: 150, estado: "ok", icon: "bakery_dining" },
  { nombre: "Arroz Mary", desc: "Arroz blanco 1 kg", sku: "AMAR-001", cat: "Alimentos", precio: "$1,20", stock: 24, estado: "bajo", icon: "rice_bowl" },
  { nombre: "Coca-Cola 2L", desc: "Sabor original", sku: "COKE-2L", cat: "Bebidas", precio: "$2,50", stock: 80, estado: "ok", icon: "local_drink" },
  { nombre: "Detergente Ariel", desc: "Polvo 900 g", sku: "ARIEL-900", cat: "Limpieza", precio: "$4,00", stock: 3, estado: "critico", icon: "cleaning_services" },
];

const dot = { ok: "bg-[#10B981]", bajo: "bg-[#F59E0B]", critico: "bg-[#EF4444]" } as const;

export default function CatalogoPage() {
  return (
    <>
      {/* Encabezado */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary">Catálogo de productos</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">
            Administra los artículos, precios y niveles de existencias.
          </p>
        </div>
        <button className="flex items-center justify-center gap-xs px-md py-sm bg-primary text-on-primary rounded font-label-md text-label-md hover:bg-primary-container transition-colors shadow-sm">
          <Icon name="add" className="text-[18px]" /> Nuevo producto
        </button>
      </div>

      {/* Filtros */}
      <div className="bg-surface-container-lowest border border-[#E2E8F0] rounded-lg p-md flex flex-wrap gap-md items-center">
        <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Categorías:</span>
        {CATEGORIAS.map((c, i) => (
          <button
            key={c}
            className={`px-md py-xs rounded-full font-label-md text-label-md border transition-colors ${
              i === 0
                ? "bg-surface-container-high text-primary border-primary-fixed"
                : "bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-container"
            }`}
          >
            {c}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-sm">
          <button className="p-xs text-primary bg-surface-container rounded">
            <Icon name="view_list" />
          </button>
          <button className="p-xs text-outline hover:bg-surface-container transition-colors rounded">
            <Icon name="grid_view" />
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-surface-container-lowest border border-[#E2E8F0] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAF9] border-b border-[#E2E8F0]">
                {["Producto", "SKU", "Categoría", "Precio", "Stock"].map((h) => (
                  <th key={h} className="py-sm px-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{h}</th>
                ))}
                <th className="py-sm px-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {PRODUCTOS.map((p) => (
                <tr key={p.sku} className="hover:bg-surface-container-low transition-colors group">
                  <td className="py-md px-md">
                    <div className="flex items-center gap-md">
                      <div className="w-10 h-10 bg-surface-variant rounded flex items-center justify-center text-primary">
                        <Icon name={p.icon} />
                      </div>
                      <div>
                        <p className="font-label-md text-label-md text-on-surface">{p.nombre}</p>
                        <p className="font-body-sm text-body-sm text-on-surface-variant">{p.desc}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-md px-md font-data-mono text-data-mono text-on-surface-variant">{p.sku}</td>
                  <td className="py-md px-md">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface-container text-on-primary-fixed-variant">{p.cat}</span>
                  </td>
                  <td className="py-md px-md font-label-md text-label-md text-on-surface">{p.precio}</td>
                  <td className="py-md px-md">
                    <div className="flex items-center gap-xs">
                      <span className={`w-2 h-2 rounded-full ${dot[p.estado as keyof typeof dot]}`} />
                      <span className={`font-body-sm text-body-sm ${p.estado === "critico" ? "text-error" : "text-on-surface"}`}>
                        {p.stock} uds.
                      </span>
                    </div>
                  </td>
                  <td className="py-md px-md text-right">
                    <div className="flex items-center justify-end gap-sm opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-xs text-on-surface-variant hover:text-primary transition-colors" title="Ver"><Icon name="visibility" className="text-[20px]" /></button>
                      <button className="p-xs text-on-surface-variant hover:text-primary transition-colors" title="Editar"><Icon name="edit" className="text-[20px]" /></button>
                      <button className="p-xs text-on-surface-variant hover:text-error transition-colors" title="Eliminar"><Icon name="delete" className="text-[20px]" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Paginación */}
        <div className="bg-surface-container-lowest border-t border-[#E2E8F0] px-md py-sm flex items-center justify-between">
          <span className="font-body-sm text-body-sm text-on-surface-variant">Mostrando 1 a 4 de 42 registros</span>
          <div className="flex items-center gap-xs">
            <button className="px-sm py-xs border border-outline-variant rounded bg-surface-container-lowest text-on-surface-variant opacity-50" disabled>Anterior</button>
            <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-on-primary font-label-sm text-label-sm">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container font-label-sm text-label-sm transition-colors">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container font-label-sm text-label-sm transition-colors">3</button>
            <button className="px-sm py-xs border border-outline-variant rounded bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container transition-colors">Siguiente</button>
          </div>
        </div>
      </div>
    </>
  );
}
