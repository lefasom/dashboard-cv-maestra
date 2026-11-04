// src/config.js

export const COLECCIONES = {
  PLANTILLAS: "dashboard_events",
  ONBOARDING: "dashboard_onboarding",
  // DEPRECADA: reemplazada por dashboard_config/uso_contadores.
  // Solo se usa para limpiar los eventos viejos desde Historial > Uso.
  PERFILES: "dashboard_profiles",
  // DEPRECADA: igual que PERFILES (eventos viejos de uso/interacciones).
  USO: "dashboard_interactions",
  RESENAS: "dashboard_reviews",
  DISENOS: "dashboard_design_feedback", // "¿Te gustó el diseño?": me gusta / no me gusta
  CONFIG: "dashboard_config", // documentos de configuración (ver abajo)
  CHATS: "chats", // chat de ayuda: chats/{userId}/messages
  // Mensajes personalizados guardados con nombre (tarjetas, videos,
  // encuestas...) para reenviarlos. Solo lo usa el dashboard.
  MENSAJES_PLANTILLAS: "dashboard_mensajes_plantillas",
  // Registro de mensajes enviados a VARIOS chats (para poder borrarlos de
  // todos con un botón). Solo lo usa el dashboard; la app no lo lee.
  MENSAJES_ENVIOS: "dashboard_mensajes_envios",
  // TABLA COMPARTIDA de las ENCUESTAS (me gusta / ranking).
  // Cada encuesta enviada vive acá UNA sola vez, con sus contadores. El
  // mensaje de cada chat solo guarda el id (refId) y la fecha/hora. La app
  // lee la encuesta por id y suma votos en los contadores; así el voto es
  // de todos y no de cada chat.
  MENSAJES_COMPARTIDOS: "dashboard_mensajes_compartidos",
};

// Documentos dentro de dashboard_config:
// - CONTADORES: { likes: { "CV-06": 4 }, dislikes: { "CV-06": 1 } }
//   La app suma 1 acá cada vez que alguien vota. El dashboard lo lee con UNA
//   sola lectura (Valoración y el modal de reinicio).
// - REINICIO: marcas que leen los teléfonos para volver a preguntar
//   "¿Te gustó el diseño?" (lo escribe el dashboard al reiniciar).
// - USO_CONTADORES: métricas de uso agregadas de la app
//   { uso: {...}, editor: {...}, tamanos: {...}, ajustes: {...}, idiomas: {...} }
//   La app solo SUMA (en bloque, con increment). El dashboard lo lee con UNA
//   sola lectura (pestaña Uso) y lo borra desde Historial > Uso.
// - MENSAJES_MODULOS: interruptores de los mensajes personalizados del chat
//   { modulos: { texto: 1, tarjeta: 1, video: 1, encuesta_likes: 1,
//   encuesta_top: 1 }, mostrarDemo: true, actualizadoEn }
//   Lo escribe el dashboard (pestaña "Mensajes personalizados") y lo lee la
//   app (components/ayuda/mensajes/useModulosMensajes.ts).
export const DOC_CONTADORES_DISENOS = "diseno_contadores";
export const DOC_REINICIO_DISENOS = "diseno_resets";
export const DOC_USO_CONTADORES = "uso_contadores";
export const DOC_MENSAJES_MODULOS = "mensajes_modulos";

// OJO: todo se calcula sobre los N eventos más recientes. Si hay más, los
// contadores pueden BAJAR en vez de crecer (EstadoCarga muestra un aviso).
export const LIMITE_EVENTOS = 5000;

// Cantidad máxima de reseñas que se traen de Firestore (las más nuevas primero)
export const LIMITE_RESENAS = 500;

// (Ya no se usa en Valoración: ahora lee los contadores. Se deja por si otra
// parte lo importa.)
export const LIMITE_DISENOS = 5000;

// Chat de ayuda
// - LIMITE_CHATS: cuántos chats se traen (los de actividad más reciente)
// - ACTIVO_MS: un usuario cuenta como "en el chat ahora" si la app avisó
//   presencia hace menos de este tiempo (la app avisa cada 60 s)
// - LIMITE_MENSAJES_CHAT: mensajes que se cargan al abrir un chat
//   (bajado de 300 a 100: cada chat abierto lee un tercio)
// - LIMITE_TEXTO_RESPUESTA: largo máximo de tu respuesta (lo valida firestore.rules)
export const LIMITE_CHATS = 500;
export const ACTIVO_MS = 2 * 60 * 1000;
export const LIMITE_MENSAJES_CHAT = 100;
export const LIMITE_TEXTO_RESPUESTA = 2000;

// Mensajes personalizados (tarjeta, video, encuestas...)
// - MODOS_MENSAJE: los modos disponibles. El id es el mismo que usa la app
//   (campo `modo` del mensaje y `rico.tipo`).
// - MODOS_ENCUESTA: los modos que viven en la tabla compartida (el chat solo
//   guarda la referencia `refId`). Los demás modos van dentro del mensaje.
// - MODULOS_POR_DEFECTO: 1 = se muestra en la app, 0 = se oculta.
// - LIMITE_TEXTO_RICO: largo máximo de cada texto con formato.
// - LIMITE_PLANTILLAS: cuántos mensajes guardados se traen.
// - LIMITE_ENVIOS: cuántos envíos masivos registrados se traen.
// - LOTE_ENVIO: chats por lote al enviar a varios (Firestore admite 500
//   escrituras por lote; con "marcar como respondido" cada chat gasta 2).
// - LOTE_BORRADO: chats por lote al borrar un envío masivo (máx. 500).
export const MODOS_MENSAJE = [
  {
    id: "texto",
    etiqueta: "Texto",
    icono: "✎",
    ayuda: "Un globo de texto con formato (negrita, color, cursiva).",
  },
  {
    id: "tarjeta",
    etiqueta: "Tarjeta",
    icono: "🖼",
    ayuda: "Imagen (URL) con texto con formato debajo.",
  },
  {
    id: "video",
    etiqueta: "Video",
    icono: "▶",
    ayuda: "Enlace de YouTube, Instagram, TikTok o Vimeo con vista previa.",
  },
  {
    id: "encuesta_likes",
    etiqueta: "Encuesta 👍 / 👎",
    icono: "👍",
    ayuda: "Pregunta con Me gusta / No me gusta (compartida entre todos los chats).",
  },
  {
    id: "encuesta_top",
    etiqueta: "Encuesta ranking",
    icono: "🏆",
    ayuda: "Pregunta con varias opciones que se ordenan por votos (compartida entre todos los chats).",
  },
];

export const MODOS_ENCUESTA = ["encuesta_likes", "encuesta_top"];

export const MODULOS_POR_DEFECTO = {
  texto: 1,
  tarjeta: 1,
  video: 1,
  encuesta_likes: 1,
  encuesta_top: 1,
};

export const LIMITE_TEXTO_RICO = 1500;
export const LIMITE_PLANTILLAS = 200;
export const LIMITE_ENVIOS = 100;
export const LOTE_ENVIO = 200;
export const LOTE_BORRADO = 450;

// Plantillas
export const TIPO_PDF = "plantilla_descargada"; // se generó el PDF
export const TIPO_COLECCION = "plantilla_biblioteca"; // se bajó un diseño de la biblioteca ("Nuevos diseños")

// Onboarding
export const ONB_COMPLETADO = "onboarding_completado";
export const ONB_ADMIN = "onboarding_admin_uso"; // uso del Admin y de cada botón Editar
// (onboarding_editado / onboarding_desactivado ya no se muestran)

// Reseñas
export const TIPO_RESENA = "resena_enviada";

// Diseños votados ("¿Te gustó el diseño?")
export const TIPO_DISENO_LIKE = "diseno_like";
export const TIPO_DISENO_DISLIKE = "diseno_dislike";

// Modo de diseño del PDF: "familia" o "coleccion" (diseños nuevos).
// La app manda extra.modo; los eventos viejos se reconocen por catalogo/familia.
export const modoDe = (e) =>
  e.extra?.modo === "coleccion" ||
  e.extra?.catalogo === "library" ||
  e.extra?.familia === "new_design"
    ? "coleccion"
    : "familia";