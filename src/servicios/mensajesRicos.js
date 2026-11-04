// src/servicios/mensajesRicos.js
//
// Mensajes personalizados del chat (tarjeta, video, encuestas, texto con
// formato): armado, validación, envío, registro de envíos masivos y guardado.
//
// CÓMO SE GUARDA UN MENSAJE
//
//   A) Texto, tarjeta y video (van DENTRO del mensaje del chat):
//      chats/{id}/messages/{msgId} = {
//        de: "soporte",
//        texto: "<resumen corto>",   // lo piden las reglas; las APK viejas
//                                     // lo muestran como texto simple
//        enviadoEn, createdAt,
//        modo: "tarjeta",            // = rico.tipo
//        rico: { tipo: "tarjeta", imagen, texto }   // lo que dibuja la app
//      }
//
//   B) ENCUESTAS (me gusta y ranking): COMPARTIDAS entre todos los chats.
//      El chat NO guarda la encuesta ni los votos: solo una referencia y la
//      fecha/hora para que aparezca en el momento correcto de la sala.
//      chats/{id}/messages/{msgId} = {
//        de: "soporte",
//        texto: "<resumen corto>",
//        enviadoEn, createdAt,
//        modo: "encuesta_top",       // o "encuesta_likes"
//        refId: "<id en la tabla compartida>"
//      }
//      dashboard_mensajes_compartidos/{refId} = {
//        nombre, texto, modo,
//        rico: { tipo, pregunta, opciones? }   // SOLO la definición
//        contadores: { ... },                  // acá viven los votos
//        creadoEn, enviadoEn
//      }
//      contadores:
//        encuesta_likes -> { me_gusta: n, no_me_gusta: n }
//        encuesta_top   -> { a: n, b: n, c: n ... }  (ids de las opciones)
//      La app suma 1 con increment(1) en UNA clave de `contadores`.
//
// ENVÍOS MASIVOS (a todos o a varios chats)
//   - Todos los chats reciben el mensaje con el MISMO id: `env_<envioId>`.
//   - Se crea un registro en dashboard_mensajes_envios/{envioId}:
//       { nombre, modo, rico, chats: [ids], total, enviados, estado,
//         enviadoEn, creadoEn, eliminadoEn? }
//     estado: "enviando" | "enviado" | "parcial" | "eliminado"
//   - Si es una encuesta, el id de la tabla compartida es el mismo envioId.
//   - Para borrarlo de todos NO se lee nada: se borra `env_<envioId>` en cada
//     chat de la lista (escrituras por lotes) y la encuesta compartida. El
//     registro queda en la lista (marcado "eliminado") hasta que lo quités
//     con "Quitar de la lista".
//
// FORMATOS DENTRO DE LOS TEXTOS (los entiende la app y la vista previa):
//   *texto*          negrita
//   **texto**        negrita grande
//   ~texto~          cursiva
//   {color:texto}    color: rojo, azul, verde, naranja, morado
//   Enter            salto de línea
// Se pueden combinar un nivel: *{azul:hola}*  o  {azul:*hola*}

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

import {
  COLECCIONES,
  DOC_MENSAJES_MODULOS,
  LIMITE_ENVIOS,
  LIMITE_TEXTO_RICO,
  LOTE_BORRADO,
  LOTE_ENVIO,
  MODOS_ENCUESTA,
} from "../config";
import { db } from "../firebase";

// ------------------------------------------------------------
// TEXTO
// ------------------------------------------------------------

// Saca las marcas de formato (para el resumen y la lista)
export const quitarFormato = (t = "") =>
  String(t)
    .replace(/\{[a-z]+:([^}]+)\}/g, "$1")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/~([^~]+)~/g, "$1");

const unaLinea = (t = "", max = 100) =>
  quitarFormato(t).replace(/\s+/g, " ").trim().slice(0, max);

const entero = (v) => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

const esUrl = (u = "") => /^https?:\/\/\S+$/i.test(String(u).trim());

// ¿Este modo vive en la tabla compartida?
export const esEncuesta = (modo) => MODOS_ENCUESTA.includes(modo);

// ------------------------------------------------------------
// MENSAJE VACÍO POR MODO
// ------------------------------------------------------------

export const ricoVacio = (modo) => {
  switch (modo) {
    case "texto":
      return { tipo: "texto", texto: "" };
    case "tarjeta":
      return { tipo: "tarjeta", imagen: "", texto: "" };
    case "video":
      return { tipo: "video", url: "", titulo: "", descripcion: "" };
    case "encuesta_likes":
      return { tipo: "encuesta_likes", pregunta: "", votos: [0, 0] };
    case "encuesta_top":
      return {
        tipo: "encuesta_top",
        pregunta: "",
        opciones: [
          { id: "a", texto: "", votos: 0 },
          { id: "b", texto: "", votos: 0 },
          { id: "c", texto: "", votos: 0 },
        ],
      };
    default:
      return { tipo: "texto", texto: "" };
  }
};

// Mezcla un mensaje guardado con el vacío de su modo (por si le faltan campos)
export const completarRico = (rico) => {
  const base = ricoVacio(rico?.tipo);
  return { ...base, ...(rico ?? {}) };
};

export const ricoEstaVacio = (rico) => {
  const v = ricoVacio(rico?.tipo);
  return JSON.stringify(completarRico(rico)) === JSON.stringify(v);
};

// ------------------------------------------------------------
// LIMPIEZA Y VALIDACIÓN (antes de guardar o enviar)
// ------------------------------------------------------------

// Devuelve el objeto tal como se guarda en Firestore: sin campos vacíos
// opcionales, números enteros y ids de opciones ordenados (a, b, c…)
export const limpiarRico = (rico) => {
  const r = completarRico(rico);
  const t = (v) => String(v ?? "").trim();

  switch (r.tipo) {
    case "texto":
      return { tipo: "texto", texto: t(r.texto) };

    case "tarjeta": {
      const salida = { tipo: "tarjeta", imagen: t(r.imagen) };
      if (t(r.texto)) salida.texto = t(r.texto);
      return salida;
    }

    case "video": {
      const salida = { tipo: "video", url: t(r.url) };
      if (t(r.titulo)) salida.titulo = t(r.titulo);
      if (t(r.descripcion)) salida.descripcion = t(r.descripcion);
      return salida;
    }

    case "encuesta_likes": {
      const v = Array.isArray(r.votos) ? r.votos : [0, 0];
      return {
        tipo: "encuesta_likes",
        pregunta: t(r.pregunta),
        votos: [entero(v[0]), entero(v[1])],
      };
    }

    case "encuesta_top": {
      const opciones = (Array.isArray(r.opciones) ? r.opciones : [])
        .filter((o) => t(o?.texto))
        .map((o, i) => ({
          id: String.fromCharCode(97 + i),
          texto: t(o.texto),
          votos: entero(o.votos),
        }));

      return { tipo: "encuesta_top", pregunta: t(r.pregunta), opciones };
    }

    default:
      return { tipo: "texto", texto: "" };
  }
};

// Devuelve "" si está bien, o el texto del problema
export const validarRico = (rico) => {
  const r = limpiarRico(rico);
  const largo = (v) => String(v ?? "").length;

  switch (r.tipo) {
    case "texto":
      if (!r.texto) return "Escribí el texto del mensaje.";
      if (largo(r.texto) > LIMITE_TEXTO_RICO)
        return `El texto supera ${LIMITE_TEXTO_RICO} caracteres.`;
      return "";

    case "tarjeta":
      if (!esUrl(r.imagen))
        return "La imagen debe ser una URL que empiece con http:// o https://.";
      if (largo(r.texto) > LIMITE_TEXTO_RICO)
        return `El texto supera ${LIMITE_TEXTO_RICO} caracteres.`;
      return "";

    case "video":
      if (!esUrl(r.url))
        return "El enlace del video debe empezar con http:// o https://.";
      if (largo(r.titulo) > 150) return "El título es demasiado largo.";
      if (largo(r.descripcion) > 400) return "La descripción es demasiado larga.";
      return "";

    case "encuesta_likes":
      if (!r.pregunta) return "Escribí la pregunta de la encuesta.";
      if (largo(r.pregunta) > 300) return "La pregunta es demasiado larga.";
      return "";

    case "encuesta_top":
      if (!r.pregunta) return "Escribí la pregunta de la encuesta.";
      if (largo(r.pregunta) > 300) return "La pregunta es demasiado larga.";
      if (r.opciones.length < 2) return "Poné al menos 2 opciones con texto.";
      if (r.opciones.length > 6) return "Máximo 6 opciones.";
      if (r.opciones.some((o) => largo(o.texto) > 100))
        return "Alguna opción es demasiado larga (máx. 100).";
      return "";

    default:
      return "Modo de mensaje desconocido.";
  }
};

// Resumen para el campo `texto` del mensaje (no puede quedar vacío)
export const resumenDe = (rico) => {
  const r = limpiarRico(rico);

  switch (r.tipo) {
    case "texto":
      return unaLinea(r.texto, 160) || "Mensaje";
    case "tarjeta":
      return `🖼 ${unaLinea(r.texto, 140) || "Tarjeta"}`;
    case "video":
      return `▶ ${unaLinea(r.titulo, 100) || r.url}`.slice(0, 160);
    case "encuesta_likes":
      return `👍👎 ${unaLinea(r.pregunta, 140)}`;
    case "encuesta_top":
      return `🏆 ${unaLinea(r.pregunta, 140)}`;
    default:
      return "Mensaje";
  }
};

// ------------------------------------------------------------
// ENCUESTAS COMPARTIDAS: definición, contadores y vista
// ------------------------------------------------------------

// Contadores con los que nace la encuesta. Si en el editor cargaste votos
// iniciales (por ejemplo una demo con 24 y 2), se usan como punto de partida.
//   likes -> { me_gusta, no_me_gusta }
//   top   -> { a, b, c… }
export const contadoresIniciales = (rico) => {
  const r = limpiarRico(rico);

  if (r.tipo === "encuesta_likes") {
    return { me_gusta: r.votos[0], no_me_gusta: r.votos[1] };
  }

  if (r.tipo === "encuesta_top") {
    const c = {};
    r.opciones.forEach((o) => {
      c[o.id] = o.votos;
    });
    return c;
  }

  return {};
};

// La encuesta SIN votos (los votos viven en `contadores`)
export const definicionEncuesta = (rico) => {
  const r = limpiarRico(rico);

  if (r.tipo === "encuesta_likes") {
    return { tipo: "encuesta_likes", pregunta: r.pregunta };
  }

  if (r.tipo === "encuesta_top") {
    return {
      tipo: "encuesta_top",
      pregunta: r.pregunta,
      opciones: r.opciones.map((o) => ({ id: o.id, texto: o.texto })),
    };
  }

  return r;
};

// Arma, a partir de un documento de la tabla compartida, el MISMO objeto
// `rico` que usaban las encuestas dentro del chat (con `votos`), así la vista
// previa (PreviewMensaje / ContenidoMensaje) funciona sin cambios.
// Devuelve null si el documento no existe.
export const ricoConContadores = (compartido) => {
  if (!compartido?.rico) return null;

  const def = completarRico(compartido.rico);
  const k = compartido.contadores ?? {};

  if (def.tipo === "encuesta_likes") {
    return { ...def, votos: [entero(k.me_gusta), entero(k.no_me_gusta)] };
  }

  if (def.tipo === "encuesta_top") {
    return {
      ...def,
      opciones: (Array.isArray(def.opciones) ? def.opciones : []).map((o) => ({
        ...o,
        votos: entero(k[o.id]),
      })),
    };
  }

  return def;
};

// Pone todos los contadores de una encuesta compartida en 0
export const reiniciarContadores = (compartido) => {
  const c = {};
  Object.keys(compartido?.contadores ?? {}).forEach((k) => {
    c[k] = 0;
  });

  return updateDoc(
    doc(db, COLECCIONES.MENSAJES_COMPARTIDOS, compartido.id),
    { contadores: c }
  );
};

// ------------------------------------------------------------
// ENVÍO
// ------------------------------------------------------------

const nuevoEnvioId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

// Id que lleva el mensaje en TODOS los chats de un envío masivo
export const idMensajeEnvio = (envioId) => `env_${envioId}`;

// destinos: [{ id, ultimoMensajeEn }]  (los chats de useChats)
// marcarRespondido: si es true, el chat deja de figurar "sin responder"
//   (usalo al contestar a UN usuario; no al mandar a todos).
// registrar: true al enviar a varios chats -> queda en la lista de envíos
//   masivos y se puede borrar de todos los chats con un botón.
// nombre: título que se ve en la lista de envíos (opcional).
// Devuelve la cantidad de chats a los que se envió.
//
// Si el mensaje es una ENCUESTA: se crea UNA vez en la tabla compartida
// (id = envioId) y cada chat recibe solo la referencia `refId` + la fecha.
export async function enviarRico({
  destinos,
  rico,
  marcarRespondido = false,
  registrar = false,
  nombre = "",
}) {
  const limpio = limpiarRico(rico);
  const problema = validarRico(limpio);
  if (problema) throw new Error(problema);
  if (!destinos?.length) throw new Error("Elegí al menos un chat.");

  const texto = resumenDe(limpio);
  const ahora = Date.now();
  const envioId = nuevoEnvioId();
  const msgId = idMensajeEnvio(envioId);
  const registroRef = doc(db, COLECCIONES.MENSAJES_ENVIOS, envioId);
  const encuesta = esEncuesta(limpio.tipo);

  // El registro se crea PRIMERO: si un lote falla a la mitad, igual queda
  // anotado a qué chats se intentó enviar y se puede borrar todo.
  if (registrar) {
    await setDoc(registroRef, {
      nombre: unaLinea(nombre || texto, 100) || "Mensaje",
      modo: limpio.tipo,
      rico: limpio,
      chats: destinos.map((d) => d.id),
      total: destinos.length,
      enviados: 0,
      estado: "enviando",
      enviadoEn: ahora,
      creadoEn: ahora,
    });
  }

  // Cada chat gasta 1 escritura (mensaje) o 2 (mensaje + ficha)
  const tamano = marcarRespondido ? LOTE_ENVIO : LOTE_ENVIO * 2;
  let enviados = 0;

  try {
    // Encuesta: se crea en la tabla compartida ANTES de los mensajes, así
    // cuando el mensaje llega al chat la encuesta ya existe.
    if (encuesta) {
      await setDoc(doc(db, COLECCIONES.MENSAJES_COMPARTIDOS, envioId), {
        nombre: unaLinea(nombre || texto, 100) || "Encuesta",
        texto,
        modo: limpio.tipo,
        rico: definicionEncuesta(limpio),
        contadores: contadoresIniciales(limpio),
        creadoEn: ahora,
        enviadoEn: ahora,
      });
    }

    for (let i = 0; i < destinos.length; i += tamano) {
      const lote = destinos.slice(i, i + tamano);
      const batch = writeBatch(db);

      lote.forEach((d) => {
        const fichaRef = doc(db, COLECCIONES.CHATS, d.id);
        // Envío masivo: mismo id en todos los chats. Envío a un chat: id propio.
        const mensajeRef = registrar
          ? doc(fichaRef, "messages", msgId)
          : doc(collection(fichaRef, "messages"));

        const base = {
          de: "soporte",
          texto,
          enviadoEn: ahora,
          createdAt: serverTimestamp(),
          modo: limpio.tipo,
        };

        // Encuesta: solo la referencia. Los demás modos: el mensaje completo.
        batch.set(
          mensajeRef,
          encuesta ? { ...base, refId: envioId } : { ...base, rico: limpio }
        );

        if (marcarRespondido) {
          batch.update(fichaRef, {
            ultimaRespuestaEn: Math.max(ahora, d.ultimoMensajeEn ?? 0),
          });
        }
      });

      // eslint-disable-next-line no-await-in-loop
      await batch.commit();
      enviados += lote.length;
    }
  } catch (err) {
    if (registrar) {
      // Se anota hasta dónde llegó (si esto también falla, no importa)
      await updateDoc(registroRef, {
        enviados,
        estado: "parcial",
      }).catch(() => {});
    }
    throw err;
  }

  if (registrar) {
    await updateDoc(registroRef, { enviados, estado: "enviado" }).catch(
      (e) => console.warn("[mensajes] No se pudo cerrar el registro:", e)
    );
  }

  return enviados;
}

// Borra el mensaje de TODOS los chats de un envío masivo, sin leer nada.
// Si era una encuesta, también borra la encuesta compartida (con sus votos).
// El registro queda en la lista, marcado como eliminado.
// Se puede repetir sin problema si algo falla a la mitad.
export async function borrarEnvio(envio) {
  const chats = Array.isArray(envio?.chats) ? envio.chats : [];
  const msgId = idMensajeEnvio(envio.id);

  for (let i = 0; i < chats.length; i += LOTE_BORRADO) {
    const batch = writeBatch(db);

    chats.slice(i, i + LOTE_BORRADO).forEach((chatId) => {
      batch.delete(doc(db, COLECCIONES.CHATS, chatId, "messages", msgId));
    });

    // eslint-disable-next-line no-await-in-loop
    await batch.commit();
  }

  if (esEncuesta(envio?.modo)) {
    await deleteDoc(
      doc(db, COLECCIONES.MENSAJES_COMPARTIDOS, envio.id)
    ).catch((e) =>
      console.warn("[mensajes] No se pudo borrar la encuesta compartida:", e)
    );
  }

  await updateDoc(doc(db, COLECCIONES.MENSAJES_ENVIOS, envio.id), {
    estado: "eliminado",
    eliminadoEn: Date.now(),
  });

  return chats.length;
}

// Saca el registro de la lista (no toca los mensajes de los chats)
export const quitarRegistroEnvio = (id) =>
  deleteDoc(doc(db, COLECCIONES.MENSAJES_ENVIOS, id));

// Se usa DESPUÉS de "Gestionar historial" (pestaña Chat): ese borrado ya
// eliminó los mensajes de los chats elegidos, incluidos los personalizados.
// Acá se pone al día la lista de envíos masivos para que no queden envíos
// que ya no existen:
//   - si el envío era más viejo que el corte (corteMs) y TODOS sus chats
//     estaban entre los borrados  -> se quita el registro de la lista (y, si
//     era una encuesta, también la encuesta compartida).
//   - si solo algunos de sus chats estaban entre los borrados -> el registro
//     queda con los chats que todavía lo tienen (así "Eliminar de todos"
//     sigue siendo correcto y la encuesta compartida sigue viva).
// chatIds: ids de los chats a los que se les borró el historial.
// corteMs: se borró lo anterior a este momento (Infinity = todo el historial).
// Los envíos ya marcados como "eliminado" no se tocan.
// Hace UNA lectura de los envíos (máx. LIMITE_ENVIOS) y UNA escritura en lote.
// Devuelve cuántos registros se quitaron o actualizaron.
export async function conciliarEnviosTrasHistorial({ chatIds, corteMs }) {
  const alcance = new Set(chatIds ?? []);
  if (alcance.size === 0) return 0;

  const snap = await getDocs(
    query(collection(db, COLECCIONES.MENSAJES_ENVIOS), limit(LIMITE_ENVIOS))
  );

  const batch = writeBatch(db);
  let tocados = 0;

  snap.docs.forEach((d) => {
    const e = d.data();
    if (e.estado === "eliminado") return;

    // Solo los envíos anteriores al corte se borraron
    const enviadoEn = Number(e.enviadoEn) || 0;
    if (!(enviadoEn < corteMs)) return;

    const chats = Array.isArray(e.chats) ? e.chats : [];
    const restantes = chats.filter((id) => !alcance.has(id));

    // Ninguno de sus chats estaba entre los borrados
    if (restantes.length === chats.length) return;

    tocados += 1;

    if (restantes.length === 0) {
      batch.delete(d.ref);

      // Ya no queda ningún chat con la encuesta: se borra la compartida
      if (esEncuesta(e.modo)) {
        batch.delete(doc(db, COLECCIONES.MENSAJES_COMPARTIDOS, d.id));
      }
    } else {
      batch.update(d.ref, {
        chats: restantes,
        total: restantes.length,
        enviados: Math.min(Number(e.enviados) || 0, restantes.length),
      });
    }
  });

  if (tocados > 0) await batch.commit();

  return tocados;
}

// ------------------------------------------------------------
// MENSAJES GUARDADOS (dashboard_mensajes_plantillas)
// ------------------------------------------------------------

// Crea (sin id) o actualiza (con id). Devuelve el id.
export async function guardarPlantilla({ id, nombre, rico }) {
  const limpio = limpiarRico(rico);
  const problema = validarRico(limpio);
  if (problema) throw new Error(problema);

  const nombreLimpio = String(nombre ?? "").trim();
  if (!nombreLimpio) throw new Error("Ponele un nombre para guardarlo.");
  if (nombreLimpio.length > 80) throw new Error("El nombre es muy largo (máx. 80).");

  const datos = {
    nombre: nombreLimpio,
    modo: limpio.tipo,
    rico: limpio,
    actualizadoEn: Date.now(),
  };

  if (id) {
    // updateDoc reemplaza el mapa `rico` completo (no lo mezcla)
    await updateDoc(doc(db, COLECCIONES.MENSAJES_PLANTILLAS, id), datos);
    return id;
  }

  const ref = await addDoc(collection(db, COLECCIONES.MENSAJES_PLANTILLAS), {
    ...datos,
    creadoEn: Date.now(),
  });

  return ref.id;
}

export const borrarPlantilla = (id) =>
  deleteDoc(doc(db, COLECCIONES.MENSAJES_PLANTILLAS, id));

// ------------------------------------------------------------
// MÓDULOS (dashboard_config/mensajes_modulos)
// ------------------------------------------------------------

export async function guardarModulos({ modulos, mostrarDemo }) {
  const limpios = {};

  Object.entries(modulos).forEach(([k, v]) => {
    limpios[k] = v ? 1 : 0;
  });

  await setDoc(doc(db, COLECCIONES.CONFIG, DOC_MENSAJES_MODULOS), {
    modulos: limpios,
    mostrarDemo: !!mostrarDemo,
    actualizadoEn: Date.now(),
  });
}

// ------------------------------------------------------------
// DEMOSTRACIONES (las mismas que DEMO_MENSAJES de la app)
// ------------------------------------------------------------

export const DEMOS_MENSAJE = [
  {
    nombre: "Prueba de formatos de texto",
    rico: {
      tipo: "texto",
      texto:
        "**Prueba de formatos de texto**\n\n" +
        "Texto normal para comprobar la lectura y el tamaño predeterminado.\n\n" +
        "*Este texto aparece en negrita.*\n\n" +
        "**Este texto aparece más grande y destacado.**\n\n" +
        "~Este texto aparece en cursiva.~\n\n" +
        "{azul:Este texto aparece resaltado en azul.}",
    },
  },
  {
    nombre: "Tarjeta promocional",
    rico: {
      tipo: "tarjeta",
      imagen: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800",
      texto:
        "**Tu próximo trabajo puede empezar acá.**\n\n" +
        "Con *CV Belgrano* podés crear y personalizar tu currículum de manera sencilla.\n\n" +
        "{azul:Mostrá lo mejor de tu perfil profesional.}\n\n" +
        "Tu experiencia merece ser destacada.",
    },
  },
  {
    nombre: "Video de prueba",
    rico: {
      tipo: "video",
      url: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
      titulo: "Prueba de reproducción",
      descripcion: "Comprobación de miniatura y reproductor de video.",
    },
  },
  {
    nombre: "Encuesta de valoración",
    rico: {
      tipo: "encuesta_likes",
      pregunta:
        "¿Te resulta fácil crear y personalizar tu currículum con CV Belgrano?",
      votos: [24, 2],
    },
  },
  {
    nombre: "Encuesta de preferencias",
    rico: {
      tipo: "encuesta_top",
      pregunta: "¿Qué considerás más importante en un buen currículum?",
      opciones: [
        { id: "a", texto: "Experiencia laboral", votos: 34 },
        { id: "b", texto: "Diseño y presentación", votos: 28 },
        { id: "c", texto: "Habilidades personales", votos: 22 },
        { id: "d", texto: "Formación académica", votos: 16 },
      ],
    },
  },
];