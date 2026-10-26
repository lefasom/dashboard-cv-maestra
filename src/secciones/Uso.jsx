// src/secciones/Uso.jsx
//
// Métricas de uso de la app. Todo sale de UN solo documento
// (dashboard_config/uso_contadores), que se escucha en vivo mientras esta
// pestaña está abierta: se actualiza solo cuando la app envía contadores.
// Si el documento no existe, todo en 0 (y se avisa).
import { useMemo } from "react";

import EstadoCarga from "../components/EstadoCarga";
import Resumen from "../components/Resumen";
import TablaDatos from "../components/TablaDatos";
import {
  COLUMNAS_AJUSTES,
  COLUMNAS_IDIOMAS,
  COLUMNAS_TAMANOS,
} from "../columnas";
import { agruparUsoContadores } from "../datosApp";
import useUsoContadores from "../hooks/useUsoContadores";

const TITULO = { margin: "4px 0 10px", fontSize: 16, fontWeight: 800 };

const ORDEN_FIJO = { key: "orden", dir: "asc" };

const horaDe = (ms) => (ms ? new Date(ms).toLocaleTimeString() : "");

export default function Uso() {
  const { datos, cargando, error, actualizadoEn } = useUsoContadores();

  const uso = useMemo(() => agruparUsoContadores(datos), [datos]);

  return (
    <>
      <EstadoCarga cargando={cargando} error={error} cantidad={0} />

      {actualizadoEn && (
        <p className="resena-fecha" style={{ margin: "0 0 12px", textAlign: "right" }}>
          Se actualiza solo · último cambio a las {horaDe(actualizadoEn)}
        </p>
      )}

      {!datos && !cargando && !error && (
        <p className="aviso">
          El documento dashboard_config/uso_contadores todavía no existe: la
          app no envió nada todavía (o Firestore rechazó el envío porque las
          reglas no están publicadas). Se muestra todo en 0.
        </p>
      )}

      <h3 style={TITULO}>Uso</h3>
      <Resumen tarjetas={uso.uso} />

      <h3 style={TITULO}>Modo edición — botones</h3>
      <Resumen tarjetas={uso.editor} />

      <div className="rejilla">
        <div>
          <TablaDatos
            titulo="Tamaños"
            filas={uso.tamanos}
            columnas={COLUMNAS_TAMANOS}
            claveStorage="dash-cv-master:cols-uso-tamanos"
            altura="30vh"
            ordenInicial={ORDEN_FIJO}
            menu={false}
            filtro={false}
          />

          <p className="resena-fecha" style={{ margin: "-8px 4px 16px" }}>
            Tamaño que quedó seleccionado al salir del modo edición. 1.0x
            incluye a quienes nunca tocaron Tamaño (es el valor por defecto).
          </p>
        </div>

        <TablaDatos
          titulo="Idiomas"
          filas={uso.idiomas}
          columnas={COLUMNAS_IDIOMAS}
          claveStorage="dash-cv-master:cols-uso-idiomas"
          altura="30vh"
          ordenInicial={ORDEN_FIJO}
          menu={false}
          filtro={false}
        />
      </div>

      <TablaDatos
        titulo="Ajustes"
        filas={uso.ajustes}
        columnas={COLUMNAS_AJUSTES}
        claveStorage="dash-cv-master:cols-uso-ajustes"
        altura="40vh"
        ordenInicial={ORDEN_FIJO}
        menu={false}
        filtro={false}
      />
    </>
  );
}