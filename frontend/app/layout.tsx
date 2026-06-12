import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Inventario IA — Bodegón Pa' Donde Natty",
  description:
    "Sistema de control de inventarios con reconocimiento de productos por Inteligencia Artificial.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
