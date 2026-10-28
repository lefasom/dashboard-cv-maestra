// src/components/ModalHistorialResenas.jsx  (Vite + React — Dashboard CV Master)
//
// "Gestionar reseñas": modal para borrar puntuaciones y comentarios de los
// usuarios por antigüedad (todas, o anteriores a 1, 2, 3, 4, 5, 6 meses o
// 1 año). Funciona igual que "Gestionar historial" de la Sala de chat, pero
// SOLO con reseñas: no borra ningún chat.
//
// Al borrar:
//   1) Se borran las reseñas de la nube (dashboard_reviews).
//   2) Se avisa a la app de cada usuario (resetEn) para que limpie su Store
//      de reseñas: no queda ninguna reseña fantasma y puede dejar una nueva.
//
// Es irreversible: hay que escribir BORRAR para habilitar el botón.

import { useEffect, useState } from "react";

import { borrarResenas, contarResenas } from "../servicios/historialResenas";
import { OPCIONES_EDAD, corteDe } from "../servicios/historial";
import "../estilos-historial.css";

const PALABRA = "BORRAR";

export default function ModalHistorialResenas({ onClose }) {
  const [edad, setEdad] = useState("todo");
  const [cantidad, setCantidad] = useState(null); // null = calculando
  const [confirmacion, setConfirmacion] = useState("");
  const [borrando, setBorrando] = useState(false);
  const [borrados, setBorrados] = useState(0);
  const [resultado, setResultado] = useState(null); // { ok, texto }

  const opcionEdad =
    OPCIONES_EDAD.find((o) => o.id === edad) ?? OPCIONES_EDAD[0];

  // Cuántas reseñas entran en el borrado (se recalcula al cambiar la edad)
  useEffect(() => {
    let vigente = true;

    setCantidad(null);

    contarResenas(corteDe(opcionEdad.meses))
      .then((n) => {
        if (vigente) setCantidad(n);
      })
      .catch((err) => {
        console.warn("[historial-resenas] No se pudo contar:", err);
        // Si el conteo falla, el borrado igual se puede hacer
        if (vigente) setCantidad(-1);
      });

    return () => {
      vigente = false;
    };
  }, [opcionEdad.meses, resultado]);

  const hayParaBorrar = cantidad !== 0;
  const puedeBorrar =
    hayParaBorrar && confirmacion.trim() === PALABRA && !borrando;

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
      const { total, sinChat } = await borrarResenas({
        corteMs: corteDe(opcionEdad.meses),
        alAvanzar: (n) => {
          cuenta += n;
          setBorrados(cuenta);
        },
      });

      const aviso =
        sinChat > 0
          ? ` ${sinChat} eran reseñas viejas sin chat vinculado: se borraron de la nube, pero no se les pudo avisar a su app.`
          : "";

      setResultado({
        ok: true,
        texto: `Listo: se borraron ${total} reseñas y se avisó a las apps para que puedan reseñar de nuevo.${aviso}`,
      });
      setConfirmacion("");
    } catch (err) {
      console.error("[historial-resenas] Error al borrar:", err);

      setResultado({
        ok: false,
        texto:
          err?.code === "permission-denied"
            ? `Sin permiso para borrar (se borraron ${cuenta} antes de fallar). Publicá las reglas nuevas e iniciá sesión.`
            : `Falló el borrado (se borraron ${cuenta} antes de fallar). Puedes volver a intentarlo.`,
      });
    } finally {
      setBorrando(false);
    }
  };

  return (
    <div className="modal-fondo" onClick={cerrar} role="presentation">
      <div
        className="modal-caja"
        role="dialog"
        aria-modal="true"
        aria-label="Gestionar reseñas"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-cab">
          <h2>Gestionar reseñas</h2>

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
          <section>
            <h3>¿Qué reseñas?</h3>

            <div className="chips-edad">
              {OPCIONES_EDAD.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  className={`chip-edad${edad === o.id ? " activa" : ""}`}
                  onClick={() => setEdad(o.id)}
                  disabled={borrando}
                >
                  {o.id === "todo" ? "Todas las reseñas" : `Anteriores a ${o.label}`}
                </button>
              ))}
            </div>
          </section>

          <p className="peligro-aviso">
            Se borrarán{" "}
            {opcionEdad.meses === 0
              ? "todas las reseñas"
              : `las reseñas anteriores a hace ${opcionEdad.label}`}
            {cantidad === null && " (calculando…)"}
            {cantidad !== null && cantidad >= 0 && (
              <>
                {": "}
                <strong>{cantidad}</strong>
              </>
            )}
            . Se limpian en la nube y en el Store de cada app, y esos usuarios
            podrán dejar una reseña nueva. <strong>No se borra ningún chat.</strong>{" "}
            Esto <strong>no se puede deshacer</strong>.
          </p>

          <div className="peligro-confirmar">
            <label htmlFor="confirmar-historial-resenas">
              Escribe <strong>{PALABRA}</strong> para confirmar
            </label>

            <input
              id="confirmar-historial-resenas"
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
              {borrando ? `Borrando… (${borrados})` : "Borrar reseñas"}
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
