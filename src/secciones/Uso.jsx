// src/secciones/Uso.jsx
import { useMemo } from "react";
import useColeccion from "../hooks/useColeccion";
import EstadoCarga from "../components/EstadoCarga";
import Resumen from "../components/Resumen";
import TablaDatos from "../components/TablaDatos";
import { agruparUso } from "../datosApp";
import { COLUMNAS_ACCIONES, COLUMNAS_USO_PLANTILLA } from "../columnas";
import { COLECCIONES } from "../config";

export default function Uso() {
  const { eventos, cargando, error } = useColeccion(COLECCIONES.USO);

  const uso = useMemo(() => agruparUso(eventos), [eventos]);

  return (
    <>
      <EstadoCarga
        cargando={cargando}
        error={error}
        cantidad={eventos.length}
      />

      <Resumen
        tarjetas={[
          { label: "Editor abierto", valor: uso.resumen.editor },
          { label: "Desplazamientos", valor: uso.resumen.desplazar },
          { label: "Cambios de paginación", valor: uso.resumen.paginacion },
        ]}
      />

      <TablaDatos
        titulo="Acciones"
        filas={uso.acciones}
        columnas={COLUMNAS_ACCIONES}
        claveStorage="dash-cv-master:cols-acciones"
        altura="22vh"
        ordenInicial={{ key: "cantidad", dir: "desc" }}
        menu={false}
        filtro={false}
      />

      <TablaDatos
        titulo="Uso por plantilla"
        filas={uso.porPlantilla}
        columnas={COLUMNAS_USO_PLANTILLA}
        claveStorage="dash-cv-master:cols-uso-plantilla"
        placeholder="Filtrar plantilla"
        altura="34vh"
        ordenInicial={{ key: "total", dir: "desc" }}
      />
    </>
  );
}
