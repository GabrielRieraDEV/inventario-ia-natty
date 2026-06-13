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
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [estado, setEstado] = useState<Estado>("iniciando");
  const [foto, setFoto] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [torch, setTorch] = useState(false);
  const [cerrado, setCerrado] = useState(false);

  function detener() {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }

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
      detener();
    };
  }, []);

  // Envía la imagen (de la cámara o la galería) al backend.
  const enviar = useCallback(
    async (blob: Blob) => {
      setEstado("enviando");
      setError(null);
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
    [token],
  );

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
    canvas.toBlob((b) => b && enviar(b), "image/jpeg", 0.9);
  }, [estado, enviar]);

  // Galería: seleccionar/tomar una foto desde el explorador del teléfono.
  function onArchivo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFoto(URL.createObjectURL(file));
    enviar(file);
  }

  // Flash (linterna): solo en dispositivos compatibles.
  async function alternarFlash() {
    const track = streamRef.current?.getVideoTracks()[0];
    // torch no está en los tipos estándar; capacidades dependen del dispositivo.
    const caps = (track?.getCapabilities?.() ?? {}) as { torch?: boolean };
    if (!track || !caps.torch) {
      setError("Este dispositivo no permite encender el flash.");
      return;
    }
    try {
      await track.applyConstraints({ advanced: [{ torch: !torch }] } as unknown as MediaTrackConstraints);
      setTorch((t) => !t);
    } catch {
      /* ignora */
    }
  }

  function cerrar() {
    detener();
    setCerrado(true);
  }

  function repetir() {
    setFoto(null);
    setEstado(streamRef.current ? "listo" : "iniciando");
  }

  if (cerrado) {
    return (
      <div className="fixed inset-0 bg-black text-surface-bright flex flex-col items-center justify-center gap-md px-xl text-center">
        <Icon name="check_circle" fill className="text-[#10B981] text-6xl" />
        <p className="font-headline-sm text-headline-sm">Cámara cerrada</p>
        <p className="font-body-sm text-body-sm text-on-primary-container">Puedes cerrar esta pestaña.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black text-surface-bright overflow-hidden select-none">
      <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={onArchivo} className="hidden" />

      {/* Cámara / foto */}
      <div className="absolute inset-0 z-0">
        {foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={foto} alt="Captura" className="w-full h-full object-cover" />
        ) : (
          <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
        )}
        {estado === "error" && !foto && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-md bg-black/80 px-xl text-center">
            <Icon name="no_photography" className="text-5xl text-on-primary-container" />
            <p className="font-body-lg text-body-lg">No se pudo acceder a la cámara.</p>
            <button onClick={() => fileRef.current?.click()} className="px-lg py-sm bg-surface-bright text-primary rounded-full font-label-md text-label-md flex items-center gap-sm">
              <Icon name="photo_library" /> Usar la galería
            </button>
          </div>
        )}
      </div>

      {/* Barra superior */}
      <div className="relative z-10 w-full pt-xl px-md pb-xl bg-gradient-to-b from-black/80 via-black/40 to-transparent flex justify-between items-start">
        <button onClick={cerrar} className="w-10 h-10 rounded-full bg-inverse-surface/60 backdrop-blur-md flex items-center justify-center" aria-label="Cerrar">
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
              <span className="font-label-md text-label-md tracking-wide">{estado === "error" ? "Sin cámara" : "Vinculado"}</span>
            </>
          )}
        </div>
        <button onClick={alternarFlash} className={`w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center ${torch ? "bg-primary-fixed text-primary" : "bg-inverse-surface/60"}`} aria-label="Flash">
          <Icon name={torch ? "flash_on" : "flash_off"} />
        </button>
      </div>

      {/* Retícula / mensaje */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center px-lg pointer-events-none -mt-24">
        {!foto ? (
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
        ) : (
          <div className="bg-black/60 backdrop-blur-md px-lg py-sm rounded-full border border-surface-bright/10 text-center pointer-events-auto">
            {estado === "enviando" && <p className="font-body-md text-body-md flex items-center gap-sm"><Icon name="progress_activity" className="animate-spin" /> Enviando y reconociendo…</p>}
            {estado === "enviado" && <p className="font-body-md text-body-md flex items-center gap-sm"><Icon name="check_circle" fill className="text-[#10B981]" /> ¡Listo! Revisa la PC</p>}
            {estado === "error" && <p className="font-body-md text-body-md flex items-center gap-sm text-error-container"><Icon name="error" /> {error ?? "Error al enviar"}</p>}
          </div>
        )}
      </div>

      {/* Controles inferiores */}
      <div className="absolute bottom-0 left-0 right-0 z-10 w-full pb-xxl pt-xl px-xl bg-gradient-to-t from-black via-black/80 to-transparent flex justify-between items-center">
        <button onClick={() => fileRef.current?.click()} className="w-12 h-12 rounded-full bg-inverse-surface/40 backdrop-blur-md flex items-center justify-center text-surface-bright/80" aria-label="Galería">
          <Icon name="photo_library" />
        </button>

        {foto ? (
          <button onClick={repetir} className="px-lg py-md rounded-full bg-surface-bright text-primary font-label-md text-label-md flex items-center gap-sm">
            <Icon name="replay" /> Repetir
          </button>
        ) : (
          <button onClick={capturar} className="relative group" aria-label="Capturar" disabled={estado !== "listo"}>
            <div className="w-[84px] h-[84px] rounded-full border-[3px] border-surface-bright/80 flex items-center justify-center p-1 group-active:scale-95 transition-transform duration-150">
              <div className={`w-full h-full rounded-full transition-colors duration-200 ${estado === "listo" ? "bg-surface-bright group-hover:bg-primary-fixed" : "bg-outline"}`} />
            </div>
          </button>
        )}

        <div className="w-12 h-12" /> {/* espaciador para centrar el botón de captura */}
      </div>
    </div>
  );
}
