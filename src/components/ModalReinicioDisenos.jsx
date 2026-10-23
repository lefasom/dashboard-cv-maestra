// src/components/ModalReinicioDisenos.jsx  (Vite + React — Dashboard CV Master)
//
// "Reiniciar me gusta / no me gusta de diseños". Se abre desde
// "Gestionar historial".
//
//   - Escribís uno o varios diseños separados por coma (ej. CV-51, CV-06),
//     o tocás las etiquetas de abajo, o marcás "Todos los diseños".
//   - Al confirmar: se borran los votos, se ponen en cero los contadores y
//     todos los teléfonos vuelven a preguntar "¿Te gustó el diseño?" para
//     esos diseños (en cuanto tengan internet y abran la app).
//   - "Recalcular contadores" vuelve a contar todos los votos (solo hace
//     falta si alguna vez los números no coinciden).
//
// Los números de las etiquetas salen del documento de contadores (una sola
// lectura). Es irreversible: hay que escribir BORRAR.
// Usa las mismas clases CSS que ModalHistorial (estilos-historial.css).

import { useMemo, useState } from "react";

import useContadoresDisenos from "../hooks/useContadoresDisenos";
import {
  limpiarNombreDiseno,
  recalcularContadores,
  reiniciarDisenos,
} from "../servicios/disenos";

const PALABRA = "BORRAR";

export default function ModalReinicioDisenos({ onVolver }) {
  const { filas } = useContadoresDisenos();

  const [todos, setTodos] = useState(false);
  const [texto, setTexto] = useState("");
  const [confirmacion, setConfirmacion] = useState("");
  const [borrando, setBorrando] = useState(false);
  const [borrados, setBorrados] = useState(0);
  const [recalculando, setRecalculando] = useState(false);
  const [resultado, setResultado] = useState(null); // { ok, texto }

  const ocupado = borrando || recalculando;

  // Votos por diseño (me gusta + no me gusta)
  const conteo = useMemo(() => {
    const mapa = {};

    Object.entries(filas).forEach(([nombre, f]) => {
      const total = f.likes + f.dislikes;
      if (total > 0) mapa[nombre] = total;
    });

    return mapa;
  }, [filas]);

  const conocidos = useMemo(
    () =>
      Object.keys(conteo).sort((a, b) =>
        a.localeCompare(b, "es", { numeric: true })
      ),
    [conteo]
  );

  // Lo escrito -> lista de nombres (sin repetir; si coincide con un diseño
  // conocido sin importar mayúsculas, se usa el nombre exacto)
  const nombres = useMemo(() => {
    const vistos = new Set();

    texto.split(/[,;\n]+/).forEach((parte) => {
      const limpio = limpiarNombreDiseno(parte);
      if (!limpio) return;

      const conocido = conocidos.find(
        (n) => n.toLowerCase() === limpio.toLowerCase()
      );

      vistos.add(conocido ?? limpio);
    });

    return [...vistos];
  }, [texto, conocidos]);

  const votosAfectados = todos
    ? Object.values(conteo).reduce((a, b) => a + b, 0)
    : nombres.reduce((suma, n) => suma + (conteo[n] ?? 0), 0);

  const puedeBorrar =
    (todos || nombres.length > 0) && confirmacion.trim() === PALABRA && !ocupado;

  const alternar = (nombre) => {
    setTexto(
      nombres.includes(nombre)
        ? nombres.filter((n) => n !== nombre).join(", ")
        : [...nombres, nombre].join(", ")
    );
  };

  const volver = () => {
    if (!ocupado) onVolver();
  };

  const textoError = (err, porDefecto) =>
    err?.code === "permission-denied"
      ? "Sin permiso. Publicá las reglas nuevas (dashboard_config) e iniciá sesión."
      : porDefecto;

  const confirmar = async () => {
    if (!puedeBorrar) return;

    setBorrando(true);
    setBorrados(0);
    setResultado(null);

    try {
      const cuenta = await reiniciarDisenos({
        todos,
        nombres,
        alAvanzar: setBorrados,
      });

      setResultado({
        ok: true,
        texto: `Listo: se borraron ${cuenta} votos. Los teléfonos volverán a preguntar en cuanto se conecten.`,
      });
      setConfirmacion("");
      setTexto("");
      setTodos(false);
    } catch (err) {
      console.error("[reinicio diseños] Error:", err);

      setResultado({
        ok: false,
        texto: textoError(err, "Falló el reinicio. Puedes volver a intentarlo."),
      });
    } finally {
      setBorrando(false);
    }
  };

  const recalcular = async () => {
    if (ocupado) return;

    setRecalculando(true);
    setResultado(null);

    try {
      const cuenta = await recalcularContadores();

      setResultado({
        ok: true,
        texto: `Listo: se contaron ${cuenta} votos y se actualizaron los contadores.`,
      });
    } catch (err) {
      console.error("[recalcular diseños] Error:", err);

      setResultado({
        ok: false,
        texto: textoError(err, "No se pudo recalcular. Puedes volver a intentarlo."),
      });
    } finally {
      setRecalculando(false);
    }
  };

  return (
    <div className="modal-fondo" onClick={volver} role="presentation">
      <div
        className="modal-caja"
        role="dialog"
        aria-modal="true"
        aria-label="Reiniciar me gusta y no me gusta de diseños"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-cab">
          <h2>Me gusta / no me gusta</h2>

          <button
            type="button"
            className="btn-claro"
            onClick={volver}
            disabled={ocupado}
          >
            ← Volver
          </button>
        </div>

        <div className="modal-cuerpo">
          <section>
            <h3>¿Qué diseños?</h3>

            <label className="datos-item">
              <input
                type="checkbox"
                checked={todos}
                onChange={(e) => setTodos(e.target.checked)}
                disabled={ocupado}
              />
              <span>
                <strong>Todos los diseños</strong>
                <small>Reinicia los votos de todos los usuarios</small>
              </span>
            </label>

            {!todos && (
              <>
                <input
                  type="search"
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder="Ej: CV-51 (varios, separados por coma)"
                  autoComplete="off"
                  disabled={ocupado}
                  style={{ width: "100%", marginTop: 10 }}
                />

                {conocidos.length > 0 && (
                  <div className="chips-edad" style={{ marginTop: 10 }}>
                    {conocidos.map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={`chip-edad${
                          nombres.includes(n) ? " activa" : ""
                        }`}
                        onClick={() => alternar(n)}
                        disabled={ocupado}
                      >
                        {n} ({conteo[n]})
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </section>

          <p className="peligro-aviso">
            {todos
              ? "Se borrarán los votos de todos los diseños"
              : nombres.length === 0
              ? "Elegí al menos un diseño"
              : `Se borrarán los votos de ${nombres.join(", ")}`}
            {(todos || nombres.length > 0) && (
              <>
                {" "}
                (<strong>{votosAfectados}</strong> en total) y todos los
                usuarios podrán votar de nuevo
              </>
            )}
            . Esto <strong>no se puede deshacer</strong>.
          </p>

          <div className="peligro-confirmar">
            <label htmlFor="confirmar-disenos">
              Escribe <strong>{PALABRA}</strong> para confirmar
            </label>

            <input
              id="confirmar-disenos"
              type="search"
              value={confirmacion}
              onChange={(e) => setConfirmacion(e.target.value)}
              placeholder={PALABRA}
              autoComplete="off"
              disabled={ocupado}
            />

            <button
              type="button"
              className="btn-peligro"
              onClick={confirmar}
              disabled={!puedeBorrar}
            >
              {borrando ? `Borrando… (${borrados})` : "Reiniciar votos"}
            </button>
          </div>

          {resultado && (
            <p className={resultado.ok ? "peligro-ok" : "error"}>
              {resultado.texto}
            </p>
          )}

          <section>
            <h3>Contadores</h3>

            <button
              type="button"
              className="btn-claro"
              onClick={recalcular}
              disabled={ocupado}
            >
              {recalculando ? "Recalculando…" : "Recalcular contadores"}
            </button>

            <small style={{ display: "block", marginTop: 6, opacity: 0.7 }}>
              Vuelve a contar todos los votos. Solo hace falta si los números
              de Valoración no coinciden.
            </small>
          </section>
        </div>
      </div>
    </div>
  );
}
