// src/hooks/useMensajesCompartidos.js
//
// Escucha en tiempo real las encuestas de la tabla compartida
// (dashboard_mensajes_compartidos) que aparecen en el chat abierto.
//
// Recibe la lista de ids (los `refId` de los mensajes) y devuelve un mapa:
//   { [id]: { id, ...datos } }   la encuesta existe
//   { [id]: null }               la encuesta no existe (se borró) o no se pudo leer
//   (sin clave)                  todavía cargando
//
// Cada id tiene su propia suscripción; solo se leen las encuestas del chat
// que está abierto, y los votos nuevos llegan en vivo.

import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useRef, useState } from "react";

import { COLECCIONES } from "../config";
import { db } from "../firebase";

export default function useMensajesCompartidos(ids) {
  const [mapa, setMapa] = useState({});
  const suscripciones = useRef(new Map());

  // Clave estable: solo cambia si cambia el conjunto de ids
  const clave = [...new Set(ids ?? [])].sort().join("|");

  useEffect(() => {
    const deseados = new Set(clave ? clave.split("|") : []);

    // Cierra las que ya no se necesitan
    suscripciones.current.forEach((cancelar, id) => {
      if (deseados.has(id)) return;

      cancelar();
      suscripciones.current.delete(id);

      setMapa((previo) => {
        const { [id]: _quitado, ...resto } = previo;
        return resto;
      });
    });

    // Abre las nuevas
    deseados.forEach((id) => {
      if (suscripciones.current.has(id)) return;

      const cancelar = onSnapshot(
        doc(db, COLECCIONES.MENSAJES_COMPARTIDOS, id),
        (snap) => {
          setMapa((previo) => ({
            ...previo,
            [id]: snap.exists() ? { id, ...snap.data() } : null,
          }));
        },
        (err) => {
          console.warn("[compartidos] No se pudo leer la encuesta:", id, err);
          setMapa((previo) => ({ ...previo, [id]: null }));
        }
      );

      suscripciones.current.set(id, cancelar);
    });
  }, [clave]);

  // Al desmontar se cierra todo
  useEffect(
    () => () => {
      suscripciones.current.forEach((cancelar) => cancelar());
      suscripciones.current.clear();
    },
    []
  );

  return mapa;
}
