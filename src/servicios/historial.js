// src/servicios/historial.js  (Vite + React — Dashboard CV Master)
//
// Gestionar historial del chat, estilo "borrar historial" de Google:
// borra mensajes por antigüedad (1 mes, 2, 3… 1 año o todo) de los chats
// que elijas (todos / respondidos / sin responder).
//
// Qué hace por cada chat:
//   1) Borra sus mensajes (anteriores al corte, o todos).
//   2) Borra sus contadores diarios (los de días anteriores al corte, o todos).
//   3) Opcional (resetearResena): borra la reseña de ese usuario
//      (dashboard_reviews con su chatId) y escribe `resetEn` en su ficha.
//      La app, al verlo, olvida la reseña y vuelve a mostrar "Deja tu reseña".
//   4) Recalcula la ficha (último mensaje, última respuesta) con lo que
//      quedó. La ficha NO se borra: así el chat conserva su número.
//
// Las reseñas viejas (enviadas antes de esta versión) no tienen chatId, así
// que no se pueden vincular a un usuario: esas se borran desde "Datos".
//
// Requiere sesión iniciada y las reglas nuevas de firestore.rules.

import {
  collection,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { COLECCIONES } from "../config";
import { db } from "../firebase";

const TANDA = 400;

// ------------------------------------------------------------
// OPCIONES DE ANTIGÜEDAD
// ------------------------------------------------------------

export const OPCIONES_EDAD = [
  { id: "todo", meses: 0, label: "Todo el historial" },
  { id: "1", meses: 1, label: "1 mes" },
  { id: "2", meses: 2, label: "2 meses" },
  { id: "3", meses: 3, label: "3 meses" },
  { id: "4", meses: 4, label: "4 meses" },
  { id: "5", meses: 5, label: "5 meses" },
  { id: "6", meses: 6, label: "6 meses" },
  { id: "12", meses: 12, label: "1 año" },
];

// Fecha (ms) desde la que se conserva todo. null = se borra todo.
export const corteDe = (meses) => {
  if (!meses) return null;

  const d = new Date();
  d.setMonth(d.getMonth() - meses);
  return d.getTime();
};

const dos = (n) => String(n).padStart(2, "0");

const diaClave = (ms) => {
  const d = new Date(ms);
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`;
};

// ------------------------------------------------------------
// BORRADO EN TANDAS
// ------------------------------------------------------------

const borrarLista = async (refs, alAvanzar) => {
  for (let i = 0; i < refs.length; i += TANDA) {
    const tanda = refs.slice(i, i + TANDA);
    const batch = writeBatch(db);

    tanda.forEach((ref) => batch.delete(ref));
    await batch.commit();

    alAvanzar?.(tanda.length);
  }
};

// Borra los documentos de una colección que cumplan las restricciones
const borrarPorConsulta = async (ref, restricciones, alAvanzar) => {
  for (;;) {
    const snap = await getDocs(query(ref, ...restricciones, limit(TANDA)));
    if (snap.empty) break;

    await borrarLista(
      snap.docs.map((d) => d.ref),
      alAvanzar
    );
  }
};

// ------------------------------------------------------------
// PASOS POR CHAT
// ------------------------------------------------------------

const borrarMensajes = (chatId, corteMs, alAvanzar) =>
  borrarPorConsulta(
    collection(db, COLECCIONES.CHATS, chatId, "messages"),
    corteMs ? [where("enviadoEn", "<", corteMs)] : [],
    alAvanzar
  );

// Los contadores se llaman como el día ("2026-10-22"): se borran los de días
// anteriores al día del corte (o todos)
const borrarLimites = async (chatId, corteMs, alAvanzar) => {
  const snap = await getDocs(
    collection(db, COLECCIONES.CHATS, chatId, "limites")
  );

  const corteDia = corteMs ? diaClave(corteMs) : null;

  await borrarLista(
    snap.docs
      .filter((d) => corteDia === null || d.id < corteDia)
      .map((d) => d.ref),
    alAvanzar
  );
};

const borrarResenasDe = async (chatId, alAvanzar) => {
  const snap = await getDocs(
    query(collection(db, COLECCIONES.RESENAS), where("chatId", "==", chatId))
  );

  await borrarLista(
    snap.docs.map((d) => d.ref),
    alAvanzar
  );
};

// Deja la ficha coherente con los mensajes que quedaron
const recalcularFicha = async (chatId, resetearResena) => {
  const snap = await getDocs(
    query(
      collection(db, COLECCIONES.CHATS, chatId, "messages"),
      orderBy("enviadoEn", "desc"),
      limit(50)
    )
  );

  const mensajes = snap.docs.map((d) => d.data());

  const indiceUsuario = mensajes.findIndex((m) => m.de !== "soporte");
  const indiceSoporte = mensajes.findIndex((m) => m.de === "soporte");

  const ultimoUsuario = indiceUsuario >= 0 ? mensajes[indiceUsuario] : null;
  const ultimoSoporte = indiceSoporte >= 0 ? mensajes[indiceSoporte] : null;

  const usuarioEn = Number(ultimoUsuario?.enviadoEn) || 0;
  const soporteEn = Number(ultimoSoporte?.enviadoEn) || 0;

  const cambios = {
    ultimoMensaje: ultimoUsuario
      ? String(ultimoUsuario.texto ?? "").slice(0, 100)
      : "",
    ultimoMensajeEn: usuarioEn,
    // Si tu último mensaje es más nuevo que el del usuario, quedó respondido
    ultimaRespuestaEn:
      ultimoSoporte && indiceSoporte < indiceUsuario
        ? Math.max(soporteEn, usuarioEn)
        : soporteEn,
  };

  if (mensajes.length === 0) cambios.soporteLeyoHasta = 0;
  if (resetearResena) cambios.resetEn = Date.now();

  await updateDoc(doc(db, COLECCIONES.CHATS, chatId), cambios);
};

// ------------------------------------------------------------
// PRINCIPAL
//
// @param {object}   opciones
//   chats           lista de chats a limpiar ({ id, ... })
//   corteMs         borrar lo anterior a esta fecha (null = todo)
//   resetearResena  borrar también la reseña y permitir reseñar de nuevo
//   alAvanzar(n)    se llama con la cantidad de documentos borrados
// @returns {Promise<number>} total de documentos borrados
// ------------------------------------------------------------

export const borrarHistorial = async ({
  chats,
  corteMs = null,
  resetearResena = false,
  alAvanzar,
}) => {
  let total = 0;

  const sumar = (n) => {
    total += n;
    alAvanzar?.(total);
  };

  for (const chat of chats) {
    await borrarMensajes(chat.id, corteMs, sumar);
    await borrarLimites(chat.id, corteMs, sumar);

    if (resetearResena) await borrarResenasDe(chat.id, sumar);

    await recalcularFicha(chat.id, resetearResena);
  }

  return total;
};
