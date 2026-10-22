// src/components/ModalResena.jsx  (Vite + React — Dashboard CV Master)
//
// Muestra la reseña de UN usuario (un chat). Se busca en dashboard_reviews
// por el campo chatId, que es el mismo id que usa el chat (chats/{id}).
//
// Se actualiza en tiempo real: si el usuario cambia su reseña desde la app,
// el modal lo refleja al instante.
//
// Se cierra con la X, con Escape o tocando fuera del cuadro.
//
// Requiere sesión iniciada (las reglas piden auth para leer reseñas).

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useState } from "react";

import { COLECCIONES } from "../config";
import { db } from "../firebase";

const ESTILOS = `
.modal-resena-fondo {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(5, 8, 24, 0.65);
}

.modal-resena {
  width: min(460px, 100%);
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  background: var(--superficie);
  color: var(--texto);
  border: 1px solid var(--borde);
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
  overflow: hidden;
}

.modal-resena-cab {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--borde);
}

.modal-resena-cab h3 {
  margin: 0;
  font-size: 16px;
}

.modal-resena-cerrar {
  width: 30px;
  height: 30px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 50%;
  background: var(--superficie-alt);
  color: var(--texto);
  font-size: 14px;
  font-weight: 800;
}

.modal-resena-cuerpo {
  padding: 8px 16px 16px;
  overflow-y: auto;
}

.modal-resena-item {
  padding: 14px 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.modal-resena-item + .modal-resena-item {
  border-top: 1px solid var(--borde);
}

.modal-resena-fila {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
}

.modal-resena-fecha {
  font-size: 12px;
  opacity: 0.7;
  white-space: nowrap;
}

.modal-resena-texto {
  margin: 0;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.modal-resena-sin-texto {
  margin: 0;
  opacity: 0.6;
  font-style: italic;
}

.modal-resena-etiquetas {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.modal-resena-vacio {
  margin: 0;
  padding: 24px 0;
  text-align: center;
  opacity: 0.7;
}
`;

const dos = (n) => String(n).padStart(2, "0");

const formatoFechaHora = (fecha) =>
  `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(
    fecha.getDate()
  )} · ${dos(fecha.getHours())}:${dos(fecha.getMinutes())}`;

const Estrellas = ({ n }) => (
  <span className="estrellas" aria-label={`${n} estrellas`}>
    {"★".repeat(n)}
    <span className="estrellas-vacias">{"★".repeat(5 - n)}</span>
  </span>
);

export default function ModalResena({ chatId, numero, onClose }) {
  const [resenas, setResenas] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Reseñas de este chat (normalmente es una sola; si el usuario reseñó de
  // nuevo después de un "restablecer", se muestran todas, la más nueva primero)
  useEffect(() => {
    if (!chatId) return;

    setCargando(true);
    setError(null);

    const consulta = query(
      collection(db, COLECCIONES.RESENAS),
      where("chatId", "==", chatId)
    );

    return onSnapshot(
      consulta,
      (snapshot) => {
        const lista = snapshot.docs
          .map((doc) => {
            const d = doc.data();
            const fecha = d.createdAt?.toDate ? d.createdAt.toDate() : null;

            return {
              id: doc.id,
              nombre: d.nombre ?? "Anónimo",
              estrellas: Math.min(
                5,
                Math.max(0, Math.round(Number(d.estrellas)) || 0)
              ),
              texto: d.texto ?? "",
              fecha,
              idioma: d.idioma ?? "",
              plataforma: d.plataforma ?? "",
              editada: Boolean(d.editadaEn),
            };
          })
          // Se ordena acá para no necesitar un índice compuesto en Firestore
          .sort(
            (a, b) =>
              (b.fecha?.getTime() ?? Infinity) -
              (a.fecha?.getTime() ?? Infinity)
          );

        setResenas(lista);
        setCargando(false);
      },
      (err) => {
        console.error("[reseña del chat] Error leyendo Firestore:", err);

        setError(
          err?.code === "permission-denied"
            ? "No tenés permiso para ver las reseñas. Iniciá sesión e intentá de nuevo."
            : "No se pudo cargar la reseña."
        );
        setCargando(false);
      }
    );
  }, [chatId]);

  // Escape cierra el modal
  useEffect(() => {
    const alTeclear = (e) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", alTeclear);
    return () => window.removeEventListener("keydown", alTeclear);
  }, [onClose]);

  return (
    <>
      <style>{ESTILOS}</style>

      <div
        className="modal-resena-fondo"
        onClick={onClose}
        role="presentation"
      >
        <div
          className="modal-resena"
          role="dialog"
          aria-modal="true"
          aria-label={`Reseña del chat ${numero}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-resena-cab">
            <h3>Reseña · Chat {numero}</h3>

            <button
              type="button"
              className="modal-resena-cerrar"
              onClick={onClose}
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          <div className="modal-resena-cuerpo">
            {cargando && <p className="modal-resena-vacio">Cargando…</p>}

            {!cargando && error && (
              <p className="modal-resena-vacio" style={{ color: "#dc2626" }}>
                {error}
              </p>
            )}

            {!cargando && !error && resenas.length === 0 && (
              <p className="modal-resena-vacio">
                Este usuario todavía no dejó una reseña.
              </p>
            )}

            {!cargando &&
              !error &&
              resenas.map((r) => (
                <article className="modal-resena-item" key={r.id}>
                  <div className="modal-resena-fila">
                    <strong>{r.nombre}</strong>
                    <span className="modal-resena-fecha">
                      {r.fecha ? formatoFechaHora(r.fecha) : "—"}
                    </span>
                  </div>

                  <Estrellas n={r.estrellas} />

                  {r.texto ? (
                    <p className="modal-resena-texto">{r.texto}</p>
                  ) : (
                    <p className="modal-resena-sin-texto">Sin comentario</p>
                  )}

                  <div className="modal-resena-etiquetas">
                    {r.plataforma && (
                      <span className="etiqueta">{r.plataforma}</span>
                    )}
                    {r.idioma && <span className="etiqueta">{r.idioma}</span>}
                    {r.editada && <span className="etiqueta">editada</span>}
                  </div>
                </article>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}
