// src/datos.js — estadísticas de plantillas, familias y colección
import { CATALOGO, FAMILIAS, SIN_FAMILIA, TOTAL_COLECCION, etiquetaFamilia } from "./catalogo";
import { TIPO_PDF, TIPO_COLECCION, modoDe } from "./config";

// Se mantiene porque la usa agruparUso (pestaña Uso).
// Los ATS se llaman igual en todas las familias: se distinguen por familia.
export const claveDe = (nombre, familia) =>
  nombre === "ATS" ? `ATS|${familia || "?"}` : nombre;

// ------------------------------------------------------------
// Índices del catálogo
// ------------------------------------------------------------

const POR_ID = new Map(CATALOGO.map((c) => [String(c.id), c]));
const ATS_POR_FAMILIA = new Map(
  CATALOGO.filter((c) => c.esAts).map((c) => [c.familia, c])
);
// Los nombres que no son ATS son únicos
const POR_NOMBRE = new Map(
  CATALOGO.filter((c) => !c.esAts).map((c) => [c.nombre, c])
);

// Busca la plantilla del catálogo a la que pertenece un evento.
// 1) por plantillaId (único), verificando que el nombre coincida
// 2) eventos viejos sin plantillaId: por nombre (o por familia si es ATS)
const buscarEnCatalogo = (e, nombre) => {
  const porId = POR_ID.get(String(e.plantillaId ?? ""));

  if (porId && porId.nombre === nombre) return porId;

  if (nombre === "ATS") {
    for (const f of [e.extra?.familiaPlantilla, e.extra?.familia]) {
      const ats = ATS_POR_FAMILIA.get(f);
      if (ats) return ats;
    }
    return null;
  }

  return POR_NOMBRE.get(nombre) ?? null;
};

const nuevaFila = (base) => ({
  clave: base.clave,
  nombre: base.nombre,
  familia: base.familia || "",
  familiaLabel: base.familia ? etiquetaFamilia(base.familia) : "—",
  catalogo: base.catalogo, // "family" | "library"
  esAts: base.esAts,
  coleccion: 0, // veces que se agregó el diseño desde la biblioteca
  pdfFamilia: 0, // PDF desde el flujo de familia (incluye ATS)
  pdfFamiliaSinFam: 0, // de esos, los que llegaron con familia "sin_familia"
  pdfColeccion: 0, // PDF generados de diseños de la colección
  android: 0,
  ios: 0,
  prueba: 0,
  conExp: 0, // PDF con experiencia mejorada
  sinExp: 0, // PDF sin experiencia mejorada
  sinDato: 0, // PDF viejos, sin el dato
  ultima: null,
  msSuma: 0,
  msN: 0,
  selSuma: 0,
  selN: 0,
});

const numeroValido = (valor) =>
  typeof valor === "number" && Number.isFinite(valor) && valor >= 0;

// ------------------------------------------------------------
// Eventos -> una fila por plantilla (se agrupa por plantillaId)
// ------------------------------------------------------------

export const agruparPlantillas = (eventos) => {
  const mapa = new Map();

  // Todas las del catálogo aparecen aunque tengan 0
  CATALOGO.forEach((c) =>
    mapa.set(String(c.id), nuevaFila({ ...c, clave: String(c.id) }))
  );

  eventos.forEach((e) => {
    if (e.tipo !== TIPO_PDF && e.tipo !== TIPO_COLECCION) return;

    const nombre =
      String(e.nombre ?? "sin-nombre").trim() || "sin-nombre";

    const entrada = buscarEnCatalogo(e, nombre);

    let fila;

    if (entrada) {
      fila = mapa.get(String(entrada.id));
    } else {
      // Plantilla que no está en el catálogo del dashboard
      const clave = `ev|${nombre}|${e.plantillaId ?? ""}`;

      if (!mapa.has(clave)) {
        const f = e.extra?.familiaPlantilla || e.extra?.familia || "";

        mapa.set(
          clave,
          nuevaFila({
            clave,
            nombre,
            familia: f === SIN_FAMILIA ? "" : f,
            catalogo: modoDe(e) === "coleccion" ? "library" : "family",
            esAts: e.extra?.esAts === true || nombre === "ATS",
          })
        );
      }

      fila = mapa.get(clave);
    }

    // Agregado desde la biblioteca (no es un PDF)
    if (e.tipo === TIPO_COLECCION) {
      fila.coleccion += 1;
      return;
    }

    // --- PDF generado ---
    if (modoDe(e) === "coleccion") {
      fila.pdfColeccion += 1;
    } else {
      fila.pdfFamilia += 1;
      if (e.extra?.familia === SIN_FAMILIA) fila.pdfFamiliaSinFam += 1;
    }

    const exp = e.extra?.experienciaMejorada;
    if (exp === true) fila.conExp += 1;
    else if (exp === false) fila.sinExp += 1;
    else fila.sinDato += 1;

    if (e.plataforma === "android") fila.android += 1;
    if (e.plataforma === "ios") fila.ios += 1;
    if (e.extra?.perfilPrueba === true) fila.prueba += 1;

    const ms = e.createdAt?.toMillis?.();
    if (ms && (!fila.ultima || ms > fila.ultima)) fila.ultima = ms;

    if (numeroValido(e.extra?.duracionPdfMs)) {
      fila.msSuma += e.extra.duracionPdfMs;
      fila.msN += 1;
    }

    if (numeroValido(e.extra?.segDesdeSeleccion)) {
      fila.selSuma += e.extra.segDesdeSeleccion;
      fila.selN += 1;
    }
  });

  return Array.from(mapa.values());
};

// ------------------------------------------------------------
// Filas de plantillas -> una fila por familia profesional
//   pdfFamilia = PDF de diseños de la familia (sin ATS)
//   pdfAts     = PDF de la ATS de la familia
//   Los PDF que llegaron como "sin_familia" van a la fila "Sin familia"
//   (no se cuentan además en la familia real, para que todo sume igual).
// ------------------------------------------------------------

export const agruparFamilias = (filas) => {
  const mapa = new Map();

  const asegurar = (id) => {
    if (!mapa.has(id)) {
      mapa.set(id, {
        clave: id,
        nombre: etiquetaFamilia(id),
        pdfFamilia: 0,
        pdfAts: 0,
        ultima: null,
      });
    }

    return mapa.get(id);
  };

  // Todas las familias profesionales (sin la colección), y "Sin familia" al final
  Object.keys(FAMILIAS)
    .filter((id) => id !== "new_design" && id !== SIN_FAMILIA)
    .forEach(asegurar);

  asegurar(SIN_FAMILIA);

  filas.forEach((f) => {
    if (f.catalogo === "library") return;

    const conFamilia = f.pdfFamilia - f.pdfFamiliaSinFam;
    const real = asegurar(f.familia || SIN_FAMILIA);
    const sin = asegurar(SIN_FAMILIA);

    if (f.esAts) {
      real.pdfAts += conFamilia;
      sin.pdfAts += f.pdfFamiliaSinFam;
    } else {
      real.pdfFamilia += conFamilia;
      sin.pdfFamilia += f.pdfFamiliaSinFam;
    }

    if (f.ultima && (!real.ultima || f.ultima > real.ultima)) {
      real.ultima = f.ultima;
    }
  });

  return Array.from(mapa.values());
};

// Filas de plantillas -> solo los diseños de la colección
export const agruparColeccion = (filas) =>
  filas.filter((f) => f.catalogo === "library");

// Tarjetas de Estadísticas
export const calcularTotales = (filas) => ({
  // PDF de diseños de familia, sin ATS y sin colección
  pdfFamilia: filas.reduce(
    (s, f) => s + (!f.esAts && f.catalogo !== "library" ? f.pdfFamilia : 0),
    0
  ),
  // PDF de plantillas ATS, de cualquier origen
  pdfAts: filas.reduce(
    (s, f) => s + (f.esAts ? f.pdfFamilia + f.pdfColeccion : 0),
    0
  ),
  // PDF generados de diseños de la colección
  pdfColeccion: filas.reduce(
    (s, f) => s + (!f.esAts ? f.pdfColeccion : 0),
    0
  ),
  // Agregados desde la biblioteca (plantilla_biblioteca), sin PDF
  nuevosDisenos: filas.reduce((s, f) => s + f.coleccion, 0),
  // Cantidad de diseños de la colección (del catálogo, no de eventos)
  coleccion: TOTAL_COLECCION,
});