// src/secciones/Perfiles.jsx
import { useMemo } from "react";
import useColeccion from "../hooks/useColeccion";
import EstadoCarga from "../components/EstadoCarga";
import Resumen from "../components/Resumen";
import TablaDatos from "../components/TablaDatos";
import { agruparPerfiles } from "../datosApp";
import { COLUMNAS_PROFESIONES } from "../columnas";
import { COLECCIONES } from "../config";

export default function Perfiles() {
  const { eventos, cargando, error } = useColeccion(COLECCIONES.PERFILES);

  const datos = useMemo(() => agruparPerfiles(eventos), [eventos]);

  return (
    <>
      <EstadoCarga
        cargando={cargando}
        error={error}
        cantidad={eventos.length}
      />

      <Resumen
        tarjetas={[
          { label: "Perfiles reales creados", valor: datos.resumen.reales },
          { label: "Pruebas seleccionadas", valor: datos.resumen.seleccionados },
          { label: "Pruebas activadas", valor: datos.resumen.activados },
        ]}
      />

      <TablaDatos
        titulo="Profesiones de prueba más usadas"
        filas={datos.profesiones}
        columnas={COLUMNAS_PROFESIONES}
        claveStorage="dash-cv-master:cols-profesiones"
        placeholder="Filtrar profesión"
        altura="45vh"
        ordenInicial={{ key: "total", dir: "desc" }}
      />
    </>
  );
}
