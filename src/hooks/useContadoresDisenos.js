// src/hooks/useContadoresDisenos.js  (Vite + React — Dashboard CV Master)
//
// Lee en tiempo real el documento de contadores de me gusta / no me gusta
// (dashboard_config/diseno_contadores): UNA sola lectura, sin importar
// cuántos votos haya.
//
// Devuelve:
//   filas     { "CV-06": { likes: 4, dislikes: 1 }, ... }
//   cargando  true hasta que llega la primera respuesta
//   error     texto o null

import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useState } from "react";

import { COLECCIONES, DOC_CONTADORES_DISENOS } from "../config";
import { db } from "../firebase";

export default function useContadoresDisenos() {
  const [estado, setEstado] = useState({
    filas: {},
    cargando: true,
    error: null,
  });

  useEffect(() => {
    const ref = doc(db, COLECCIONES.CONFIG, DOC_CONTADORES_DISENOS);

    return onSnapshot(
      ref,
      (snapshot) => {
        const datos = snapshot.exists() ? snapshot.data() : {};
        const filas = {};

        const volcar = (mapa, campo) => {
          Object.entries(mapa ?? {}).forEach(([nombre, valor]) => {
            const numero = Math.max(0, Number(valor) || 0);
            if (!filas[nombre]) filas[nombre] = { likes: 0, dislikes: 0 };
            filas[nombre][campo] = numero;
          });
        };

        volcar(datos.likes, "likes");
        volcar(datos.dislikes, "dislikes");

        setEstado({ filas, cargando: false, error: null });
      },
      (err) => {
        console.error("[contadores diseños] Error leyendo Firestore:", err);

        setEstado({
          filas: {},
          cargando: false,
          error:
            err?.code === "permission-denied"
              ? "No tenés permiso para ver las valoraciones. Iniciá sesión y publicá las reglas."
              : "No se pudieron cargar las valoraciones.",
        });
      }
    );
  }, []);

  return estado;
}
