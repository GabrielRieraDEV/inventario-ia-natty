"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/Icon";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("admin@padondenatty.com");
  const [password, setPassword] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo iniciar sesión.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-md bg-gradient-to-br from-primary via-primary-container to-inverse-surface">
      <main className="relative z-10 w-full max-w-md">
        <div className="glass-card rounded-xl p-xl flex flex-col gap-xl">
          {/* Marca */}
          <div className="text-center flex flex-col items-center gap-sm">
            <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center ambient-shadow mb-sm">
              <Icon name="inventory_2" fill className="text-surface-bright text-4xl" />
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary">Pa&apos; Donde Natty</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Sistema de Inventario con IA
            </p>
          </div>

          <div className="w-full h-px bg-outline-variant/50" />

          {/* Formulario */}
          <form className="flex flex-col gap-lg" onSubmit={onSubmit}>
            <div className="flex flex-col gap-xs">
              <label className="font-label-md text-label-md text-on-surface" htmlFor="email">
                Correo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none">
                  <Icon name="mail" className="text-outline" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@padondenatty.com"
                  className="block w-full pl-xl pr-sm py-sm font-body-md text-body-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:border-primary transition-all placeholder:text-outline/50"
                />
              </div>
            </div>

            <div className="flex flex-col gap-xs">
              <div className="flex justify-between items-center">
                <label className="font-label-md text-label-md text-on-surface" htmlFor="password">
                  Contraseña
                </label>
                <a className="font-label-sm text-label-sm text-primary hover:underline" href="#">
                  ¿Olvidaste?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-sm flex items-center pointer-events-none">
                  <Icon name="lock" className="text-outline" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-xl pr-sm py-sm font-body-md text-body-md bg-surface-container-lowest border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:border-primary transition-all placeholder:text-outline/50"
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-sm bg-error-container text-on-error-container rounded-lg px-md py-sm font-body-sm text-body-sm">
                <Icon name="error" className="text-[18px]" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-sm bg-primary text-on-primary font-label-md text-label-md py-md px-lg rounded-lg ambient-shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all mt-sm disabled:opacity-70"
            >
              <span>{loading ? "Ingresando…" : "Iniciar sesión"}</span>
              <Icon name="login" className="text-xl" />
            </button>
          </form>

          <div className="text-center">
            <p className="font-label-sm text-label-sm text-on-surface-variant/70 flex items-center justify-center gap-xs">
              <Icon name="shield" className="text-[14px]" />
              Acceso seguro
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
