const modulos = [
  { code: "RF-01", nombre: "Reconocimiento IA + captura QR", desc: "Identifica el producto desde la foto y lo registra." },
  { code: "RF-02", nombre: "Stock y movimientos", desc: "Entradas/salidas; stock derivado y auditable." },
  { code: "RF-03", nombre: "Alertas", desc: "Stock mínimo y productos próximos a vencer." },
  { code: "RF-04", nombre: "Inventario", desc: "Consulta por nombre, categoría o código." },
  { code: "RF-05", nombre: "Reportes gerenciales", desc: "KPIs de existencias, rotación y movimientos." },
  { code: "RF-06", nombre: "Catálogo y categorías", desc: "Altas, modificaciones y bajas." },
  { code: "RF-07", nombre: "Autenticación", desc: "Inicio de sesión y control de acceso." },
  { code: "RF-08", nombre: "Panel general", desc: "Indicadores y alertas más relevantes." },
  { code: "RF-09", nombre: "Respaldo y configuración", desc: "Exportación de datos y parámetros." },
];

export default function Home() {
  return (
    <main>
      <h1>Inventario IA — Bodegón Pa&apos; Donde Natty</h1>
      <p className="subtitle">
        Control de inventarios con reconocimiento de productos por Inteligencia
        Artificial. Prototipo del Trabajo Especial de Grado — UGMA.
      </p>
      <div className="grid">
        {modulos.map((m) => (
          <div className="card" key={m.code}>
            <span className="code">{m.code}</span>
            <h3>{m.nombre}</h3>
            <p>{m.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
}
