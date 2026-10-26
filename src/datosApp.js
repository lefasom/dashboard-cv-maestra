// src/datosApp.js — onboarding y uso de la app
import { ETAPAS, EXTRAS, etiqueta, etiquetaFamilia } from "./catalogo";
import { ONB_ADMIN, ONB_COMPLETADO } from "./config";

// Lista de [nombre, cantidad] -> filas con porcentaje
const filasConteo = (entradas) => {
  const total = entradas.reduce((s, [, n]) => s + n, 0);

  return entradas.map(([nombre, cantidad]) => ({
    clave: nombre,
    nombre,
    cantidad,
    pct: total ? cantidad / total : 0,
  }));
};

const contar = (valores) => {
  const mapa = new Map();

  valores.forEach((v) => mapa.set(v, (mapa.get(v) ?? 0) + 1));

  return Array.from(mapa.entries());
};

// "a,b,c" -> ["a","b","c"] (sin vacíos). Si no hay dato devuelve [].
const partir = (valor) =>
  String(valor ?? "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

// ============================================================
// ONBOARDING
//   Las tablas salen de onboarding_completado (lo elegido al activar).
//   Las tarjetas salen de onboarding_admin_uso (cuántas veces se usó
//   el Admin y cada botón Editar).
// ============================================================

export const agruparOnboarding = (eventos) => {
  const completados = eventos.filter((e) => e.tipo === ONB_COMPLETADO);
  const admin = eventos.filter((e) => e.tipo === ONB_ADMIN);

  const areas = filasConteo(
    contar(
      completados.flatMap((e) =>
        partir(e.extra?.sector).map((v) => etiquetaFamilia(v))
      )
    )
  );

  const etapas = filasConteo(
    contar(
      completados.flatMap((e) =>
        partir(e.extra?.careerStage).map((v) => etiqueta(ETAPAS, v))
      )
    )
  );

  const extras = filasConteo(
    contar(
      completados.flatMap((e) =>
        partir(e.extra?.extras).map((v) => etiqueta(EXTRAS, v))
      )
    )
  );

  // La acción viaja en extra.accion y también en nombre
  const cuenta = (accion) =>
    admin.filter((e) => (e.extra?.accion ?? e.nombre) === accion).length;

  return {
    areas,
    etapas,
    extras,
    admin: {
      abrir: cuenta("abrir_admin"),
      area: cuenta("editar_area"),
      momento: cuenta("editar_momento"),
      extras: cuenta("editar_extras"),
    },
  };
};

// ============================================================
// USO (documento dashboard_config/uso_contadores)
//
// Estructura del documento (la escribe la app, solo suma):
//   uso:     paginacion_cambiada, editor_abierto, wizard_usado,
//            perfil_nuevo_inicio, perfil_nuevo_mis_perfiles,
//            perfil_activado_prueba, perfil_activado_real
//   editor:  imagen, experiencia, datos, tamano, desplazar, vista
//   tamanos: x0_9, x1_0, x1_1, x1_2, x1_3
//   ajustes: abierto, idioma_cambiado, modo_oscuro_on, modo_oscuro_off,
//            compartir, acerca_de, terminos
//   idiomas: es, en, pt
//
// Si el documento no existe (datos = null) todo da 0.
// ============================================================

const TARJETAS_USO = [
  ["paginacion_cambiada", "Cambios de paginación"],
  ["editor_abierto", "Modo edición abierto"],
  ["wizard_usado", "Wizard usado"],
  ["perfil_nuevo_inicio", "Perfil nuevo desde Inicio"],
  ["perfil_nuevo_mis_perfiles", "Perfil nuevo desde Mis perfiles"],
  ["perfil_activado_prueba", "Perfil activado (prueba)"],
  ["perfil_activado_real", "Perfil activado (real)"],
];

const TARJETAS_EDITOR = [
  ["imagen", "Imagen"],
  ["experiencia", "Experiencia"],
  ["datos", "Datos"],
  ["tamano", "Tamaño"],
  ["desplazar", "Desplazar"],
  ["vista", "Vista"],
];

// Siempre visibles, aunque sean 0 (y en este orden)
const TAMANOS = [
  ["x0_9", "0.9x"],
  ["x1_0", "1.0x"],
  ["x1_1", "1.1x"],
  ["x1_2", "1.2x"],
  ["x1_3", "1.3x"],
];

const AJUSTES = [
  ["abierto", "Ajustes abiertos"],
  ["idioma_cambiado", "Cambios de idioma"],
  ["modo_oscuro_on", "Modo oscuro activado"],
  ["modo_oscuro_off", "Modo oscuro desactivado"],
  ["compartir", "Compartir aplicación"],
  ["acerca_de", "Acerca de"],
  ["terminos", "Términos y condiciones"],
];

const IDIOMAS = [
  ["es", "Español"],
  ["en", "Inglés"],
  ["pt", "Portugués"],
];

export const agruparUsoContadores = (datos) => {
  const n = (grupo, clave) => {
    const v = Number(datos?.[grupo]?.[clave]);
    return Number.isFinite(v) && v > 0 ? v : 0;
  };

  const tarjetas = (grupo, lista) =>
    lista.map(([clave, label]) => ({ label, valor: n(grupo, clave) }));

  // Filas con % sobre el total del grupo, en el orden de la lista
  const filasPorTotal = (grupo, lista) => {
    const total = lista.reduce((s, [clave]) => s + n(grupo, clave), 0);

    return lista.map(([clave, nombre], i) => {
      const cantidad = n(grupo, clave);

      return {
        clave,
        nombre,
        cantidad,
        pct: total ? cantidad / total : 0,
        orden: i,
      };
    });
  };

  // Ajustes: el % es respecto de las veces que se abrió Ajustes
  // (la fila "Ajustes abiertos" no lleva %)
  const abiertos = n("ajustes", "abierto");

  const ajustes = AJUSTES.map(([clave, nombre], i) => {
    const cantidad = n("ajustes", clave);

    return {
      clave,
      nombre,
      cantidad,
      pct: clave === "abierto" ? null : abiertos ? cantidad / abiertos : 0,
      orden: i,
    };
  });

  return {
    uso: tarjetas("uso", TARJETAS_USO),
    editor: tarjetas("editor", TARJETAS_EDITOR),
    tamanos: filasPorTotal("tamanos", TAMANOS),
    ajustes,
    idiomas: filasPorTotal("idiomas", IDIOMAS),
  };
};