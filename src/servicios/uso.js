// src/servicios/uso.js  (Vite + React — Dashboard CV Master)
//
// Métricas de uso agregadas: documento único dashboard_config/uso_contadores.
//
//   suscribirUso(alCambiar, alFallar)
//       Escucha ESE único documento con onSnapshot. Se actualiza solo cada
//       vez que la app envía contadores. Devuelve la función para dejar de
//       escuchar (la pestaña la llama al desmontarse, así que solo se pagan
//       lecturas mientras la pestaña Uso está abierta).
//       Costo: 1 lectura al abrir + 1 por cada envío de la app mientras
//       la pestaña está abierta.
//
//   borrarContadoresUso()
//       Borra el documento (Historial > Uso). Devuelve 1 si existía, 0 si no.
//       Si la pestaña Uso está abierta, se pone en 0 sola.

import { deleteDoc, doc, getDoc, onSnapshot } from "firebase/firestore";

import { COLECCIONES, DOC_USO_CONTADORES } from "../config";
import { db } from "../firebase";

const refUso = () => doc(db, COLECCIONES.CONFIG, DOC_USO_CONTADORES);

// alCambiar(datos | null): null si el documento no existe
export const suscribirUso = (alCambiar, alFallar) =>
  onSnapshot(
    refUso(),
    (snap) => alCambiar(snap.exists() ? snap.data() : null),
    alFallar
  );

export const borrarContadoresUso = async () => {
  const snap = await getDoc(refUso());
  if (!snap.exists()) return 0;

  await deleteDoc(refUso());

  return 1;
};