// src/servicios/historialResenas.js  (Vite + React — Dashboard CV Master)
//
// Gestionar reseñas, estilo "borrar historial": borra reseñas por
// antigüedad (1 mes, 2, 3… 1 año o todas).
//
// Es INDEPENDIENTE del borrado de chats: no toca mensajes, contadores ni
// fichas de chat (salvo el campo `resetEn`, que es la señal para la app).
//
// Qué hace:
//   1) Borra las reseñas de dashboard_reviews (las anteriores al corte, o
//      todas).
//   2) Por cada reseña borrada que tenga chatId, escribe `resetEn` en la
//      ficha chats/{chatId}. La app, al ver ese campo, olvida su reseña
//      guardada en el Store local y vuelve a mostrar "Deja tu reseña".
//      Así NO queda una reseña fantasma en el teléfono y el usuario puede
//      dejar una nueva (es la misma señal que ya usaba el borrado de chats).
//
// Las reseñas viejas (enviadas antes de que existiera chatId) no se pueden
// vincular a un usuario: se borran de la nube, pero no se les puede avisar
// a su app. La función devuelve cuántas fueron para poder mostrarlo.
//
// Requiere sesión iniciada y las reglas de firestore.rules (delete sobre
// dashboard_reviews y update sobre chats).

import {
  Timestamp,
  collection,
  doc,
  getCountFromServer,
  getDocs,
  limit,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { COLECCIONES } from "../config";
import { db } from "../firebase";

const TANDA = 400;

// Reseñas anteriores al corte (createdAt). corteMs = null -> todas.
const restriccionesDe = (corteMs) =>
  corteMs ? [where("createdAt", "<", Timestamp.fromMillis(corteMs))] : [];

// Cuántas reseñas se borrarían con ese corte (para mostrarlo antes de borrar)
export const contarResenas = async (corteMs) => {
  const snap = await getCountFromServer(
    query(collection(db, COLECCIONES.RESENAS), ...restriccionesDe(corteMs))
  );

  return snap.data().count;
};

// Escribe `resetEn` en la ficha de cada chat. Si la ficha ya no existe
// (chat borrado), se ignora: no hay nadie a quien avisar.
const avisarReseteo = async (chatIds) => {
  const resetEn = Date.now();

  for (const chatId of chatIds) {
    try {
      await updateDoc(doc(db, COLECCIONES.CHATS, chatId), { resetEn });
    } catch (err) {
      if (err?.code !== "not-found") throw err;
    }
  }
};

// ------------------------------------------------------------
// PRINCIPAL
//
// @param {object}   opciones
//   corteMs       borrar lo anterior a esta fecha (null = todas)
//   alAvanzar(n)  se llama con la cantidad de documentos recién borrados
// @returns {Promise<{ total: number, sinChat: number }>}
//   total    reseñas borradas
//   sinChat  de esas, cuántas no tenían chatId (no se pudo avisar a su app)
// ------------------------------------------------------------

export const borrarResenas = async ({ corteMs = null, alAvanzar } = {}) => {
  const restricciones = restriccionesDe(corteMs);

  let total = 0;
  let sinChat = 0;

  for (;;) {
    const snap = await getDocs(
      query(
        collection(db, COLECCIONES.RESENAS),
        ...restricciones,
        limit(TANDA)
      )
    );

    if (snap.empty) break;

    const chatIds = new Set();
    const batch = writeBatch(db);

    snap.docs.forEach((d) => {
      batch.delete(d.ref);

      const chatId = d.data().chatId;

      if (typeof chatId === "string" && chatId) chatIds.add(chatId);
      else sinChat += 1;
    });

    await batch.commit();

    total += snap.size;
    alAvanzar?.(snap.size);

    // Después de borrar en la nube, se avisa a las apps
    await avisarReseteo(chatIds);
  }

  return { total, sinChat };
};
