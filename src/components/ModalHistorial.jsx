// src/components/ModalHistorial.jsx  (Vite + React — Dashboard CV Master)
//
// "Gestionar historial": modal para borrar chats por estado y antigüedad.
//
//   1) Qué chats: todos / respondidos / sin responder
//   2) Qué mensajes: todo el historial, o los anteriores a 1, 2, 3, 4, 5, 6
//      meses o 1 año
//   3) Opcional: que esos usuarios puedan volver a dejar su reseña
//      (se borra su reseña y la app vuelve a mostrar "Deja tu reseña").
//      Viene marcado solo cuando se borra TODO el historial.
//
// Arriba hay un botón que abre OTRO modal para reiniciar los me gusta /
// no me gusta de los diseños (ModalReinicioDisenos).
//
// Es irreversible: hay que escribir BORRAR para habilitar el botón.

import { useEffect, useMemo, useState } from "react";

import {
  OPCIONES_EDAD,
  borrarHistorial,
  corteDe,
} from "../servicios/historial";
import ModalReinicioDisenos from "./ModalReinicioDisenos";

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
  const [resetearResena, setResetearResena] = useState(true);
  const [confirmacion, setConfirmacion] = useState("");
  const [borrando, setBorrando] = useState(false);
  const [borrados, setBorrados] = useState(0);
  const [resultado, setResultado] = useState(null); // { ok, texto }
  const [verDisenos, setVerDisenos] = useState(false);

  const opcionEdad = OPCIONES_EDAD.find((o) => o.id === edad) ?? OPCIONES_EDAD[0];

  // Al cambiar la antigüedad, la casilla de reseña vuelve a su valor por
  // defecto: marcada solo si se borra todo el historial
  useEffect(() => {
    setResetearResena(edad === "todo");
  }, [edad]);

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
        resetearResena,
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

  // Vista de "me gusta / no me gusta de diseños" (los estados de arriba
  // se conservan al volver)
  if (verDisenos) {
    return <ModalReinicioDisenos onVolver={() => setVerDisenos(false)} />;
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
          {/* ME GUSTA / NO ME GUSTA DE DISEÑOS */}
          <section>
            <button
              type="button"
              className="btn-claro"
              onClick={() => setVerDisenos(true)}
              disabled={borrando}
            >
              👍 👎 Reiniciar me gusta / no me gusta de diseños →
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

          {/* 3) RESEÑA */}
          <section>
            <h3>3. Reseña</h3>

            <label className="datos-item">
              <input
                type="checkbox"
                checked={resetearResena}
                onChange={(e) => setResetearResena(e.target.checked)}
                disabled={borrando}
              />
              <span>
                <strong>Permitir que vuelvan a dejar su reseña</strong>
                <small>
                  Borra la reseña de esos usuarios y la app les vuelve a
                  mostrar “Deja tu reseña” en lugar del mensaje de gracias.
                </small>
              </span>
            </label>
          </section>

          <p className="peligro-aviso">
            Se borrarán los mensajes{" "}
            {opcionEdad.meses === 0
              ? "de todo el historial"
              : `anteriores a hace ${opcionEdad.label}`}{" "}
            de <strong>{elegidos.length}</strong>{" "}
            {elegidos.length === 1 ? "chat" : "chats"}
            {resetearResena ? ", y esos usuarios podrán reseñar de nuevo" : ""}.
            Esto <strong>no se puede deshacer</strong>.
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