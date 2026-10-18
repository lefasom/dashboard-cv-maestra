// src/secciones/Onboarding.jsx
import { useMemo } from "react";
import useColeccion from "../hooks/useColeccion";
import EstadoCarga from "../components/EstadoCarga";
import Resumen from "../components/Resumen";
import TablaDatos from "../components/TablaDatos";
import { agruparOnboarding } from "../datosApp";
import {
  COLUMNAS_AREAS,
  COLUMNAS_CAMBIOS,
  COLUMNAS_ETAPAS,
  COLUMNAS_EXTRAS,
} from "../columnas";
import { COLECCIONES } from "../config";

const ORDEN = { key: "cantidad", dir: "desc" };

export default function Onboarding() {
  const { eventos, cargando, error } = useColeccion(COLECCIONES.ONBOARDING);

  const datos = useMemo(() => agruparOnboarding(eventos), [eventos]);

  return (
    <>
      <EstadoCarga
        cargando={cargando}
        error={error}
        cantidad={eventos.length}
      />

      <Resumen
        tarjetas={[
          { label: "Completados", valor: datos.resumen.completados },
          { label: "Editados", valor: datos.resumen.editados },
          { label: "Desactivados", valor: datos.resumen.desactivados },
          { label: "Cambios de área", valor: datos.resumen.cambios },
        ]}
      />

      <div className="rejilla">
        <TablaDatos
          titulo="Áreas elegidas"
          filas={datos.areas}
          columnas={COLUMNAS_AREAS}
          claveStorage="dash-cv-master:cols-areas"
          altura="26vh"
          ordenInicial={ORDEN}
          menu={false}
          filtro={false}
        />

        <TablaDatos
          titulo="Extras más seleccionados"
          filas={datos.extras}
          columnas={COLUMNAS_EXTRAS}
          claveStorage="dash-cv-master:cols-extras"
          altura="26vh"
          ordenInicial={ORDEN}
          menu={false}
          filtro={false}
        />

        <TablaDatos
          titulo="Momento laboral"
          filas={datos.etapas}
          columnas={COLUMNAS_ETAPAS}
          claveStorage="dash-cv-master:cols-etapas"
          altura="26vh"
          ordenInicial={ORDEN}
          menu={false}
          filtro={false}
        />

        <TablaDatos
          titulo="Cambios de área"
          filas={datos.cambios}
          columnas={COLUMNAS_CAMBIOS}
          claveStorage="dash-cv-master:cols-cambios"
          altura="26vh"
          ordenInicial={ORDEN}
          menu={false}
          filtro={false}
        />
      </div>
    </>
  );
}
