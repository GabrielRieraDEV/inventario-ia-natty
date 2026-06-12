/** Elementos de navegación del sidebar, en orden, con su RF asociado. */
export type NavItem = {
  href: string;
  label: string;
  icon: string;
  rf: string;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Panel general", icon: "dashboard", rf: "RF-08" },
  { href: "/catalogo", label: "Catálogo", icon: "menu_book", rf: "RF-06" },
  { href: "/inventario", label: "Inventario", icon: "inventory_2", rf: "RF-04" },
  { href: "/movimientos", label: "Movimientos", icon: "swap_horiz", rf: "RF-02" },
  { href: "/alertas", label: "Alertas", icon: "notifications_active", rf: "RF-03" },
  { href: "/reportes", label: "Reportes", icon: "assessment", rf: "RF-05" },
];

export const SETTINGS_ITEM: NavItem = {
  href: "/configuracion",
  label: "Configuración",
  icon: "settings",
  rf: "RF-09",
};
