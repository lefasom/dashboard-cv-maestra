// src/secciones/Resenas.jsx  (Vite + React — Dashboard CV Master)
//
// Muestra las reseñas que los usuarios envían desde la app nativa.
// Se leen en tiempo real de la colección dashboard_reviews (Firestore),
// de la más nueva a la más vieja.
//
// FILTRO POR PUNTUACIÓN: arriba de la lista hay un botón por cada
// puntuación (5★ a 1★) con la cantidad de reseñas que tiene, más "Todas".
// Tocar un número muestra SOLO las reseñas con esa puntuación exacta
// (por ejemplo 4★ muestra únicamente las de 4 estrellas). Volver a tocar el
// mismo botón, o "Todas", quita el filtro. El promedio de arriba siempre
// se calcula con todas las reseñas, no con las filtradas.
//
// Las reglas de Firestore piden estar autenticado para leer, así que esta
// sección tiene que mostrarse cuando ya hay sesión iniciada en el dashboard.

import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

import { COLECCIONES, LIMITE_RESENAS } from "../config";
import { db } from "../firebase";

const PUNTUACIONES = [5, 4, 3, 2, 1];

const dosDigitos = (n) => String(n).padStart(2, "0");

const formatearFecha = (fecha) =>
  `${fecha.getFullYear()}-${dosDigitos(fecha.getMonth() + 1)}-${dosDigitos(
    fecha.getDate()
  )}`;

const formatearHora = (fecha) =>
  `${dosDigitos(fecha.getHours())}:${dosDigitos(fecha.getMinutes())}`;

const Estrellas = ({ n }) => (
  <span className="estrellas" aria-label={`${n} estrellas`}>
    {"★".repeat(n)}
    <span className="estrellas-vacias">{"★".repeat(5 - n)}</span>
  </span>
);

export default function Resenas() {
  const [resenas, setResenas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // null = todas | 1 a 5 = solo esa puntuación
  const [filtro, setFiltro] = useState(null);

  useEffect(() => {
    const consulta = query(
      collection(db, COLECCIONES.RESENAS),
      orderBy("createdAt", "desc"),
      limit(LIMITE_RESENAS)
    );

    const desuscribir = onSnapshot(
      consulta,
      (snapshot) => {
        const lista = snapshot.docs.map((doc) => {
          const d = doc.data();

          // createdAt puede ser null un instante si el servidor todavía no
          // confirmó el timestamp
          const fecha = d.createdAt?.toDate ? d.createdAt.toDate() : null;

          return {
            id: doc.id,
            usuario: d.nombre ?? "Anónimo",
            estrellas: Math.min(5, Math.max(0, Math.round(Number(d.estrellas)) || 0)),
            fecha: fecha ? formatearFecha(fecha) : "—",
            hora: fecha ? formatearHora(fecha) : "",
            texto: d.texto ?? "",
          };
        });

        setResenas(lista);
        setError(null);
        setCargando(false);
      },
      (err) => {
        console.error("[reseñas] Error leyendo Firestore:", err);

        setError(
          err?.code === "permission-denied"
            ? "No tenés permiso para ver las reseñas. Iniciá sesión e intentá de nuevo."
            : "No se pudieron cargar las reseñas."
        );
        setCargando(false);
      }
    );

    return desuscribir;
  }, []);

  // El promedio usa todas las reseñas, aunque haya un filtro activo
  const promedio = useMemo(() => {
    if (resenas.length === 0) return null;

    const suma = resenas.reduce((total, r) => total + r.estrellas, 0);
    return (suma / resenas.length).toFixed(1);
  }, [resenas]);

  // Cuántas reseñas tiene cada puntuación: { 5: 3, 4: 1, … }
  const cantidades = useMemo(() => {
    const mapa = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    resenas.forEach((r) => {
      if (r.estrellas in mapa) mapa[r.estrellas] += 1;
    });

    return mapa;
  }, [resenas]);

  // Reseñas que se muestran según el filtro
  const visibles = useMemo(
    () => (filtro ? resenas.filter((r) => r.estrellas === filtro) : resenas),
    [resenas, filtro]
  );

  // Tocar el filtro activo lo quita
  const alternarFiltro = (puntuacion) =>
    setFiltro((actual) => (actual === puntuacion ? null : puntuacion));

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>
          Reseñas{" "}
          <span className="contador">
            {filtro ? `${visibles.length} de ${resenas.length}` : resenas.length}
          </span>
        </h2>

        {promedio !== null && (
          <div className="promedio">
            <strong>{promedio}</strong>
            <Estrellas n={Math.round(promedio)} />
          </div>
        )}
      </div>

      {/* ---------------- FILTRO POR PUNTUACIÓN ---------------- */}
      {!cargando && !error && resenas.length > 0 && (
        <div className="valoracion-filtros" role="group" aria-label="Filtrar por puntuación">
          <button
            type="button"
            className={`chip-filtro${filtro === null ? " activo" : ""}`}
            onClick={() => setFiltro(null)}
            aria-pressed={filtro === null}
          >
            Todas ({resenas.length})
          </button>

          {PUNTUACIONES.map((p) => (
            <button
              key={p}
              type="button"
              className={`chip-filtro${filtro === p ? " activo" : ""}`}
              onClick={() => alternarFiltro(p)}
              aria-pressed={filtro === p}
              aria-label={`${p} estrellas, ${cantidades[p]} reseñas`}
            >
              {p} ★ ({cantidades[p]})
            </button>
          ))}
        </div>
      )}

      <div className="scroll" style={{ maxHeight: "60vh" }}>
        {cargando && (
          <p style={{ padding: "1rem", opacity: 0.7 }}>Cargando reseñas…</p>
        )}

        {!cargando && error && (
          <p style={{ padding: "1rem", color: "#dc2626" }}>{error}</p>
        )}

        {!cargando && !error && resenas.length === 0 && (
          <p style={{ padding: "1rem", opacity: 0.7 }}>
            Todavía no hay reseñas.
          </p>
        )}

        {!cargando && !error && resenas.length > 0 && visibles.length === 0 && (
          <p style={{ padding: "1rem", opacity: 0.7 }}>
            No hay reseñas de {filtro} {filtro === 1 ? "estrella" : "estrellas"}.
          </p>
        )}

        {visibles.map((r) => (
          <article className="resena" key={r.id}>
            <div className="resena-cab">
              <strong>{r.usuario}</strong>
              <span className="resena-fecha">
                {r.fecha} · {r.hora}
              </span>
            </div>

            <Estrellas n={r.estrellas} />
            {r.texto && <p>{r.texto}</p>}
          </article>
        ))}
      </div>
    </section>
  );
}