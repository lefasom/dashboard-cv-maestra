// src/secciones/Datos.jsx  (Vite + React — Dashboard CV Master)
//
// Restablecer datos: borra las colecciones que elijas de Firestore
// (vuelven a cero). Es IRREVERSIBLE.
//
// Seguridad:
//   - no hay nada marcado de entrada
//   - hay que escribir la palabra BORRAR para habilitar el botón
//   - borra en tandas de 400 documentos y muestra el avance
//
// Requiere sesión iniciada y las reglas con `allow delete: if request.auth != null`.
//
// El borrado de "Chats" incluye los mensajes y los contadores diarios de
// cada chat (Firestore no borra subcolecciones automáticamente desde el
// cliente, por eso se recorren una por una).

import {
  collection,
  deleteDoc,
  getDocs,
  limit,
  query,
  writeBatch,
} from "firebase/firestore";
import { useState } from "react";

import { COLECCIONES } from "../config";
import { db } from "../firebase";

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
    detalle: "Editor abierto, desplazamientos y paginación",
    coleccion: COLECCIONES.USO,
  },
  {
    id: "onboarding",
    label: "Onboarding",
    detalle: "Experiencia mejorada: áreas, etapas, extras y cambios",
    coleccion: COLECCIONES.ONBOARDING,
  },
  {
    id: "perfiles",
    label: "Perfiles",
    detalle: "Profesiones de prueba y perfiles reales creados",
    coleccion: COLECCIONES.PERFILES,
  },
  {
    id: "resenas",
    label: "Reseñas",
    detalle: "Puntuaciones y comentarios de los usuarios",
    coleccion: COLECCIONES.RESENAS,
  },
  {
    id: "chats",
    label: "Chats",
    detalle: "Todas las conversaciones, usuarios y contadores diarios",
    coleccion: COLECCIONES.CHATS,
    esChat: true,
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

// Chats: primero sus mensajes y contadores, después la ficha
const borrarChats = async (alAvanzar) => {
  const chats = await getDocs(collection(db, COLECCIONES.CHATS));

  for (const chat of chats.docs) {
    await borrarColeccion(
      `${COLECCIONES.CHATS}/${chat.id}/messages`,
      alAvanzar
    );
    await borrarColeccion(
      `${COLECCIONES.CHATS}/${chat.id}/limites`,
      alAvanzar
    );

    await deleteDoc(chat.ref);
    alAvanzar?.(1);
  }
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
        if (opcion.esChat) {
          await borrarChats(sumar);
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
  );
}
