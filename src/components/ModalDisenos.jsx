// src/components/ModalDisenos.jsx  (Vite + React — Dashboard CV Master)
//
// Muestra los diseños de CV que UN usuario (un chat) votó en la app:
//   - "Me gusta"    -> los que respondió "Sí" en "¿Te gustó el diseño?"
//   - "No me gusta" -> los que respondió "No"
//
// Se busca en dashboard_design_feedback por el campo userId, que es el mismo
// id que usa el chat (chats/{id}) y la reseña (chatId). Se muestra el NOMBRE
// del diseño tal como está en el catálogo de la app (ej. "CV-06").
//
// Se actualiza en tiempo real. Se puede cambiar entre "Me gusta" y
// "No me gusta" desde el mismo modal.
//
// Se cierra con la X, con Escape o tocando fuera del cuadro.
//
// Requiere sesión iniciada (las reglas piden auth para leer).

import { collection, onSnapshot, query, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";

import { COLECCIONES, TIPO_DISENO_DISLIKE, TIPO_DISENO_LIKE } from "../config";
import { db } from "../firebase";

const ESTILOS = `
.modal-disenos-fondo {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  background: rgba(5, 8, 24, 0.65);
}

.modal-disenos {
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

.modal-disenos-cab {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid var(--borde);
}

.modal-disenos-cab h3 {
  margin: 0;
  font-size: 16px;
}

.modal-disenos-cerrar {
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

.modal-disenos-pestanas {
  display: flex;
  gap: 8px;
  padding: 12px 16px 0;
}

.modal-disenos-pestanas button {
  flex: 1;
  padding: 8px 10px;
  border: 1px solid var(--borde);
  border-radius: 12px;
  background: var(--superficie-alt);
  color: var(--texto);
  font-size: 13px;
  font-weight: 800;
}

.modal-disenos-pestanas button.activa {
  background: var(--acento);
  border-color: var(--acento);
  color: #fff;
}

.modal-disenos-cuerpo {
  padding: 8px 16px 16px;
  overflow-y: auto;
}

.modal-disenos-item {
  padding: 10px 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.modal-disenos-item + .modal-disenos-item {
  border-top: 1px solid var(--borde);
}

.modal-disenos-fecha {
  font-size: 12px;
  opacity: 0.7;
  white-space: nowrap;
}

.modal-disenos-vacio {
  margin: 0;
  padding: 24px 0;
  text-align: center;
  opacity: 0.7;
}
`;

const dos = (n) => String(n).padStart(2, "0");

const formatoFecha = (fecha) =>
  `${fecha.getFullYear()}-${dos(fecha.getMonth() + 1)}-${dos(
    fecha.getDate()
  )} · ${dos(fecha.getHours())}:${dos(fecha.getMinutes())}`;

const TEXTOS = {
  like: {
    titulo: "Sus me gusta",
    vacio: "Este usuario todavía no marcó ningún diseño con me gusta.",
  },
  dislike: {
    titulo: "Sus no me gusta",
    vacio: "Este usuario todavía no marcó ningún diseño con no me gusta.",
  },
};

export default function ModalDisenos({
  chatId,
  numero,
  valorInicial = "like",
  onClose,
}) {
  const [valor, setValor] = useState(
    valorInicial === "dislike" ? "dislike" : "like"
  );
  const [votos, setVotos] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Todos los votos de este usuario (con un solo "where" no hace falta
  // índice compuesto; el filtro por me gusta / no me gusta y el orden se
  // hacen acá)
  useEffect(() => {
    if (!chatId) return;

    setCargando(true);
    setError(null);

    const consulta = query(
      collection(db, COLECCIONES.DISENOS),
      where("userId", "==", chatId)
    );

    return onSnapshot(
      consulta,
      (snapshot) => {
        setVotos(
          snapshot.docs.map((doc) => {
            const d = doc.data();

            return {
              id: doc.id,
              nombre: String(d.nombre ?? "—"),
              tipo: d.tipo,
              fecha: d.createdAt?.toDate ? d.createdAt.toDate() : null,
            };
          })
        );
        setCargando(false);
      },
      (err) => {
        console.error("[diseños del chat] Error leyendo Firestore:", err);

        setError(
          err?.code === "permission-denied"
            ? "No tenés permiso para ver los diseños. Iniciá sesión y publicá las reglas."
            : "No se pudieron cargar los diseños."
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

  const tipoBuscado =
    valor === "like" ? TIPO_DISENO_LIKE : TIPO_DISENO_DISLIKE;

  const cantidades = useMemo(
    () => ({
      like: votos.filter((v) => v.tipo === TIPO_DISENO_LIKE).length,
      dislike: votos.filter((v) => v.tipo === TIPO_DISENO_DISLIKE).length,
    }),
    [votos]
  );

  // Los más nuevos primero
  const visibles = useMemo(
    () =>
      votos
        .filter((v) => v.tipo === tipoBuscado)
        .sort(
          (a, b) =>
            (b.fecha?.getTime() ?? Infinity) - (a.fecha?.getTime() ?? Infinity)
        ),
    [votos, tipoBuscado]
  );

  return (
    <>
      <style>{ESTILOS}</style>

      <div
        className="modal-disenos-fondo"
        onClick={onClose}
        role="presentation"
      >
        <div
          className="modal-disenos"
          role="dialog"
          aria-modal="true"
          aria-label={`${TEXTOS[valor].titulo} del chat ${numero}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-disenos-cab">
            <h3>
              {TEXTOS[valor].titulo} · Chat {numero}
            </h3>

            <button
              type="button"
              className="modal-disenos-cerrar"
              onClick={onClose}
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>

          <div className="modal-disenos-pestanas">
            <button
              type="button"
              className={valor === "like" ? "activa" : ""}
              onClick={() => setValor("like")}
            >
              👍 Me gusta ({cantidades.like})
            </button>

            <button
              type="button"
              className={valor === "dislike" ? "activa" : ""}
              onClick={() => setValor("dislike")}
            >
              👎 No me gusta ({cantidades.dislike})
            </button>
          </div>

          <div className="modal-disenos-cuerpo">
            {cargando && <p className="modal-disenos-vacio">Cargando…</p>}

            {!cargando && error && (
              <p className="modal-disenos-vacio" style={{ color: "#dc2626" }}>
                {error}
              </p>
            )}

            {!cargando && !error && visibles.length === 0 && (
              <p className="modal-disenos-vacio">{TEXTOS[valor].vacio}</p>
            )}

            {!cargando &&
              !error &&
              visibles.map((v) => (
                <div className="modal-disenos-item" key={v.id}>
                  <span className="etiqueta">{v.nombre}</span>

                  <span className="modal-disenos-fecha">
                    {v.fecha ? formatoFecha(v.fecha) : "—"}
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  );
}
