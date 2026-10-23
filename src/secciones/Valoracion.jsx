// src/secciones/Valoracion.jsx  (Vite + React — Dashboard CV Master)
//
// Valoración de los diseños de CV: los "me gusta" y "no me gusta" que los
// usuarios responden en la app ("¿Te gustó el diseño?") al ver su CV ya
// descargado.
//
// Se leen en tiempo real de UN solo documento de contadores
// (dashboard_config/diseno_contadores), que la app va sumando cada vez que
// alguien vota:
//   { likes: { "CV-06": 4 }, dislikes: { "CV-06": 1 } }
// donde la clave es el nombre del diseño en el catálogo de la app.
// Así no importa cuántos votos haya: siempre es una sola lectura.
//
// Se muestra, por cada diseño, cuántos me gusta y cuántos no me gusta tiene.
// Se puede:
//   - ordenar: más me gusta, más no me gusta, mejor / peor aprobación,
//     más votados, nombre (también tocando los títulos de la tabla)
//   - filtrar: todos, solo con me gusta, solo con no me gusta, o buscar
//     por nombre
//
// Solo aparecen los diseños que ya recibieron al menos un voto.
// Para reiniciar los votos: Chat → Historial → "Reiniciar me gusta / no me
// gusta de diseños".
//
// Requiere sesión iniciada (las reglas piden auth para leer).

import { useMemo, useState } from "react";

import useContadoresDisenos from "../hooks/useContadoresDisenos";

// Opciones de orden: clave -> [texto, función de comparación]
const ORDENES = {
  likes: ["Más me gusta", (a, b) => b.likes - a.likes || b.total - a.total],
  dislikes: [
    "Más no me gusta",
    (a, b) => b.dislikes - a.dislikes || b.total - a.total,
  ],
  mejor: [
    "Mejor aprobación",
    (a, b) => b.aprobacion - a.aprobacion || b.total - a.total,
  ],
  peor: [
    "Peor aprobación",
    (a, b) => a.aprobacion - b.aprobacion || b.total - a.total,
  ],
  votos: ["Más votados", (a, b) => b.total - a.total],
  nombre: [
    "Nombre (A-Z)",
    (a, b) => a.nombre.localeCompare(b.nombre, "es", { numeric: true }),
  ],
};

const FILTROS = [
  ["todos", "Todos"],
  ["conLikes", "Con me gusta"],
  ["conDislikes", "Con no me gusta"],
];

export default function Valoracion() {
  const { filas, cargando, error } = useContadoresDisenos();

  const [orden, setOrden] = useState("likes");
  const [filtro, setFiltro] = useState("todos");
  const [busqueda, setBusqueda] = useState("");

  // Un registro por diseño: { nombre, likes, dislikes, total, aprobacion }
  const disenos = useMemo(
    () =>
      Object.entries(filas)
        .map(([nombre, f]) => {
          const total = f.likes + f.dislikes;

          return {
            nombre,
            likes: f.likes,
            dislikes: f.dislikes,
            total,
            // % de me gusta sobre el total de votos
            aprobacion: total > 0 ? Math.round((f.likes / total) * 100) : 0,
          };
        })
        .filter((d) => d.total > 0),
    [filas]
  );

  const resumen = useMemo(
    () => ({
      likes: disenos.reduce((suma, d) => suma + d.likes, 0),
      dislikes: disenos.reduce((suma, d) => suma + d.dislikes, 0),
    }),
    [disenos]
  );

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return disenos
      .filter((d) => {
        if (filtro === "conLikes" && d.likes === 0) return false;
        if (filtro === "conDislikes" && d.dislikes === 0) return false;
        if (texto && !d.nombre.toLowerCase().includes(texto)) return false;
        return true;
      })
      .sort(ORDENES[orden][1]);
  }, [disenos, filtro, busqueda, orden]);

  // Tocar el título de una columna ordena por ella
  const Titulo = ({ clave, children, className }) => (
    <th
      className={`ordenable ${className ?? ""}`}
      onClick={() => setOrden(clave)}
      aria-sort={orden === clave ? "descending" : "none"}
    >
      {children}
      {orden === clave ? " ▼" : ""}
    </th>
  );

  return (
    <>
      {/* ---------------- TARJETAS ---------------- */}
      <div className="resumen">
        <div className="card">
          <span>Diseños valorados</span>
          <strong>{disenos.length}</strong>
        </div>

        <div className="card">
          <span>👍 Me gusta</span>
          <strong>{resumen.likes}</strong>
        </div>

        <div className="card">
          <span>👎 No me gusta</span>
          <strong>{resumen.dislikes}</strong>
        </div>

        <div className="card">
          <span>Votos totales</span>
          <strong>{resumen.likes + resumen.dislikes}</strong>
        </div>
      </div>

      <section className="panel">
        <div className="panel-head">
          <h2>
            Valoración <span className="contador">{visibles.length}</span>
          </h2>
        </div>

        <div className="valoracion-filtros">
          {FILTROS.map(([clave, texto]) => (
            <button
              key={clave}
              type="button"
              className={`chip-filtro${filtro === clave ? " activo" : ""}`}
              onClick={() => setFiltro(clave)}
              aria-pressed={filtro === clave}
            >
              {texto}
            </button>
          ))}

          <select
            className="chip-filtro"
            value={orden}
            onChange={(e) => setOrden(e.target.value)}
            aria-label="Ordenar por"
          >
            {Object.entries(ORDENES).map(([clave, [texto]]) => (
              <option key={clave} value={clave}>
                {texto}
              </option>
            ))}
          </select>

          <input
            type="search"
            placeholder="Buscar diseño (ej. CV-06)"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>

        <div className="scroll" style={{ maxHeight: "60vh" }}>
          {cargando && (
            <p style={{ padding: "1rem", opacity: 0.7 }}>
              Cargando valoraciones…
            </p>
          )}

          {!cargando && error && (
            <p style={{ padding: "1rem", color: "#dc2626" }}>{error}</p>
          )}

          {!cargando && !error && disenos.length === 0 && (
            <p style={{ padding: "1rem", opacity: 0.7 }}>
              Todavía no hay valoraciones.
            </p>
          )}

          {!cargando && !error && disenos.length > 0 && visibles.length === 0 && (
            <p style={{ padding: "1rem", opacity: 0.7 }}>
              Ningún diseño coincide con el filtro.
            </p>
          )}

          {!cargando && !error && visibles.length > 0 && (
            <table className="lista">
              <thead>
                <tr>
                  <Titulo clave="nombre" className="left">
                    Diseño
                  </Titulo>
                  <Titulo clave="likes" className="right">
                    👍 Me gusta
                  </Titulo>
                  <Titulo clave="dislikes" className="right">
                    👎 No me gusta
                  </Titulo>
                  <Titulo clave="votos" className="right">
                    Votos
                  </Titulo>
                  <Titulo clave="mejor" className="left">
                    Aprobación
                  </Titulo>
                </tr>
              </thead>

              <tbody>
                {visibles.map((d) => (
                  <tr key={d.nombre}>
                    <td className="left">
                      <span className="etiqueta">{d.nombre}</span>
                    </td>
                    <td className="right valor-like">{d.likes}</td>
                    <td className="right valor-dislike">{d.dislikes}</td>
                    <td className="right">{d.total}</td>
                    <td className="left">
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <div
                          className="barra-valoracion"
                          title={`${d.aprobacion}% me gusta`}
                        >
                          <div
                            className="barra-valoracion-like"
                            style={{ width: `${d.aprobacion}%` }}
                          />
                          <div
                            className="barra-valoracion-dislike"
                            style={{ width: `${100 - d.aprobacion}%` }}
                          />
                        </div>
                        <span>{d.aprobacion}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </>
  );
}