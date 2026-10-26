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

// ============================================================
// USO (contadores agregados)
//
// La columna "orden" nunca se muestra (inicial: false y estas tablas no
// tienen menú de propiedades): solo sirve para que las filas salgan en el
// orden fijo de la lista (0.9x, 1.0x, 1.1x...) en lugar de ordenarse por
// nombre. Si una fila no trae pct (null) se muestra "—".
// ============================================================

const columnasUso = (labelNombre, labelPct = "%") => [
  { key: "nombre", label: labelNombre, align: "left", inicial: true, valor: (f) => f.nombre },
  { key: "cantidad", label: "Veces", align: "right", inicial: true, valor: (f) => f.cantidad },
  {
    key: "pct",
    label: labelPct,
    align: "right",
    inicial: true,
    valor: (f) => f.pct ?? -1,
    render: (f) => (f.pct == null ? "—" : `${(f.pct * 100).toFixed(1)}%`),
  },
  { key: "orden", label: "Orden", align: "right", inicial: false, valor: (f) => f.orden ?? 0 },
];

export const COLUMNAS_TAMANOS = columnasUso("Tamaño");
export const COLUMNAS_AJUSTES = columnasUso("Ajuste", "% de aperturas");
export const COLUMNAS_IDIOMAS = columnasUso("Idioma");