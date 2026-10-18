// src/secciones/Resenas.jsx  (Vite + React — Dashboard CV Master)
//
// Muestra las reseñas que los usuarios envían desde la app nativa.
// Se leen en tiempo real de la colección dashboard_reviews (Firestore),
// de la más nueva a la más vieja.
//
// Las reglas de Firestore piden estar autenticado para leer, así que esta
// sección tiene que mostrarse cuando ya hay sesión iniciada en el dashboard.

import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

import { COLECCIONES, LIMITE_RESENAS } from "../config";
import { db } from "../firebase";

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

  const promedio = useMemo(() => {
    if (resenas.length === 0) return null;

    const suma = resenas.reduce((total, r) => total + r.estrellas, 0);
    return (suma / resenas.length).toFixed(1);
  }, [resenas]);

  return (
    <section className="panel">
      <div className="panel-head">
        <h2>
          Reseñas <span className="contador">{resenas.length}</span>
        </h2>

        {promedio !== null && (
          <div className="promedio">
            <strong>{promedio}</strong>
            <Estrellas n={Math.round(promedio)} />
          </div>
        )}
      </div>

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

        {resenas.map((r) => (
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