// src/catalogo.js
// Plantillas existentes por familia (así aparecen en la tabla aunque
// todavía no tengan actividad) y etiquetas legibles para los códigos.
// Si agregás plantillas en la app, agregalas acá también.

export const FAMILIAS = {
  customer_service: "Atención al cliente / Ventas",
  administration: "Administración / Oficina",
  technology: "Tecnología / Informática",
  marketing_design: "Marketing / Diseño",
  trades_services: "Oficios / Servicios",
  logistics_transport: "Logística / Transporte",
  health_education: "Salud / Educación",
  sports: "Deportes / Entrenamiento",
  influencers: "Influencer / Publicidad",
  hospitality_gastronomy: "Hotelería / Gastronomía",
  other: "Otros / Híbridos",
  new_design: "Diseños nuevos",
};

const POR_FAMILIA = {
  customer_service: ["ATS", "CV-09", "CV-10", "CV-07", "CV-06", "CV-13"],
  administration: ["ATS", "CV-03", "CV-04", "CV-05", "CV-08", "CV-12"],
  technology: ["ATS", "CV-27", "CV-23", "CV-42", "CV-45", "CV-44"],
  marketing_design: ["ATS", "CV-11", "CV-01", "CV-22", "CV-19", "CV-21"],
  trades_services: ["ATS", "CV-14", "CV-15", "CV-16", "CV-17", "CV-18"],
  logistics_transport: ["ATS", "CV-20", "CV-28", "CV-24", "CV-26", "CV-25"],
  health_education: ["ATS", "CV-33", "CV-29", "CV-34", "CV-30", "CV-31"],
  sports: ["ATS", "CV-02", "CV-32", "CV-40", "CV-41", "CV-39"],
  influencers: ["ATS", "CV-43", "CV-35", "CV-36", "CV-37", "CV-38"],
  hospitality_gastronomy: ["ATS", "CV-46", "CV-47", "CV-48", "CV-49", "CV-50"],
  other: ["ATS", "CV-51", "CV-52", "CV-53", "CV-54", "CV-55"],
  new_design: [
    "CV-57", "CV-69", "CV-60", "CV-61", "CV-58", "CV-62",
    "CV-63", "CV-64", "CV-67", "CV-65", "CV-68",
  ],
};

export const CATALOGO = Object.entries(POR_FAMILIA).flatMap(
  ([familia, nombres]) => nombres.map((nombre) => ({ nombre, familia }))
);

export const ETAPAS = {
  experienced: "Tengo experiencia laboral",
  first_cv: "Creando su primer CV",
  student: "Estudiante",
  freelance: "Independiente",
};

export const EXTRAS = {
  certificados: "Certificaciones",
  idiomas: "Idiomas",
  licenciaConducir: "Licencia de conducir",
  github: "GitHub",
  sitiosWeb: "Sitios web",
  behance: "Behance",
  dribbble: "Dribbble",
  audienceMetrics: "Métricas de audiencia",
  customSection: "Tarjetas",
  listas: "Listas",
  none: "Ninguno",
};

export const PROFESIONES = {
  abogado: "Abogado",
  albanil: "Albañil",
  vendedor: "Vendedor",
  recepcionista: "Recepcionista",
  informatico: "Informático",
  programador: "Programador",
  disenador: "Diseñador",
  repositor: "Repositor",
  maestro: "Maestro",
  medico: "Médico",
  electricista: "Electricista",
  plomero: "Plomero",
  gasista: "Gasista",
  entrenadorPersonal: "Entrenador personal",
  conductor: "Conductor",
  influencer: "Influencer",
  chefProfesional: "Chef / Cocinero",
};

export const etiquetaFamilia = (id) =>
  id ? FAMILIAS[id] || id : "Sin familia";

export const etiqueta = (mapa, valor) =>
  valor ? mapa[valor] || String(valor) : "—";
