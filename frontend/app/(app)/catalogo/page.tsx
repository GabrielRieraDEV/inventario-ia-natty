"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/Icon";
import { api } from "@/lib/api";

type Categoria = { id: number; nombre: string };
type Producto = {
  id: number;
  nombre: string;
  codigo_barras: string | null;
  categoria_id: number | null;
  marca: string | null;
  presentacion: string | null;
  precio: number;
  stock_minimo: number;
  fecha_vencimiento: string | null;
  foto_url: string | null;
};

const vacio = {
  nombre: "",
  codigo_barras: "",
  categoria_id: "",
  marca: "",
  presentacion: "",
  precio: "0",
  stock_minimo: "0",
  fecha_vencimiento: "",
};

export default function CatalogoPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...vacio });
  const [guardando, setGuardando] = useState(false);

  const catName = (id: number | null) => categorias.find((c) => c.id === id)?.nombre ?? "—";

  async function cargar() {
    setCargando(true);
    try {
      const [p, c] = await Promise.all([
        api.get<Producto[]>("/api/productos"),
        api.get<Categoria[]>("/api/categorias"),
      ]);
      setProductos(p);
      setCategorias(c);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al cargar.");
    } finally {
      setCargando(false);
    }
  }
  useEffect(() => { cargar(); }, []);

  function abrirNuevo() {
    setEditId(null);
    setForm({ ...vacio });
    setError(null);
    setModal(true);
  }

  function abrirEditar(p: Producto) {
    setEditId(p.id);
    setForm({
      nombre: p.nombre,
      codigo_barras: p.codigo_barras ?? "",
      categoria_id: p.categoria_id ? String(p.categoria_id) : "",
      marca: p.marca ?? "",
      presentacion: p.presentacion ?? "",
      precio: String(p.precio),
      stock_minimo: String(p.stock_minimo),
      fecha_vencimiento: p.fecha_vencimiento ?? "",
    });
    setError(null);
    setModal(true);
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setError(null);
    const cuerpo = {
      nombre: form.nombre,
      codigo_barras: form.codigo_barras || null,
      categoria_id: form.categoria_id ? Number(form.categoria_id) : null,
      marca: form.marca || null,
      presentacion: form.presentacion || null,
      precio: Number(form.precio) || 0,
      stock_minimo: Number(form.stock_minimo) || 0,
      fecha_vencimiento: form.fecha_vencimiento || null,
    };
    try {
      if (editId === null) await api.post("/api/productos", cuerpo);
      else await api.put(`/api/productos/${editId}`, cuerpo);
      setModal(false);
      setForm({ ...vacio });
      setEditId(null);
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo guardar el producto.");
    } finally {
      setGuardando(false);
    }
  }

  async function eliminar(id: number) {
    if (!confirm("¿Dar de baja este producto?")) return;
    try {
      await api.del(`/api/productos/${id}`);
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se pudo dar de baja.");
    }
  }

  return (
    <>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary">Catálogo de productos</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-xs">Administra los artículos, precios y niveles de existencias.</p>
        </div>
        <div className="flex items-center gap-sm">
          <Link href="/qr" className="flex items-center justify-center gap-xs px-md py-sm bg-surface-container-lowest border border-primary text-primary rounded font-label-md text-label-md hover:bg-surface-container transition-colors">
            <Icon name="qr_code_scanner" className="text-[18px]" /> Escanear con cámara
          </Link>
          <button onClick={abrirNuevo} className="flex items-center justify-center gap-xs px-md py-sm bg-primary text-on-primary rounded font-label-md text-label-md hover:bg-primary-container transition-colors shadow-sm">
            <Icon name="add" className="text-[18px]" /> Nuevo producto
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-sm bg-error-container text-on-error-container rounded-lg px-md py-sm font-body-sm text-body-sm">
          <Icon name="error" className="text-[18px]" /> {error}
        </div>
      )}

      <div className="bg-surface-container-lowest border border-[#E2E8F0] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#F8FAF9] border-b border-[#E2E8F0]">
                {["Producto", "Código", "Categoría", "Precio", "Stock mín."].map((h) => (
                  <th key={h} className="py-sm px-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{h}</th>
                ))}
                <th className="py-sm px-md font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {cargando ? (
                <tr><td colSpan={6} className="py-xl text-center text-on-surface-variant"><Icon name="progress_activity" className="animate-spin" /></td></tr>
              ) : productos.length === 0 ? (
                <tr><td colSpan={6} className="py-xl text-center font-body-sm text-on-surface-variant">Sin productos. Crea el primero.</td></tr>
              ) : (
                productos.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-container-low transition-colors group">
                    <td className="py-md px-md">
                      <div className="flex items-center gap-md">
                        {p.foto_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={p.foto_url} alt={p.nombre} className="w-10 h-10 rounded object-cover border border-outline-variant" />
                        ) : (
                          <div className="w-10 h-10 bg-surface-variant rounded flex items-center justify-center text-primary"><Icon name="inventory_2" /></div>
                        )}
                        <div>
                          <p className="font-label-md text-label-md text-on-surface">{p.nombre}</p>
                          <p className="font-body-sm text-body-sm text-on-surface-variant">{[p.marca, p.presentacion].filter(Boolean).join(" · ") || "—"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-md px-md font-data-mono text-data-mono text-on-surface-variant">{p.codigo_barras ?? "—"}</td>
                    <td className="py-md px-md"><span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface-container text-on-primary-fixed-variant">{catName(p.categoria_id)}</span></td>
                    <td className="py-md px-md font-label-md text-label-md text-on-surface">${p.precio.toFixed(2)}</td>
                    <td className="py-md px-md font-data-mono text-data-mono text-on-surface-variant">{p.stock_minimo}</td>
                    <td className="py-md px-md text-right whitespace-nowrap">
                      <button onClick={() => abrirEditar(p)} className="p-xs text-on-surface-variant hover:text-primary transition-colors opacity-0 group-hover:opacity-100" title="Editar">
                        <Icon name="edit" className="text-[20px]" />
                      </button>
                      <button onClick={() => eliminar(p.id)} className="p-xs text-on-surface-variant hover:text-error transition-colors opacity-0 group-hover:opacity-100 ml-xs" title="Dar de baja">
                        <Icon name="delete" className="text-[20px]" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal nuevo / editar producto */}
      {modal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-md" onClick={() => setModal(false)}>
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant w-full max-w-lg p-lg" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-md">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">{editId === null ? "Nuevo producto" : "Editar producto"}</h3>
              <button onClick={() => setModal(false)} className="text-on-surface-variant hover:bg-surface-container rounded-full p-xs"><Icon name="close" /></button>
            </div>
            <form className="grid grid-cols-1 sm:grid-cols-2 gap-md" onSubmit={guardar}>
              <input required placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="sm:col-span-2 px-md py-sm bg-surface-bright border border-outline-variant rounded-lg outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" />
              <input placeholder="Código de barras" value={form.codigo_barras} onChange={(e) => setForm({ ...form, codigo_barras: e.target.value })} className="px-md py-sm bg-surface-bright border border-outline-variant rounded-lg outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" />
              <select value={form.categoria_id} onChange={(e) => setForm({ ...form, categoria_id: e.target.value })} className="px-md py-sm bg-surface-bright border border-outline-variant rounded-lg outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
                <option value="">Categoría…</option>
                {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
              </select>
              <input placeholder="Marca" value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} className="px-md py-sm bg-surface-bright border border-outline-variant rounded-lg outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" />
              <input placeholder="Presentación (1 kg, 500 ml…)" value={form.presentacion} onChange={(e) => setForm({ ...form, presentacion: e.target.value })} className="px-md py-sm bg-surface-bright border border-outline-variant rounded-lg outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" />
              <input type="number" step="0.01" min="0" placeholder="Precio" value={form.precio} onChange={(e) => setForm({ ...form, precio: e.target.value })} className="px-md py-sm bg-surface-bright border border-outline-variant rounded-lg outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" />
              <input type="number" min="0" placeholder="Stock mínimo" value={form.stock_minimo} onChange={(e) => setForm({ ...form, stock_minimo: e.target.value })} className="px-md py-sm bg-surface-bright border border-outline-variant rounded-lg outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2" />
              <label className="sm:col-span-2 flex flex-col gap-xs font-label-sm text-label-sm text-on-surface-variant">
                Fecha de vencimiento (opcional)
                <input type="date" value={form.fecha_vencimiento} onChange={(e) => setForm({ ...form, fecha_vencimiento: e.target.value })} className="px-md py-sm bg-surface-bright border border-outline-variant rounded-lg outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 text-on-surface" />
              </label>
              <div className="sm:col-span-2 flex justify-end gap-md pt-sm">
                <button type="button" onClick={() => setModal(false)} className="px-lg py-sm font-label-md text-label-md text-on-surface-variant hover:bg-surface-container rounded-lg">Cancelar</button>
                <button type="submit" disabled={guardando} className="px-lg py-sm bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary-container transition-colors flex items-center gap-sm disabled:opacity-70">
                  <Icon name="check" className="text-[18px]" /> {guardando ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
