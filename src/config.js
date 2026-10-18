// src/config.js

export const COLECCIONES = {
  PLANTILLAS: "dashboard_events",
  ONBOARDING: "dashboard_onboarding",
  PERFILES: "dashboard_profiles",
  USO: "dashboard_interactions",
  RESENAS: "dashboard_reviews",
};

export const LIMITE_EVENTOS = 5000;

// Cantidad máxima de reseñas que se traen de Firestore (las más nuevas primero)
export const LIMITE_RESENAS = 500;

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

// Modo de diseño del PDF: "familia" o "coleccion" (diseños nuevos).
// La app manda extra.modo; los eventos viejos se reconocen por catalogo/familia.
export const modoDe = (e) =>
  e.extra?.modo === "coleccion" ||
  e.extra?.catalogo === "library" ||
  e.extra?.familia === "new_design"
    ? "coleccion"
    : "familia";