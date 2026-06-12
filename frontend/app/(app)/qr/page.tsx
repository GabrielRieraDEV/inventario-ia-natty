"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Icon } from "@/components/Icon";

export default function QrPage() {
  const [url, setUrl] = useState<string>("");

  useEffect(() => {
    // Token de sesión para vincular el teléfono a esta sesión de la PC.
    const token =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);
    setUrl(`${window.location.origin}/m/${token}`);
  }, []);

  return (
    <div className="flex-1 flex items-center justify-center p-md md:p-xl">
      <section className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-[0px_4px_6px_-1px_rgba(0,0,0,0.1)] p-xxl max-w-[540px] w-full flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-48 h-48 bg-primary-fixed opacity-30 rounded-full blur-3xl pointer-events-none" />

        <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mb-lg border border-surface-variant">
          <Icon name="devices" className="text-primary text-[32px]" />
        </div>

        <h2 className="font-headline-md text-headline-md text-on-background font-semibold mb-sm">
          Vincular teléfono
        </h2>
        <p className="font-body-lg text-body-lg text-on-surface-variant mb-xl max-w-sm">
          Escanea este código con la cámara de tu teléfono para vincularlo y capturar productos.
        </p>

        <div className="bg-white p-lg rounded-xl border border-outline-variant shadow-sm mb-xl flex items-center justify-center w-64 h-64 mx-auto">
          {url ? (
            <QRCodeSVG value={url} size={208} fgColor="#03224d" bgColor="#ffffff" level="M" />
          ) : (
            <Icon name="qr_code_2" className="text-outline text-[120px]" />
          )}
        </div>

        {url && (
          <p className="font-data-mono text-data-mono text-on-surface-variant break-all mb-lg max-w-sm">
            {url}
          </p>
        )}

        <button className="bg-surface-container-lowest border border-primary text-primary hover:bg-surface-container-low font-label-md text-label-md rounded-full px-xl py-sm transition-colors min-w-[140px]">
          Cancelar
        </button>
      </section>
    </div>
  );
}
