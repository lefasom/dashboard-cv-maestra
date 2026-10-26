// src/components/ModalReinicioOnboarding.jsx  (Vite + React — Dashboard CV Master)
//
// "Reiniciar onboarding". Se abre desde "Gestionar historial".
//
//   - Elegís qué borrar: todo el onboarding, solo las configuraciones
//     elegidas (Áreas, Extras, Momento laboral) o solo el uso del Admin.
//   - Los números salen de una consulta de conteo (casi no gasta lecturas).
//   - Es irreversible: hay que escribir BORRAR.
//   - No afecta a las personas que ya activaron la experiencia mejorada en la
//     app: solo borra las estadísticas del dashboard.
//
// Usa las mismas clases CSS que ModalHistorial (estilos-historial.css).

import { useCallback, useEffect, useState } from "react";

import {
  MODOS_ONBOARDING,
  contarOnboarding,
  reiniciarOnboarding,
} from "../servicios/onboarding";

const PALABRA = "BORRAR";

const OPCIONES = [
  {
    id: MODOS_ONBOARDING.todo,
    label: "Todo el onboarding",
    detalle:
      "Configuraciones elegidas y uso del Admin (incluye los eventos viejos de editado y desactivado)",
  },
  {
    id: MODOS_ONBOARDING.completados,
    label: "Solo configuraciones elegidas",
    detalle: "Áreas elegidas, Extras más seleccionados y Momento laboral",
  },
  {
    id: MODOS_ONBOARDING.admin,
    label: "Solo uso del Admin",
    detalle: "Las 4 tarjetas de arriba (Admin y botones Editar)",
  },
];

export default function ModalReinicioOnboarding({ onVolver }) {
  const [modo, setModo] = useState(MODOS_ONBOARDING.todo);
  const [conteo, setConteo] = useState(null); // { todo, completados, admin }
  const [confirmacion, setConfirmacion] = useState("");
  const [borrando, setBorrando] = useState(false);
  const [borrados, setBorrados] = useState(0);
  const [resultado, setResultado] = useState(null); // { ok, texto }

  const cargarConteo = useCallback(async () => {
    try {
      setConteo(await contarOnboarding());
    } catch (err) {
      console.error("[onboarding] No se pudo contar:", err);
      setConteo(null);
    }
  }, []);

  useEffect(() => {
    cargarConteo();
  }, [cargarConteo]);

  const afectados = conteo ? conteo[modo] : null;

  const puedeBorrar =
    confirmacion.trim() === PALABRA && !borrando && afectados !== 0;

  const volver = () => {
    if (!borrando) onVolver();
  };

  const confirmar = async () => {
    if (!puedeBorrar) return;

    setBorrando(true);
    setBorrados(0);
    setResultado(null);

    try {
      const cuenta = await reiniciarOnboarding({
        modo,
        alAvanzar: setBorrados,
      });

      setResultado({
        ok: true,
        texto: `Listo: se borraron ${cuenta} eventos de onboarding.`,
      });
      setConfirmacion("");
      cargarConteo();
    } catch (err) {
      console.error("[onboarding] Error al borrar:", err);

      setResultado({
        ok: false,
        texto:
          err?.code === "permission-denied"
            ? "Sin permiso para borrar. Publicá las reglas e iniciá sesión."
            : "Falló el borrado. Puedes volver a intentarlo.",
      });
    } finally {
      setBorrando(false);
    }
  };

  return (
    <div className="modal-fondo" onClick={volver} role="presentation">
      <div
        className="modal-caja"
        role="dialog"
        aria-modal="true"
        aria-label="Reiniciar onboarding"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-cab">
          <h2>Reiniciar onboarding</h2>

          <button
            type="button"
            className="btn-claro"
            onClick={volver}
            disabled={borrando}
          >
            ← Volver
          </button>
        </div>

        <div className="modal-cuerpo">
          <section>
            <h3>¿Qué datos?</h3>

            <div className="opciones-lista">
              {OPCIONES.map((o) => (
                <label key={o.id} className="datos-item">
                  <input
                    type="radio"
                    name="modo-onboarding"
                    checked={modo === o.id}
                    onChange={() => setModo(o.id)}
                    disabled={borrando}
                  />
                  <span>
                    <strong>
                      {o.label}
                      {conteo ? ` (${conteo[o.id]})` : ""}
                    </strong>
                    <small>{o.detalle}</small>
                  </span>
                </label>
              ))}
            </div>
          </section>

          <p className="peligro-aviso">
            {afectados === null
              ? "Se borrarán los eventos de onboarding elegidos"
              : `Se borrarán ${afectados} ${
                  afectados === 1 ? "evento" : "eventos"
                } de onboarding`}
            . Solo se limpian las estadísticas del dashboard: quienes ya
            activaron la experiencia mejorada en la app la siguen teniendo.
            Esto <strong>no se puede deshacer</strong>.
          </p>

          <div className="peligro-confirmar">
            <label htmlFor="confirmar-onboarding">
              Escribe <strong>{PALABRA}</strong> para confirmar
            </label>

            <input
              id="confirmar-onboarding"
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
              {borrando ? `Borrando… (${borrados})` : "Reiniciar onboarding"}
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
