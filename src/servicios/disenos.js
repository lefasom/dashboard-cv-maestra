// src/servicios/disenos.js  (Vite + React — Dashboard CV Master)
//
// Reinicio y recálculo de los "me gusta / no me gusta" de los diseños.
//
// reiniciarDisenos hace TRES cosas, en este orden:
//   1) Borra los votos de dashboard_design_feedback (todos, o solo los de
//      los diseños indicados). Es necesario: las reglas no dejan crear dos
//      veces el mismo voto (id `${userId}_${nombre}`), así que si el voto
//      viejo siguiera ahí, el usuario no podría volver a votar.
//   2) Pone en cero los contadores (dashboard_config/diseno_contadores).
//   3) Escribe una "marca" en dashboard_config/diseno_resets. Cada teléfono
//      la lee (en el momento si tiene internet, o apenas se conecte) y
//      borra de su store local las respuestas afectadas, así la app vuelve
//      a preguntar "¿Te gustó el diseño?".
//   Si algo falla en el camino, se corta y se puede volver a intentar sin
//   problema (todos los pasos se pueden repetir).
//
// recalcularContadores cuenta de nuevo todos los votos y reescribe los
// contadores. Sirve si alguna vez los números no coinciden.
//
// Formato de la marca:
//   { resetTodoEn: 1730000000000, resets: { "CV-06": 1730000100000 } }
// Son números que solo crecen: cada teléfono recuerda la última que aplicó.

import {
  collection,
  deleteField,
  doc,
  documentId,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAfter,
  where,
  writeBatch,
} from "firebase/firestore";

import {
  COLECCIONES,
  DOC_CONTADORES_DISENOS,
  DOC_REINICIO_DISENOS,
  TIPO_DISENO_DISLIKE,
  TIPO_DISENO_LIKE,
} from "../config";
import { db } from "../firebase";

const LOTE = 400;

// Igual que hace la app al guardar el voto (sendDesignFeedback)
export const limpiarNombreDiseno = (texto) =>
  String(texto ?? "")
    .trim()
    .replace(/\//g, "-")
    .slice(0, 100);

// Borra los votos de un diseño (nombre) o TODOS (nombre = null), por lotes.
async function borrarVotos(nombre) {
  let total = 0;

  for (;;) {
    const base = collection(db, COLECCIONES.DISENOS);
    const consulta = nombre
      ? query(base, where("nombre", "==", nombre), limit(LOTE))
      : query(base, limit(LOTE));

    const snapshot = await getDocs(consulta);
    if (snapshot.empty) break;

    const batch = writeBatch(db);
    snapshot.docs.forEach((d) => batch.delete(d.ref));
    await batch.commit();

    total += snapshot.size;
    if (snapshot.size < LOTE) break;
  }

  return total;
}

/**
 * @param {object}   opciones
 * @param {boolean}  opciones.todos       true = reiniciar todos los diseños
 * @param {string[]} opciones.nombres     nombres de diseños (si todos = false)
 * @param {(n:number)=>void} [opciones.alAvanzar]  votos borrados hasta ahora
 * @returns {Promise<number>} votos borrados
 */
export async function reiniciarDisenos({ todos, nombres = [], alAvanzar }) {
  const lista = todos ? [null] : nombres;
  if (lista.length === 0) return 0;

  // 1) Votos
  let borrados = 0;

  for (const nombre of lista) {
    borrados += await borrarVotos(nombre);
    alAvanzar?.(borrados);
  }

  // 2) Contadores en cero (sin campos extra: las reglas de la app los vigilan)
  const refContadores = doc(db, COLECCIONES.CONFIG, DOC_CONTADORES_DISENOS);

  if (todos) {
    await setDoc(
      refContadores,
      { likes: deleteField(), dislikes: deleteField() },
      { merge: true }
    );
  } else {
    const quitar = Object.fromEntries(nombres.map((n) => [n, deleteField()]));

    await setDoc(
      refContadores,
      { likes: quitar, dislikes: quitar },
      { merge: true }
    );
  }

  // 3) Marca para los teléfonos
  const refMarca = doc(db, COLECCIONES.CONFIG, DOC_REINICIO_DISENOS);
  const actual = await getDoc(refMarca);
  const datos = actual.exists() ? actual.data() : {};

  // La marca siempre es mayor a cualquiera anterior, aunque el reloj de
  // esta PC esté atrasado
  const anteriores = [
    Number(datos.resetTodoEn) || 0,
    ...Object.values(datos.resets ?? {}).map((v) => Number(v) || 0),
  ];
  const marca = Math.max(Date.now(), Math.max(...anteriores) + 1);

  const cambios = { actualizadoEn: serverTimestamp() };

  if (todos) {
    cambios.resetTodoEn = marca;
  } else {
    cambios.resets = Object.fromEntries(nombres.map((n) => [n, marca]));
  }

  // merge: conserva las marcas de los demás diseños
  await setDoc(refMarca, cambios, { merge: true });

  return borrados;
}

// Cuenta todos los votos y reescribe los contadores.
// Devuelve cuántos votos contó.
export async function recalcularContadores() {
  const likes = {};
  const dislikes = {};
  let total = 0;
  let ultimo = null;

  for (;;) {
    const base = collection(db, COLECCIONES.DISENOS);
    const consulta = ultimo
      ? query(base, orderBy(documentId()), startAfter(ultimo), limit(500))
      : query(base, orderBy(documentId()), limit(500));

    const snapshot = await getDocs(consulta);
    if (snapshot.empty) break;

    snapshot.docs.forEach((d) => {
      const { nombre, tipo } = d.data();
      const clave = String(nombre ?? "").trim();
      if (!clave) return;

      if (tipo === TIPO_DISENO_LIKE) likes[clave] = (likes[clave] ?? 0) + 1;
      else if (tipo === TIPO_DISENO_DISLIKE)
        dislikes[clave] = (dislikes[clave] ?? 0) + 1;
      else return;

      total += 1;
    });

    ultimo = snapshot.docs[snapshot.docs.length - 1];
    if (snapshot.size < 500) break;
  }

  await setDoc(doc(db, COLECCIONES.CONFIG, DOC_CONTADORES_DISENOS), {
    likes,
    dislikes,
  });

  return total;
}
