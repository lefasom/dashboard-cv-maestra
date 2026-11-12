// src/secciones/Datos.jsx  (Vite + React — Dashboard CV Master)
// Es la pestaña "Historial".
//
// Arriba: "Gestionar reseñas" (borrar puntuaciones y comentarios por
// antigüedad, avisando a cada app para que limpie su Store de reseñas).
// Es la ÚNICA forma de borrar reseñas: además de borrarlas en la nube,
// reinicia la reseña de cada usuario en su app (resetEn) para que pueda
// editar o enviar una nueva.
//
// Abajo: Restablecer datos: borra lo que elijas de Firestore
// (vuelve a cero). Es IRREVERSIBLE. NO incluye:
//   - "Reseñas": se gestionan arriba (acá solo se borraban de la base y
//     dejaban a los usuarios sin poder editar ni enviar una nueva).
//   - "Chats": se gestionan desde la pestaña Chat > "Gestionar historial",
//     que borra por estado y antigüedad e incluye los mensajes
//     personalizados (y limpia la lista de "Enviados a varios chats").
//
// Seguridad:
//   - no hay nada marcado de entrada
//   - hay que escribir la palabra BORRAR para habilitar el botón
//   - borra en tandas de 400 documentos y muestra el avance
//
// Requiere sesión iniciada y las reglas con `allow delete: if request.auth != null`.
//
// El borrado de "Uso" elimina el documento dashboard_config/uso_contadores
// (las métricas actuales) y además limpia las colecciones VIEJAS
// dashboard_interactions y dashboard_profiles, que ya no se leen pero pueden
// seguir recibiendo eventos de APK antiguas. Los borrados cuentan para la
// cuota diaria de Firestore.

import {
  collection,
  getDocs,
  limit,
  query,
  writeBatch,
} from "firebase/firestore";
import { useState } from "react";

import { COLECCIONES } from "../config";
import { db } from "../firebase";
import { borrarContadoresUso } from "../servicios/uso";
import "../estilos-historial.css";

const TANDA = 400;
const PALABRA = "BORRAR";

const OPCIONES = [
  {
    id: "plantillas",
    label: "Estadísticas (plantillas)",
    detalle: "Descargas de PDF y plantillas agregadas a la colección",
    coleccion: COLECCIONES.PLANTILLAS,
  },
  {
    id: "uso",
    label: "Uso",
    detalle:
      "Contadores de uso de la app (modo edición, ajustes, tamaños, idiomas, perfiles) y eventos viejos",
    esUso: true,
  },
  {
    id: "onboarding",
    label: "Onboarding",
    detalle: "Experiencia mejorada: áreas, etapas, extras y cambios",
    coleccion: COLECCIONES.ONBOARDING,
  },
];

// Borra todos los documentos de una colección, de a TANDA por vez
const borrarColeccion = async (ruta, alAvanzar) => {
  let total = 0;

  for (;;) {
    const snap = await getDocs(query(collection(db, ruta), limit(TANDA)));
    if (snap.empty) break;

    const batch = writeBatch(db);
    snap.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();

    total += snap.size;
    alAvanzar?.(snap.size);
  }

  return total;
};

// Uso: el documento de contadores + las colecciones viejas (deprecadas)
const borrarUso = async (alAvanzar) => {
  const borrado = await borrarContadoresUso();
  if (borrado) alAvanzar?.(borrado);

  await borrarColeccion(COLECCIONES.USO, alAvanzar);
  await borrarColeccion(COLECCIONES.PERFILES, alAvanzar);
};

export default function Datos() {
  const [marcadas, setMarcadas] = useState({});
  const [confirmacion, setConfirmacion] = useState("");
  const [borrando, setBorrando] = useState(false);
  const [borrados, setBorrados] = useState(0);
  const [resultado, setResultado] = useState(null); // { ok, texto }

  const elegidas = OPCIONES.filter((o) => marcadas[o.id]);
  const puedeBorrar =
    elegidas.length > 0 && confirmacion.trim() === PALABRA && !borrando;

  const alternar = (id) =>
    setMarcadas((m) => ({ ...m, [id]: !m[id] }));

  const marcarTodas = () =>
    setMarcadas(Object.fromEntries(OPCIONES.map((o) => [o.id, true])));

  const restablecer = async () => {
    if (!puedeBorrar) return;

    setBorrando(true);
    setBorrados(0);
    setResultado(null);

    let cuenta = 0;
    const sumar = (n) => {
      cuenta += n;
      setBorrados(cuenta);
    };

    try {
      for (const opcion of elegidas) {
        if (opcion.esUso) {
          await borrarUso(sumar);
        } else {
          await borrarColeccion(opcion.coleccion, sumar);
        }
      }

      setResultado({
        ok: true,
        texto: `Listo: se borraron ${cuenta} documentos.`,
      });
      setMarcadas({});
      setConfirmacion("");
    } catch (err) {
      console.error("[datos] Error al borrar:", err);

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
    <>
      {/* ---------------- RESTABLECER DATOS ---------------- */}
      <section className="panel peligro">
        <div className="panel-head">
          <h2>Restablecer datos</h2>

          <button
            type="button"
            className="btn-claro"
            onClick={marcarTodas}
            disabled={borrando}
          >
            Marcar todo
          </button>
        </div>

        <div className="peligro-cuerpo">
          <p className="peligro-aviso">
            Esto borra los datos de Firestore y <strong>no se puede deshacer</strong>.
            Los contadores y tablas vuelven a cero.
          </p>

          <div className="datos-lista">
            {OPCIONES.map((o) => (
              <label key={o.id} className="datos-item">
                <input
                  type="checkbox"
                  checked={Boolean(marcadas[o.id])}
                  onChange={() => alternar(o.id)}
                  disabled={borrando}
                />
                <span>
                  <strong>{o.label}</strong>
                  <small>{o.detalle}</small>
                </span>
              </label>
            ))}
          </div>

          <div className="peligro-confirmar">
            <label htmlFor="confirmar-borrado">
              Escribe <strong>{PALABRA}</strong> para confirmar
            </label>

            <input
              id="confirmar-borrado"
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
              onClick={restablecer}
              disabled={!puedeBorrar}
            >
              {borrando ? `Borrando… (${borrados})` : "Restablecer a cero"}
            </button>
          </div>

          {resultado && (
            <p className={resultado.ok ? "peligro-ok" : "error"}>
              {resultado.texto}
            </p>
          )}
        </div>
      </section>

    </>
  );
}