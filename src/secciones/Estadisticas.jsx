// src/secciones/Estadisticas.jsx
import { useMemo } from "react";
import useColeccion from "../hooks/useColeccion";
import EstadoCarga from "../components/EstadoCarga";
import Resumen from "../components/Resumen";
import TablaDatos from "../components/TablaDatos";
import {
  agruparPlantillas,
  agruparFamilias,
  calcularTotales,
} from "../datos";
import { COLUMNAS_PLANTILLAS, COLUMNAS_FAMILIAS } from "../columnas";
import { COLECCIONES } from "../config";

export default function Estadisticas() {
  const { eventos, cargando, error } = useColeccion(COLECCIONES.PLANTILLAS);

  const plantillas = useMemo(() => agruparPlantillas(eventos), [eventos]);
  const familias = useMemo(() => agruparFamilias(plantillas), [plantillas]);
  const totales = useMemo(() => calcularTotales(plantillas), [plantillas]);

  return (
    <>
      <EstadoCarga
        cargando={cargando}
        error={error}
        cantidad={eventos.length}
      />

      <Resumen
        tarjetas={[
          { label: "Colección", valor: totales.coleccion },
          { label: "Descargas familia", valor: totales.pdfFamilia },
          { label: "Descargas colección", valor: totales.pdfColeccion },
          { label: "Descargas ATS", valor: totales.pdfAts },
        ]}
      />

      <TablaDatos
        titulo="Plantillas"
        filas={plantillas}
        columnas={COLUMNAS_PLANTILLAS}
        claveStorage="dash-cv-master:cols-plantillas-v2"
        placeholder="Filtrar (ej. CV-57, Tecnología)"
        altura="36vh"
        ordenInicial={{ key: "total", dir: "desc" }}
      />

      <TablaDatos
        titulo="Familias"
        filas={familias}
        columnas={COLUMNAS_FAMILIAS}
        claveStorage="dash-cv-master:cols-familias-v2"
        placeholder="Filtrar familia"
        altura="24vh"
        ordenInicial={{ key: "pdfFamilia", dir: "desc" }}
      />
    </>
  );
}