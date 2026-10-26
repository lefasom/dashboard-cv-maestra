// src/hooks/useUsoContadores.js
// Escucha dashboard_config/uso_contadores (un solo documento) y se actualiza
// solo. Devuelve { datos, cargando, error, actualizadoEn }.
// datos = null si el documento todavía no existe.

import { useEffect, useState } from "react";

import { suscribirUso } from "../servicios/uso";

export default function useUsoContadores() {
  const [estado, setEstado] = useState({
    datos: null,
    cargando: true,
    error: null,
    actualizadoEn: null,
  });

  useEffect(() => {
    const dejarDeEscuchar = suscribirUso(
      (datos) => {
        console.info(
          "[uso] uso_contadores:",
          datos ? "existe" : "todavía no existe"
        );

        setEstado({
          datos,
          cargando: false,
          error: null,
          actualizadoEn: Date.now(),
        });
      },
      (err) => {
        console.error("[uso] No se pudo leer:", err);

        setEstado((e) => ({
          ...e,
          cargando: false,
          error:
            err?.code === "permission-denied"
              ? "Sin permiso para leer. Publicá las reglas e iniciá sesión."
              : "No se pudo leer el uso.",
        }));
      }
    );

    return dejarDeEscuchar;
  }, []);

  return estado;
}