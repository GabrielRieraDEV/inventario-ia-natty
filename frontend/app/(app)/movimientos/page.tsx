import { Icon } from "@/components/Icon";

export default function MovimientosPage() {
  return (
    <div className="w-full max-w-container-max mx-auto">
      <div className="mb-lg">
        <h2 className="font-headline-lg text-headline-lg text-on-background">Registrar movimiento</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
          Registra entradas de mercancía o salidas de despacho.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-lg items-start">
        {/* Formulario */}
        <div className="xl:col-span-8 space-y-lg">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
            <form className="space-y-lg">
              {/* Producto */}
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-sm block">Producto</label>
                <div className="relative">
                  <Icon name="search" className="absolute left-md top-1/2 -translate-y-1/2 text-outline" />
                  <input
                    type="text"
                    defaultValue="Cerveza Polar Pilsen 355ml (Caja x24)"
                    placeholder="Selecciona o escanea un producto…"
                    className="w-full pl-[40px] pr-md py-md bg-surface-bright border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-shadow"
                  />
                </div>
              </div>

              <hr className="border-outline-variant opacity-50" />

              {/* Tipo y cantidad */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                <div>
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-sm block">Tipo de movimiento</label>
                  <div className="flex rounded-lg border border-outline-variant p-xs bg-surface-bright">
                    <label className="flex-1 cursor-pointer">
                      <input defaultChecked className="peer sr-only" name="tipo" type="radio" value="entrada" />
                      <div className="text-center py-sm rounded-md font-label-md text-label-md peer-checked:bg-primary-container peer-checked:text-on-primary-container text-on-surface-variant hover:bg-surface-container transition-colors flex items-center justify-center gap-xs">
                        <Icon name="arrow_downward" fill className="text-[18px]" /> Entrada
                      </div>
                    </label>
                    <label className="flex-1 cursor-pointer">
                      <input className="peer sr-only" name="tipo" type="radio" value="salida" />
                      <div className="text-center py-sm rounded-md font-label-md text-label-md peer-checked:bg-error-container peer-checked:text-on-error-container text-on-surface-variant hover:bg-surface-container transition-colors flex items-center justify-center gap-xs">
                        <Icon name="arrow_upward" fill className="text-[18px]" /> Salida
                      </div>
                    </label>
                  </div>
                </div>
                <div>
                  <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-sm block">Cantidad</label>
                  <div className="relative">
                    <input type="number" min={1} defaultValue={5} className="w-full px-md py-md bg-surface-bright border border-outline-variant rounded-lg font-data-mono text-body-lg text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-shadow text-right pr-[60px]" />
                    <div className="absolute right-md top-1/2 -translate-y-1/2 font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-sm py-xs rounded border border-outline-variant">Cajas</div>
                  </div>
                </div>
              </div>

              {/* Responsable */}
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-sm block">Responsable</label>
                <select className="w-full px-md py-md bg-surface-bright border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-shadow appearance-none">
                  <option>Carlos Mendoza (Encargado de almacén)</option>
                  <option>Ana Silva (Logística)</option>
                  <option>Proveedor externo</option>
                </select>
              </div>

              {/* Notas */}
              <div>
                <label className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-sm block">Notas (opcional)</label>
                <textarea rows={3} placeholder="Agrega detalles relevantes sobre este movimiento…" className="w-full px-md py-sm bg-surface-bright border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-shadow resize-none" />
              </div>

              {/* Acciones */}
              <div className="pt-md flex items-center justify-end gap-md border-t border-outline-variant mt-lg">
                <button type="button" className="font-label-md text-label-md text-on-surface-variant px-xl py-[10px] rounded-lg hover:bg-surface-container transition-colors">Cancelar</button>
                <button type="button" className="font-label-md text-label-md bg-primary text-on-primary px-xl py-[10px] rounded-lg hover:shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] transition-all flex items-center gap-sm">
                  <Icon name="check_circle" fill className="text-[18px]" /> Confirmar movimiento
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Impacto */}
        <div className="xl:col-span-4">
          <div className="sticky top-[100px]">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg flex flex-col">
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md flex items-center gap-sm border-b border-outline-variant pb-md">
                <Icon name="analytics" className="text-surface-tint" /> Impacto del movimiento
              </h3>
              <div className="space-y-lg py-md">
                <div>
                  <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Producto seleccionado</p>
                  <p className="font-body-md text-body-md font-medium text-on-surface">Cerveza Polar Pilsen 355ml (Caja x24)</p>
                  <p className="font-data-mono text-data-mono text-on-surface-variant mt-xs">SKU: POL-PIL-355-24</p>
                </div>
                <div className="bg-surface-container rounded-lg p-md border border-outline-variant space-y-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-body-md text-body-md text-on-surface-variant">Stock actual</span>
                    <span className="font-data-mono text-body-lg text-on-surface">142</span>
                  </div>
                  <div className="flex justify-between items-center text-primary">
                    <span className="font-body-md text-body-md">Entrada</span>
                    <span className="font-data-mono text-body-lg font-bold flex items-center gap-xs"><Icon name="add" className="text-[16px]" /> 5</span>
                  </div>
                  <hr className="border-outline-variant my-sm" />
                  <div className="flex justify-between items-center">
                    <span className="font-label-md text-label-md text-on-surface uppercase tracking-wider">Nuevo stock</span>
                    <span className="font-data-mono text-headline-md font-bold text-on-background">147</span>
                  </div>
                </div>
                <div className="flex items-start gap-sm bg-surface-bright border border-outline-variant rounded-lg p-md">
                  <Icon name="info" fill className="text-primary mt-[2px]" />
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">Nivel de stock óptimo</p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">El nuevo nivel supera el umbral mínimo de 50 unidades.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
