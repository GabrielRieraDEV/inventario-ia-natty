"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Icon } from "@/components/Icon";
import { api } from "@/lib/api";

type Producto = {
  nombre: string;
  marca: string | null;
  categoria: string | null;
  presentacion: string | null;
  confianza: number;
  texto_detectado: string | null;
};
type Sesion = { estado: string; resultado: { producto: Producto; tiempo_respuesta_s: number; imagen?: string } | null };

function blobADataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onloadend = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

function Contenido() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const tipo = params.get("tipo") === "salida" ? "salida" : "entrada";
  const esSalida = tipo === "salida";

  const [prod, setProd] = useState<Producto | null>(null);
  const [imagen, setImagen] = useState<string | null>(null);
  const [tiempo, setTiempo] = useState<number | null>(null);
  const [nombre, setNombre] = useState("");
  const [cantidad, setCantidad] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!token) { setError("No hay una sesión de reconocimiento."); return; }
    api
      .get<Sesion>(`/api/sesiones/${token}`)
      .then((s) => {
        if (s.resultado?.producto) {
          setProd(s.resultado.producto);
          setNombre(s.resultado.producto.nombre);
          setTiempo(s.resultado.tiempo_respuesta_s);
          setImagen(s.resultado.imagen ?? null);
        } else {
          setError("La sesión aún no tiene un resultado.");
        }
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error al cargar."));
  }, [token]);

  async function confirmar() {
    if (!token) return;
    setGuardando(true);
    setError(null);
    try {
      // Quita el fondo de la foto en el navegador (PNG transparente). Si falla,
      // se confirma igual y el backend guarda la foto original.
      let foto: string | undefined;
      if (imagen) {
        setProcesando(true);
        try {
          const { removeBackground } = await import("@imgly/background-removal");
          const recorte = await removeBackground(imagen);
          foto = await blobADataUrl(recorte);
        } catch {
          foto = undefined;
        } finally {
          setProcesando(false);
        }
      }
      await api.post(`/api/sesiones/${token}/confirmar`, { cantidad, nombre, foto, tipo });
      setOk(true);
      setTimeout(() => router.push("/inventario"), 1200);
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo confirmar.");
      setGuardando(false);
    }
  }

  const confianza = prod ? Math.round(prod.confianza * 100) : 0;

  return (
    <div className="max-w-container-max mx-auto w-full">
      <div className="mb-lg flex items-start justify-between gap-md flex-wrap">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-on-background">Resultado del reconocimiento</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Verifica el producto identificado por la IA y confirma el registro.</p>
        </div>
        <span className={`inline-flex items-center gap-xs px-md py-sm rounded-full font-label-md text-label-md ${esSalida ? "bg-error-container text-on-error-container" : "bg-primary-container text-on-primary-container"}`}>
          <Icon name={esSalida ? "arrow_upward" : "arrow_downward"} fill className="text-[18px]" />
          {esSalida ? "Salida" : "Entrada"}
        </span>
      </div>

      {error && (
        <div className="mb-lg flex items-center gap-sm bg-error-container text-on-error-container rounded-lg px-md py-sm font-body-sm text-body-sm">
          <Icon name="error" className="text-[18px]" /> {error}
        </div>
      )}

      {ok && (
        <div className="mb-lg flex items-center gap-sm bg-[#dcfce7] text-[#166534] rounded-lg px-md py-sm font-body-sm text-body-sm">
          <Icon name="check_circle" fill className="text-[18px]" /> ¡Registrado! Actualizando inventario…
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl items-start">
        {/* Foto capturada */}
        <div className="lg:col-span-5 relative rounded-xl overflow-hidden border border-outline-variant bg-gradient-to-br from-surface-container to-surface-container-high shadow-sm h-[360px] lg:h-[520px] flex items-center justify-center">
          {imagen ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagen} alt="Producto capturado" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <Icon name={prod ? "check_circle" : "photo_camera"} fill={!!prod} className={`text-[80px] ${prod ? "text-primary" : "text-outline"}`} />
          )}
          <div className="absolute inset-0 border-2 border-primary border-dashed opacity-40 m-lg rounded-lg pointer-events-none" />
          <div className="absolute top-md right-md bg-surface-container-lowest/90 backdrop-blur-sm px-md py-xs rounded-full border border-outline-variant flex items-center gap-xs shadow-sm">
            <Icon name="document_scanner" className="text-primary text-[18px]" />
            <span className="font-label-sm text-label-sm text-primary">{tiempo ? `${tiempo}s` : "Escaneo"}</span>
          </div>
        </div>

        {/* Resultados */}
        <div className="lg:col-span-7 flex flex-col gap-lg">
          <div className="grid grid-cols-2 gap-md">
            <div className="col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
              <div className="flex items-start gap-sm mb-sm">
                <Icon name="auto_awesome" className="text-primary" />
                <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Producto identificado</p>
              </div>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)}
                className="w-full font-headline-md text-headline-md text-on-background bg-transparent border-b border-transparent hover:border-outline-variant focus:border-primary outline-none transition-colors" />
            </div>

            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm">
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Categoría</p>
              <p className="font-body-lg text-body-lg text-on-background font-medium">{prod?.categoria ?? "—"}</p>
            </div>

            <div className="bg-surface-container-low border border-outline-variant rounded-xl p-md shadow-sm flex flex-col justify-between">
              <p className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">Confianza IA</p>
              <div className="flex items-center gap-sm">
                <div className="w-full bg-outline-variant/30 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: `${confianza}%` }} />
                </div>
                <span className="font-headline-sm text-headline-sm text-primary">{confianza}%</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
            <h4 className="font-headline-sm text-headline-sm text-on-background mb-md">Detalles de ingreso</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant" htmlFor="cantidad">{esSalida ? "Cantidad a despachar" : "Cantidad a agregar"}</label>
                <input id="cantidad" type="number" min={1} value={cantidad} onChange={(e) => setCantidad(Math.max(1, Number(e.target.value)))}
                  className="border border-outline-variant rounded-md px-md py-sm font-body-md text-on-background outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-surface-bright" />
              </div>
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface-variant">Presentación detectada</label>
                <div className="border border-outline-variant rounded-md px-md py-sm font-body-md text-on-surface-variant bg-surface-container-low">{prod?.presentacion ?? "—"}</div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-md pt-lg">
              <button onClick={() => router.push(`/qr?tipo=${tipo}`)} className="bg-surface-container-lowest border border-primary text-primary hover:bg-surface-container-high font-label-md text-label-md px-xl py-sm rounded-md transition-colors shadow-sm">
                Escanear otro
              </button>
              <button onClick={confirmar} disabled={!prod || guardando || ok}
                className="bg-primary text-on-primary hover:bg-primary/90 font-label-md text-label-md px-xl py-sm rounded-md transition-all flex items-center gap-sm disabled:opacity-70">
                <Icon name={guardando ? "progress_activity" : "check"} className={`text-[18px] ${guardando ? "animate-spin" : ""}`} />
                {procesando ? "Quitando fondo…" : guardando ? "Registrando…" : esSalida ? "Confirmar salida" : "Confirmar entrada"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReconocimientoPage() {
  return (
    <Suspense fallback={<div className="py-xl text-center text-on-surface-variant"><Icon name="progress_activity" className="animate-spin" /></div>}>
      <Contenido />
    </Suspense>
  );
}
