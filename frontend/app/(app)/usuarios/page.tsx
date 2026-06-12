"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/Icon";
import { api } from "@/lib/api";

type Usuario = {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  activo: boolean;
};

const ROLES = ["operario", "gerente", "admin"];

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({ nombre: "", email: "", password: "", rol: "operario" });
  const [guardando, setGuardando] = useState(false);

  async function cargar() {
    setCargando(true);
    setError(null);
    try {
      setUsuarios(await api.get<Usuario[]>("/api/usuarios"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudieron cargar los usuarios.");
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    try {
      await api.post("/api/usuarios", form);
      setForm({ nombre: "", email: "", password: "", rol: "operario" });
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo crear el usuario.");
    } finally {
      setGuardando(false);
    }
  }

  return (
    <div className="max-w-container-max mx-auto w-full">
      <div className="mb-lg">
        <h2 className="font-headline-lg text-headline-lg text-on-background">Gestión de usuarios</h2>
        <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
          Administra el acceso del personal y sus roles (RF-07).
        </p>
      </div>

      {error && (
        <div className="mb-lg flex items-center gap-sm bg-error-container text-on-error-container rounded-lg px-md py-sm font-body-sm text-body-sm">
          <Icon name="error" className="text-[18px]" /> {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg items-start">
        {/* Lista */}
        <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8FAF9] border-b border-[#E2E8F0]">
                  {["Nombre", "Correo", "Rol", "Estado"].map((h) => (
                    <th key={h} className="py-sm px-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {cargando ? (
                  <tr><td colSpan={4} className="py-xl text-center text-on-surface-variant"><Icon name="progress_activity" className="animate-spin" /></td></tr>
                ) : usuarios.length === 0 ? (
                  <tr><td colSpan={4} className="py-xl text-center font-body-sm text-on-surface-variant">Sin usuarios.</td></tr>
                ) : (
                  usuarios.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-md px-md font-label-md text-label-md text-on-surface">{u.nombre}</td>
                      <td className="py-md px-md font-body-sm text-body-sm text-on-surface-variant">{u.email}</td>
                      <td className="py-md px-md">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface-container text-on-primary-fixed-variant capitalize">{u.rol}</span>
                      </td>
                      <td className="py-md px-md">
                        <span className={`inline-flex items-center gap-1 font-body-sm text-body-sm ${u.activo ? "text-[#166534]" : "text-on-surface-variant"}`}>
                          <span className={`w-2 h-2 rounded-full ${u.activo ? "bg-[#10B981]" : "bg-outline"}`} />
                          {u.activo ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Alta */}
        <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg">
          <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md flex items-center gap-sm">
            <Icon name="person_add" className="text-primary" /> Nuevo usuario
          </h3>
          <form className="flex flex-col gap-md" onSubmit={crear}>
            <input required placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="px-md py-sm bg-surface-bright border border-outline-variant rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" />
            <input required type="email" placeholder="Correo" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="px-md py-sm bg-surface-bright border border-outline-variant rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" />
            <input required type="password" placeholder="Contraseña" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="px-md py-sm bg-surface-bright border border-outline-variant rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" />
            <select value={form.rol} onChange={(e) => setForm({ ...form, rol: e.target.value })}
              className="px-md py-sm bg-surface-bright border border-outline-variant rounded-lg font-body-md text-body-md outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 capitalize">
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <button type="submit" disabled={guardando}
              className="bg-primary text-on-primary font-label-md text-label-md py-sm px-md rounded-lg hover:bg-primary-container transition-colors flex items-center justify-center gap-sm disabled:opacity-70">
              <Icon name="check" className="text-[18px]" /> {guardando ? "Guardando…" : "Crear usuario"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
