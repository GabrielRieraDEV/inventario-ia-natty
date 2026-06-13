"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Icon } from "@/components/Icon";
import { api } from "@/lib/api";

type Sesion = { token: string; estado: string; resultado: unknown };

function Contenido() {
  const router = useRouter();
  const params = useSearchParams();
  const tipo = params.get("tipo") === "salida" ? "salida" : "entrada";
  const [token, setToken] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [estado, setEstado] = useState<string>("pendiente");
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  // Crear la sesión en el backend.
  useEffect(() => {
    api
      .post<{ token: string }>("/api/sesiones")
      .then((s) => {
        setToken(s.token);
        setUrl(`${window.location.origin}/m/${s.token}`);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "No se pudo crear la sesión."));
  }, []);

  // Poll hasta que el teléfono envíe la captura y la IA reconozca el producto.
  useEffect(() => {
    if (!token) return;
    timer.current = setInterval(async () => {
      try {
        const s = await api.get<Sesion>(`/api/sesiones/${token}`);
        setEstado(s.estado);
        if (s.estado === "reconocido") {
          if (timer.current) clearInterval(timer.current);
          router.push(`/reconocimiento?token=${token}&tipo=${tipo}`);
        } else if (s.estado === "expirada") {
          if (timer.current) clearInterval(timer.current);
        }
      } catch {
        /* reintenta en el próximo tick */
      }
    }, 2000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [token, router, tipo]);

  const esSalida = tipo === "salida";

  return (
    <div className="flex-1 flex items-center justify-center p-md md:p-xl">
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] p-xxl max-w-[540px] w-full flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-48 h-48 bg-primary-fixed opacity-30 rounded-full blur-3xl pointer-events-none" />

        <span className={`mb-md inline-flex items-center gap-xs px-md py-xs rounded-full font-label-sm text-label-sm ${esSalida ? "bg-error-container text-on-error-container" : "bg-primary-container text-on-primary-container"}`}>
          <Icon name={esSalida ? "arrow_upward" : "arrow_downward"} fill className="text-[16px]" />
          {esSalida ? "Salida con cámara" : "Entrada con cámara"}
        </span>

        <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-lg border border-surface-variant">
          <Icon name="devices" className="text-primary text-[32px]" />
        </div>

        <h2 className="font-headline-md text-headline-md text-on-background font-semibold mb-sm">Vincular teléfono</h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-xl max-w-sm">
          Escanea este código con la cámara de tu teléfono para registrar una {esSalida ? "salida" : "entrada"} por foto.
        </p>

        <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm mb-lg flex items-center justify-center w-64 h-64 mx-auto">
          {url ? (
            <QRCodeSVG value={url} size={208} fgColor="#03224d" bgColor="#ffffff" level="M" />
          ) : (
            <Icon name="qr_code_2" className="text-outline text-[120px] animate-pulse" />
          )}
        </div>

        {error ? (
          <p className="font-body-sm text-body-sm text-error mb-md">{error}</p>
        ) : estado === "expirada" ? (
          <div className="flex items-center gap-sm bg-surface-container-low rounded-full px-md py-sm mb-md">
            <Icon name="schedule" className="text-error text-[18px]" />
            <span className="font-label-md text-label-md text-on-surface-variant">
              La sesión expiró. Recarga la página para generar un nuevo código.
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-sm bg-surface-container-low rounded-full px-md py-sm mb-md">
            <Icon name="progress_activity" className="animate-spin text-primary text-[18px]" />
            <span className="font-label-md text-label-md text-on-surface-variant">
              {estado === "reconocido" ? "¡Producto reconocido!" : "Esperando captura del teléfono…"}
            </span>
          </div>
        )}

        {url && <p className="font-data-mono text-data-mono text-on-surface-variant break-all max-w-sm">{url}</p>}
      </section>
    </div>
  );
}

export default function QrPage() {
  return (
    <Suspense fallback={<div className="py-xl text-center text-on-surface-variant"><Icon name="progress_activity" className="animate-spin" /></div>}>
      <Contenido />
    </Suspense>
  );
}
