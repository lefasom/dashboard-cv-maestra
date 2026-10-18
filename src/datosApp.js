// src/datosApp.js — onboarding, perfiles y uso de la app
import {
  ETAPAS,
  EXTRAS,
  PROFESIONES,
  etiqueta,
  etiquetaFamilia,
} from "./catalogo";
import {
  ONB_COMPLETADO,
  ONB_DESACTIVADO,
  ONB_EDITADO,
  PERFIL_ACTIVADO,
  PERFIL_REAL,
  PERFIL_SELECCIONADO,
  USO_DESPLAZAR,
  USO_EDITOR,
  USO_PAGINACION,
} from "./config";
import { claveDe } from "./datos";

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

// ============================================================
// ONBOARDING
// ============================================================

export const agruparOnboarding = (eventos) => {
  const completados = eventos.filter((e) => e.tipo === ONB_COMPLETADO);
  const editados = eventos.filter((e) => e.tipo === ONB_EDITADO);
  const desactivados = eventos.filter((e) => e.tipo === ONB_DESACTIVADO);

  const areas = filasConteo(
    contar(completados.map((e) => etiquetaFamilia(e.extra?.sector)))
  );

  const etapas = filasConteo(
    contar(completados.map((e) => etiqueta(ETAPAS, e.extra?.careerStage)))
  );

  const extras = filasConteo(
    contar(
      completados.flatMap((e) =>
        String(e.extra?.extras ?? "")
          .split(",")
          .filter(Boolean)
          .map((valor) => etiqueta(EXTRAS, valor))
      )
    )
  );

  const cambios = filasConteo(
    contar(
      [...completados, ...editados]
        .filter((e) => e.extra?.cambioArea === true)
        .map(
          (e) =>
            `${etiquetaFamilia(e.extra?.sectorAnterior)} → ${etiquetaFamilia(
              e.extra?.sector
            )}`
        )
    )
  );

  return {
    areas,
    etapas,
    extras,
    cambios,
    resumen: {
      completados: completados.length,
      editados: editados.length,
      desactivados: desactivados.length,
      cambios: cambios.reduce((s, f) => s + f.cantidad, 0),
    },
  };
};

// ============================================================
// PERFILES
// ============================================================

export const agruparPerfiles = (eventos) => {
  const mapa = new Map();
  let reales = 0;

  eventos.forEach((e) => {
    if (e.tipo === PERFIL_REAL) {
      reales += 1;
      return;
    }

    if (e.tipo !== PERFIL_SELECCIONADO && e.tipo !== PERFIL_ACTIVADO) return;

    const id = String(e.nombre ?? "sin-nombre");

    if (!mapa.has(id)) {
      mapa.set(id, {
        clave: id,
        nombre: etiqueta(PROFESIONES, id),
        familia: e.extra?.familia ? etiquetaFamilia(e.extra.familia) : "—",
        seleccionado: 0,
        activado: 0,
        total: 0,
      });
    }

    const fila = mapa.get(id);

    if (e.tipo === PERFIL_SELECCIONADO) fila.seleccionado += 1;
    else fila.activado += 1;

    fila.total += 1;
  });

  const profesiones = Array.from(mapa.values());

  return {
    profesiones,
    resumen: {
      reales,
      seleccionados: profesiones.reduce((s, f) => s + f.seleccionado, 0),
      activados: profesiones.reduce((s, f) => s + f.activado, 0),
    },
  };
};

// ============================================================
// USO
// ============================================================

export const agruparUso = (eventos) => {
  const editor = eventos.filter((e) => e.tipo === USO_EDITOR);
  const desplazar = eventos.filter((e) => e.tipo === USO_DESPLAZAR);
  const paginacion = eventos.filter((e) => e.tipo === USO_PAGINACION);

  const aElemento = paginacion.filter(
    (e) => e.extra?.paginacion === "elemento"
  ).length;

  const aBloque = paginacion.filter(
    (e) => e.extra?.paginacion === "bloque"
  ).length;

  const acciones = filasConteo([
    ["Editor abierto", editor.length],
    ["Desplazamiento cambiado", desplazar.length],
    ["Paginación → por elemento", aElemento],
    ["Paginación → por bloque", aBloque],
  ]);

  // Por plantilla
  const mapa = new Map();

  eventos.forEach((e) => {
    const nombre = String(e.nombre ?? "sin-nombre");
    const familia = e.extra?.familia ? String(e.extra.familia) : "";
    const clave = claveDe(nombre, familia);

    if (!mapa.has(clave)) {
      mapa.set(clave, {
        clave,
        nombre,
        familiaLabel: familia ? etiquetaFamilia(familia) : "—",
        editor: 0,
        desplazar: 0,
        paginacion: 0,
        total: 0,
      });
    }

    const fila = mapa.get(clave);

    if (e.tipo === USO_EDITOR) fila.editor += 1;
    else if (e.tipo === USO_DESPLAZAR) fila.desplazar += 1;
    else if (e.tipo === USO_PAGINACION) fila.paginacion += 1;
    else return;

    fila.total += 1;
  });

  return {
    acciones,
    porPlantilla: Array.from(mapa.values()),
    resumen: {
      editor: editor.length,
      desplazar: desplazar.length,
      paginacion: paginacion.length,
    },
  };
};
