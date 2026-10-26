// src/servicios/onboarding.js  (Vite + React — Dashboard CV Master)
//
// Reiniciar los datos de Onboarding (colección dashboard_onboarding).
//
//   modo "todo"         -> toda la colección (configuraciones elegidas, uso del
//                          Admin y los eventos viejos de editado / desactivado)
//   modo "completados"  -> solo onboarding_completado (alimenta las tablas
//                          Áreas elegidas, Extras y Momento laboral)
//   modo "admin"        -> solo onboarding_admin_uso (las 4 tarjetas de arriba)
//
// No hace falta tocar firestore.rules: dashboard_onboarding ya permite
// leer y borrar con sesión iniciada.
//
// Lecturas: contar usa agregaciones (1 lectura cada 1000 documentos). Borrar
// necesita leer los documentos para conocer su id (1 lectura por documento).

import {
  collection,
  getCountFromServer,
  getDocs,
  limit,
  query,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "../firebase";
import { COLECCIONES, ONB_ADMIN, ONB_COMPLETADO } from "../config";

const LOTE = 400; // Firestore permite hasta 500 operaciones por lote
const MAX_VUELTAS = 100; // tope de seguridad (40.000 documentos)

export const MODOS_ONBOARDING = {
  todo: "todo",
  completados: "completados",
  admin: "admin",
};

const consultaDe = (modo, tope) => {
  const col = collection(db, COLECCIONES.ONBOARDING);

  const filtros = [];

  if (modo === MODOS_ONBOARDING.completados) {
    filtros.push(where("tipo", "==", ONB_COMPLETADO));
  } else if (modo === MODOS_ONBOARDING.admin) {
    filtros.push(where("tipo", "==", ONB_ADMIN));
  }

  if (tope) filtros.push(limit(tope));

  return query(col, ...filtros);
};

// Cuántos documentos hay de cada tipo (sin descargarlos)
export const contarOnboarding = async () => {
  const [todo, completados, admin] = await Promise.all([
    getCountFromServer(consultaDe(MODOS_ONBOARDING.todo)),
    getCountFromServer(consultaDe(MODOS_ONBOARDING.completados)),
    getCountFromServer(consultaDe(MODOS_ONBOARDING.admin)),
  ]);

  return {
    todo: todo.data().count,
    completados: completados.data().count,
    admin: admin.data().count,
  };
};

// Borra en lotes y devuelve cuántos documentos se borraron
export const reiniciarOnboarding = async ({ modo, alAvanzar }) => {
  let total = 0;

  for (let vuelta = 0; vuelta < MAX_VUELTAS; vuelta += 1) {
    const snap = await getDocs(consultaDe(modo, LOTE));

    if (snap.empty) break;

    const lote = writeBatch(db);
    snap.docs.forEach((d) => lote.delete(d.ref));
    await lote.commit();

    total += snap.size;
    alAvanzar?.(total);
  }

  return total;
};
