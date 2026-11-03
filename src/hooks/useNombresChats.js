// src/hooks/useNombresChats.js
//
// Nombre ficticio de cada chat, tomado de su reseña: { [chatId]: nombre }.
// Se escuchan las reseñas (la más nueva primero) y, por cada chatId, se
// guarda el nombre de su reseña más reciente. Si el usuario cambia su reseña
// desde la app, el nombre se actualiza solo.
//
// La escucha es COMPARTIDA: Chat, el modal y la sección de mensajes usan la
// misma suscripción (antes cada uno abría la suya y releía hasta 500 reseñas).

import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";

import { COLECCIONES, LIMITE_RESENAS } from "../config";
import { db } from "../firebase";
import { crearEscuchaCompartida } from "./escuchaCompartida";

const useNombresChats = crearEscuchaCompartida((emitir, caido) => {
  const consulta = query(
    collection(db, COLECCIONES.RESENAS),
    orderBy("createdAt", "desc"),
    limit(LIMITE_RESENAS)
  );

  return onSnapshot(
    consulta,
    (snapshot) => {
      const mapa = {};

      snapshot.docs.forEach((d) => {
        const data = d.data();
        const chatId = typeof data.chatId === "string" ? data.chatId : "";
        const nombre = String(data.nombre ?? "").trim();

        if (chatId && nombre && !(chatId in mapa)) {
          mapa[chatId] = nombre;
        }
      });

      emitir(mapa);
    },
    (err) => {
      // Si falla, todo sigue funcionando, solo sin los nombres
      console.warn("[chat] No se pudieron leer los nombres:", err);
      caido();
    }
  );
}, {});

export default useNombresChats;
