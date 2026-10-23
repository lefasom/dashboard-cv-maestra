// src/config.js

export const COLECCIONES = {
  PLANTILLAS: "dashboard_events",
  ONBOARDING: "dashboard_onboarding",
  PERFILES: "dashboard_profiles",
  USO: "dashboard_interactions",
  RESENAS: "dashboard_reviews",
  DISENOS: "dashboard_design_feedback", // "¿Te gustó el diseño?": me gusta / no me gusta
  CONFIG: "dashboard_config", // documentos de configuración (ver abajo)
  CHATS: "chats", // chat de ayuda: chats/{userId}/messages
};

// Documentos dentro de dashboard_config:
// - CONTADORES: { likes: { "CV-06": 4 }, dislikes: { "CV-06": 1 } }
//   La app suma 1 acá cada vez que alguien vota. El dashboard lo lee con UNA
//   sola lectura (Valoración y el modal de reinicio).
// - REINICIO: marcas que leen los teléfonos para volver a preguntar
//   "¿Te gustó el diseño?" (lo escribe el dashboard al reiniciar).
export const DOC_CONTADORES_DISENOS = "diseno_contadores";
export const DOC_REINICIO_DISENOS = "diseno_resets";

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
// - LIMITE_TEXTO_RESPUESTA: largo máximo de tu respuesta (lo valida firestore.rules)
export const LIMITE_CHATS = 500;
export const ACTIVO_MS = 2 * 60 * 1000;
export const LIMITE_MENSAJES_CHAT = 300;
export const LIMITE_TEXTO_RESPUESTA = 2000;

// Plantillas
export const TIPO_PDF = "plantilla_descargada"; // se generó el PDF
export const TIPO_COLECCION = "plantilla_biblioteca"; // agregada a "Mi colección"

// Onboarding
export const ONB_COMPLETADO = "onboarding_completado";
export const ONB_EDITADO = "onboarding_editado";
export const ONB_DESACTIVADO = "onboarding_desactivado";

// Perfiles
export const PERFIL_SELECCIONADO = "perfil_prueba_seleccionado";
export const PERFIL_ACTIVADO = "perfil_prueba_activado";
export const PERFIL_REAL = "perfil_real_creado";

// Uso
export const USO_PAGINACION = "paginacion_cambiada";
export const USO_EDITOR = "editor_abierto";
export const USO_DESPLAZAR = "desplazamiento_cambiado";

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