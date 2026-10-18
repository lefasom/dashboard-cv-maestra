// src/datos.js  — estadísticas de plantillas y familias
import { CATALOGO, etiquetaFamilia } from "./catalogo";
import { TIPO_PDF, TIPO_COLECCION, modoDe } from "./config";

// Los ATS se llaman igual en todas las familias: se distinguen por familia.
export const claveDe = (nombre, familia) =>
  nombre === "ATS" ? `ATS|${familia || "?"}` : nombre;

const nuevaFila = (nombre, familia) => ({
  clave: claveDe(nombre, familia),
  nombre,
  familia: familia || "",
  familiaLabel: familia ? etiquetaFamilia(familia) : "—",
  esAts: nombre === "ATS",
  coleccion: 0,
  pdfFamilia: 0,
  pdfColeccion: 0,
  android: 0,
  ios: 0,
  prueba: 0,
  ultima: null,
  msSuma: 0,
  msN: 0,
  selSuma: 0,
  selN: 0,
});

const numeroValido = (valor) =>
  typeof valor === "number" && Number.isFinite(valor) && valor >= 0;

// Eventos -> una fila por plantilla
export const agruparPlantillas = (eventos) => {
  const mapa = new Map();

  const asegurar = (nombre, familia) => {
    const clave = claveDe(nombre, familia);

    if (!mapa.has(clave)) mapa.set(clave, nuevaFila(nombre, familia));

    return mapa.get(clave);
  };

  CATALOGO.forEach(({ nombre, familia }) => asegurar(nombre, familia));

  eventos.forEach((e) => {
    const nombre =
      String(e.nombre ?? "sin-nombre").trim() || "sin-nombre";
    const familia = e.extra?.familia ? String(e.extra.familia) : "";

    const fila = asegurar(nombre, familia);

    if (!fila.familia && familia) {
      fila.familia = familia;
      fila.familiaLabel = etiquetaFamilia(familia);
    }

    if (e.tipo === TIPO_COLECCION) {
      fila.coleccion += 1;
      return;
    }

    if (e.tipo !== TIPO_PDF) return;

    if (modoDe(e) === "coleccion") fila.pdfColeccion += 1;
    else fila.pdfFamilia += 1;

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

// Filas de plantillas -> una fila por familia
export const agruparFamilias = (filas) => {
  const mapa = new Map();

  filas.forEach((f) => {
    const id = f.familia || "";

    if (!mapa.has(id)) {
      mapa.set(id, {
        clave: id || "sin-familia",
        nombre: etiquetaFamilia(id),
        plantillas: 0,
        coleccion: 0,
        pdfFamilia: 0,
        pdfColeccion: 0,
        pdfAts: 0,
        ultima: null,
      });
    }

    const fam = mapa.get(id);

    if (!f.esAts) fam.plantillas += 1;

    fam.coleccion += f.coleccion;
    fam.pdfFamilia += f.pdfFamilia;
    fam.pdfColeccion += f.pdfColeccion;

    if (f.esAts) fam.pdfAts += f.pdfFamilia + f.pdfColeccion;

    if (f.ultima && (!fam.ultima || f.ultima > fam.ultima)) {
      fam.ultima = f.ultima;
    }
  });

  return Array.from(mapa.values());
};

export const calcularTotales = (filas) => ({
  coleccion: filas.reduce((s, f) => s + f.coleccion, 0),
  pdfFamilia: filas.reduce((s, f) => s + f.pdfFamilia, 0),
  pdfColeccion: filas.reduce((s, f) => s + f.pdfColeccion, 0),
  pdfAts: filas.reduce(
    (s, f) => s + (f.esAts ? f.pdfFamilia + f.pdfColeccion : 0),
    0
  ),
});