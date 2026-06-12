import Link from "next/link";
import { Icon } from "./Icon";

export function Topbar() {
  return (
    <header className="bg-surface sticky top-0 z-40 border-b border-outline-variant flex justify-between items-center w-full px-xl py-md">
      {/* Buscador (escritorio) */}
      <div className="flex-1 max-w-md hidden md:flex relative items-center">
        <Icon
          name="search"
          className="absolute left-sm text-on-surface-variant z-10 pointer-events-none"
        />
        <input
          type="text"
          placeholder="Buscar en el inventario..."
          className="w-full bg-[#F1F5F9] border-none rounded-lg pl-xl pr-sm py-[8px] font-body-sm text-on-surface focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all outline-none"
        />
      </div>

      {/* Título (móvil) */}
      <h1 className="md:hidden font-headline-sm text-headline-sm font-black text-primary">
        Pa&apos; Donde Natty
      </h1>

      {/* Acciones */}
      <div className="flex items-center gap-xs">
        <button className="text-on-surface-variant hover:bg-surface-container-high rounded-full p-sm transition-all relative focus:ring-2 focus:ring-primary focus:ring-offset-2">
          <Icon name="notifications" />
          <span className="absolute top-1 right-2 w-2 h-2 bg-error rounded-full border border-surface" />
        </button>
        <Link
          href="/qr"
          className="text-on-surface-variant hover:bg-surface-container-high rounded-full p-sm transition-all focus:ring-2 focus:ring-primary focus:ring-offset-2"
          aria-label="Vincular captura móvil"
        >
          <Icon name="qr_code_scanner" />
        </Link>
        <button className="text-on-surface-variant hover:bg-surface-container-high rounded-full p-sm transition-all ml-sm focus:ring-2 focus:ring-primary focus:ring-offset-2">
          <Icon name="account_circle" fill />
        </button>
      </div>
    </header>
  );
}
