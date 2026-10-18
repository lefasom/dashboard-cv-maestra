// src/columnas.js
// valor  -> se usa para ordenar (y para mostrar si no hay render)
// render -> texto mostrado en la celda (opcional)

const fecha = (ms) => (ms ? new Date(ms).toLocaleString() : "—");

const promedio = (suma, n, divisor = 1) =>
  n ? suma / n / divisor : 0;

const texto = (n) => (n ? n.toFixed(1) : "—");

// ============================================================
// ESTADÍSTICAS
// ============================================================

export const COLUMNAS_PLANTILLAS = [
  { key: "nombre", label: "Nombre", align: "left", inicial: true, valor: (f) => f.nombre },
  { key: "familia", label: "Familia", align: "left", inicial: true, valor: (f) => f.familiaLabel },
  { key: "coleccion", label: "Colección", align: "right", inicial: true, valor: (f) => f.coleccion },
  { key: "pdfFamilia", label: "PDF familia", align: "right", inicial: true, valor: (f) => f.pdfFamilia },
  { key: "pdfColeccion", label: "PDF colección", align: "right", inicial: true, valor: (f) => f.pdfColeccion },
  { key: "total", label: "Total PDF", align: "right", inicial: true, valor: (f) => f.pdfFamilia + f.pdfColeccion },
  { key: "ultima", label: "Última descarga", align: "left", inicial: false, valor: (f) => f.ultima ?? 0, render: (f) => fecha(f.ultima) },
  { key: "android", label: "Android", align: "right", inicial: false, valor: (f) => f.android },
  { key: "ios", label: "iOS", align: "right", inicial: false, valor: (f) => f.ios },
  { key: "prueba", label: "Perfil prueba", align: "right", inicial: false, valor: (f) => f.prueba },
  {
    key: "pdfSeg",
    label: "Tiempo PDF (s)",
    align: "right",
    inicial: false,
    valor: (f) => promedio(f.msSuma, f.msN, 1000),
    render: (f) => texto(promedio(f.msSuma, f.msN, 1000)),
  },
  {
    key: "selSeg",
    label: "Seg. hasta descargar",
    align: "right",
    inicial: false,
    valor: (f) => promedio(f.selSuma, f.selN),
    render: (f) => texto(promedio(f.selSuma, f.selN)),
  },
];

export const COLUMNAS_FAMILIAS = [
  { key: "nombre", label: "Familia", align: "left", inicial: true, valor: (f) => f.nombre },
  { key: "plantillas", label: "Plantillas", align: "right", inicial: true, valor: (f) => f.plantillas },
  { key: "coleccion", label: "Colección", align: "right", inicial: true, valor: (f) => f.coleccion },
  { key: "pdfFamilia", label: "PDF familia", align: "right", inicial: true, valor: (f) => f.pdfFamilia },
  { key: "pdfColeccion", label: "PDF colección", align: "right", inicial: true, valor: (f) => f.pdfColeccion },
  { key: "pdfAts", label: "PDF ATS", align: "right", inicial: true, valor: (f) => f.pdfAts },
  { key: "total", label: "Total PDF", align: "right", inicial: false, valor: (f) => f.pdfFamilia + f.pdfColeccion },
  { key: "ultima", label: "Última descarga", align: "left", inicial: false, valor: (f) => f.ultima ?? 0, render: (f) => fecha(f.ultima) },
];

// ============================================================
// TABLAS DE CONTEO (onboarding)
// ============================================================

const columnasConteo = (labelNombre) => [
  { key: "nombre", label: labelNombre, align: "left", inicial: true, valor: (f) => f.nombre },
  { key: "cantidad", label: "Cantidad", align: "right", inicial: true, valor: (f) => f.cantidad },
  {
    key: "pct",
    label: "%",
    align: "right",
    inicial: true,
    valor: (f) => f.pct,
    render: (f) => `${(f.pct * 100).toFixed(1)}%`,
  },
];

export const COLUMNAS_AREAS = columnasConteo("Área");
export const COLUMNAS_ETAPAS = columnasConteo("Momento laboral");
export const COLUMNAS_EXTRAS = columnasConteo("Extra");
export const COLUMNAS_CAMBIOS = columnasConteo("Cambio de área");
export const COLUMNAS_ACCIONES = columnasConteo("Acción");

// ============================================================
// PERFILES
// ============================================================

export const COLUMNAS_PROFESIONES = [
  { key: "nombre", label: "Profesión", align: "left", inicial: true, valor: (f) => f.nombre },
  { key: "familia", label: "Familia", align: "left", inicial: true, valor: (f) => f.familia },
  { key: "seleccionado", label: "Seleccionado", align: "right", inicial: true, valor: (f) => f.seleccionado },
  { key: "activado", label: "Activado", align: "right", inicial: true, valor: (f) => f.activado },
  { key: "total", label: "Total", align: "right", inicial: true, valor: (f) => f.total },
];

// ============================================================
// USO
// ============================================================

export const COLUMNAS_USO_PLANTILLA = [
  { key: "nombre", label: "Plantilla", align: "left", inicial: true, valor: (f) => f.nombre },
  { key: "familia", label: "Familia", align: "left", inicial: true, valor: (f) => f.familiaLabel },
  { key: "editor", label: "Editor", align: "right", inicial: true, valor: (f) => f.editor },
  { key: "desplazar", label: "Desplazar", align: "right", inicial: true, valor: (f) => f.desplazar },
  { key: "paginacion", label: "Paginación", align: "right", inicial: true, valor: (f) => f.paginacion },
  { key: "total", label: "Total", align: "right", inicial: false, valor: (f) => f.total },
];