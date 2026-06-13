"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";
import { useAlerts } from "./AlertsContext";
import { NAV_ITEMS, SETTINGS_ITEM } from "@/lib/nav";

const activeCls =
  "text-surface-bright font-bold border-l-4 border-surface-container-high bg-primary-container rounded-r-lg";
const inactiveCls =
  "text-on-primary-container opacity-80 hover:bg-primary-container hover:text-surface-bright rounded-lg";

export function Sidebar() {
  const pathname = usePathname();
  const alertCount = useAlerts().alertas.length;
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");

  return (
    <nav className="bg-primary fixed left-0 top-0 h-screen w-sidebar-width border-r border-outline-variant z-50 hidden md:flex flex-col py-xl px-md">
      {/* Marca */}
      <div className="mb-xxl px-sm flex flex-col gap-xs">
        <h1 className="font-headline-md text-headline-md font-bold text-surface-bright tracking-tight">
          Pa&apos; Donde Natty
        </h1>
        <p className="font-label-sm text-label-sm text-on-primary-container uppercase tracking-wider">
          Sistema de Inventario
        </p>
      </div>

      {/* Navegación */}
      <ul className="flex flex-col gap-sm flex-1">
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className={`flex items-center justify-between gap-md px-md py-sm w-full transition-colors ${
                isActive(item.href) ? activeCls : inactiveCls
              }`}
            >
              <span className="flex items-center gap-md">
                <Icon name={item.icon} fill={isActive(item.href)} />
                <span className="font-label-md text-label-md">{item.label}</span>
              </span>
              {item.href === "/alertas" && alertCount > 0 && (
                <span className="bg-error text-on-error font-data-mono text-[10px] px-2 py-0.5 rounded-full">
                  {alertCount}
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>

      {/* Configuración */}
      <div className="mt-auto border-t border-primary-container pt-md">
        <Link
          href={SETTINGS_ITEM.href}
          className={`flex items-center gap-md px-md py-sm w-full transition-colors ${
            isActive(SETTINGS_ITEM.href) ? activeCls : inactiveCls
          }`}
        >
          <Icon name={SETTINGS_ITEM.icon} fill={isActive(SETTINGS_ITEM.href)} />
          <span className="font-label-md text-label-md">{SETTINGS_ITEM.label}</span>
        </Link>
      </div>
    </nav>
  );
}
