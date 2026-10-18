// src/hooks/useColumnas.js
import { useEffect, useState } from "react";

export default function useColumnas(clave, columnas) {
  const iniciales = () =>
    Object.fromEntries(columnas.map((c) => [c.key, c.inicial]));

  const [activas, setActivas] = useState(() => {
    try {
      const guardado = JSON.parse(localStorage.getItem(clave) || "null");
      if (guardado && typeof guardado === "object") {
        return { ...iniciales(), ...guardado };
      }
    } catch {
      // usa las iniciales
    }
    return iniciales();
  });

  useEffect(() => {
    try {
      localStorage.setItem(clave, JSON.stringify(activas));
    } catch {
      // sin almacenamiento: no pasa nada
    }
  }, [clave, activas]);

  const cambiar = (key, valor) =>
    setActivas((previas) => ({ ...previas, [key]: valor }));

  const restablecer = () => setActivas(iniciales());

  return { activas, cambiar, restablecer };
}
