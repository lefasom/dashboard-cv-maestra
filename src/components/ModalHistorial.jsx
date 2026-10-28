// src/components/ModalHistorial.jsx  (Vite + React — Dashboard CV Master)
//
// "Gestionar historial": modal para borrar chats por estado y antigüedad.
//
//   1) Qué chats: todos / respondidos / sin responder
//   2) Qué mensajes: todo el historial, o los anteriores a 1, 2, 3, 4, 5, 6
//      meses o 1 año
//
// Las reseñas YA NO se gestionan acá: borrar chats no toca las reseñas.
// Para borrar reseñas (y limpiar el Store de cada app) se usa
// "Gestionar reseñas" en la pestaña Historial.
//
// Arriba hay dos botones que abren OTROS modales:
//   - reiniciar los me gusta / no me gusta de los diseños (ModalReinicioDisenos)
//   - reiniciar los datos de Onboarding (ModalReinicioOnboarding)
//
// Es irreversible: hay que escribir BORRAR para habilitar el botón.

import { useMemo, useState } from "react";

import {
  OPCIONES_EDAD,
  borrarHistorial,
  corteDe,
} from "../servicios/historial";
import ModalReinicioDisenos from "./ModalReinicioDisenos";
import ModalReinicioOnboarding from "./ModalReinicioOnboarding";

const PALABRA = "BORRAR";

const ALCANCES = [
  {
    id: "todos",
    label: "Todos los chats",
    detalle: "Respondidos y sin responder",
  },
  {
    id: "respondidos",
    label: "Respondidos",
    detalle: "Chats sin mensajes pendientes",
  },
  {
    id: "sin_responder",
    label: "Sin responder",
    detalle: "Chats que esperan tu respuesta",
  },
];

export default function ModalHistorial({ chats, onClose }) {
  const [alcance, setAlcance] = useState("todos");
  const [edad, setEdad] = useState("todo");
  const [confirmacion, setConfirmacion] = useState("");
  const [borrando, setBorrando] = useState(false);
  const [borrados, setBorrados] = useState(0);
  const [resultado, setResultado] = useState(null); // { ok, texto }
  const [verDisenos, setVerDisenos] = useState(false);
  const [verOnboarding, setVerOnboarding] = useState(false);

  const opcionEdad = OPCIONES_EDAD.find((o) => o.id === edad) ?? OPCIONES_EDAD[0];

  const elegidos = useMemo(
    () =>
      chats.filter((c) => {
        if (alcance === "sin_responder") return c.sinResponder;
        if (alcance === "respondidos") return !c.sinResponder;
        return true;
      }),
    [chats, alcance]
  );

  const puedeBorrar =
    elegidos.length > 0 && confirmacion.trim() === PALABRA && !borrando;

  const cerrar = () => {
    if (!borrando) onClose();
  };

  const confirmar = async () => {
    if (!puedeBorrar) return;

    setBorrando(true);
    setBorrados(0);
    setResultado(null);

    let cuenta = 0;

    try {
      cuenta = await borrarHistorial({
        chats: elegidos,
        corteMs: corteDe(opcionEdad.meses),
        alAvanzar: setBorrados,
      });

      setResultado({
        ok: true,
        texto: `Listo: se borraron ${cuenta} documentos de ${elegidos.length} chats.`,
      });
      setConfirmacion("");
    } catch (err) {
      console.error("[historial] Error al borrar:", err);

      setResultado({
        ok: false,
        texto:
          err?.code === "permission-denied"
            ? "Sin permiso para borrar. Publicá las reglas nuevas e iniciá sesión."
            : "Falló el borrado. Puedes volver a intentarlo.",
      });
    } finally {
      setBorrando(false);
    }
  };

  // Vistas de reinicio (los estados de arriba se conservan al volver)
  if (verDisenos) {
    return <ModalReinicioDisenos onVolver={() => setVerDisenos(false)} />;
  }

  if (verOnboarding) {
    return <ModalReinicioOnboarding onVolver={() => setVerOnboarding(false)} />;
  }

  return (
    <div className="modal-fondo" onClick={cerrar} role="presentation">
      <div
        className="modal-caja"
        role="dialog"
        aria-modal="true"
        aria-label="Gestionar historial"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-cab">
          <h2>Gestionar historial</h2>

          <button
            type="button"
            className="btn-claro"
            onClick={cerrar}
            disabled={borrando}
          >
            Cerrar
          </button>
        </div>

        <div className="modal-cuerpo">
          {/* REINICIOS DEL DASHBOARD */}
          <section
            style={{ display: "flex", flexWrap: "wrap", gap: 8 }}
          >
            <button
              type="button"
              className="btn-claro"
              onClick={() => setVerDisenos(true)}
              disabled={borrando}
            >
              👍 👎 Reiniciar me gusta / no me gusta de diseños →
            </button>

            <button
              type="button"
              className="btn-claro"
              onClick={() => setVerOnboarding(true)}
              disabled={borrando}
            >
              ✨ Reiniciar onboarding →
            </button>
          </section>

          {/* 1) QUÉ CHATS */}
          <section>
            <h3>1. ¿Qué chats?</h3>

            <div className="opciones-lista">
              {ALCANCES.map((a) => (
                <label key={a.id} className="datos-item">
                  <input
                    type="radio"
                    name="alcance"
                    checked={alcance === a.id}
                    onChange={() => setAlcance(a.id)}
                    disabled={borrando}
                  />
                  <span>
                    <strong>{a.label}</strong>
                    <small>{a.detalle}</small>
                  </span>
                </label>
              ))}
            </div>
          </section>

          {/* 2) QUÉ MENSAJES */}
          <section>
            <h3>2. ¿Qué mensajes?</h3>

            <div className="chips-edad">
              {OPCIONES_EDAD.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className={`chip-edad${edad === o.id ? " activa" : ""}`}
                  onClick={() => setEdad(o.id)}
                  disabled={borrando}
                >
                  {o.id === "todo" ? o.label : `Anteriores a ${o.label}`}
                </button>
              ))}
            </div>
          </section>

          <p className="peligro-aviso">
            Se borrarán los mensajes{" "}
            {opcionEdad.meses === 0
              ? "de todo el historial"
              : `anteriores a hace ${opcionEdad.label}`}{" "}
            de <strong>{elegidos.length}</strong>{" "}
            {elegidos.length === 1 ? "chat" : "chats"}. Las reseñas no se
            tocan. Esto <strong>no se puede deshacer</strong>.
          </p>

          <div className="peligro-confirmar">
            <label htmlFor="confirmar-historial">
              Escribe <strong>{PALABRA}</strong> para confirmar
            </label>

            <input
              id="confirmar-historial"
              type="search"
              value={confirmacion}
              onChange={(e) => setConfirmacion(e.target.value)}
              placeholder={PALABRA}
              autoComplete="off"
              disabled={borrando}
            />

            <button
              type="button"
              className="btn-peligro"
              onClick={confirmar}
              disabled={!puedeBorrar}
            >
              {borrando ? `Borrando… (${borrados})` : "Borrar historial"}
            </button>
          </div>

          {resultado && (
            <p className={resultado.ok ? "peligro-ok" : "error"}>
              {resultado.texto}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}