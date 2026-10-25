// src/secciones/Estadisticas.jsx
import { useMemo } from "react";
import useColeccion from "../hooks/useColeccion";
import EstadoCarga from "../components/EstadoCarga";
import Resumen from "../components/Resumen";
import TablaDatos from "../components/TablaDatos";
import {
  agruparPlantillas,
  agruparFamilias,
  agruparColeccion,
  calcularTotales,
} from "../datos";
import {
  COLUMNAS_PLANTILLAS,
  COLUMNAS_FAMILIAS,
  COLUMNAS_COLECCION,
} from "../columnas";
import { COLECCIONES } from "../config";

export default function Estadisticas() {
  const { eventos, cargando, error } = useColeccion(COLECCIONES.PLANTILLAS);

  // Una fila por plantilla (familia + colección)
  const filas = useMemo(() => agruparPlantillas(eventos), [eventos]);

  // Tabla Plantillas: solo las de familia (la colección tiene su tabla)
  const plantillas = useMemo(
    () => filas.filter((f) => f.catalogo !== "library"),
    [filas]
  );
  const familias = useMemo(() => agruparFamilias(filas), [filas]);
  const coleccion = useMemo(() => agruparColeccion(filas), [filas]);
  const totales = useMemo(() => calcularTotales(filas), [filas]);

  return (
    <>
      <EstadoCarga
        cargando={cargando}
        error={error}
        cantidad={eventos.length}
      />

      <Resumen
        tarjetas={[
          { label: "Descargas familia", valor: totales.pdfFamilia },
          { label: "Descargas ATS", valor: totales.pdfAts },
          { label: "Descargas colección", valor: totales.pdfColeccion },
          { label: "Nuevos diseños", valor: totales.nuevosDisenos },
        ]}
      />

      {/* 1) Familias */}
      <TablaDatos
        titulo="Familias"
        filas={familias}
        columnas={COLUMNAS_FAMILIAS}
        claveStorage="dash-cv-master:cols-familias-v3"
        placeholder="Filtrar familia"
        altura="34vh"
        ordenInicial={{ key: "pdfFamilia", dir: "desc" }}
      />

      {/* 2) Plantillas (solo familia) */}
      <TablaDatos
        titulo="Plantillas"
        filas={plantillas}
        columnas={COLUMNAS_PLANTILLAS}
        claveStorage="dash-cv-master:cols-plantillas-v4"
        placeholder="Filtrar (ej. CV-06, Tecnología)"
        altura="36vh"
        ordenInicial={{ key: "descargas", dir: "desc" }}
      />

      {/* 3) Colección: nombre, nuevos diseños (agregados) y PDF generados */}
      <TablaDatos
        titulo="Colección"
        filas={coleccion}
        columnas={COLUMNAS_COLECCION}
        claveStorage="dash-cv-master:cols-coleccion-v3"
        placeholder="Filtrar (ej. CV-57)"
        altura="34vh"
        ordenInicial={{ key: "coleccion", dir: "desc" }}
      />
    </>
  );
}