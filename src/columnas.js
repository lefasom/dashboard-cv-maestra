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

// Plantillas de familia (la colección tiene su propia tabla).
// "Descargas" = PDF generados de esa plantilla. Antes había dos columnas
// (PDF familia y Total PDF) con el mismo valor, porque la colección ya no
// está en esta tabla.
export const COLUMNAS_PLANTILLAS = [
  { key: "nombre", label: "Nombre", align: "left", inicial: true, valor: (f) => f.nombre },
  { key: "familia", label: "Familia", align: "left", inicial: true, valor: (f) => f.familiaLabel },
  { key: "descargas", label: "Descargas", align: "right", inicial: true, valor: (f) => f.pdfFamilia + f.pdfColeccion },
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
  { key: "conExp", label: "Con exp. mejorada", align: "right", inicial: false, valor: (f) => f.conExp },
  { key: "sinExp", label: "Sin exp. mejorada", align: "right", inicial: false, valor: (f) => f.sinExp },
  { key: "sinDato", label: "Sin dato", align: "right", inicial: false, valor: (f) => f.sinDato },
];

export const COLUMNAS_FAMILIAS = [
  { key: "nombre", label: "Familia", align: "left", inicial: true, valor: (f) => f.nombre },
  { key: "pdfFamilia", label: "PDF familia", align: "right", inicial: true, valor: (f) => f.pdfFamilia },
  { key: "pdfAts", label: "PDF ATS", align: "right", inicial: true, valor: (f) => f.pdfAts },
  { key: "total", label: "Total PDF", align: "right", inicial: false, valor: (f) => f.pdfFamilia + f.pdfAts },
  { key: "ultima", label: "Última descarga", align: "left", inicial: false, valor: (f) => f.ultima ?? 0, render: (f) => fecha(f.ultima) },
];

// Solo los diseños de la colección
export const COLUMNAS_COLECCION = [
  { key: "nombre", label: "Plantilla", align: "left", inicial: true, valor: (f) => f.nombre },
  { key: "coleccion", label: "Nuevos diseños", align: "right", inicial: true, valor: (f) => f.coleccion },
  { key: "pdfColeccion", label: "PDF", align: "right", inicial: true, valor: (f) => f.pdfColeccion },
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
export const COLUMNAS_ACCIONES = columnasConteo("Acción"); // la usa Uso

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