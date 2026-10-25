// src/secciones/Onboarding.jsx
import { useMemo } from "react";
import useColeccion from "../hooks/useColeccion";
import EstadoCarga from "../components/EstadoCarga";
import Resumen from "../components/Resumen";
import TablaDatos from "../components/TablaDatos";
import { agruparOnboarding } from "../datosApp";
import {
  COLUMNAS_AREAS,
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
          { label: "Uso del Admin", valor: datos.admin.abrir },
          { label: "Cambio de área", valor: datos.admin.area },
          { label: "Cambio de momento laboral", valor: datos.admin.momento },
          { label: "Cambio de extras", valor: datos.admin.extras },
        ]}
      />

      {/* Las tablas muestran lo elegido al activar la experiencia mejorada */}
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

        {/* La tercera ocupa todo el ancho para no dejar un hueco */}
        <div className="ancho-completo">
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
        </div>
      </div>
    </>
  );
}