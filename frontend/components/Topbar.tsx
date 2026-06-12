"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";
import { cerrarSesion, getUsuario, type Usuario } from "@/lib/api";

export function Topbar() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [menu, setMenu] = useState<"none" | "cuenta" | "notif">("none");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setUsuario(getUsuario()), []);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setMenu("none");
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function salir() {
    cerrarSesion();
    router.push("/login");
  }

  const iniciales = usuario?.nombre
    ? usuario.nombre.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()
    : "PN";

  return (
    <header className="bg-surface sticky top-0 z-40 border-b border-outline-variant flex justify-between items-center w-full px-xl py-md">
      {/* Buscador */}
      <div className="flex-1 max-w-md hidden md:flex relative items-center">
        <Icon name="search" className="absolute left-sm text-on-surface-variant z-10 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar en el inventario..."
          className="w-full bg-[#F1F5F9] border-none rounded-lg pl-xl pr-sm py-[8px] font-body-sm text-on-surface focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all outline-none"
        />
      </div>

      <h1 className="md:hidden font-headline-sm text-headline-sm font-black text-primary">
        Pa&apos; Donde Natty
      </h1>

      <div className="flex items-center gap-xs relative" ref={ref}>
        {/* Notificaciones */}
        <button
          onClick={() => setMenu(menu === "notif" ? "none" : "notif")}
          className="text-on-surface-variant hover:bg-surface-container-high rounded-full p-sm transition-all relative focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <Icon name="notifications" />
          <span className="absolute top-1 right-2 w-2 h-2 bg-error rounded-full border border-surface" />
        </button>

        {/* Vincular teléfono */}
        <Link
          href="/qr"
          className="text-on-surface-variant hover:bg-surface-container-high rounded-full p-sm transition-all focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Vincular captura móvil"
        >
          <Icon name="qr_code_scanner" />
        </Link>

        {/* Cuenta */}
        <button
          onClick={() => setMenu(menu === "cuenta" ? "none" : "cuenta")}
          className="text-on-surface-variant hover:bg-surface-container-high rounded-full p-sm transition-all ml-sm focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          <Icon name="account_circle" fill />
        </button>

        {/* Menú notificaciones */}
        {menu === "notif" && (
          <div className="absolute right-0 top-12 w-72 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg overflow-hidden">
            <div className="px-md py-sm border-b border-outline-variant flex items-center gap-sm bg-[#F8FAF9]">
              <Icon name="warning" className="text-error text-[18px]" />
              <span className="font-label-md text-label-md text-on-surface">Alertas recientes</span>
            </div>
            <p className="px-md py-md font-body-sm text-body-sm text-on-surface-variant">
              Revisa el stock crítico y los productos por vencer.
            </p>
            <Link
              href="/alertas"
              onClick={() => setMenu("none")}
              className="block px-md py-sm text-center font-label-sm text-label-sm text-primary hover:bg-surface-container-low border-t border-outline-variant"
            >
              Ver todas las alertas
            </Link>
          </div>
        )}

        {/* Menú cuenta */}
        {menu === "cuenta" && (
          <div className="absolute right-0 top-12 w-64 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg overflow-hidden">
            <div className="px-md py-md border-b border-outline-variant flex items-center gap-sm">
              <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold">
                {iniciales}
              </div>
              <div className="min-w-0">
                <p className="font-label-md text-label-md text-on-surface truncate">
                  {usuario?.nombre ?? "Invitado"}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant capitalize">
                  {usuario?.rol ?? "—"}
                </p>
              </div>
            </div>
            <Link
              href="/configuracion"
              onClick={() => setMenu("none")}
              className="flex items-center gap-sm px-md py-sm font-label-md text-label-md text-on-surface hover:bg-surface-container-low"
            >
              <Icon name="settings" className="text-[20px]" /> Configuración
            </Link>
            <button
              onClick={salir}
              className="w-full flex items-center gap-sm px-md py-sm font-label-md text-label-md text-error hover:bg-error-container/40 border-t border-outline-variant"
            >
              <Icon name="logout" className="text-[20px]" /> Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
