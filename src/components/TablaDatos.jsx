// src/components/TablaDatos.jsx
import { useMemo, useState } from "react";
import useColumnas from "../hooks/useColumnas";
import MenuPropiedades from "./MenuPropiedades";

const claveDe = (f) => f.clave ?? f.nombre;

export default function TablaDatos({
  titulo,
  filas,
  columnas,
  claveStorage,
  placeholder = "Filtrar",
  altura = "38vh",
  ordenInicial = { key: "nombre", dir: "asc" },
  menu = true,
  filtro = true,
}) {
  const { activas, cambiar, restablecer } = useColumnas(
    claveStorage,
    columnas
  );

  const [busqueda, setBusqueda] = useState("");
  const [orden, setOrden] = useState(ordenInicial);

  const visibles = columnas.filter((c) => activas[c.key]);

  const cambiarOrden = (key) =>
    setOrden((o) =>
      o.key === key
        ? { key, dir: o.dir === "desc" ? "asc" : "desc" }
        : {
            key,
            dir: key === "nombre" || key === "familia" ? "asc" : "desc",
          }
    );

  const filasOrdenadas = useMemo(() => {
    const textoBusqueda = busqueda.trim().toLowerCase();
    const col = columnas.find((c) => c.key === orden.key) ?? columnas[0];
    const signo = orden.dir === "asc" ? 1 : -1;

    return filas
      .filter((f) => {
        if (!textoBusqueda) return true;

        return `${f.nombre} ${f.familiaLabel ?? ""}`
          .toLowerCase()
          .includes(textoBusqueda);
      })
      .sort((a, b) => {
        const va = col.valor(a);
        const vb = col.valor(b);

        if (typeof va === "string" || typeof vb === "string") {
          return (
            String(va).localeCompare(String(vb), undefined, {
              numeric: true,
            }) * signo
          );
        }

        if (va !== vb) return (va - vb) * signo;

        return String(a.nombre).localeCompare(String(b.nombre), undefined, {
          numeric: true,
        });
      });
  }, [filas, columnas, busqueda, orden]);

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>
          {titulo} <span className="contador">{filasOrdenadas.length}</span>
        </h2>

        <div className="panel-acciones">
          {filtro && (
            <input
              type="search"
              placeholder={placeholder}
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          )}

          {menu && (
            <MenuPropiedades
              columnas={columnas}
              activas={activas}
              onCambiar={cambiar}
              onRestablecer={restablecer}
            />
          )}
        </div>
      </div>

      {visibles.length === 0 ? (
        <p className="vacio">Activá al menos una propiedad.</p>
      ) : (
        <div className="scroll" style={{ maxHeight: altura }}>
          <table className="lista">
            <thead>
              <tr>
                {visibles.map((c) => (
                  <th
                    key={c.key}
                    className={`${c.align} ordenable`}
                    onClick={() => cambiarOrden(c.key)}
                  >
                    {c.label}
                    {orden.key === c.key &&
                      (orden.dir === "desc" ? " ▼" : " ▲")}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filasOrdenadas.map((f) => (
                <tr key={claveDe(f)}>
                  {visibles.map((c) => (
                    <td key={c.key} className={c.align}>
                      {c.render ? c.render(f) : c.valor(f)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {filasOrdenadas.length === 0 && (
            <p className="vacio">Todavía no hay datos.</p>
          )}
        </div>
      )}
    </section>
  );
}