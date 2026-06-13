"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { Icon } from "@/components/Icon";
import { api } from "@/lib/api";

type Estado = "iniciando" | "listo" | "enviando" | "enviado" | "error";

export default function CapturaMovilPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token as string;
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [estado, setEstado] = useState<Estado>("iniciando");
  const [foto, setFoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let activo = true;
    async function iniciar() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        if (!activo) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setEstado("listo");
      } catch {
        setEstado("error");
      }
    }
    iniciar();
    return () => {
      activo = false;
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const capturar = useCallback(() => {
    const video = videoRef.current;
    if (!video || estado !== "listo") return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 720;
    canvas.height = video.videoHeight || 1280;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    setFoto(canvas.toDataURL("image/jpeg", 0.9));
    setEstado("enviando");
    setError(null);

    // Enviar la imagen al backend, que la reconoce con la IA y la refleja en la PC (RF-01).
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          setEstado("error");
          setError("No se pudo capturar la imagen.");
          return;
        }
        try {
          const form = new FormData();
          form.append("file", blob, "captura.jpg");
          await api.postForm(`/api/sesiones/${token}/capturar`, form);
          setEstado("enviado");
        } catch (e) {
          setEstado("error");
          setError(e instanceof Error ? e.message : "No se pudo enviar la foto.");
        }
      },
      "image/jpeg",
      0.9,
    );
  }, [estado, token]);

  return (
    <div className="fixed inset-0 bg-black text-surface-bright overflow-hidden select-none">
      {/* Cámara / foto capturada */}
      <div className="absolute inset-0 z-0">
        {foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={foto} alt="Captura" className="w-full h-full object-cover" />
        ) : (
          <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
        )}
        {estado === "error" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-md bg-black/80 px-xl text-center">
            <Icon name="no_photography" className="text-5xl text-on-primary-container" />
            <p className="font-body-lg text-body-lg">No se pudo acceder a la cámara.</p>
            <p className="font-body-sm text-body-sm text-on-primary-container">
              Concede el permiso de cámara o usa la galería.
            </p>
          </div>
        )}
      </div>

      {/* Barra superior */}
      <div className="relative z-10 w-full pt-xl px-md pb-xl bg-gradient-to-b from-black/80 via-black/40 to-transparent flex justify-between items-start">
        <button className="w-10 h-10 rounded-full bg-inverse-surface/60 backdrop-blur-md flex items-center justify-center">
          <Icon name="close" />
        </button>
        <div className="flex items-center gap-sm bg-inverse-surface/70 backdrop-blur-md px-md py-sm rounded-full border border-surface-bright/10 mt-xs">
          {estado === "iniciando" ? (
            <>
              <Icon name="progress_activity" className="animate-spin text-[18px] text-primary-fixed" />
              <span className="font-label-md text-label-md tracking-wide">Conectando…</span>
            </>
          ) : (
            <>
              <span className={`w-2 h-2 rounded-full ${estado === "error" ? "bg-error" : "bg-[#10B981]"}`} />
              <span className="font-label-md text-label-md tracking-wide">
                {estado === "error" ? "Sin cámara" : "Vinculado"}
              </span>
            </>
          )}
        </div>
        <button className="w-10 h-10 rounded-full bg-inverse-surface/60 backdrop-blur-md flex items-center justify-center">
          <Icon name="flash_auto" />
        </button>
      </div>

      {/* Retícula */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-lg pointer-events-none -mt-24">
        {!foto && (
          <>
            <div className="w-[280px] h-[280px] relative mb-xl">
              <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-primary-fixed rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-primary-fixed rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-primary-fixed rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-primary-fixed rounded-br-lg" />
            </div>
            <div className="bg-black/50 backdrop-blur-md px-lg py-sm rounded-full border border-surface-bright/10 text-center">
              <p className="font-body-md text-body-md">Apunta al producto o a su código de barras</p>
            </div>
          </>
        )}
        {foto && (
          <div className="bg-black/60 backdrop-blur-md px-lg py-sm rounded-full border border-surface-bright/10 text-center pointer-events-auto">
            {estado === "enviando" && (
              <p className="font-body-md text-body-md flex items-center gap-sm">
                <Icon name="progress_activity" className="animate-spin" /> Enviando y reconociendo…
              </p>
            )}
            {estado === "enviado" && (
              <p className="font-body-md text-body-md flex items-center gap-sm">
                <Icon name="check_circle" fill className="text-[#10B981]" /> ¡Listo! Revisa la pantalla de la PC
              </p>
            )}
            {estado === "error" && (
              <p className="font-body-md text-body-md flex items-center gap-sm text-error-container">
                <Icon name="error" /> {error ?? "Error al enviar"}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Controles inferiores */}
      <div className="absolute bottom-0 left-0 right-0 z-10 w-full pb-xxl pt-xl px-xl bg-gradient-to-t from-black via-black/80 to-transparent flex justify-between items-center">
        <button className="w-12 h-12 rounded-full bg-inverse-surface/40 backdrop-blur-md flex items-center justify-center text-surface-bright/80">
          <Icon name="photo_library" />
        </button>

        {foto ? (
          <button
            onClick={() => {
              setFoto(null);
              setEstado("listo");
            }}
            className="px-lg py-md rounded-full bg-surface-bright text-primary font-label-md text-label-md flex items-center gap-sm"
          >
            <Icon name="replay" /> Repetir
          </button>
        ) : (
          <button onClick={capturar} className="relative group" aria-label="Capturar">
            <div className="w-[84px] h-[84px] rounded-full border-[3px] border-surface-bright/80 flex items-center justify-center p-1 group-active:scale-95 transition-transform duration-150">
              <div className="w-full h-full rounded-full bg-surface-bright group-hover:bg-primary-fixed transition-colors duration-200" />
            </div>
          </button>
        )}

        <button className="w-12 h-12 rounded-full bg-inverse-surface/40 backdrop-blur-md flex items-center justify-center text-surface-bright/80">
          <Icon name="keyboard" />
        </button>
      </div>
    </div>
  );
}
