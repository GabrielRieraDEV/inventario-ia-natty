"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/api";

/** Protege las rutas internas: si no hay sesión, redirige al login (RF-07). */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (getToken()) setOk(true);
    else router.replace("/login");
  }, [router]);

  if (!ok) {
    return (
      <div className="min-h-screen flex items-center justify-center text-on-surface-variant">
        <span className="material-symbols-outlined animate-spin">progress_activity</span>
      </div>
    );
  }
  return <>{children}</>;
}
