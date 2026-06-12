import { Icon } from "@/components/Icon";

export default function ReconocimientoPage() {
  return (
    <div className="max-w-container-max mx-auto w-full">
      <div className="mb-lg">
        <h2 className="font-headline-lg text-headline-lg text-on-background">Resultado del reconocimiento</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
          Verifica el producto identificado por la IA y confirma el registro.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-start">
        {/* Foto capturada */}
        <div className="lg:col-span-5 relative rounded-xl overflow-hidden border border-outline-variant bg-gradient-to-br from-surface-container to-surface-container-high shadow-sm h-[420px] lg:h-[600px] flex items-center justify-center">
          <Icon name="photo_camera" className="text-outline text-[80px]" />
          <div className="absolute inset-0 border-2 border-primary border-dashed opacity-50 m-lg rounded-lg" />
          <div className="absolute top-md right-md bg-surface-container-lowest/90 backdrop-blur-sm px-md py-xs rounded-full border border-outline-variant flex items-center gap-xs shadow-sm">
            <Icon name="document_scanner" className="text-primary text-[18px]" />
            <span className="font-label-sm text-label-sm text-primary">Escaneo completo</span>
          </div>
        </div>

        {/* Resultados IA */}
        <div className="lg:col-span-7 flex flex-col gap-lg">
          <div className="grid grid-cols-2 gap-md">
            <div className="col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
              <div className="flex items-start gap-sm mb-sm">
                <Icon name="auto_awesome" className="text-primary" />
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Producto identificado</p>
              </div>
              <h3 className="font-headline-md text-headline-md text-on-background">Aceite de Girasol 1L</h3>
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm">
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Categoría</p>
              <p className="font-body-lg text-body-lg text-on-background font-medium">Abarrotes</p>
            </div>

            <div className="bg-surface-container-low border border-outline-variant rounded-xl p-md shadow-sm flex flex-col justify-between">
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Confianza IA</p>
              <div className="flex items-center gap-sm">
                <div className="w-full bg-outline-variant/30 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "98%" }} />
                </div>
                <span className="font-headline-sm text-headline-sm text-primary">98%</span>
              </div>
            </div>
          </div>

          {/* Detalles de ingreso */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
            <h4 className="font-headline-sm text-headline-sm text-on-background mb-md">Detalles de ingreso</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="cantidad">Cantidad a agregar</label>
                <input id="cantidad" type="number" min={1} defaultValue={24} className="border border-outline-variant rounded-md px-md py-sm font-body-md text-on-background focus:ring-2 focus:ring-primary focus:ring-offset-2 outline-none transition-shadow w-full bg-surface-bright" />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="vencimiento">Fecha de vencimiento</label>
                <input id="vencimiento" type="date" className="border border-outline-variant rounded-md px-md py-sm font-body-md text-on-background focus:ring-2 focus:ring-primary focus:ring-offset-2 outline-none transition-shadow w-full bg-surface-bright" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-md pt-lg">
              <button className="bg-surface-container-lowest border border-primary text-primary hover:bg-surface-container-high font-label-md text-label-md px-xl py-sm rounded-md transition-colors shadow-sm">
                Corregir
              </button>
              <button className="bg-primary text-on-primary hover:bg-primary/90 font-label-md text-label-md px-xl py-sm rounded-md transition-all shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] flex items-center gap-sm">
                <Icon name="check" className="text-[18px]" /> Confirmar registro
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
